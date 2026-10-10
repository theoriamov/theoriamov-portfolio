/* Página em inglês para clientes da Upwork/Fiverr (work.html).
   Usa os mesmos vídeos do site (projetos.js), sem WhatsApp, Instagram ou contatos. */
(() => {
  const CATS = [
    { id: "all", nome: "All work" },
    { id: "reels", nome: "Reels & Social" },
    { id: "ai", nome: "AI Video Ads" },
    { id: "business", nome: "Brand & Business" },
    { id: "food", nome: "Food & Restaurants" },
    { id: "youtube", nome: "YouTube" },
    { id: "documentary", nome: "Documentary" },
    { id: "motion", nome: "Motion Graphics" },
    { id: "events", nome: "Events" },
  ];
  // categoria do site (pt) -> categoria da página em inglês
  const MAPA = { influencers: "reels", empresarial: "business", gastronomico: "food", youtube: "youtube", "motion-graphics": "motion", eventos: "events", "video-com-ia": "reels" };
  const NOMES = { "Aniversário": "Birthday Event", "Infográfico": "Infographic", "Frelas Gastronomia": "Restaurant Projects", "Lótus Contabilidade": "Lotus Accounting", "Mesa do Tempo": "Mesa do Tempo (YouTube)" };

  // Quantos vídeos de cada cliente aparecem (os primeiros da lista). "padrao" vale para quem não estiver aqui.
  const MAX_POR_CLIENTE = { padrao: 4, "Lótus Contabilidade": 4, "Grupo Capital": 4, "Nerdsburguer": 5, "Infográfico": 1, "Aniversário": 2,
    // YouTube: 5 no total (2 destaques do work-extras.js + 2 do 7x7 Allan + 1 da Mesa do Tempo)
    "youtube:7x7 Allan": 2, "youtube:Mesa do Tempo": 1 };

  const ocultos = new Set(typeof OCULTOS !== "undefined" ? OCULTOS : []);
  const itens = [];
  (typeof WORK_EXTRAS !== "undefined" ? WORK_EXTRAS : []).forEach((it) => itens.push({ ...it, cliente: it.titulo, cat: it.categoria, destaque: true }));
  (typeof PROJETOS !== "undefined" ? PROJETOS : []).forEach((p) => {
    const cat = MAPA[p.categoria] || "reels";
    p.itens.filter((it) => !ocultos.has(it.src) && !ocultos.has(`yt:${it.id}`))
      .slice(0, MAX_POR_CLIENTE[`${p.categoria}:${p.titulo}`] ?? MAX_POR_CLIENTE[p.titulo] ?? MAX_POR_CLIENTE.padrao)
      .forEach((it) => itens.push({ ...it, cliente: NOMES[p.titulo] || p.titulo, cat }));
  });

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const thumb = (it) => (it.tipo === "youtube" ? `https://img.youtube.com/vi/${it.id}/hqdefault.jpg` : it.poster);
  const nomeCat = (id) => (CATS.find((c) => c.id === id) || {}).nome || "";

  let atual = "all", lista = [], pos = 0;

  const marcas = new Set(itens.map((i) => i.cliente)).size;
  $("#stats").innerHTML = `<div class="stat"><b>${itens.length}+</b><span>videos in this portfolio</span></div><div class="stat"><b>${marcas}</b><span>clients & projects</span></div><div class="stat"><b>2023</b><span>editing professionally since</span></div>`;

  const usadas = new Set(itens.map((i) => i.cat));
  $("#tabs").innerHTML = CATS.filter((c) => c.id === "all" || usadas.has(c.id))
    .map((c) => `<button class="tab${c.id === atual ? " is-on" : ""}" data-cat="${c.id}">${c.nome}</button>`).join("");
  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab"); if (!b) return;
    atual = b.dataset.cat;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("is-on", t === b));
    render();
  });

  function render() {
    lista = itens.filter((i) => atual === "all" || i.cat === atual);
    $("#grid").innerHTML = lista.map((it, n) => {
      const largo = it.tipo === "youtube" || !it.vertical;
      const titulo = it.tipo === "youtube" && !it.destaque && it.titulo ? it.titulo : it.cliente;
      return `<button class="card${largo ? " card--wide" : ""}" data-n="${n}">
        <img class="card__img" src="${esc(thumb(it))}" alt="${esc(titulo)}" loading="lazy">
        <span class="card__play"></span>
        <span class="card__info"><b>${esc(titulo)}</b><span>${esc(nomeCat(it.cat))}</span></span>
      </button>`;
    }).join("");
  }

  function frame(it) {
    if (it.tipo === "youtube")
      return `<div class="modal__frame"><iframe src="https://www.youtube.com/embed/${esc(it.id)}?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="${esc(it.titulo || it.cliente)}"></iframe></div>`;
    return `<div class="modal__frame${it.vertical ? " modal__frame--v" : ""}"><video src="${esc(it.src)}" poster="${esc(it.poster)}" controls autoplay playsinline></video></div>`;
  }
  function abrir(n) {
    pos = (n + lista.length) % lista.length;
    $("#modal-body").innerHTML = frame(lista[pos]);
    $("#count").textContent = `${pos + 1} / ${lista.length}`;
    $("#modal").classList.add("is-open");
  }
  function fechar() { $("#modal").classList.remove("is-open"); $("#modal-body").innerHTML = ""; }

  $("#grid").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) abrir(+c.dataset.n); });
  $("#prev").addEventListener("click", () => abrir(pos - 1));
  $("#next").addEventListener("click", () => abrir(pos + 1));
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal" || e.target.closest(".modal__close")) fechar(); });
  document.addEventListener("keydown", (e) => {
    if (!$("#modal").classList.contains("is-open")) return;
    if (e.key === "Escape") fechar();
    if (e.key === "ArrowRight") abrir(pos + 1);
    if (e.key === "ArrowLeft") abrir(pos - 1);
  });

  render();
})();
