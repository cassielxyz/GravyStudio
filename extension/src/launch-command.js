'use strict';

function psQuote(value){
  return `'${String(value).replace(/'/g,"''")}'`;
}

function posixQuote(value){
  return `'${String(value).replace(/'/g,`'\\''`)}'`;
}

function buildLaunchCommand(agy,prompt,platform=process.platform){
  if(platform==='win32'){
    const script=`& ${psQuote(agy)} -p ${psQuote(prompt)} --output-format stream-json`;
    const encoded=Buffer.from(script,'utf16le').toString('base64');
    return `powershell.exe -NoLogo -NoProfile -NonInteractive -EncodedCommand ${encoded}`;
  }
  return `${posixQuote(agy)} -p ${posixQuote(prompt)} --output-format stream-json`;
}

module.exports={buildLaunchCommand,psQuote,posixQuote};
