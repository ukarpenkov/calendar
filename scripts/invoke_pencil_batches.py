"""Print one batch's operations for copy/paste into MCP batch_design."""
import sys
from pathlib import Path

b = Path(__file__).parent / "pencil_batches" / f"b{sys.argv[1]}.txt"
sys.stdout.write(b.read_text(encoding="utf-8").strip())
