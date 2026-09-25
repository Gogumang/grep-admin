#!/usr/bin/env python3
"""
채용 수집처에 붙일 회사 로고 중 블로그 아이콘(public/blog-icons)으로 대신할 수 없는 곳만 받아
public/company-icons/<companyKey>.png 로 굳힌다. 블로그 아이콘이 있는 회사는 src/app/jobs/sources/CompanyIcon.tsx 가
그 파일을 그대로 쓴다 — 같은 로고를 두 벌 두지 않는다.

받는 방법(선언된 아이콘 → /favicon.ico, 64px PNG)은 fetch-blog-icons.py 것을 그대로 쓴다. 회사 공식 사이트의 아이콘만 받는다.

실행:  python3 scripts/fetch-company-icons.py          (없는 것만)
       python3 scripts/fetch-company-icons.py --force  (전부 다시)
결과:  public/company-icons/<companyKey>.png — 회사를 추가하면 여기와 CompanyIcon.tsx 에 적고 다시 돌려 커밋한다
"""

import importlib.util
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public/company-icons"

_spec = importlib.util.spec_from_file_location("fetch_blog_icons", ROOT / "scripts/fetch-blog-icons.py")
blog_icons = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(blog_icons)

# companyKey → 회사 공식 사이트. 블로그 아이콘이 없거나(우아한형제들·카카오엔터테인먼트) 블로그 아이콘이 회사 로고가 아닌 곳(라인 → LY Corp, 네이버 → D2)이다.
COMPANY_SITES = {
    # 회사 홈(www.woowahan.com)은 스크립트 요청에 아이콘을 받지 못했다. 채용 사이트가 같은 로고를 준다.
    "woowahan": "https://career.woowahan.com",
    "line": "https://www.linecorp.com/ko/",
    "kakaoent": "https://www.kakaoent.com",
    # 네이버 블로그 아이콘은 D2 로고라 채용 수집처(네이버)에는 맞지 않는다.
    "naver": "https://www.navercorp.com",
}


def main() -> None:
    force = "--force" in sys.argv
    session = requests.Session()
    session.headers["User-Agent"] = blog_icons.BROWSER_USER_AGENT
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    missing: list[str] = []
    for company_key, site_url in COMPANY_SITES.items():
        target = OUTPUT_DIR / f"{company_key}.png"
        if target.exists() and not force:
            continue
        fetched = blog_icons.fetch_icon(session, site_url)
        if fetched is None:
            missing.append(f"{company_key} ({site_url})")
            continue
        png, source = fetched
        target.write_bytes(png)
        print(f"{company_key:<12} ← {source}")

    if missing:
        # 받지 못한 곳은 화면에서 이름 첫 글자로 남는다. 조용히 넘기지 않고 사람이 보게 적는다.
        print("\n로고를 받지 못한 회사 (COMPANY_SITES 에 다른 주소를 적어 보세요):")
        for entry in missing:
            print(f"  - {entry}")


if __name__ == "__main__":
    main()
