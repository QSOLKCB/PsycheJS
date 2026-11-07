#!/usr/bin/env python3
"""Compile available native kernels; exhaustively verify the 81 valid pairs."""
import argparse
import json
from pathlib import Path
import platform
import shutil
import subprocess
import sys
from basic_subset import run as basic
from build_assets import assemble, assets

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"


def execute(args, **kwargs):
    result = subprocess.run([str(x) for x in args], cwd=ROOT, capture_output=True, text=True, **kwargs)
    if result.returncode:
        raise RuntimeError(f"Command failed: {args}\n{result.stdout}\n{result.stderr}")
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--require-all", action="store_true", help="Fail if a native toolchain is unavailable")
    args = parser.parse_args()
    BUILD.mkdir(exist_ok=True)
    for filename, content in assets().items():
        assert (ROOT / filename).read_bytes() == content.encode(), f"Stale asset: {filename}"
    points = [(s, e, min(99, 11*s + 7*e + (35 if s else 0))) for s in range(9) for e in range(9)]
    basic_source = (ROOT / "native/basic/psyche.bas").read_text()
    for s, e, expected in points:
        assert basic(basic_source, s, e) == [expected, 0]
    for s, e in [(-1, 0), (0, 9), (0.5, 0), (0, 2.5)]:
        assert basic(basic_source, s, e) == []
    print("PASS BASIC source through the limited test interpreter: 81 pairs + invalid controls")
    if shutil.which("node"):
        print(execute(["node", "tests/engine.cjs"]).stdout.strip())
    elif args.require_all:
        raise SystemExit("Missing node for development-time JS tests")
    else:
        print("SKIP JS CLI tests: Node unavailable; browser suite can run them")
    configs = {
        "x86_64": ("gcc", ["gcc", "-Wall", "-Wextra", "-o", BUILD/"x86_64", "native/x86_64/kernel.S"]),
        "ada": ("gnatmake", ["gnatmake", "-q", "-gnat2022", "-D", BUILD, "-o", BUILD/"ada", "native/ada/psyche.adb"]),
        "fortran": ("gfortran", ["gfortran", "-std=f2008", "-Wall", "-Wextra", "-fcheck=all", "-o", BUILD/"fortran", "native/fortran/psyche.f90"]),
        "cobol": ("cobc", ["cobc", "-x", "-Wall", "-o", BUILD/"cobol", "native/cobol/psyche.cob"]),
    }
    checked, skipped = [], []
    for name, (tool, command) in configs.items():
        if not shutil.which(tool) or (name == "x86_64" and (platform.machine() != "x86_64" or sys.platform != "linux")):
            skipped.append(name)
            print(f"SKIP {name}: toolchain/platform unavailable")
            continue
        result = execute(command)
        if result.stderr: print(result.stderr.strip())
        for s, e, expected in points:
            result = execute([BUILD/name, s, e])
            assert [int(v) for v in result.stdout.split()] == [expected, 0], (name, s, e, result.stdout)
        for bad in [[], ["1"], ["0", "0", "0"], ["9", "0"], ["0", "9"], ["-1", "0"], ["1.5", "0"], ["x", "0"], ["", "0"], ["12", "0"]]:
            result = subprocess.run([str(BUILD/name), *bad], capture_output=True, text=True)
            assert result.returncode != 0, (name, "accepted invalid input", bad)
            assert not result.stdout.strip(), (name, "produced result for invalid input", bad)
        checked.append(name)
        print(f"PASS {name}: 81 pairs + 10 invalid controls")
    if shutil.which("ca65") and shutil.which("ld65"):
        execute(["ca65", "native/6502/kernel.s", "-o", BUILD/"6502.o"])
        execute(["ld65", "-C", "native/6502/link.cfg", BUILD/"6502.o", "-o", BUILD/"6502.bin"])
        assert (BUILD/"6502.bin").read_bytes() == bytes(assemble((ROOT/"native/6502/kernel.s").read_text()))
        checked.append("ca65")
        print("PASS 6502: independent ca65/ld65 assembly matches checked-in ROM")
    else:
        skipped.append("ca65")
        print("SKIP independent ca65 assembly: toolchain unavailable")
    print(json.dumps({"executedNative": checked, "skipped": skipped, "actualC64Hardware": "NOT_TESTED"}))
    if args.require_all and skipped:
        raise SystemExit("Required toolchains missing: " + ", ".join(skipped))


if __name__ == "__main__":
    main()
