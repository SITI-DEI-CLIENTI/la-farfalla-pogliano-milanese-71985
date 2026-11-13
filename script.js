// Comportamenti comuni a tutti i siti. NON si modifica sito per sito.
"use strict";
(() => {
  const ridotto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const conIO = "IntersectionObserver" in window;

  // Rivelazione allo scorrimento
  const daRivelare = document.querySelectorAll(".reveal");
  if (conIO && !ridotto) {
    const io = new IntersectionObserver((voci) => {
      for (const v of voci) if (v.isIntersecting) { v.target.classList.add("is-visible"); io.unobserve(v.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    daRivelare.forEach((el) => io.observe(el));
  } else daRivelare.forEach((el) => el.classList.add("is-visible"));

  // Header: si stacca GRADUALMENTE mentre si scorre (mai uno scatto). --p va da 0 (in cima)
  // a 1 (dopo CORSA_HEADER px) e guida bordi, raggio, vetro e ombra in base.css.
  // .is-scrolled arriva a metà corsa e serve solo ai colori del testo, che sfumano.
  const testata = document.querySelector(".testata"), CORSA_HEADER = 140;
  let inAttesa = false;
  const segnaScorrimento = () => {
    inAttesa = false;
    if (!testata) return;
    const p = Math.min(1, Math.max(0, scrollY / CORSA_HEADER));
    testata.style.setProperty("--p", p.toFixed(3));
    testata.classList.toggle("is-scrolled", p >= 0.5);
  };
  addEventListener("scroll", () => { if (!inAttesa) { inAttesa = true; requestAnimationFrame(segnaScorrimento); } }, { passive: true });
  segnaScorrimento();

  // Barra contatti su telefono: compare quando la hero esce di vista
  const barra = document.querySelector(".cta-mobile"), hero = document.getElementById("top");
  if (barra && hero && conIO) new IntersectionObserver(([v]) => barra.classList.toggle("is-on", !v.isIntersecting)).observe(hero);

  // Anno nel footer
  document.querySelectorAll("[data-anno]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Orari: evidenzia la riga di oggi (le righe hanno data-giorno="1".."7", lunedì = 1)
  const oggi = ((new Date().getDay() + 6) % 7) + 1;
  document.querySelectorAll(`[data-giorno~="${oggi}"]`).forEach((el) => el.classList.add("is-oggi"));

  // Animazioni infinite in pausa fuori schermo (elementi con data-anima-sempre)
  if (conIO) document.querySelectorAll("[data-anima-sempre]").forEach((el) =>
    new IntersectionObserver(([v]) => el.toggleAttribute("data-in-pausa", !v.isIntersecting)).observe(el));

  // OPZIONE M3 — luce che segue il puntatore (elementi con data-luce)
  if (!ridotto && matchMedia("(hover: hover)").matches) document.querySelectorAll("[data-luce]").forEach((el) =>
    el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect();
      el.style.setProperty("--luce-x", `${e.clientX - r.left}px`); el.style.setProperty("--luce-y", `${e.clientY - r.top}px`); }));

  // OPZIONE M5 — numeri che contano (elementi con data-conta="1958"; solo numeri veri)
  // Il valore finale si vede SEMPRE (anche se l'HTML avesse scritto 0 o se non si scorre mai fin lì);
  // l'animazione da 0 parte solo quando il numero entra in vista. Gli anni (1000–2100) senza punto.
  const numeri = document.querySelectorAll("[data-conta]");
  const formato = (n, fine) => (fine >= 1000 && fine <= 2100 ? String(n) : n.toLocaleString("it-IT"));
  numeri.forEach((el) => { const fine = Number(el.dataset.conta); if (Number.isFinite(fine)) el.textContent = formato(fine, fine); });
  const conta = (el) => { const fine = Number(el.dataset.conta), t0 = performance.now(), durata = 1400;
    if (!Number.isFinite(fine)) return;
    const passo = (t) => { const p = Math.min(1, (t - t0) / durata), e = 1 - Math.pow(1 - p, 3);
      el.textContent = formato(Math.round(fine * e), fine); if (p < 1) requestAnimationFrame(passo); };
    requestAnimationFrame(passo); };
  if (conIO && !ridotto) { const io2 = new IntersectionObserver((voci) => { for (const v of voci) if (v.isIntersecting) { conta(v.target); io2.unobserve(v.target); } }, { threshold: 0.6 });
    numeri.forEach((el) => io2.observe(el)); }
})();
