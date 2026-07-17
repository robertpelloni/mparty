#!/usr/bin/env python3
import os
import subprocess
import shutil
import sys

def run_test(name, setup, teardown, env_vars, expect_success=True):
    print(f"--- Running Test: {name} ---")
    setup()

    env = os.environ.copy()
    if env_vars:
        for k, v in env_vars.items():
            env[k] = v
    else:
        if "LLM_API_KEY" in env:
            del env["LLM_API_KEY"]

    result = subprocess.run(["python3", "tools/ai_loop.py"], capture_output=True, text=True, env=env)

    teardown()

    passed = False
    if expect_success and "[SUCCESS] LLM refactoring achieved a match!" in result.stdout:
        passed = True
    elif not expect_success and "[MISMATCH] LLM refactoring failed to match." in result.stdout:
        passed = True
    elif not expect_success and "Cannot refactor. Skipping." in result.stdout:
        passed = True

    if passed:
        print(f"[OK] Test '{name}' passed.")
        return True
    else:
        print(f"[ERROR] Test '{name}' failed.")
        print(result.stdout)
        return False

def setup_mock_env():
    os.makedirs("src", exist_ok=True)
    os.makedirs("build/expected", exist_ok=True)
    os.makedirs("asm", exist_ok=True)

    with open("src/test.c", "w") as f:
        f.write("int test() { return 0; }")
    with open("build/expected/test.bin", "w") as f:
        f.write("mock binary")
    with open("asm/test.s", "w") as f:
        f.write("mock assembly")

def teardown_mock_env():
    if os.path.exists("src"): shutil.rmtree("src")
    if os.path.exists("build"): shutil.rmtree("build")
    if os.path.exists("asm"): shutil.rmtree("asm")

def mock_matcher_success():
    if os.path.exists("tools/ai_matcher.py"): os.rename("tools/ai_matcher.py", "tools/ai_matcher.py.bak")
    with open("tools/ai_matcher.py", "w") as f:
        f.write("#!/usr/bin/env python3\n")
        f.write("import sys\n")
        f.write("sys.exit(0)\n")

def mock_matcher_fail_then_success():
    if os.path.exists("tools/ai_matcher.py"): os.rename("tools/ai_matcher.py", "tools/ai_matcher.py.bak")
    with open("tools/ai_matcher.py", "w") as f:
        f.write("#!/usr/bin/env python3\n")
        f.write("import sys\n")
        f.write("with open(sys.argv[1], 'r') as f:\n")
        f.write("    if 'return 1;' in f.read():\n")
        f.write("        sys.exit(0)\n")
        f.write("sys.exit(1)\n")

def mock_matcher_always_fail():
    if os.path.exists("tools/ai_matcher.py"): os.rename("tools/ai_matcher.py", "tools/ai_matcher.py.bak")
    with open("tools/ai_matcher.py", "w") as f:
        f.write("#!/usr/bin/env python3\n")
        f.write("import sys\n")
        f.write("sys.exit(1)\n")

def restore_matcher():
    if os.path.exists("tools/ai_matcher.py"): os.remove("tools/ai_matcher.py")
    if os.path.exists("tools/ai_matcher.py.bak"): os.rename("tools/ai_matcher.py.bak", "tools/ai_matcher.py")

def main():
    print("Testing ai_loop.py integration...\n")

    passed = 0
    total = 0

    def setup_success():
        setup_mock_env()
        mock_matcher_fail_then_success()

    def teardown_all():
        teardown_mock_env()
        restore_matcher()

    def setup_no_key():
        setup_mock_env()
        mock_matcher_fail_then_success()

    def setup_always_fail():
        setup_mock_env()
        mock_matcher_always_fail()

    tests = [
        ("LLM Refactoring Success", setup_success, teardown_all, {"LLM_API_KEY": "MOCK_KEY"}, True),
        ("LLM Missing API Key Graceful Failure", setup_no_key, teardown_all, None, False),
        ("LLM Refactoring Persistent Failure", setup_always_fail, teardown_all, {"LLM_API_KEY": "MOCK_KEY"}, False)
    ]

    for name, setup, teardown, env, expects in tests:
        total += 1
        if run_test(name, setup, teardown, env, expects):
            passed += 1

    print(f"\nCompleted: {passed}/{total} tests passed.")
    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    main()
