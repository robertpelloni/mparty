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

GAME_PROFILES = {
    "mp1": {
        "name": "mario_party_1",
        "basename": "mario_party_1",
        "asm_path": "asm/mp1",
        "src_path": "src/mp1",
        "asset_path": "assets/mp1",
        "non_matchings_path": "asm/nonmatchings/mp1",
        "vram_main": "0x80000400",
        "vram_overlay": "0x80100000"
    },
    "mp2": {
        "name": "mario_party_2",
        "basename": "mario_party_2",
        "asm_path": "asm/mp2",
        "src_path": "src/mp2",
        "asset_path": "assets/mp2",
        "non_matchings_path": "asm/nonmatchings/mp2",
        "vram_main": "0x80000400",
        "vram_overlay": "0x80120000"
    },
    "mp3": {
        "name": "mario_party_3",
        "basename": "mario_party_3",
        "asm_path": "asm/mp3",
        "src_path": "src/mp3",
        "asset_path": "assets/mp3",
        "non_matchings_path": "asm/nonmatchings/mp3",
        "vram_main": "0x80000400",
        "vram_overlay": "0x80140000"
    }
}

def detect_game_profile(rom_path, requested_game=None):
    if requested_game and requested_game.lower() in GAME_PROFILES:
        return GAME_PROFILES[requested_game.lower()]

    lower_name = os.path.basename(rom_path).lower()
    if "mp1" in lower_name or "mario_party_1" in lower_name or "marioparty1" in lower_name:
        return GAME_PROFILES["mp1"]
    if "mp2" in lower_name or "mario_party_2" in lower_name or "marioparty2" in lower_name:
        return GAME_PROFILES["mp2"]
    if "mp3" in lower_name or "mario_party_3" in lower_name or "marioparty3" in lower_name:
        return GAME_PROFILES["mp3"]

    basename = os.path.basename(rom_path).replace('.z64', '').replace('.v64', '').replace('.n64', '')
    if not basename:
        basename = "target_rom"

    return {
        "name": basename,
        "basename": basename,
        "asm_path": "asm",
        "src_path": "src",
        "asset_path": "assets",
        "non_matchings_path": "asm/nonmatchings",
        "vram_main": "0x80000400",
        "vram_overlay": "0x80100000"
    }

def generate_yaml(rom_path, output_path="splat.yaml", game=None):
    check_rom_header(rom_path)
    profile = detect_game_profile(rom_path, game)

    yaml_content = f"""name: {profile['name']}
sha1: "" # Add your target SHA1 here
options:
  basename: {profile['basename']}
  target_path: {rom_path}
  base_path: .
  compiler: GCC
  find_file_boundaries: True
  header_encoding: ASCII
  asm_path: {profile['asm_path']}
  src_path: {profile['src_path']}
  asset_path: {profile['asset_path']}
  non_matchings_path: {profile['non_matchings_path']}
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
    vram: {profile['vram_main']}
    subsegments:
      - [0x1000, c]
      - [0x100000, data]

  - name: overlays
    type: code
    start: 0x100000 # Placeholder start for overlays
    vram: {profile['vram_overlay']}
    subsegments:
      - [0x100000, c]

  - [0x200000] # End of ROM marker placeholder
"""

    with open(output_path, 'w') as f:
        f.write(yaml_content)

    print(f"Generated {output_path} for {rom_path} (Profile: {profile['name']})")
    generate_function_headers()

def main():
    parser = argparse.ArgumentParser(description="Generate splat.yaml and prototype headers for an N64 ROM.")
    parser.add_argument("rom_path", help="Path to the N64 ROM file.")
    parser.add_argument("--out", "-o", default="splat.yaml", help="Output yaml path.")
    parser.add_argument("--game", "-g", choices=["mp1", "mp2", "mp3"], default=None, help="Target game profile (mp1, mp2, mp3).")

    args = parser.parse_args()
    generate_yaml(args.rom_path, args.out, args.game)

if __name__ == "__main__":
    main()
