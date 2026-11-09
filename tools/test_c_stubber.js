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

// Test 5: Pointer parameter inference from memory loads/stores (read-only const vs mutable)
const pointerAsm = `
    lw $t0, 0($a0)
    sw $t0, 4($a1)
    jr $ra
    nop
`;

const res5 = analyzeAsmBody(pointerAsm);
assert.strictEqual(res5.returnType, 'void');
assert.strictEqual(res5.params, 'const void* a0, void* a1', 'Expected pointer args const void* a0, void* a1');
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

// Test 15: Modular non-matching directory processing with processNonmatchings flag
const tempNonmatchAsmDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mparty_nm_asm_'));
const tempNonmatchSrcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mparty_nm_src_'));

try {
    const nmDir = path.join(tempNonmatchAsmDir, 'nonmatchings', 'minigame');
    fs.mkdirSync(nmDir, { recursive: true });
    fs.writeFileSync(path.join(nmDir, 'minigame_tick.s'), `
glabel minigame_tick
    addu $v0, $a0, $a1
    jr $ra
    nop
    `);

    // First call without processNonmatchings flag: nonmatchings should be skipped
    const statsWithout = processDirectory(tempNonmatchAsmDir, tempNonmatchSrcDir, null, false);
    assert.strictEqual(statsWithout.processedFiles.length, 0, 'Expected nonmatchings to be skipped by default');

    // Second call with processNonmatchings flag: nonmatchings should be processed
    const statsWith = processDirectory(tempNonmatchAsmDir, tempNonmatchSrcDir, null, true);
    assert.strictEqual(statsWith.processedFiles.length, 1, 'Expected 1 nonmatching file to be processed');
    assert.strictEqual(statsWith.totalFunctions, 1, 'Expected 1 nonmatching function typed');
    assert(fs.existsSync(path.join(tempNonmatchSrcDir, 'nonmatchings', 'minigame', 'minigame_tick.c')));
    console.log('[OK] Test 15: Modular non-matching directory processing passed.');
} finally {
    fs.rmSync(tempNonmatchAsmDir, { recursive: true, force: true });
    fs.rmSync(tempNonmatchSrcDir, { recursive: true, force: true });
}

// Test 16: COP0 register detection (Status, Cause, Count)
const cop0Asm = `
    mfc0 $t0, $12
    mfc0 $t1, $13
    mtc0 $a0, $9
    jr $ra
    nop
`;

const res16 = analyzeAsmBody(cop0Asm);
assert(res16.cop0Registers.includes('Status'), 'Expected Status COP0 register');
assert(res16.cop0Registers.includes('Cause'), 'Expected Cause COP0 register');
assert(res16.cop0Registers.includes('Count'), 'Expected Count COP0 register');

const stub16 = generateCStub('handle_interrupt', res16, 'os', false);
assert(stub16.includes('System Control COP0: Cause, Count, Status'), 'Expected COP0 comment in generated stub');
console.log('[OK] Test 16: COP0 register recognition and comment generation passed.');

// Test 17: Subword memory type inferencing and volatile MMIO qualifiers
const subwordMmioAsm = `
    lui $a0, 0xA440
    lw $t0, 0($a0)
    lbu $t1, 0($a1)
    lhu $t2, 0($a2)
    jr $ra
    nop
`;

const res17 = analyzeAsmBody(subwordMmioAsm);
assert(res17.params.includes('volatile u32* a0'), 'Expected volatile u32* a0 for MMIO pointer');
assert(res17.params.includes('u8* a1'), 'Expected u8* a1 for byte dereference');
assert(res17.params.includes('u16* a2'), 'Expected u16* a2 for halfword dereference');
console.log('[OK] Test 17: Subword memory type inferencing and volatile MMIO qualifiers passed.');

// Test 18: Custom non-matching prefix for multi-title global asm stubbing
const customPrefixStub = generateCStub('func_title_specific', res1, 'engine', true, 'asm/nonmatchings/mp2');
assert(customPrefixStub.includes('#pragma GLOBAL_ASM("asm/nonmatchings/mp2/engine/func_title_specific.s")'),
    'Expected custom nonmatching prefix in #pragma GLOBAL_ASM');
console.log('[OK] Test 18: Custom nonmatchingsPrefix in generateCStub passed.');

// Test 19: Granular MMIO sub-register mapping with non-zero offsets
const subMmioAsm = `
    lui $t0, 0xA450
    sw $a0, 0x0004($t0)
    lw $v0, 0x000C($t0)
    lui $t1, 0xA440
    sw $a1, 0x0008($t1)
    jr $ra
    nop
`;

