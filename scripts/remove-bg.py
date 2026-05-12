"""Remove the white background of state-05.png using flood-fill from the
edges. This preserves the white pixels INSIDE the mascot (its body) because
they are not connected to the outer border through other white pixels.

Algorithm:
  1. Build a binary "white mask" of pixels close to white (per-channel
     threshold).
  2. From every border pixel that is in the mask, run a 4-connected flood-fill,
     marking visited pixels as "background".
  3. Anti-alias the cutoff: pixels that are border-connected get alpha 0;
     remaining pixels keep alpha 255. A 1-pixel feather on the boundary
     blends the edge to avoid jaggies.
"""
from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "apps" / "desktop" / "public" / "state-05.png"

# A pixel is considered "background-white" if every channel >= THRESHOLD.
# Higher = stricter (fewer pixels treated as background).
THRESHOLD = 240


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    px = img.load()

    is_bg = bytearray(w * h)

    def near_white(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return r >= THRESHOLD and g >= THRESHOLD and b >= THRESHOLD

    queue: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near_white(x, y):
                idx = y * w + x
                if not is_bg[idx]:
                    is_bg[idx] = 1
                    queue.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if near_white(x, y):
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
                if not is_bg[nidx] and near_white(nx, ny):
                    is_bg[nidx] = 1
                    queue.append((nx, ny))

    cleared = 0
    for y in range(h):
        for x in range(w):
            if is_bg[y * w + x]:
                r, g, b, _ = px[x, y]
                px[x, y] = (r, g, b, 0)
                cleared += 1

    alpha = img.split()[3].filter(ImageFilter.GaussianBlur(radius=0.6))
    img.putalpha(alpha)

    img.save(SRC, optimize=True)
    print(f"cleared {cleared} pixels; saved {SRC}")


if __name__ == "__main__":
    main()
