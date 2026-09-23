/* Monta as páginas a partir de dados.js — normalmente não é preciso mexer aqui. */

const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const whatsappUrl = () =>
  `https://wa.me/${SITE.contato.whatsapp}?text=${encodeURIComponent(SITE.contato.mensagemWhatsapp)}`;

const logoHtml = () => {
  // "tHeorIA.Mov" -> destaca as maiúsculas antes do ponto (o H e o IA)
  const [a, ...resto] = SITE.marca.split(".");
  const nome = esc(a).replace(/[A-Z]+/g, (m) => `<span>${m}</span>`);
  const texto = resto.length ? `${nome}.${esc(resto.join("."))}` : nome;
  return `<img class="logo__img" src="assets/img/logo.png" alt=""><span class="logo__txt">${texto}</span>`;
};

const ICON_IG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.8a1.4 1.4 0 100 2.9 1.4 1.4 0 000-2.9z"/></svg>`;
const ICON_WPP = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M.1 24l1.7-6.2A11.9 11.9 0 0112 0a11.9 11.9 0 0110.1 18.2A11.9 11.9 0 016.2 22.3L.1 24zm6.6-3.8a9.9 9.9 0 0015.2-8.3A9.9 9.9 0 102.9 17.1l-1 3.7 3.8-1zm11.4-5.5c-.1-.2-.5-.3-1-.6s-1.7-.8-2-.9-.5-.1-.7.2-.8.9-.9 1.1-.4.2-.7.1a8.1 8.1 0 01-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 00-.8.4 3.4 3.4 0 00-1 2.5 5.9 5.9 0 001.2 3.1 13.5 13.5 0 005.2 4.6c1.9.8 2.7.9 3.6.7a3.1 3.1 0 002-1.4 2.5 2.5 0 00.2-1.4z"/></svg>`;
const ICON_PLAY = `<svg viewBox="0 0 24 24"><path d="M6 4l15 8-15 8z"/></svg>`;

/* ---------- Textos editáveis (modo de edição) ----------
   Um texto marcado com data-editar="caminho" (ex.: "porque.contexto") vira editável no seu computador.
   O que você escreve fica em textos.js e vale por cima do dados.js. Texto apagado some do site. */
const ed = (caminho) => ` data-editar="${caminho}"`;
// **palavra** = destaque (vermelho e negrito)
const fmt = (texto) => esc(texto).replace(/\*\*(.+?)\*\*/g, "<strong class=\"destaque\">$1</strong>");
const lerCaminho = (caminho) => caminho.split(".").reduce((o, p) => (o == null ? o : o[p]), SITE);

// Grava um valor em SITE seguindo o caminho (ex.: "entregas.1.texto")
function gravarCaminho(caminho, valor) {
  const partes = caminho.split(".");
  let alvo = SITE;
  for (const p of partes.slice(0, -1)) {
    if (alvo[p] === undefined) alvo[p] = {};
    alvo = alvo[p];
  }
  alvo[partes.at(-1)] = valor;
}

function aplicarTextos() {
  if (typeof TEXTOS === "undefined") return;
  for (const [caminho, valor] of Object.entries(TEXTOS)) gravarCaminho(caminho, valor);
}

