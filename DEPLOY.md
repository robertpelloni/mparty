# DEPLOY

## Environment Setup Instructions

### Prerequisites
- **Python 3.8+**: Required for ROM splitting tools.
- **Node.js (v18+)**: Required for parsing and JS-based tooling.
- **Make & GCC Toolchain**: Required for N64 ROM recompilation (e.g., `mips-linux-gnu-gcc` or `kmc-gcc`).

### Installation
1. Clone the repository and initialize submodules:
   ```bash
   git clone <repo_url>
   git submodule update --init --recursive
   ```
2. Setup Python environment for tools:
   ```bash
   cd tools
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt # (Once added)
   ```
3. Setup Node.js tools:
   ```bash
   npm install
   ```

### Running the Pipeline
- **Splitting a ROM**: `python tools/generate_splat.py <path_to_z64>`
- **Disassembling**: `python tools/disassemble.py <path_to_yaml>`
- **Stubbing**: `node tools/c_stubber.js ./asm/nonmatchings`
- **Building**: Run `make` in the root directory.