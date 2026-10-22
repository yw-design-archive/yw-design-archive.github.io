(() => {
 const AudioEngine = window.AudioContext || window.webkitAudioContext;
 if (!AudioEngine) return;
 const root = document.documentElement;
 const titles = '#hero-title,#aboutme-title,#directory-title,.familiar-line';
 const clickButtons = '.nav nav a,.directory-entry,#project-grid .project-sheet,#folder-project-list button,#directory-back,#folder-category-tabs button,#next-project';
 const file = 'assets/sfx/user-block-bounce.mp3';
 const raw = fetch(file).then(response => {
  if (!response.ok) throw Error('Audio unavailable');
  return response.arrayBuffer();
 }).catch(() => null);
 let context, buffer, decoding, voice, activeTitle, lastPoint, stopTimer;
 let unlocked = false, muted = false, lastMotion = -Infinity;
 const clips = Object.fromEntries(['interface-reveal'].map(name => [name, {
  file: `assets/sfx/${name}.wav`,
  raw: fetch(`assets/sfx/${name}.wav`).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null)
 }]));
 const effects = new Set();
 let aboutVoice = null, aboutRequest = 0;
 function stopEffect(effect) {
  if (!effect) return;
  effect.gain.gain.setTargetAtTime(0, context.currentTime, .005);
  try { effect.source.stop(context.currentTime + .025); } catch {}
 }
 function stopAll() { stop(); effects.forEach(stopEffect); }
 function playEffect(name) {
  const clip = clips[name];
  if (muted || !unlocked || !clip.buffer || context?.state !== 'running' || document.hidden || root.classList.contains('booting')) return;
  const source = context.createBufferSource(), gain = context.createGain();
  source.buffer = clip.buffer; gain.gain.value = .45;
  source.connect(gain); gain.connect(context.destination);
  const effect = { source, gain }; effects.add(effect);
  source.onended = () => { effects.delete(effect); source.disconnect(); gain.disconnect(); };
  source.start();
  window.dispatchEvent(new CustomEvent('portfolio:sound-played', { detail: { name, file: clip.file, playbackRate: source.playbackRate.value } }));
  return effect;
 }
 try { muted = localStorage.getItem('portfolio-motion-muted') === '1'; } catch {}
 function stop() {
  clearTimeout(stopTimer);
  activeTitle = null; lastPoint = null;
  if (!voice) return;
  const previous = voice; voice = null;
  previous.gain.gain.setTargetAtTime(0, context.currentTime, .012);
  try { previous.source.stop(context.currentTime + .05); } catch {}
  window.dispatchEvent(new CustomEvent('portfolio:sound-stopped', { detail: { name: 'block-bounce' } }));
 }
 function start() {
  if (voice || !activeTitle || muted || !unlocked || !buffer || document.hidden ||
      context?.state !== 'running' || root.classList.contains('booting') ||
      performance.now() - lastMotion > 180) return;
  const source = context.createBufferSource(), gain = context.createGain();
  source.buffer = buffer;
  source.loop = true;
  source.loopStart = .1;
  source.playbackRate.value = 1;
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.setTargetAtTime(.3, context.currentTime, .008);
  source.connect(gain); gain.connect(context.destination);
  voice = { source, gain };
  source.onended = () => { source.disconnect(); gain.disconnect(); };
  source.start(0, .1);
  window.dispatchEvent(new CustomEvent('portfolio:sound-played', { detail: { name: 'block-bounce', file, title: activeTitle.id } }));
 }
 async function unlock(allowBoot = false) {
  if (muted || (root.classList.contains('booting') && allowBoot !== true)) return;
  try {
   if (!context) context = new AudioEngine();
   await context.resume();
   unlocked = context.state === 'running';
   if (!decoding) decoding = Promise.all([raw.then(async data => {
    if (data) try { buffer = await context.decodeAudioData(data); } catch {}
   }), ...Object.values(clips).map(async clip => {
    const data = await clip.raw;
    if (data) try { clip.buffer = await context.decodeAudioData(data); } catch {}
   })]);
   await decoding;
   start();
  } catch { unlocked = false; }
 }
 function roll(title, point) {
  if (muted || root.classList.contains('booting')) return;
  if (title !== activeTitle) stop();
  if (point && lastPoint && Math.hypot(point.x-lastPoint.x, point.y-lastPoint.y) < 1) return;
  activeTitle = title; lastPoint = point;
  lastMotion = performance.now();
  start();
  clearTimeout(stopTimer);
  stopTimer = setTimeout(stop, 180);
 }
 document.addEventListener('pointerdown', unlock, { capture: true, passive: true });
 document.addEventListener('click', async event => {
  const button = event.target.closest(clickButtons);
  if (!button || root.classList.contains('booting')) return;
  // The About entrance event supplies this sound when its navigation link is clicked.
  if (button.matches('.nav nav a[href="#about"]')) return;
  await unlock();
  playEffect('interface-reveal');
 }, { capture: true });
 document.addEventListener('keydown', event => { if (!event.repeat) unlock(); }, { capture: true });
 document.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  const title = event.target.closest(titles);
  if (!title) { if (activeTitle) stop(); return; }
  roll(title, { x: event.clientX, y: event.clientY });
 }, { passive: true });
 document.addEventListener('pointerout', event => {
  const title = event.target.closest(titles);
  if (title && !title.contains(event.relatedTarget)) stop();
 }, { passive: true });
 document.addEventListener('focusin', event => {
  if (event.target.matches(titles) && event.target.matches(':focus-visible')) roll(event.target, null);
 });
 document.addEventListener('focusout', event => { if (event.target.matches(titles)) stop(); });
 const toggle = document.createElement('button');
 toggle.type = 'button'; toggle.className = 'motion-sound-toggle';
 toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="sound-waves" d="M16 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/><path class="sound-off" d="m16 9 5 6m0-6-5 6"/></svg>';
 function syncToggle() {
  toggle.setAttribute('aria-pressed', String(!muted));
  const label = muted ? '开启交互音效' : '关闭交互音效';
  toggle.setAttribute('aria-label', label); toggle.title = label;
 }
 syncToggle(); document.body.append(toggle);
 window.addEventListener('portfolio:audio-enable', () => {
  muted = false;
  try { localStorage.setItem('portfolio-motion-muted', '0'); } catch {}
  syncToggle(); unlock(true);
 });
 window.addEventListener('portfolio:audio-disable', () => {
  muted = true;
  try { localStorage.setItem('portfolio-motion-muted', '1'); } catch {}
  syncToggle(); stopAll();
 });
 window.addEventListener('portfolio:entered', () => unlock());
 window.addEventListener('portfolio:about-open', async () => {
  const request = ++aboutRequest;
  stopEffect(aboutVoice); aboutVoice = null;
  await unlock();
  if (request === aboutRequest && location.hash === '#about' && document.body.classList.contains('about-page-active')) {
   aboutVoice = playEffect('interface-reveal');
  }
 });
 toggle.addEventListener('click', () => {
  // A browser-blocked context needs activation, rather than muting on its first click.
  muted = !muted && unlocked && context?.state === 'running';
  try { localStorage.setItem('portfolio-motion-muted', muted ? '1' : '0'); } catch {}
  syncToggle(); stopAll();
  if (!muted) unlock();
 });
 const projectDialog = document.querySelector('#project-dialog');
 if (projectDialog) new MutationObserver(() => {
  stop();
  const layer = projectDialog.open ? projectDialog : document.body;
  if (toggle.parentElement !== layer) layer.append(toggle);
 }).observe(projectDialog, { attributes: true, attributeFilter: ['open'] });
 document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopAll(); context?.suspend().catch(() => {}); }
  else if (unlocked && !muted) context?.resume().catch(() => {});
 });
 window.addEventListener('blur', stopAll);
 window.addEventListener('hashchange', () => {
  stop();
  if (location.hash !== '#about') { aboutRequest++; stopEffect(aboutVoice); aboutVoice = null; }
 });
 window.addEventListener('scroll', stop, { passive: true });
})();
