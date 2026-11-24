/* ═══════════════════════════════════════════════════════════
   ADMIN LOGIN — OTP-style popup (ручной ввод)
   Подключение в index.html:
     в <head>:  <script src="/popup.js" defer></script>
   Пароль: 123000
   Редирект: /admin.html
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  const PASSWORD    = "123000";
  const STORAGE_KEY = "zadano_admin";
  const REDIRECT    = "/admin.html";
  const N           = 6;

  /* ─── СТИЛИ (Motion Studies tokens + OTP) ─── */
  const CSS = `
:root{
  --stage:#000;
  --card:#171717;
  --surface:#262626;
  --fill-1:rgba(255,255,255,.05);
  --fill-2:rgba(255,255,255,.09);
  --fill-3:rgba(255,255,255,.14);
  --line:rgba(255,255,255,.12);
  --text:#fff;
  --text-2:rgba(255,255,255,.78);
  --muted:#9a9a9a;
  --muted-2:#828282;
  --green:#34d17a;
  --green-text:#3ce085;
  --red:#ff5a5f;
  --blue:#3ec9ff;
  --on-green:#04140a;
  --font:Inter,"Helvetica Neue",Helvetica,Arial,sans-serif;
  --fs-xs:12px;
  --fs-sm:13px;
  --fs-base:15px;
  --fs-lg:16px;
  --fw-regular:400;
  --fw-medium:500;
  --fw-bold:600;
  --r-tile:14px;
  --r-pill:999px;
}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

.sys-backdrop{
  position:fixed;inset:0;z-index:2000;
  background:rgba(0,0,0,.55);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;
  padding:16px;
  animation:sysFade .22s ease;
  font-family:var(--font);
}
.sys-backdrop[hidden]{display:none}
@keyframes sysFade{from{opacity:0}to{opacity:1}}

.sys-card{
  position:relative;
  width:100%;max-width:340px;
  background:var(--card);
  border-radius:28px;
  padding:32px 20px 28px;
  animation:sysPop .38s cubic-bezier(.34,1.56,.64,1);
  color:var(--text);
  user-select:none;-webkit-user-select:none;
}
@keyframes sysPop{
  from{transform:scale(.92) translateY(14px);opacity:0}
  to{transform:scale(1) translateY(0);opacity:1}
}

.sys-close{
  position:absolute;top:16px;right:16px;
  width:28px;height:28px;
  background:var(--fill-2);border:none;border-radius:var(--r-pill);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--muted);font-size:13px;line-height:1;
  transition:background .18s,color .18s,transform .18s;
  font-family:inherit;-webkit-tap-highlight-color:transparent;
}
.sys-close:hover{background:var(--fill-3);color:var(--text)}
.sys-close:active{transform:scale(.9)}

/* OTP-компонент — твой, без изменений */
.otp{position:relative;width:100%;text-align:center}
.hint{font-size:var(--fs-sm);color:var(--muted);margin-bottom:16px;line-height:1.5}
.hint b{color:var(--text);font-weight:var(--fw-medium)}
.boxes{position:relative;height:56px;margin:0 auto}
.bx{
  position:absolute;top:0;height:56px;border-radius:var(--r-tile);
  background:var(--surface);display:grid;place-items:center;
  font-size:24px;font-weight:var(--fw-bold);
  font-variant-numeric:tabular-nums;color:var(--text);
  will-change:transform,width,left;
}
.bx i{font-style:normal;display:block;will-change:transform,opacity}
.bx .car{
  position:absolute;width:2px;height:24px;border-radius:1px;
  background:var(--text);left:50%;top:16px;margin-left:-1px;
}
.ok{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  gap:8px;font-size:var(--fs-lg);font-weight:var(--fw-bold);
  color:var(--on-green);opacity:0;pointer-events:none;
}
.ok svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
#sysInput{
  position:absolute;inset:0;width:100%;height:100%;
  opacity:0;border:0;font-size:var(--fs-lg);z-index:2;
  cursor:text;caret-color:transparent;
}

.err{
  position:absolute;left:0;right:0;bottom:-28px;
  text-align:center;font-size:var(--fs-xs);color:var(--red);
  font-weight:var(--fw-medium);opacity:0;transition:opacity .2s;
}
.err.show{opacity:1}
.err.shake{animation:errShake .4s ease}
@keyframes errShake{
  0%,100%{transform:translateX(0)}
  20%{transform:translateX(-6px)}
  40%{transform:translateX(6px)}
  60%{transform:translateX(-4px)}
  80%{transform:translateX(4px)}
}

@media(max-width:480px){
  .sys-backdrop{padding:0;align-items:flex-end}
  .sys-card{
    max-width:100%;
    border-radius:28px 28px 0 0;
    padding-bottom:calc(28px + env(safe-area-inset-bottom));
    animation:sysSlideUp .4s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes sysSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
}
  `;

  /* ─── РАЗМЕТКА ─── */
  const HTML = `
<button class="sys-close" id="sysClose" aria-label="Close" type="button">✕</button>
<div class="otp">
  <p class="hint">Введите пароль для входа в <b>админ-панель</b></p>
  <div class="boxes" id="sysBoxes">
    <input id="sysInput" inputmode="numeric" autocomplete="current-password" maxlength="6" aria-label="6 digit password">
  </div>
  <p class="err" id="sysError">Неверный пароль</p>
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

  const card = document.createElement("div");
  card.className = "sys-card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.innerHTML = HTML;
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);

  /* ─── SPRING ENGINE (упрощённый Motion) ─── */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const S = (x, k = 400, c = 30) => ({ x, v: 0, t: x, k, c });
  const step = (s, dt) => {
    const a = -s.k * (s.x - s.t) - s.c * s.v;
    s.v += a * dt; s.x += s.v * dt;
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const comps = [];
  const timers = [];
  const after = (sec, fn) => { const t = { t: sec, fn }; timers.push(t); return t; };
  const cancel = t => { const i = timers.indexOf(t); if (i > -1) timers.splice(i, 1); };
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    for (let i = timers.length - 1; i >= 0; i--) {
      if ((timers[i].t -= dt) <= 0) timers.splice(i, 1)[0].fn();
    }
    const sub = 4;
    for (let k = 0; k < sub; k++) comps.forEach(c => c.frame(dt / sub));
    comps.forEach(c => c.render());
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ─── ЛОГИКА ─── */
  const boxes    = backdrop.querySelector("#sysBoxes");
  const inp      = backdrop.querySelector("#sysInput");
  const err      = backdrop.querySelector("#sysError");
  const closeBtn = backdrop.querySelector("#sysClose");

  const bx = [...Array(N)].map(() => {
    const el = document.createElement("div"); el.className = "bx";
    const d = document.createElement("i"); el.appendChild(d);
    const car = document.createElement("span"); car.className = "car"; el.appendChild(car);
    boxes.insertBefore(el, inp);
    return { el, d, car, y: S(0, 520, 16), o: S(0, 400, 28), a: S(0, 300, 26) };
  });
  const ok = document.createElement("div"); ok.className = "ok";
  ok.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>Verified</span>';
  boxes.appendChild(ok);

  const M = S(0, 260, 24), G = S(0, 220, 28);
  let val = "", clock = 0, done = false, timersList = [];

  const later = (s, f) => {
    const t = after(s, () => { timersList = timersList.filter(x => x !== t); f(); });
    timersList.push(t);
  };

  function showError(){
    err.classList.add("show","shake");
    setTimeout(() => err.classList.remove("shake"), 400);
  }
  function hideError(){
    err.classList.remove("show","shake");
  }

  function set(v) {
    v = v.replace(/\D/g, "").slice(0, N);
    for (let i = 0; i < N; i++) {
      const c = v[i] || "";
      if (c && bx[i].d.textContent !== c) {
        bx[i].d.textContent = c;
        bx[i].y.x = -14; bx[i].y.v = 0;
        bx[i].o.x = 0; bx[i].o.t = 1;
      }
      if (!c) { bx[i].d.textContent = ""; bx[i].o.t = 0; }
    }
    val = v; inp.value = v;

    if (v.length === N && !done) {
      done = true;
      if (v === PASSWORD) {
        later(.25, () => { M.t = 1; });
        later(.55, () => { G.t = 1; });
        later(1.6, () => {
          try { localStorage.setItem(STORAGE_KEY, "1"); } catch(e){}
          if (window.gtag) gtag("event", "admin_login", { result: "success" });
          location.href = REDIRECT;
        });
      } else {
        showError();
        if (window.gtag) gtag("event", "admin_login", { result: "fail" });
        later(.9, () => { reset(); hideError(); });
      }
    }
  }
  function reset() {
    done = false; G.t = 0; M.t = 0;
    later(.35, () => set(""));
  }

  inp.addEventListener("input", () => {
    timersList.forEach(cancel); timersList = [];
    if (done) { done = false; M.t = 0; G.t = 0; }
    hideError();
    set(inp.value);
  });

  /* ─── OPEN / CLOSE ─── */
  function openPopup(){
    backdrop.hidden = false;
    done = false; val = ""; inp.value = "";
    M.t = 0; M.x = 0; M.v = 0;
    G.t = 0; G.x = 0; G.v = 0;
    bx.forEach(b => {
      b.d.textContent = "";
      b.o.t = 0; b.o.x = 0; b.o.v = 0;
      b.y.t = 0; b.y.x = 0; b.y.v = 0;
      b.a.t = 0; b.a.x = 0; b.a.v = 0;
    });
    hideError();
    document.body.style.overflow = "hidden";
    setTimeout(() => inp.focus(), 120);
  }
  function closePopup(){
    backdrop.hidden = true;
    document.body.style.overflow = "";
  }

  /* ─── Авто-ссылка "Panel" в футере ─── */
  function ensureFooterLink(){
    if (document.getElementById("panelLink")) return document.getElementById("panelLink");
    const footer = document.querySelector(".footer") || document.querySelector("footer");
    if (!footer) return null;
    const firstDiv = footer.querySelector("div");
    if (!firstDiv) return null;
    const a = document.createElement("a");
    a.href = "#"; a.id = "panelLink"; a.textContent = "Panel";
    firstDiv.appendChild(a);
    return a;
  }
  function bindLink(){
    const link = ensureFooterLink();
    if (link) {
      link.addEventListener("click", e => { e.preventDefault(); openPopup(); });
    } else {
      setTimeout(bindLink, 300);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindLink);
  } else {
    bindLink();
  }

  /* ─── События ─── */
  closeBtn.addEventListener("click", closePopup);
  backdrop.addEventListener("click", e => { if (e.target === backdrop) closePopup(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !backdrop.hidden) closePopup();
  });

  /* ─── Рендер ─── */
  comps.push({
    frame(dt) {
      clock += dt;
      bx.forEach((b, i) => {
        b.a.t = !done && i === Math.min(val.length, N - 1) ? 1 : 0;
        step(b.y, dt); step(b.o, dt); step(b.a, dt);
      });
      step(M, dt); step(G, dt);
    },
    render() {
      const W = boxes.parentElement.offsetWidth;
      const gap0 = 8;
      const bw = Math.min(48, (W - gap0 * (N - 1)) / N);
      const m = clamp(M.x, 0, 1.1);
      const gap = gap0 * (1 - clamp(m, 0, 1));
      const total = bw * N + gap * (N - 1);
      const left0 = (W - total) / 2;

      bx.forEach((b, i) => {
        b.el.style.left = (left0 + i * (bw + gap)).toFixed(2) + "px";
        b.el.style.width = (bw + (i < N - 1 ? gap0 * clamp(m, 0, 1) + 1 : 0)).toFixed(2) + "px";
        const r = 14 * (1 - clamp(m, 0, 1));
        b.el.style.borderRadius = i === 0
          ? `14px ${r}px ${r}px 14px`
          : i === N - 1
            ? `${r}px 14px 14px ${r}px`
            : `${r}px`;

        const a = clamp(b.a.x, 0, 1), g = clamp(G.x, 0, 1);
        b.el.style.background = g > .01
          ? `color-mix(in srgb, var(--green) ${(g * 100).toFixed(1)}%, var(--surface))`
          : a > .01
            ? `color-mix(in srgb, var(--fill-3) ${(a * 100).toFixed(1)}%, var(--surface))`
            : "";

        b.d.style.opacity = (clamp(b.o.x, 0, 1) * (1 - g)).toFixed(3);
        b.d.style.transform = `translateY(${b.y.x.toFixed(2)}px)`;
        b.car.style.opacity = a > .5 && !val[i] && (clock * 1.8) % 2 < 1.2 ? 1 : 0;
      });

      boxes.style.width = W + "px";
      ok.style.opacity = clamp(G.x * 1.6 - .5, 0, 1).toFixed(3);
      ok.style.transform = `translateY(${((1 - clamp(G.x, 0, 1)) * 8).toFixed(2)}px)`;
    },
  });

  /* ─── Экспорт ─── */
  window.openAdminPopup = openPopup;
})();
