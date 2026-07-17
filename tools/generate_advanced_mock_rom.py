#!/usr/bin/env python3
"""
generate_advanced_mock_rom.py

Generates advanced dummy ROMs with valid MIPS opcodes (e.g. for Mario Party testing)
to bypass legal issues with committing or distributing copyrighted N64 .z64 ROM files
while providing testable logic blocks.
"""

import sys
import argparse

# Some basic valid MIPS opcodes to construct a mock ROM
# nop: 0x00 0x00 0x00 0x00
NOP = b'\x00\x00\x00\x00'
# jr ra: 0x03 0xe0 0x00 0x08
JR_RA = b'\x03\xe0\x00\x08'
# addiu sp, sp, -24: 0x27 0xbd 0xff 0xe8
ADDIU_SP = b'\x27\xbd\xff\xe8'

def generate_mock_rom(output_path, size_mb=1):
    size_bytes = size_mb * 1024 * 1024

    print(f"Generating mock ROM at {output_path} with size {size_mb} MB...")

    with open(output_path, 'wb') as f:
        # Header block
        f.write(b'\x80\x37\x12\x40')
        f.write(b'\x00' * 0x3C)

        # Boot chunk
        f.write(NOP * 16)
        f.write(JR_RA)
        f.write(NOP * 15)

        # Code chunk
        f.write(ADDIU_SP)
        f.write(NOP * 8)
        f.write(JR_RA)
        f.write(NOP * 7)

        # Fill the rest with NOPs to reach the desired size
        current_size = f.tell()
        remaining_size = size_bytes - current_size

        if remaining_size > 0:
            # Write in blocks to be efficient
            block_size = 4096
            nop_block = NOP * (block_size // 4)
            for _ in range(remaining_size // block_size):
                f.write(nop_block)

            # Write any remainder
            f.write(NOP * ((remaining_size % block_size) // 4))

    print("Mock ROM generated successfully.")

def main():
    parser = argparse.ArgumentParser(description="Generate a mock N64 ROM for testing.")
    parser.add_argument("--out", "-o", default="baserom.z64", help="Output file path.")
    parser.add_argument("--size", "-s", type=int, default=1, help="Size of the mock ROM in MB.")

    args = parser.parse_args()
    generate_mock_rom(args.out, args.size)

if __name__ == "__main__":
    main()
