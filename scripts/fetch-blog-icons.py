#!/usr/bin/env python3
"""
블로그 목록에 붙일 회사 아이콘을 받아 public/blog-icons/<blogKey>.png 로 굳힌다.

왜 화면에서 남의 사이트 favicon.ico를 바로 부르지 않는가: 2026-09-25 기준 25곳 중
- toss.tech·인프랩은 /favicon.ico 에 이미지 대신 HTML을 준다 (아이콘을 <link>로만 알린다)
- 데이블·하이퍼커넥트·스포카는 404다 (아이콘이 다른 경로에 있다)
- Medium에 올린 10곳은 전부 같은 Medium 로고가 나온다 (회사를 구분할 수 없다)
그래서 홈페이지 HTML이 선언한 아이콘을 찾아 받고, 한 번 받은 것을 저장소에 둔다.

Medium 발행처 로고는 Medium이 봇을 막아(403) 받을 수 없다. 그 블로그들은 회사 본 사이트의
아이콘을 대신 쓴다 — SITE_OVERRIDES. 본 사이트마저 HTML을 막는 곳은 아이콘 주소를 직접 적는다 —
ICON_OVERRIDES.

실행:  python3 scripts/fetch-blog-icons.py          (아이콘이 없는 블로그만)
       python3 scripts/fetch-blog-icons.py --force  (전부 다시)
준비:  .env.local 의 COLLECTOR_BASE_URL, COLLECTOR_ADMIN_TOKEN (블로그 목록을 collector에서 읽는다)
       + 환경변수 DEVICE_SESSION — collector 가 어드민 토큰에 기기 세션을 함께 요구한다.
         go-runner 의 "어드민 열기"로 어드민을 연 뒤 브라우저 개발자 도구의 device_session 쿠키 값을 넣는다.
결과:  public/blog-icons/<blogKey>.png  — 블로그를 추가하면 다시 돌려 커밋한다
"""

import io
import os
import re
import sys
from html import unescape
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public/blog-icons"

# 화면에서는 20px로 그린다. 레티나에서 흐리지 않게 두 배 넘게 굽는다.
ICON_SIZE = 64
REQUEST_TIMEOUT_SECONDS = 10
# 기본 User-Agent(python-requests)는 여러 곳이 봇으로 보고 막는다.
BROWSER_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36"

# Medium에 올린 블로그 → 회사 본 사이트. 새 Medium 블로그를 추가하면 여기에도 적는다.
SITE_OVERRIDES = {
    "medium-com-29cm": "https://www.29cm.co.kr",
    "medium-com-daangn": "https://www.daangn.com",
    "medium-com-musinsa-tech": "https://www.musinsa.com",
    "medium-com-yanolja": "https://www.yanolja.com",
    "medium-com-watcha": "https://watcha.com",
    "medium-com-wantedjobs": "https://www.wanted.co.kr",
    "medium-com-zigbang": "https://www.zigbang.com",
    "medium-com-coupang-engineering": "https://www.coupang.com",
    "techblog-gccompany-co-kr": "https://www.gccompany.co.kr",
    "techblog-yogiyo-co-kr": "https://www.yogiyo.co.kr",
    # 블로그는 SVG 아이콘만 선언한다 (Pillow가 못 읽는다).
    "hyperconnect-github-io": "https://hyperconnect.com",
    # 2026-09-26 더한 블로그. Medium·feedburner·티스토리는 호스팅 쪽 로고가 나와 회사 사이트에서 받는다.
    "medium-com-catchtable": "https://www.catchtable.co.kr",
    "medium-com-tving-team": "https://www.tving.com",
    "medium-com-ssgtech": "https://www.ssg.com",
    "feeds-feedburner-com-googledeveloperskorea": "https://developers.google.com",
    "aws-amazon-com-tech": "https://aws.amazon.com",
    "kakaoentertainment-tech-tistory-com": "https://www.kakaoent.com",
    # 기술 블로그가 Medium 사용자 도메인이라 Medium 로고가 나온다.
    "tech-remember-co-kr": "https://rememberapp.co.kr",
    "blog-myrealtrip-com": "https://www.myrealtrip.com",
    "blog-bespinglobal-com": "https://www.bespinglobal.com",
    "tech-channel-io": "https://channel.io",
    # 블로그 이름이 'NHN Cloud Meetup' 이라 아이콘이 M 이다. 회사 아이콘(N)을 쓴다.
    "meetup-nhncloud-com": "https://www.nhn.com",
}

# 본 사이트가 봇 차단으로 HTML을 403으로 막아 아이콘 선언을 읽을 수 없는 곳 (아이콘 파일은 열려 있다).
ICON_OVERRIDES = {
    "medium-com-29cm": "https://asset.29cm.co.kr/icon/apple-icon-144x144.png",
    "medium-com-musinsa-tech": "https://image.msscdn.net/static/assets/bi/favicon/favicon-192x192.png",
    # 쿠팡은 HTML이 막혔다 풀렸다 한다.
    "medium-com-coupang-engineering": "https://image7.coupangcdn.com/image/coupang/favicon/favicon.ico",
    # 기술 블로그는 보안 규칙이 스크립트 요청을 막고 아이콘도 16px 하나뿐이다. 회사 CDN 의 큰 아이콘을 쓴다.
    "techblog-woowahan-com": "https://woowahan-cdn.woowahan.com/favicon/ko/android-chrome-192x192.png",
}

