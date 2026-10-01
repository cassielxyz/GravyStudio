import fs from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR, JOBS_DIR, PROJECTS_DIR } from './paths.mjs';

export async function ensureDataDirs() {
  await Promise.all([DATA_DIR, JOBS_DIR, PROJECTS_DIR].map((d) => fs.mkdir(d, { recursive:true })));
}
export async function writeJsonAtomic(file, data) {
  await fs.mkdir(path.dirname(file), { recursive:true });
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(temp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(temp, file);
}
export async function readJson(file) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return null; }
}
