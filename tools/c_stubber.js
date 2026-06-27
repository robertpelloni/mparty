#!/usr/bin/env node
/**
 * c_stubber.js
 *
 * Parses generated .s assembly files, extracts function signatures,
 * and generates matching .c files with blank C function stubs.
 */

const fs = require('fs');
const path = require('path');

// Regex to identify function definitions in MIPS assembly (e.g., glabel func_80000000)
const FUNC_REGEX = /glabel\s+([a-zA-Z0-9_]+)/g;

function processAsmFile(asmFilePath, srcDir) {
    const code = fs.readFileSync(asmFilePath, 'utf8');
    const functions = [];

    let match;
    while ((match = FUNC_REGEX.exec(code)) !== null) {
        functions.push(match[1]);
    }

    if (functions.length === 0) {
        return; // No functions found
    }

    const baseName = path.basename(asmFilePath, '.s');
    const cFilePath = path.join(srcDir, `${baseName}.c`);

    let cContent = `// Automatically generated stub for ${baseName}.s\n`;
    cContent += `#include "common.h"\n\n`;

    functions.forEach(funcName => {
        // Create a generic void stub. The actual return type and args
        // will need to be manually refined during matching.
        cContent += `void ${funcName}(void) {\n    // TODO: implement\n}\n\n`;
    });

    fs.writeFileSync(cFilePath, cContent);
    console.log(`Generated ${cFilePath} with ${functions.length} stubs.`);
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

main();
