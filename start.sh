#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REMOTE=false
for arg in "$@"; do
  case "$arg" in
    --remote)
      REMOTE=true
      ;;
  esac
done

HOST=127.0.0.1
ACCESS_HOST=127.0.0.1
if [ "$REMOTE" = true ]; then
  HOST=0.0.0.0
  ACCESS_HOST="$(hostname -I 2>/dev/null | awk '{print $1}')"
  if [ -z "$ACCESS_HOST" ]; then
    ACCESS_HOST="YOUR_SERVER_IP"
  fi
fi

echo "Stopping existing Python and Node processes..."
for pid in $(ps -eo pid=,comm= | awk '$2 ~ /^(python|python3|node|nodejs|npm)$/ {print $1}'); do
  kill -9 "$pid" 2>/dev/null || true
done

if [ ! -d "$SCRIPT_DIR/.venv" ]; then
  echo "Virtual environment not found. Run ./setup.sh first." >&2
  exit 1
fi

source "$SCRIPT_DIR/.venv/bin/activate"

if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  (cd "$SCRIPT_DIR/frontend" && npm install)
fi

echo "Starting backend server..."
nohup python backend/manage.py runserver "$HOST":8000 > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

echo "Starting frontend dev server..."
nohup npm --prefix "$SCRIPT_DIR/frontend" run dev -- --host "$HOST" > "$SCRIPT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

echo "Backend running at http://$ACCESS_HOST:8000 (PID: $BACKEND_PID)"
echo "Frontend running at http://$ACCESS_HOST:5173 (PID: $FRONTEND_PID)"
echo "Logs: backend.log and frontend.log"
