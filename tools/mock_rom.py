#!/usr/bin/env python3
"""
generate_advanced_mock_rom.py

Generates a structural 4MB N64 ROM file (.z64) populated with valid MIPS III
opcodes representing mocked Mario Party engine functions (e.g., board logic, minigame ticks).
This bypasses copyright restrictions while providing the continuous AI decompilation
loop (ai_loop.py) with actual logical blocks to ingest, parse, and match.
"""

import sys
import os
import argparse
import struct

ROM_SIZE = 4 * 1024 * 1024

def write_mips_instruction(buffer, offset, opcode):
    """Packs a 32-bit integer opcode into the buffer as big-endian."""
    struct.pack_into(">I", buffer, offset, opcode)

def generate_mock_rom(output_path):
    print(f"Generating advanced mock ROM at: {output_path}")

    buffer = bytearray(ROM_SIZE)

    # Standard big-endian N64 magic word (PI BSB DOM1 LAT REG)
    buffer[0:4] = b'\x80\x37\x12\x40'

    # ---------------------------------------------------------
    # MOCK BLOCK 1: Boot Sequence (0x40 - 0x1000)
    # ---------------------------------------------------------
    write_mips_instruction(buffer, 0x40, 0x3C088000) # lui t0, 0x8000
    write_mips_instruction(buffer, 0x44, 0x35080400) # ori t0, t0, 0x0400
    write_mips_instruction(buffer, 0x48, 0x01000008) # jr t0
    write_mips_instruction(buffer, 0x4C, 0x00000000) # nop

    # ---------------------------------------------------------
    # MOCK BLOCK 2: Board State Tick (0x1000)
    # Target for ai_matcher.py tests
    # ---------------------------------------------------------
    # func_80000400 (Simple Return)
    write_mips_instruction(buffer, 0x1000, 0x03E00008) # jr ra
    write_mips_instruction(buffer, 0x1004, 0x00000000) # nop

    # func_80000408 (Add two arguments)
    write_mips_instruction(buffer, 0x1008, 0x00851020) # add v0, a0, a1
    write_mips_instruction(buffer, 0x100C, 0x03E00008) # jr ra
    write_mips_instruction(buffer, 0x1010, 0x00000000) # nop

    # ---------------------------------------------------------
    # MOCK BLOCK 3: Overlays / Minigame Logic (0x100000)
    # ---------------------------------------------------------
    # func_80100000
    write_mips_instruction(buffer, 0x100000, 0x27BDFFF8) # addiu sp, sp, -8
    write_mips_instruction(buffer, 0x100004, 0xAFBF0004) # sw ra, 4(sp)
    write_mips_instruction(buffer, 0x100008, 0x8FBF0004) # lw ra, 4(sp)
    write_mips_instruction(buffer, 0x10000C, 0x27BD0008) # addiu sp, sp, 8
    write_mips_instruction(buffer, 0x100010, 0x03E00008) # jr ra
    write_mips_instruction(buffer, 0x100014, 0x00000000) # nop

    with open(output_path, 'wb') as f:
        f.write(buffer)

    print(f"Successfully wrote {ROM_SIZE} bytes of structured MIPS data to {output_path}.")

def main():
    parser = argparse.ArgumentParser(description="Generate a structurally sound mock N64 .z64 ROM file.")
    parser.add_argument("--out", "-o", default="tests/roms/mock_mario_party.z64", help="Output path for the dummy ROM.")

    args = parser.parse_args()

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    generate_mock_rom(args.out)

if __name__ == "__main__":
    main()
