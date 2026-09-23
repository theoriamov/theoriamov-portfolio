"""
Servidor local do portfólio, com modo de edição.

Abra http://localhost:5173 — no seu computador:
- cada vídeo ganha um botão X para esconder o que não foi você que fez (salvo em assets/js/ocultos.js)
- na home, os botões das categorias podem ser arrastados (salvo em assets/js/posicoes.js)
- os textos da home e do "Sobre" podem ser editados clicando neles (salvo em assets/js/textos.js)
"""

import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
PORTA = 5173

# nome na URL -> (arquivo, nome da constante, comentário, tipo esperado)
ARQUIVOS = {
    "ocultos": ("ocultos.js", "OCULTOS", "Vídeos escondidos pelo botão X do modo de edição.", list),
    "posicoes": ("posicoes.js", "POSICOES", "Posição dos botões da home (em % da tela), arrastados no modo de edição.", dict),
    "textos": ("textos.js", "TEXTOS", "Textos editados direto na página (modo de edição). Valem por cima do dados.js.", dict),
}


def salvar(nome, dados):
    arquivo, const, comentario, _ = ARQUIVOS[nome]
    if isinstance(dados, list):
        dados = sorted(set(dados))
    (RAIZ / "assets" / "js" / arquivo).write_text(
        f"/* {comentario} */\nconst {const} = {json.dumps(dados, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")  # sempre mostra a versão mais nova
        super().end_headers()

    def do_POST(self):
        nome = self.path.removeprefix("/api/")
        if nome not in ARQUIVOS:
            self.send_error(404)
            return
        tamanho = int(self.headers.get("Content-Length", 0))
        try:
            dados = json.loads(self.rfile.read(tamanho) or b"null")
            assert isinstance(dados, ARQUIVOS[nome][3])
        except (ValueError, AssertionError):
            self.send_error(400)
            return
        salvar(nome, dados)
        self.send_response(204)
        self.end_headers()


if __name__ == "__main__":
    for nome, (arquivo, _, _, tipo) in ARQUIVOS.items():
        if not (RAIZ / "assets" / "js" / arquivo).exists():
            salvar(nome, tipo())
    print(f"Portfólio em http://localhost:{PORTA}  (Ctrl+C para parar)")
    ThreadingHTTPServer(("127.0.0.1", PORTA), partial(Handler, directory=str(RAIZ))).serve_forever()