const res19 = analyzeAsmBody(subMmioAsm);
assert(res19.mmioAccesses.includes('AI_LEN_REG'), 'Expected AI_LEN_REG (0xA4500004)');
assert(res19.mmioAccesses.includes('AI_STATUS_REG'), 'Expected AI_STATUS_REG (0xA450000C)');
assert(res19.mmioAccesses.includes('VI_WIDTH_REG'), 'Expected VI_WIDTH_REG (0xA4400008)');
console.log('[OK] Test 19: Granular MMIO sub-register mapping with non-zero offsets passed.');

// Test 20: Rodata float constant recognition and clean isolation from mutable globals
const rodataFloatAsm = `
    lui $t0, %hi(D_80085000)
    lwc1 $f0, %lo(D_80085000)($t0)
    lui $t1, %hi(D_80086000)
    lw $a0, %lo(D_80086000)($t1)
    sw $a0, %lo(D_80086000)($t1)
    jr $ra
    nop
`;

const res20 = analyzeAsmBody(rodataFloatAsm);
assert(res20.rodataFloats.includes('D_80085000'), 'Expected D_80085000 in rodataFloats');
assert(res20.rodataSymbols.includes('D_80085000'), 'Expected D_80085000 in rodataSymbols');
assert(!res20.rodataSymbols.includes('D_80086000'), 'Written symbol D_80086000 must NOT be in rodataSymbols');
assert(res20.globalDataWrites.includes('D_80086000'), 'Expected D_80086000 in globalDataWrites');

const stub20 = generateCStub('load_rodata_float', res20, 'math', false);
assert(stub20.includes('Rodata Floats: D_80085000'), 'Expected Rodata Floats in generated comments');
console.log('[OK] Test 20: Rodata float constant recognition and clean isolation passed.');

// Test 21: PIC relocations (%got and %call16) and External Calls tracking
const picAsm = `
    lw $t0, %got(g_BoardContext)($gp)
    lw $t9, %call16(board_init_step)($gp)
    jalr $t9
    nop
    jr $ra
    nop
`;

const res21 = analyzeAsmBody(picAsm);
assert(res21.globalDataReads.includes('g_BoardContext'), 'Expected g_BoardContext in globalDataReads via %got');
assert(res21.calledFunctions.includes('board_init_step'), 'Expected board_init_step in calledFunctions via %call16');

const stub21 = generateCStub('board_dispatch', res21, 'board', false);
assert(stub21.includes('External Calls: board_init_step'), 'Expected External Calls in generated stub comments');
console.log('[OK] Test 21: PIC relocations (%got and %call16) and External Calls tracking passed.');

// Test 22: Unaligned memory access instructions (lwl, lwr, swl, swr)
const unalignedAsm = `
    lwl $t0, 0($a0)
    lwr $t0, 3($a0)
    swl $t0, 0($a1)
    swr $t0, 3($a1)
    jr $ra
    nop
`;

const res22 = analyzeAsmBody(unalignedAsm);
assert(res22.hasUnalignedAccess, 'Expected hasUnalignedAccess true');
const stub22 = generateCStub('copy_unaligned_word', res22, 'memory', false);
assert(stub22.includes('Features: Unaligned Memory Access (lwl/lwr/swl/swr)'),
    'Expected Unaligned Memory Access annotation in comments');
console.log('[OK] Test 22: Unaligned memory access instructions and annotation passed.');

// Test 23: Resilient error reporting and #pragma GLOBAL_ASM generation during malformed/edge-case stubs
const tempErrAsmDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mparty_err_asm_'));
const tempErrSrcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mparty_err_src_'));

try {
    const errAsmFile = path.join(tempErrAsmDir, 'malformed.s');
    fs.writeFileSync(errAsmFile, `
glabel func_empty_body

glabel func_edge_case
    addiu $sp, $sp, -0x10
    jr $ra
    nop
`);

    const stats = processDirectory(tempErrAsmDir, tempErrSrcDir);
    assert.strictEqual(stats.processedFiles.length, 1, 'Expected 1 processed file');
    assert.strictEqual(stats.totalFunctions, 2, 'Expected 2 functions parsed');
    assert(stats.warningsCount > 0, 'Expected warnings from empty body function');
    assert(stats.warnings && stats.warnings.length > 0, 'Expected detailed warnings list');

    const generatedC = fs.readFileSync(path.join(tempErrSrcDir, 'malformed.c'), 'utf8');
    assert(generatedC.includes('#pragma GLOBAL_ASM("asm/nonmatchings/malformed/func_empty_body.s")'),
        'Expected GLOBAL_ASM fallback for func_empty_body despite empty body');
    assert(generatedC.includes('#pragma GLOBAL_ASM("asm/nonmatchings/malformed/func_edge_case.s")'),
        'Expected GLOBAL_ASM fallback for func_edge_case');
    assert(generatedC.includes('Parse Warnings: Empty or invalid assembly body provided'),
        'Expected parse warning annotation in comment');
    console.log('[OK] Test 23: Resilient error reporting and #pragma GLOBAL_ASM generation passed.');
} finally {
    fs.rmSync(tempErrAsmDir, { recursive: true, force: true });
    fs.rmSync(tempErrSrcDir, { recursive: true, force: true });
}

