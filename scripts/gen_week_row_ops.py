from pathlib import Path

for theme in ("light", "dark"):
    raw = Path(__file__).parent / f"w_ids_{theme}.txt"
    text = raw.read_text(encoding="utf-8").lstrip("\ufeff")
    ids = [ln.strip() for ln in text.splitlines() if ln.strip()]
    out_dir = Path(__file__).parent / f"w_u_{theme}"
    out_dir.mkdir(exist_ok=True)
    batch = 25
    for bi, i in enumerate(range(0, len(ids), batch)):
        chunk = ids[i : i + batch]
        ops = "\n".join(
            f'U("{x}",{{layout:"horizontal",gap:4,alignItems:"center",width:"fill_container"}})'
            for x in chunk
        )
        (out_dir / f"b{bi}.txt").write_text(ops, encoding="utf-8")
    print(theme, len(ids), "files", (len(ids) + batch - 1) // batch)
