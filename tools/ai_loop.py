#!/usr/bin/env python3
"""
ai_loop.py

Continuous orchestration script to recursively scan for non-matching decompiled C files,
locate their target MIPS assembly, and run the ai_matcher.py harness.
Uses urllib to make HTTP requests to an external LLM API for automated refactoring
when the LLM_API_KEY environment variable is present.
"""

import os
import sys
import json
import urllib.request
import urllib.error
import subprocess
import argparse

def call_llm_api(prompt, api_key):
    """Makes an HTTP request to an external LLM API."""
    # Placeholder for actual API endpoint, we will mock the behavior if not available
    url = "https://api.openai.com/v1/chat/completions" # Example endpoint

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    data = {
        "model": "gpt-4", # Example model
        "messages": [
            {"role": "system", "content": "You are an expert C decompilation AI. Your goal is to rewrite the provided C function so its compiled MIPS assembly exactly matches the provided target assembly."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['choices'][0]['message']['content']
    except urllib.error.URLError as e:
        print(f"API request failed: {e}")
        return None

def find_c_files(src_dir):
    """Recursively finds all .c files in the source directory."""
    c_files = []
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.c'):
                c_files.append(os.path.join(root, file))
    return c_files

def process_file(c_file, api_key):
    """Processes a single C file by attempting to match it, and invoking the LLM if it fails."""
    # In a real scenario, we'd find the corresponding target .text bin
    # For now, we simulate the behavior
    base_name = os.path.splitext(os.path.basename(c_file))[0]
    target_bin = os.path.join("build", "expected", f"{base_name}.bin")

    print(f"Processing: {c_file}")

    # Check if target binary exists
    if not os.path.exists(target_bin):
        print(f"  Target binary {target_bin} not found. Skipping.")
        return False

    # Run the matcher
    cmd = ["python3", "tools/ai_matcher.py", c_file, target_bin]
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        print("  [SUCCESS] Match already achieved.")
        return True

    print("  [MISMATCH] Invoking LLM for refactoring...")

    if not api_key:
        print("  LLM_API_KEY not set. Cannot refactor. Skipping.")
        return False

    # Read the current C code and the target assembly (mocking reading assembly)
    with open(c_file, 'r') as f:
        c_code = f.read()

    asm_file = os.path.join("asm", f"{base_name}.s")
    asm_code = ""
    if os.path.exists(asm_file):
        with open(asm_file, 'r') as f:
            asm_code = f.read()

    prompt = f"Target Assembly:\n```mips\n{asm_code}\n```\n\nCurrent C Code:\n```c\n{c_code}\n```\n\nPlease provide the corrected C code."

    new_code = call_llm_api(prompt, api_key)

    if new_code:
        # Simplistic extraction of C code from markdown block
        if "```c" in new_code:
            new_code = new_code.split("```c")[1].split("```")[0].strip()

        print("  Applying LLM suggestions...")
        with open(c_file, 'w') as f:
            f.write(new_code)

        # Re-test
        print("  Re-testing match...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print("  [SUCCESS] LLM refactoring achieved a match!")
            return True
        else:
            print("  [MISMATCH] LLM refactoring failed to match.")
            return False
    else:
        print("  Failed to get a response from the LLM.")
        return False

def main():
    parser = argparse.ArgumentParser(description="Continuous AI Loop for decompilation matching.")
    parser.add_argument("--src", default="src", help="Directory containing source C files.")

    args = parser.parse_args()
    api_key = os.environ.get("LLM_API_KEY")

    if not api_key:
        print("Warning: LLM_API_KEY environment variable is not set. Refactoring will be skipped.")

    if not os.path.exists(args.src):
        print(f"Source directory {args.src} does not exist.")
        sys.exit(1)

    c_files = find_c_files(args.src)
    print(f"Found {len(c_files)} C files to process.")

    success_count = 0
    for c_file in c_files:
        if process_file(c_file, api_key):
            success_count += 1

    print(f"\nAI Loop complete. Successfully matched: {success_count}/{len(c_files)}")

if __name__ == "__main__":
    main()
