#!/usr/bin/env node
/**
 * c_stubber.js
 *
 * Parses generated .s assembly files and nonmatching assembly blocks (e.g. asm/nonmatchings),
 * extracts function signatures and performs advanced MIPS instruction analysis:
 * - Differentiates load vs store semantics to accurately register reads vs writes
 * - Infers pointer and struct/array arguments with offset spread analysis
 * - Distinguishes 32-bit (s32), 64-bit (s64), boolean flags (s32 boolean), float (f32), double (f64), and void returns
 * - Detects 64-bit integer argument pairs ($a0-$a1) and double-precision float parameters ($f12 as f64)
 * - Identifies loop structures and documents callee-saved register usage ($s0-$s7, $fp)
 * - Supports generating `#pragma GLOBAL_ASM("asm/nonmatchings/...")` fallbacks for byte-parity
 */

const fs = require('fs');
const path = require('path');

// Regex to identify function definitions in MIPS assembly (e.g., glabel func_80000000 or .globl/.ent func_80000000)
const FUNC_LABEL_REGEX = /(?:glabel|\.global|\.globl|\.ent)\s+([a-zA-Z0-9_]+)/g;

const STORE_OPCODES = new Set(['sw', 'sh', 'sb', 'sd', 'swc1', 'sdc1', 'swl', 'swr', 'sdl', 'sdr']);
const LOAD_OPCODES = new Set(['lw', 'lh', 'lhu', 'lb', 'lbu', 'ld', 'lwc1', 'ldc1', 'lwl', 'lwr', 'ldl', 'ldr']);
const UNALIGNED_OPCODES = new Set(['lwl', 'lwr', 'ldl', 'ldr', 'swl', 'swr', 'sdl', 'sdr']);
// Explicit unsigned operations (excluding addu which is GCC MIPS standard for signed add without integer overflow trap)
const UNSIGNED_OPS = new Set(['lbu', 'lhu', 'sltu', 'sltiu', 'divu', 'multu']);
const CALLEE_SAVED_REGS = new Set(['$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7', '$fp', '$s8']);
const BRANCH_OPCODES = new Set(['bne', 'beq', 'bgez', 'bgtz', 'blez', 'bltz', 'bnez', 'beqz']);

// Known N64 hardware MMIO register address ranges and names (0x04000000 physical / 0xA4000000 uncached)
const MMIO_REGISTER_MAP = {
    '0xA4000000': 'SP_MEM_ADDR_REG',
    '0xA4000004': 'SP_DRAM_ADDR_REG',
    '0xA4000008': 'SP_RD_LEN_REG',
    '0xA400000C': 'SP_WR_LEN_REG',
    '0xA4040000': 'SP_STATUS_REG',
    '0xA4040004': 'SP_DMA_FULL_REG',
    '0xA4040008': 'SP_DMA_BUSY_REG',
    '0xA404000C': 'SP_SEMAPHORE_REG',
    '0xA4080000': 'SP_PC_REG',
    '0xA4080004': 'SP_IBIST_REG',
    '0xA4100000': 'DPC_START_REG',
    '0xA4100004': 'DPC_END_REG',
    '0xA4100008': 'DPC_CURRENT_REG',
    '0xA410000C': 'DPC_STATUS_REG',
    '0xA4100010': 'DPC_CLOCK_REG',
    '0xA4100014': 'DPC_BUFBUSY_REG',
    '0xA4100018': 'DPC_PIPEBUSY_REG',
    '0xA410001C': 'DPC_TMEM_REG',
    '0xA4200000': 'DPS_TBIST_REG',
    '0xA4200004': 'DPS_TEST_MODE_REG',
    '0xA4200008': 'DPS_BUFTEST_ADDR_REG',
    '0xA420000C': 'DPS_BUFTEST_DATA_REG',
    '0xA4300000': 'MI_INTR_REG', // Base address for MI interface
    '0xA4300004': 'MI_VERSION_REG',
    '0xA4300008': 'MI_INTR_REG_ALT',
    '0xA430000C': 'MI_INTR_MASK_REG',
    '0xA4400000': 'VI_CONTROL_REG',
    '0xA4400004': 'VI_ORIGIN_REG',
    '0xA4400008': 'VI_WIDTH_REG',
    '0xA440000C': 'VI_INTR_REG',
    '0xA4400010': 'VI_V_CURRENT_LINE_REG',
    '0xA4500000': 'AI_DRAM_ADDR_REG',
    '0xA4500004': 'AI_LEN_REG',
    '0xA4500008': 'AI_CONTROL_REG',
    '0xA450000C': 'AI_STATUS_REG',
    '0xA4500010': 'AI_DACRATE_REG',
    '0xA4500014': 'AI_BITRATE_REG',
    '0xA4600000': 'PI_DRAM_ADDR_REG',
    '0xA4600004': 'PI_CART_ADDR_REG',
    '0xA4600008': 'PI_RD_LEN_REG',
    '0xA460000C': 'PI_WR_LEN_REG',
    '0xA4600010': 'PI_STATUS_REG',
    '0xA4600014': 'PI_BSD_DOM1_LAT_REG',
    '0xA4600018': 'PI_BSD_DOM1_PWD_REG',
    '0xA460001C': 'PI_BSD_DOM1_PGS_REG',
    '0xA4600020': 'PI_BSD_DOM1_RLS_REG',
    '0xA4700000': 'RI_MODE_REG',
    '0xA4700004': 'RI_CONFIG_REG',
    '0xA4700008': 'RI_CURRENT_LOAD_REG',
    '0xA470000C': 'RI_SELECT_REG',
    '0xA4700010': 'RI_REFRESH_REG',
    '0xA4700014': 'RI_LATENCY_REG',
    '0xA4700018': 'RI_RERROR_REG',
    '0xA470001C': 'RI_WERROR_REG',
    '0xA4800000': 'SI_DRAM_ADDR_REG',
    '0xA4800004': 'SI_PIF_ADDR_RD64B_REG',
    '0xA4800010': 'SI_PIF_ADDR_WR64B_REG',
    '0xA4800018': 'SI_STATUS_REG'
};

