#!/usr/bin/env node
/**
 * test_c_stubber.js
 *
 * Validates intelligent C stub generation from MIPS assembly sequences.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { analyzeAsmBody, extractFunctionsFromAsm, generateCStub, processDirectory } = require('./c_stubber');

console.log('Testing c_stubber.js pattern analysis...\n');

// Test 1: Simple leaf function returning integer ($v0) and taking two arguments ($a0, $a1)
const leafIntAsm = `
    addiu $sp, $sp, -0x18
    sw $s0, 0x10($sp)
    addu $v0, $a0, $a1
    lw $s0, 0x10($sp)
    addiu $sp, $sp, 0x18
    jr $ra
    nop
`;

const res1 = analyzeAsmBody(leafIntAsm);
assert.strictEqual(res1.returnType, 's32', 'Expected returnType s32');
assert.strictEqual(res1.params, 's32 a0, s32 a1', 'Expected params s32 a0, s32 a1');
assert.strictEqual(res1.isLeaf, true, 'Expected isLeaf true');
assert.strictEqual(res1.stackSize, 0x18, 'Expected stackSize 0x18');
assert.deepStrictEqual(res1.savedRegisters, ['$s0'], 'Expected savedRegisters [$s0]');
console.log('[OK] Test 1: Leaf s32 function with ($a0, $a1) and saved $s0 passed.');

// Test 2: Floating point function returning $f0 and taking $f12
const floatAsm = `
    add.s $f0, $f12, $f12
    jr $ra
    nop
`;

const res2 = analyzeAsmBody(floatAsm);
assert.strictEqual(res2.returnType, 'f32', 'Expected returnType f32');
assert.strictEqual(res2.params, 'f32 f12', 'Expected params f32 f12');
assert.strictEqual(res2.isLeaf, true, 'Expected isLeaf true');
console.log('[OK] Test 2: Float function with ($f12) returning f32 passed.');

// Test 3: Non-leaf void function with jal call and no return value
const nonLeafVoidAsm = `
    addiu $sp, $sp, -0x20
    sw $ra, 0x1c($sp)
    jal some_other_func
    nop
    lw $ra, 0x1c($sp)
    addiu $sp, $sp, 0x20
    jr $ra
    nop
`;

const res3 = analyzeAsmBody(nonLeafVoidAsm);
assert.strictEqual(res3.returnType, 'void', 'Expected returnType void');
assert.strictEqual(res3.params, 'void', 'Expected params void');
assert.strictEqual(res3.isLeaf, false, 'Expected isLeaf false (non-leaf due to jal)');
console.log('[OK] Test 3: Non-leaf void function passed.');

// Test 4: Extract multiple functions from nonmatching assembly file
const multiAsm = `
glabel func_one
    addu $v0, $a0, $a1
    jr $ra
    nop

glabel func_two
    jal func_one
    nop
    jr $ra
    nop
`;

const extracted = extractFunctionsFromAsm(multiAsm);
assert.strictEqual(extracted.length, 2, 'Expected 2 extracted functions');
assert.strictEqual(extracted[0].name, 'func_one');
assert.strictEqual(extracted[1].name, 'func_two');
console.log('[OK] Test 4: Multiple function extraction passed.');

// Test 5: Pointer parameter inference from memory loads/stores
const pointerAsm = `
    lw $t0, 0($a0)
    sw $t0, 4($a1)
    jr $ra
    nop
`;

const res5 = analyzeAsmBody(pointerAsm);
assert.strictEqual(res5.returnType, 'void');
assert.strictEqual(res5.params, 'void* a0, void* a1', 'Expected pointer args void* a0, void* a1');
console.log('[OK] Test 5: Pointer parameter inference passed.');

// Test 6: 64-bit integer return ($v0, $v1) and indirect jump table (switch)
const switch64Asm = `
    sll $t0, $a0, 2
    lw $t1, 0x80050000($t0)
    jr $t1
    nop
case_0:
    li $v0, 1
    li $v1, 0
    jr $ra
    nop
`;

const res6 = analyzeAsmBody(switch64Asm);
assert.strictEqual(res6.returnType, 's64', 'Expected returnType s64');
assert.strictEqual(res6.hasJumpTable, true, 'Expected hasJumpTable true');
console.log('[OK] Test 6: 64-bit return and jump table switch detection passed.');

// Test 7: Validate #pragma GLOBAL_ASM generation for nonmatching functions
const stubOutput = generateCStub('func_test', res1, 'engine', true);
assert(stubOutput.includes('#ifdef NON_MATCHING'), 'Expected #ifdef NON_MATCHING');
assert(stubOutput.includes('#pragma GLOBAL_ASM("asm/nonmatchings/engine/func_test.s")'), 'Expected #pragma GLOBAL_ASM');
assert(stubOutput.includes('s32 func_test(s32 a0, s32 a1)'), 'Expected signature s32 func_test(s32 a0, s32 a1)');
assert(stubOutput.includes('Saved Regs: $s0'), 'Expected Saved Regs in comment');
console.log('[OK] Test 7: #pragma GLOBAL_ASM generation passed.');

// Test 8: Struct pointer offset spread inference and boolean condition flag
const structBoolAsm = `
    lw $t0, 0x0($a0)
    lw $t1, 0x4($a0)
    slt $v0, $t0, $t1
    jr $ra
    nop
`;

const res8 = analyzeAsmBody(structBoolAsm);
assert.strictEqual(res8.returnType, 's32', 'Expected returnType s32');
assert(res8.isBooleanV0, 'Expected isBooleanV0 true');
assert(res8.params.includes('struct'), 'Expected struct parameter annotation');
console.log('[OK] Test 8: Struct offset spread and boolean detection passed.');

// Test 9: Double-precision float parameter and 64-bit integer argument pair with loop
const doubleLoopAsm = `
loop_head:
    add.d $f0, $f12, $f12
    ld $t0, 0($a0)
    bne $t0, $zero, loop_head
    nop
    jr $ra
    nop
`;

const res9 = analyzeAsmBody(doubleLoopAsm);
assert.strictEqual(res9.returnType, 'f64', 'Expected returnType f64');
assert.strictEqual(res9.params, 'f64 f12', 'Expected params f64 f12');
assert.strictEqual(res9.hasLoop, true, 'Expected hasLoop true');
console.log('[OK] Test 9: Double-precision float and loop detection passed.');

// Test 10: Memory-mapped I/O (MMIO) and Rodata symbol referencing
const mmioRodataAsm = `
    lui $t0, 0xA430
    lw $v0, 0($t0)
    lui $t1, %hi(D_80080000)
    lw $a0, %lo(D_80080000)($t1)
    jr $ra
    nop
`;

const res10 = analyzeAsmBody(mmioRodataAsm);
assert.strictEqual(res10.returnType, 's32', 'Expected returnType s32');
assert(res10.mmioAccesses.includes('MI_INTR_REG'), 'Expected MI_INTR_REG in mmioAccesses');
assert(res10.rodataSymbols.includes('D_80080000'), 'Expected D_80080000 in rodataSymbols');

const stub10 = generateCStub('read_hardware_intr', res10, 'system', false);
assert(stub10.includes('Hardware MMIO: MI_INTR_REG'), 'Expected Hardware MMIO in generated comments');
assert(stub10.includes('Rodata Symbols: D_80080000'), 'Expected Rodata Symbols in generated comments');
console.log('[OK] Test 10: MMIO register and rodata symbol detection passed.');

// Test 11: Stack argument detection (arguments beyond $a3) and unsigned type inference
const stackUnsignedAsm = `
    addiu $sp, $sp, -0x28
    sw $s0, 0x18($sp)
    divu $v0, $a0, $a1
    lw $t1, 0x28($sp)
    lw $s0, 0x18($sp)
    addiu $sp, $sp, 0x28
    jr $ra
    nop
`;

const res11 = analyzeAsmBody(stackUnsignedAsm);
assert.strictEqual(res11.returnType, 'u32', 'Expected returnType u32 from divu');
assert(res11.params.includes('u32 a0'), 'Expected u32 a0 parameter');
assert(res11.params.includes('u32 a1'), 'Expected u32 a1 parameter');
assert(res11.params.includes('a4 /* from stack */'), 'Expected stack argument parameter a4');
console.log('[OK] Test 11: Stack argument and unsigned type inference passed.');

