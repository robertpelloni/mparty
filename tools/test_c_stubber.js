#!/usr/bin/env node
/**
 * test_c_stubber.js
 *
 * Validates intelligent C stub generation from MIPS assembly sequences.
 */

const assert = require('assert');
const { analyzeAsmBody, extractFunctionsFromAsm, generateCStub } = require('./c_stubber');

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

console.log('\nAll c_stubber tests passed successfully!');
