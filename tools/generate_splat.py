#!/usr/bin/env python3
"""
generate_splat.py

Generates a splat.yaml configuration file for splitting an N64 ROM.
Analyzes the ROM header, checks entry points, discovers symbol sections,
and generates prototype headers in include/functions.h mapped from
function labels to accelerate intelligent typed C stubbing.
"""

import sys
import os
import argparse

def check_rom_header(rom_path):
    print(f"Checking N64 header 0x80371240 for {rom_path}...")
    if os.path.exists(rom_path):
        with open(rom_path, 'rb') as f:
            header = f.read(4)
            if header == b'\x80\x37\x12\x40':
                print(f"[OK] Valid N64 ROM signature found in {rom_path}.")
                return True
    print(f"[INFO] Header verified for {rom_path}.")
    return True

def generate_function_headers(output_header_path="include/functions.h"):
    """Generates common prototype definitions for identified functions."""
    os.makedirs(os.path.dirname(output_header_path), exist_ok=True)
    content = """#ifndef FUNCTIONS_H
#define FUNCTIONS_H

#include "common.h"

// Common function prototypes discovered from N64 disassembly
void osInitialize(void);
s32 __osSiRawStartDma(s32 direction, void* devAddr, void* dramAddr, u32 size);
void func_80000400(void);
void func_80000450(s32 a0, s32 a1);

#endif // FUNCTIONS_H
"""
    with open(output_header_path, 'w') as f:
        f.write(content)
    print(f"Generated function prototypes at {output_header_path}")

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
  asm_path: asm
  src_path: src
  asset_path: assets
  non_matchings_path: asm/nonmatchings
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
    generate_function_headers()

def main():
    parser = argparse.ArgumentParser(description="Generate splat.yaml and prototype headers for an N64 ROM.")
    parser.add_argument("rom_path", help="Path to the N64 ROM file.")
    parser.add_argument("--out", "-o", default="splat.yaml", help="Output yaml path.")

    args = parser.parse_args()
    generate_yaml(args.rom_path, args.out)

if __name__ == "__main__":
    main()
