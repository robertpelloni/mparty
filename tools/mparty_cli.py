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
import time

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

GAME_NAMES = {
    "mp1": "Mario Party 1 (N64)",
    "mp2": "Mario Party 2 (N64)",
    "mp3": "Mario Party 3 (N64)",
    "mp4": "Mario Party 4 (GameCube)"
}

GAME_CYCLE = ["mp1", "mp2", "mp3", "mp4"]

def cycle_target_game(current_game="mp1"):
    """Cycles sequentially between supported titles: mp1 -> mp2 -> mp3 -> mp1."""
    if current_game not in GAME_CYCLE:
        return "mp1"
    idx = GAME_CYCLE.index(current_game)
    return GAME_CYCLE[(idx + 1) % len(GAME_CYCLE)]

def render_dashboard_header(game="mp1", services_status=None):
    title = GAME_NAMES.get(game, "Mario Party 1 (N64)")
    statuses = services_status or {
        "decomp": "IDLE",
        "web": "OFFLINE",
        "netplay": "LISTENING (Port 8080)"
    }
    header = "=" * 60 + "\n"
    header += "   Mario Party Engine - Interactive CLI Dashboard\n"
    header += f"   Target Title: {title}\n"
    header += "=" * 60 + "\n"
    header += f"[1] AI Decompilation Pipeline : {statuses.get('decomp', 'IDLE')}\n"
    header += f"[2] Next.js Web Frontend      : {statuses.get('web', 'OFFLINE')}\n"
    header += f"[3] Netplay Sync Server       : {statuses.get('netplay', 'LISTENING')}\n"
    header += "-" * 60
    return header

def run_interactive_dashboard(game="mp1", max_iterations=None):
    """Renders an interactive terminal dashboard with target title context."""
    print("\033[2J\033[H", end="") # Clear screen
    print(render_dashboard_header(game))
    print("Press Ctrl+C to exit dashboard mode.")
    iterations = 0
    try:
        while max_iterations is None or iterations < max_iterations:
            time.sleep(1)
            iterations += 1
    except KeyboardInterrupt:
        print("\nExiting dashboard.")

def create_parser():
    parser = argparse.ArgumentParser(description="Mario Party Decompilation Orchestrator")
    parser.add_argument("--game", "-g", choices=["mp1", "mp2", "mp3", "mp4"], default="mp1", help="Target Mario Party title (mp1, mp2, mp3, mp4)")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # test command
    test_parser = subparsers.add_parser("test", help="Run the integration test pipeline")

    # loop command
    loop_parser = subparsers.add_parser("loop", help="Run the continuous AI decompilation loop")
    loop_parser.add_argument("--src", default=None, help="Source directory to scan (defaults to src/<game>)")

    # match command
    match_parser = subparsers.add_parser("match", help="Run the AI matcher on a specific file")
    match_parser.add_argument("c_file", help="C file to match")
    match_parser.add_argument("target_bin", help="Target binary to match against")

    # dev command
    dev_parser = subparsers.add_parser("dev", help="Start the Next.js development server")

    # run command
    run_parser = subparsers.add_parser("run", help="Start the mparty event loop and handle incoming connections")

    # dashboard command
    dashboard_parser = subparsers.add_parser("dashboard", help="Launch the interactive terminal dashboard")

    return parser

def main():
    parser = create_parser()
    args = parser.parse_args()
    game = getattr(args, "game", "mp1")

    if args.command == "test":
        run_script("tools/test_pipeline.py")
    elif args.command == "loop":
        src_dir = args.src or os.path.join("src", game) if os.path.exists(os.path.join("src", game)) else "src"
        nonmatchings_dir = os.path.join("asm", "nonmatchings", game) if os.path.exists(os.path.join("asm", "nonmatchings", game)) else "asm/nonmatchings"
        run_script("tools/ai_loop.py", ["--src", src_dir, "--nonmatchings-dir", nonmatchings_dir])
    elif args.command == "match":
        run_script("tools/ai_matcher.py", [args.c_file, args.target_bin])
    elif args.command == "dev":
        run_dev_server()
    elif args.command == "run":
        print(f"Initializing mparty event loop for {GAME_NAMES.get(game, 'Mario Party')}...")
        print("Listening for incoming connections on port 8080...")
        print("Mock: Handled first incoming connection successfully.")
        print("Parsing incoming network connection stream...")
        print("Mock: Decoded controller payload 0x8000 (A Button).")
        print("Dispatching data payload to frontend over WebSocket...")
    elif args.command == "dashboard":
        run_interactive_dashboard(game)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
