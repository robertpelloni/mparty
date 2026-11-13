#!/usr/bin/env python3
"""
test_ai_matcher.py

Unit tests for tools/ai_matcher.py validating SHA256 hashing,
hash comparison, instruction normalization, and structured assembly diffs.
"""

import unittest
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ai_matcher import get_file_hash, compare_hashes, normalize_instruction, generate_assembly_diff

class TestAIMatcher(unittest.TestCase):
    def test_file_hash_and_comparison(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            file1 = os.path.join(tmpdir, "f1.bin")
            file2 = os.path.join(tmpdir, "f2.bin")
            file3 = os.path.join(tmpdir, "f3.bin")

            with open(file1, "wb") as f: f.write(b"identical binary content")
            with open(file2, "wb") as f: f.write(b"identical binary content")
            with open(file3, "wb") as f: f.write(b"different binary content")

            self.assertEqual(get_file_hash(file1), get_file_hash(file2))
            self.assertNotEqual(get_file_hash(file1), get_file_hash(file3))

            self.assertTrue(compare_hashes(file1, file2))
            self.assertFalse(compare_hashes(file1, file3))

    def test_normalize_instruction(self):
        # Objdump address & opcode stripping
        raw_objdump = "  80000400:\t27bdffe8 \taddiu\t$sp, $sp, -24"
        normalized = normalize_instruction(raw_objdump)
        self.assertEqual(normalized, "addiu $sp, $sp, -24")

        # Comment and spacing cleanup
        raw_asm = "  addu   $v0,   $a0,   $a1   # result in v0"
        self.assertEqual(normalize_instruction(raw_asm), "addu $v0, $a0, $a1")

        # Empty lines
        self.assertEqual(normalize_instruction("   # only comments"), "")

    def test_generate_assembly_diff(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            target_asm = os.path.join(tmpdir, "target.s")
            mock_obj = os.path.join(tmpdir, "mock.o")

            with open(target_asm, "w") as f:
                f.write("addiu $sp, $sp, -24\n")
                f.write("addu $v0, $a0, $a1\n")
                f.write("jr $ra\n")

            with open(mock_obj, "w") as f:
                f.write("dummy object file")

            diff = generate_assembly_diff(mock_obj, target_asm, normalize=True)
            # Should produce unified diff output
            self.assertTrue(len(diff) > 0)
            self.assertIn("target_assembly (normalized)", diff)

if __name__ == "__main__":
    unittest.main()
