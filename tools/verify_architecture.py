#!/usr/bin/env python3
"""
verify_architecture.py

Strictly asserts the existence and integrity of all required directories and core files
to validate the structural scaffolding of the N64 decompilation pipeline.
"""

import os
import sys

REQUIRED_FILES = [
    "VISION.md",
    "ROADMAP.md",
    "TODO.md",
    "MEMORY.md",
    "DEPLOY.md",
    "IDEAS.md",
    "CHANGELOG.md",
    "VERSION.md",
    "HANDOFF.md",
    "Makefile",
    "tools/generate_splat.py",
    "tools/disassemble.py",
    "tools/c_stubber.js"
]

REQUIRED_DIRECTORIES = [
    "tools"
]

def verify_architecture():
    missing_items = []

    for directory in REQUIRED_DIRECTORIES:
        if not os.path.isdir(directory):
            missing_items.append(f"Directory: {directory}")
            print(f"[FAIL] Missing required directory: {directory}")
        else:
            print(f"[OK] Directory exists: {directory}")

    for file in REQUIRED_FILES:
        if not os.path.isfile(file):
            missing_items.append(f"File: {file}")
            print(f"[FAIL] Missing required file: {file}")
        else:
            print(f"[OK] File exists: {file}")

    if missing_items:
        print("\nArchitecture verification FAILED. Missing components:")
        for item in missing_items:
            print(f"  - {item}")
        sys.exit(1)
    else:
        print("\nArchitecture verification PASSED. All core files and directories are present.")
        sys.exit(0)

if __name__ == "__main__":
    verify_architecture()
