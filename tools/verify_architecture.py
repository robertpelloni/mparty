#!/usr/bin/env python3
"""
verify_architecture.py

Final Phase 1 Scaffolding Verification Script.
This script checks the repository to ensure all directories and files
required by the Mario Party WebEngine specifications have been generated
and exist in their correct relative paths.
"""

import os
import sys

def main():
    print("=== Mario Party WebEngine Architecture Verification ===")

    required_dirs = [
        "tools",
        "web",
        "web/src/lib",
        "web/src/components",
        "web/src/app/api/roms",
        "tests/roms",
        "assets"
    ]

    required_files = [
        "ROADMAP.md",
        "HANDOFF.md",
        "TODO.md",
        "VISION.md",
        "CHANGELOG.md",
        "VERSION.md",
        "Makefile",
        "tools/generate_splat.py",
        "tools/disassemble.py",
        "tools/c_stubber.js",
        "tools/texture_converter.py",
        "tools/iso_extractor.py",
        "tools/ai_matcher.py",
        "tools/ai_loop.py",
        "tools/mock_rom.py",
        "tools/test_pipeline.py",
        "tools/mparty_cli.py",
        "web/src/lib/EmulationCore.ts",
        "web/src/lib/Fast3DTranslator.ts",
        "web/src/lib/InputManager.ts",
        "web/src/lib/AudioManager.ts",
        "web/src/lib/SaveStateManager.ts",
        "web/src/lib/NetplayManager.ts",
        "web/src/components/GameSelector.tsx",
        "web/src/app/api/roms/route.ts"
    ]

    errors = 0

    for d in required_dirs:
        if not os.path.isdir(d):
            print(f"[FAIL] Missing directory: {d}")
            errors += 1
        else:
            print(f"[OK]   Directory found: {d}")

    for f in required_files:
        if not os.path.isfile(f):
            print(f"[FAIL] Missing file: {f}")
            errors += 1
        else:
            print(f"[OK]   File found: {f}")

    if errors > 0:
        print(f"\nVerification FAILED. {errors} components are missing.")
        sys.exit(1)
    else:
        print("\nVerification PASSED. All Phase 1 scaffolding components exist.")
        sys.exit(0)

if __name__ == "__main__":
    main()
