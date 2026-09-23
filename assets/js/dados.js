/* =========================================================
   EDITE AQUI — todo o conteúdo do site sai deste arquivo.
   ========================================================= */

const SITE = {
  marca: "tHeorIA.Mov",
  titulo: "Histórias que se movem",           // frase grande da home
  // Texto da abertura, embaixo do título
  // **palavra** = destaque em vermelho
  subtitulo: "Somos a **tHeorIA.Mov**. Theoria com H, do grego **θεωρία**: olhar, contemplar, espetáculo — a palavra que Lucas 23 usa para a multidão que viu e não voltou igual. Mas também o **H** do humano e a **IA** da tecnologia, em movimento.",
  // Linha de baixo: o que fazemos
  servicosLinha: "Vídeos para empresas, eventos e gastronomia — e produções feitas por inteligência artificial.",
  gancho: "Descubra como",                          // chamada que leva para "O que entregamos"
  rodape: "Vídeo e IA em movimento.",

  // Vídeo de fundo da home (deixe "" para usar o fundo animado)
  videoFundo: "assets/video/hero.mp4",
  posterFundo: "",                             // imagem mostrada enquanto o vídeo carrega

  contato: {
    whatsapp: "5561998344441",                 // (61) 99834-4441 — só números, com DDI + DDD
    botaoContato: "Fale com a gente",          // texto do botão de WhatsApp (o número não aparece escrito no site)
    // Mensagem que já vem escrita quando a pessoa clica no WhatsApp pelo site
    mensagemWhatsapp: "Olá! Vim pelo site, vi o trabalho de vocês e gostaria de conhecer mais.",
    instagram: "https://www.instagram.com/theoria.mov/",
    instagramPessoal: "https://www.instagram.com/pedrinhopfilms/",
    email: "",                                 // deixe "" para não mostrar
  },

  sobre: {
    texto: [
      "Somos uma produtora audiovisual com um foco claro: mostrar o real valor de cada cliente e de cada profissional. Trabalhamos perto de quem contrata, do primeiro alinhamento à entrega final — e acreditamos que até os stories fazem diferença.",
      "Atendemos empresas, eventos, gastronomia, canais de YouTube e figuras públicas, cada um com o seu jeito, sem fórmula pronta: vitrine para quem precisa ser bem representado, desejo para quem vende sabor, verdade para quem realiza eventos e praticidade, com IA, para quem precisa de agilidade.",
      "Aqui você fala direto com quem cria, sem intermediário — sempre de olho no resultado de quem confia no nosso trabalho.",
    ],
    servicos: ["Vídeos empresariais", "Cobertura de eventos", "Vídeos gastronômicos", "YouTube", "Influencers", "Vídeos com IA", "Stories"],
    foto: "assets/img/sobre.jpg",              // foto da página "Sobre nós"
  },

  // "Por que tHeorIA?" — aparece logo abaixo da abertura
  porque: {
    grego: "θεωρία",
    palavra: "theoria",
    significado: "Olhar, contemplar, espetáculo.",
    contexto: "Em Lucas 23, a Bíblia narra a crucificação de Jesus. A multidão que estava ali não apenas assistiu: contemplou algo tão grandioso que ninguém voltou para casa do mesmo jeito. No versículo 48, é exatamente essa palavra que aparece:",
    citacao: "“…toda a multidão que se ajuntara para aquele espetáculo, vendo o que havia acontecido, voltou batendo no peito.”",
    fechamento: "Quem olhou com atenção foi transformado. É isso que acontece quando contemplamos algo excelente, algo belo. E é isso que buscamos em cada vídeo: fazer as pessoas pararem, olharem com atenção e serem impactadas.",
  },

  // "O que entregamos" — aparece na tela principal, logo abaixo da abertura.
  // categoria = id da categoria (o card leva para ela)
  entregas: [
    { categoria: "empresarial",  palavra: "Vitrine",      texto: "Profissionais e empresas mais bem representados.", fundo: "assets/img/entregas/vitrine.jpg", posicao: "center 62%" },
    { categoria: "gastronomico", palavra: "Desejo",       texto: "Vídeos que despertam a vontade de estar ali.", fundo: "assets/img/entregas/desejo.jpg" },
    { categoria: "eventos",      palavra: "Verdade",      texto: "Mostramos o que realmente rolou no dia.", fundo: "assets/img/entregas/verdade.jpg" },
    { categoria: "video-com-ia", palavra: "Praticidade",  texto: "Vídeos criados com IA, sem precisar de uma produção cinematográfica.", fundo: "assets/img/entregas/praticidade.jpg" },
  ],
};

/* Categorias — o "id" é o nome da pasta em midia/ sem acentos, minúsculo e com hífens.
   Ex.: pasta "Vídeo com IA" -> id "video-com-ia" */
const CATEGORIAS = [
  { id: "empresarial",  nome: "Empresarial" },
  { id: "eventos",      nome: "Eventos" },
  { id: "gastronomico", nome: "Gastronômico" },
  { id: "youtube",      nome: "YouTube" },
  { id: "influencers",  nome: "Figura pública" },
  { id: "video-com-ia", nome: "Vídeo com IA" },
];

/* Os projetos (clientes) são gerados automaticamente em assets/js/projetos.js
   pelo atualizar.py, a partir da pasta midia/. */
