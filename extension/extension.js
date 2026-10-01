'use strict';
const vscode=require('vscode');
const {StudioProvider}=require('./src/provider');
const {setOutput,installBundledSkills,doctor,installModule}=require('./src/system');
let output,provider;
async function activate(context){
 output=vscode.window.createOutputChannel('GraviStudio');setOutput(output);
 const actions={
  initialize:async modules=>{await vscode.window.withProgress({location:vscode.ProgressLocation.Notification,title:'GraviStudio: initializing',cancellable:false},async p=>{p.report({message:'Installing bundled Antigravity skills…'});installBundledSkills(context);let i=0;for(const id of modules){i++;p.report({message:`Installing optional module ${i}/${modules.length}…`});await installModule(context,id,true)}p.report({message:'Verifying…'})});const s=await doctor(context);provider.publish(s);const missing=Object.entries(s.skills).filter(([,ok])=>!ok).map(([k])=>k);missing.length?vscode.window.showWarningMessage(`Initialized, but verification failed for: ${missing.join(', ')}`):vscode.window.showInformationMessage('GraviStudio initialized successfully. Bundled skills are installed and verified.')},
  logs:()=>output.show(true),
  error:e=>{output.appendLine(`[error] ${e&&e.stack?e.stack:e}`);vscode.window.showErrorMessage(`GraviStudio: ${e.message||e}`)}
 };
 provider=new StudioProvider(context.extensionUri,context,actions);
 context.subscriptions.push(output,vscode.window.registerWebviewViewProvider('gravistudio.dashboard',provider,{webviewOptions:{retainContextWhenHidden:true}}));
 context.subscriptions.push(vscode.commands.registerCommand('gravistudio.openStudio',()=>provider.open()));
 context.subscriptions.push(vscode.commands.registerCommand('gravistudio.initialize',()=>actions.initialize([])));
 context.subscriptions.push(vscode.commands.registerCommand('gravistudio.doctor',async()=>{const s=await doctor(context);provider.publish(s);const n=Object.values(s.skills).filter(Boolean).length;vscode.window.showInformationMessage(`GraviStudio: ${n}/${Object.keys(s.skills).length} bundled skills loaded. ${s.runtime.agy?'Antigravity CLI ready.':'Antigravity CLI needs setup.'}`)}));
}
function deactivate(){}
module.exports={activate,deactivate};
