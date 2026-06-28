#!/usr/bin/env python3
"""
iso_extractor.py

Boilerplate script for handling GameCube/Wii ISO filesystem extraction.
Mario Party 4-9 rely heavily on .rel (relocatable modules) and .szs (compressed archives).
This tool serves as the orchestration stub to parse a target ISO and dump these
files into the assets/ directory for further decompilation processing.
"""

import sys
import os
import argparse

def parse_iso_filesystem(iso_path, out_dir):
    """
    Simulates parsing the FST (File System Table) of a Nintendo optical disc format.
    """
    print(f"ISO Extractor: Analyzing optical disc image '{iso_path}'...")

    # In a full implementation, this would read the magic word (e.g. 0xC2339F3D for GC)
    # and walk the FST nodes to extract raw data blocks.

    os.makedirs(out_dir, exist_ok=True)

    print("ISO Extractor: [MOCK] Extracting root filesystem...")
    print(f"ISO Extractor: [MOCK] Found main.dol at offset 0x00000420")
    print(f"ISO Extractor: [MOCK] Found board_data.szs at offset 0x00A04000")

    # Create mock dummy files to simulate extraction
    mock_dol = os.path.join(out_dir, "main.dol")
    mock_szs = os.path.join(out_dir, "board_data.szs")

    with open(mock_dol, 'wb') as f:
        f.write(b'\x00' * 1024)
    with open(mock_szs, 'wb') as f:
        f.write(b'\x00' * 1024)

    print(f"ISO Extractor: Dumped files to {out_dir}")

def main():
    parser = argparse.ArgumentParser(description="Extract GameCube/Wii ISOs for Mario Party decompilation.")
    parser.add_argument("iso_path", help="Path to the target .iso or .gcz file.")
    parser.add_argument("--out", "-o", default="assets/gc_extracted", help="Output directory for extracted files.")

    args = parser.parse_args()

    # For the mock implementation, we don't strictly enforce file existence to allow easy dummy testing
    # if not os.path.exists(args.iso_path):
    #     print(f"Error: ISO file {args.iso_path} not found.")
    #     sys.exit(1)

    parse_iso_filesystem(args.iso_path, args.out)

if __name__ == "__main__":
    main()