// Known MIPS System Control Coprocessor (COP0) registers
const COP0_REGISTER_MAP = {
    '$0': 'Index',
    '$1': 'Random',
    '$2': 'EntryLo0',
    '$3': 'EntryLo1',
    '$4': 'Context',
    '$5': 'PageMask',
    '$6': 'Wired',
    '$8': 'BadVAddr',
    '$9': 'Count',
    '$10': 'EntryHi',
    '$11': 'Compare',
    '$12': 'Status',
    '$13': 'Cause',
    '$14': 'EPC',
    '$15': 'PRId',
    '$16': 'Config',
    '$18': 'WatchLo',
    '$19': 'WatchHi',
    '$28': 'TagLo',
    '$29': 'TagHi',
    '$30': 'ErrorEPC'
};

/**
 * Analyzes assembly instructions within a function body to infer:
 * 1. Argument types (pointers vs struct pointers vs scalars, float vs double vs integer)
 * 2. Return types (s32, s64, f32, f64, void, boolean indicator)
 * 3. Stack frame size, saved registers, loops & leaf status
 * 4. Control-flow structures (jump tables, loops)
 * 5. Memory-mapped I/O (MMIO) and hardware register access
 * 6. Read-only data (.rodata) and jump table symbol references
 */
function analyzeAsmBody(body) {
    if (!body || typeof body !== 'string') {
        return {
            returnType: 'void',
            params: 'void',
            isLeaf: true,
            hasJumpTable: false,
            hasLoop: false,
            isBooleanV0: false,
            mmioAccesses: [],
            rodataSymbols: [],
            savedRegisters: [],
            stackSize: 0,
            parseErrors: ['Empty or invalid assembly body provided']
        };
    }

    const lines = body.split('\n');

    let usesV0 = false;
    let usesV1 = false;
    let usesF0 = false;
    let usesDoubleF0 = false;
    let isBooleanV0 = false;
    let isPointerV0 = false;
    let pointerV0Type = 'void*';
    let isUnsignedV0 = false;
    let hasJal = false;
    let hasJumpTable = false;
    let hasLoop = false;
    let hasUnalignedAccess = false;
    let stackSize = 0;
    let trivialReturnExpr = null; // e.g. "a0", "0", "NULL"

    let f12IsDouble = false;
    let f14IsDouble = false;
    let a0Is64Bit = false;

    const argRegisters = new Set();
    const unsignedArgs = new Set();
    const pointerOffsets = new Map(); // reg -> Set of offsets accessed
    const pointerSubwordTypes = new Map(); // reg -> 'u8' | 's8' | 'u16' | 's16'
    const pointerFloatTypes = new Map(); // reg -> 'f32' | 'f64'
    const pointerHasStores = new Set(); // reg -> accessed via store instruction
    const volatileMmioArgs = new Set(); // reg accessed with hardware MMIO base
    const cop0Registers = new Set();
    const savedRegisters = new Set();
    const writtenRegisters = new Set();
    const mmioAccesses = new Set();
    const rodataSymbols = new Set();
    const rodataFloats = new Set();
    const tlsSymbols = new Set();
    const calledFunctions = new Set();
    const globalDataReads = new Set();
    const globalDataWrites = new Set();
    const registerUpperConstants = new Map(); // reg -> 0xXXXX
    const stackArgs = []; // e.g., 5th+ arg loaded from $sp + stackSize + offset
    const parseErrors = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const rawLine = lines[lineIdx];
        // Strip comments and leading/trailing whitespace
        const line = rawLine.split('#')[0].split(';')[0].trim();
        if (!line) continue;

        let tokens;
        try {
            tokens = line.split(/[,\s()]+/).filter(Boolean);
        } catch (err) {
            parseErrors.push(`Line ${lineIdx + 1}: Failed to tokenize line: ${err.message}`);
            continue;
        }
        if (tokens.length === 0) continue;

        const opcode = tokens[0];

        // Detect unaligned memory operations
        if (UNALIGNED_OPCODES.has(opcode)) {
            hasUnalignedAccess = true;
        }

        // Detect function calls
        if (opcode === 'jal' || opcode === 'jalr') {
            hasJal = true;
        }

        // Detect COP0 coprocessor register instructions (mfc0 $rt, $rd or mtc0 $rt, $rd)
        if (opcode === 'mfc0' || opcode === 'mtc0') {
            const cop0Reg = tokens[2];
            if (cop0Reg) {
                const regName = COP0_REGISTER_MAP[cop0Reg] || cop0Reg;
                cop0Registers.add(regName);
            }
        }

        // Detect indirect branch/jump table (jr $tX where not $ra)
        if (opcode === 'jr' && tokens[1] && tokens[1] !== '$ra') {
            hasJumpTable = true;
        }

        // Detect loops via backward branch instructions
        if (BRANCH_OPCODES.has(opcode)) {
            hasLoop = true;
        }

        // Detect stack adjustment in prologue
        const stackMatch = line.match(/addiu\s+\$sp,\s*\$sp,\s*-([0-9a-fA-Fx]+)/);
        if (stackMatch) {
            stackSize = parseInt(stackMatch[1], 16) || parseInt(stackMatch[1], 10) || 0;
        }

        // Detect callee-saved register preservation
        if (STORE_OPCODES.has(opcode)) {
            for (let i = 1; i < tokens.length; i++) {
                if (CALLEE_SAVED_REGS.has(tokens[i])) {
                    savedRegisters.add(tokens[i]);
                }
            }
        }

        // Detect double-precision float operations on argument registers
        if (opcode.endsWith('.d') || opcode === 'ldc1' || opcode === 'sdc1') {
            if (tokens.includes('$f12')) f12IsDouble = true;
            if (tokens.includes('$f14')) f14IsDouble = true;
        }

        // Detect 64-bit load/store operations on $a0
        if ((opcode === 'ld' || opcode === 'sd') && tokens.includes('$a0')) {
            a0Is64Bit = true;
        }

        // Detect lui pattern for upper constant loading (e.g. lui $t0, %hi(D_80040000) or lui $v0, 0xA430)
        if (opcode === 'lui' && tokens[1] && tokens[2]) {
            const destReg = tokens[1];
            const hiMatch = line.match(/%hi\(([a-zA-Z0-9_]+)\)/);
            if (hiMatch) {
                rodataSymbols.add(hiMatch[1]);
            } else {
                const hexVal = parseInt(tokens[2], 16);
                if (!isNaN(hexVal)) {
                    registerUpperConstants.set(destReg, hexVal);
                }
            }
        }

        // Detect %lo(symbol) references in instructions (e.g., lw $a0, %lo(D_80040000)($t0))
        const loMatch = line.match(/%lo\(([a-zA-Z0-9_]+)\)/);
        if (loMatch) {
            const sym = loMatch[1];
            rodataSymbols.add(sym);
            if (opcode === 'lwc1' || opcode === 'ldc1') {
                rodataFloats.add(sym);
            }
            if (STORE_OPCODES.has(opcode)) {
                globalDataWrites.add(sym);
            } else if (LOAD_OPCODES.has(opcode)) {
                globalDataReads.add(sym);
            }
        }

        // Detect TLS thread-local storage relocations (%dtprel_hi, %dtprel_lo, %tprel_hi, %tprel_lo)
        const tlsMatch = line.match(/%(?:dtprel_hi|dtprel_lo|tprel_hi|tprel_lo)\(([a-zA-Z0-9_]+)\)/);
        if (tlsMatch) {
            const sym = tlsMatch[1];
            tlsSymbols.add(sym);
            if (STORE_OPCODES.has(opcode)) {
                globalDataWrites.add(sym);
            } else if (LOAD_OPCODES.has(opcode)) {
                globalDataReads.add(sym);
            }
        }

        // Detect %got(symbol) references for PIC Global Offset Table entries
        const gotMatch = line.match(/%got\(([a-zA-Z0-9_]+)\)/);
        if (gotMatch) {
            const sym = gotMatch[1];
            rodataSymbols.add(sym);
            if (STORE_OPCODES.has(opcode)) {
                globalDataWrites.add(sym);
            } else if (LOAD_OPCODES.has(opcode)) {
                globalDataReads.add(sym);
            }
        }

        // Detect %call16(symbol) references for PIC external calls
        const call16Match = line.match(/%call16\(([a-zA-Z0-9_]+)\)/);
        if (call16Match) {
            calledFunctions.add(call16Match[1]);
        }

        // Detect %gp_rel(symbol) references for small data/BSS
        const gpMatch = line.match(/%gp_rel\(([a-zA-Z0-9_]+)\)/);
        if (gpMatch) {
            const sym = gpMatch[1];
            rodataSymbols.add(sym);
            if (STORE_OPCODES.has(opcode)) {
                globalDataWrites.add(sym);
            } else if (LOAD_OPCODES.has(opcode)) {
                globalDataReads.add(sym);
            }
        }

        // Detect MMIO accesses (e.g., lw $t1, 0($t0) where $t0 loaded with 0xA430 / 0x0430)
        for (const [reg, upper] of registerUpperConstants.entries()) {
            const regMemMatch = line.match(new RegExp(`(-?[0-9a-fA-Fx]*)\\(\\${reg}\\)`));
            if (regMemMatch) {
                const rawOffset = regMemMatch[1] || '0';
                const offsetVal = rawOffset.startsWith('0x') || rawOffset.startsWith('-0x')
                    ? parseInt(rawOffset, 16)
                    : parseInt(rawOffset, 10) || 0;

                const baseAddr = ((upper & 0xFFFF) << 16) >>> 0;
                const fullAddr = (baseAddr + offsetVal) >>> 0;
                const formattedAddr = '0x' + fullAddr.toString(16).toUpperCase().padStart(8, '0');

                if (MMIO_REGISTER_MAP[formattedAddr]) {
                    mmioAccesses.add(MMIO_REGISTER_MAP[formattedAddr]);
                } else if ((fullAddr & 0xFFF00000) === 0xA4000000 || (fullAddr & 0xFFF00000) === 0x04000000) {
                    mmioAccesses.add(`MMIO_${formattedAddr}`);
                }
                if (['$a0', '$a1', '$a2', '$a3'].includes(reg)) {
                    volatileMmioArgs.add(reg);
                }
            }
        }

        // Detect return register writes
        if (opcode !== 'jr' && opcode !== 'jal' && !STORE_OPCODES.has(opcode)) {
            if (tokens[1] === '$v0') {
                usesV0 = true;
                if (['slt', 'slti', 'sltu', 'sltiu'].includes(opcode)) {
                    isBooleanV0 = true;
                }
                // Check if $v0 is loaded/moved from a parameter or zero
                if (opcode === 'move' || opcode === 'or' || opcode === 'addu') {
                    if (tokens[2] === '$zero' || tokens[3] === '$zero') {
                        trivialReturnExpr = '0';
                    } else if (['$a0', '$a1', '$a2', '$a3'].includes(tokens[2])) {
                        trivialReturnExpr = tokens[2].replace('$', '');
                    }
                } else if (opcode === 'li') {
                    trivialReturnExpr = tokens[2];
                } else if (opcode === 'andi' && tokens[2] && tokens[3]) {
                    const srcArg = tokens[2].replace('$', '');
                    trivialReturnExpr = `${srcArg} & ${tokens[3]}`;
                } else if (opcode === 'ori' && tokens[2] && tokens[3]) {
                    const srcArg = tokens[2].replace('$', '');
                    trivialReturnExpr = `${srcArg} | ${tokens[3]}`;
                } else if (opcode === 'xori' && tokens[2] && tokens[3]) {
                    const srcArg = tokens[2].replace('$', '');
                    trivialReturnExpr = `${srcArg} ^ ${tokens[3]}`;
                } else if (opcode === 'sll' && tokens[2] && tokens[3]) {
                    const srcArg = tokens[2].replace('$', '');
                    trivialReturnExpr = `${srcArg} << ${tokens[3]}`;
                } else if ((opcode === 'sra' || opcode === 'srl') && tokens[2] && tokens[3]) {
                    const srcArg = tokens[2].replace('$', '');
                    trivialReturnExpr = `${srcArg} >> ${tokens[3]}`;
                }
                // Check if $v0 is loaded/moved from a pointer parameter or symbol offset
                if (opcode === 'move' && [' $a0', '$a1', '$a2', '$a3'].some(a => tokens[2] === a.trim())) {
                    if (pointerOffsets.has(tokens[2])) {
                        isPointerV0 = true;
                    }
                }
                if ((opcode === 'addiu' || opcode === 'addu') && [' $a0', '$a1', '$a2', '$a3'].some(a => tokens[2] === a.trim())) {
                    if (pointerOffsets.has(tokens[2])) {
                        isPointerV0 = true;
                    }
                }
                if (opcode === 'la' || (opcode === 'addiu' && line.includes('%lo('))) {
                    isPointerV0 = true;
                }
            }
            if (tokens[1] === '$v1') usesV1 = true;
            if (tokens[1] === '$f0') {
                usesF0 = true;
                if (opcode.endsWith('.d')) {
                    usesDoubleF0 = true;
                }
                // Check if $f0 is moved from $f12 or zeroed
                if (opcode === 'mov.s' || opcode === 'mov.d') {
                    if (tokens[2] === '$f12') {
                        trivialReturnExpr = 'f12';
                    }
                } else if (opcode === 'mtc1' && tokens[2] === '$zero') {
                    trivialReturnExpr = opcode.endsWith('.d') ? '0.0' : '0.0f';
                }
            }
        }

        // Detect memory dereferences and record offset accesses
        const memMatch = line.match(/(?:[a-z0-9_]+)\s+[^,]+,\s*(-?[0-9a-fA-Fx]*)\((\$[a-zA-Z0-9_]+)\)/);
        if (memMatch) {
            const rawOffset = memMatch[1] || '0';
            const baseReg = memMatch[2];
            const offsetVal = rawOffset.startsWith('0x') || rawOffset.startsWith('-0x')
                ? parseInt(rawOffset, 16)
                : parseInt(rawOffset, 10) || 0;

            if (['$a0', '$a1', '$a2', '$a3'].includes(baseReg)) {
                if (!pointerOffsets.has(baseReg)) {
                    pointerOffsets.set(baseReg, new Set());
                }
                pointerOffsets.get(baseReg).add(offsetVal);

                if (STORE_OPCODES.has(opcode)) {
                    pointerHasStores.add(baseReg);
                }

                // Track subword load/store type granularity
                if (opcode === 'lbu' || opcode === 'sb') {
                    pointerSubwordTypes.set(baseReg, 'u8');
                } else if (opcode === 'lb') {
                    if (!pointerSubwordTypes.has(baseReg)) pointerSubwordTypes.set(baseReg, 's8');
                } else if (opcode === 'lhu' || opcode === 'sh') {
                    if (!pointerSubwordTypes.has(baseReg)) pointerSubwordTypes.set(baseReg, 'u16');
                } else if (opcode === 'lh') {
                    if (!pointerSubwordTypes.has(baseReg)) pointerSubwordTypes.set(baseReg, 's16');
                }

                // Track floating-point load/store pointer type granularity
                if (opcode === 'ldc1' || opcode === 'sdc1') {
                    pointerFloatTypes.set(baseReg, 'f64');
                } else if (opcode === 'lwc1' || opcode === 'swc1') {
                    if (!pointerFloatTypes.has(baseReg)) pointerFloatTypes.set(baseReg, 'f32');
                }
            }

            // Detect stack argument loading (N64 standard ABI: arguments beyond 4th passed at caller $sp offsets: 0x10, 0x14, etc.)
            if (baseReg === '$sp' && LOAD_OPCODES.has(opcode)) {
                if (stackSize > 0 && offsetVal >= stackSize) {
                    const stackArgIdx = Math.floor((offsetVal - stackSize) / 4) + 4;
                    if (!stackArgs.includes(`s32 a${stackArgIdx} /* from stack */`)) {
                        stackArgs.push(`s32 a${stackArgIdx} /* from stack */`);
                    }
                } else if (stackSize === 0 && offsetVal >= 0x10) {
                    // Leaf function using caller's incoming argument area
                    const stackArgIdx = Math.floor((offsetVal - 0x10) / 4) + 4;
                    if (!stackArgs.includes(`s32 a${stackArgIdx} /* from stack */`)) {
                        stackArgs.push(`s32 a${stackArgIdx} /* from stack */`);
                    }
                }
            }
        }

        // Track unsigned operations on arguments and return values
        if (UNSIGNED_OPS.has(opcode)) {
            if (tokens[1] === '$v0') isUnsignedV0 = true;
            for (let i = 1; i < tokens.length; i++) {
                if (['$a0', '$a1', '$a2', '$a3'].includes(tokens[i])) {
                    unsignedArgs.add(tokens[i]);
                }
            }
        }

        // Track register dependencies (read vs write)
        if (STORE_OPCODES.has(opcode)) {
            for (let i = 1; i < tokens.length; i++) {
                const reg = tokens[i];
                if (['$a0', '$a1', '$a2', '$a3', '$f12', '$f14'].includes(reg)) {
                    if (!writtenRegisters.has(reg) || volatileMmioArgs.has(reg)) {
                        argRegisters.add(reg);
                    }
                }
            }
        } else {
            for (let i = 2; i < tokens.length; i++) {
                const reg = tokens[i];
                if (['$a0', '$a1', '$a2', '$a3', '$f12', '$f14'].includes(reg)) {
                    if (!writtenRegisters.has(reg) || volatileMmioArgs.has(reg)) {
                        argRegisters.add(reg);
                    }
                }
            }
            if (tokens[1] && tokens[1].startsWith('$') && !volatileMmioArgs.has(tokens[1])) {
                writtenRegisters.add(tokens[1]);
            }
        }
    }

    // Determine return type
    let returnType = 'void';
    if (usesDoubleF0) {
        returnType = 'f64';
    } else if (usesF0) {
        returnType = 'f32';
    } else if (usesV0 && usesV1) {
        returnType = 's64';
    } else if (usesV0) {
        if (isPointerV0) {
            returnType = pointerV0Type;
        } else {
            returnType = isUnsignedV0 ? 'u32' : 's32';
        }
    }

    // Determine parameter list with struct and float precision analysis
    const params = [];
    if (argRegisters.has('$f12')) {
        params.push(f12IsDouble ? 'f64 f12' : 'f32 f12');
        if (argRegisters.has('$f14')) {
            params.push(f14IsDouble ? 'f64 f14' : 'f32 f14');
        }
    } else {
        const sortedArgs = ['$a0', '$a1', '$a2', '$a3'].filter(r => argRegisters.has(r));
        if (sortedArgs.length === 0 && stackArgs.length === 0) {
            params.push('void');
        } else {
            for (let idx = 0; idx < sortedArgs.length; idx++) {
                const reg = sortedArgs[idx];
                const name = reg.replace('$', '');
                const typeName = unsignedArgs.has(reg) ? 'u32' : 's32';

                if (reg === '$a0' && a0Is64Bit) {
                    params.push(`s64 ${name}`);
                    // Skip $a1 as it is consumed as part of 64-bit pair
                    if (sortedArgs[idx + 1] === '$a1') {
                        idx++;
                    }
                } else if (pointerOffsets.has(reg)) {
                    const offsets = pointerOffsets.get(reg);
                    const subType = pointerSubwordTypes.get(reg);
                    const floatType = pointerFloatTypes.get(reg);
                    const isConst = !pointerHasStores.has(reg) && !volatileMmioArgs.has(reg);
                    const constPrefix = isConst ? 'const ' : '';

                    if (volatileMmioArgs.has(reg)) {
                        params.push(`volatile u32* ${name}`);
                    } else if (offsets.size > 1) {
                        params.push(`${constPrefix}void* ${name} /* struct */`);
                    } else if (subType) {
                        params.push(`${constPrefix}${subType}* ${name}`);
                    } else if (floatType) {
                        params.push(`${constPrefix}${floatType}* ${name}`);
                    } else if (unsignedArgs.has(reg)) {
                        params.push(`${constPrefix}u8* ${name}`);
                    } else {
                        params.push(`${constPrefix}void* ${name}`);
                    }
                } else {
                    params.push(`${typeName} ${name}`);
                }
            }
            if (stackArgs.length > 0) {
                params.push(...stackArgs);
            }
        }
    }

    const isTrivialLeaf = !hasJal && stackSize === 0 && !hasLoop && !hasJumpTable && savedRegisters.size === 0;

    return {
        returnType,
        params: params.join(', '),
        isLeaf: !hasJal,
        isTrivialLeaf,
        trivialReturnExpr: isTrivialLeaf ? trivialReturnExpr : null,
        hasJumpTable,
        hasLoop,
        hasUnalignedAccess,
        isBooleanV0,
        mmioAccesses: Array.from(mmioAccesses).sort(),
        cop0Registers: Array.from(cop0Registers).sort(),
        rodataSymbols: Array.from(rodataSymbols).filter(sym => !globalDataWrites.has(sym)).sort(),
        rodataFloats: Array.from(rodataFloats).sort(),
        tlsSymbols: Array.from(tlsSymbols).sort(),
        calledFunctions: Array.from(calledFunctions).sort(),
        globalDataReads: Array.from(globalDataReads).sort(),
        globalDataWrites: Array.from(globalDataWrites).sort(),
        savedRegisters: Array.from(savedRegisters).sort(),
        stackSize,
        parseErrors
    };
}

