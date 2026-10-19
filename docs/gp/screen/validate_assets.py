"""Check the Google Play image constraints supplied for the 2027 listing."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent
COUNTRIES = ("Russia", "Turkey", "Indonesia", "Japan", "Mexico")
LIMITS = {
    "phone": (320, 3840, 2),
    "7-inch": (320, 3840, 1),
    "10-inch": (1080, 7680, 1),
}


def inspect(path: Path, smallest: int, largest: int, max_bytes: int, *, feature=False) -> None:
    with Image.open(path) as image:
        assert image.format in ("PNG", "JPEG"), f"format: {path}"
        width, height = image.size
    assert path.stat().st_size <= max_bytes, f"file size: {path}"
    if feature:
        assert (width, height) == (1024, 500), f"feature size: {path}"
    else:
        assert smallest <= width <= largest and smallest <= height <= largest, f"sides: {path}"
        assert width * 16 == height * 9 or width * 9 == height * 16, f"aspect ratio: {path}"


def main() -> None:
    total = 0
    for country in COUNTRIES:
        base = ROOT / country
        inspect(base / "feature-graphic.png", 0, 0, 15 * 1024 * 1024, feature=True)
        total += 1
        for kind, (smallest, largest, minimum) in LIMITS.items():
            images = sorted((base / kind).glob("*.png"))
            assert minimum <= len(images) <= 8, f"count: {country}/{kind}: {len(images)}"
            for path in images:
                inspect(path, smallest, largest, 8 * 1024 * 1024)
            total += len(images)
            print(f"{country}/{kind}: {len(images)} valid screenshots")
    print(f"Validated {total} upload images")


if __name__ == "__main__":
    main()