function ativarEdicaoTextos() {
  if (!EDITAR) return;
  const editados = typeof TEXTOS === "undefined" ? {} : { ...TEXTOS };
  document.querySelectorAll("[data-editar]").forEach((el) => {
    el.contentEditable = "plaintext-only";
    el.spellcheck = true;
    el.title = "Clique para editar (Enter quebra a linha; **palavra** destaca)";
    // Ao editar, mostra o texto cru (com os **), ao sair volta a mostrar formatado
    el.addEventListener("focus", () => { el.textContent = lerCaminho(el.dataset.editar) ?? ""; });
    el.addEventListener("blur", () => {
      const valor = el.innerText.replace(/\n{3,}/g, "\n\n").trim();
      el.innerHTML = fmt(valor);
      if ((lerCaminho(el.dataset.editar) ?? "") === valor) return;
      editados[el.dataset.editar] = valor;
      gravarCaminho(el.dataset.editar, valor);
      fetch("/api/textos", { method: "POST", body: JSON.stringify(editados) })
        .then(() => { el.classList.add("is-salvo"); setTimeout(() => el.classList.remove("is-salvo"), 900); })
        .catch(() => alert("Não consegui salvar. Abra o site pelo ABRIR PORTFOLIO.bat."));
    });
  });
  // Texto editável dentro de link (cards, "Descubra como"): clicar edita em vez de abrir
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-editar]") && e.target.closest("a")) e.preventDefault();
  }, true);
}

/* "https://www.instagram.com/theoria.mov/" -> "@theoria.mov" */
const arroba = (url) => "@" + url.replace(/\/+$/, "").split("/").pop();

/* ---------- Partes comuns ---------- */
function renderHeader(atual) {
  const el = $("#header");
  if (!el) return;
  const links = [
    ...CATEGORIAS.map((c) => ({ href: `trabalhos.html?cat=${c.id}`, nome: c.nome, id: c.id })),
    { href: "sobre.html", nome: "Sobre", id: "sobre" },
    { href: whatsappUrl(), nome: "Contato", id: "contato", externo: true },
  ];
  el.innerHTML = `
    <nav class="nav" aria-label="Principal">
      ${links.map((l) => `<a href="${esc(l.href)}" ${l.externo ? 'target="_blank" rel="noopener"' : ""} ${l.id === atual ? 'aria-current="page"' : ""}>${esc(l.nome)}</a>`).join("")}
    </nav>
    <a href="index.html" class="logo">${logoHtml()}</a>
    <div class="header__right">
      <a class="icon-link" href="${esc(SITE.contato.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${ICON_IG}</a>
      <a class="icon-link" href="${esc(whatsappUrl())}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON_WPP}</a>
    </div>`;
}

function renderFooter() {
  const el = $("#footer");
  if (!el) return;
  el.innerHTML = `
    <section class="cta">
      <h2 class="cta__title">Bora criar <em>juntos?</em></h2>
      <a class="pill pill--accent" href="${esc(whatsappUrl())}" target="_blank" rel="noopener">Crie com a ${esc(SITE.marca)}</a>
    </section>
    <footer class="footer">
      <span>© ${new Date().getFullYear()} ${esc(SITE.marca)} — ${esc(SITE.rodape)}</span>
      <span class="footer__contatos">
        <a href="${esc(whatsappUrl())}" target="_blank" rel="noopener">${esc(SITE.contato.botaoContato || "Fale com a gente")}</a>
        ${SITE.contato.instagram ? `<a href="${esc(SITE.contato.instagram)}" target="_blank" rel="noopener">${esc(arroba(SITE.contato.instagram))}</a>` : ""}
        ${SITE.contato.instagramPessoal ? `<a href="${esc(SITE.contato.instagramPessoal)}" target="_blank" rel="noopener">${esc(arroba(SITE.contato.instagramPessoal))}</a>` : ""}
        ${SITE.contato.email ? `<a href="mailto:${esc(SITE.contato.email)}">${esc(SITE.contato.email)}</a>` : ""}
      </span>
    </footer>`;
}

