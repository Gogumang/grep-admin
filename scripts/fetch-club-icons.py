"""
동아리 목록에 붙일 아이콘을 받아 public/club-icons/<key>.png 로 굳힌다.

블로그 아이콘(fetch-blog-icons.py)과 같은 방법을 쓴다 — 사이트 HTML 이 선언한 아이콘 중 큰 것을 받아
64px PNG 로 만든다. 남의 favicon 을 화면에서 바로 부르지 않는 이유도 같다(HTML·404·같은 플랫폼 로고).

준비:  pip install requests pillow
실행:  python3 scripts/fetch-club-icons.py            (없는 것만 받는다)
       python3 scripts/fetch-club-icons.py --force    (전부 다시 받는다)
결과:  public/club-icons/<key>.png  — src/data/clubs.json 에 동아리를 더하면 다시 돌려 커밋한다
공식 사이트가 없는 동아리(siteUrl null, 인스타그램 공지 등)는 받지 않는다 — 화면이 이름 첫 글자로 대신한다.
"""

import importlib.util
import json
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
CLUBS_FILE = ROOT / "src/data/clubs.json"
OUTPUT_DIR = ROOT / "public/club-icons"

# 아이콘 찾기·변환은 블로그 스크립트의 것을 그대로 쓴다. 파일 이름에 '-' 가 있어 import 문으로는 부를 수 없다.
_spec = importlib.util.spec_from_file_location("fetch_blog_icons", ROOT / "scripts/fetch-blog-icons.py")
blog_icons = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(blog_icons)


def main() -> None:
    force = "--force" in sys.argv
    session = requests.Session()
    session.headers["User-Agent"] = blog_icons.BROWSER_USER_AGENT
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    missing: list[str] = []
    for club in json.loads(CLUBS_FILE.read_text())["clubs"]:
        target = OUTPUT_DIR / f"{club['key']}.png"
        if not club.get("siteUrl") or (target.exists() and not force):
            continue
        fetched = blog_icons.fetch_icon(session, club["siteUrl"])
        if fetched is None:
            missing.append(f"{club['name']} ({club['siteUrl']})")
            continue
        png, source = fetched
        target.write_bytes(png)
        print(f"{club['name']:<14} ← {source}")

    if missing:
        # 실패는 화면에서 이름 첫 글자로 남는다. 조용히 넘기지 않고 사람이 보게 적는다.
        print("\n아이콘을 받지 못한 동아리:")
        for entry in missing:
            print(f"  - {entry}")


if __name__ == "__main__":
    main()
