"""Render optional device-frame previews from the real emulator screenshots.

The adjacent phone/*.png images are the unframed Play Console uploads. This
script keeps the phone-frame previews separate so they cannot be uploaded by
mistake as screenshots of the app.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parent
CANVAS = (1080, 1920)


def render(country: Path, source: Path) -> None:
    country = country.resolve()
    source = source.resolve()
    art = Image.open(country / "feature-graphic.png").convert("RGB")
    backdrop = ImageOps.fit(art, CANVAS, centering=(0.5, 0.5)).filter(ImageFilter.GaussianBlur(65))
    shade = Image.new("RGBA", CANVAS, (12, 24, 36, 112))
    canvas = Image.alpha_composite(backdrop.convert("RGBA"), shade)

    # Deep shadow and simple hardware controls make the device outline clear.
    shadow = Image.new("RGBA", CANVAS)
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((77, 112, 1003, 1806), radius=105, fill=(0, 0, 0, 180))
    canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(34)))

    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((122, 147, 958, 1773), radius=72, fill=(12, 17, 24, 255))
    draw.rounded_rectangle((133, 158, 947, 1762), radius=64, outline=(98, 110, 122, 255), width=5)
    draw.rounded_rectangle((950, 525, 969, 685), radius=8, fill=(70, 78, 88, 255))  # power
    draw.rounded_rectangle((111, 445, 130, 560), radius=8, fill=(70, 78, 88, 255))  # volume up
    draw.rounded_rectangle((111, 578, 130, 693), radius=8, fill=(70, 78, 88, 255))  # volume down

    screen_box = (151, 180, 929, 1740)
    screen = Image.open(source).convert("RGB").resize(
        (screen_box[2] - screen_box[0], screen_box[3] - screen_box[1]), Image.Resampling.LANCZOS
    )
    mask = Image.new("L", screen.size)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, screen.width - 1, screen.height - 1), radius=45, fill=255)
    canvas.paste(screen, screen_box[:2], mask)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((454, 185, 626, 209), radius=12, fill=(12, 17, 24, 255))  # earpiece
    draw.ellipse((641, 188, 658, 205), fill=(23, 32, 46, 255))

    target = country / "mockups" / "phone" / source.name
    target.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(target, "PNG", optimize=True)
    print(target.relative_to(ROOT), f"{target.stat().st_size / 1048576:.2f} MiB")


if __name__ == "__main__":
    for folder in sorted(ROOT.iterdir()):
        if folder.is_dir() and (folder / "feature-graphic.png").exists():
            for png in sorted((folder / "phone").glob("*.png")):
                render(folder, png)
