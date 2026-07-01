#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Stopping existing Python and Node processes..."
for pid in $(ps -eo pid=,comm= | awk '$2 ~ /^(python|python3|node|nodejs|npm)$/ {print $1}'); do
  kill -9 "$pid" 2>/dev/null || true
done

echo "Checking Python runtime..."
if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "Python was not found. Install Python 3 and try again." >&2
  exit 1
fi

echo "Creating backend virtual environment in .venv..."
"$PYTHON_BIN" -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
python backend/manage.py migrate

echo "Installing frontend dependencies..."
if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
  (cd "$SCRIPT_DIR/frontend" && npm install)
else
  echo "Frontend dependencies already installed."
fi

echo "Setup complete."
echo "Run ./start.sh to launch the app."
