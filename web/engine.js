/* SPDX-License-Identifier: Apache-2.0 */
(function (root) {
  'use strict';
  const VERSION = '0.2.0';
  function input(n) {
    if (!Number.isInteger(n) || n < 0 || n > 8) throw new RangeError('Inputs must be integers 0–8.');
    return n;
  }
  function score(features, echoes) {
    input(features); input(echoes);
    return Math.min(99, 11 * features + 7 * echoes + (features > 0 ? 35 : 0));
  }
  // Only the instructions used by our kernel; explicitly not a full 6502 emulator.
  function run6502(features, echoes, rom = root.PsycheROM) {
    input(features); input(echoes);
    if (!Array.isArray(rom) || rom.length === 0 || rom.length > 256 ||
        rom.some(x => !Number.isInteger(x) || x < 0 || x > 255)) throw new Error('Invalid ROM');
    const mem = new Uint8Array(65536);
    mem.set(rom, 0x600); mem[0] = features; mem[1] = echoes;
    let pc = 0x600, a = 0, x = 0, carry = 0, zero = false, steps = 0;
    const trace = [];
    function byte() {
      if (pc < 0x600 || pc >= 0x600 + rom.length) throw new Error('PC outside kernel');
      return mem[pc++];
    }
    function branch(take) { const offset = byte(); if (take) pc += offset < 128 ? offset : offset - 256; }
    while (++steps <= 1000) {
      const address = pc, op = byte();
      switch (op) {
        case 0xa9: a = byte(); zero = a === 0; break; // LDA immediate
        case 0xa6: x = mem[byte()]; zero = x === 0; break; // LDX zero-page
        case 0x85: mem[byte()] = a; break; // STA zero-page
        case 0x18: carry = 0; break; // CLC
        case 0x69: { const sum = a + byte() + carry; a = sum & 255; carry = sum > 255 ? 1 : 0; zero = a === 0; break; }
        case 0xca: x = (x - 1) & 255; zero = x === 0; break;
        case 0xc9: { const rhs = byte(); carry = a >= rhs ? 1 : 0; zero = a === rhs; break; }
        case 0xf0: branch(zero); break;
        case 0xd0: branch(!zero); break;
        case 0x90: branch(!carry); break;
        // BRK is a host stop sentinel, not hardware interrupt emulation.
        case 0x00: return { score: mem[2], evidence: mem[3], steps, trace };
        default: throw new Error('Unsupported opcode: ' + op.toString(16));
      }
      trace.push({ pc: address, op, a, x, carry });
    }
    throw new Error('6502 instruction budget exceeded');
  }
  function random(seed) {
    let state = seed >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      let value = Math.imul(state ^ (state >>> 15), state | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }
  function generate(seed, model = root.PsycheModel) {
    if (!Number.isInteger(seed) || seed < 1 || seed > 4294967295) throw new RangeError('Seed must be a nonzero uint32');
    const rng = random(seed), words = [];
    let context = ['<s>', '<s>'];
    for (let i = 0; i < 60; i++) {
      const choices = model.transitions[context.join('|')];
      if (!choices) break;
      const total = choices.reduce((sum, entry) => sum + entry[1], 0);
      let pick = Math.floor(rng() * total), token = choices[choices.length - 1][0];
      for (const [candidate, count] of choices) { pick -= count; if (pick < 0) { token = candidate; break; } }
      if (token === '</s>') break;
      words.push(token); context = [context[1], token];
    }
    return words.join(' ');
  }
  function receipt(config, reality = false) {
    if (!config || typeof config.a !== 'string' || typeof config.b !== 'string' ||
        config.a.length > 80 || config.b.length > 80 || !Array.isArray(config.features) ||
        config.features.some(x => typeof x !== 'string' || x.length > 80) ||
        new Set(config.features).size !== config.features.length) throw new TypeError('Invalid fictional case');
    const s = input(config.features.length), e = input(config.echoes);
    const cpu = run6502(s, e), js = score(s, e);
    if (cpu.score !== js || cpu.evidence !== 0) throw new Error('Kernel parity failure');
    const seed = 1 + s * 997 + e * 31;
    return {
      schema: 'psychejs-receipt-v1', version: VERSION, classification: 'FICTIONAL SATIRE — NOT EVIDENCE',
      projects: [config.a, config.b], features: [...config.features], agreementRounds: e,
      theatricalScore: js, scoreIsProbability: false, independentEvidenceItems: 0,
      mode: reality ? 'reality-check' : 'satire',
      conclusion: reality ? 'Shared features and generated agreement do not establish copying.' :
        (s ? 'SIMULATED CLAIM: one shared feature has been promoted to an unsupported theft allegation.' :
          'SIMULATED CLAIM: no feature matches; the agreement loop still manufactures confidence.'),
      languageModel: { type: 'word-trigram', corpusSha256: root.PsycheModel.corpusSha256, seed, text: generate(seed) },
      kernel: { machine: '6502 instruction subset', score: cpu.score, evidence: cpu.evidence, instructions: cpu.steps },
      limitations: ['No repository inspection or provenance analysis.', 'No real people or real disputes are assessed.',
        'The toy language model is not an LLM.', 'Seven implementations share a specification, not independent corroboration.']
    };
  }
  root.Psyche = { VERSION, score, run6502, generate, receipt };
  if (typeof module !== 'undefined') module.exports = root.Psyche;
})(globalThis);
