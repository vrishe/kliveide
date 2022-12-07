import "mocha";
import { expect } from "expect";
import { RunMode, Z80TestMachine } from "./test-z80";

describe("Z80 indexed IY ops 40-4f", () => {
    it("0x40: LD B,B", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xFD, 0x40,       // LD B,B
        ]);
        m.cpu.b = 0xa3;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters();
        m.shouldKeepMemory();

        expect(cpu.b).toBe(0xa3)
        expect(cpu.pc).toBe(0x0002);
        expect(cpu.tacts).toBe(8);
    });

    it("0x41: LD B,C", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x0e, 0xB9, // LD C,B9H
            0xFD, 0x41  // LD B,C
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("B, C");
        m.shouldKeepMemory();

        expect(cpu.b).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x42: LD B,D", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x16, 0xB9, // LD D,B9H
            0xFD, 0x42  // LD B,D
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("B, D");
        m.shouldKeepMemory();

        expect(cpu.b).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x43: LD B,E", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x1E, 0xB9, // LD E,B9H
            0xFD, 0x43  // LD E,D
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("B, E");
        m.shouldKeepMemory();

        expect(cpu.b).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x44: LD B,YH", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xFD, 0x26, 0xB9, // LD YH,B9H
            0xFD, 0x44        // LD B,YH
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("B, IY");
        m.shouldKeepMemory();

        expect(cpu.b).toBe(0xb9)
        expect(cpu.pc).toBe(0x0005);
        expect(cpu.tacts).toBe(19);
    });

    it("0x45: LD B,YL", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xFD, 0x2E, 0xB9, // LD YL,B9H
            0xFD, 0x45        // LD B,YL
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("B, IY");
        m.shouldKeepMemory();

        expect(cpu.b).toBe(0xb9)
        expect(cpu.pc).toBe(0x0005);
        expect(cpu.tacts).toBe(19);
    });

    it("0x46: LD B,(IY+d)", ()=> {
        // --- Arrange
        const OFFS = 0x54;
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xFD, 0x46, OFFS  // LD B,(IY+54H)
        ]);
        m.cpu.iy = 0x1000;
        m.memory[m.cpu.iy + OFFS] = 0x7C;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("B, IY");
        m.shouldKeepMemory();

        expect(cpu.b).toBe(0x7c)
        expect(cpu.pc).toBe(0x0003);
        expect(cpu.tacts).toBe(19);
    });

    it("0x47: LD B,A", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0xB9, // LD A,B9H
            0x47        // LD B,A
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("B, A");
        m.shouldKeepMemory();

        expect(cpu.b).toBe(0xb9)
        expect(cpu.pc).toBe(0x0003);
        expect(cpu.tacts).toBe(11);
    });

    it("0x48: LD C,B", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x06, 0xB9, // LD B,B9H
            0xFD, 0x48  // LD C,B
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("C, B");
        m.shouldKeepMemory();

        expect(cpu.c).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x49: LD C,C", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x0e, 0xB9, // LD C,B9H
            0xFD, 0x49  // LD C,C
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("C");
        m.shouldKeepMemory();

        expect(cpu.c).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x4a: LD C,D", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x16, 0xB9, // LD D,B9H
            0xFD, 0x4A  // LD C,D
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("C, D");
        m.shouldKeepMemory();

        expect(cpu.c).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x4b: LD C,E", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x1E, 0xB9, // LD E,B9H
            0xFD, 0x4B  // LD C,E
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("C, E");
        m.shouldKeepMemory();

        expect(cpu.c).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x4c: LD C,YH", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xFD, 0x26, 0xB9, // LD YH,B9H
            0xFD, 0x4C        // LD C,YH
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("C, IY");
        m.shouldKeepMemory();

        expect(cpu.c).toBe(0xb9)
        expect(cpu.pc).toBe(0x0005);
        expect(cpu.tacts).toBe(19);
    });

    it("0x4d: LD C,YL", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xFD, 0x2E, 0xB9, // LD YL,B9H
            0xFD, 0x4d        // LD C,YL
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("C, IY");
        m.shouldKeepMemory();

        expect(cpu.c).toBe(0xb9)
        expect(cpu.pc).toBe(0x0005);
        expect(cpu.tacts).toBe(19);
    });

    it("0x4e: LD C,(IY+d)", ()=> {
        // --- Arrange
        const OFFS = 0x54;
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xFD, 0x4E, OFFS  // LD C,(IY+54H)
        ]);
        m.cpu.iy = 0x1000;
        m.memory[m.cpu.iy + OFFS] = 0x7C;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("C, IY");
        m.shouldKeepMemory();

        expect(cpu.c).toBe(0x7c)
        expect(cpu.pc).toBe(0x0003);
        expect(cpu.tacts).toBe(19);
    });

    it("0x4f: LD C,A", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0xB9, // LD A,B9H
            0xFD, 0x4F  // LD C,A
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("C, A");
        m.shouldKeepMemory();

        expect(cpu.c).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });
});