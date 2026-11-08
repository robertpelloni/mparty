#!/usr/bin/env python3
"""
test_mparty_cli.py

Unit and regression tests for tools/mparty_cli.py,
validating argument parsing, multi-title options, and dashboard header formatting.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mparty_cli import create_parser, render_dashboard_header, cycle_target_game, GAME_NAMES

class TestMPartyCli(unittest.TestCase):
    def test_default_game_argument(self):
        parser = create_parser()
        args = parser.parse_args(["dashboard"])
        self.assertEqual(args.command, "dashboard")
        self.assertEqual(args.game, "mp1")

    def test_explicit_game_arguments(self):
        parser = create_parser()
        for game in ["mp1", "mp2", "mp3"]:
            args = parser.parse_args(["--game", game, "run"])
            self.assertEqual(args.game, game)
            self.assertEqual(args.command, "run")

    def test_render_dashboard_header(self):
        for game, expected_title in GAME_NAMES.items():
            header = render_dashboard_header(game)
            self.assertIn(expected_title, header)
            self.assertIn("Mario Party Engine - Interactive CLI Dashboard", header)
            self.assertIn("AI Decompilation Pipeline", header)

    def test_cycle_target_game(self):
        self.assertEqual(cycle_target_game("mp1"), "mp2")
        self.assertEqual(cycle_target_game("mp2"), "mp3")
        self.assertEqual(cycle_target_game("mp3"), "mp1")
        self.assertEqual(cycle_target_game("unknown"), "mp1")

    def test_render_dashboard_header_custom_statuses(self):
        custom_statuses = {
            "decomp": "MATCHING (100%)",
            "web": "ONLINE (Port 3000)",
            "netplay": "CONNECTED (4 Peers)"
        }
        header = render_dashboard_header("mp2", services_status=custom_statuses)
        self.assertIn("Mario Party 2 (N64)", header)
        self.assertIn("AI Decompilation Pipeline : MATCHING (100%)", header)
        self.assertIn("Next.js Web Frontend      : ONLINE (Port 3000)", header)
        self.assertIn("Netplay Sync Server       : CONNECTED (4 Peers)", header)

if __name__ == "__main__":
    unittest.main()
