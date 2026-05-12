import re
from pathlib import Path

DATA_DIR = Path("data") / "models"
DATA_DIR.mkdir(parents=True, exist_ok=True)

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"
DOCS_FILE = Path(__file__).parent.parent / "docs.html"
DOCS_DATA_FILE = Path(__file__).parent.parent / "docs_data.json"
MONACO_DIR = Path(__file__).parent.parent / "frontend" / "monaco-editor"
EXAMPLES_FILE = Path(__file__).parent.parent / "examples_templates.json"

HIGH_RISK_PATTERNS = [
    r'eval\s*\(',
    r'exec\s*\(',
    r'__import__\s*\(',
    r'os\.system',
    r'os\.popen',
    r'subprocess',
]

DANGEROUS_PATTERNS = [
    r'__import__\s*\(',
    r'eval\s*\(',
    r'exec\s*\(',
    r'open\s*\(',
    r'os\.',
    r'sys\.',
    r'subprocess',
    r'importlib',
    r'__file__',
    r'__builtins__',
    r'globals\s*\(',
    r'locals\s*\(',
    r'getattr\s*\(',
    r'setattr\s*\(',
    r'delattr\s*\(',
    r'pickle',
    r'shutil',
]

CACHE_TTL = 2.0
