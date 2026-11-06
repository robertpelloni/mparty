#!/usr/bin/env node
/**
 * c_stubber.js
 *
 * Parses generated .s assembly files and nonmatching assembly blocks (e.g. asm/nonmatchings),
 * extracts function signatures and performs advanced MIPS instruction analysis:
 * - Differentiates load vs store semantics to accurately register reads vs writes
 * - Infers pointer arguments when base registers are indexed with offset memory loads/stores
 * - Distinguishes 32-bit (s32), 64-bit (s64), float (f32), double (f64), and void returns
 * - Classifies leaf vs non-leaf call structures and jump table switch statements
 * - Supports generating `#pragma GLOBAL_ASM("asm/nonmatchings/...")` fallbacks for byte-parity
 */

const fs = require('fs');
const path = require('path');

// Regex to identify function definitions in MIPS assembly (e.g., glabel func_80000000)
const FUNC_LABEL_REGEX = /(?:glabel|\.global)\s+([a-zA-Z0-9_]+)/g;

const STORE_OPCODES = new Set(['sw', 'sh', 'sb', 'sd', 'swc1', 'sdc1']);
const LOAD_OPCODES = new Set(['lw', 'lh', 'lhu', 'lb', 'lbu', 'ld', 'lwc1', 'ldc1']);

/**
 * Analyzes assembly instructions within a function body to infer:
 * 1. Argument types (pointers vs scalars, float vs integer)
 * 2. Return types (s32, s64, f32, f64, void)
 * 3. Stack frame size & leaf status
 * 4. Control-flow structures (jump tables, loops)
 */
