import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as f:
    data = json.load(f)

ids = []


def walk(o):
    if isinstance(o, dict):
        if o.get("type") == "frame" and o.get("name") in ("w1", "w2", "w3", "w4", "w5"):
            ids.append(o["id"])
        for v in o.values():
            walk(v)
    elif isinstance(o, list):
        for i in o:
            walk(i)


walk(data)
for i in ids:
    print(i)
