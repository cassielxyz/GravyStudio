'use strict';
const vscode=require('vscode');
const crypto=require('crypto');
const {doctor,installModule}=require('./system');
const {startJob}=require('./jobs');
let activePanel,lastState;

const ICONS={
 play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z" fill="currentColor"/></svg>',
 shield:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5.5 5.7v5.5c0 4 2.6 7.5 6.5 9.3 3.9-1.8 6.5-5.3 6.5-9.3V5.7L12 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
 settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M19 13.6v-3.2l-2-.7a7.6 7.6 0 0 0-.7-1.6l.9-1.9-2.3-2.3-1.9.9a7.6 7.6 0 0 0-1.6-.7L10.7 2H7.5l-.7 2.1a7.6 7.6 0 0 0-1.6.7l-1.9-.9L1 6.2l.9 1.9a7.6 7.6 0 0 0-.7 1.6l-2 .7v3.2l2 .7c.2.6.4 1.1.7 1.6L1 17.8l2.3 2.3 1.9-.9c.5.3 1 .5 1.6.7l.7 2.1h3.2l.7-2.1c.6-.2 1.1-.4 1.6-.7l1.9.9 2.3-2.3-.9-1.9c.3-.5.5-1 .7-1.6l2-.7Z" transform="translate(2 0) scale(.84)" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
 external:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 chevron:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 close:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};

