#!/usr/bin/env python3
"""
generate_splat.py

Generates a splat.yaml configuration file for splitting an N64 ROM.
In a real-world scenario, this tool would analyze the ROM header and
search for entry points. Here we generate a boilerplate structure suitable
for Mario Party style N64 decompilations.
"""

import sys
import os
import argparse

def check_rom_header(rom_path):
    print(f"Mock checking N64 header 0x80371240 for {rom_path}...")
    return True

def generate_yaml(rom_path, output_path="splat.yaml"):
    check_rom_header(rom_path)
    basename = os.path.basename(rom_path).replace('.z64', '').replace('.v64', '').replace('.n64', '')
    if not basename:
        basename = "target_rom"

    yaml_content = f"""name: {basename}
sha1: "" # Add your target SHA1 here
options:
  basename: {basename}
  target_path: {rom_path}
  base_path: .
  compiler: GCC
  find_file_boundaries: True
  header_encoding: ASCII
segments:
  - name: header
    type: header
    start: 0x0

  - name: boot
    type: bin
    start: 0x40

  - name: main
    type: code
    start: 0x1000
    vram: 0x80000400
    subsegments:
      - [0x1000, c]
      - [0x100000, data]

  - name: overlays
    type: code
    start: 0x100000 # Placeholder start for overlays
    vram: 0x80100000
    subsegments:
      - [0x100000, c]

  - [0x200000] # End of ROM marker placeholder
"""

    with open(output_path, 'w') as f:
        f.write(yaml_content)

    print(f"Generated {output_path} for {rom_path}")

def main():
    parser = argparse.ArgumentParser(description="Generate splat.yaml for an N64 ROM.")
    parser.add_argument("rom_path", help="Path to the N64 ROM file.")
    parser.add_argument("--out", "-o", default="splat.yaml", help="Output yaml path.")

    args = parser.parse_args()

    # In reality, this script would do a quick sanity check of the file:
    # if not os.path.exists(args.rom_path):
    #    print(f"Warning: ROM {args.rom_path} not found.")

    generate_yaml(args.rom_path, args.out)

if __name__ == "__main__":
    main()
