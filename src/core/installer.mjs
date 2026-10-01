import fs from 'node:fs/promises';
import path from 'node:path';
import { AGY_GLOBAL_SKILLS, STUDIO_PLUGIN_DIR, TOOLS_DIR, ROOT_DIR } from './paths.mjs';
import { modules } from './registry.mjs';
import { run, commandExists } from './process.mjs';
import { runDoctor } from './doctor.mjs';

async function ensureDirs(){ await Promise.all([fs.mkdir(AGY_GLOBAL_SKILLS,{recursive:true}),fs.mkdir(path.dirname(STUDIO_PLUGIN_DIR),{recursive:true}),fs.mkdir(TOOLS_DIR,{recursive:true})]); }
async function installPlugin(emit){
  emit({step:'plugin',state:'running',message:'Installing GraviStudio Antigravity plugin…'});
  await fs.rm(STUDIO_PLUGIN_DIR,{recursive:true,force:true});
  await fs.cp(path.join(ROOT_DIR,'plugin'),STUDIO_PLUGIN_DIR,{recursive:true});
  emit({step:'plugin',state:'ok',message:`Plugin installed to ${STUDIO_PLUGIN_DIR}`});
}
async function installBrag(emit){
  const target=path.join(AGY_GLOBAL_SKILLS,'brag','SKILL.md');
  try{await fs.access(target);emit({step:'brag',state:'ok',message:'/brag is already installed.'});return;}catch{}
  emit({step:'brag',state:'running',message:'Installing /brag skill…'});
  const npx=process.platform==='win32'?'npx.cmd':'npx';
  const result=await run(npx,['--yes','skills','add','https://github.com/latent-spaces/brag','--skill','brag','-g'],{timeoutMs:180000});
  try{await fs.access(target);emit({step:'brag',state:'ok',message:'/brag installed and discovered by Antigravity.'});return;}catch{}
  if(!await commandExists('git')) throw new Error(`Git is required to install /brag. ${result.stderr}`);
  const repo=path.join(TOOLS_DIR,'brag');
  await fs.rm(repo,{recursive:true,force:true});
  const clone=await run('git',['clone','--depth','1','https://github.com/latent-spaces/brag.git',repo],{timeoutMs:180000});
  if(clone.code!==0) throw new Error(clone.stderr||'Failed to clone /brag.');
  await fs.mkdir(path.dirname(target),{recursive:true});
  await fs.cp(path.join(repo,'skills','brag'),path.dirname(target),{recursive:true});
  emit({step:'brag',state:'ok',message:'/brag installed with clone fallback.'});
}
async function installHyperframes(emit){
  const target=path.join(AGY_GLOBAL_SKILLS,'hyperframes','SKILL.md');
  emit({step:'hyperframes',state:'running',message:'Installing/updating HyperFrames core skills…'});
  const npx=process.platform==='win32'?'npx.cmd':'npx';
  const result=await run(npx,['--yes','hyperframes','skills','update'],{timeoutMs:240000});
  try{await fs.access(target);emit({step:'hyperframes',state:'ok',message:'HyperFrames skills installed and verified.'});}
  catch{emit({step:'hyperframes',state:'warning',message:`HyperFrames installer finished but the global Antigravity router skill was not found yet. ${result.stderr.trim()}`});}
}
async function cloneEngine(id,repoUrl,emit){
  const target=path.join(TOOLS_DIR,id);
  try{await fs.access(path.join(target,'.git'));emit({step:id,state:'running',message:`Updating ${id}…`});const pull=await run('git',['-C',target,'pull','--ff-only'],{timeoutMs:180000});emit({step:id,state:pull.code===0?'ok':'warning',message:pull.code===0?`${id} is up to date.`:`${id} is installed; update skipped: ${pull.stderr.trim()}`});return;}catch{}
  emit({step:id,state:'running',message:`Downloading ${id}…`});
  const clone=await run('git',['clone','--depth','1',repoUrl,target],{timeoutMs:300000});
  emit({step:id,state:clone.code===0?'ok':'error',message:clone.code===0?`${id} downloaded. Runtime dependencies are verified separately.`:(clone.stderr.trim()||`Failed to clone ${id}.`)});
}
export async function initialize(groups,emit){
  await ensureDirs(); await installPlugin(emit);
  if(groups.includes('core')){
    try{await installBrag(emit);}catch(e){emit({step:'brag',state:'error',message:e.message||String(e)});}
    try{await installHyperframes(emit);}catch(e){emit({step:'hyperframes',state:'error',message:e.message||String(e)});}
  }
  if(await commandExists('git')){
    for(const mod of modules) if(mod.kind==='engine'&&mod.repo&&groups.includes(mod.group)) await cloneEngine(mod.id,mod.repo,emit);
  }else emit({step:'git',state:'error',message:'Git is required for optional engine installation.'});
  emit({step:'verify',state:'running',message:'Running final health checks…'});
  const doctor=await runDoctor();
  emit({step:'verify',state:doctor.ready?'ok':'warning',message:doctor.ready?'Core studio is ready. Start a fresh Antigravity session to refresh skill discovery.':'Initialization finished with items that still need attention.'});
  return doctor;
}