ICON_LINK = re.compile(r"<link\b[^>]*>", re.I)
ATTRIBUTE = re.compile(r'([\w-]+)\s*=\s*["\']([^"\']*)["\']')


def read_env() -> dict[str, str]:
    env_file = ROOT / ".env.local"
    if not env_file.exists():
        sys.exit(".env.local 이 없습니다. COLLECTOR_BASE_URL, COLLECTOR_ADMIN_TOKEN 이 필요합니다.")
    pairs = (line.split("=", 1) for line in env_file.read_text().splitlines() if "=" in line and not line.startswith("#"))
    return {key.strip(): value.strip() for key, value in pairs}


def list_feeds(session: requests.Session) -> list[dict]:
    env = read_env()
    device_session = os.environ.get("DEVICE_SESSION")
    if not device_session:
        sys.exit("DEVICE_SESSION 이 없습니다. go-runner 로 어드민을 연 뒤 device_session 쿠키 값을 넣으세요.")
    response = session.get(
        f"{env['COLLECTOR_BASE_URL'].rstrip('/')}/api/feeds",
        headers={"X-Collector-Token": env["COLLECTOR_ADMIN_TOKEN"], "X-Device-Session": device_session},
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()


def declared_icons(html: str, page_url: str) -> list[str]:
    """HTML이 선언한 아이콘을 큰 것부터. SVG는 Pillow가 못 읽어 뺀다."""
    candidates: list[tuple[int, str]] = []
    for tag in ICON_LINK.findall(html):
        attributes = {name.lower(): unescape(value) for name, value in ATTRIBUTE.findall(tag)}
        if "icon" not in attributes.get("rel", "").lower() or not attributes.get("href"):
            continue
        if attributes.get("type") == "image/svg+xml" or attributes["href"].split("?")[0].endswith(".svg"):
            continue
        size = max((int(side) for side in re.findall(r"(\d+)x\d+", attributes.get("sizes", ""))), default=0)
        candidates.append((size, urljoin(page_url, attributes["href"])))
    return [url for _, url in sorted(candidates, key=lambda candidate: -candidate[0])]


def to_png(content: bytes) -> bytes | None:
    """받은 바이트가 이미지가 아니면(HTML 404 페이지 등) None."""
    try:
        image = Image.open(io.BytesIO(content))
        # ico는 여러 크기를 품는다 — 가장 큰 것을 골라 줄여야 흐리지 않다.
        if image.format == "ICO":
            image.size = max(image.info.get("sizes", {image.size}))
        image = image.convert("RGBA")
    except Exception:
        return None
    # 줄이기만 하면 16px짜리 favicon이 칸 가운데 점으로 남는다. 작아도 칸에 맞춰 키운다.
    scale = ICON_SIZE / max(image.size)
    image = image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.LANCZOS)
    canvas = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    canvas.paste(image, ((ICON_SIZE - image.width) // 2, (ICON_SIZE - image.height) // 2))
    output = io.BytesIO()
    canvas.save(output, format="PNG", optimize=True)
    return output.getvalue()


def download_icon(session: requests.Session, icon_url: str) -> bytes | None:
    try:
        response = session.get(icon_url, timeout=REQUEST_TIMEOUT_SECONDS)
    except requests.RequestException:
        return None
    return to_png(response.content) if response.ok else None


def fetch_icon(session: requests.Session, site_url: str) -> tuple[bytes, str] | None:
    try:
        page = session.get(site_url, timeout=REQUEST_TIMEOUT_SECONDS)
        page_url, html = page.url, page.text
    except requests.RequestException:
        page_url, html = site_url, ""

    origin = f"{urlparse(page_url).scheme}://{urlparse(page_url).netloc}"
    for icon_url in [*declared_icons(html, page_url), f"{origin}/favicon.ico"]:
        if png := download_icon(session, icon_url):
            return png, icon_url
    return None


def main() -> None:
    force = "--force" in sys.argv
    session = requests.Session()
    session.headers["User-Agent"] = BROWSER_USER_AGENT
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    missing: list[str] = []
    for feed in list_feeds(session):
        blog_key = feed["blogKey"]
        target = OUTPUT_DIR / f"{blog_key}.png"
        if target.exists() and not force:
            continue

        site_url = SITE_OVERRIDES.get(blog_key, feed["homepageUrl"])
        if icon_url := ICON_OVERRIDES.get(blog_key):
            png = download_icon(session, icon_url)
            fetched = (png, icon_url) if png else None
        else:
            fetched = fetch_icon(session, site_url)
        if fetched is None:
            missing.append(f"{feed['blogName']} ({site_url})")
            continue
        png, source = fetched
        target.write_bytes(png)
        print(f"{feed['blogName']:<16} ← {source}")

    if missing:
        # 실패는 화면에서 회색 자리로 남는다. 조용히 넘기지 않고 사람이 보게 적는다.
        print("\n아이콘을 받지 못한 블로그 (SITE_OVERRIDES 에 다른 주소를 적어 보세요):")
        for entry in missing:
            print(f"  - {entry}")


if __name__ == "__main__":
    main()
