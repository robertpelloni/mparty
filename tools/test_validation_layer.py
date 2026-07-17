#!/usr/bin/env python3
"""
test_validation_layer.py

Test suite that specifically targets the validation layer's failure modes.
"""
import os
import subprocess
import sys
import shutil

def run_test(name, setup_func, verify_command, expected_code=1, expect_in_stdout=None, expect_in_stderr=None):
    print(f"--- Running Test: {name} ---")
    if setup_func: setup_func()

    result = subprocess.run(verify_command, shell=True, capture_output=True, text=True)

    passed = True
    if result.returncode != expected_code:
        print(f"[ERROR] Test '{name}' failed. Expected code {expected_code}, got {result.returncode}")
        passed = False

    if expect_in_stdout and expect_in_stdout not in result.stdout:
        print(f"[ERROR] Test '{name}' failed. Expected output '{expect_in_stdout}' not found in stdout.")
        passed = False

    if expect_in_stderr and expect_in_stderr not in result.stderr:
        print(f"[ERROR] Test '{name}' failed. Expected stderr '{expect_in_stderr}' not found in stderr.")
        passed = False

    if passed:
        print(f"[OK] Test '{name}' passed.")
    else:
        print("STDOUT:")
        print(result.stdout)
        print("STDERR:")
        print(result.stderr)

    return passed

def setup_missing_multiple_files():
    if os.path.exists("VISION.md"): os.rename("VISION.md", "VISION.md.bak")
    if os.path.exists("ROADMAP.md"): os.rename("ROADMAP.md", "ROADMAP.md.bak")

def teardown_missing_multiple_files():
    if os.path.exists("VISION.md.bak"): os.rename("VISION.md.bak", "VISION.md")
    if os.path.exists("ROADMAP.md.bak"): os.rename("ROADMAP.md.bak", "ROADMAP.md")

def setup_empty_file():
    if os.path.exists("VISION.md"): os.rename("VISION.md", "VISION.md.bak")
    with open("VISION.md", "w") as f:
        pass

def teardown_empty_file():
    if os.path.exists("VISION.md"): os.remove("VISION.md")
    if os.path.exists("VISION.md.bak"): os.rename("VISION.md.bak", "VISION.md")

def setup_unreadable_file():
    if os.path.exists("VISION.md"): os.chmod("VISION.md", 0o000)

def teardown_unreadable_file():
    if os.path.exists("VISION.md"): os.chmod("VISION.md", 0o644)

def setup_directory_as_file():
    if os.path.exists("VISION.md"): os.rename("VISION.md", "VISION.md.bak")
    os.mkdir("VISION.md")

def teardown_directory_as_file():
    if os.path.exists("VISION.md") and os.path.isdir("VISION.md"):
        os.rmdir("VISION.md")
    if os.path.exists("VISION.md.bak"): os.rename("VISION.md.bak", "VISION.md")

def setup_file_as_directory():
    if os.path.exists("tools") and os.path.isdir("tools"):
        shutil.move("tools", "tools.bak")
    with open("tools", "w") as f:
        f.write("I am a file now")

    # We also need a fake verify_architecture.py to be able to run it,
    # or just expect python3 to fail.
    # We will test the architecture script from another location.

    os.mkdir("temp_tools")
    shutil.copy("tools.bak/verify_architecture.py", "temp_tools/")

def teardown_file_as_directory():
    if os.path.exists("temp_tools"):
        shutil.rmtree("temp_tools")
    if os.path.exists("tools") and os.path.isfile("tools"):
        os.remove("tools")
    if os.path.exists("tools.bak"):
        shutil.move("tools.bak", "tools")


def main():
    print("Starting Validation Layer tests...\n")
    passed = 0
    total = 0

    tests = [
        ("Missing Multiple Files", setup_missing_multiple_files, teardown_missing_multiple_files, "python3 tools/verify_architecture.py", 1, "Missing required file: VISION.md", None),
        ("Empty File Handling", setup_empty_file, teardown_empty_file, "python3 tools/verify_architecture.py", 1, "File is empty: VISION.md", None),
        ("Unreadable File Handling", setup_unreadable_file, teardown_unreadable_file, "python3 tools/verify_architecture.py", 1, "File is unreadable: VISION.md", None),
        ("Directory as File Handling", setup_directory_as_file, teardown_directory_as_file, "python3 tools/verify_architecture.py", 1, "Expected file, found directory: VISION.md", None),
        ("File as Directory Handling", setup_file_as_directory, teardown_file_as_directory, "python3 temp_tools/verify_architecture.py", 1, "Expected directory, found file: tools", None),
    ]

    for name, setup, teardown, cmd, expected_code, expect_stdout, expect_stderr in tests:
        total += 1
        if run_test(name, setup, cmd, expected_code, expect_stdout, expect_stderr):
            passed += 1
        teardown()

    print(f"\nCompleted: {passed}/{total} tests passed.")
    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    main()