/* ---------- Home ---------- */
function renderHome() {
  document.title = SITE.marca;
  $("#logo").innerHTML = logoHtml();
  $("#title").innerHTML = fmt(SITE.titulo);
  $("#title").dataset.editar = "titulo";
  $("#sub").innerHTML = fmt(SITE.subtitulo);
  $("#sub").dataset.editar = "subtitulo";
  $("#servicos").innerHTML = fmt(SITE.servicosLinha || "");
  $("#servicos").dataset.editar = "servicosLinha";
  $("#gancho").innerHTML = `<span${ed("gancho")}>${fmt(SITE.gancho || "Descubra")}</span> <span aria-hidden="true">↓</span>`;
  $("#ig").href = SITE.contato.instagram;
  $("#cta").href = whatsappUrl();
  $("#cta").textContent = `Crie com a ${SITE.marca}`;

  renderFlutuantes();

  const p = SITE.porque;
  if (p) $("#porque").innerHTML = `
    <div class="porque__inner">
      <p class="porque__rotulo reveal"><span>Por que ${esc(SITE.marca.split(".")[0])}?</span></p>
      <p class="porque__grego reveal" lang="el"${ed("porque.grego")}>${fmt(p.grego)}</p>
      <p class="porque__palavra reveal"><span${ed("porque.palavra")}>${fmt(p.palavra)}</span> (grego)</p>
      <p class="porque__significado reveal"${ed("porque.significado")}>${fmt(p.significado)}</p>
      <p class="porque__contexto reveal"${ed("porque.contexto")}>${fmt(p.contexto)}</p>
      <blockquote class="porque__citacao reveal"${ed("porque.citacao")}>${fmt(p.citacao)}</blockquote>
      <p class="porque__fechamento reveal"${ed("porque.fechamento")}>${fmt(p.fechamento)}</p>
      ${p.nome || EDITAR ? `<p class="porque__nome reveal"${ed("porque.nome")}>${fmt(p.nome)}</p>` : ""}
    </div>`;

  $("#entregas").innerHTML = (SITE.entregas || []).map((e, i) => {
    const cat = CATEGORIAS.find((c) => c.id === e.categoria);
    return `
      <a class="entrega reveal" href="trabalhos.html?cat=${esc(e.categoria)}">
        <span class="entrega__cat">${esc(cat ? cat.nome : e.categoria)}</span>
        <strong class="entrega__palavra"${ed(`entregas.${i}.palavra`)}>${fmt(e.palavra)}</strong>
        <span class="entrega__texto"${ed(`entregas.${i}.texto`)}>${fmt(e.texto)}</span>
        <span class="entrega__ver">Ver trabalhos →</span>
      </a>`;
  }).join("");
  $("#quem").innerHTML = SITE.sobre.texto.map((t, i) => `<p class="reveal"${ed(`sobre.texto.${i}`)}>${fmt(t)}</p>`).join("") +
    `<a class="pill pill--ghost reveal" href="sobre.html">Saiba mais</a>`;
  observarReveal();

  const video = $("#bgvideo");
  if (SITE.videoFundo) {
    if (SITE.posterFundo) video.poster = SITE.posterFundo;
    video.src = SITE.videoFundo;
    video.addEventListener("error", () => video.remove());
    video.play().catch(() => {});
  } else {
    video.remove();
  }
}

/* Botões flutuantes da home. Posição = centro do botão, em % da tela.
   No modo de edição (localhost) dá para arrastar; salva em posicoes.js. */
const POSICOES_PADRAO = [[20, 30], [42, 20], [80, 28], [85, 64], [15, 66], [64, 16], [50, 84], [30, 84]];

