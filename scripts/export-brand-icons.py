from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/webdev-static-assets/metrcmatch-app-icon.png")
TARGET = Path("/home/ubuntu/webdev-static-assets/metrcmatch-icon-exports")

EXPORTS = {
    "metrcmatch-favicon-16.png": 16,
    "metrcmatch-favicon-32.png": 32,
    "metrcmatch-favicon-48.png": 48,
    "metrcmatch-favicon-64.png": 64,
    "metrcmatch-apple-touch-icon-180.png": 180,
    "metrcmatch-android-chrome-192.png": 192,
    "metrcmatch-android-chrome-512.png": 512,
    "metrcmatch-app-store-1024.png": 1024,
}


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGB")

    for filename, size in EXPORTS.items():
        icon = source.resize((size, size), Image.Resampling.LANCZOS)
        icon.save(TARGET / filename, format="PNG", optimize=True)

    print(f"Exported {len(EXPORTS)} PNG icon files to {TARGET}")


if __name__ == "__main__":
    main()
