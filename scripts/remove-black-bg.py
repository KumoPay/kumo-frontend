"""Remove solid/near-black background from a PNG (flood-fill from edges).

Pixels reachable from the image border through only near-black pixels become
transparent. Interior dark regions (e.g. eyes) stay opaque when surrounded
by lighter mascot pixels.
"""
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]


def resolve_src() -> Path:
    if len(sys.argv) > 1:
        p = Path(sys.argv[1])
        return p if p.is_absolute() else (ROOT / p)
    return ROOT / "apps" / "desktop" / "public" / "kumo-offline-mascot.png"


SRC = resolve_src()

# Treat as background black when all channels are at most this (0–255).
THRESHOLD = 52


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    px = img.load()

    is_bg = bytearray(w * h)

    def near_black(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return r <= THRESHOLD and g <= THRESHOLD and b <= THRESHOLD

    queue: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near_black(x, y):
                idx = y * w + x
                if not is_bg[idx]:
                    is_bg[idx] = 1
                    queue.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if near_black(x, y):
                idx = y * w + x
                if not is_bg[idx]:
                    is_bg[idx] = 1
                    queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not is_bg[nidx] and near_black(nx, ny):
                    is_bg[nidx] = 1
                    queue.append((nx, ny))

    cleared = 0
    for y in range(h):
        for x in range(w):
            if is_bg[y * w + x]:
                r, g, b, _ = px[x, y]
                px[x, y] = (r, g, b, 0)
                cleared += 1

    alpha = img.split()[3].filter(ImageFilter.GaussianBlur(radius=0.55))
    img.putalpha(alpha)

    img.save(SRC, optimize=True)
    print(f"cleared {cleared} pixels; saved {SRC}")


if __name__ == "__main__":
    main()