function renderFlutuantes() {
  const box = $("#floaters");
  const salvas = typeof POSICOES === "undefined" ? {} : { ...POSICOES };
  box.innerHTML = CATEGORIAS.map((c, i) => {
    const [x, y] = salvas[c.id] || POSICOES_PADRAO[i % POSICOES_PADRAO.length];
    return `<a class="floater pill pill--light" data-id="${c.id}" href="trabalhos.html?cat=${c.id}"
      style="left:${x}%;top:${y}%;animation-delay:${-i * 1.3}s">${esc(c.nome)}</a>`;
  }).join("");
  if (!EDITAR) return;

  box.classList.add("floaters--editar");
  const aviso = document.createElement("div");
  aviso.className = "aviso-edicao";
  aviso.innerHTML = `<strong>Modo edição</strong> — só você vê isto. Arraste os botões das categorias para onde quiser. Clique em qualquer texto para editar (Enter quebra a linha; apague tudo para sumir). Tudo é salvo sozinho.
    <button class="aviso-edicao__fechar" aria-label="Fechar aviso">✕</button>`;
  aviso.querySelector("button").onclick = () => aviso.remove();
  document.body.append(aviso);

  // Desliga o "arrastar link" do navegador (soltar um link na página abria a categoria)
  box.querySelectorAll(".floater").forEach((el) => el.setAttribute("draggable", "false"));
  box.addEventListener("dragstart", (e) => e.preventDefault());

  // Segurar o botão esquerdo e arrastar = mover. Clicar sem arrastar = abrir a categoria.
  let arrastando = null, moveu = false, inicio = null;
  box.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".floater");
    if (!el || e.button !== 0 || matchMedia("(max-width: 700px)").matches) return;
    e.preventDefault();
    const r = el.getBoundingClientRect();
    arrastando = el; moveu = false;
    // distância entre o mouse e o centro do botão, para ele não "pular" para o cursor
    inicio = { x: e.clientX, y: e.clientY, dx: e.clientX - (r.left + r.width / 2), dy: e.clientY - (r.top + r.height / 2) };
    el.setPointerCapture(e.pointerId);
  });
  box.addEventListener("pointermove", (e) => {
    if (!arrastando) return;
    if (!moveu && Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) < 5) return; // tremidinha = clique
    if (!moveu) {
      // enquanto arrasta, deixa de ser link — assim soltar nunca abre a categoria
      inicio.href = arrastando.getAttribute("href");
      arrastando.removeAttribute("href");
    }
    moveu = true;
    arrastando.classList.add("is-arrastando");
    const r = box.getBoundingClientRect();
    const x = Math.min(98, Math.max(2, ((e.clientX - inicio.dx - r.left) / r.width) * 100));
    const y = Math.min(96, Math.max(4, ((e.clientY - inicio.dy - r.top) / r.height) * 100));
    arrastando.style.left = `${x.toFixed(1)}%`;
    arrastando.style.top = `${y.toFixed(1)}%`;
  });
  const soltar = () => {
    if (!arrastando) return;
    arrastando.classList.remove("is-arrastando");
    if (moveu) {
      const el = arrastando, href = inicio.href;
      setTimeout(() => el.setAttribute("href", href), 300); // volta a ser link depois de soltar
      salvas[arrastando.dataset.id] = [parseFloat(arrastando.style.left), parseFloat(arrastando.style.top)];
      fetch("/api/posicoes", { method: "POST", body: JSON.stringify(salvas) })
        .catch(() => alert("Não consegui salvar. Abra o site pelo ABRIR PORTFOLIO.bat."));
    }
    arrastando = null;
  };
  box.addEventListener("pointerup", soltar);
  box.addEventListener("pointercancel", soltar);
  // Se arrastou, não abre o link
  box.addEventListener("click", (e) => { if (moveu) { e.preventDefault(); moveu = false; } });
}

/* ---------- Trabalhos ---------- */
function miniatura(it) {
  if (it.tipo === "video") return it.poster;
  if (it.tipo === "youtube") return `https://img.youtube.com/vi/${it.id}/hqdefault.jpg`;
  return it.src;
}

