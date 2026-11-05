#!/usr/bin/env python3
"""
ai_matcher.py

An automated orchestration script for decompilation matching.
It takes a C file and a target assembly file, compiles the C file,
assembles the target, and compares the resulting object files to
determine if they are a byte-for-byte match.

Usage:
  python3 tools/ai_matcher.py <path_to_c_file> <path_to_target_s_file>
"""

import sys
import os
import subprocess
import hashlib
import argparse

# Toolchain definitions based on the project Makefile
CROSS = "mips-linux-gnu-"
CC = f"{CROSS}gcc"
AS = f"{CROSS}as"

# Flags based on standard N64 MIPS III decompilation targets
CFLAGS = ["-O2", "-G", "0", "-mabi=32", "-mips3", "-fno-PIC", "-Iinclude", "-c"]
ASFLAGS = ["-mabi=32", "-mips3"]

def get_file_hash(filepath):
    """Returns the SHA1 hash of the given file."""
    h = hashlib.sha1()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def compile_c(c_file, out_o):
    """Compiles the C file into an object file."""
    cmd = [CC] + CFLAGS + [c_file, "-o", out_o]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Compilation error for {c_file}:")
        print(e.stderr.decode('utf-8'))
        return False

def assemble_s(s_file, out_o):
    """Assembles the target .s file into an object file."""
    cmd = [CC, "-c", "-Iinclude", "-x", "assembler-with-cpp"] + ASFLAGS + [s_file, "-o", out_o]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Assembly error for {s_file}:")
        print(e.stderr.decode('utf-8'))
        return False

def check_match(c_file, s_file):
    print(f"--- AI Matcher ---")
    print(f"Target C  : {c_file}")
    print(f"Target ASM: {s_file}")
    print("------------------")

    build_dir = "build/matcher"
    os.makedirs(build_dir, exist_ok=True)

    c_obj = os.path.join(build_dir, "test.o")
    s_obj = os.path.join(build_dir, "target.o")

    # Clean previous artifacts
    for obj in [c_obj, s_obj]:
        if os.path.exists(obj):
            os.remove(obj)

    print("[1] Compiling C file...")
    if not compile_c(c_file, c_obj):
        print("FAIL: C file failed to compile.")
        return False

    print("[2] Assembling target...")
    if not assemble_s(s_file, s_obj):
        print("FAIL: Target assembly failed.")
        return False

    print("[3] Stripping objects and extracting text sections for matching...")
    # In order to avoid differing timestamps, ELF headers, or section layouts causing false mismatches,
    # we use objcopy to extract purely the binary .text (MIPS instructions) from the object files.
    c_bin = c_obj.replace(".o", ".bin")
    s_bin = s_obj.replace(".o", ".bin")

    subprocess.run([f"{CROSS}objcopy", "-O", "binary", "-j", ".text", c_obj, c_bin], check=True)
    subprocess.run([f"{CROSS}objcopy", "-O", "binary", "-j", ".text", s_obj, s_bin], check=True)

    c_hash = get_file_hash(c_bin)
    s_hash = get_file_hash(s_bin)

    print(f"C text Hash : {c_hash}")
    print(f"ASM text Hash: {s_hash}")

    if c_hash == s_hash:
        print("\n>>> MATCH! <<< The compiled C logic successfully byte-matches the target assembly.")
        return True
    else:
        print("\n>>> MISMATCH <<< The generated binary does not match the target.")
        return False

def main():
    parser = argparse.ArgumentParser(description="Compile and diff C code against target MIPS assembly.")
    parser.add_argument("c_file", help="Path to the C source file.")
    parser.add_argument("s_file", help="Path to the target assembly file.")

    args = parser.parse_args()

    if not os.path.exists(args.c_file):
        print(f"Error: C file {args.c_file} not found.")
        sys.exit(1)

    if not os.path.exists(args.s_file):
        print(f"Error: ASM file {args.s_file} not found.")
        sys.exit(1)

    matched = check_match(args.c_file, args.s_file)
    sys.exit(0 if matched else 1)

if __name__ == "__main__":
    main()
