#!/usr/bin/env python3
"""
행사 수집처(판매처) 아이콘을 받아 public/event-source-icons/<key>.png 로 굳힌다. key 는 collector 의 판매처 key
(ticketa · eventus · dev_event · meetup · luma)다. src/app/events/sources/EventSourceIcon.tsx 가 이 파일을 쓴다.

받는 방법(선언된 아이콘 → /favicon.ico, 64px PNG)은 fetch-blog-icons.py 것을 그대로 쓴다.

실행:  python3 scripts/fetch-event-source-icons.py          (없는 것만)
       python3 scripts/fetch-event-source-icons.py --force  (전부 다시)
결과:  public/event-source-icons/<key>.png — 판매처를 추가하면 여기에 적고 다시 돌려 커밋한다
"""

import importlib.util
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public/event-source-icons"

_spec = importlib.util.spec_from_file_location("fetch_blog_icons", ROOT / "scripts/fetch-blog-icons.py")
blog_icons = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(blog_icons)

# 판매처 key → 아이콘을 받을 사이트.
SOURCE_SITES = {
    "ticketa": "https://ticketa.co",
    "eventus": "https://event-us.kr",
    # Dev-Event 는 GitHub 저장소라 github.com 아이콘이 온다. 저장소를 꾸리는 brave-people 페이지도 같은 아이콘이다.
    "dev_event": "https://github.com/brave-people/Dev-Event",
    "meetup": "https://www.meetup.com",
    "luma": "https://luma.com",
}


def main() -> None:
    force = "--force" in sys.argv
    session = requests.Session()
    session.headers["User-Agent"] = blog_icons.BROWSER_USER_AGENT
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    missing: list[str] = []
    for source_key, site_url in SOURCE_SITES.items():
        target = OUTPUT_DIR / f"{source_key}.png"
        if target.exists() and not force:
            continue
        fetched = blog_icons.fetch_icon(session, site_url)
        if fetched is None:
            missing.append(f"{source_key} ({site_url})")
            continue
        png, source = fetched
        target.write_bytes(png)
        print(f"{source_key:<12} ← {source}")

    if missing:
        # 받지 못한 곳은 화면에서 이름 첫 글자로 남는다. 조용히 넘기지 않고 사람이 보게 적는다.
        print("\n아이콘을 받지 못한 판매처 (SOURCE_SITES 에 다른 주소를 적어 보세요):")
        for entry in missing:
            print(f"  - {entry}")


if __name__ == "__main__":
    main()
