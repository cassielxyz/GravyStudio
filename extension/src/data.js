'use strict';
const CATEGORIES = [
  { id:'product', title:'Product Video', icon:'rocket', accent:'pink', route:['product-video','Brag/HyperFrames'], hint:'Repo, website, screenshots or brand assets' },
  { id:'motion', title:'Motion Graphics', icon:'sparkles', accent:'amber', route:['motion-graphics','HyperFrames'], hint:'Kinetic type, UI motion, charts and logo animation' },
  { id:'website', title:'Website → Video', icon:'globe', accent:'blue', route:['website-video','HyperFrames'], hint:'Turn a real site/app experience into a polished promo' },
  { id:'shorts', title:'Auto Shorts', icon:'clapper', accent:'violet', route:['auto-clips','AutoClip/SupoClip'], hint:'Long video to vertical clips with captions' },
  { id:'director', title:'AI Director', icon:'wand', accent:'green', route:['multi-agent','OpenMontage'], hint:'Plan, script and generate complete video productions' },
  { id:'avatar', title:'Live Avatar', icon:'user', accent:'pink', route:['ai-avatar','PersonaLive'], hint:'Experimental local portrait animation' },
  { id:'editor', title:'Video Editor', icon:'scissors', accent:'cyan', route:['editor','FFmpeg'], hint:'Merge, crop, resize, audio, captions and delivery' },
  { id:'reel', title:'Reel Maker', icon:'bars', accent:'violet', route:['asset-agent','HyperFrames/FFmpeg'], hint:'Build reels from uploads or autonomously sourced assets' }
];
const EXTERNAL = {
  brag:{ label:'Brag', repo:'https://github.com/latent-spaces/brag.git' },
  hyperframes:{ label:'HyperFrames', repo:'https://github.com/heygen-com/hyperframes.git' },
  autoclip:{ label:'AutoClip', repo:'https://github.com/artbyjazi/autoclip.git' },
  supoclip:{ label:'SupoClip', repo:'https://github.com/FujiwaraChoki/supoclip.git' },
  openmontage:{ label:'OpenMontage', repo:'https://github.com/n0-space/openmontage.git' },
  personalive:{ label:'PersonaLive', repo:'https://github.com/gskfilmmaker/personalive.git', experimental:true }
};
module.exports={ CATEGORIES, EXTERNAL };