const ICON_YT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>`;

/* Links das redes do cliente (vêm do info.txt: instagram:, canal:, tiktok:, site:) */
function redesHtml(redes) {
  if (!redes) return "";
  const rotulos = { instagram: [ICON_IG, "Instagram"], canal: [ICON_YT, "YouTube"], tiktok: ["", "TikTok"], site: ["", "Site"] };
  return Object.entries(redes)
    .filter(([k]) => rotulos[k])
    .map(([k, url]) => `<a class="rede" href="${esc(url)}" target="_blank" rel="noopener">${rotulos[k][0]}${rotulos[k][1]}</a>`)
    .join("");
}

/* Modo de edição: só no seu computador (localhost). No site publicado não aparece. */
const EDITAR = ["localhost", "127.0.0.1"].includes(location.hostname);
const ocultos = new Set(typeof OCULTOS === "undefined" ? [] : OCULTOS);
const chave = (it) => (it.tipo === "youtube" ? `yt:${it.id}` : it.src);

function salvarOcultos() {
  fetch("/api/ocultos", { method: "POST", body: JSON.stringify([...ocultos]) })
    .catch(() => alert("Não consegui salvar. Abra o site pelo ABRIR PORTFOLIO.bat."));
}

function cardHtml(v, i) {
  const it = v.item;
  const oculto = ocultos.has(chave(it));
  return `
    <button class="card reveal ${it.vertical ? "card--vertical" : ""} ${oculto ? "card--oculto" : ""}" data-i="${i}" ${it.tipo === "video" ? `data-preview="${esc(it.src)}"` : ""} aria-label="${esc(v.cliente)} — vídeo ${i + 1}">
      <img class="card__media" src="${esc(miniatura(it))}" alt="" loading="lazy">
      ${it.tipo !== "foto" ? `<span class="card__play">${ICON_PLAY}</span>` : ""}
      <span class="card__tag">${esc(v.cliente)}</span>
      ${EDITAR ? `<span class="card__x" role="button" data-x="${i}" title="${oculto ? "Mostrar de novo" : "Esconder: não fui eu que fiz"}">${oculto ? "↺" : "✕"}</span>` : ""}
    </button>`;
}

function placeholderBg(i) {
  const hues = [18, 250, 160, 330, 40, 200];
  const h = hues[i % hues.length];
  return `radial-gradient(80% 90% at ${20 + (i * 17) % 60}% 30%, hsl(${h} 70% 38%), #16161a 80%)`;
}

/* Prévia do vídeo ao passar o mouse no card */
function ativarPrevia(grid) {
  if (!matchMedia("(hover: hover)").matches) return;
  grid.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".card[data-preview]");
    if (!card || card.querySelector("video")) return;
    const v = document.createElement("video");
    Object.assign(v, { src: card.dataset.preview, muted: true, loop: true, playsInline: true, className: "card__media" });
    card.insertBefore(v, card.querySelector(".card__play"));
    v.play().catch(() => {});
    card.addEventListener("mouseleave", () => v.remove(), { once: true });
  });
}

