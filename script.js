"use strict";
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
const raizEl = document.documentElement;

/* ---------- Menu mobile ---------- */
(() => {
  const btn = document.querySelector(".menu-btn");
  const menu = document.getElementById("nav-mobile");
  if (!btn || !menu) return;
  const fechar = () => { btn.setAttribute("aria-expanded", "false"); menu.hidden = true; };
  btn.addEventListener("click", () => {
    const aberto = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!aberto));
    menu.hidden = aberto;
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", fechar));
})();

/* ---------- Bolha de silêncio (movimento-assinatura) ---------- */
(() => {
  if (reduz || matchMedia("(hover: none)").matches) return;
  let x = -200, y = -200, raio = 0, alvo = 0, raf = 0;
  addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY; alvo = 200;
    raizEl.style.setProperty("--mx", x + "px");
    raizEl.style.setProperty("--my", y + "px");
    if (!raf) raf = requestAnimationFrame(passo);
  }, { passive: true });
  addEventListener("pointerleave", () => { alvo = 0; if (!raf) raf = requestAnimationFrame(passo); });
  function passo() {
    raio += (alvo - raio) * 0.12;
    raizEl.style.setProperty("--br", raio.toFixed(1) + "px");
    raf = Math.abs(alvo - raio) > 0.5 ? requestAnimationFrame(passo) : 0;
  }
})();

/* ---------- Pico: a cidade emudece (onda que achata com --progresso) ---------- */
(() => {
  const secao = document.getElementById("silencio");
  const canvas = document.querySelector(".pico__onda");
  if (!secao || !canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  let raf = 0, t = 0;

  function progresso() {
    const v = parseFloat(getComputedStyle(secao).getPropertyValue("--progresso"));
    if (!isNaN(v)) return Math.min(1, Math.max(0, v));
    // fora do pino: antes = 0, depois = 1
    return secao.getBoundingClientRect().top < 0 ? 1 : 0;
  }
  function mistura(a, b, t) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)); }

  function desenhar() {
    const p = progresso();
    const calma = p; // 0 ruidoso, 1 silêncio
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 2.5;
    const cor = mistura([160, 168, 189], [59, 91, 255], calma);
    ctx.strokeStyle = `rgb(${cor[0]},${cor[1]},${cor[2]})`;
    ctx.beginPath();
    const amp = (1 - calma) * (H * 0.34);
    for (let xx = 0; xx <= W; xx += 2) {
      const f = xx / W;
      let yy = H / 2;
      yy += amp * Math.sin(f * 22 + t);
      yy += amp * 0.5 * Math.sin(f * 60 + t * 1.6);
      yy += amp * 0.3 * Math.sin(f * 120 + t * 2.3);
      yy += (1 - calma) * (Math.random() - 0.5) * 8;
      xx === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  function loop() { t += 0.06; desenhar(); raf = requestAnimationFrame(loop); }

  if (reduz) { desenhar(); return; }
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (e.isIntersecting && !raf) raf = requestAnimationFrame(loop);
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; desenhar(); }
    });
  }, { threshold: 0 });
  io.observe(secao);
})();