class StudioProvider{
 constructor(extensionUri,context,actions){this.extensionUri=extensionUri;this.context=context;this.actions=actions;this.views=new Set()}
 resolveWebviewView(view){this.configure(view.webview);view.webview.html=this.html(view.webview,false);this.views.add(view.webview);view.onDidDispose(()=>this.views.delete(view.webview));this.bind(view.webview);doctor(this.context).then(s=>this.publish(s))}
 configure(w){w.options={enableScripts:true,localResourceRoots:[vscode.Uri.joinPath(this.extensionUri,'media')]}}
 bind(w){w.onDidReceiveMessage(async m=>{try{
   if(m.type==='doctor'){
     const s=await doctor(this.context);
     this.publish(s);
     w.postMessage({type:'actionResult',result:{ok:true,code:'verified',message:'Verification complete',detail:s.runtime.agy?'Antigravity CLI is connected.':'Bundled skills are loaded, but Antigravity CLI is not detected yet.'}});
   }else if(m.type==='initialize'){
     await this.actions.initialize(Array.isArray(m.modules)?m.modules:[]);
     w.postMessage({type:'actionResult',result:{ok:true,code:'initialized',message:'Initialization finished',detail:'GraviStudio re-ran skill and engine verification.'}});
   }else if(m.type==='installModule'){
     await installModule(this.context,m.module);
     this.publish(await doctor(this.context));
     w.postMessage({type:'actionResult',result:{ok:true,code:'module-installed',message:'Engine installed',detail:'The module is ready for GraviStudio routing.'}});
   }else if(m.type==='createJob'){
     const result=await startJob(m.category);
     if(result&&result.code!=='cancelled')w.postMessage({type:'actionResult',result});
   }else if(m.type==='openStudio'){
     this.open();
   }else if(m.type==='settings'){
     await vscode.commands.executeCommand('workbench.action.openSettings','@ext:cassielxyz.gravistudio');
     w.postMessage({type:'actionResult',result:{ok:true,code:'settings-opened',message:'GraviStudio settings opened',detail:'Configure Free Mode and local paths from Settings.'}});
   }else if(m.type==='logs'){
     this.actions.logs();
   }
 }catch(e){this.actions.error(e);w.postMessage({type:'actionResult',result:{ok:false,code:'error',message:'Action failed',detail:e&&e.message?e.message:String(e)}})}})}
 publish(s){lastState=s;for(const w of this.views)w.postMessage({type:'state',state:s});if(activePanel)activePanel.webview.postMessage({type:'state',state:s})}
 open(){if(activePanel){activePanel.reveal(vscode.ViewColumn.One);if(lastState)activePanel.webview.postMessage({type:'state',state:lastState});return}activePanel=vscode.window.createWebviewPanel('gravistudio.studio','GraviStudio — AI Video Studio',vscode.ViewColumn.One,{enableScripts:true,retainContextWhenHidden:true,localResourceRoots:[vscode.Uri.joinPath(this.extensionUri,'media')]});activePanel.iconPath=vscode.Uri.joinPath(this.extensionUri,'media','icon.png');activePanel.webview.html=this.html(activePanel.webview,true);this.bind(activePanel.webview);activePanel.onDidDispose(()=>activePanel=undefined);if(lastState)activePanel.webview.postMessage({type:'state',state:lastState});else doctor(this.context).then(s=>this.publish(s))}
 html(w,full){
  const nonce=crypto.randomBytes(16).toString('hex');
  const css=w.asWebviewUri(vscode.Uri.joinPath(this.extensionUri,'media','dashboard.css'));
  const js=w.asWebviewUri(vscode.Uri.joinPath(this.extensionUri,'media','dashboard.js'));
  const wordmark=w.asWebviewUri(vscode.Uri.joinPath(this.extensionUri,'media','wordmark.png'));
  return `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${w.cspSource} data:; style-src ${w.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';"><link href="${css}" rel="stylesheet"><title>GraviStudio</title></head><body class="${full?'full':'sidebar'}"><main>
  <section class="hero" aria-labelledby="studio-title">
    <div class="hero-label"><span class="hero-spark">✦</span><span>ANTIGRAVITY VIDEO STUDIO</span></div>
    <img class="wordmark" src="${wordmark}" alt="GraviStudio" id="studio-title">
    <p class="hero-copy">One dashboard. The right video skill for every job.</p>
    <button id="initialize" class="primary action-main"><span class="button-icon">${ICONS.play}</span><span>Initialize Studio</span><span class="button-tail">${ICONS.chevron}</span></button>
    <div class="hero-secondary">
      <button id="doctor" class="secondary-action"><span class="button-icon">${ICONS.shield}</span><span>Verify</span></button>
      <button id="settings" class="secondary-action"><span class="button-icon">${ICONS.settings}</span><span>Settings</span></button>
    </div>
  </section>

  <button class="status-strip" id="statusStrip" type="button" aria-live="polite"><span class="dot wait"></span><span class="status-copy"><b>Checking setup</b><small>Inspecting skills and local runtimes…</small></span><span class="status-chevron">${ICONS.chevron}</span></button>
  <section id="actionNotice" class="action-notice hidden" aria-live="polite"></section>

  <section class="workspace-section">
    <div class="section-head workspace-head"><div><span class="kicker">CREATE</span><h2>Video workspaces</h2><p>Purpose-built routes for each kind of video.</p></div><button id="openStudio" class="small ${full?'hidden':''}"><span>${ICONS.external}</span>Open full studio</button></div>
    <div id="categories" class="grid"></div>
  </section>

  <section class="system-section">
    <div class="section-head"><div><span class="kicker">SYSTEM</span><h2>Skills & engines</h2><p>Local readiness, bundled skills and optional engines.</p></div><button id="logs" class="small">Logs</button></div>
    <div id="runtime" class="runtime"></div><div id="modules" class="modules"></div>
  </section>
 </main>

 <div id="modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="init-title"><div class="modal-card">
   <div class="modal-top"><div><span class="kicker">FIRST RUN</span><h2 id="init-title">Initialize GraviStudio</h2></div><button id="closeModal" class="close" aria-label="Close">${ICONS.close}</button></div>
   <p class="modal-lead">Bundled skills install from this VSIX. Choose only the optional engines you want on this machine.</p>
   <div class="module-select">
    <label><input type="checkbox" value="brag" checked><span class="check-ui"></span><span><b>Brag</b><small>Product and app launch videos</small></span></label>
    <label><input type="checkbox" value="hyperframes" checked><span class="check-ui"></span><span><b>HyperFrames</b><small>Motion graphics and compositions</small></span></label>
    <label><input type="checkbox" value="autoclip"><span class="check-ui"></span><span><b>AutoClip</b><small>Long video → shorts</small></span></label>
    <label><input type="checkbox" value="supoclip"><span class="check-ui"></span><span><b>SupoClip</b><small>Self-hosted clipping</small></span></label>
    <label><input type="checkbox" value="openmontage"><span class="check-ui"></span><span><b>OpenMontage</b><small>Long-form agentic production</small></span></label>
    <label><input type="checkbox" value="personalive"><span class="check-ui"></span><span><b>PersonaLive</b><small>Experimental · GPU required</small></span></label>
   </div>
   <div class="note"><span>Free Mode</span><b>ON by default</b><small>Paid providers are never enabled automatically.</small></div>
   <button id="runInitialize" class="primary wide">Install & verify</button>
 </div></div>
 <script nonce="${nonce}" src="${js}"></script></body></html>`;
 }
}
module.exports={StudioProvider};
