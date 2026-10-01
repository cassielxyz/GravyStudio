#!/usr/bin/env bash
set -euo pipefail
command -v node >/dev/null || { echo "Node.js 22+ is required"; exit 1; }
( sleep 1; python3 -m webbrowser http://127.0.0.1:47831 >/dev/null 2>&1 || true ) &
node src/server/index.mjs
