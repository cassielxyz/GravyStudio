(() => {
  const vscode = acquireVsCodeApi();
  const $ = (id) => document.getElementById(id);
  let state;
  let activeCard;
  const moduleMeta = {
    brag: ['Brag', 'Product launch skill'], hyperframes: ['HyperFrames', 'Motion / composition engine'], autoclip: ['AutoClip', 'Long video → shorts'],
    supoclip: ['SupoClip', 'Self-hosted clipper'], openmontage: ['OpenMontage', 'Long-form production'], personalive: ['PersonaLive', 'Experimental avatar engine']
  };
  const icons = {
    rocket:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5c2.1-2.1 4.7-2 4.7-2s.1 2.6-2 4.7l-4.8 4.8-3.8-3.8 5.9-3.7Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m8.6 9.2-3.8 1.1-1.5 3 5.1-.3m4.4-.4-.3 5.1 3-1.5 1.1-3.8M7 17l-2.5 2.5M8.7 18.7 7 20.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    sparkles:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Zm6 9 .8 2.2L21 15l-2.2.8L18 18l-.8-2.2L15 15l2.2-.8L18 12ZM5 13l1 2.8L9 17l-3 1-1 3-1-3-3-1 3-1.2L5 13Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    globe:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5C9.8 18.2 8.7 15.4 8.7 12S9.8 5.8 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    clapper:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16v10H4V9Zm0 0 2-4h14l-2 4M8 5 6 9m7-4-2 4m7-4-2 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m10 12.5 4 2.5-4 2.5v-5Z" fill="currentColor" stroke="none"/></svg>',
    wand:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 11-11 2 2L6 22 4 20Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M15 3v3M13.5 4.5h3M20 7v2M19 8h2M8 5v2M7 6h2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    user:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M5.5 20c.4-4.2 2.5-6.3 6.5-6.3s6.1 2.1 6.5 6.3h-13Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    scissors:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="7" r="2.3" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="6" cy="17" r="2.3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m8 8.3 11 8.2M8 15.7l4-3m2-1.5 5-3.7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    bars:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V12h3v7H5Zm5.5 0V8h3v11h-3ZM16 19V4h3v15h-3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    chevron:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };

  $('initialize').onclick = () => $('modal').classList.remove('hidden');
  $('closeModal').onclick = () => $('modal').classList.add('hidden');
  $('modal').onclick = (event) => { if (event.target === $('modal')) $('modal').classList.add('hidden'); };
  $('runInitialize').onclick = () => {
    const modules = [...document.querySelectorAll('.module-select input:checked')].map(x => x.value);
    $('modal').classList.add('hidden');
    showNotice({ok:true,code:'working',message:'Initializing GraviStudio',detail:'Installing and verifying the selected skills and engines…'});
    vscode.postMessage({ type: 'initialize', modules });
  };
  $('doctor').onclick = () => {
    setBusy($('doctor'), true, 'Checking…');
    vscode.postMessage({ type: 'doctor' });
  };
  $('settings').onclick = () => vscode.postMessage({ type: 'settings' });
  $('logs').onclick = () => vscode.postMessage({ type: 'logs' });
  $('statusStrip').onclick = () => {
    setBusy($('doctor'), true, 'Checking…');
    vscode.postMessage({ type: 'doctor' });
  };
  if ($('openStudio')) $('openStudio').onclick = () => vscode.postMessage({ type: 'openStudio' });

  window.addEventListener('keydown', e => { if (e.key === 'Escape') $('modal').classList.add('hidden'); });
  window.addEventListener('message', (event) => {
    if (event.data.type === 'state') {
      state = event.data.state;
      render();
      setBusy($('doctor'), false);
      return;
    }
    if (event.data.type === 'actionResult') {
      clearActiveCard();
      showNotice(event.data.result || {});
    }
  });

  function pill(ok, yes = 'Ready', no = 'Missing') {
    return `<span class="pill ${ok ? 'ok' : 'bad'}"><span></span>${ok ? yes : no}</span>`;
  }

  function tags(route) {
    const values = Array.isArray(route) ? route : String(route || '').split('+').map(x => x.trim()).filter(Boolean);
    return `<div class="route">${values.map(x => `<span>${x}</span>`).join('')}</div>`;
  }

  function setBusy(el, busy, label) {
    if (!el) return;
    if (busy) {
      if (!el.dataset.label) el.dataset.label = el.textContent.trim();
      el.classList.add('is-busy');
      el.disabled = true;
      const text = el.querySelector('span:last-child');
      if (text && label) text.textContent = label;
    } else {
      el.classList.remove('is-busy');
      el.disabled = false;
      if (el.dataset.label) {
        const text = el.querySelector('span:last-child');
        if (text) text.textContent = el.dataset.label;
        delete el.dataset.label;
      }
    }
  }

  function showNotice(result) {
    if (!result || result.code === 'cancelled') return;
    const notice = $('actionNotice');
    const tone = result.ok ? 'success' : (result.code === 'agy-missing' ? 'warning' : 'error');
    const action = result.action === 'doctor'
      ? '<button type="button" data-notice-action="doctor">Verify setup</button>'
      : '';
    notice.className = `action-notice ${tone}`;
    notice.innerHTML = `
      <span class="notice-indicator"></span>
      <span class="notice-copy"><b>${escapeHtml(result.message || 'GraviStudio')}</b><small>${escapeHtml(result.detail || '')}</small></span>
      <span class="notice-actions">${action}<button type="button" class="notice-close" aria-label="Dismiss">${icons.close}</button></span>`;
    notice.querySelector('.notice-close').onclick = () => notice.classList.add('hidden');
    const doctorAction = notice.querySelector('[data-notice-action="doctor"]');
    if (doctorAction) doctorAction.onclick = () => vscode.postMessage({ type: 'doctor' });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function clearActiveCard() {
    if (!activeCard) return;
    activeCard.classList.remove('is-busy');
    activeCard.disabled = false;
    activeCard = null;
  }

  function render() {
    const skillValues = Object.values(state.skills || {});
    const installedSkills = skillValues.filter(Boolean).length;
    const totalSkills = skillValues.length;
    const coreReady = !!state.runtime.agy && installedSkills === totalSkills;
    $('statusStrip').innerHTML = `<span class="dot ${coreReady ? 'ok' : 'warn'}"></span><span class="status-copy"><b>${coreReady ? 'Studio ready' : 'Setup incomplete'}</b><small>${installedSkills}/${totalSkills} bundled skills · Free Mode ${state.freeMode ? 'ON' : 'OFF'}${state.runtime.agy ? '' : ' · CLI not detected'}</small></span><span class="status-chevron">${icons.chevron}</span>`;

    $('categories').innerHTML = (state.categories || []).map(c => `
      <button class="card" data-category="${c.id}" data-accent="${c.accent || 'violet'}">
        <div class="card-icon">${icons[c.icon] || icons.sparkles}</div>
        <h3>${c.title}</h3>
        <p>${c.hint}</p>
        ${tags(c.route)}
        <span class="arrow">${icons.chevron}</span>
      </button>`).join('');

    document.querySelectorAll('[data-category]').forEach(el => el.onclick = () => {
      clearActiveCard();
      activeCard = el;
      el.classList.add('is-busy');
      el.disabled = true;
      showNotice({ok:true,code:'working',message:`Opening ${el.querySelector('h3').textContent}`,detail:'Add your brief in the Antigravity input box. GraviStudio will save a checkpoint before launch.'});
      vscode.postMessage({ type: 'createJob', category: el.dataset.category });
    });

    const rt = state.runtime;
    $('runtime').innerHTML = `
      <div><b>Antigravity CLI</b>${pill(rt.agy, 'Connected', 'Not detected')}</div>
      <div><b>FFmpeg</b>${pill(rt.ffmpeg)}</div>
      <div><b>ffprobe</b>${pill(rt.ffprobe)}</div>
      <div><b>Git</b>${pill(rt.git)}</div>
      <div><b>Skills</b>${pill(installedSkills === totalSkills, `${installedSkills}/${totalSkills}`, `${installedSkills}/${totalSkills}`)}</div>`;

    $('modules').innerHTML = Object.entries(moduleMeta).map(([id, meta]) => {
      const ready = state.modules && state.modules[id];
      return `<div class="module"><div><b>${meta[0]}</b><small>${meta[1]}</small></div>${ready ? pill(true, 'Installed') : `<button data-install="${id}" class="tiny">Install</button>`}</div>`;
    }).join('');

    document.querySelectorAll('[data-install]').forEach(el => el.onclick = () => {
      el.disabled = true;
      el.textContent = 'Installing…';
      vscode.postMessage({ type: 'installModule', module: el.dataset.install });
    });
  }

  vscode.postMessage({ type: 'doctor' });
})();
