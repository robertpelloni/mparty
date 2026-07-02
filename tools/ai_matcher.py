#!/usr/bin/env python3
"""
ai_matcher.py

Automated AI decompilation matching harness.
Compiles C code using gcc cross-compiler (mips-linux-gnu-gcc) with specified optimization flags (e.g., -O2).
Extracts raw .text binaries via objcopy to compare file hashes against target MIPS assembly.
"""

import sys
import os
import subprocess
import hashlib
import argparse

def get_file_hash(filepath):
    """Calculates the SHA256 hash of a file."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def compile_c_file(c_file, obj_file, compiler="mips-linux-gnu-gcc", opt_flag="-O2"):
    """Compiles a C file to an object file."""
    cmd = [compiler, opt_flag, "-c", c_file, "-o", obj_file]
    print(f"Compiling: {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Compilation failed for {c_file}:\n{e.stderr}")
        return False
    except FileNotFoundError:
        print(f"Compiler '{compiler}' not found. Ensure the toolchain is installed.")
        return False

def extract_text_section(obj_file, text_bin, objcopy="mips-linux-gnu-objcopy"):
    """Extracts the .text section from an object file to a raw binary."""
    cmd = [objcopy, "-O", "binary", "-j", ".text", obj_file, text_bin]
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Objcopy failed for {obj_file}:\n{e.stderr}")
        return False
    except FileNotFoundError:
        print(f"Objcopy '{objcopy}' not found.")
        return False

def compare_hashes(file1, file2):
    """Compares the hashes of two files."""
    if not os.path.exists(file1) or not os.path.exists(file2):
        print(f"Missing files for comparison: {file1} or {file2}")
        return False

    hash1 = get_file_hash(file1)
    hash2 = get_file_hash(file2)

    if hash1 == hash2:
        print(f"[MATCH] Hashes match: {hash1}")
        return True
    else:
        print(f"[MISMATCH] Hashes differ.\n  {file1}: {hash1}\n  {file2}: {hash2}")
        return False

def main():
    parser = argparse.ArgumentParser(description="AI Matcher Harness for C to MIPS assembly comparison.")
    parser.add_argument("c_file", help="Path to the C source file.")
    parser.add_argument("target_bin", help="Path to the target raw .text binary to match against.")
    parser.add_argument("--compiler", default="mips-linux-gnu-gcc", help="Cross-compiler to use.")
    parser.add_argument("--objcopy", default="mips-linux-gnu-objcopy", help="Objcopy tool to use.")
    parser.add_argument("--opt", default="-O2", help="Optimization flag.")

    args = parser.parse_args()

    if not os.path.exists(args.c_file):
        print(f"Error: C file {args.c_file} not found.")
        sys.exit(1)

    base_name = os.path.splitext(os.path.basename(args.c_file))[0]
    temp_obj = f"{base_name}_temp.o"
    temp_bin = f"{base_name}_temp.bin"

    print(f"--- Starting matching process for {args.c_file} ---")

    if compile_c_file(args.c_file, temp_obj, args.compiler, args.opt):
        if extract_text_section(temp_obj, temp_bin, args.objcopy):
            match = compare_hashes(temp_bin, args.target_bin)

            # Cleanup
            if os.path.exists(temp_obj):
                os.remove(temp_obj)
            if os.path.exists(temp_bin):
                os.remove(temp_bin)

            if match:
                sys.exit(0)
            else:
                sys.exit(1)
        else:
            if os.path.exists(temp_obj):
                os.remove(temp_obj)
            sys.exit(1)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
