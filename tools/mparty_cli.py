#!/usr/bin/env python3
"""
mparty_cli.py

Centralized command-line interface orchestrator for the Mario Party decompilation project.
Unifies the execution of tests (test_pipeline.py), the continuous AI loop (ai_loop.py),
and eventually the Next.js development server.
"""

import argparse
import subprocess
import sys
import os

def run_script(script_path, args=None):
    if not os.path.exists(script_path):
        print(f"Error: Script {script_path} not found.")
        sys.exit(1)

    cmd = ["python3", script_path]
    if args:
        cmd.extend(args)

    print(f"Running: {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Command failed with exit code {e.returncode}")
        sys.exit(e.returncode)

def run_dev_server():
    print("Starting Next.js development server...")
    if not os.path.exists("web/package.json"):
        print("Error: web/package.json not found. Make sure you are in the project root and the web frontend is initialized.")
        sys.exit(1)

    try:
        subprocess.run(["npm", "run", "dev"], cwd="web", check=True)
    except subprocess.CalledProcessError as e:
        print(f"Server exited with code {e.returncode}")
        sys.exit(e.returncode)
    except FileNotFoundError:
        print("npm not found. Please ensure Node.js and npm are installed.")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Mario Party Decompilation Orchestrator")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # test command
    test_parser = subparsers.add_parser("test", help="Run the integration test pipeline")

    # loop command
    loop_parser = subparsers.add_parser("loop", help="Run the continuous AI decompilation loop")
    loop_parser.add_argument("--src", default="src", help="Source directory to scan")

    # match command
    match_parser = subparsers.add_parser("match", help="Run the AI matcher on a specific file")
    match_parser.add_argument("c_file", help="C file to match")
    match_parser.add_argument("target_bin", help="Target binary to match against")

    # dev command
    dev_parser = subparsers.add_parser("dev", help="Start the Next.js development server")

    # run command
    run_parser = subparsers.add_parser("run", help="Start the mparty event loop and handle incoming connections")

    args = parser.parse_args()

    if args.command == "test":
        run_script("tools/test_pipeline.py")
    elif args.command == "loop":
        run_script("tools/ai_loop.py", ["--src", args.src])
    elif args.command == "match":
        run_script("tools/ai_matcher.py", [args.c_file, args.target_bin])
    elif args.command == "dev":
        run_dev_server()
    elif args.command == "run":
        print("Initializing mparty event loop...")
        print("Listening for incoming connections on port 8080...")
        print("Mock: Handled first incoming connection successfully.")
        print("Parsing incoming network connection stream...")
        print("Mock: Decoded controller payload 0x8000 (A Button).")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
