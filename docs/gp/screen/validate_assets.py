"""Check the Google Play image constraints supplied for the 2027 listing."""

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent
COUNTRIES = ("Russia", "Turkey", "Indonesia", "Japan", "Mexico")
HOLIDAYS = {
    "Russia": "new-year",
    "Turkey": "childrens-day",
    "Indonesia": "independence-day",
    "Japan": "foundation-day",
    "Mexico": "independence-day",
}
LIMITS = {
    "phone": (320, 3840, 2),
    "7-inch": (320, 3840, 1),
    "10-inch": (1080, 7680, 1),
}


def inspect(path: Path, smallest: int, largest: int, max_bytes: int, *, feature=False) -> dict:
    with Image.open(path) as image:
        assert image.format in ("PNG", "JPEG"), f"format: {path}"
        assert image.mode == "RGB", f"color mode: {path}"
        width, height = image.size
    assert path.stat().st_size <= max_bytes, f"file size: {path}"
    if feature:
        assert (width, height) == (1024, 500), f"feature size: {path}"
    else:
        assert smallest <= width <= largest and smallest <= height <= largest, f"sides: {path}"
        assert width * 16 == height * 9 or width * 9 == height * 16, f"aspect ratio: {path}"
    return {"file": str(path.relative_to(ROOT)), "width": width, "height": height, "bytes": path.stat().st_size}


def main() -> None:
    total = 0
    manifest = []
    for country in COUNTRIES:
        base = ROOT / country
        manifest.append(inspect(base / "feature-graphic.png", 0, 0, 15_000_000, feature=True))
        total += 1
        expected = {"01-year-overview.png", f"02-{HOLIDAYS[country]}.png", "03-vacation-plan.png"}
        for kind, (smallest, largest, minimum) in LIMITS.items():
            images = sorted((base / kind).glob("*.png"))
            assert minimum <= len(images) <= 8, f"count: {country}/{kind}: {len(images)}"
            assert {path.name for path in images} == expected, f"missing or duplicate captures: {country}/{kind}"
            for path in images:
                manifest.append(inspect(path, smallest, largest, 8_000_000))
            total += len(images)
            print(f"{country}/{kind}: {len(images)} valid screenshots")
        mockups = sorted((base / "mockups" / "phone").glob("*.png"))
        assert {path.name for path in mockups} == expected, f"missing or duplicate mockups: {country}"
        for path in mockups:
            manifest.append(inspect(path, 320, 3840, 8_000_000))
    (ROOT / "assets-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Validated {total} upload images and {len(manifest) - total} device mockups")
    print(f"Largest file: {max(item['bytes'] for item in manifest) / 1_000_000:.2f} MB")


if __name__ == "__main__":
    main()
