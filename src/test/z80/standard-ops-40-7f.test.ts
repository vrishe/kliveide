import "mocha";
import * as expect from "expect";
import * as fs from "fs";
import * as path from "path";
import { TestCpuApi, TestZ80Machine } from "../../modules/cpu-z80/test-z80-machine";
import { Z80SignalStateFlags } from "../../modules/cpu-z80/z80-cpu";
import { RunMode } from "../../core/abstractions/vm-core-types";
import { importObject } from "./import-object";

const buffer = fs.readFileSync(path.join(__dirname, "../../../build/tz80.wasm"));
let api: TestCpuApi;
let testMachine: TestZ80Machine;

describe("Standard ops 40-7f", () => {
  before(async () => {
    const wasm = await WebAssembly.instantiate(buffer, importObject);
    api = (wasm.instance.exports as unknown) as TestCpuApi;
    testMachine = new TestZ80Machine(api);
  });

  beforeEach(() => {
    testMachine.reset();
  });

  const reg8 = ["b", "c", "d", "e", "h", "l", "(hl)", "a"];
  for (let q = 0; q < 8; q++) {
    if (q === 6) continue;
    for (let w = 0; w < 8; w++) {
      if (w === 6) continue;

      const opCode = 0x40 + 8 * q + w;
      it(`${opCode.toString(16)}: ld ${reg8[q]},${reg8[w]}`, () => {
        let s = testMachine.initCode([opCode]);
        switch (w) {
          case 0:
            s.b = 0x46;
            break;
          case 1:
            s.c = 0x46;
            break;
          case 2:
            s.d = 0x46;
            break;
          case 3:
            s.e = 0x46;
            break;
          case 4:
            s.h = 0x46;
            break;
          case 5:
            s.l = 0x46;
            break;
          case 7:
            s.a = 0x46;
            break;
        }
        s = testMachine.run(s);
        let l: number = 0xff;
        switch (q) {
          case 0:
            l = s.b;
            break;
          case 1:
            l = s.c;
            break;
          case 2:
            l = s.d;
            break;
          case 3:
            l = s.e;
            break;
          case 4:
            l = s.h;
            break;
          case 5:
            l = s.l;
            break;
          case 7:
            l = s.a;
            break;
        }
        testMachine.shouldKeepRegisters(`${reg8[q]},${reg8[w]}`);
        testMachine.shouldKeepMemory();
        expect(l).toBe(0x46);
        expect(s.pc).toBe(0x0001);
        expect(s.tacts).toBe(4);
      });
    }
  }

  for (let q = 0; q < 8; q++) {
    if (q === 6) continue;
    const opCode = 0x46 + 8 * q;
    it(`${opCode.toString(16)}: ld ${reg8[q]},(hl)`, () => {
      let s = testMachine.initCode([opCode]);
      s.hl = 0x1000;
      const m = testMachine.memory;
      m[s.hl] = 0x46;
      s = testMachine.run(s, m);
      let l: number = 0xff;
      switch (q) {
        case 0:
          l = s.b;
          break;
        case 1:
          l = s.c;
          break;
        case 2:
          l = s.d;
          break;
        case 3:
          l = s.e;
          break;
        case 4:
          l = s.h;
          break;
        case 5:
          l = s.l;
          break;
        case 7:
          l = s.a;
          break;
      }

      testMachine.shouldKeepRegisters(`${reg8[q]}`);
      testMachine.shouldKeepMemory();
      expect(l).toBe(0x46);
      expect(s.pc).toBe(0x0001);
      expect(s.tacts).toBe(7);
    });
  }

  for (let q = 0; q < 8; q++) {
    if (q === 6) continue;
    const opCode = 0x70 + q;
    it(`${opCode.toString(16)}: ld (hl),${reg8[q]}`, () => {
      let s = testMachine.initCode([opCode]);
      s.hl = 0x1000;
      switch (q) {
        case 0:
          s.b = 0x46;
          break;
        case 1:
          s.c = 0x46;
          break;
        case 2:
          s.d = 0x46;
          break;
        case 3:
          s.e = 0x46;
          break;
        case 7:
          s.a = 0x46;
          break;
      }
      s = testMachine.run(s);
      const m = testMachine.memory;

      testMachine.shouldKeepRegisters();
      testMachine.shouldKeepMemory("1000");
      if (q === 4) {
        expect(m[0x1000]).toBe(0x10);
      } else if (q === 5) {
        expect(m[0x1000]).toBe(0x00);
      } else {
        expect(m[0x1000]).toBe(0x46);
      }
      expect(s.pc).toBe(0x0001);
      expect(s.tacts).toBe(7);
    });
  }

  it("76: halt", () => {
    let s = testMachine.initCode([0x76], RunMode.UntilHalt);
    s = testMachine.run();

    testMachine.shouldKeepRegisters();
    testMachine.shouldKeepMemory();
    expect(s.cpuSignalFlags & Z80SignalStateFlags.Halted).toBeTruthy();
    expect(s.pc).toBe(0x0000);
    expect(s.tacts).toBe(4);
  });
});