// Test 24: Float and double pointer parameter inferencing (f32* and f64*)
const floatPtrAsm = `
    lwc1 $f0, 0($a0)
    ldc1 $f2, 0($a1)
    swc1 $f0, 0($a2)
    sdc1 $f2, 0($a3)
    jr $ra
    nop
`;

const res24 = analyzeAsmBody(floatPtrAsm);
assert(res24.params.includes('const f32* a0'), 'Expected const f32* a0 parameter');
assert(res24.params.includes('const f64* a1'), 'Expected const f64* a1 parameter');
assert(res24.params.includes('f32* a2'), 'Expected mutable f32* a2 parameter');
assert(res24.params.includes('f64* a3'), 'Expected mutable f64* a3 parameter');
console.log('[OK] Test 24: Float and double pointer parameter inferencing passed.');

// Test 25: Const qualifier inferencing on read-only pointer parameters
const constPointerAsm = `
    lw $t0, 0x0($a0)
    lw $t1, 0x4($a0)
    lbu $t2, 0($a1)
    sw $t0, 0($a2)
    jr $ra
    nop
`;

const res25 = analyzeAsmBody(constPointerAsm);
assert(res25.params.includes('const void* a0 /* struct */'), 'Expected const struct pointer for read-only multi-offset accesses');
assert(res25.params.includes('const u8* a1'), 'Expected const u8* for read-only byte accesses');
assert(res25.params.includes('void* a2'), 'Expected mutable void* for stored pointer target');
assert(!res25.params.includes('const void* a2'), 'Stored pointer target a2 must not be const');
console.log('[OK] Test 25: Const qualifier inferencing on read-only pointer parameters passed.');

// Test 26: Function symbol directives (.globl, .global, .ent, glabel)
const multiDirectiveAsm = `
.globl func_globl
    addu $v0, $a0, $a1
    jr $ra
    nop

.ent func_ent
    subu $v0, $a0, $a1
    jr $ra
    nop

glabel func_glabel
    mult $a0, $a1
    mflo $v0
    jr $ra
    nop
`;

const extractedDirectives = extractFunctionsFromAsm(multiDirectiveAsm);
assert.strictEqual(extractedDirectives.length, 3, 'Expected 3 extracted functions across directives');
assert.strictEqual(extractedDirectives[0].name, 'func_globl');
assert.strictEqual(extractedDirectives[1].name, 'func_ent');
assert.strictEqual(extractedDirectives[2].name, 'func_glabel');
console.log('[OK] Test 26: Function symbol directives (.globl, .global, .ent, glabel) passed.');

// Test 27: Pointer return type inference and return NULL; stub generation
const ptrReturnAsm = `
    lw $t0, 0($a0)
    addiu $v0, $a0, 0x10
    jr $ra
    nop
`;

const res27 = analyzeAsmBody(ptrReturnAsm);
assert.strictEqual(res27.returnType, 'void*', 'Expected returnType void*');
const stub27 = generateCStub('get_struct_subfield', res27, 'core', true);
assert(stub27.includes('void* get_struct_subfield('), 'Expected void* return signature');
assert(stub27.includes('return NULL;'), 'Expected return NULL; fallback in C stub');
console.log('[OK] Test 27: Pointer return type inference and return NULL; stub generation passed.');

// Test 28: Trivial leaf function detection and direct return synthesis
const trivialGetterAsm = `
    move $v0, $a0
    jr $ra
    nop
`;

const res28 = analyzeAsmBody(trivialGetterAsm);
assert.strictEqual(res28.isTrivialLeaf, true, 'Expected isTrivialLeaf true');
assert.strictEqual(res28.trivialReturnExpr, 'a0', 'Expected trivialReturnExpr a0');
const stub28 = generateCStub('trivial_identity', res28, 'core', true);
assert(stub28.includes('return a0;'), 'Expected direct return a0; body in generated stub');

const trivialConstAsm = `
    li $v0, 42
    jr $ra
    nop
`;

const res28Const = analyzeAsmBody(trivialConstAsm);
assert.strictEqual(res28Const.trivialReturnExpr, '42', 'Expected trivialReturnExpr 42');
const stub28Const = generateCStub('get_constant_val', res28Const, 'core', true);
assert(stub28Const.includes('return 42;'), 'Expected direct return 42; body in generated stub');
console.log('[OK] Test 28: Trivial leaf function detection and direct return synthesis passed.');

console.log('\nAll c_stubber tests passed successfully!');
