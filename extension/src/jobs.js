'use strict';
const vscode=require('vscode');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {CATEGORIES}=require('./data');
const {findAgy,configPath}=require('./system');
const {buildLaunchCommand}=require('./launch-command');

async function startJob(categoryId){
  const c=CATEGORIES.find(x=>x.id===categoryId);
  if(!c)return{ok:false,code:'unknown-category',message:'Unknown video workspace.'};

  const brief=await vscode.window.showInputBox({
    title:`New ${c.title}`,
    prompt:'Describe the video you want GraviStudio to produce',
    placeHolder:'Example: Create a 30-second 9:16 launch video using the real UI and no paid providers.',
    ignoreFocusOut:true
  });
  if(!brief)return{ok:false,code:'cancelled'};

  const wf=vscode.workspace.workspaceFolders&&vscode.workspace.workspaceFolders[0];
  let root=wf?wf.uri.fsPath:null;
  if(!root){
    const p=await vscode.window.showOpenDialog({
      canSelectFolders:true,
      canSelectFiles:false,
      canSelectMany:false,
      openLabel:'Use as GraviStudio project folder'
    });
    if(!p||!p[0])return{ok:false,code:'cancelled'};
    root=p[0].fsPath;
  }

  const stateDir=path.join(root,'.gravistudio');
  fs.mkdirSync(stateDir,{recursive:true});
  const checkpoint=path.join(stateDir,'checkpoint.json');
  const free=vscode.workspace.getConfiguration('gravistudio').get('freeMode',true);
  const modules=configPath('moduleDirectory','~/.gravistudio/modules');
  const job={
    id:crypto.randomUUID(),
    category:c.id,
    title:c.title,
    brief,
    route:c.route,
    stage:'requirements',
    completedStages:[],
    status:'draft',
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
  fs.writeFileSync(checkpoint,JSON.stringify(job,null,2));

  const prompt=[
    'You are running a GraviStudio video production job.',
    `Category: ${c.title}. Preferred route: ${Array.isArray(c.route)?c.route.join(' + '):c.route}.`,
    `User brief: ${brief}`,
    `Project root: ${root}`,
    `Checkpoint: ${checkpoint}`,
    `Optional engine checkouts: ${modules}`,
    `Free Mode: ${free?'ON — do not use paid providers.':'OFF — request explicit approval before any paid provider.'}`,
    'Read the checkpoint and inspect project/assets first. Never redo a completed stage whose inputs are unchanged.',
    'Use installed GraviStudio skills for requirements → storyboard → assets → composition → render → qc.',
    'If assets are missing, use asset-agent and record provenance/license metadata.',
    'Update .gravistudio/checkpoint.json after every completed stage. Do not claim success until output exists and video-qc passes.',
    'Never use permission-bypass flags; stop at the exact checkpoint if permission is required.'
  ].join('\n');

  const agy=findAgy();
  if(!agy){
    job.status='blocked';
    job.blocker={
      code:'agy-missing',
      message:'Antigravity CLI is not available on PATH or its standard install location.',
      nextStep:'Install/sign in to Antigravity CLI, then run Verify and launch this workspace again.'
    };
    job.updatedAt=new Date().toISOString();
    fs.writeFileSync(checkpoint,JSON.stringify(job,null,2));
    return{
      ok:false,
      code:'agy-missing',
      category:c.id,
      title:c.title,
      checkpoint,
      message:`${c.title} draft saved`,
      detail:'Antigravity CLI is required to launch the autonomous agent. Your brief was saved, so no work is lost.',
      action:'doctor'
    };
  }

  job.status='launching';
  job.updatedAt=new Date().toISOString();
  fs.writeFileSync(checkpoint,JSON.stringify(job,null,2));

  const t=vscode.window.createTerminal({name:`GraviStudio · ${c.title}`,cwd:root});
  t.show(true);
  t.sendText(buildLaunchCommand(agy,prompt),true);

  job.status='running';
  job.updatedAt=new Date().toISOString();
  fs.writeFileSync(checkpoint,JSON.stringify(job,null,2));

  return{
    ok:true,
    code:'started',
    category:c.id,
    title:c.title,
    checkpoint,
    message:`${c.title} started`,
    detail:'Antigravity agent launched in the GraviStudio terminal. Checkpointing is active.'
  };
}

module.exports={startJob};
