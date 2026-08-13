from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "images"
ASSET_NAMES = (
    "icon.png",
    "splash-icon.png",
    "favicon.png",
    "android-icon-foreground.png",
)


def optimise_png(path: Path) -> None:
    with Image.open(path) as source:
        image = source.convert("RGB")
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        image.save(path, "PNG", optimize=True, compress_level=9)


for asset_name in ASSET_NAMES:
    optimise_png(ASSET_DIR / asset_name)
