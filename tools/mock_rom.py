#!/usr/bin/env python3
"""
mock_rom.py

Generates a dummy 4MB N64 ROM file (.z64) with basic header bytes and padding.
This allows the decompilation pipeline (splat) to be tested autonomously without
requiring a legally problematic copyrighted ROM file.
"""

import sys
import os
import argparse

# Standard N64 ROM size for simple tests (4 Megabytes)
ROM_SIZE = 4 * 1024 * 1024

def generate_mock_rom(output_path):
    print(f"Generating mock ROM at: {output_path}")

    # N64 ROMs start with a header containing a specific magic word
    # 0x80371240 is the standard big-endian N64 magic word (PI BSB DOM1 LAT REG)
    header_magic = b'\x80\x37\x12\x40'

    # Create the buffer and fill with nop instructions (0x00000000 in MIPS)
    # Actually, let's use 0xFF padding after the 4KB header space.
    buffer = bytearray(ROM_SIZE)

    # Write magic to start
    buffer[0:4] = header_magic

    # Mock bootcode area
    # Put a mock MIPS instruction around 0x1000 so spimdisasm has something to hit.
    # jr ra (return) is 0x03E00008
    mips_jr_ra = b'\x03\xE0\x00\x08'
    buffer[0x1000:0x1004] = mips_jr_ra

    with open(output_path, 'wb') as f:
        f.write(buffer)

    print(f"Successfully wrote {ROM_SIZE} bytes to {output_path}.")

def main():
    parser = argparse.ArgumentParser(description="Generate a mock N64 .z64 ROM file.")
    parser.add_argument("--out", "-o", default="tests/roms/mock_mario_party.z64", help="Output path for the dummy ROM.")

    args = parser.parse_args()

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    generate_mock_rom(args.out)

if __name__ == "__main__":
    main()
