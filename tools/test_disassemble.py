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
from disassemble import extract_nonmatchings_from_file, parse_splat_options

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

    def test_extract_nonmatchings_globl_and_ent_directives(self):
        asm_content = """.globl func_globl_test
    addu $v0, $a0, $a1
    jr $ra
    nop

.ent func_ent_test
    subu $v0, $a0, $a1
    jr $ra
    nop
"""
        asm_path = os.path.join(self.tmpdir, "directives_code.s")
        with open(asm_path, "w") as f:
            f.write(asm_content)

        nm_dir = os.path.join(self.tmpdir, "nonmatchings")
        extracted = extract_nonmatchings_from_file(asm_path, nm_dir)

        self.assertEqual(len(extracted), 2)
        func1 = os.path.join(nm_dir, "directives_code", "func_globl_test.s")
        func2 = os.path.join(nm_dir, "directives_code", "func_ent_test.s")
        self.assertTrue(os.path.exists(func1))
        self.assertTrue(os.path.exists(func2))

    def test_extract_nonmatchings_empty_or_missing(self):
        nm_dir = os.path.join(self.tmpdir, "nonmatchings")
        extracted = extract_nonmatchings_from_file(os.path.join(self.tmpdir, "nonexistent.s"), nm_dir)
        self.assertEqual(extracted, [])

    def test_parse_splat_options(self):
        yaml_content = """name: test_game
options:
  asm_path: "asm/custom"
  non_matchings_path: 'asm/custom_nonmatchings'
"""
        yaml_path = os.path.join(self.tmpdir, "test_splat.yaml")
        with open(yaml_path, "w") as f:
            f.write(yaml_content)

        asm_path, nm_path = parse_splat_options(yaml_path)
        self.assertEqual(asm_path, "asm/custom")
        self.assertEqual(nm_path, "asm/custom_nonmatchings")

    def test_parse_splat_options_missing(self):
        asm_path, nm_path = parse_splat_options(os.path.join(self.tmpdir, "nonexistent.yaml"))
        self.assertIsNone(asm_path)
        self.assertIsNone(nm_path)

    def test_extract_nonmatchings_end_directive(self):
        asm_content = """.ent func_with_end
    addu $v0, $a0, $a1
    jr $ra
    nop
.end func_with_end

# Non-function data trailing in file
.section .rodata
.word 0xCAFEBABE
"""
        asm_path = os.path.join(self.tmpdir, "end_directive_code.s")
        with open(asm_path, "w") as f:
            f.write(asm_content)

        nm_dir = os.path.join(self.tmpdir, "nonmatchings")
        extracted = extract_nonmatchings_from_file(asm_path, nm_dir)

        self.assertEqual(len(extracted), 1)
        func_file = os.path.join(nm_dir, "end_directive_code", "func_with_end.s")
        self.assertTrue(os.path.exists(func_file))

        with open(func_file, "r") as f:
            content = f.read()
        self.assertIn(".ent func_with_end", content)
        self.assertIn(".end func_with_end", content)
        self.assertNotIn("0xCAFEBABE", content)

    def test_run_splat_extract_nonmatchings_statistics(self):
        from disassemble import run_splat
        asm_dir = os.path.join(self.tmpdir, "asm")
        os.makedirs(asm_dir, exist_ok=True)
        sample_asm = os.path.join(asm_dir, "sample.s")
        with open(sample_asm, "w") as f:
            f.write("""glabel sample_fn1
    jr $ra
    nop

glabel sample_fn2
    jr $ra
    nop
""")
        fake_yaml = os.path.join(self.tmpdir, "splat.yaml")
        with open(fake_yaml, "w") as f:
            f.write("name: test\n")

        nm_dir = os.path.join(self.tmpdir, "nonmatchings")
        total = run_splat(fake_yaml, asm_dir=asm_dir, nonmatchings_dir=nm_dir)
        self.assertEqual(total, 2)
        self.assertTrue(os.path.exists(os.path.join(nm_dir, "sample", "sample_fn1.s")))
        self.assertTrue(os.path.exists(os.path.join(nm_dir, "sample", "sample_fn2.s")))

if __name__ == "__main__":
    unittest.main()
