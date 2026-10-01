import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { URL } from 'node:url';
import { runDoctor } from '../core/doctor.mjs';
import { initialize } from '../core/installer.mjs';
import { categories } from '../core/categories.mjs';
import { createJob,getJob,listJobs,resumeJob,subscribeJob } from '../core/jobs.mjs';
import { DATA_DIR,ROOT_DIR } from '../core/paths.mjs';

const port=Number(process.env.PORT||47831);
const webDir=path.join(ROOT_DIR,'web');
const uploadDir=path.join(DATA_DIR,'uploads');
await fsp.mkdir(uploadDir,{recursive:true});
const allowedCategories=new Set(categories.map(x=>x.id));
const allowedGroups=new Set(['core','shorts','longform','avatar','assets']);

function baseHeaders(){return {'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cross-Origin-Resource-Policy':'same-origin'};}
function json(res,status,data){const body=JSON.stringify(data);res.writeHead(status,{...baseHeaders(),'Content-Type':'application/json; charset=utf-8','Content-Length':Buffer.byteLength(body),'Cache-Control':'no-store'});res.end(body);}
function text(res,status,body,type='text/plain; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Content-Length':Buffer.byteLength(body)});res.end(body);}
async function readJson(req,max=2*1024*1024){let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>max)throw new Error('Request body too large');chunks.push(c);}return chunks.length?JSON.parse(Buffer.concat(chunks).toString('utf8')):{};}
function safeName(name){return String(name||'asset').replace(/[^a-zA-Z0-9._ -]/g,'_').slice(0,160)||'asset';}
function contentType(file){const ext=path.extname(file).toLowerCase();return ({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'})[ext]||'application/octet-stream';}
async function serveStatic(pathname,res){let rel=pathname==='/'?'index.html':pathname.replace(/^\/+/, '');if(rel.includes('..'))return false;const file=path.join(webDir,rel);try{const st=await fsp.stat(file);if(!st.isFile())return false;res.writeHead(200,{...baseHeaders(),'Content-Type':contentType(file),'Content-Length':st.size,'Cache-Control':rel==='index.html'?'no-cache':'public, max-age=3600',...(rel==='index.html'?{'Content-Security-Policy':"default-src 'self'; connect-src 'self'; img-src 'self' data: https:; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'"}:{})});fs.createReadStream(file).pipe(res);return true;}catch{return false;}}

const server=http.createServer(async(req,res)=>{
  const u=new URL(req.url||'/',`http://${req.headers.host||'127.0.0.1'}`);const p=u.pathname;
  try{
    if(req.method==='GET'&&p==='/api/health')return json(res,200,{ok:true,service:'gravistudio'});
    if(req.method==='GET'&&p==='/api/status')return json(res,200,await runDoctor());
    if(req.method==='GET'&&p==='/api/categories')return json(res,200,categories);
    if(req.method==='POST'&&p==='/api/initialize'){
      const body=await readJson(req);const groups=Array.isArray(body.groups)?body.groups.filter(x=>allowedGroups.has(x)):['core','assets'];if(!groups.includes('core'))groups.unshift('core');
      res.writeHead(200,{'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-cache','Transfer-Encoding':'chunked'});const emit=(event)=>res.write(`${JSON.stringify(event)}\n`);
      try{const doctor=await initialize(groups,emit);emit({step:'complete',state:doctor.ready?'ok':'warning',doctor});}catch(e){emit({step:'fatal',state:'error',message:e.message||String(e)});}return res.end();
    }
    if(req.method==='POST'&&p==='/api/upload'){
      const original=safeName(u.searchParams.get('name'));const type=String(u.searchParams.get('type')||'application/octet-stream');const ext=path.extname(original).toLowerCase();const allowedType=/^(image|video|audio)\//.test(type)||['application/pdf','application/json','text/plain'].includes(type)||['.svg','.md','.txt','.json','.pdf'].includes(ext);if(!allowedType)return json(res,415,{error:'Unsupported upload type'});const max=2*1024*1024*1024;let size=0;const id=`${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;const target=path.join(uploadDir,`${id}-${original}`);const out=fs.createWriteStream(target,{flags:'wx'});
      try{for await(const chunk of req){size+=chunk.length;if(size>max)throw new Error('File exceeds 2 GB limit');if(!out.write(chunk))await new Promise(r=>out.once('drain',r));}await new Promise((resolve,reject)=>out.end(err=>err?reject(err):resolve()));return json(res,200,{name:original,path:target,size,type});}catch(e){out.destroy();await fsp.rm(target,{force:true});throw e;}
    }
    if(req.method==='GET'&&p==='/api/jobs')return json(res,200,await listJobs());
    const jobMatch=p.match(/^\/api\/jobs\/([a-f0-9]+)$/);
    if(req.method==='GET'&&jobMatch){const job=await getJob(jobMatch[1]);return job?json(res,200,job):json(res,404,{error:'Not found'});}
    if(req.method==='POST'&&p==='/api/jobs'){
      const body=await readJson(req);if(!allowedCategories.has(body.category))return json(res,400,{error:'Invalid category'});if(typeof body.prompt!=='string'||body.prompt.trim().length<3||body.prompt.length>20000)return json(res,400,{error:'Prompt must be between 3 and 20000 characters'});const assets=Array.isArray(body.assets)?body.assets.filter(x=>typeof x==='string').slice(0,30):[];return json(res,202,await createJob({title:typeof body.title==='string'?body.title.slice(0,120):undefined,category:body.category,prompt:body.prompt,assets,options:body.options&&typeof body.options==='object'?body.options:{freeMode:true}}));
    }
    const resumeMatch=p.match(/^\/api\/jobs\/([a-f0-9]+)\/resume$/);
    if(req.method==='POST'&&resumeMatch){try{return json(res,202,await resumeJob(resumeMatch[1]));}catch(e){return json(res,404,{error:e.message||String(e)});}}
    const eventsMatch=p.match(/^\/api\/jobs\/([a-f0-9]+)\/events$/);
    if(req.method==='GET'&&eventsMatch){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});const send=(line)=>res.write(`data: ${String(line).replace(/\n/g,'\\n')}\n\n`);const unsub=subscribeJob(eventsMatch[1],send);const timer=setInterval(()=>res.write(': ping\n\n'),15000);req.on('close',()=>{clearInterval(timer);unsub();});return;}
    if(req.method==='GET'&&p==='/api/assets/openverse'){
      const q=(u.searchParams.get('q')||'').trim();if(!q)return json(res,400,{error:'q is required'});const api=new URL('https://api.openverse.org/v1/images/');api.searchParams.set('q',q);api.searchParams.set('page_size','12');const r=await fetch(api,{headers:{'User-Agent':'GraviStudio/0.1'}});if(!r.ok)throw new Error(`Openverse ${r.status}`);const data=await r.json();return json(res,200,(data.results||[]).map(x=>({id:x.id,title:x.title,thumbnail:x.thumbnail,url:x.url,creator:x.creator,source:x.source,license:x.license,licenseUrl:x.license_url,width:x.width,height:x.height})));
    }
    if(req.method==='GET'&&p==='/api/assets/icons'){
      const q=(u.searchParams.get('q')||'').trim();if(!q)return json(res,400,{error:'q is required'});const r=await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(q)}&limit=32`);if(!r.ok)throw new Error(`Iconify ${r.status}`);return json(res,200,await r.json());
    }
    if(req.method==='GET'&&await serveStatic(p,res))return;
    if(req.method==='GET')return serveStatic('/',res);
    return json(res,404,{error:'Not found'});
  }catch(e){console.error(e);if(!res.headersSent)return json(res,500,{error:e.message||'Internal server error'});try{res.end();}catch{}}
});
server.listen(port,'127.0.0.1',()=>console.log(`GraviStudio running at http://127.0.0.1:${port}`));