/**
 * Extracts individual functions and their bodies from an assembly file string.
 */
function extractFunctionsFromAsm(code) {
    const lines = code.split('\n');
    const functions = [];

    let currentFunc = null;
    let currentBody = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const startMatch = /(?:glabel|\.global|\.globl|\.ent)\s+([a-zA-Z0-9_]+)/.exec(line);
        const endMatch = /(?:\.end|glabel_end)\s+([a-zA-Z0-9_]+)/.exec(line);

        if (startMatch) {
            if (currentFunc) {
                functions.push({
                    name: currentFunc,
                    body: currentBody.join('\n')
                });
            }
            currentFunc = startMatch[1];
            currentBody = [];
        } else if (endMatch && currentFunc) {
            functions.push({
                name: currentFunc,
                body: currentBody.join('\n')
            });
            currentFunc = null;
            currentBody = [];
        } else if (currentFunc) {
            currentBody.push(line);
        }
    }

    if (currentFunc) {
        functions.push({
            name: currentFunc,
            body: currentBody.join('\n')
        });
    }

    return functions;
}

/**
 * Formats a C stub with optional #pragma GLOBAL_ASM fallback for non-matching functions.
 */
function generateCStub(funcName, analysis, moduleName = 'common', useGlobalAsm = true, nonmatchingsPrefix = null) {
    let out = `/*\n`;
    out += ` * Function: ${funcName}\n`;
    out += ` * Frame: ${analysis.isLeaf ? 'Leaf' : 'Non-leaf'}, Stack: 0x${(analysis.stackSize || 0).toString(16)}\n`;
    if (analysis.savedRegisters && analysis.savedRegisters.length > 0) {
        out += ` * Saved Regs: ${analysis.savedRegisters.join(', ')}\n`;
    }
    if (analysis.mmioAccesses && analysis.mmioAccesses.length > 0) {
        out += ` * Hardware MMIO: ${analysis.mmioAccesses.join(', ')}\n`;
    }
    if (analysis.cop0Registers && analysis.cop0Registers.length > 0) {
        out += ` * System Control COP0: ${analysis.cop0Registers.join(', ')}\n`;
    }
    if (analysis.rodataSymbols && analysis.rodataSymbols.length > 0) {
        out += ` * Rodata Symbols: ${analysis.rodataSymbols.join(', ')}\n`;
    }
    if (analysis.rodataFloats && analysis.rodataFloats.length > 0) {
        out += ` * Rodata Floats: ${analysis.rodataFloats.join(', ')}\n`;
    }
    if (analysis.tlsSymbols && analysis.tlsSymbols.length > 0) {
        out += ` * Thread-Local Symbols: ${analysis.tlsSymbols.join(', ')}\n`;
    }
    if (analysis.calledFunctions && analysis.calledFunctions.length > 0) {
        out += ` * External Calls: ${analysis.calledFunctions.join(', ')}\n`;
    }
    if (analysis.globalDataReads && analysis.globalDataReads.length > 0) {
        out += ` * Global Reads: ${analysis.globalDataReads.join(', ')}\n`;
    }
    if (analysis.globalDataWrites && analysis.globalDataWrites.length > 0) {
        out += ` * Global Writes: ${analysis.globalDataWrites.join(', ')}\n`;
    }
    if (analysis.isBooleanV0) {
        out += ` * Notes: Returns Boolean Condition Flag (slt)\n`;
    }
    if (analysis.hasLoop) {
        out += ` * Control Flow: Loop detected\n`;
    }
    if (analysis.hasJumpTable) {
        out += ` * Features: Indirect Jump Table (Switch Statement)\n`;
    }
    if (analysis.hasUnalignedAccess) {
        out += ` * Features: Unaligned Memory Access (lwl/lwr/swl/swr)\n`;
    }
    if (analysis.parseErrors && analysis.parseErrors.length > 0) {
        out += ` * Parse Warnings: ${analysis.parseErrors.join('; ')}\n`;
    }
    out += ` */\n`;

    if (useGlobalAsm) {
        const prefix = nonmatchingsPrefix || 'asm/nonmatchings';
        out += `#ifdef NON_MATCHING\n`;
        out += `${analysis.returnType} ${funcName}(${analysis.params}) {\n`;
        if (analysis.trivialReturnExpr !== null && analysis.trivialReturnExpr !== undefined) {
            out += `    return ${analysis.trivialReturnExpr};\n`;
        } else if (analysis.returnType === 's64') {
            out += `    return 0LL;\n`;
        } else if (analysis.returnType === 's32' || analysis.returnType === 'u32') {
            out += `    return 0;\n`;
        } else if (analysis.returnType === 'f64') {
            out += `    return 0.0;\n`;
        } else if (analysis.returnType === 'f32') {
            out += `    return 0.0f;\n`;
        } else if (analysis.returnType.endsWith('*')) {
            out += `    return NULL;\n`;
        } else {
            out += `    // TODO: implement\n`;
        }
        out += `}\n`;
        out += `#else\n`;
        out += `#pragma GLOBAL_ASM("${prefix}/${moduleName}/${funcName}.s")\n`;
        out += `#endif\n\n`;
    } else {
        out += `${analysis.returnType} ${funcName}(${analysis.params}) {\n`;
        if (analysis.trivialReturnExpr !== null && analysis.trivialReturnExpr !== undefined) {
            out += `    return ${analysis.trivialReturnExpr};\n`;
        } else if (analysis.returnType === 's64') {
            out += `    return 0LL;\n`;
        } else if (analysis.returnType === 's32' || analysis.returnType === 'u32') {
            out += `    return 0;\n`;
        } else if (analysis.returnType === 'f64') {
            out += `    return 0.0;\n`;
        } else if (analysis.returnType === 'f32') {
            out += `    return 0.0f;\n`;
        } else if (analysis.returnType.endsWith('*')) {
            out += `    return NULL;\n`;
        } else {
            out += `    // TODO: implement\n`;
        }
        out += `}\n\n`;
    }

    return out;
}

