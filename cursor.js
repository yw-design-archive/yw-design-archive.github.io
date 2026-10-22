// Use a black silhouette over the directory and a white silhouette elsewhere.
(() => {
 const finePointer = matchMedia('(pointer: fine)');
 if (!finePointer.matches) return;
 const cursor = document.createElement('img');
 cursor.className = 'adaptive-cursor';
 cursor.alt = '';
 cursor.setAttribute('aria-hidden', 'true');
 cursor.draggable = false;
 cursor.src = 'assets/pale-arrow-cursor.png';
 let ready = false;
 cursor.decode().then(() => { ready = true; }).catch(() => {});
 document.body.append(cursor);
 const directory = document.querySelector('#work');
 const landing = document.querySelector('#directory-landing');
 let point = null;
 function syncSection() {
  if (!point) return;
  const dialog = document.querySelector('dialog[open]');
  const layer = dialog || document.body;
  if (cursor.parentElement !== layer) layer.append(cursor);
  const bounds = directory?.getBoundingClientRect();
  const inDirectory = !dialog && landing && !landing.hidden &&
   !document.body.classList.contains('about-page-active') &&
   !document.body.classList.contains('category-page-active') &&
   bounds && bounds.width > 0 && bounds.height > 0 &&
   point.x >= bounds.left && point.x <= bounds.right &&
   point.y >= bounds.top && point.y <= bounds.bottom;
  cursor.classList.toggle('is-directory', Boolean(inDirectory));
  cursor.classList.toggle('is-about', !dialog && document.body.classList.contains('about-page-active'));
  cursor.classList.toggle('is-project', Boolean(dialog));
 }
 function hide() { cursor.classList.remove('is-visible'); }
 document.addEventListener('pointermove', event => {
  if (!ready || !finePointer.matches || event.pointerType === 'touch') { hide(); return; }
  point = { x: event.clientX, y: event.clientY };
  syncSection();
  cursor.style.left = (event.clientX - .7) + 'px';
  cursor.style.top = (event.clientY - .7) + 'px';
  document.documentElement.classList.add('has-adaptive-cursor');
  cursor.classList.add('is-visible');
 }, { passive: true });
 document.documentElement.addEventListener('pointerleave', hide);
 document.addEventListener('pointercancel', hide);
 window.addEventListener('blur', hide);
 window.addEventListener('scroll', syncSection, { passive: true });
 window.addEventListener('resize', syncSection, { passive: true });
 window.addEventListener('hashchange', syncSection);
 document.addEventListener('close', syncSection, true);
 new MutationObserver(syncSection).observe(document.body, { attributes: true, attributeFilter: ['class'] });
 document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
 finePointer.addEventListener('change', () => {
  if (!finePointer.matches) {
   hide();
   document.documentElement.classList.remove('has-adaptive-cursor');
  }
 });
})();
