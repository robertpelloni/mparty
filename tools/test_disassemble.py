#!/usr/bin/env python3
"""
test_disassemble.py

Unit tests for tools/disassemble.py verifying function extraction
and modular non-matching file generation.
"""

import unittest
import tempfile
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from disassemble import extract_nonmatchings_from_file

class TestDisassemble(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.mkdtemp(prefix="mparty_test_disasm_")

    def tearDown(self):
        if os.path.exists(self.tmpdir):
            shutil.rmtree(self.tmpdir)

    def test_extract_nonmatchings_multiple_functions(self):
        asm_content = """glabel func_init
    addiu $sp, $sp, -0x18
    sw $ra, 0x14($sp)
    jr $ra
    nop

.global func_loop
    addiu $v0, $zero, 1
    jr $ra
    nop
"""
        asm_path = os.path.join(self.tmpdir, "main_code.s")
        with open(asm_path, "w") as f:
            f.write(asm_content)

        nm_dir = os.path.join(self.tmpdir, "nonmatchings")
        extracted = extract_nonmatchings_from_file(asm_path, nm_dir)

        self.assertEqual(len(extracted), 2)
        func1 = os.path.join(nm_dir, "main_code", "func_init.s")
        func2 = os.path.join(nm_dir, "main_code", "func_loop.s")
        self.assertTrue(os.path.exists(func1))
        self.assertTrue(os.path.exists(func2))

        with open(func1, "r") as f:
            c1 = f.read()
        self.assertIn("glabel func_init", c1)
        self.assertNotIn("func_loop", c1)

        with open(func2, "r") as f:
            c2 = f.read()
        self.assertIn(".global func_loop", c2)
        self.assertNotIn("func_init", c2)

    def test_extract_nonmatchings_empty_or_missing(self):
        nm_dir = os.path.join(self.tmpdir, "nonmatchings")
        extracted = extract_nonmatchings_from_file(os.path.join(self.tmpdir, "nonexistent.s"), nm_dir)
        self.assertEqual(extracted, [])

if __name__ == "__main__":
    unittest.main()