function processAsmFile(asmFilePath, srcDir, stats = null, nonmatchingsPrefix = null) {
    let code;
    try {
        code = fs.readFileSync(asmFilePath, 'utf8');
    } catch (err) {
        if (stats) stats.errors.push(`Failed to read file ${asmFilePath}: ${err.message}`);
        return null;
    }

    const functions = extractFunctionsFromAsm(code);

    if (functions.length === 0) {
        if (stats) stats.skippedFiles.push(asmFilePath);
        return null; // No functions found
    }

    const baseName = path.basename(asmFilePath, '.s');
    const cFilePath = path.join(srcDir, `${baseName}.c`);

    let cContent = `// Automatically generated typed stub for ${baseName}.s\n`;
    cContent += `#include "common.h"\n\n`;

    let fileHasWarnings = false;
    functions.forEach(fn => {
        let analysis;
        try {
            analysis = analyzeAsmBody(fn.body);
        } catch (err) {
            analysis = {
                returnType: 'void',
                params: 'void',
                isLeaf: false,
                hasJumpTable: false,
                hasLoop: false,
                hasUnalignedAccess: false,
                isBooleanV0: false,
                mmioAccesses: [],
                cop0Registers: [],
                rodataSymbols: [],
                rodataFloats: [],
                calledFunctions: [],
                globalDataReads: [],
                globalDataWrites: [],
                savedRegisters: [],
                stackSize: 0,
                parseErrors: [`Function ${fn.name}: Unexpected analysis failure: ${err.message}`]
            };
        }

        if (analysis.parseErrors && analysis.parseErrors.length > 0) {
            fileHasWarnings = true;
            if (stats) {
                stats.warningsCount += analysis.parseErrors.length;
                if (!stats.warnings) stats.warnings = [];
                analysis.parseErrors.forEach(msg => {
                    stats.warnings.push(`${path.basename(asmFilePath)}:${fn.name}: ${msg}`);
                });
            }
        }
        if (stats) stats.totalFunctions++;
        cContent += generateCStub(fn.name, analysis, baseName, true, nonmatchingsPrefix);
    });

    fs.writeFileSync(cFilePath, cContent);
    if (stats) {
        stats.processedFiles.push(cFilePath);
        if (fileHasWarnings) stats.filesWithWarnings++;
    }
    console.log(`Generated ${cFilePath} with ${functions.length} intelligent typed stubs.`);
    return cFilePath;
}