function renderTrabalhos() {
  const params = new URLSearchParams(location.search);
  let cat = params.get("cat");
  if (!CATEGORIAS.some((c) => c.id === cat)) cat = CATEGORIAS[0].id;
  let cliente = "";

  const tabs = $("#tabs");
  const grid = $("#grid");
  const title = $("#page-title");
  const filtro = document.createElement("div");
  filtro.className = "filtro";
  grid.before(filtro);
  const avisoEdicao = document.createElement("div");
  if (EDITAR) {
    avisoEdicao.className = "aviso-edicao";
    document.body.append(avisoEdicao);
  }

  const todos = typeof PROJETOS === "undefined" ? [] : PROJETOS;
  let videos = [];

  function desenhar() {
    const doCat = todos.filter((p) => p.categoria === cat);
    const lista = doCat
      .flatMap((p) => p.itens.map((item) => ({ cliente: p.titulo, ano: p.ano, redes: p.redes, item })))
      .filter((v) => EDITAR || !ocultos.has(chave(v.item)));
    videos = cliente ? lista.filter((v) => v.cliente === cliente) : lista;
    const visiveis = (arr) => arr.filter((v) => !ocultos.has(chave(v.item))).length;

    filtro.innerHTML = doCat.length > 1
      ? [`<button data-cli="" aria-pressed="${!cliente}">Todos <small>${visiveis(lista)}</small></button>`,
         ...doCat.map((p) => `<button data-cli="${esc(p.titulo)}" aria-pressed="${cliente === p.titulo}">${esc(p.titulo)} <small>${visiveis(lista.filter((v) => v.cliente === p.titulo))}</small></button>`)].join("")
      : "";
    // Redes do cliente (quando um cliente está selecionado, ou a categoria só tem um)
    const sel = doCat.find((p) => p.titulo === cliente) || (doCat.length === 1 ? doCat[0] : null);
    if (sel && redesHtml(sel.redes)) filtro.insertAdjacentHTML("beforeend", `<span class="filtro__redes">${redesHtml(sel.redes)}</span>`);
    if (EDITAR) {
      const n = lista.length - visiveis(lista);
      avisoEdicao.innerHTML = `<strong>Modo edição</strong> — só você vê isto. Clique no ✕ para esconder vídeos que não são seus${n ? ` · <b>${n}</b> escondido${n > 1 ? "s" : ""} nesta categoria (clique no ↺ para mostrar de novo)` : ""}.`;
    }
    grid.innerHTML = videos.length ? videos.map(cardHtml).join("") : `<p style="color:var(--muted)">Em breve.</p>`;
    observarReveal();
  }

  function mostrar(id, pushState) {
    cat = id;
    cliente = "";
    const categoria = CATEGORIAS.find((c) => c.id === id);
    title.textContent = categoria.nome;
    document.title = `${categoria.nome} — ${SITE.marca}`;
    renderHeader(id);
    tabs.querySelectorAll(".pill").forEach((b) => b.setAttribute("aria-selected", b.dataset.cat === id));
    desenhar();
    if (pushState) history.pushState({ cat: id }, "", `?cat=${id}`);
  }

  tabs.innerHTML = CATEGORIAS
    .map((c) => `<button class="pill" role="tab" data-cat="${c.id}">${esc(c.nome)}</button>`)
    .join("");
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (b && b.dataset.cat !== cat) mostrar(b.dataset.cat, true);
  });
  filtro.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cli]");
    if (b) { cliente = b.dataset.cli; desenhar(); }
  });
  window.addEventListener("popstate", () => {
    const c = new URLSearchParams(location.search).get("cat");
    mostrar(CATEGORIAS.some((x) => x.id === c) ? c : CATEGORIAS[0].id, false);
  });

  grid.addEventListener("click", (e) => {
    const x = e.target.closest("[data-x]");
    if (x) {
      const k = chave(videos[Number(x.dataset.x)].item);
      ocultos.has(k) ? ocultos.delete(k) : ocultos.add(k);
      salvarOcultos();
      desenhar();
      return;
    }
    const card = e.target.closest(".card");
    if (card) abrirModal(videos, Number(card.dataset.i));
  });
  ativarPrevia(grid);

  mostrar(cat, false);
}

/* ---------- Modal (player com anterior/próximo) ---------- */
function midiaHtml(it, titulo) {
  const vert = it.vertical ? "modal__frame--vertical" : "";
  if (it.tipo === "video")
    return `<div class="modal__frame ${vert}"><video src="${esc(it.src)}" poster="${esc(it.poster)}" controls autoplay playsinline></video></div>`;
  if (it.tipo === "youtube")
    return `<div class="modal__frame"><iframe src="https://www.youtube.com/embed/${esc(it.id)}?autoplay=1&rel=0&playsinline=1&origin=${encodeURIComponent(location.origin)}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="${esc(titulo)}"></iframe></div>`;
  return `<img class="modal__photo" src="${esc(it.src)}" alt="${esc(titulo)}">`;
}

let navegarModal = null;

