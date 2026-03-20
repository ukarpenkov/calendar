import json
import sys

p = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\trulo\.cursor\projects\c-JS-calendar-calendar\agent-tools\b750d939-4478-4f27-8aac-754b6650d19e.txt"
data = json.load(open(p, encoding="utf-8"))
ids = []


def walk(n):
    if isinstance(n, dict):
        if n.get("type") == "ref" and n.get("ref") == "rGyDG" and n.get("height") == 10:
            ids.append(n["id"])
        for v in n.values():
            walk(v)
    elif isinstance(n, list):
        for i in n:
            walk(i)


for root in data:
    walk(root)
print(f"count {len(ids)}", file=sys.stderr)
batch = 25
out_dir = sys.argv[2] if len(sys.argv) > 2 else None
for bi, i in enumerate(range(0, len(ids), batch)):
    chunk = ids[i : i + batch]
    lines = [
        f'U("{nid}",{{width:24,height:24,cornerRadius:6,descendants:{{jsyl9:{{fontSize:10,x:0,y:0}}}}}})'
        for nid in chunk
    ]
    block = "\n".join(lines)
    if out_dir:
        import os

        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, f"b{bi}.txt"), "w", encoding="utf-8") as f:
            f.write(block)
    else:
        print(block)
        print("###CHUNK###")