function analyzeAsmBody(body) {
    const lines = body.split('\n');

    let usesV0 = false;
    let usesV1 = false;
    let usesF0 = false;
    let usesDoubleF0 = false;
    let hasJal = false;
    let hasJumpTable = false;
    let stackSize = 0;

    const argRegisters = new Set();
    const pointerArgs = new Set();
    const writtenRegisters = new Set();

    for (const rawLine of lines) {
        // Strip comments and leading/trailing whitespace
        const line = rawLine.split('#')[0].split(';')[0].trim();
        if (!line) continue;

        const tokens = line.split(/[,\s()]+/).filter(Boolean);
        if (tokens.length === 0) continue;

        const opcode = tokens[0];

        // Detect function calls
        if (opcode === 'jal' || opcode === 'jalr') {
            hasJal = true;
        }

        // Detect indirect branch/jump table (jr $tX where not $ra)
        if (opcode === 'jr' && tokens[1] && tokens[1] !== '$ra') {
            hasJumpTable = true;
        }

        // Detect stack adjustment in prologue
        const stackMatch = line.match(/addiu\s+\$sp,\s*\$sp,\s*-([0-9a-fA-Fx]+)/);
        if (stackMatch) {
            stackSize = parseInt(stackMatch[1], 16) || parseInt(stackMatch[1], 10) || 0;
        }

        // Detect return register writes
        if (opcode !== 'jr' && opcode !== 'jal' && !STORE_OPCODES.has(opcode)) {
            if (tokens[1] === '$v0') usesV0 = true;
            if (tokens[1] === '$v1') usesV1 = true;
            if (tokens[1] === '$f0') {
                usesF0 = true;
                if (opcode.endsWith('.d')) usesDoubleF0 = true;
            }
        }

        // Detect memory dereferences identifying pointer types: e.g., lw $t0, 0($a0) or sw $t0, 4($a1)
        const memMatch = line.match(/(?:[a-z0-9_]+)\s+[^,]+,\s*-?[0-9a-fA-Fx]*\((\$[a-zA-Z0-9_]+)\)/);
        if (memMatch) {
            const baseReg = memMatch[1];
            if (['$a0', '$a1', '$a2', '$a3'].includes(baseReg)) {
                pointerArgs.add(baseReg);
            }
        }

        // Track register dependencies (read vs write)
        if (STORE_OPCODES.has(opcode)) {
            for (let i = 1; i < tokens.length; i++) {
                const reg = tokens[i];
                if (['$a0', '$a1', '$a2', '$a3', '$f12', '$f14'].includes(reg)) {
                    if (!writtenRegisters.has(reg)) {
                        argRegisters.add(reg);
                    }
                }
            }
        } else {
            for (let i = 2; i < tokens.length; i++) {
                const reg = tokens[i];
                if (['$a0', '$a1', '$a2', '$a3', '$f12', '$f14'].includes(reg)) {
                    if (!writtenRegisters.has(reg)) {
                        argRegisters.add(reg);
                    }
                }
            }
            if (tokens[1] && tokens[1].startsWith('$')) {
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
        returnType = 's32';
    }

    // Determine parameter list
    const params = [];
    if (argRegisters.has('$f12')) {
        params.push('f32 f12');
        if (argRegisters.has('$f14')) {
            params.push('f32 f14');
        }
    } else {
        const sortedArgs = ['$a0', '$a1', '$a2', '$a3'].filter(r => argRegisters.has(r));
        if (sortedArgs.length === 0) {
            params.push('void');
        } else {
            sortedArgs.forEach(reg => {
                const name = reg.replace('$', '');
                if (pointerArgs.has(reg)) {
                    params.push(`void* ${name}`);
                } else {
                    params.push(`s32 ${name}`);
                }
            });
        }
    }

    return {
        returnType,
        params: params.join(', '),
        isLeaf: !hasJal,
        hasJumpTable,
        stackSize
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
        const match = /(?:glabel|\.global)\s+([a-zA-Z0-9_]+)/.exec(line);

        if (match) {
            if (currentFunc) {
                functions.push({
                    name: currentFunc,
                    body: currentBody.join('\n')
                });
            }
            currentFunc = match[1];
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
function generateCStub(funcName, analysis, moduleName = 'common', useGlobalAsm = true) {
    let out = `/*\n`;
    out += ` * Function: ${funcName}\n`;
    out += ` * Frame: ${analysis.isLeaf ? 'Leaf' : 'Non-leaf'}, Stack: 0x${analysis.stackSize.toString(16)}\n`;
    if (analysis.hasJumpTable) {
        out += ` * Features: Indirect Jump Table (Switch Statement)\n`;
    }
    out += ` */\n`;

    if (useGlobalAsm) {
        out += `#ifdef NON_MATCHING\n`;
        out += `${analysis.returnType} ${funcName}(${analysis.params}) {\n`;
        if (analysis.returnType === 's64') {
            out += `    return 0LL;\n`;
        } else if (analysis.returnType === 's32') {
            out += `    return 0;\n`;
        } else if (analysis.returnType === 'f64') {
            out += `    return 0.0;\n`;
        } else if (analysis.returnType === 'f32') {
            out += `    return 0.0f;\n`;
        } else {
            out += `    // TODO: implement\n`;
        }
        out += `}\n`;
        out += `#else\n`;
        out += `#pragma GLOBAL_ASM("asm/nonmatchings/${moduleName}/${funcName}.s")\n`;
        out += `#endif\n\n`;
    } else {
        out += `${analysis.returnType} ${funcName}(${analysis.params}) {\n`;
        if (analysis.returnType === 's64') {
            out += `    return 0LL;\n`;
        } else if (analysis.returnType === 's32') {
            out += `    return 0;\n`;
        } else if (analysis.returnType === 'f64') {
            out += `    return 0.0;\n`;
        } else if (analysis.returnType === 'f32') {
            out += `    return 0.0f;\n`;
        } else {
            out += `    // TODO: implement\n`;
        }
        out += `}\n\n`;
    }

    return out;
}

function processAsmFile(asmFilePath, srcDir) {
    const code = fs.readFileSync(asmFilePath, 'utf8');
    const functions = extractFunctionsFromAsm(code);

    if (functions.length === 0) {
        return; // No functions found
    }

    const baseName = path.basename(asmFilePath, '.s');
    const cFilePath = path.join(srcDir, `${baseName}.c`);

    let cContent = `// Automatically generated typed stub for ${baseName}.s\n`;
    cContent += `#include "common.h"\n\n`;

    functions.forEach(fn => {
        const analysis = analyzeAsmBody(fn.body);
        cContent += generateCStub(fn.name, analysis, baseName, true);
    });

    fs.writeFileSync(cFilePath, cContent);
    console.log(`Generated ${cFilePath} with ${functions.length} intelligent typed stubs.`);
}

function processDirectory(asmDir, srcDir) {
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }

    const files = fs.readdirSync(asmDir);
    files.forEach(file => {
        const fullPath = path.join(asmDir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file !== 'nonmatchings') {
                processDirectory(fullPath, path.join(srcDir, file));
            }
        } else if (file.endsWith('.s')) {
            processAsmFile(fullPath, srcDir);
        }
    });
}

function main() {
    const args = process.argv.slice(2);
    const asmDir = args[0] || './asm';
    const srcDir = args[1] || './src';

    if (!fs.existsSync(asmDir)) {
        console.error(`Error: asm directory '${asmDir}' not found.`);
        process.exit(1);
    }

    console.log(`Stubbing C files from ${asmDir} into ${srcDir}...`);
    processDirectory(asmDir, srcDir);
    console.log("C stubbing complete.");
}

if (require.main === module) {
    main();
}

module.exports = {
    analyzeAsmBody,
    extractFunctionsFromAsm,
    generateCStub,
    processAsmFile
};
