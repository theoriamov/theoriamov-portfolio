/* =========================================================
   PÁGINA EM INGLÊS (work.html) — vídeos extras / destaques (aparecem primeiro).
   Para adicionar um vídeo novo, copie uma linha e troque:
   - YouTube:  { tipo: "youtube", id: "ID_DO_VIDEO", titulo: "...", categoria: "..." }
               (o ID é o que vem depois de "watch?v=" ou "youtu.be/")
   - Arquivo:  { tipo: "video", src: "assets/midia/extras/arquivo.mp4", poster: "assets/midia/extras/arquivo-thumb.jpg", vertical: true, titulo: "...", categoria: "..." }
   categoria: reels | ai | business | food | youtube | documentary | motion | events
   ========================================================= */
const X = "assets/midia/extras/";
const vid = (nome, titulo, categoria, vertical = true) => ({ tipo: "video", src: `${X}${nome}.mp4`, poster: `${X}${nome}-thumb.jpg`, vertical, titulo, categoria });

const WORK_EXTRAS = [
  vid("showreel-2026", "Showreel 2026", "reels"),
  vid("is-this-real-reel", "Is this real? Talking-head reel with motion graphics", "reels"),
  vid("minotauro-energy-ad", "Minotauro Energy: AI commercial", "ai"),
  vid("megalodon-documentary", "Megalodon: documentary edit with narration and sound design", "documentary", false),
  vid("trex-documentary", "T. rex: documentary editing sample (real footage only)", "documentary", false),
  vid("five-dollar-habit", "The 5 Dollar Habit: finance documentary", "documentary", false),
  vid("minimum-payment-trap", "The Minimum Payment Trap: finance documentary", "documentary", false),
  vid("juspago-about", "Juspago: brand explainer with UI animation", "business"),
  vid("juspago-ente-devedor", "Juspago: educational video for a fintech", "business"),
  vid("ai-perfume-ad", "AI product ad: perfume", "ai", false),
  vid("ai-knight-selfie", "AI video: medieval knight selfie", "ai"),
  vid("energy-drink-3d", "Energy drink: 3D product animation (Blender)", "motion"),
  vid("watch-ui-animation", "Watch specs: UI motion graphics", "motion", false),
  { tipo: "youtube", id: "fR-1Sz2qlPI", titulo: "Nelson Piquet's garage: long-form YouTube episode", categoria: "youtube" },
  { tipo: "youtube", id: "VHMRHH2D6nQ", titulo: "YouTube video built from a script with images and B-roll", categoria: "youtube" },
];
