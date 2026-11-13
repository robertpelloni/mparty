# Makefile for N64 Decompilation Project
#
# This Makefile orchestrates compiling C code and assembling MIPS assembly
# back into a target N64 ROM. It expects a mips-linux-gnu-gcc cross-compiler.

# Tools
CROSS   := mips-linux-gnu-
CC      := $(CROSS)gcc
AS      := $(CROSS)as
LD      := $(CROSS)ld
OBJCOPY := $(CROSS)objcopy

# Project directories
SRC_DIR   := src
ASM_DIR   := asm
BUILD_DIR := build
INCLUDE   := include

# Target ROM
TARGET    := target_rom.z64
ELF       := $(BUILD_DIR)/target_rom.elf

# Flags
CFLAGS  := -O2 -G 0 -I$(INCLUDE) -mabi=32 -mips3 -fno-PIC -c
ASFLAGS := -I$(INCLUDE) -mabi=32 -mips3
LDFLAGS := -T splat.ld -Map $(BUILD_DIR)/target_rom.map

# Find source files (mock structure)
C_FILES   := $(shell find $(SRC_DIR) -type f -name '*.c' 2>/dev/null)
ASM_FILES := $(shell find $(ASM_DIR) -type f -name '*.s' 2>/dev/null)

# Generate object paths
O_FILES   := $(C_FILES:$(SRC_DIR)/%.c=$(BUILD_DIR)/src/%.o) \
             $(ASM_FILES:$(ASM_DIR)/%.s=$(BUILD_DIR)/asm/%.o)

.PHONY: all clean extract extract-mp1 extract-mp2 extract-mp3 setup splat-configs

all: $(TARGET)

# Generate splat configurations for Mario Party 1, 2, 3, and 4
splat-configs:
	python3 tools/generate_splat.py baserom.mp1.z64 --game mp1 --out splat.mp1.yaml
	python3 tools/generate_splat.py baserom.mp2.z64 --game mp2 --out splat.mp2.yaml
	python3 tools/generate_splat.py baserom.mp3.z64 --game mp3 --out splat.mp3.yaml
	python3 tools/generate_splat.py baserom.mp4.iso --game mp4 --out splat.mp4.yaml
	python3 tools/generate_splat.py baserom.z64 --game mp1 --out splat.yaml

# Extract ROM and setup directories using tools
extract: setup
	python3 tools/generate_splat.py baserom.z64
	python3 tools/disassemble.py splat.yaml
	node tools/c_stubber.js asm src

extract-mp1: setup
	mkdir -p asm/mp1 src/mp1 asm/nonmatchings/mp1
	python3 tools/disassemble.py splat.mp1.yaml --asm-dir asm/mp1 --nonmatchings-dir asm/nonmatchings/mp1
	node tools/c_stubber.js asm/mp1 src/mp1 --process-nonmatchings --nonmatchings-prefix asm/nonmatchings/mp1

extract-mp2: setup
	mkdir -p asm/mp2 src/mp2 asm/nonmatchings/mp2
	python3 tools/disassemble.py splat.mp2.yaml --asm-dir asm/mp2 --nonmatchings-dir asm/nonmatchings/mp2
	node tools/c_stubber.js asm/mp2 src/mp2 --process-nonmatchings --nonmatchings-prefix asm/nonmatchings/mp2

extract-mp3: setup
	mkdir -p asm/mp3 src/mp3 asm/nonmatchings/mp3
	python3 tools/disassemble.py splat.mp3.yaml --asm-dir asm/mp3 --nonmatchings-dir asm/nonmatchings/mp3
	node tools/c_stubber.js asm/mp3 src/mp3 --process-nonmatchings --nonmatchings-prefix asm/nonmatchings/mp3

setup:
	mkdir -p $(BUILD_DIR)/src $(BUILD_DIR)/asm $(SRC_DIR) $(ASM_DIR) $(INCLUDE)

# Final ROM generation
$(TARGET): $(ELF)
	$(OBJCOPY) -O binary $< $@
	@echo "ROM built successfully at $@"

# Linker
$(ELF): $(O_FILES)
	$(LD) $(LDFLAGS) -o $@ $^

# C Compiler rule
$(BUILD_DIR)/src/%.o: $(SRC_DIR)/%.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) $< -o $@

# Assembler rule
$(BUILD_DIR)/asm/%.o: $(ASM_DIR)/%.s
	@mkdir -p $(dir $@)
	$(AS) $(ASFLAGS) $< -o $@

clean:
	rm -rf $(BUILD_DIR) $(TARGET)
