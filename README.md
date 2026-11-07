# PsycheJS — The Large Leap Machine

**One thing in common. Case closed.**

An offline satire of similarity-as-proof and AI agreement loops. Feed two fictional
projects a shared semicolon and watch the Department of Unfounded Certainty turn
it into an official-looking intellectual-property emergency.

Seven languages agree on the same absurd arithmetic. None of them supplies
evidence for the premise.

## Run

Open **`index.html`** directly in a modern browser. No install, server, npm,
framework, API key, model download, telemetry or network call is required.
Alternatively serve this directory with `uv run --no-project python -m http.server 8000`.
The source link in the footer opens GitHub only when you choose it.

1. Choose one of four fictional project pairs.
2. Select up to eight ordinary features and up to eight AI agreement rounds.
3. Manufacture certainty. The canvas traces the leap; a 6502 kernel executes it.
4. Apply the reality check. The evidence count remains zero.
5. Download a JSON receipt containing inputs, model seed, corpus hash and limits.

The phrase **LLM** here stands for **Large Leap Machine**. A real, small statistical
word-trigram language model generates the rhetoric locally. It is **not** a large
language model, a neural network, a plagiarism detector or a repository scanner.
The fictional cases and training corpus contain no real individuals or disputes.

## The unnecessarily polyglot bit

| Implementation | What actually runs | How it is checked |
| --- | --- | --- |
| Vanilla JavaScript | Reference kernel, seeded language-model inference and UI | Exhaustive 81-pair tests + browser interactions |
| x86-64 assembly | Linux SysV executable, assembled by GNU `gcc`/`as` | Native output parity and invalid arguments |
| Ada | GNAT executable | Native output parity and invalid arguments |
| Fortran | GNU Fortran executable | Native output parity and invalid arguments |
| COBOL | GnuCOBOL executable | Native output parity and invalid arguments |
| 6502 assembly | ROM executed by a small JS instruction interpreter | Exhaustive parity; independent ca65/ld65 byte comparison |
| Commodore BASIC V2 | Line-numbered source for a 6502-era machine | Executed through a deliberately limited Python test interpreter |

HTML, CSS and canvas supply the interface. Python's standard library builds the
assets and orchestrates verification. The native programs are separate references,
not loaded into the browser. No WebAssembly or native browser plugin is involved.

**BASIC is not 6502 machine code.** The BASIC example targets the dialect found on
Commodore 64 machines. Our test interpreter is not Commodore BASIC or a C64
emulator, and hardware execution is not claimed. The JS CPU also supports only
the instructions in this kernel, treating `BRK` as a host stop rather than an
emulated interrupt. It is not cycle-accurate.

## Contract

For integer `features` and `echoes` in `0..8`:

```text
theatrical_score = min(99, 11*features + 7*echoes + (35 if features > 0 else 0))
independent_evidence_items = 0
```

Scores are arbitrary props, **not probabilities**. With zero overlap and eight
echoes, the score is still 56: this is the intentional negative control. Native
CLIs take two digit arguments and print `score 0`; invalid inputs fail without a
result. COBOL accepts trailing space padding because its argument field is fixed
width. BASIC accepts numeric input and rejects out-of-range or fractional values.

Seven implementations sharing a specification are not seven independent witnesses.
The parity test establishes implementation agreement, not truth of an accusation.

## Build and verify

```sh
uv run --no-project python tools/build_assets.py
uv run --no-project python tools/build_assets.py --check
uv run --no-project python tools/verify.py
```

`verify.py` reports missing toolchains as **SKIP**. `--require-all` fails on missing
toolchains. Linux x86-64 CI installs GNAT, GNU Fortran, GnuCOBOL and cc65, then
requires every native check. Node is a development-only JS test runner available
on the CI image; there is no package.json or npm dependency. Browser users do not
need Node. Compiler versions are printed in CI; the OS package set is not locked.

Optional browser checks (Playwright is only a test dependency):

```sh
uv run --no-project --with playwright==1.62.0 playwright install chromium
uv run --no-project --with playwright==1.62.0 python tests/browser.py
```

The suite boots via `file://`, exercises the controls, keyboard and receipt export,
checks desktop/tablet/mobile widths, and asserts zero HTTP requests and page errors.
Screenshots go to the ignored `test-results/` directory.

To run a native program after verification: `./build/ada 1 3` (or `fortran`,
`cobol`, `x86_64`). All return the theatrical score `67` and evidence count `0`.
For BASIC, enter the lines in `native/basic/psyche.bas` into a compatible BASIC
interpreter and `RUN`, then enter e.g. `1,3`. Actual hardware remains untested.

## Inspect the model

`model/corpus.txt` is an original 40-sentence fictional corpus. The builder counts
word-trigram transitions, preserving case and punctuation, and emits
`web/model.js`. There is no gradient training. Seeded weighted sampling emits at
most 60 tokens; the same input counts replay the same sentence in this implementation.
The model may recombine phrases or reproduce a training sentence. It does not
understand software, determine attribution, or corroborate its own prompts.

The receipt identifies the corpus using SHA-256. A hash matches bytes; it does
not certify the truth of generated text. No timestamp or digital signature is
invented. Generated assets are checked for exact agreement with their source.

## Scope and licence

This is a joke about a reasoning failure. It is not a finding about anybody's
work, identity, beliefs, ability or mental health. No accusation is sent, posted,
or filed. Specific matching material, history, access and licensing would need
independent examination in a real provenance dispute.

Apache-2.0, per [LICENSE](LICENSE). QSOL-IMC.
