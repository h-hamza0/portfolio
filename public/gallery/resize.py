#!/usr/bin/env python3
"""
optimize_images.py

Batch-compresses gallery images and generates a tiny base64 blur
placeholder for each, so the lightbox can show something instantly
while the full image loads.

Setup (one time):
    pip install Pillow --break-system-packages

Run:
    python3 optimize_images.py

Reads every image in SRC_DIR, writes optimized WebP versions to OUT_DIR,
and writes placeholders.json with tiny base64 blur-up placeholders you
can paste into gallery.js.
"""

import base64
import json
import os
import sys
from pathlib import Path

from PIL import Image, ImageOps

SRC_DIR = Path("/Users/hamzahabib/Desktop/portfolioWebsite/research-site/public/gallery")
OUT_DIR = SRC_DIR / "optimized"
MAX_WIDTH = 1800  # plenty for a lightbox on any screen, including retina
QUALITY = 82  # visually near-lossless for photos/renders at this size
PLACEHOLDER_WIDTH = 20
PLACEHOLDER_QUALITY = 40

VALID_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff"}


def resize_if_needed(img: Image.Image, max_width: int) -> Image.Image:
    if img.width <= max_width:
        return img
    ratio = max_width / img.width
    new_size = (max_width, round(img.height * ratio))
    return img.resize(new_size, Image.LANCZOS)


def make_placeholder_data_uri(img: Image.Image) -> str:
    ratio = PLACEHOLDER_WIDTH / img.width
    small = img.resize((PLACEHOLDER_WIDTH, max(1, round(img.height * ratio))), Image.LANCZOS)
    from io import BytesIO

    buf = BytesIO()
    small.convert("RGB").save(buf, format="WEBP", quality=PLACEHOLDER_QUALITY)
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/webp;base64,{encoded}"


def main():
    if not SRC_DIR.exists():
        print(f"Source directory not found: {SRC_DIR}")
        print("Edit SRC_DIR at the top of this script to point at your images.")
        sys.exit(1)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    files = sorted(
        f for f in SRC_DIR.iterdir() if f.is_file() and f.suffix.lower() in VALID_EXTENSIONS
    )

    if not files:
        print(f"No images found in {SRC_DIR}")
        return

    placeholders = {}
    total_before = 0
    total_after = 0

    for file_path in files:
        name = file_path.stem
        output_path = OUT_DIR / f"{name}.webp"

        before_size = file_path.stat().st_size

        with Image.open(file_path) as img:
            img = ImageOps.exif_transpose(img)  # auto-orient
            original_w, original_h = img.size

            resized = resize_if_needed(img, MAX_WIDTH)
            resized.convert("RGB" if resized.mode == "CMYK" else resized.mode).save(
                output_path, format="WEBP", quality=QUALITY
            )

            placeholders[name] = make_placeholder_data_uri(img)

        after_size = output_path.stat().st_size
        total_before += before_size
        total_after += after_size

        print(
            f"{file_path.name}: {before_size / 1024 / 1024:.2f}MB -> {after_size / 1024:.0f}KB "
            f"({original_w}x{original_h} -> max {MAX_WIDTH}px wide)"
        )

    print("\n--- Summary ---")
    print(f"Total before: {total_before / 1024 / 1024:.1f}MB")
    print(f"Total after:  {total_after / 1024 / 1024:.1f}MB")
    if total_before:
        print(f"Reduction:    {100 * (1 - total_after / total_before):.0f}%")

    placeholders_path = OUT_DIR / "placeholders.json"
    placeholders_path.write_text(json.dumps(placeholders, indent=2))
    print(f"\nPlaceholder data URIs written to {placeholders_path}")
    print("Paste the relevant one into each gallery.js entry as `placeholder: \"...\"`.")


if __name__ == "__main__":
    main()
