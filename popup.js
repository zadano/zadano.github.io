/* ═══════════════════════════════════════════════════════════
   ADMIN LOGIN POPUP — новый дизайн + пароль 123000
   Подключение в index.html:
     в <head>:  <script src="/popup.js" defer></script>
   Пароль: 123000
   Редирект: /admin.html
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  const PASSWORD = "123000";
  const STORAGE_KEY = "zadano_admin";
  const REDIRECT = "/admin.html";

  /* ─── СТИЛИ (Motion Studies style) ─── */
  const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

.sys-backdrop{
  position:fixed;inset:0;z-index:2000;
  background:rgba(0,0,0,.55);
  backdrop-filter:blur(6px);
  -webkit-backdrop-filter:blur(6px);
  display:flex;align-items:center;justify-content:center;
  padding:16px;
  animation:sysFade .22s ease;
}
.sys-backdrop[hidden]{display:none}
@keyframes sysFade{from{opacity:0}to{opacity:1}}

.system-popup{
  width:100%;max-width:360px;
  background:#171717;
  border-radius:28px;
  border:1px solid rgba(255,255,255,.12);
  box-shadow:0 24px 60px rgba(0,0,0,.5);
  overflow:hidden;
  animation:sysPop .38s cubic-bezier(.34,1.56,.64,1);
  font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;
  color:#fff;
  user-select:none;
}
@keyframes sysPop{
  from{transform:scale(.92) translateY(16px);opacity:0}
  to{transform:scale(1) translateY(0);opacity:1}
}

.system-popup .popup-header{
  display:flex;justify-content:space-between;align-items:center;
  padding:18px 20px 8px;
}
.system-popup .popup-title{
  font-size:13px;font-weight:600;color:rgba(255,255,255,.78);
  letter-spacing:.4px;text-transform:uppercase;
}
.system-popup .close-btn{
  width:28px;height:28px;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.12);
  border-radius:999px;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:#9a9a9a;font-size:13px;line-height:1;
  transition:background .18s,color .18s,transform .18s;
  font-family:inherit;
  -webkit-tap-highlight-color:transparent;
}
.system-popup .close-btn:hover{background:rgba(255,255,255,.09);color:#fff}
.system-popup .close-btn:active{transform:scale(.9)}

.system-popup .popup-content{padding:8px 20px 4px}
.system-popup .popup-message{
  font-size:15px;color:rgba(255,255,255,.78);
  margin-bottom:16px;line-height:1.45;
}
.system-popup .input-wrap{position:relative}
.system-popup .input-field{
  width:100%;padding:14px 16px;
  font-size:16px;font-family:inherit;font-weight:500;
  color:#fff;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.12);border-radius:14px;
  outline:none;letter-spacing:2px;
  transition:border-color .18s,box-shadow .18s,background .18s;
}
.system-popup .input-field:focus{
  border-color:#3ec9ff;
  background:rgba(62,201,255,.06);
  box-shadow:0 0 0 3px rgba(62,201,255,.18);
}
.system-popup .input-field::placeholder{color:#828282;letter-spacing:normal;font-weight:400}

.system-popup .sys-error{
  font-size:12px;color:#ff5a5f;font-weight:500;margin-top:10px;
  animation:sysShake .4s ease;
}
@keyframes sysShake{
  0%,100%{transform:translateX(0)}
  20%{transform:translateX(-6px)}
  40%{transform:translateX(6px)}
  60%{transform:translateX(-4px)}
  80%{transform:translateX(4px)}
}

.system-popup .popup-actions{
  padding:16px 20px 20px;
}
.system-popup .btn{
  width:100%;
  padding:14px 20px;font-size:15px;font-family:inherit;font-weight:600;
  border-radius:14px;cursor:pointer;
  transition:transform .18s cubic-bezier(.34,1.56,.64,1),background .18s,box-shadow .18s;
  -webkit-tap-highlight-color:transparent;
  border:none;
}
.system-popup .btn-enter{
  background:#fff;color:#000;
  box-shadow:0 4px 14px rgba(0,0,0,.35);
}
.system-popup .btn-enter:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.45)}
.system-popup .btn-enter:active{transform:scale(.97)}

@media(max-width:480px){
  .sys-backdrop{padding:0;align-items:flex-end}
  .system-popup{
    max-width:100%;
    border-radius:28px 28px 0 0;
    border-bottom:none;
    padding-bottom:env(safe-area-inset-bottom);
    animation:sysSlideUp .4s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes sysSlideUp{
    from{transform:translateY(100%)}
    to{transform:translateY(0)}
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
      <div class="input-wrap">
        <input type="password" class="input-field" id="sysInput" placeholder="Пароль..." autocomplete="current-password" inputmode="numeric">
      </div>
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
    setTimeout(()=>input.focus(), 120);
  }
  function closePopup(){
    backdrop.hidden = true;
    document.body.style.overflow = "";
  }

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
      error.style.animation = "none";
      void error.offsetWidth;
      error.style.animation = "";
      input.value = "";
      input.focus();
      if(window.gtag) gtag('event', 'admin_login', { result: 'fail' });
    }
  });

  window.openAdminPopup = openPopup;
})();
