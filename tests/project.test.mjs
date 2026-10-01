import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { categories } from '../src/core/categories.mjs';
import { modules } from '../src/core/registry.mjs';
import { ROOT_DIR } from '../src/core/paths.mjs';

test('all video categories resolve to a registered engine/runtime',()=>{const ids=new Set(modules.map(m=>m.id));for(const c of categories)assert.ok(ids.has(c.engine),`${c.id} engine ${c.engine} missing`)});
test('plugin has router, asset and QC skills',async()=>{for(const name of ['video-studio','asset-agent','video-qc']){const text=await fs.readFile(path.join(ROOT_DIR,'plugin','skills',name,'SKILL.md'),'utf8');assert.match(text,/^---/);assert.match(text,new RegExp(`name: ${name}`));}});
test('free-first rule blocks permission bypass and fake renders',async()=>{const text=await fs.readFile(path.join(ROOT_DIR,'plugin','rules','free-first.md'),'utf8');assert.match(text,/dangerously-skip-permissions/);assert.match(text,/Never claim a render exists/)});
test('plugin manifest matches Antigravity schema marker',async()=>{const m=JSON.parse(await fs.readFile(path.join(ROOT_DIR,'plugin','plugin.json'),'utf8'));assert.equal(m.name,'gravistudio');assert.match(m.$schema,/antigravity\.google/)});
