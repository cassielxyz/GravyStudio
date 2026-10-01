$ErrorActionPreference = "Stop"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 22+ is required." }
Start-Process "http://127.0.0.1:47831"
node src/server/index.mjs
