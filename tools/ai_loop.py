#!/usr/bin/env python3
"""
ai_loop.py

This script represents the 'Continuous Autonomous Execution' harness.
It recursively scans the src/ directory for decompiled C files, locates their
corresponding target MIPS assembly in asm/, and initiates the ai_matcher loop.
In a full implementation, this script would make API calls to an LLM to automatically
rewrite the C file upon receiving a mismatch, looping until a match is confirmed.
"""

import os
import sys
import glob
import subprocess

def find_target_assembly(c_file_path):
    """
    Given a C file like 'src/nonmatchings/1000/func_80000400.c',
    attempts to find the corresponding 'asm/nonmatchings/1000/func_80000400.s'
    """
    # Simple substitution based on the standard project directory layout
    if not c_file_path.startswith("src/"):
        return None

    s_file_path = c_file_path.replace("src/", "asm/", 1).replace(".c", ".s")

    if os.path.exists(s_file_path):
        return s_file_path
    return None

def process_file(c_file, s_file):
    """
    Orchestrates the matcher. If it fails, this is where the LLM prompt loop would trigger.
    """
    print(f"\n[AI Loop] Evaluating: {c_file}")

    # Run the matcher
    cmd = ["python3", "tools/ai_matcher.py", c_file, s_file]
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        print("  -> Status: MATCHED. Skipping LLM rewrite.")
    else:
        print("  -> Status: MISMATCH.")
        print("  -> [MOCK] Triggering LLM context window with C source and target assembly...")
        print("  -> [MOCK] Receiving updated C source from LLM...")
        print("  -> [MOCK] Saving updated source and looping (simulated exit).")

def main():
    print("=== Continuous Autonomous Decompilation Loop ===")

    src_dir = "src"
    if not os.path.exists(src_dir):
        print(f"Error: Directory {src_dir} not found.")
        sys.exit(1)

    c_files = glob.glob(os.path.join(src_dir, "**/*.c"), recursive=True)
    if not c_files:
        print(f"No .c files found in {src_dir} to process.")
        sys.exit(0)

    print(f"Found {len(c_files)} C files to evaluate.")

    for c_file in c_files:
        s_file = find_target_assembly(c_file)
        if s_file:
            process_file(c_file, s_file)
        else:
            print(f"  -> Warning: No target assembly found for {c_file}. Skipping.")

    print("\n=== AI Loop Iteration Complete ===")

if __name__ == "__main__":
    main()
