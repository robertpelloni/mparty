#!/usr/bin/env python3
"""
disassemble.py

Orchestrates the disassembly process of a split N64 ROM using splat/spimdisasm.
This script acts as a wrapper that calls splat64 to split the ROM into structured directories.
"""

import sys
import os
import argparse
import subprocess

def create_directories():
    """Ensure standard project directories exist."""
    dirs = ["asm", "assets", "src", "include", "build"]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
    print("Project directories initialized.")

def run_splat(yaml_config):
    """Executes splat64 to split the ROM using the provided configuration."""
    if not os.path.exists(yaml_config):
        print(f"Error: Config file '{yaml_config}' not found.")
        sys.exit(1)

    print(f"Running splat configuration: {yaml_config}")

    try:
        # Check if python3 -m splat works (if splat64 is installed via pip)
        subprocess.run([sys.executable, "-m", "splat", "split", yaml_config], check=True)
        print("Disassembly step complete via splat module.")
    except subprocess.CalledProcessError:
        print(f"Error: Splat execution failed. Please ensure splat64 is installed via 'pip install splat64'.")
        sys.exit(1)
    except FileNotFoundError:
        print(f"Error: Splat command not found. Please ensure splat64 is installed.")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Orchestrate ROM disassembly using splat.")
    parser.add_argument("yaml_config", nargs='?', default="splat.yaml", help="Path to splat.yaml config.")

    args = parser.parse_args()

    create_directories()
    run_splat(args.yaml_config)

if __name__ == "__main__":
    main()
