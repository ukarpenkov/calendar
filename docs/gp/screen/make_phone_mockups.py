"""Render optional device-frame previews from the real emulator screenshots.

The adjacent phone/*.png images are the unframed Play Console uploads. This
script keeps the phone-frame previews separate so they cannot be uploaded by
mistake as screenshots of the app.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


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
    sd.rounded_rectangle((105, 206, 975, 1715), radius=88, fill=(0, 0, 0, 180))
    canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(34)))

    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((116, 196, 964, 1692), radius=72, fill=(12, 17, 24, 255))
    draw.rounded_rectangle((126, 206, 954, 1682), radius=64, outline=(98, 110, 122, 255), width=4)
    draw.rounded_rectangle((956, 525, 975, 685), radius=8, fill=(70, 78, 88, 255))  # power
    draw.rounded_rectangle((105, 445, 124, 560), radius=8, fill=(70, 78, 88, 255))  # volume up
    draw.rounded_rectangle((105, 578, 124, 693), radius=8, fill=(70, 78, 88, 255))  # volume down

    # Preserve the original 9:16 screenshot ratio without stretching its UI.
    screen_box = (144, 240, 936, 1648)
    screen = Image.open(source).convert("RGB").resize(
        (screen_box[2] - screen_box[0], screen_box[3] - screen_box[1]), Image.Resampling.LANCZOS
    )
    mask = Image.new("L", screen.size)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, screen.width - 1, screen.height - 1), radius=45, fill=255)
    canvas.paste(screen, screen_box[:2], mask)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((454, 218, 626, 227), radius=4, fill=(66, 77, 92, 255))  # earpiece
    draw.ellipse((644, 216, 657, 229), fill=(30, 46, 65, 255))

    target = country / "mockups" / "phone" / source.name
    target.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(target, "PNG", optimize=True)
    print(target.relative_to(ROOT), f"{target.stat().st_size / 1048576:.2f} MiB")


def overview() -> None:
    countries = ("Russia", "Turkey", "Indonesia", "Japan", "Mexico")
    board = Image.new("RGB", (2064, 980), "#eff3f8")
    draw = ImageDraw.Draw(board)
    font_path = "/System/Library/Fonts/Supplemental/Arial.ttf"
    title_font = ImageFont.truetype(font_path, 32)
    country_font = ImageFont.truetype(font_path, 24)
    draw.text((24, 23), "Calendar 2027 / Google Play assets", font=title_font, fill="#172135")
    for index, country in enumerate(countries):
        left = 24 + 408 * index
        draw.text((left, 88), country, font=country_font, fill="#172135")
        feature = Image.open(ROOT / country / "feature-graphic.png").convert("RGB")
        board.paste(feature.resize((384, 187), Image.Resampling.LANCZOS), (left, 130))
        phone_path = next((ROOT / country / "mockups" / "phone").glob("02-*.png"))
        phone = Image.open(phone_path).convert("RGB")
        board.paste(phone.resize((342, 608), Image.Resampling.LANCZOS), (left + 21, 342))
    board.save(ROOT / "preview.jpg", "JPEG", quality=92, optimize=True)


if __name__ == "__main__":
    for folder in sorted(ROOT.iterdir()):
        if folder.is_dir() and (folder / "feature-graphic.png").exists():
            for png in sorted((folder / "phone").glob("*.png")):
                render(folder, png)
    overview()
