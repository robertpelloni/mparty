#!/usr/bin/env python3
"""
test_pipeline.py

Automates end-to-end integration testing of the decompilation toolchain.
It dynamically generates required mock directories, assets, and ROMs on-the-fly
to avoid committing static binaries to version control, testing ROM generation,
splat config generation, non-matching section extraction, and intelligent C stubbing.
"""

import os
import subprocess
import sys
import shutil

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

    # 2. Validation Layer Tests
    run_step("Test Validation Layer", "python3 tools/test_validation_layer.py")

    # 3. AI Loop Matcher Tests
    run_step("Test AI Loop", "python3 tools/test_ai_loop.py")

    # 4. Intelligent C Stubber Pattern Tests
    run_step("Test C Stubber", "node tools/test_c_stubber.js")

    # 5. Generate Mock ROM
    run_step("Generate Mock ROM", "python3 tools/generate_advanced_mock_rom.py --out test_baserom.z64 --size 1")

    # 6. Generate Splat Yaml
    run_step("Generate Splat config", "python3 tools/generate_splat.py test_baserom.z64 --out test_splat.yaml")

    # Check if yaml was created
    if not os.path.exists("test_splat.yaml"):
        print("[ERROR] Splat config not found!")
        sys.exit(1)

    # 7. Disassembly & Stubbing Verification
    run_step("Check c_stubber syntax", "node -c tools/c_stubber.js")
    run_step("Check disassemble syntax", "python3 -m py_compile tools/disassemble.py")

    # 8. End-to-End Mock Disassembly & Intelligent Stub Generation
    print("--- Running End-to-End Disassembly and Intelligent Stubbing ---")
    os.makedirs("asm/test_module", exist_ok=True)
    with open("asm/test_module/mock_code.s", "w") as f:
        f.write("glabel mock_func_1\n")
        f.write("    addiu $sp, $sp, -0x18\n")
        f.write("    lw $t0, 0($a0)\n")
        f.write("    addu $v0, $t0, $a1\n")
        f.write("    jr $ra\n")
        f.write("    nop\n")

    # Test nonmatching extraction and intelligent stub generation
    subprocess.run(["python3", "tools/disassemble.py", "test_splat.yaml"], check=True)
    subprocess.run(["node", "tools/c_stubber.js", "asm", "src"], check=True)

    # Verify generated C stub (placed under src/test_module/mock_code.c)
    c_stub_path = "src/test_module/mock_code.c"
    if not os.path.exists(c_stub_path):
        print(f"[ERROR] Generated C stub '{c_stub_path}' was not found!")
        sys.exit(1)

    with open(c_stub_path, "r") as f:
        c_content = f.read()

    if "s32 mock_func_1" not in c_content or "void* a0" not in c_content:
        print("[ERROR] Generated C stub does not contain expected intelligent typed signature!")
        print(c_content)
        sys.exit(1)

    print("[OK] End-to-End Disassembly and Intelligent Stubbing verified successfully.\n")

    # Cleanup test artifacts
    print("Cleaning up test artifacts...")
    if os.path.exists("test_baserom.z64"): os.remove("test_baserom.z64")
    if os.path.exists("test_splat.yaml"): os.remove("test_splat.yaml")
    if os.path.exists("asm/test_module"): shutil.rmtree("asm/test_module")
    if os.path.exists("asm/nonmatchings"): shutil.rmtree("asm/nonmatchings")
    if os.path.exists("src/test_module"): shutil.rmtree("src/test_module")

    print("\nIntegration test pipeline completed successfully.")

if __name__ == "__main__":
    main()
