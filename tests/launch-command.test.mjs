import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const {buildLaunchCommand}=require('../extension/src/launch-command.js');

test('Windows launcher uses an encoded PowerShell command instead of quoted executable syntax',()=>{
  const prompt="Line one\nUser's path: C:\\Users\\Example User\\project\nUnicode → storyboard → render";
  const cmd=buildLaunchCommand('C:\\Program Files\\Antigravity\\agy.exe',prompt,'win32');
  assert.match(cmd,/^powershell\.exe .* -EncodedCommand /);
  assert.doesNotMatch(cmd,/^"agy" -p/);
  const encoded=cmd.split(' -EncodedCommand ')[1];
  const decoded=Buffer.from(encoded,'base64').toString('utf16le');
  assert.match(decoded,/^& 'C:\\Program Files\\Antigravity\\agy\.exe' -p /);
  assert.match(decoded,/User''s path/);
  assert.match(decoded,/--output-format stream-json$/);
});

test('POSIX launcher safely single-quotes executable and prompt',()=>{
  const cmd=buildLaunchCommand('/opt/agy',"it's ready",'linux');
  assert.equal(cmd,"'/opt/agy' -p 'it'\\''s ready' --output-format stream-json");
});
