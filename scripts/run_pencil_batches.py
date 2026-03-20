"""Apply pencil_batches/b*.txt via MCP: print each block for manual paste, or pipe."""
import os
import sys

d = os.path.join(os.path.dirname(__file__), "pencil_batches")
for fn in sorted(os.listdir(d), key=lambda x: int(x[1:-4]) if x[0] == "b" and x.endswith(".txt") else 999):
    if not fn.startswith("b") or not fn.endswith(".txt"):
        continue
    p = os.path.join(d, fn)
    block = open(p, encoding="utf-8").read().strip()
    print("---FILE---", fn)
    print(block)
    print()
