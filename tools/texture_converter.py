#!/usr/bin/env python3
"""
texture_converter.py

Automated script to batch convert N64 proprietary texture binaries (e.g., RGBA16, CI8)
extracted by splat into standard web formats (PNG) for use in the Next.js frontend.
"""

import os
import sys
import argparse
import glob
from n64img.image import Image
from n64img.image import RGBA16

def convert_texture(input_bin, output_png, width, height):
    """
    Parses a raw N64 RGBA16 binary and outputs a PNG.
    """
    print(f"Converting {input_bin} -> {output_png} (RGBA16 {width}x{height})")

    with open(input_bin, "rb") as f:
        data = f.read()

    # Calculate expected size (RGBA16 = 2 bytes per pixel)
    expected_size = width * height * 2
    if len(data) < expected_size:
        print(f"  Warning: File size ({len(data)} bytes) is smaller than expected {expected_size} bytes. Padding with zeros.")
        data += bytes(expected_size - len(data))

    img = RGBA16(data=data[:expected_size], width=width, height=height)
    img.write(output_png)
    print("  Success.")

def main():
    parser = argparse.ArgumentParser(description="Convert N64 texture binaries to PNG.")
    parser.add_argument("input_dir", help="Directory containing raw .bin textures.")
    parser.add_argument("output_dir", help="Output directory for .png files.")
    parser.add_argument("--width", type=int, default=32, help="Assumed texture width.")
    parser.add_argument("--height", type=int, default=32, help="Assumed texture height.")

    args = parser.parse_args()

    if not os.path.exists(args.input_dir):
        print(f"Error: Input directory {args.input_dir} not found.")
        sys.exit(1)

    os.makedirs(args.output_dir, exist_ok=True)

    # Search for all binary files in the input directory
    bin_files = glob.glob(os.path.join(args.input_dir, "**/*.bin"), recursive=True)
    if not bin_files:
        print(f"No .bin files found in {args.input_dir}.")
        sys.exit(0)

    for bin_file in bin_files:
        base_name = os.path.basename(bin_file)
        name_no_ext = os.path.splitext(base_name)[0]
        out_png = os.path.join(args.output_dir, f"{name_no_ext}.png")

        convert_texture(bin_file, out_png, args.width, args.height)

if __name__ == "__main__":
    main()
