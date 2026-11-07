#!/usr/bin/env python3
"""
test_generate_splat.py

Unit and integration tests for tools/generate_splat.py,
validating multi-title Mario Party profile resolution (mp1, mp2, mp3)
and splat YAML configuration generation.
"""

import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_splat import detect_game_profile, generate_yaml, GAME_PROFILES

class TestGenerateSplat(unittest.TestCase):
    def test_explicit_game_profiles(self):
        for game_id, expected in GAME_PROFILES.items():
            profile = detect_game_profile("baserom.z64", requested_game=game_id)
            self.assertEqual(profile["name"], expected["name"])
            self.assertEqual(profile["asm_path"], expected["asm_path"])
            self.assertEqual(profile["src_path"], expected["src_path"])
            self.assertEqual(profile["asset_path"], expected["asset_path"])
            self.assertEqual(profile["non_matchings_path"], expected["non_matchings_path"])

    def test_filename_auto_detection(self):
        p1 = detect_game_profile("roms/mario_party_1.z64")
        self.assertEqual(p1["name"], "mario_party_1")

        p2 = detect_game_profile("roms/mp2.z64")
        self.assertEqual(p2["name"], "mario_party_2")

        p3 = detect_game_profile("roms/marioparty3.n64")
        self.assertEqual(p3["name"], "mario_party_3")

        p_default = detect_game_profile("roms/unknown_game.z64")
        self.assertEqual(p_default["name"], "unknown_game")
        self.assertEqual(p_default["asm_path"], "asm")

    def test_yaml_generation_for_multi_titles(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            dummy_rom = os.path.join(tmpdir, "mock.z64")
            with open(dummy_rom, "wb") as f:
                f.write(b'\x80\x37\x12\x40' + b'\x00' * 60)

            for game in ["mp1", "mp2", "mp3"]:
                out_yaml = os.path.join(tmpdir, f"splat.{game}.yaml")
                generate_yaml(dummy_rom, output_path=out_yaml, game=game)

                self.assertTrue(os.path.exists(out_yaml))
                with open(out_yaml, "r") as f:
                    content = f.read()

                expected_profile = GAME_PROFILES[game]
                self.assertIn(f"name: {expected_profile['name']}", content)
                self.assertIn(f"asm_path: {expected_profile['asm_path']}", content)
                self.assertIn(f"src_path: {expected_profile['src_path']}", content)
                self.assertIn(f"non_matchings_path: {expected_profile['non_matchings_path']}", content)

if __name__ == "__main__":
    unittest.main()
