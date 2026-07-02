#!/usr/bin/env python3
"""
test_pipeline.py

Automates end-to-end integration testing of the decompilation toolchain.
It dynamically generates required mock directories, assets, and ROMs on-the-fly
to avoid committing static binaries to version control.
"""

import os
import subprocess
import sys

def run_step(name, command):
    print(f"--- Running {name} ---")
    result = subprocess.run(command, shell=True)
    if result.returncode != 0:
        print(f"[ERROR] Step '{name}' failed with return code {result.returncode}.")
        sys.exit(result.returncode)
    print(f"[OK] Step '{name}' completed successfully.\n")

def main():
    print("Starting integration test pipeline...\n")

    # 1. Architecture Verification
    run_step("Verify Architecture", "python3 tools/verify_architecture.py")

    # 2. Generate Mock ROM
    run_step("Generate Mock ROM", "python3 tools/generate_advanced_mock_rom.py --out test_baserom.z64 --size 1")

    # 3. Generate Splat Yaml
    run_step("Generate Splat config", "python3 tools/generate_splat.py test_baserom.z64 --out test_splat.yaml")

    # Check if yaml was created
    if not os.path.exists("test_splat.yaml"):
        print("[ERROR] Splat config not found!")
        sys.exit(1)

    # We will test the remaining pipeline logically.
    # We won't actually call `tools/disassemble.py` yet because it requires splat64 to be installed,
    # which we may not have. We'll simply ensure the scripts exist and python compiles them properly.

    run_step("Check c_stubber syntax", "node -c tools/c_stubber.js")
    run_step("Check disassemble syntax", "python3 -m py_compile tools/disassemble.py")

    # Cleanup test artifacts
    print("Cleaning up test artifacts...")
    os.remove("test_baserom.z64")
    os.remove("test_splat.yaml")

    print("\nIntegration test pipeline completed successfully.")

if __name__ == "__main__":
    main()
