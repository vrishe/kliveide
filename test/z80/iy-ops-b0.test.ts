import "mocha";
import { expect } from "expect";
import { RunMode, Z80TestMachine } from "./test-z80";

describe("Z80 indexed IY ops b0-bf", () => {
    it("0xB0: OR A,B", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0x52, // LD A,52H
            0x06, 0x23, // LD B,23H
            0xFD, 0xB0  // OR B
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF, B");
        m.shouldKeepMemory();
        expect(cpu.a).toBe(0x73);
        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isNFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.pc).toBe(0x0006);
        expect(cpu.tacts).toBe(22);
    });

    it("0xB1: OR A,C", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0x52, // LD A,52H
            0x0E, 0x23, // LD C,23H
            0xFD, 0xB1  // OR C
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF, C");
        m.shouldKeepMemory();
        expect(cpu.a).toBe(0x73);
        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isNFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.pc).toBe(0x0006);
        expect(cpu.tacts).toBe(22);
    });

    it("0xB2: OR A,D", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0x52, // LD A,52H
            0x16, 0x23, // LD D,23H
            0xFD, 0xB2  // OR D
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF, D");
        m.shouldKeepMemory();
        expect(cpu.a).toBe(0x73);
        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isNFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.pc).toBe(0x0006);
        expect(cpu.tacts).toBe(22);
    });

    it("0xB3: OR A,E", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0x52, // LD A,52H
            0x1E, 0x23, // LD E,23H
            0xFD, 0xB3  // OR E
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF, E");
        m.shouldKeepMemory();
        expect(cpu.a).toBe(0x73);
        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isNFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.pc).toBe(0x0006);
        expect(cpu.tacts).toBe(22);
    });

    it("0xB4: OR A,YH", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0x12, // LD A,12H
            0xFD, 0xB4  // OR YH
        ]);
        m.cpu.iy = 0x23AA;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF, IY");
        m.shouldKeepMemory();
        expect(cpu.a).toBe(0x33);
        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(true);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.isNFlagSet()).toBe(false);

        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0xB5: OR A,YL", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0x12, // LD A,12H
            0xFD, 0xB5  // OR YL
        ]);
        m.cpu.iy = 0xAA23;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF, IY");
        m.shouldKeepMemory();
        expect(cpu.a).toBe(0x33);
        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(true);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.isNFlagSet()).toBe(false);

        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0xB6: OR A,(IY+d)", ()=> {
        // --- Arrange
        const OFFS = 0x54;
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0x12,       // LD A,12H
            0xFD, 0xB6, 0x54  // OR (IY+54H)
        ]);
        m.cpu.iy = 0x1000;
        m.memory[m.cpu.iy + OFFS] = 0x23;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF");
        m.shouldKeepMemory();
        expect(cpu.a).toBe(0x33);
        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(true);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.isNFlagSet()).toBe(false);

        expect(cpu.pc).toBe(0x0005);
        expect(cpu.tacts).toBe(26);
    });

    it("0xB7: OR A,A", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x3E, 0x52, // LD A,52H
            0xFD, 0xB7  // OR A
        ]);

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF");
        m.shouldKeepMemory();
        expect(cpu.a).toBe(0x52);
        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isNFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0xB8: CP B", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x06, 0x24, // LD B,24H
            0xFD, 0xB8  // CP B
        ]);
        m.cpu.a = 0x36;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("F, B");
        m.shouldKeepMemory();

        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.isNFlagSet()).toBe(true);

        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0xB9: CP C", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x0E, 0x24, // LD C,24H
            0xFD, 0xB9  // CP C
        ]);
        m.cpu.a = 0x36;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("F, C");
        m.shouldKeepMemory();

        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.isNFlagSet()).toBe(true);

        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0xBA: CP D", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x16, 0x24, // LD D,24H
            0xFD, 0xBA  // CP D
        ]);
        m.cpu.a = 0x36;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("F, D");
        m.shouldKeepMemory();

        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.isNFlagSet()).toBe(true);

        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0xBB: CP E", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0x1E, 0x24, // LD E,24H
            0xFD, 0xBB  // CP E
        ]);
        m.cpu.a = 0x36;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("F, E");
        m.shouldKeepMemory();

        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.isNFlagSet()).toBe(true);

        expect(cpu.pc).toBe(0x0004);
        expect(cpu.tacts).toBe(15);
    });

    it("0xBC: CP YH", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xFD, 0xBC  // CP YH
        ]);
        m.cpu.a = 0x36;
        m.cpu.iy = 0x23AA;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF, IY");
        m.shouldKeepMemory();
        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.isNFlagSet()).toBe(true);

        expect(cpu.pc).toBe(0x0002);
        expect(cpu.tacts).toBe(8);
    });

    it("0xBD: CP YL", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xFD, 0xBD  // CP YL
        ]);
        m.cpu.a = 0x36;
        m.cpu.iy = 0xAA24;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF, IY");
        m.shouldKeepMemory();
        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.isNFlagSet()).toBe(true);

        expect(cpu.pc).toBe(0x0002);
        expect(cpu.tacts).toBe(8);
    });

    it("0xBE: CP (IY+d)", ()=> {
        // --- Arrange
        const OFFS = 0x54;
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xFD, 0xBE, 0x54 // CP (IY+54H)
        ]);
        m.cpu.a = 0x36;
        m.cpu.iy = 0x1000;
        m.memory[m.cpu.iy + OFFS] = 0x24;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF");
        m.shouldKeepMemory();
        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(false);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.isNFlagSet()).toBe(true);

        expect(cpu.pc).toBe(0x0003);
        expect(cpu.tacts).toBe(19);
    });


    it("0xBF: CP A", ()=> {
        // --- Arrange
        const m = new Z80TestMachine(RunMode.UntilEnd);
        m.initCode(
        [
            0xFD, 0xBF  // CP A
        ]);
        m.cpu.a = 0x36;

        // --- Act
        m.run();

        // --- Assert
        const cpu = m.cpu;
        m.shouldKeepRegisters("AF");
        m.shouldKeepMemory();

        expect(cpu.isSFlagSet()).toBe(false);
        expect(cpu.isZFlagSet()).toBe(true);
        expect(cpu.isHFlagSet()).toBe(false);
        expect(cpu.isPvFlagSet()).toBe(false);
        expect(cpu.isCFlagSet()).toBe(false);

        expect(cpu.isNFlagSet()).toBe(true);

        expect(cpu.pc).toBe(0x0002);
        expect(cpu.tacts).toBe(8);
    });

});