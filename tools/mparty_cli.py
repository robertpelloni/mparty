#!/usr/bin/env python3
"""
mparty_cli.py

Master Command Line Interface for the Mario Party WebEngine project.
This script acts as the centralized developer orchestration tool to trigger
various aspects of the decompilation pipeline and Next.js frontend testing.
"""

import sys
import argparse
import subprocess

def run_test_pipeline():
    """Delegates to the integration test pipeline."""
    print("mparty_cli: Triggering CI/CD integration pipeline...")
    subprocess.run(["python3", "tools/test_pipeline.py"], check=True)

def run_ai_loop():
    """Delegates to the continuous AI decompilation loop."""
    print("mparty_cli: Triggering continuous AI orchestration loop...")
    subprocess.run(["python3", "tools/ai_loop.py"], check=True)

def run_web_dev():
    """Delegates to the Next.js local development server."""
    print("mparty_cli: Starting Next.js WebEngine frontend...")
    subprocess.run(["npm", "run", "dev"], cwd="web", check=True)

def main():
    parser = argparse.ArgumentParser(description="Mario Party WebEngine Developer CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: test
    subparsers.add_parser("test", help="Run the full end-to-end integration test suite.")

    # Command: loop
    subparsers.add_parser("loop", help="Run the continuous AI decompilation matcher loop.")

    # Command: web
    subparsers.add_parser("web", help="Start the Next.js frontend development server.")

    args = parser.parse_args()

    if args.command == "test":
        try:
            run_test_pipeline()
        except subprocess.CalledProcessError:
            sys.exit(1)
    elif args.command == "loop":
        try:
            run_ai_loop()
        except subprocess.CalledProcessError:
            sys.exit(1)
    elif args.command == "web":
        try:
            run_web_dev()
        except subprocess.CalledProcessError:
            sys.exit(1)
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
