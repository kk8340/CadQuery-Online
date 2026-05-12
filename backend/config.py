from pathlib import Path

DATA_DIR = Path("data") / "models"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DOCS_FILE = Path(__file__).parent.parent / "docs.html"
DOCS_DATA_FILE = Path(__file__).parent.parent / "docs_data.json"
EXAMPLES_FILE = Path(__file__).parent.parent / "examples_templates.json"

CACHE_TTL = 2.0
