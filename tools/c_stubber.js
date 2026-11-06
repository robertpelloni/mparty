#!/usr/bin/env node
/**
 * c_stubber.js
 *
 * Parses generated .s assembly files and nonmatching assembly blocks (e.g. asm/nonmatchings),
 * extracts function signatures and analyzes MIPS instruction patterns (argument registers,
 * return value registers, stack frames) to generate intelligent, typed C function stubs.
 */

const fs = require('fs');
const path = require('path');

// Regex to identify function definitions in MIPS assembly (e.g., glabel func_80000000)
const FUNC_LABEL_REGEX = /(?:glabel|\.global)\s+([a-zA-Z0-9_]+)/g;

/**
 * Analyzes assembly instructions within a function body to infer:
 * 1. Argument types and counts (based on initial reads of $a0-$a3, $f12, $f14)
 * 2. Return type (based on writes to $v0, $v1, $f0 before jr $ra)
 * 3. Whether the function is a leaf function (no jal / no $ra saved)
 */
function analyzeAsmBody(body) {
    const lines = body.split('\n');

    let usesV0 = false;
    let usesF0 = false;
    let hasJal = false;
    let stackSize = 0;

    const argRegisters = new Set();
    const writtenRegisters = new Set();

    for (const rawLine of lines) {
        // Strip comments and leading/trailing whitespace
        const line = rawLine.split('#')[0].split(';')[0].trim();
        if (!line) continue;

        // Detect function calls
        if (/\bjal\s+/.test(line) || /\bjalr\s+/.test(line)) {
            hasJal = true;
        }

        // Detect stack adjustment in prologue
        const stackMatch = line.match(/addiu\s+\$sp,\s*\$sp,\s*-([0-9a-fA-Fx]+)/);
        if (stackMatch) {
            stackSize = parseInt(stackMatch[1], 16) || parseInt(stackMatch[1], 10) || 0;
        }

        // Check for return value setting
        if (/\b(?:li|move|lw|add|addu|sub|subu|and|or|xor|ori)\s+\$v0\b/.test(line)) {
            usesV0 = true;
        }
        if (/\b(?:mtc1|mfc1|lwc1|swc1|add\.s|sub\.s|mul\.s|div\.s|mov\.s)\s+\$f0\b/.test(line)) {
            usesF0 = true;
        }

        // Track argument register usage before they are overwritten
        const words = line.split(/[,\s()]+/);
        for (let i = 1; i < words.length; i++) {
            const reg = words[i];
            if (['$a0', '$a1', '$a2', '$a3'].includes(reg)) {
                // If it is used as a source before being written to
                if (i > 1 && !writtenRegisters.has(reg)) {
                    argRegisters.add(reg);
                } else if (i === 1) {
                    // It is the destination register being written
                    writtenRegisters.add(reg);
                }
            } else if (['$f12', '$f14'].includes(reg)) {
                if (i > 1 && !writtenRegisters.has(reg)) {
                    argRegisters.add(reg);
                } else if (i === 1) {
                    writtenRegisters.add(reg);
                }
            }
        }
    }

    // Determine return type
    let returnType = 'void';
    if (usesF0) {
        returnType = 'f32';
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
                params.push(`s32 ${name}`);
            });
        }
    }

    return {
        returnType,
        params: params.join(', '),
        isLeaf: !hasJal,
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
        cContent += `/*\n`;
        cContent += ` * Function: ${fn.name}\n`;
        cContent += ` * Frame: ${analysis.isLeaf ? 'Leaf' : 'Non-leaf'}, Stack: 0x${analysis.stackSize.toString(16)}\n`;
        cContent += ` */\n`;
        cContent += `${analysis.returnType} ${fn.name}(${analysis.params}) {\n`;

        if (analysis.returnType === 's32') {
            cContent += `    return 0;\n`;
        } else if (analysis.returnType === 'f32') {
            cContent += `    return 0.0f;\n`;
        } else {
            cContent += `    // TODO: implement\n`;
        }
        cContent += `}\n\n`;
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
            processDirectory(fullPath, path.join(srcDir, file));
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
    processAsmFile
};
