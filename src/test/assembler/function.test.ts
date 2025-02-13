import "mocha";
import { expressionFails, testExpression } from "./test-helpers";

describe("Assembler - functions", async () => {
  const functionSamples = [
    { source: "abs(false)", value: 0 },
    { source: "abs(true)", value: 1 },
    { source: "abs(-true)", value: 1 },
    { source: "abs(-123)", value: 123 },
    { source: "abs(0)", value: 0 },
    { source: "abs(123)", value: 123 },
    { source: "abs(-123.25)", value: 123.25 },
    { source: "abs(0.0)", value: 0.0 },
    { source: "abs(123.25)", value: 123.25 },
    { source: "acos(false)", value: 1.5707963267948966 },
    { source: "acos(true)", value: 0.0 },
    { source: "acos(0.0)", value: 1.5707963267948966 },
    { source: "acos(1.0)", value: 0.0 },
    { source: "asin(true)", value: 1.5707963267948966 },
    { source: "asin(false)", value: 0.0 },
    { source: "asin(1.0)", value: 1.5707963267948966 },
    { source: "asin(0.0)", value: 0.0 },
    { source: "atan(true)", value: 0.78539816339744828 },
    { source: "atan(false)", value: 0.0 },
    { source: "atan(1.0)", value: 0.78539816339744828 },
    { source: "atan(0.0)", value: 0.0 },
    { source: "atan2(true, true)", value: 0.78539816339744828 },
    { source: "atan2(false, 1)", value: 0.0 },
    { source: "atan2(1, true)", value: 0.78539816339744828 },
    { source: "atan2(0, 1)", value: 0.0 },
    { source: "atan2(1.0, true)", value: 0.78539816339744828 },
    { source: "atan2(0.0, 1)", value: 0.0 },
    { source: "ceiling(false)", value: 0 },
    { source: "ceiling(true)", value: 1 },
    { source: "ceiling(0)", value: 0 },
    { source: "ceiling(1)", value: 1 },
    { source: "ceiling(0.0)", value: 0 },
    { source: "ceiling(1.0)", value: 1 },
    { source: "ceiling(1.1)", value: 2 },
    { source: "cos(true)", value: 0.54030230586813976 },
    { source: "cos(false)", value: 1.0 },
    { source: "cos(1)", value: 0.54030230586813976 },
    { source: "cos(0)", value: 1.0 },
    { source: "cos(1.0)", value: 0.54030230586813976 },
    { source: "cos(0.0)", value: 1.0 },
    { source: "cosh(true)", value: 1.5430806348152437 },
    { source: "cosh(false)", value: 1.0 },
    { source: "cosh(1)", value: 1.5430806348152437 },
    { source: "cosh(0)", value: 1.0 },
    { source: "cosh(1.0)", value: 1.5430806348152437 },
    { source: "cosh(0.0)", value: 1.0 },
    { source: "exp(true)", value: 2.7182818284590451 },
    { source: "exp(false)", value: 1.0 },
    { source: "exp(1)", value: 2.7182818284590451 },
    { source: "exp(0)", value: 1.0 },
    { source: "exp(1.0)", value: 2.7182818284590451 },
    { source: "exp(0.0)", value: 1.0 },
    { source: "floor(false)", value: 0 },
    { source: "floor(true)", value: 1 },
    { source: "floor(0)", value: 0 },
    { source: "floor(1)", value: 1 },
    { source: "floor(0.0)", value: 0 },
    { source: "floor(1.0)", value: 1 },
    { source: "floor(1.1)", value: 1 },
    { source: "log(true)", value: 0 },
    { source: "log(1)", value: 0 },
    { source: "log(2)", value: 0.69314718055994529 },
    { source: "log(1.0)", value: 0 },
    { source: "log(2.0)", value: 0.69314718055994529 },
    { source: "log(1, 2)", value: 0 },
    { source: "log(100, 10)", value: 2.0 },
    { source: "log(1000, 2)", value: 9.965784284662087 },
    { source: "log10(true)", value: 0 },
    { source: "log10(100)", value: 2 },
    { source: "log10(1000)", value: 3 },
    { source: "max(true, false)", value: 1 },
    { source: "max(false, false)", value: 0 },
    { source: "max(1, 0)", value: 1 },
    { source: "max(0, -1)", value: 0 },
    { source: "max(1.0, 0)", value: 1 },
    { source: "max(0, -1.0)", value: 0 },
    { source: "min(true, false)", value: 0 },
    { source: "min(false, false)", value: 0 },
    { source: "min(1, 0)", value: 0 },
    { source: "min(0, -1)", value: -1 },
    { source: "min(1.0, 0)", value: 0 },
    { source: "min(0, -1.0)", value: -1.0 },
    { source: "pow(true, false)", value: 1 },
    { source: "pow(true, true)", value: 1 },
    { source: "pow(2, 3)", value: 8 },
    { source: "pow(3, 4)", value: 81 },
    { source: "pow(2, 0.5)", value: 1.4142135623730951 },
    { source: "pow(3.0, 4.0)", value: 81.0 },
    { source: "round(true)", value: 1 },
    { source: "round(false)", value: 0 },
    { source: "round(2)", value: 2 },
    { source: "round(3)", value: 3 },
    { source: "round(2.0)", value: 2.0 },
    { source: "round(3.0)", value: 3.0 },
    { source: "round(3.25)", value: 3.0 },
    { source: "round(3.75)", value: 4.0 },
    { source: "sign(true)", value: 1 },
    { source: "sign(false)", value: 0 },
    { source: "sign(2)", value: 1 },
    { source: "sign(0)", value: 0 },
    { source: "sign(-2)", value: -1 },
    { source: "sign(2.0)", value: 1.0 },
    { source: "sign(0.0)", value: 0.0 },
    { source: "sign(-2.0)", value: -1.0 },
    { source: "sin(true)", value: 0.8414709848078965 },
    { source: "sin(false)", value: 0.0 },
    { source: "sin(2.0)", value: 0.9092974268256817 },
    { source: "sin(1.0)", value: 0.8414709848078965 },
    { source: "sinh(true)", value: 1.1752011936438014 },
    { source: "sinh(false)", value: 0.0 },
    { source: "sinh(1.0)", value: 1.1752011936438014 },
    { source: "sinh(0.0)", value: 0.0 },
    { source: "sinh(1)", value: 1.1752011936438014 },
    { source: "sinh(0)", value: 0.0 },
    { source: "sqrt(true)", value: 1.0 },
    { source: "sqrt(false)", value: 0.0 },
    { source: "sqrt(1)", value: 1.0 },
    { source: "sqrt(0)", value: 0.0 },
    { source: "sqrt(2.25)", value: 1.5 },
    { source: "sqrt(4)", value: 2.0 },
    { source: "tan(true)", value: 1.5574077246549023 },
    { source: "tan(false)", value: 0.0 },
    { source: "tan(1)", value: 1.5574077246549023 },
    { source: "tan(0)", value: 0.0 },
    { source: "tan(1.0)", value: 1.5574077246549023 },
    { source: "tan(0.0)", value: 0.0 },
    { source: "tanh(true)", value: 0.76159415595576485 },
    { source: "tanh(false)", value: 0.0 },
    { source: "tanh(1)", value: 0.76159415595576485 },
    { source: "tanh(0)", value: 0.0 },
    { source: "tanh(1.0)", value: 0.76159415595576485 },
    { source: "tanh(0.0)", value: 0.0 },
    { source: "truncate(true)", value: 1 },
    { source: "truncate(false)", value: 0 },
    { source: "truncate(1)", value: 1 },
    { source: "truncate(0)", value: 0 },
    { source: "truncate(1.0)", value: 1 },
    { source: "truncate(0.0)", value: 0 },
    { source: "truncate(1.1)", value: 1 },
    { source: "truncate(1.9)", value: 1 },
    { source: "pi()", value: 3.1415926535897931 },
    { source: "nat()", value: 2.7182818284590451 },
    { source: "low(true)", value: 1 },
    { source: "low(false)", value: 0 },
    { source: "low(#fe)", value: 0xfe },
    { source: "low(#fe*#fe)", value: 0x04 },
    { source: "low(#1234*#1234)", value: 0x90 },
    { source: "low(truncate(254.1))", value: 0xfe },
    { source: "high(true)", value: 0 },
    { source: "high(false)", value: 0 },
    { source: "high(#fe)", value: 0 },
    { source: "high(#fe*#fe)", value: 0xfc },
    { source: "high(#1234*#1234)", value: 0x5a },
    { source: "high(truncate(254.1*254.1))", value: 0xfc },
    { source: "word(true)", value: 1 },
    { source: "word(false)", value: 0 },
    { source: "word(#fe13*#13)", value: 0xdb69 },
    { source: "word(#fe10*#fe10)", value: 0xc100 },
    { source: 'length("")', value: 0 },
    { source: 'len("")', value: 0 },
    { source: 'length("hello")', value: 5 },
    { source: 'len("hello")', value: 5 },
    { source: 'left("hello", 0)', value: "" },
    { source: 'left("hello", 1)', value: "h" },
    { source: 'left("hello", 3)', value: "hel" },
    { source: 'right("hello", 0)', value: "" },
    { source: 'right("hello", 1)', value: "o" },
    { source: 'right("hello", 3)', value: "llo" },
    { source: 'substr("hello", 0, 0)', value: "" },
    { source: 'substr("hello", 0, 1)', value: "h" },
    { source: 'substr("hello", 1, 3)', value: "ell" },
    { source: 'substr("hello", 3, 2)', value: "lo" },
    { source: 'substr("hello", 3, 5)', value: "lo" },
    { source: 'substr("hello", 8, 2)', value: "" },
    { source: 'fill("Q", 3)', value: "QQQ" },
    { source: 'fill("Q", 0)', value: "" },
    { source: 'fill("He", 3)', value: "HeHeHe" },
    { source: "int(false)", value: 0 },
    { source: "int(true)", value: 1 },
    { source: "int(0)", value: 0 },
    { source: "int(1)", value: 1 },
    { source: "int(0.0)", value: 0 },
    { source: "int(3.25)", value: 3 },
    { source: "int(3.75)", value: 3 },
    { source: "frac(false)", value: 0.0 },
    { source: "frac(true)", value: 0.0 },
    { source: "frac(0)", value: 0.0 },
    { source: "frac(1)", value: 0.0 },
    { source: "frac(0.0)", value: 0.0 },
    { source: "frac(3.25)", value: 0.25 },
    { source: "frac(3.75)", value: 0.75 },
    { source: 'lowercase("ABC")', value: "abc" },
    { source: 'lcase("ABC")', value: "abc" },
    { source: 'uppercase("abc")', value: "ABC" },
    { source: 'ucase("abc")', value: "ABC" },
    { source: 'str("abc")', value: "abc" },
    { source: "str(true)", value: "true" },
    { source: "str(false)", value: "false" },
    { source: "str(123+123)", value: "246" },
    { source: "str(123.1+123.0)", value: "246.1" },
    { source: "ink(0)", value: 0x00 },
    { source: "ink(1)", value: 0x01 },
    { source: "ink(2)", value: 0x02 },
    { source: "ink(3)", value: 0x03 },
    { source: "ink(4)", value: 0x04 },
    { source: "ink(5)", value: 0x05 },
    { source: "ink(6)", value: 0x06 },
    { source: "ink(7)", value: 0x07 },
    { source: "ink(8)", value: 0x00 },
    { source: "paper(0)", value: 0x00 },
    { source: "paper(1)", value: 0x08 },
    { source: "paper(2)", value: 0x10 },
    { source: "paper(3)", value: 0x18 },
    { source: "paper(4)", value: 0x20 },
    { source: "paper(5)", value: 0x28 },
    { source: "paper(6)", value: 0x30 },
    { source: "paper(7)", value: 0x38 },
    { source: "paper(9)", value: 0x08 },
    { source: "bright(0)", value: 0x00 },
    { source: "bright(1)", value: 0x40 },
    { source: "bright(-1)", value: 0x40 },
    { source: "bright(2)", value: 0x40 },
    { source: "flash(0)", value: 0x00 },
    { source: "flash(1)", value: 0x80 },
    { source: "flash(-1)", value: 0x80 },
    { source: "flash(2)", value: 0x80 },
    { source: "attr(0, 0, 0, 0)", value: 0x00 },
    { source: "attr(1, 0, 0, 0)", value: 0x01 },
    { source: "attr(5, 0, 0, 0)", value: 0x05 },
    { source: "attr(9, 0, 0, 0)", value: 0x01 },
    { source: "attr(1, 3, 0, 0)", value: 0x19 },
    { source: "attr(5, 3, 0, 0)", value: 0x1d },
    { source: "attr(9, 3, 0, 0)", value: 0x19 },
    { source: "attr(1, 11, 0, 0)", value: 0x19 },
    { source: "attr(5, 11, 0, 0)", value: 0x1d },
    { source: "attr(9, 11, 0, 0)", value: 0x19 },

    { source: "attr(0, 0, 1, 0)", value: 0x40 },
    { source: "attr(1, 0, 1, 0)", value: 0x41 },
    { source: "attr(5, 0, 1, 0)", value: 0x45 },
    { source: "attr(9, 0, 1, 0)", value: 0x41 },
    { source: "attr(1, 3, 1, 0)", value: 0x59 },
    { source: "attr(5, 3, 1, 0)", value: 0x5d },
    { source: "attr(9, 3, 1, 0)", value: 0x59 },
    { source: "attr(1, 11, 1, 0)", value: 0x59 },
    { source: "attr(5, 11, 1, 0)", value: 0x5d },
    { source: "attr(9, 11, 1, 0)", value: 0x59 },

    { source: "attr(0, 0, 1, 1)", value: 0xc0 },
    { source: "attr(1, 0, 1, 1)", value: 0xc1 },
    { source: "attr(5, 0, 1, 1)", value: 0xc5 },
    { source: "attr(9, 0, 1, 1)", value: 0xc1 },
    { source: "attr(1, 3, 1, 1)", value: 0xd9 },
    { source: "attr(5, 3, 1, 1)", value: 0xdd },
    { source: "attr(9, 3, 1, 1)", value: 0xd9 },
    { source: "attr(1, 11, 1, 1)", value: 0xd9 },
    { source: "attr(5, 11, 1, 1)", value: 0xdd },
    { source: "attr(9, 11, 1, 1)", value: 0xd9 },

    { source: "attr(0, 0, 0, 1)", value: 0x80 },
    { source: "attr(1, 0, 0, 1)", value: 0x81 },
    { source: "attr(5, 0, 0, 1)", value: 0x85 },
    { source: "attr(9, 0, 0, 1)", value: 0x81 },
    { source: "attr(1, 3, 0, 1)", value: 0x99 },
    { source: "attr(5, 3, 0, 1)", value: 0x9d },
    { source: "attr(9, 3, 0, 1)", value: 0x99 },
    { source: "attr(1, 11, 0, 1)", value: 0x99 },
    { source: "attr(5, 11, 0, 1)", value: 0x9d },
    { source: "attr(9, 11, 0, 1)", value: 0x99 },

    { source: "attr(0, 0, 0)", value: 0x00 },
    { source: "attr(1, 0, 0)", value: 0x01 },
    { source: "attr(5, 0, 0)", value: 0x05 },
    { source: "attr(9, 0, 0)", value: 0x01 },
    { source: "attr(1, 3, 0)", value: 0x19 },
    { source: "attr(5, 3, 0)", value: 0x1d },
    { source: "attr(9, 3, 0)", value: 0x19 },
    { source: "attr(1, 11, 0)", value: 0x19 },
    { source: "attr(5, 11, 0)", value: 0x1d },
    { source: "attr(9, 11, 0)", value: 0x19 },

    { source: "attr(0, 0)", value: 0x00 },
    { source: "attr(1, 0)", value: 0x01 },
    { source: "attr(5, 0)", value: 0x05 },
    { source: "attr(9, 0)", value: 0x01 },
    { source: "attr(1, 3)", value: 0x19 },
    { source: "attr(5, 3)", value: 0x1d },
    { source: "attr(9, 3)", value: 0x19 },
    { source: "attr(1, 11)", value: 0x19 },
    { source: "attr(5, 11)", value: 0x1d },
    { source: "attr(9, 11)", value: 0x19 },

    { source: "scraddr(0, 0)", value: 0x4000 },
    { source: "scraddr(0, 3)", value: 0x4000 },
    { source: "scraddr(0, 7)", value: 0x4000 },
    { source: "scraddr(0, 8)", value: 0x4001 },
    { source: "scraddr(1, 0)", value: 0x4100 },
    { source: "scraddr(1, 3)", value: 0x4100 },
    { source: "scraddr(1, 7)", value: 0x4100 },
    { source: "scraddr(1, 8)", value: 0x4101 },
    { source: "scraddr(3, 0)", value: 0x4300 },
    { source: "scraddr(3, 3)", value: 0x4300 },
    { source: "scraddr(3, 7)", value: 0x4300 },
    { source: "scraddr(3, 8)", value: 0x4301 },
    { source: "scraddr(7, 255)", value: 0x471f },
    { source: "scraddr(7, 254)", value: 0x471f },
    { source: "scraddr(7, 246)", value: 0x471e },
    { source: "scraddr(7, 244)", value: 0x471e },
    { source: "scraddr(8, 0)", value: 0x4020 },
    { source: "scraddr(8, 3)", value: 0x4020 },
    { source: "scraddr(8, 7)", value: 0x4020 },
    { source: "scraddr(8, 8)", value: 0x4021 },
    { source: "scraddr(9, 0)", value: 0x4120 },
    { source: "scraddr(9, 3)", value: 0x4120 },
    { source: "scraddr(9, 7)", value: 0x4120 },
    { source: "scraddr(9, 8)", value: 0x4121 },
    { source: "scraddr(64, 0)", value: 0x4800 },
    { source: "scraddr(64, 3)", value: 0x4800 },
    { source: "scraddr(64, 7)", value: 0x4800 },
    { source: "scraddr(64, 8)", value: 0x4801 },
    { source: "scraddr(65, 0)", value: 0x4900 },
    { source: "scraddr(65, 3)", value: 0x4900 },
    { source: "scraddr(65, 7)", value: 0x4900 },
    { source: "scraddr(65, 8)", value: 0x4901 },
    { source: "scraddr(128, 0)", value: 0x5000 },
    { source: "scraddr(128, 3)", value: 0x5000 },
    { source: "scraddr(128, 7)", value: 0x5000 },
    { source: "scraddr(128, 8)", value: 0x5001 },
    { source: "scraddr(129, 0)", value: 0x5100 },
    { source: "scraddr(129, 3)", value: 0x5100 },
    { source: "scraddr(129, 7)", value: 0x5100 },
    { source: "scraddr(129, 8)", value: 0x5101 },
    { source: "scraddr(191, 255)", value: 0x57ff },
    { source: "scraddr(190, 255)", value: 0x56ff },
    { source: "attraddr(0, 0)", value: 0x5800 },
    { source: "attraddr(0, 4)", value: 0x5800 },
    { source: "attraddr(0, 8)", value: 0x5801 },
    { source: "attraddr(7, 0)", value: 0x5800 },
    { source: "attraddr(7, 4)", value: 0x5800 },
    { source: "attraddr(7, 8)", value: 0x5801 },
    { source: "attraddr(8, 0)", value: 0x5820 },
    { source: "attraddr(8, 4)", value: 0x5820 },
    { source: "attraddr(8, 8)", value: 0x5821 },
    { source: "attraddr(70, 255)", value: 0x591f },
    { source: "attraddr(130, 25)", value: 0x5a03 },
    { source: "attraddr(191, 255)", value: 0x5aff },
  ];
  functionSamples.forEach((lit) => {
    it(`Invoke: ${lit.source}`, async () => {
      await testExpression(lit.source, lit.value);
    });
  });

  const functionFailSamples = [
    { source: 'abs("abc")' },
    { source: 'acos("abc")' },
    { source: 'asin("abc")' },
    { source: 'atan("abc")' },
    { source: 'atan2("abc")' },
    { source: "atan2(1.0)" },
    { source: 'ceiling("abc")' },
    { source: 'cos("abc")' },
    { source: 'cosh("abc")' },
    { source: 'exp("abc")' },
    { source: 'floor("abc")' },
    { source: 'log("abc")' },
    { source: 'log10("abc")' },
    { source: 'max("abc", "def")' },
    { source: 'min("abc", "def")' },
    { source: 'pow("abc", "def")' },
    { source: 'round("abc")' },
    { source: 'sign("abc")' },
    { source: 'sin("abc")' },
    { source: 'sinh("abc")' },
    { source: 'sqrt("abc")' },
    { source: 'tan("abc")' },
    { source: 'tanh("abc")' },
    { source: 'truncate("abc")' },
    { source: "low(254.1)" },
    { source: 'low("abc")' },
    { source: "high(254.1)" },
    { source: 'high("abc")' },
    { source: "word(254.1)" },
    { source: 'word("abc")' },
    { source: "length(true)" },
    { source: "length(false)" },
    { source: "length(2)" },
    { source: "length(2.1)" },
    { source: "len(true)" },
    { source: "len(false)" },
    { source: "len(2)" },
    { source: "len(2.1)" },
    { source: "left(false)" },
    { source: "left(2)" },
    { source: "left(2.1)" },
    { source: "right(false)" },
    { source: "right(2)" },
    { source: "right(2.1)" },
    { source: "substr(false)" },
    { source: "substr(2)" },
    { source: "substr(2.1)" },
    { source: "fill(false)" },
    { source: "fill(2)" },
    { source: "fill(2.1)" },
    { source: 'int("sdsds")' },
    { source: 'frac("sdsds")' },
    { source: "lowercase(false)" },
    { source: "lowercase(2)" },
    { source: "lowercase(2.1)" },
    { source: "lcase(false)" },
    { source: "lcase(2)" },
    { source: "lcase(2.1)" },
    { source: "uppercase(false)" },
    { source: "uppercase(2)" },
    { source: "uppercase(2.1)" },
    { source: "ucase(false)" },
    { source: "ucase(2)" },
    { source: "ucase(2.1)" },
    { source: 'ink("abc")' },
    { source: "ink(1.1)" },
    { source: 'paper("abc")' },
    { source: "paper(1.1)" },
    { source: 'bright("abc")' },
    { source: "bright(1.1)" },
    { source: 'flash("abc")' },
    { source: "flash(1.1)" },
    { source: 'attr("abc")' },
    { source: 'scraddr("abc")' },
    { source: "scraddr(-1, 0)" },
    { source: "scraddr(192, 0)" },
    { source: "scraddr(0, -1)" },
    { source: "scraddr(0, 256)" },
    { source: 'attraddr("abc")' },
    { source: "attraddr(-1, 0)" },
    { source: "attraddr(192, 0)" },
    { source: "attraddr(0, -1)" },
    { source: "attraddr(0, 256)" },
  ];
  functionFailSamples.forEach((lit) => {
    it(`Invoke fails: ${lit.source}`, async () => {
      await expressionFails(lit.source);
    });
  });
});