function processDirectory(asmDir, srcDir, stats = null, processNonmatchings = false, nonmatchingsPrefix = null) {
    const isRootCall = !stats;
    const currentStats = stats || {
        totalFunctions: 0,
        processedFiles: [],
        skippedFiles: [],
        filesWithWarnings: 0,
        warningsCount: 0,
        warnings: [],
        errors: []
    };

    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }

    const files = fs.readdirSync(asmDir);
    files.forEach(file => {
        const fullPath = path.join(asmDir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file !== 'nonmatchings' || processNonmatchings) {
                processDirectory(fullPath, path.join(srcDir, file), currentStats, processNonmatchings, nonmatchingsPrefix);
            }
        } else if (file.endsWith('.s')) {
            processAsmFile(fullPath, srcDir, currentStats, nonmatchingsPrefix);
        }
    });

    if (isRootCall) {
        console.log(`\n=== C Stubber Processing Summary ===`);
        console.log(`Total Files Generated: ${currentStats.processedFiles.length}`);
        console.log(`Total Functions Typed: ${currentStats.totalFunctions}`);
        console.log(`Files Skipped: ${currentStats.skippedFiles.length}`);
        console.log(`Warnings Encountered: ${currentStats.warningsCount}`);
        console.log(`Errors Encountered: ${currentStats.errors.length}`);

        const buildDir = path.resolve('build');
        if (fs.existsSync(buildDir)) {
            const reportPath = path.join(buildDir, 'stubber_report.json');
            fs.writeFileSync(reportPath, JSON.stringify(currentStats, null, 2));
            console.log(`Report written to ${reportPath}`);
        }
    }

    return currentStats;
}

function main() {
    const args = process.argv.slice(2);
    let processNonmatchings = false;
    let nonmatchingsPrefix = null;
    const positional = [];

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--process-nonmatchings') {
            processNonmatchings = true;
        } else if (arg === '--nonmatchings-prefix' && i + 1 < args.length) {
            nonmatchingsPrefix = args[++i];
        } else {
            positional.push(arg);
        }
    }

    const asmDir = positional[0] || './asm';
    const srcDir = positional[1] || './src';

    if (!fs.existsSync(asmDir)) {
        console.error(`Error: asm directory '${asmDir}' not found.`);
        process.exit(1);
    }

    console.log(`Stubbing C files from ${asmDir} into ${srcDir}...`);
    processDirectory(asmDir, srcDir, null, processNonmatchings, nonmatchingsPrefix);
    console.log("C stubbing complete.");
}

if (require.main === module) {
    main();
}

module.exports = {
    analyzeAsmBody,
    extractFunctionsFromAsm,
    generateCStub,
    processAsmFile,
    processDirectory
};
