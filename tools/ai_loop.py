#!/usr/bin/env python3
"""
ai_loop.py

This script represents the 'Continuous Autonomous Execution' harness.
It recursively scans the src/ directory for decompiled C files, locates their
corresponding target MIPS assembly in asm/, and initiates the ai_matcher loop.
In a full implementation, this script would make API calls to an LLM to automatically
rewrite the C file upon receiving a mismatch, looping until a match is confirmed.
"""

import os
import sys
import glob
import subprocess

def find_target_assembly(c_file_path):
    """
    Given a C file like 'src/nonmatchings/1000/func_80000400.c',
    attempts to find the corresponding 'asm/nonmatchings/1000/func_80000400.s'
    """
    # Simple substitution based on the standard project directory layout
    if not c_file_path.startswith("src/"):
        return None

    s_file_path = c_file_path.replace("src/", "asm/", 1).replace(".c", ".s")

    if os.path.exists(s_file_path):
        return s_file_path
    return None

import json
import urllib.request
import urllib.error

def call_llm_api(c_source, asm_source):
    """
    Simulates making a REST API call to an LLM provider (e.g., OpenAI, Anthropic)
    to request a C code rewrite that matches the target MIPS assembly.
    """
    api_key = os.environ.get("LLM_API_KEY")
    if not api_key:
        print("  -> [API] Skipping actual LLM network request (LLM_API_KEY not set).")
        return None

    prompt = f"""
    You are an expert N64 C decompilation engineer.
    Rewrite the following C function so that it byte-matches the target MIPS assembly exactly when compiled with GCC -O2.

    --- TARGET ASSEMBLY ---
    {asm_source}

    --- CURRENT C SOURCE ---
    {c_source}

    Return ONLY the raw C code. Do not include markdown formatting or explanations.
    """

    # Mock implementation of a generic POST payload
    payload = json.dumps({
        "model": "gpt-4o-or-claude",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.mock-llm-provider.com/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    )

    try:
        with urllib.request.urlopen(req) as response:
            response_data = json.loads(response.read().decode())
            return response_data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    except urllib.error.URLError as e:
        print(f"  -> [API] Error communicating with LLM: {e}")
        return None

def process_file(c_file, s_file):
    """
    Orchestrates the matcher. If it fails, triggers the LLM rewrite loop.
    """
    print(f"\n[AI Loop] Evaluating: {c_file}")

    # In a full continuous loop, this would be a while True: with a max retry count.
    # For now, we perform a single pass per run.
    cmd = ["python3", "tools/ai_matcher.py", c_file, s_file]
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        print("  -> Status: MATCHED. Skipping LLM rewrite.")
    else:
        print("  -> Status: MISMATCH.")
        print("  -> Extracting context and prompting LLM...")

        with open(c_file, 'r') as f:
            c_source = f.read()
        with open(s_file, 'r') as f:
            asm_source = f.read()

        new_c_source = call_llm_api(c_source, asm_source)

        if new_c_source:
            print("  -> Received updated C source from LLM. Overwriting file...")
            with open(c_file, 'w') as f:
                f.write(new_c_source)
            print("  -> Code overwritten. Run loop again to verify new match.")
        else:
            print("  -> LLM returned no data or mock mode active. Retaining original C stub.")

def main():
    print("=== Continuous Autonomous Decompilation Loop ===")

    src_dir = "src"
    if not os.path.exists(src_dir):
        print(f"Error: Directory {src_dir} not found.")
        sys.exit(1)

    c_files = glob.glob(os.path.join(src_dir, "**/*.c"), recursive=True)
    if not c_files:
        print(f"No .c files found in {src_dir} to process.")
        sys.exit(0)

    print(f"Found {len(c_files)} C files to evaluate.")

    for c_file in c_files:
        s_file = find_target_assembly(c_file)
        if s_file:
            process_file(c_file, s_file)
        else:
            print(f"  -> Warning: No target assembly found for {c_file}. Skipping.")

    print("\n=== AI Loop Iteration Complete ===")

if __name__ == "__main__":
    main()
