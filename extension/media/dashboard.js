(() => {
  const vscode = acquireVsCodeApi();
  const $ = (id) => document.getElementById(id);
  let state;
  const moduleMeta = {
    brag: ['Brag', 'Product launch skill'], hyperframes: ['HyperFrames', 'Motion / composition engine'], autoclip: ['AutoClip', 'Long video → shorts'],
    supoclip: ['SupoClip', 'Self-hosted clipper'], openmontage: ['OpenMontage', 'Long-form production'], personalive: ['PersonaLive', 'Experimental avatar engine']
  };

  $('initialize').onclick = () => $('modal').classList.remove('hidden');
  $('closeModal').onclick = () => $('modal').classList.add('hidden');
  $('runInitialize').onclick = () => {
    const modules = [...document.querySelectorAll('.module-select input:checked')].map(x => x.value);
    $('modal').classList.add('hidden');
    vscode.postMessage({ type: 'initialize', modules });
  };
  $('doctor').onclick = () => vscode.postMessage({ type: 'doctor' });
  $('settings').onclick = () => vscode.postMessage({ type: 'settings' });
  $('logs').onclick = () => vscode.postMessage({ type: 'logs' });
  if ($('openStudio')) $('openStudio').onclick = () => vscode.postMessage({ type: 'openStudio' });

  window.addEventListener('message', (event) => {
    if (event.data.type !== 'state') return;
    state = event.data.state;
    render();
  });

  function pill(ok, yes = 'Ready', no = 'Missing') {
    return `<span class="pill ${ok ? 'ok' : 'bad'}"><span></span>${ok ? yes : no}</span>`;
  }

  function render() {
    const skillValues = Object.values(state.skills || {});
    const installedSkills = skillValues.filter(Boolean).length;
    const totalSkills = skillValues.length;
    const coreReady = state.runtime.agy && installedSkills === totalSkills;
    $('statusStrip').innerHTML = `<span class="dot ${coreReady ? 'ok' : 'warn'}"></span><span>${coreReady ? 'Studio ready' : 'Setup incomplete'} · ${installedSkills}/${totalSkills} bundled skills · Free Mode ${state.freeMode ? 'ON' : 'OFF'}</span>`;

    $('categories').innerHTML = (state.categories || []).map(c => `
      <button class="card" data-category="${c.id}">
        <div class="card-icon">${c.icon}</div><h3>${c.title}</h3><p>${c.hint}</p><small>${c.route}</small><span class="arrow">↗</span>
      </button>`).join('');
    document.querySelectorAll('[data-category]').forEach(el => el.onclick = () => vscode.postMessage({ type: 'createJob', category: el.dataset.category }));

    const rt = state.runtime;
    $('runtime').innerHTML = `
      <div><b>Antigravity CLI</b>${pill(rt.agy, 'Connected', 'Needs setup')}</div>
      <div><b>FFmpeg</b>${pill(rt.ffmpeg)}</div>
      <div><b>ffprobe</b>${pill(rt.ffprobe)}</div>
      <div><b>Git</b>${pill(rt.git)}</div>
      <div><b>Bundled skills</b>${pill(installedSkills === totalSkills, `${installedSkills}/${totalSkills} loaded`, `${installedSkills}/${totalSkills} loaded`)}</div>`;

    $('modules').innerHTML = Object.entries(moduleMeta).map(([id, meta]) => {
      const ready = state.modules && state.modules[id];
      return `<div class="module"><div><b>${meta[0]}</b><small>${meta[1]}</small></div>${ready ? pill(true, 'Installed') : `<button data-install="${id}" class="tiny">Install</button>`}</div>`;
    }).join('');
    document.querySelectorAll('[data-install]').forEach(el => el.onclick = () => vscode.postMessage({ type: 'installModule', module: el.dataset.install }));
  }

  vscode.postMessage({ type: 'doctor' });
})();