/* ---------- Demo hands-on: toggles + onda + áudio sintetizado ---------- */
(() => {
  const CATS = [
    { id: "obra", nome: "Obra", icone: "i-hardhat", freq: 180, amp: 26 },
    { id: "transito", nome: "Trânsito", icone: "i-car", freq: 320, amp: 22 },
    { id: "multidao", nome: "Multidão", icone: "i-users", freq: 520, amp: 18 },
    { id: "latido", nome: "Latido", icone: "i-paw", freq: 900, amp: 20 },
    { id: "buzina", nome: "Buzina", icone: "i-horn", freq: 1500, amp: 16 },
    { id: "sirene", nome: "Sirene", icone: "i-siren", freq: 2200, amp: 14 },
  ];
  const fieldset = document.querySelector(".demo__controles");
  const canvas = document.querySelector(".demo .onda");
  const chip = document.querySelector("[data-estado]");
  const play = document.querySelector(".demo__play");
  if (!fieldset || !canvas) return;
  const filtrado = Object.fromEntries(CATS.map((c) => [c.id, false]));

  CATS.forEach((c) => {
    const l = document.createElement("label");
    l.className = "toggle";
    l.innerHTML = `<svg class="ico"><use href="#${c.icone}"/></svg><span class="toggle__nome">${c.nome}</span><input type="checkbox" aria-label="Filtrar ${c.nome}" /><span class="sw" aria-hidden="true"></span>`;
    const input = l.querySelector("input");
    input.addEventListener("change", () => { filtrado[c.id] = input.checked; atualizar(); aplicarAudio(c.id); });
    fieldset.appendChild(l);
  });

  const nFil = () => CATS.filter((c) => filtrado[c.id]).length;
  function atualizar() {
    const n = nFil();
    if (!chip) return;
    if (n === 0) { chip.textContent = "Captando tudo"; chip.removeAttribute("data-limpo"); }
    else if (n === CATS.length) { chip.textContent = "Só a sua voz"; chip.setAttribute("data-limpo", ""); }
    else { chip.textContent = `Filtrando ${n} de ${CATS.length}`; chip.setAttribute("data-limpo", ""); }
  }

  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  let t = 0, raf = 0;
  function cor() {
    const l = nFil() / CATS.length, a = [160, 168, 189], b = [59, 91, 255];
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * l));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }
  function desenhar() {
    ctx.clearRect(0, 0, W, H); ctx.lineWidth = 2; ctx.strokeStyle = cor(); ctx.beginPath();
    for (let x = 0; x <= W; x += 2) {
      let y = H / 2;
      for (const c of CATS) { if (filtrado[c.id]) continue; y += c.amp * Math.sin((x / W) * c.freq * 0.03 + t * (0.6 + c.freq / 4000)); }
      y += (1 - nFil() / CATS.length) * (Math.random() - 0.5) * 6;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  function loop() { t += 0.05; desenhar(); raf = requestAnimationFrame(loop); }
  if (reduz) desenhar();
  else {
    const io = new IntersectionObserver((e) => e.forEach((en) => {
      if (en.isIntersecting && !raf) raf = requestAnimationFrame(loop);
      else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
    }), { threshold: 0.1 });
    io.observe(canvas);
  }

  // Áudio sintetizado (ruído branco por bandas), sem arquivo
  let ac, master, fontes = null, tocando = false;
  function build() { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.07; master.connect(ac.destination); }
  function iniciar() {
    const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const ganhos = {};
    CATS.forEach((c) => {
      const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = c.freq; bp.Q.value = 6;
      const g = ac.createGain(); g.gain.value = filtrado[c.id] ? 0 : 1;
      src.connect(bp); bp.connect(g); g.connect(master); ganhos[c.id] = g;
    });
    src.start(); fontes = { src, ganhos };
  }
  function aplicarAudio(id) { if (fontes && fontes.ganhos[id]) fontes.ganhos[id].gain.setTargetAtTime(filtrado[id] ? 0 : 1, ac.currentTime, 0.05); }
  function parar() { if (fontes) { try { fontes.src.stop(); } catch {} fontes.src.disconnect(); fontes = null; } }
  if (play) play.addEventListener("click", async () => {
    if (!ac) build();
    if (ac.state === "suspended") await ac.resume();
    tocando = !tocando; play.setAttribute("aria-pressed", String(tocando));
    play.querySelector(".demo__play-txt").textContent = tocando ? "Parar" : "Ouvir exemplo";
    tocando ? iniciar() : parar();
  });

  atualizar();
})();

/* ---------- Form da lista de espera (fake) ---------- */
(() => {
  const form = document.querySelector(".preco__form");
  const msg = document.querySelector("[data-form-msg]");
  if (!form || !msg) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.querySelector("input");
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      msg.textContent = "Pronto, você entrou na lista (de mentira). Obrigado por testar o protótipo.";
      msg.setAttribute("data-ok", ""); email.value = "";
    } else { msg.textContent = "Digite um e-mail válido para continuar."; msg.removeAttribute("data-ok"); email.focus(); }
  });
})();
