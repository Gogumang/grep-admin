#!/usr/bin/env python3
"""
책 수집처 아이콘을 받아 public/book-source-icons/<key>.png 로 굳힌다. key 는 collector 의 수집처 key
(aladin · yes24 · amazon)다. src/app/books/sources/page.tsx 가 이 파일을 쓴다.

받는 방법은 행사 수집처 스크립트(fetch-event-source-icons.py → fetch-blog-icons.py)와 같다.

실행:  python3 scripts/fetch-book-source-icons.py          (없는 것만)
       python3 scripts/fetch-book-source-icons.py --force  (전부 다시)
결과:  public/book-source-icons/<key>.png — 수집처를 추가하면 여기에 적고 다시 돌려 커밋한다
"""

import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public/book-source-icons"

_spec = importlib.util.spec_from_file_location("fetch_event_source_icons", ROOT / "scripts/fetch-event-source-icons.py")
event_source_icons = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(event_source_icons)

SOURCE_SITES = {
    "aladin": "https://www.aladin.co.kr",
    "yes24": "https://www.yes24.com",
    "amazon": "https://www.amazon.com",
}


if __name__ == "__main__":
    event_source_icons.fetch_source_icons(SOURCE_SITES, OUTPUT_DIR, force="--force" in sys.argv)
