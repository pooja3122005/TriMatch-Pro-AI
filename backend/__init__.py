import sys
from pathlib import Path

# Add backend directory to sys.path so 'app.*' package imports resolve universally
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))
