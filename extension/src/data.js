'use strict';
const CATEGORIES = [
  { id:'product', title:'Product Video', icon:'🚀', route:'product-video + Brag/HyperFrames', hint:'Repo, website, screenshots or brand assets' },
  { id:'motion', title:'Motion Graphics', icon:'✨', route:'motion-graphics + HyperFrames', hint:'Kinetic type, UI motion, charts and logo animation' },
  { id:'website', title:'Website → Video', icon:'🌐', route:'HyperFrames', hint:'Turn a real site/app experience into a polished promo' },
  { id:'shorts', title:'Auto Shorts', icon:'✂', route:'auto-clips + AutoClip/SupoClip', hint:'Long video to vertical clips with captions' },
  { id:'director', title:'AI Director', icon:'🎬', route:'OpenMontage', hint:'Explainers, documentary-style and multi-stage productions' },
  { id:'avatar', title:'Live Avatar', icon:'◉', route:'PersonaLive', hint:'Experimental local portrait animation' },
  { id:'editor', title:'Video Editor', icon:'▤', route:'FFmpeg', hint:'Merge, crop, resize, audio, captions and delivery' },
  { id:'reel', title:'Reel Maker', icon:'▰', route:'asset-agent + HyperFrames/FFmpeg', hint:'Build a reel from uploads or autonomously sourced assets' }
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
