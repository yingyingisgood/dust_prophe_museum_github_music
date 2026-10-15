// Classic script: entrance works even if the optional 3D engine cannot load.
(function () {
  const enter = document.getElementById('enter');
  const intro = document.getElementById('intro');
  const video = document.getElementById('tour');
  const info = document.createElement('p');
  info.id='startupInfo';info.style.cssText='font:12px "Funnel Display",sans-serif;color:#99c9df;line-height:1.6;margin-top:12px;max-width:550px';
  enter.insertAdjacentElement('afterend',info);
  if (location.protocol==='file:') {
    info.textContent='This project requires the included local web server. Please open START_WINDOWS.bat (Windows) or START_MAC.command (Mac), not index.html directly.';
    return;
  }
  window.__museumModuleReady=false;
  enter.addEventListener('click', async function () {
    // If the full application loaded, its own onclick handler handles archive state.
    if (window.__museumModuleReady) return;
    intro.classList.add('hidden');
    try { await video.play(); }
    catch(e) {intro.classList.remove('hidden');info.textContent='Video playback failed: '+e.message;return;}
    const note = document.createElement('div');
    note.id='engineWarning';note.style.cssText='position:fixed;top:12px;left:12px;right:12px;z-index:99;background:#08131de6;color:#a6e7ff;border:1px solid #29c7f1;padding:12px;font:13px sans-serif';
    note.textContent='Museum video is playing, but the 3D engine has not loaded. Check your internet connection (Three.js CDN), then reload this page.';
    if(!document.getElementById('engineWarning'))document.body.appendChild(note);
  });
  window.addEventListener('error',function(e){if(!window.__museumModuleReady){info.textContent='A required script failed to load. Use the included launcher and ensure the Three.js CDN is accessible.';}});
  window.addEventListener('unhandledrejection',function(e){if(!window.__museumModuleReady){info.textContent='3D engine loading error. Check network access and use the included launcher.';}});
})();
