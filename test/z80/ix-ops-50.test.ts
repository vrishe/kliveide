import "mocha";
import { expect } from "expect";
import { RunMode, Z80TestMachine } from "./test-z80";

describe("Z80 indexed IX ops 50-5f", () => {
    it("0x50: LD D,B", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x06, 0xB9, // LD B,B9H
            0xDD, 0x50  // LD D,B
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("D, B");
        m.shouldKeepMemory();

        expect(cpu.d).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x51: LD D,C", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x0E, 0xB9, // LD C,B9H
            0xDD, 0x51  // LD D,C
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("D, C");
        m.shouldKeepMemory();

        expect(cpu.d).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x52: LD D,D", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x16, 0xB9, // LD D,B9H
            0xDD, 0x52  // LD D,D
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("D");
        m.shouldKeepMemory();

        expect(cpu.d).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x53: LD D,E", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x1E, 0xB9, // LD E,B9H
            0xDD, 0x53  // LD D,E
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("D, E");
        m.shouldKeepMemory();

        expect(cpu.d).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x54: LD D,XH", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xDD, 0x26, 0xB9, // LD XH,B9H
            0xDD, 0x54        // LD D,XH
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("D, IX");
        m.shouldKeepMemory();

        expect(cpu.d).toBe(0xb9)
        expect(cpu.pc).toBe(0x0005);
        expect(cpu.tacts).toBe(19);
    });

    it("0x55: LD D,XL", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xDD, 0x2E, 0xB9, // LD XL,B9H
            0xDD, 0x55        // LD D,XL
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("D, IX");
        m.shouldKeepMemory();

        expect(cpu.d).toBe(0xb9)
        expect(cpu.pc).toBe(0x0005);
        expect(cpu.tacts).toBe(19);
    });

    it("0x56: LD D,(IX+d)", ()=> {
        // --- Arrange
        const OFFS = 0x54;
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xDD, 0x56, OFFS  // LD B,(IX+54H)
        ]);
        m.cpu.ix = 0x1000;
        m.memory[m.cpu.ix + OFFS] = 0x7C;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("D, IX");
        m.shouldKeepMemory();

        expect(cpu.d).toBe(0x7c)
        expect(cpu.pc).toBe(0x0003);
        expect(cpu.tacts).toBe(19);
    });

    it("0x57: LD D,A", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0xB9, // LD A,B9H
            0xDD, 0x57  // LD D,A
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("D, A");
        m.shouldKeepMemory();

        expect(cpu.d).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x58: LD E,B", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x06, 0xB9, // LD B,B9H
            0xDD, 0x58  // LD E,B
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("E, B");
        m.shouldKeepMemory();

        expect(cpu.e).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x59: LD E,C", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x0E, 0xB9, // LD C,B9H
            0xDD, 0x59  // LD E,C
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("E, C");
        m.shouldKeepMemory();

        expect(cpu.e).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x5A: LD E,D", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x16, 0xB9, // LD D,B9H
            0xDD, 0x5A  // LD E,D
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("E, D");
        m.shouldKeepMemory();

        expect(cpu.e).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x5B: LD E,E", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x1E, 0xB9, // LD E,B9H
            0xDD, 0x5B  // LD E,E
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("E");
        m.shouldKeepMemory();

        expect(cpu.e).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0x5C: LD E,XH", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xDD, 0x26, 0xB9, // LD XH,B9H
            0xDD, 0x5C        // LD E,XH
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("E, IX");
        m.shouldKeepMemory();

        expect(cpu.e).toBe(0xb9)
        expect(cpu.pc).toBe(0x0005);
        expect(cpu.tacts).toBe(19);
    });

    it("0x5D: LD E,XL", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xDD, 0x2E, 0xB9, // LD XL,B9H
            0xDD, 0x5D        // LD E,XL
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("E, IX");
        m.shouldKeepMemory();

        expect(cpu.e).toBe(0xb9)
        expect(cpu.pc).toBe(0x0005);
        expect(cpu.tacts).toBe(19);
    });

    it("0x5E: LD E,(IX+d)", ()=> {
        // --- Arrange
        const OFFS = 0x54;
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xDD, 0x5E, OFFS  // LD E,(IX+54H)
        ]);
        m.cpu.ix = 0x1000;
        m.memory[m.cpu.ix + OFFS] = 0x7C;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("E, IX");
        m.shouldKeepMemory();

        expect(cpu.e).toBe(0x7c)
        expect(cpu.pc).toBe(0x0003);
        expect(cpu.tacts).toBe(19);
    });


    it("0x5F: LD E,A", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0xB9, // LD A,B9H
            0xDD, 0x5F  // LD E,A
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("E, A");
        m.shouldKeepMemory();

        expect(cpu.e).toBe(0xb9)
        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });
});