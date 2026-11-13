#!/usr/bin/env python3
"""
ai_loop.py

Continuous orchestration script to recursively scan for non-matching decompiled C files,
locate their target MIPS assembly, and run the ai_matcher.py harness.
Uses urllib to make HTTP requests to an external LLM API for automated refactoring
when the LLM_API_KEY environment variable is present. Features iterative self-correction
by feeding compilation, binary hash diffs, and structured assembly diffs back into
the prompt loop up to a configurable max retries. Implements temperature stepping,
diff scoring to retain best candidates, and records matching patterns to build/decomp_rules.json.
"""

import os
import sys
import json
import urllib.request
import urllib.error
import subprocess
import argparse

RULES_CACHE_FILE = os.path.join("build", "decomp_rules.json")

def load_decomp_rules():
    """Loads learned decompilation rules/patterns from disk."""
    if os.path.exists(RULES_CACHE_FILE):
        try:
            with open(RULES_CACHE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_decomp_rule(func_name, pattern_rule):
    """Saves a learned decompilation pattern rule."""
    os.makedirs(os.path.dirname(RULES_CACHE_FILE), exist_ok=True)
    rules = load_decomp_rules()
    rules[func_name] = pattern_rule
    try:
        with open(RULES_CACHE_FILE, "w") as f:
            json.dump(rules, f, indent=2)
    except Exception as e:
        print(f"Failed to save decomp rule: {e}")

def call_llm_api(prompt, api_key, api_url=None, temperature=0.2):
    """Makes an HTTP request to an external LLM API or mock endpoint."""
    # For testing, we mock the LLM response if the API key is "MOCK_KEY"
    if api_key == "MOCK_KEY":
        if "structured_diff_correction" in prompt:
            return "```c\nint test() { /* structured_diff_applied */ return 1; }\n```"
        if "retry_step needed" in prompt:
            return "```c\nint test() { /* retry_step */ return 1; }\n```"
        if "test" in prompt:
            return "```c\nint test() { return 1; }\n```"
        return "```c\n// mock logic\n```"

    url = "https://api.openai.com/v1/chat/completions" # Example endpoint

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    data = {
        "model": "gpt-4", # Example model
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert C decompilation AI. Your goal is to rewrite the provided "
                    "C function so its compiled MIPS assembly exactly matches the provided target assembly. "
                    "Incorporate any compiler errors, binary hash differences, or structured assembly diffs "
                    "provided to iteratively converge to a byte-matching output."
                )
            },
            {"role": "user", "content": prompt}
        ],
        "temperature": temperature
    }

    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['choices'][0]['message']['content']
    except urllib.error.URLError as e:
        print(f"API request failed: {e}")
        return None

def calculate_diff_score(output_text):
    """
    Computes a mismatch penalty score from assembly diff output.
    Lower score represents closer match to target assembly.
    """
    penalty = 0
    in_diff = False
    for line in output_text.splitlines():
        if "--- [ASSEMBLY DIFF] ---" in line:
            in_diff = True
            continue
        if "-----------------------" in line:
            in_diff = False
            continue
        if in_diff and (line.startswith("+") or line.startswith("-")):
            penalty += 1
    return penalty if penalty > 0 else len(output_text.splitlines())

def find_c_files(src_dir):
    """Recursively finds all .c files in the source directory."""
    c_files = []
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.c'):
                c_files.append(os.path.join(root, file))
    return c_files

def locate_target_asm(base_name, nonmatchings_dir="asm/nonmatchings"):
    """
    Locates target assembly file either at asm/<base_name>.s
    or inside asm/nonmatchings/**/<base_name>.s.
    """
    direct_asm = os.path.join("asm", f"{base_name}.s")
    if os.path.exists(direct_asm):
        return direct_asm

    if os.path.exists(nonmatchings_dir):
        for root, _, files in os.walk(nonmatchings_dir):
            if f"{base_name}.s" in files:
                return os.path.join(root, f"{base_name}.s")
    return None

def locate_target_bin(base_name):
    """
    Locates target expected binary either at build/expected/<base_name>.bin
    or recursively under build/expected/**/<base_name>.bin.
    """
    direct_bin = os.path.join("build", "expected", f"{base_name}.bin")
    if os.path.exists(direct_bin):
        return direct_bin

    expected_dir = os.path.join("build", "expected")
    if os.path.exists(expected_dir):
        for root, _, files in os.walk(expected_dir):
            if f"{base_name}.bin" in files:
                return os.path.join(root, f"{base_name}.bin")
    return None

