#!/usr/bin/env python3
import os
import subprocess
import shutil

def main():
    print("Testing ai_loop.py integration...")

    # Create mock environment
    os.makedirs("src", exist_ok=True)
    os.makedirs("build/expected", exist_ok=True)
    os.makedirs("asm", exist_ok=True)

    with open("src/test.c", "w") as f:
        f.write("int test() { return 0; }")
    with open("build/expected/test.bin", "w") as f:
        f.write("mock binary")
    with open("asm/test.s", "w") as f:
        f.write("mock assembly")

    # We also need to mock ai_matcher.py returning failure so it triggers the LLM logic
    os.rename("tools/ai_matcher.py", "tools/ai_matcher.py.bak")
    with open("tools/ai_matcher.py", "w") as f:
        f.write("#!/usr/bin/env python3\n")
        f.write("import sys\n")
        # Check if the code has been updated by the LLM mock
        f.write("with open(sys.argv[1], 'r') as f:\n")
        f.write("    if 'return 1;' in f.read():\n")
        f.write("        sys.exit(0)\n")
        f.write("sys.exit(1)\n")

    os.environ["LLM_API_KEY"] = "MOCK_KEY"

    result = subprocess.run(["python3", "tools/ai_loop.py"], capture_output=True, text=True)

    # Restore the matcher
    os.remove("tools/ai_matcher.py")
    os.rename("tools/ai_matcher.py.bak", "tools/ai_matcher.py")

    # Cleanup
    shutil.rmtree("src")
    shutil.rmtree("build")
    shutil.rmtree("asm")

    if "[SUCCESS] LLM refactoring achieved a match!" in result.stdout:
        print("[OK] ai_loop.py LLM refactoring loop succeeded.")
    else:
        print("[FAIL] LLM logic failed.")
        print(result.stdout)
        exit(1)

if __name__ == "__main__":
    main()
