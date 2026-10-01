export const modules = [
  { id:'antigravity', name:'Antigravity CLI', kind:'runtime', group:'core', freeMode:true, description:'Uses the signed-in Antigravity account as the agent runtime.', command:'agy', doctorArgs:['--version'] },
  { id:'ffmpeg', name:'FFmpeg', kind:'runtime', group:'core', freeMode:true, description:'Final render, audio, subtitles and media validation.', command:'ffmpeg', doctorArgs:['-version'] },
  { id:'brag', name:'/brag', kind:'skill', group:'core', freeMode:true, description:'Product and software launch videos.', repo:'https://github.com/latent-spaces/brag.git', skillFolder:'brag' },
  { id:'hyperframes', name:'HyperFrames', kind:'skill', group:'core', freeMode:true, description:'Motion graphics, website videos and programmatic video rendering.', repo:'https://github.com/heygen-com/hyperframes.git', skillFolder:'hyperframes' },
  { id:'autoclip', name:'AutoClip', kind:'engine', group:'shorts', freeMode:true, license:'MIT', gpu:'optional', description:'Long video to ranked, captioned, speaker-tracked shorts.', repo:'https://github.com/artbyjazi/autoclip.git', command:'autoclip', doctorArgs:['doctor'] },
  { id:'supoclip', name:'SupoClip', kind:'engine', group:'shorts', freeMode:true, license:'AGPL-3.0', gpu:'optional', description:'Alternative self-hosted short-form clipping pipeline.', repo:'https://github.com/FujiwaraChoki/supoclip.git' },
  { id:'openmontage', name:'OpenMontage', kind:'engine', group:'longform', freeMode:true, license:'AGPL-3.0', gpu:'optional', description:'Agentic long-form, explainer and documentary production.', repo:'https://github.com/n0-space/openmontage.git' },
  { id:'personalive', name:'PersonaLive', kind:'engine', group:'avatar', freeMode:true, license:'Research-oriented', gpu:'required', experimental:true, description:'Experimental real-time portrait animation.', repo:'https://github.com/gskfilmmaker/personalive.git' },
  { id:'openverse', name:'Openverse Assets', kind:'asset', group:'assets', freeMode:true, description:'Openly licensed/public-domain visual discovery with provenance.' },
  { id:'iconify', name:'Iconify Assets', kind:'asset', group:'assets', freeMode:true, description:'Open-source vector/icon discovery for motion graphics.' }
];
