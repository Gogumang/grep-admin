#!/usr/bin/env python3
"""
grep 로고 생성기 — Pretendard 아웃라인을 SVG 패스로 굳힌다.

왜 살아있는 텍스트로 두지 않는가: Pretendard가 없는 기기에서 시스템 폰트로 대체되어
로고 모양이 바뀐다. 로고는 어디서나 같은 모양이어야 한다 — 토스도 같은 이유로 로고를
이미지 에셋(icon-logo-toss-appintoss-mono-*.png)으로 배포하고 웹폰트로 조판하지 않는다.

서체는 사이트 폰트 스택 1순위인 Pretendard(OFL) 그대로다. 사이트가 Toss Product Sans를
쓸 수 없어 고른 대체 서체이므로, 로고만 다른 서체로 그리면 헤더 글자와 따로 논다.

실행:  python3 scripts/build-wordmark.py
결과:  src/components/logoPaths.ts  (생성물 — 직접 고치지 말 것)
"""

from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

FONT_PATH = Path.home() / "Library/Fonts/PretendardVariable.ttf"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "src/components/logoPaths.ts"

# 이름은 굵게, 수식어는 한 단 가늘게 — 토스가 `apps in`과 `toss`를 굵기로 가르는 방식이다.
NAME_TEXT, NAME_WEIGHT, NAME_TRACKING = "grep", 700, -0.04
LABEL_TEXT, LABEL_WEIGHT, LABEL_TRACKING = "관리", 500, -0.01

# 한글은 라틴 소문자보다 em을 꽉 채운다 — 글자 크기를 같게 두면 수식어가 이름보다 커 보인다.
# fontSize.sm/lg(13/17=0.76)보다 한 단 더 줄여야 눈으로 대등해지지 않는다.
LABEL_SIZE_RATIO = 0.70

# 최종 좌표계: 이름의 x-높이를 100으로 둔다. 정수에 가까운 수치로 배치를 읽을 수 있다.
NAME_X_HEIGHT = 100.0

# 심볼은 사이트 favicon(grep/public/favicon.svg)과 같은 20×20 기하다.
CARET = "M3.8 5.4L9.4 10L3.8 14.6"
CURSOR = "M11.4 15.4H16.6"
SYMBOL_STROKE = 2.4
SYMBOL_CARET_TOP, SYMBOL_CARET_BOTTOM = 5.4, 14.6
SYMBOL_CURSOR_Y = 15.4
SYMBOL_INK_LEFT, SYMBOL_INK_RIGHT = 3.8 - SYMBOL_STROKE / 2, 16.6 + SYMBOL_STROKE / 2

# 캐럿을 x-높이보다 살짝 낮춘다. 같은 높이로 두면 선 하나짜리 도형이 글자보다 커 보인다.
CARET_TO_X_HEIGHT = 0.92

# 사이 간격. 이름 기준 em 비율이라 크기를 바꿔도 짜임이 유지된다.
SYMBOL_GAP_EM, LABEL_GAP_EM = 0.16, 0.22


def render(text: str, weight: int, tracking_em: float, transform: Transform, font_cache: dict) -> str:
    """text를 지정 굵기로 그려 최종 좌표계의 패스 하나로 만든다."""
    font = font_cache.setdefault(weight, instancer.instantiateVariableFont(TTFont(FONT_PATH), {"wght": weight}))
    units_per_em = font["head"].unitsPerEm
    cmap, glyphs, metrics = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]

    pen = SVGPathPen(glyphs, ntos=lambda value: f"{value:.1f}".rstrip("0").rstrip("."))
    pen_x = 0.0
    for character in text:
        glyph_name = cmap[ord(character)]
        glyphs[glyph_name].draw(TransformPen(pen, transform.translate(pen_x, 0)))
        pen_x += metrics[glyph_name][0] + tracking_em * units_per_em
    return pen.getCommands()


def measure(text: str, weight: int, tracking_em: float, font_cache: dict):
    """잉크 경계를 폰트 단위로 잰다 — 배치는 진행폭이 아니라 실제로 칠해진 넓이로 해야 맞는다."""
    font = font_cache.setdefault(weight, instancer.instantiateVariableFont(TTFont(FONT_PATH), {"wght": weight}))
    units_per_em = font["head"].unitsPerEm
    cmap, glyphs, metrics = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]

    pen_x, box = 0.0, None
    for character in text:
        glyph_name = cmap[ord(character)]
        bounds_pen = BoundsPen(glyphs)
        glyphs[glyph_name].draw(bounds_pen)
        if bounds_pen.bounds:
            x0, y0, x1, y1 = bounds_pen.bounds
            found = (pen_x + x0, y0, pen_x + x1, y1)
            box = found if box is None else (min(box[0], found[0]), min(box[1], found[1]),
                                             max(box[2], found[2]), max(box[3], found[3]))
        pen_x += metrics[glyph_name][0] + tracking_em * units_per_em
    return box, units_per_em


