"""Execute the straight-line BASIC subset used by psyche.bas.

This is a test harness, NOT a Commodore BASIC implementation or C64 emulator.
No eval, no external process, no filesystem instructions in the language.
"""
import ast
import math
import re


def expression(text, variables):
    text = text.replace("<>", "!=")
    text = re.sub(r"\bOR\b", "or", text)
    tree = ast.parse(text, mode="eval")

    def visit(node):
        if isinstance(node, ast.Expression):
            return visit(node.body)
        if isinstance(node, ast.Constant) and type(node.value) in (int, float):
            return node.value
        if isinstance(node, ast.Name) and node.id in variables:
            return variables[node.id]
        if isinstance(node, ast.BinOp):
            a, b = visit(node.left), visit(node.right)
            if isinstance(node.op, ast.Add): return a + b
            if isinstance(node.op, ast.Mult): return a * b
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
            return -visit(node.operand)
        if isinstance(node, ast.BoolOp) and isinstance(node.op, ast.Or):
            return any(visit(v) for v in node.values)
        if isinstance(node, ast.Compare) and len(node.ops) == 1:
            a, b, op = visit(node.left), visit(node.comparators[0]), node.ops[0]
            if isinstance(op, ast.Lt): return a < b
            if isinstance(op, ast.Gt): return a > b
            if isinstance(op, ast.NotEq): return a != b
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "INT" and len(node.args) == 1 and not node.keywords:
            return math.floor(visit(node.args[0]))
        raise ValueError(f"Unsupported BASIC expression: {text}")
    return visit(tree)


def run(source, features, echoes):
    variables, output = {}, []
    lines = []
    for line in source.splitlines():
        number, statement = line.split(maxsplit=1)
        lines.append((int(number), statement))
    if len({number for number, _ in lines}) != len(lines):
        raise ValueError("Duplicate BASIC line")

    def execute(statement):
        if statement.startswith("REM "): return False
        if statement == "END": return True
        if statement == "INPUT S,E":
            variables.update(S=features, E=echoes)
            return False
        if statement.startswith("IF "):
            condition, action = statement[3:].split(" THEN ", 1)
            return execute(action) if expression(condition, variables) else False
        if statement.startswith("PRINT "):
            output.extend(expression(item, variables) for item in statement[6:].split(";"))
            return False
        if re.fullmatch(r"[A-Z]=.+", statement):
            key, value = statement.split("=", 1)
            variables[key] = expression(value, variables)
            return False
        raise ValueError(f"Unsupported BASIC statement: {statement}")
    for _, statement in sorted(lines):
        if execute(statement): break
    return output