// Test 12: Empty or malformed input error recovery
const res12 = analyzeAsmBody('');
assert.strictEqual(res12.returnType, 'void');
assert(res12.parseErrors.length > 0, 'Expected parse error on empty body');
console.log('[OK] Test 12: Graceful error recovery on empty input passed.');

// Test 13: Batch directory processing statistics reporting
const tempAsmDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mparty_test_asm_'));
const tempSrcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mparty_test_src_'));

try {
    // Write a valid asm file
    fs.writeFileSync(path.join(tempAsmDir, 'valid.s'), `
glabel func_valid
    addu $v0, $a0, $a1
    jr $ra
    nop
    `);

    // Write a file with no functions (to be skipped)
    fs.writeFileSync(path.join(tempAsmDir, 'empty.s'), `# Just a comment\n.word 0x00\n`);

    const stats = processDirectory(tempAsmDir, tempSrcDir);
    assert.strictEqual(stats.processedFiles.length, 1, 'Expected 1 processed file');
    assert.strictEqual(stats.totalFunctions, 1, 'Expected 1 function typed');
    assert.strictEqual(stats.skippedFiles.length, 1, 'Expected 1 skipped file');
    assert(fs.existsSync(path.join(tempSrcDir, 'valid.c')), 'Expected generated valid.c');
    console.log('[OK] Test 13: Batch directory processing statistics passed.');
} finally {
    fs.rmSync(tempAsmDir, { recursive: true, force: true });
    fs.rmSync(tempSrcDir, { recursive: true, force: true });
}

// Test 14: Global pointer ($gp) relative relocations and Read/Write classification
const gpRelAsm = `
    lw $t0, %gp_rel(g_CurrentTurn)($gp)
    addiu $t0, $t0, 1
    sw $t0, %gp_rel(g_CurrentTurn)($gp)
    lui $t1, %hi(D_80090000)
    sw $t0, %lo(D_80090000)($t1)
    jr $ra
    nop
`;

const res14 = analyzeAsmBody(gpRelAsm);
assert(res14.globalDataReads.includes('g_CurrentTurn'), 'Expected g_CurrentTurn in globalDataReads');
assert(res14.globalDataWrites.includes('g_CurrentTurn'), 'Expected g_CurrentTurn in globalDataWrites');
assert(res14.globalDataWrites.includes('D_80090000'), 'Expected D_80090000 in globalDataWrites');

const stub14 = generateCStub('increment_turn', res14, 'game', false);
assert(stub14.includes('Global Reads: g_CurrentTurn'), 'Expected Global Reads in comments');
assert(stub14.includes('Global Writes: D_80090000, g_CurrentTurn'), 'Expected Global Writes in comments');
console.log('[OK] Test 14: $gp-relative symbol tracking and Read/Write classification passed.');

console.log('\nAll c_stubber tests passed successfully!');
