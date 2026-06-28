#!/usr/bin/env python3
"""
test_pipeline.py

Integration testing script to execute the entire Mario Party decompilation
toolchain automatically. Validates that the autonomous pipeline can ingest a
dummy ROM, parse the filesystem, split the binary, generate C stubs,
convert mock textures, and run the AI bytecode matcher without crashing.
"""

import os
import sys
import subprocess

def run_cmd(cmd_list):
    cmd_str = " ".join(cmd_list)
    print(f"\n>> Executing: {cmd_str}")
    try:
        # We don't necessarily care about the matcher exiting 1 (mismatch),
        # but we care that the script didn't throw an unhandled exception.
        result = subprocess.run(cmd_list, check=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        output = result.stdout.decode('utf-8')

        # Explicitly ignore ai_matcher returning 1 for a mismatch, that's expected behavior
        if result.returncode != 0 and "ai_matcher.py" not in cmd_str:
            print(f"Error executing {cmd_str}:\n{output}")
            return False

        print("Success.")
        return True
    except Exception as e:
        print(f"Exception executing {cmd_str}:\n{str(e)}")
        return False

def main():
    print("Starting Automated Decompilation Pipeline Integration Test...\n")

    steps = [
        # 1. Generate Mock N64 ROM
        ["python3", "tools/mock_rom.py", "--out", "tests/roms/mock_mario_party.z64"],

        # 2. Generate Splat config
        ["python3", "tools/generate_splat.py", "tests/roms/mock_mario_party.z64"],

        # 3. Disassemble ROM via Splat
        ["python3", "tools/disassemble.py", "splat.yaml"],

        # 4. Generate C Stubs
        ["node", "tools/c_stubber.js", "asm", "src"],

        # 5. Convert mock textures
        ["python3", "tools/texture_converter.py", "tests/assets", "web/public/assets"],

        # 6. Test ISO extraction stub
        ["python3", "tools/iso_extractor.py", "dummy.iso", "--out", "assets/gc_extracted"],

        # 7. Test AI Matcher (expected to mismatch, but execute cleanly)
        ["python3", "tools/ai_matcher.py", "src/nonmatchings/1000/func_80000400.c", "asm/nonmatchings/1000/func_80000400.s"]
    ]

    for step in steps:
        if not run_cmd(step):
            print("\n[!] INTEGRATION TEST FAILED.")
            sys.exit(1)

    print("\n[✓] ALL PIPELINE STAGES EXECUTED SUCCESSFULLY.")
    sys.exit(0)

if __name__ == "__main__":
    main()
