#!/usr/bin/env python3
"""
disassemble.py

Orchestrates the disassembly process of a split N64 ROM using splat/spimdisasm.
This script acts as a wrapper that calls splat64 to split the ROM into structured directories,
and organizes individual function assembly files into `asm/nonmatchings/<module>/<func>.s`
to support granular, byte-matching decompilation tracking.
"""

import sys
import os
import argparse
import subprocess
import re

def create_directories():
    """Ensure standard project directories exist."""
    dirs = [
        "asm",
        os.path.join("asm", "nonmatchings"),
        "assets",
        "src",
        "include",
        "build"
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
    print("Project directories initialized.")

def extract_nonmatchings_from_file(asm_file, nonmatchings_root):
    """
    Extracts individual functions from a unified .s assembly file and outputs them
    into modular `asm/nonmatchings/<module_name>/<func_name>.s` files.
    """
    if not os.path.exists(asm_file):
        return []

    module_name = os.path.splitext(os.path.basename(asm_file))[0]
    module_dir = os.path.join(nonmatchings_root, module_name)
    os.makedirs(module_dir, exist_ok=True)

    with open(asm_file, 'r') as f:
        content = f.read()

    lines = content.splitlines(keepends=True)
    functions = []
    current_func = None
    current_lines = []

    for line in lines:
        match = re.match(r'^(?:glabel|\.global|\.globl|\.ent)\s+([a-zA-Z0-9_]+)', line.strip())
        if match:
            if current_func:
                func_path = os.path.join(module_dir, f"{current_func}.s")
                with open(func_path, 'w') as out:
                    out.writelines(current_lines)
                functions.append(func_path)
            current_func = match.group(1)
            current_lines = [line]
        elif current_func:
            current_lines.append(line)

    if current_func and current_lines:
        func_path = os.path.join(module_dir, f"{current_func}.s")
        with open(func_path, 'w') as out:
            out.writelines(current_lines)
        functions.append(func_path)

    if functions:
        print(f"Extracted {len(functions)} non-matching functions into {module_dir}")
    return functions

def parse_splat_options(yaml_config):
    """Parses asm_path and non_matchings_path from splat.yaml options if present."""
    asm_path = None
    non_matchings_path = None

    if os.path.exists(yaml_config):
        try:
            with open(yaml_config, 'r') as f:
                for line in f:
                    stripped = line.strip()
                    if stripped.startswith('asm_path:'):
                        parts = stripped.split(':', 1)
                        if len(parts) > 1 and parts[1].strip():
                            asm_path = parts[1].strip().strip('"\'')
                    elif stripped.startswith('non_matchings_path:'):
                        parts = stripped.split(':', 1)
                        if len(parts) > 1 and parts[1].strip():
                            non_matchings_path = parts[1].strip().strip('"\'')
        except Exception as e:
            print(f"[WARN] Failed to parse options from {yaml_config}: {e}")

    return asm_path, non_matchings_path

def run_splat(yaml_config, asm_dir=None, nonmatchings_dir=None):
    """Executes splat64 to split the ROM using the provided configuration."""
    if not os.path.exists(yaml_config):
        print(f"Error: Config file '{yaml_config}' not found.")
        sys.exit(1)

    print(f"Running splat configuration: {yaml_config}")

    # Autodetect asm_path and non_matchings_path from YAML options if not explicitly supplied
    cfg_asm_path, cfg_nm_path = parse_splat_options(yaml_config)
    effective_asm_dir = asm_dir or cfg_asm_path or "asm"
    effective_nm_dir = nonmatchings_dir or cfg_nm_path or os.path.join(effective_asm_dir, "nonmatchings")

    try:
        subprocess.run([sys.executable, "-m", "splat", "split", yaml_config], check=True)
        print("Disassembly step complete via splat module.")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Splat execution unavailable or failed. Scaffolding non-matching directory layout.")
        create_directories()

    # Process all root and subdirectory .s assembly files into modular nonmatchings directory
    nm_dir = effective_nm_dir
    os.makedirs(nm_dir, exist_ok=True)
    asm_dir = effective_asm_dir

    if os.path.exists(asm_dir):
        for root, dirs, files in os.walk(asm_dir):
            # Do not extract already extracted nonmatchings files
            if os.path.abspath(root).startswith(os.path.abspath(nm_dir)):
                continue
            for file in files:
                if file.endswith('.s'):
                    full_path = os.path.join(root, file)
                    rel_dir = os.path.relpath(root, asm_dir)
                    target_root = nm_dir if rel_dir == '.' else os.path.join(nm_dir, rel_dir)
                    extract_nonmatchings_from_file(full_path, target_root)

def main():
    parser = argparse.ArgumentParser(description="Orchestrate ROM disassembly using splat.")
    parser.add_argument("yaml_config", nargs='?', default="splat.yaml", help="Path to splat.yaml config.")
    parser.add_argument("--asm-dir", default=None, help="Root directory containing disassembled assembly.")
    parser.add_argument("--nonmatchings-dir", default=None, help="Root directory for extracted non-matching functions.")

    args = parser.parse_args()

    create_directories()
    run_splat(args.yaml_config, asm_dir=args.asm_dir, nonmatchings_dir=args.nonmatchings_dir)

if __name__ == "__main__":
    main()
