/* ═══════════════════════════════════════════════════════════
   ADMIN LOGIN POPUP — всё в одном файле
   Подключение в index.html:
     в <head>:  <script src="/popup.js" defer></script>
   Пароль: cats
   Редирект: /admin.html
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  const PASSWORD = "cats";
  const STORAGE_KEY = "zadano_admin";
  const REDIRECT = "/admin.html";

  /* ─── СТИЛИ ─── */
  const CSS = `
.sys-backdrop{
  position:fixed;inset:0;z-index:2000;
  background:rgba(0,0,0,.4);
  display:flex;align-items:flex-end;justify-content:center;
  padding:14px;
  padding-bottom:calc(14px + env(safe-area-inset-bottom));
  animation:sysFade .2s ease;
}
.sys-backdrop[hidden]{display:none}
@keyframes sysFade{from{opacity:0}to{opacity:1}}

.system-popup{
  width:100%;max-width:380px;
  background:#f0f0f0;
  border:1px solid #b0b0b0;
  border-radius:8px;
  box-shadow:0 8px 30px rgba(0,0,0,.3);
  overflow:hidden;
  animation:sysSlideUp .25s ease-out;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
}
@keyframes sysSlideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}

.system-popup .popup-header{
  display:flex;justify-content:space-between;align-items:center;
  padding:10px 14px;
  background:linear-gradient(to bottom,#e8e8e8,#d8d8d8);
  border-bottom:1px solid #b0b0b0;
}
.system-popup .popup-title{
  font-size:13px;font-weight:600;color:#333;letter-spacing:.2px;
}
.system-popup .close-btn{
  width:22px;height:22px;
  background:#e0e0e0;border:1px solid #a0a0a0;border-radius:4px;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:#555;font-size:14px;line-height:1;
  transition:background-color .15s;font-family:inherit;
}
.system-popup .close-btn:hover{background:#d0d0d0}
.system-popup .close-btn:active{background:#c0c0c0}

.system-popup .popup-content{padding:14px}
.system-popup .popup-message{
  font-size:14px;color:#333;margin-bottom:14px;line-height:1.4;
}
.system-popup .input-field{
  width:100%;padding:10px 12px;
  font-size:16px;font-family:inherit;
  color:#333;background:#fff;
  border:1px solid #b0b0b0;border-radius:4px;outline:none;
  transition:border-color .15s,box-shadow .15s;
}
.system-popup .input-field:focus{
  border-color:#0078d4;
  box-shadow:0 0 0 2px rgba(0,120,212,.2);
}
.system-popup .input-field::placeholder{color:#999}

.system-popup .popup-actions{
  display:flex;justify-content:flex-end;
  padding:14px;
  background:#e8e8e8;
  border-top:1px solid #d0d0d0;
}
.system-popup .btn{
  padding:8px 20px;font-size:13px;font-family:inherit;font-weight:500;
  border-radius:4px;cursor:pointer;transition:background-color .15s;
  -webkit-tap-highlight-color:transparent;
}
.system-popup .btn-enter{
  background:#0078d4;color:#fff;border:1px solid #0063b1;
}
.system-popup .btn-enter:hover{background:#0063b1}
.system-popup .btn-enter:active{background:#005a9e}

.system-popup .sys-error{
  font-size:12px;color:#c00;font-weight:600;margin-top:8px;
}

@media(max-width:480px){
  .sys-backdrop{padding:0}
  .system-popup{
    max-width:100%;
    border-radius:12px 12px 0 0;
    border-bottom:none;
    padding-bottom:env(safe-area-inset-bottom);
  }
}
  `;

  /* ─── РАЗМЕТКА ─── */
  const HTML = `
<div class="system-popup" role="dialog" aria-modal="true" aria-labelledby="sysTitle">
  <div class="popup-header">
    <div class="popup-title" id="sysTitle">Admin Panel</div>
    <button class="close-btn" id="sysClose" aria-label="Close" type="button">✕</button>
  </div>
  <form id="sysForm">
    <div class="popup-content">
      <div class="popup-message">Доступ в админ-панель. Введите пароль.</div>
      <input type="password" class="input-field" id="sysInput" placeholder="Пароль..." autocomplete="current-password">
      <p class="sys-error" id="sysError" hidden>Неверный пароль</p>
    </div>
    <div class="popup-actions">
      <button type="submit" class="btn btn-enter">Войти</button>
    </div>
  </form>
</div>
  `;

  /* ─── ИНЪЕКТ СТИЛЕЙ ─── */
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ─── ИНЪЕКТ РАЗМЕТКИ ─── */
  const backdrop = document.createElement("div");
  backdrop.className = "sys-backdrop";
  backdrop.id = "sysBackdrop";
  backdrop.hidden = true;
  backdrop.innerHTML = HTML;
  document.body.appendChild(backdrop);

  /* ─── ЛОГИКА ─── */
  const form     = backdrop.querySelector("#sysForm");
  const input    = backdrop.querySelector("#sysInput");
  const error    = backdrop.querySelector("#sysError");
  const closeBtn = backdrop.querySelector("#sysClose");

  // Автоматически создаём ссылку "Panel" в футере, если её нет
  function ensureFooterLink(){
    if(document.getElementById("panelLink")) return document.getElementById("panelLink");
    const footer = document.querySelector(".footer") || document.querySelector("footer");
    if(!footer) return null;
    const firstDiv = footer.querySelector("div");
    if(!firstDiv) return null;
    const a = document.createElement("a");
    a.href = "#";
    a.id = "panelLink";
    a.textContent = "Panel";
    firstDiv.appendChild(a);
    return a;
  }

  function openPopup(){
    backdrop.hidden = false;
    error.hidden = true;
    input.value = "";
    document.body.style.overflow = "hidden";
    setTimeout(()=>input.focus(), 100);
  }
  function closePopup(){
    backdrop.hidden = true;
    document.body.style.overflow = "";
  }

  // Ждём, пока DOM прогрузится — для случая, если footer ещё не отрисован
  function bindLink(){
    const link = ensureFooterLink();
    if(link){
      link.addEventListener("click", e=>{ e.preventDefault(); openPopup(); });
    } else {
      setTimeout(bindLink, 300);
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", bindLink);
  } else {
    bindLink();
  }

  closeBtn.addEventListener("click", closePopup);
  backdrop.addEventListener("click", e=>{ if(e.target === backdrop) closePopup(); });
  document.addEventListener("keydown", e=>{
    if(e.key === "Escape" && !backdrop.hidden) closePopup();
  });

  form.addEventListener("submit", e=>{
    e.preventDefault();
    if(input.value === PASSWORD){
      try{ localStorage.setItem(STORAGE_KEY, "1"); }catch(err){}
      if(window.gtag) gtag('event', 'admin_login', { result: 'success' });
      location.href = REDIRECT;
    } else {
      error.hidden = false;
      input.value = "";
      input.focus();
      if(window.gtag) gtag('event', 'admin_login', { result: 'fail' });
    }
  });

  // Экспортируем в глобал, если понадобится открыть программно
  window.openAdminPopup = openPopup;
})();