def main() -> None:
    font_cache: dict = {}
    name_box, units_per_em = measure(NAME_TEXT, NAME_WEIGHT, NAME_TRACKING, font_cache)
    label_box, _ = measure(LABEL_TEXT, LABEL_WEIGHT, LABEL_TRACKING, font_cache)

    name_scale = NAME_X_HEIGHT / name_box[3]
    label_scale = name_scale * LABEL_SIZE_RATIO
    em = units_per_em * name_scale

    # 심볼: 캐럿 높이를 x-높이에 맞춰 키운다. 획 두께가 글자 세로획과 비슷하게 떨어진다.
    symbol_scale = (CARET_TO_X_HEIGHT * NAME_X_HEIGHT) / (SYMBOL_CARET_BOTTOM - SYMBOL_CARET_TOP)
    symbol_width = (SYMBOL_INK_RIGHT - SYMBOL_INK_LEFT) * symbol_scale
    symbol_stroke = SYMBOL_STROKE * symbol_scale

    # 가로 배치 — 잉크 왼쪽 끝을 0에 맞춘 뒤 간격만큼 밀어 나간다.
    name_x = symbol_width + SYMBOL_GAP_EM * em
    name_width = (name_box[2] - name_box[0]) * name_scale
    label_x = name_x + name_width + LABEL_GAP_EM * em
    label_width = (label_box[2] - label_box[0]) * label_scale

    # 세로 배치 — 캐럿 중심을 x-높이 절반에 둔다. 터미널에서 `>`가 앉는 자리다.
    caret_center = (SYMBOL_CARET_TOP + SYMBOL_CARET_BOTTOM) / 2
    symbol_top_above_baseline = NAME_X_HEIGHT / 2 + (caret_center - SYMBOL_CARET_TOP + SYMBOL_STROKE / 2) * symbol_scale
    symbol_bottom_below_baseline = (SYMBOL_CURSOR_Y - caret_center + SYMBOL_STROKE / 2) * symbol_scale - NAME_X_HEIGHT / 2

    above = max(symbol_top_above_baseline, label_box[3] * label_scale, NAME_X_HEIGHT)
    below = max(symbol_bottom_below_baseline, -label_box[1] * label_scale, -name_box[1] * name_scale)
    baseline = above

    name_path = render(NAME_TEXT, NAME_WEIGHT, NAME_TRACKING, font_cache=font_cache,
                       transform=Transform().translate(name_x, baseline).scale(name_scale, -name_scale)
                                            .translate(-name_box[0], 0))
    label_path = render(LABEL_TEXT, LABEL_WEIGHT, LABEL_TRACKING, font_cache=font_cache,
                        transform=Transform().translate(label_x, baseline).scale(label_scale, -label_scale)
                                             .translate(-label_box[0], 0))

    # 심볼은 선이라 패스를 변형하지 않고 transform으로 옮긴다 — 획 두께를 따로 계산할 필요가 없다.
    # 잉크 경계에 맞춰 옮긴다 — 패스 좌표가 아니라 획 바깥선이 0에 닿아야 x·y가 같은 규칙이 된다.
    symbol_caret_top_ink = SYMBOL_CARET_TOP - SYMBOL_STROKE / 2
    symbol_transform = (f"translate({-SYMBOL_INK_LEFT * symbol_scale:.1f} "
                        f"{baseline - symbol_top_above_baseline - symbol_caret_top_ink * symbol_scale:.1f}) "
                        f"scale({symbol_scale:.4f})")

    height = above + below
    OUTPUT_PATH.write_text(f'''/**
 * 생성물 — 직접 고치지 말 것. `python3 scripts/build-wordmark.py` 로 다시 만든다.
 *
 * Pretendard({NAME_WEIGHT}/{LABEL_WEIGHT}) 아웃라인을 패스로 굳힌 grep 로고다.
 * 좌표계는 이름의 x-높이가 {NAME_X_HEIGHT:.0f}, 베이스라인이 y={baseline:.1f}.
 */

/** 수식어까지 포함한 폭. 수식어가 없으면 {NAME_TEXT} 오른쪽 끝에서 자른다. */
export const LOGO_WIDTH_WITH_LABEL = {label_x + label_width:.1f}
export const LOGO_WIDTH = {name_x + name_width:.1f}
export const LOGO_HEIGHT = {height:.1f}

/** 심볼은 선으로 그린다 — 사이트 favicon과 같은 20×20 기하를 옮겨 놓았을 뿐이다. */
export const SYMBOL_TRANSFORM = '{symbol_transform}'
export const SYMBOL_STROKE_WIDTH = {SYMBOL_STROKE}
export const SYMBOL_CARET_PATH = '{CARET}'
export const SYMBOL_CURSOR_PATH = '{CURSOR}'

export const NAME_PATH =
  '{name_path}'

export const LABEL_PATH =
  '{label_path}'
''')

    print(f"upem={units_per_em}  name_scale={name_scale:.6f}  symbol_scale={symbol_scale:.4f}")
    print(f"심볼 획 {symbol_stroke:.1f} · 폭 {symbol_width:.1f} / {NAME_TEXT} 폭 {name_width:.1f} / {LABEL_TEXT} 폭 {label_width:.1f}")
    print(f"viewBox 0 0 {label_x + label_width:.1f} {height:.1f}  (베이스라인 y={baseline:.1f})")
    print(f"→ {OUTPUT_PATH.relative_to(Path.cwd())}  ({len(name_path) + len(label_path)}자)")


main()
