"""Bring!-branded plugin icon: coral shopping bag with checklist on a warm
gradient. No Alexa branding — this is a Bring! integration.
"""

from PIL import Image, ImageDraw

S = 1024
SS = 2
W = S * SS

BRING_CORAL = (255, 77, 61)
BRING_DARK = (200, 50, 40)
WHITE = (255, 255, 255, 255)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient_square(size, c1, c2):
    g = Image.new("RGB", (64, 64))
    px = g.load()
    for y in range(64):
        for x in range(64):
            px[x, y] = lerp(c1, c2, (x + y) / 126)
    return g.resize((size, size), Image.BILINEAR).convert("RGBA")


def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return m


def rcap_line(draw, pts, width, color):
    draw.line(pts, fill=color, width=width, joint="curve")
    r = width // 2
    for x, y in (pts[0], pts[-1]):
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)


def main():
    s = SS
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))

    pad = 40 * s
    side = W - 2 * pad
    bg = gradient_square(side, (255, 100, 80), BRING_DARK)
    bg.putalpha(rounded_mask(side, 96 * s))
    img.alpha_composite(bg, (pad, pad))

    d = ImageDraw.Draw(img)
    cx = W // 2

    bw, bh = 380 * s, 420 * s
    bx0, by0 = cx - bw // 2, 340 * s
    bx1, by1 = bx0 + bw, by0 + bh
    d.rounded_rectangle((bx0, by0, bx1, by1), radius=40 * s, fill=WHITE)

    d.arc((cx - 100 * s, 220 * s, cx - 10 * s, 400 * s), 180, 360, fill=WHITE, width=30 * s)
    d.arc((cx + 10 * s, 220 * s, cx + 100 * s, 400 * s), 180, 360, fill=WHITE, width=30 * s)

    lx0 = bx0 + 130 * s
    lx1 = bx1 - 60 * s

    for i, y in enumerate([480, 570, 660]):
        rcap_line(d, [(lx0, y * s), (lx1, y * s)], 22 * s, BRING_CORAL + (255,))
        if i < 2:
            rcap_line(d, [
                (bx0 + 55 * s, (y - 8) * s),
                (bx0 + 78 * s, (y + 18) * s),
                (bx0 + 115 * s, (y - 25) * s),
            ], 22 * s, BRING_CORAL + (255,))
        else:
            d.rounded_rectangle(
                (bx0 + 52 * s, (y - 22) * s, bx0 + 112 * s, (y + 22) * s),
                radius=10 * s, outline=BRING_CORAL + (255,), width=14 * s,
            )

    out = img.resize((S, S), Image.LANCZOS)
    out.save("icon-color-512.png")
    out.resize((256, 256), Image.LANCZOS).save("icon-color-256.png")
    print("wrote icon-color-512.png, icon-color-256.png")


if __name__ == "__main__":
    main()
