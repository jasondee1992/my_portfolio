from pathlib import Path

from PIL import Image


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    source = root / "public" / "icons" / "logo" / "logo_tab.png"
    favicon = root / "src" / "app" / "favicon.ico"
    icon_png = root / "src" / "app" / "icon.png"
    apple_png = root / "src" / "app" / "apple-icon.png"
    zoom_factor = 2.2

    if not source.exists():
        raise FileNotFoundError(f"Logo source not found: {source}")

    with Image.open(source).convert("RGBA") as image:
        width, height = image.size
        side = int(min(width, height) / zoom_factor)
        left = (width - side) // 2
        top = (height - side) // 2
        cropped = image.crop((left, top, left + side, top + side))

        favicon_image = cropped.resize((256, 256), Image.LANCZOS)
        favicon_image.save(
            favicon,
            format="ICO",
            sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
        )

        icon_image = cropped.resize((512, 512), Image.LANCZOS)
        icon_image.save(icon_png, format="PNG")
        icon_image.save(apple_png, format="PNG")

    print("Synced logo icons from public/icons/logo/logo_tab.png")


if __name__ == "__main__":
    main()