def process_file(c_file, api_key, max_retries=3, api_url=None, nonmatchings_dir="asm/nonmatchings"):
    """
    Processes a single C file by attempting to match it, and invoking the LLM if it fails.
    Iteratively feeds diagnostic error outputs and assembly diffs back to the LLM up to max_retries.
    Employs temperature stepping (0.2 -> 0.4 -> 0.7) and scores diff lines to retain best candidates.
    Supports locating modular functions inside asm/nonmatchings/ and build/expected/.
    """
    base_name = os.path.splitext(os.path.basename(c_file))[0]
    target_bin = locate_target_bin(base_name)
    asm_file = locate_target_asm(base_name, nonmatchings_dir)

    print(f"Processing: {c_file}")

    # Check if target binary exists
    if not target_bin or not os.path.exists(target_bin):
        print(f"  Target binary for {base_name} not found. Skipping.")
        return False

    # Run the initial matcher with diff flag
    cmd = ["python3", "tools/ai_matcher.py", c_file, target_bin, "--diff"]
    if asm_file and os.path.exists(asm_file):
        cmd.extend(["--target-asm", asm_file])

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        print("  [SUCCESS] Match already achieved.")
        return True

    print("  [MISMATCH] Invoking LLM for refactoring...")

    if not api_key:
        print("  LLM_API_KEY not set. Cannot refactor. Skipping.")
        return False

    # Read current C code and target assembly
    with open(c_file, 'r') as f:
        original_c_code = f.read()

    asm_code = ""
    if asm_file and os.path.exists(asm_file):
        with open(asm_file, 'r') as f:
            asm_code = f.read()

    last_feedback = result.stdout + "\n" + result.stderr
    best_candidate_code = original_c_code
    best_candidate_score = calculate_diff_score(last_feedback)
    c_code = original_c_code

    temperatures = [0.2, 0.4, 0.7]

    for attempt in range(1, max_retries + 1):
        temp = temperatures[(attempt - 1) % len(temperatures)]
        print(f"  [Attempt {attempt}/{max_retries}] Requesting LLM correction (temp={temp})...")

        feedback_section = ""
        if attempt > 1 or last_feedback.strip():
            feedback_section = f"\n\nCompiler/Matcher Output & Disassembly Diff:\n```\n{last_feedback.strip()}\n```\n"

        prompt = (
            f"Target Assembly:\n```mips\n{asm_code}\n```\n\n"
            f"Current C Code:\n```c\n{c_code}\n```"
            f"{feedback_section}\n"
            f"Please provide the corrected C code in a ```c code block."
        )

        new_code = call_llm_api(prompt, api_key, api_url, temperature=temp)

        if not new_code:
            print("  Failed to get a response from the LLM.")
            break

        # Extract C code from markdown block
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
            save_decomp_rule(base_name, {"matched_attempt": attempt, "temperature": temp})
            return True
        else:
            current_feedback = result.stdout + "\n" + result.stderr
            current_score = calculate_diff_score(current_feedback)
            print(f"  [MISMATCH] Attempt {attempt} score={current_score} (best={best_candidate_score}).")

            if current_score <= best_candidate_score:
                best_candidate_code = extracted_code
                best_candidate_score = current_score

            c_code = extracted_code
            last_feedback = current_feedback

    # Restore best candidate if failed to completely match
    if best_candidate_code != c_code:
        print(f"  Restoring best candidate code (score={best_candidate_score}).")
        with open(c_file, 'w') as f:
            f.write(best_candidate_code)

    print("  [MISMATCH] LLM refactoring failed to match.")
    return False

def main():
    parser = argparse.ArgumentParser(description="Continuous AI Loop for decompilation matching.")
    parser.add_argument("--src", default="src", help="Directory containing source C files.")
    parser.add_argument("--max-retries", type=int, default=3, help="Max self-correction iterations per file.")
    parser.add_argument("--api-url", default=None, help="Custom LLM API URL for mocking/local models.")
    parser.add_argument("--nonmatchings-dir", default="asm/nonmatchings", help="Root directory containing non-matching function assembly.")

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
        if process_file(c_file, api_key, max_retries=args.max_retries, api_url=args.api_url, nonmatchings_dir=args.nonmatchings_dir):
            success_count += 1

    print(f"\nAI Loop complete. Successfully matched: {success_count}/{len(c_files)}")

if __name__ == "__main__":
    main()
