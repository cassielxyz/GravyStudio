import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function run(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...(options.env || {}) },
      windowsHide: true,
      shell: false
    });
    let stdout = '';
    let stderr = '';
    const timer = options.timeoutMs ? setTimeout(() => child.kill('SIGTERM'), options.timeoutMs) : null;
    child.stdout?.on('data', (d) => { stdout += d.toString(); });
    child.stderr?.on('data', (d) => { stderr += d.toString(); });
    child.on('error', (error) => {
      if (timer) clearTimeout(timer);
      resolve({ code: 127, stdout, stderr: `${stderr}${error.message}` });
    });
    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

export async function findCommand(command) {
  const probe = process.platform === 'win32' ? ['where', [command]] : ['which', [command]];
  const result = await run(probe[0], probe[1], { timeoutMs: 5000 });
  if (result.code === 0) return result.stdout.trim().split(/\r?\n/)[0];
  if (command === 'agy') {
    const candidates = process.platform === 'win32'
      ? [path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'agy', 'bin', 'agy.exe')]
      : [path.join(os.homedir(), '.local', 'bin', 'agy')];
    for (const candidate of candidates) if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export async function commandExists(command) { return Boolean(await findCommand(command)); }
