import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

function findRoot(start) {
  let current = start;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(current, 'package.json'))) return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return process.cwd();
}

export const ROOT_DIR = findRoot(path.dirname(fileURLToPath(import.meta.url)));
export const DATA_DIR = process.env.GRAVISTUDIO_HOME || path.join(os.homedir(), '.gravistudio');
export const TOOLS_DIR = path.join(DATA_DIR, 'tools');
export const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
export const JOBS_DIR = path.join(DATA_DIR, 'jobs');
export const AGY_GLOBAL_SKILLS = path.join(os.homedir(), '.gemini', 'config', 'skills');
export const AGY_GLOBAL_PLUGINS = path.join(os.homedir(), '.gemini', 'config', 'plugins');
export const STUDIO_PLUGIN_DIR = path.join(AGY_GLOBAL_PLUGINS, 'gravistudio');
