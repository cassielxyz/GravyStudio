import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const target = path.join(os.homedir(), '.gemini', 'config', 'plugins', 'gravistudio');
await fs.rm(target, { recursive: true, force: true });
await fs.mkdir(path.dirname(target), { recursive: true });
await fs.cp(path.join(root, 'plugin'), target, { recursive: true });
console.log(`Installed GraviStudio plugin to ${target}`);
