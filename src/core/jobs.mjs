import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import { JOBS_DIR, PROJECTS_DIR } from './paths.mjs';
import { findCommand } from './process.mjs';
import { ensureDataDirs, readJson, writeJsonAtomic } from './storage.mjs';

const bus = new EventEmitter();
bus.setMaxListeners(100);
const jobFile=(id)=>path.join(JOBS_DIR,`${id}.json`);
const logFile=(id)=>path.join(JOBS_DIR,`${id}.ndjson`);

export async function listJobs(){
  await ensureDataDirs();
  const files=(await fs.readdir(JOBS_DIR)).filter(x=>x.endsWith('.json'));
  const jobs=(await Promise.all(files.map(f=>readJson(path.join(JOBS_DIR,f))))).filter(Boolean);
  return jobs.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
export async function getJob(id){return readJson(jobFile(id));}
export function subscribeJob(id,listener){const event=`job:${id}`;bus.on(event,listener);return()=>bus.off(event,listener);}
async function emitLine(id,payload){const line=typeof payload==='string'?payload:JSON.stringify(payload);await fs.appendFile(logFile(id),`${line}\n`,'utf8').catch(()=>{});bus.emit(`job:${id}`,line);}

function buildAgentPrompt(job){
  const skillByCategory={product:'/product-video and /brag',motion:'/motion-graphics and /hyperframes',website:'/motion-graphics and /hyperframes',shorts:'/auto-clips',documentary:'/openmontage',avatar:'/persona-live',editor:'/video-studio and FFmpeg',reel:'/video-studio, /asset-agent and /hyperframes'};
  return `You are running a GraviStudio production job.\n\nJOB ID: ${job.id}\nCATEGORY: ${job.category}\nWORKSPACE: ${job.projectDir}\nPREFERRED SKILLS: ${skillByCategory[job.category]||'/video-studio'}\nFREE MODE: ${job.options.freeMode!==false?'ON':'OFF'}\nUSER REQUEST:\n${job.prompt}\n\nUSER ASSETS:\n${job.assets.length?job.assets.join('\n'):'(none provided)'}\n\nREQUIREMENTS:\n- Read and follow the GraviStudio /video-studio router skill and the category skill.\n- If user assets are missing or insufficient, invoke /asset-agent before composition. Prefer project assets, website screenshots, Openverse/open-license media and open vectors. Never scrape random copyrighted images or use watermarked assets. Record provenance.\n- Use the user's signed-in Antigravity model for planning/orchestration. In Free Mode, do not call paid media APIs.\n- Work only inside this workspace except for already-installed tools.\n- Update .gravistudio/checkpoint.json after every major stage: requirements, storyboard, assets, composition, render, QC.\n- Resume from the checkpoint if it already exists; never repeat completed stages unnecessarily.\n- Render a real deliverable when the selected engine supports it.\n- Run /video-qc before marking the job complete.\n- Save final outputs under output/ and output/manifest.json.\n- If an external runtime is unavailable, stop at the earliest blocked stage, update the checkpoint with the exact missing prerequisite, and explain it rather than faking an output.\n`;
}
async function persist(job){job.updatedAt=new Date().toISOString();await writeJsonAtomic(jobFile(job.id),job);bus.emit(`job:${job.id}`,JSON.stringify({event:'job_state',job}));}
export async function createJob(input){
  await ensureDataDirs();
  const id=crypto.randomBytes(6).toString('hex');
  const projectDir=path.join(PROJECTS_DIR,id);
  await Promise.all(['.gravistudio','input','work','output'].map(d=>fs.mkdir(path.join(projectDir,d),{recursive:true})));
  const now=new Date().toISOString();
  const job={id,title:input.title||input.prompt.slice(0,48)||'Untitled video',category:input.category,prompt:input.prompt,projectDir,assets:input.assets||[],options:input.options||{freeMode:true},createdAt:now,updatedAt:now,status:'queued'};
  await persist(job); void runJob(job); return job;
}
export async function resumeJob(id){const job=await getJob(id);if(!job)throw new Error('Job not found');if(job.status==='running')return job;job.status='queued';await persist(job);void runJob(job,true);return job;}
async function runJob(job,resume=false){
  job.status='running';await persist(job);await emitLine(job.id,{event:'studio',message:resume?'Resuming from checkpoint…':'Starting Antigravity production…'});
  const args=['-p',buildAgentPrompt(job),'--output-format','stream-json','--print-timeout','60m','--cwd',job.projectDir];
  if(resume&&job.conversationId)args.push('--conversation',job.conversationId);
  const command=await findCommand('agy');
  if(!command){job.status='failed';job.lastMessage='Antigravity CLI (agy) is not installed or discoverable. Install/sign in to Antigravity CLI, then Resume.';await persist(job);await emitLine(job.id,{event:'studio_done',status:job.status,message:job.lastMessage});return;}
  const child=spawn(command,args,{cwd:job.projectDir,windowsHide:true,shell:false,env:process.env});
  let stderr='';let buffer='';let closed=false;
  child.stdout?.on('data',async(chunk)=>{buffer+=chunk.toString();const lines=buffer.split(/\r?\n/);buffer=lines.pop()||'';for(const line of lines.filter(Boolean)){await emitLine(job.id,line);try{const evt=JSON.parse(line);if(evt.conversation_id)job.conversationId=evt.conversation_id;if(evt.init?.conversation_id)job.conversationId=evt.init.conversation_id;if(evt.step_update?.text_delta)job.lastMessage=evt.step_update.text_delta;}catch{}}});
  child.stderr?.on('data',(chunk)=>{stderr+=chunk.toString();void emitLine(job.id,{event:'stderr',message:chunk.toString()});});
  child.on('error',async(error)=>{if(closed)return;closed=true;job.status='failed';job.lastMessage=error.message;await persist(job);await emitLine(job.id,{event:'studio_done',status:job.status,message:job.lastMessage});});
  child.on('close',async(code)=>{if(closed)return;closed=true;if(buffer.trim())await emitLine(job.id,buffer.trim());const permissionBlocked=/permission|approval|soft-denied|not allowed/i.test(stderr);job.status=code===0?(permissionBlocked?'waiting_permission':'completed'):'failed';job.lastMessage=permissionBlocked?'Antigravity needs scoped permission for one or more commands. Review Antigravity permissions, then Resume.':(code===0?'Agent run completed. Check output/ and QC results.':stderr.trim().slice(-1000)||`Antigravity exited with code ${code}`);await persist(job);await emitLine(job.id,{event:'studio_done',status:job.status,message:job.lastMessage});});
}