function abrirModal(lista, inicio) {
  const modal = $("#modal");
  const body = $("#modal-body");
  let atual = inicio;

  const mostrar = (i) => {
    atual = (i + lista.length) % lista.length;
    const v = lista[atual];
    body.innerHTML = `
      ${midiaHtml(v.item, v.cliente)}
      <div class="modal__caption">
        <span class="modal__cliente"><strong class="card__title">${esc(v.cliente)}</strong>${redesHtml(v.redes)}${v.item.titulo ? `<span class="modal__titulo">${esc(v.item.titulo)}</span>` : ""}${v.item.tipo === "youtube" ? `<a class="rede" href="https://www.youtube.com/watch?v=${esc(v.item.id)}" target="_blank" rel="noopener">${ICON_YT}Assistir no YouTube ↗</a>` : ""}</span>
        <span class="modal__nav">
          <button data-nav="-1" aria-label="Anterior">&larr;</button>
          <span class="card__year">${atual + 1} / ${lista.length}</span>
          <button data-nav="1" aria-label="Próximo">&rarr;</button>
        </span>
      </div>`;
  };
  body.onclick = (e) => {
    const b = e.target.closest("[data-nav]");
    if (b) mostrar(atual + Number(b.dataset.nav));
  };
  navegarModal = (passo) => mostrar(atual + passo);
  mostrar(inicio);

  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
  $(".modal__close", modal).focus();
}

function fecharModal() {
  const modal = $("#modal");
  if (!modal || !modal.classList.contains("is-open")) return;
  modal.classList.remove("is-open");
  $("#modal-body").innerHTML = ""; // para o vídeo
  navegarModal = null;
  document.body.style.overflow = "";
}

/* ---------- Sobre ---------- */
function renderSobre() {
  document.title = `Sobre — ${SITE.marca}`;
  renderHeader("sobre");
  const s = SITE.sobre;
  $("#about-text").innerHTML = s.texto.map((t, i) => `<p${ed(`sobre.texto.${i}`)}>${fmt(t)}</p>`).join("");
  $("#about-services").innerHTML = s.servicos.map((t) => `<li>${esc(t)}</li>`).join("");
  $("#about-photo").innerHTML = s.foto
    ? `<img src="${esc(s.foto)}" alt="Equipe ${esc(SITE.marca)}">`
    : `<div class="card__placeholder" style="height:100%;background:${placeholderBg(0)}"><span>Sua foto aqui</span></div>`;
  $("#about-wpp").href = whatsappUrl();
  $("#about-wpp").innerHTML = `${ICON_WPP} ${esc(SITE.contato.botaoContato || "Fale com a gente")}`;
  $("#about-ig").href = SITE.contato.instagram;
  $("#about-ig").innerHTML = `${ICON_IG} ${esc(arroba(SITE.contato.instagram))}`;
  const pessoal = $("#about-ig-pessoal");
  if (pessoal && SITE.contato.instagramPessoal) {
    pessoal.href = SITE.contato.instagramPessoal;
    pessoal.innerHTML = `${ICON_IG} ${esc(arroba(SITE.contato.instagramPessoal))}`;
  } else if (pessoal) pessoal.remove();
}

/* ---------- Animação de entrada ---------- */
let observer;
function observarReveal() {
  const els = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("is-visible"));
  observer ??= new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); observer.unobserve(en.target); }
    });
  }, { threshold: 0.1 });
  els.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; observer.observe(el); });
}

/* ---------- Início ---------- */
document.addEventListener("DOMContentLoaded", () => {
  aplicarTextos();
  const pagina = document.body.dataset.page;
  if (pagina === "home") renderHome();
  if (pagina === "trabalhos") renderTrabalhos();
  if (pagina === "sobre") renderSobre();
  renderFooter();
  ativarEdicaoTextos();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharModal();
    if (navegarModal && e.key === "ArrowRight") navegarModal(1);
    if (navegarModal && e.key === "ArrowLeft") navegarModal(-1);
  });
  const modal = $("#modal");
  if (modal) modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest(".modal__close")) fecharModal();
  });
});
