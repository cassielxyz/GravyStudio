import fs from 'node:fs/promises';
import path from 'node:path';
import { modules } from './registry.mjs';
import { AGY_GLOBAL_SKILLS, STUDIO_PLUGIN_DIR, TOOLS_DIR } from './paths.mjs';
import { commandExists, findCommand, run } from './process.mjs';

async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }
async function checkModule(mod) {
  if (mod.id === 'openverse' || mod.id === 'iconify') return { ...mod, state:'ready', detail:'Built-in free asset provider adapter enabled.' };
  if (mod.kind === 'runtime' && mod.command) {
    const executable = await findCommand(mod.command);
    if (!executable) return { ...mod, state:'missing', detail: mod.command==='agy' ? 'Antigravity CLI not found. Install it from the official Antigravity CLI installer, authenticate once, then Verify.' : `${mod.command} is not on PATH.` };
    const result = await run(executable, mod.doctorArgs || ['--version'], { timeoutMs:15000 });
    return { ...mod, state:result.code===0?'ready':'warning', detail:(result.stdout||result.stderr).trim().split('\n')[0]||'Detected.' };
  }
  if (mod.kind === 'skill' && mod.skillFolder) {
    const p = path.join(AGY_GLOBAL_SKILLS, mod.skillFolder, 'SKILL.md');
    const present = await exists(p);
    return { ...mod, state:present?'ready':'missing', detail:present?`Loaded at ${p}`:`Skill not found at ${p}` };
  }
  if (mod.kind === 'engine') {
    if (mod.command && await commandExists(mod.command)) {
      const result = await run(mod.command, mod.doctorArgs || ['--help'], { timeoutMs:30000 });
      return { ...mod, state:result.code===0?(mod.experimental?'experimental':'ready'):'warning', detail:(result.stdout||result.stderr).trim().split('\n')[0]||'Command detected.' };
    }
    const repoDir = path.join(TOOLS_DIR, mod.id);
    const cloned = await exists(path.join(repoDir, '.git'));
    return { ...mod, state:cloned?(mod.experimental?'experimental':'warning'):'missing', detail:cloned?`Repository present at ${repoDir}; runtime setup may still be required.`:'Not installed.' };
  }
  return { ...mod, state:'missing', detail:'Unknown state.' };
}
export async function runDoctor() {
  const pluginReady = await exists(path.join(STUDIO_PLUGIN_DIR, 'plugin.json'));
  const items = await Promise.all(modules.map(checkModule));
  return { plugin:{ state:pluginReady?'ready':'missing', path:STUDIO_PLUGIN_DIR }, items, ready:pluginReady && items.filter(x=>x.group==='core').every(x=>x.state==='ready') };
}
