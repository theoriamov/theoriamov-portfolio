"""
Servidor local do portfólio, com modo de edição.

Abra http://localhost:5173 — no seu computador:
- cada vídeo ganha um botão X para esconder o que não foi você que fez (salvo em assets/js/ocultos.js)
- na home, os botões das categorias podem ser arrastados (salvo em assets/js/posicoes.js)
- os textos da home e do "Sobre" podem ser editados clicando neles (salvo em assets/js/textos.js)
"""

import json
import os
import shutil
import subprocess
import sys
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
    "rotacoes": ("rotacoes.js", "ROTACOES", "Ângulo (graus) de cada botão da home, ajustado no modo de edição.", dict),
    "fotos": ("fotos.js", "FOTOS", "Enquadramento das fotos de fundo dos cards (x, y em % e zoom), ajustado no modo de edição.", dict),
}


def salvar(nome, dados):
    arquivo, const, comentario, _ = ARQUIVOS[nome]
    if isinstance(dados, list):
        dados = sorted(set(dados))
    (RAIZ / "assets" / "js" / arquivo).write_text(
        f"/* {comentario} */\nconst {const} = {json.dumps(dados, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )


def mover(dados):
    """Arrastar um vídeo para outro card: move o arquivo original em midia/ (e o já convertido,
    para não converter de novo) e roda o atualizar.py. Devolve uma mensagem de erro ou None."""
    from atualizar import ENTRADA, SAIDA, ler_info, slug

    src, cat, titulo = dados.get("src", ""), dados.get("categoria", ""), dados.get("cliente", "")
    origem = destino = None
    for pasta_cat in (p for p in ENTRADA.iterdir() if p.is_dir()):
        for pasta_cli in (p for p in pasta_cat.iterdir() if p.is_dir()):
            if slug(pasta_cat.name) == cat and ler_info(pasta_cli).get("titulo", pasta_cli.name) == titulo:
                destino = pasta_cli
            base = f"assets/midia/{slug(pasta_cat.name)}/{slug(pasta_cli.name)}/"
            for arq in pasta_cli.iterdir():
                if src.startswith("yt:"):
                    if arq.name.lower() == "info.txt" and src[3:] in arq.read_text(encoding="utf-8-sig"):
                        origem = arq
                elif arq.is_file() and src.startswith(base) and Path(src).stem == slug(arq.stem):
                    origem = arq
    if not origem or not destino:
        return "Não achei o arquivo ou o card de destino."
    if origem.parent == destino:
        return None
    if src.startswith("yt:"):   # vídeo do YouTube: passa a linha "youtube:" de um info.txt para o outro
        linhas = origem.read_text(encoding="utf-8-sig").splitlines()
        mover_linhas = [l for l in linhas if l.lower().startswith("youtube:") and src[3:] in l]
        origem.write_text("\n".join(l for l in linhas if l not in mover_linhas) + "\n", encoding="utf-8")
        info = destino / "info.txt"
        antes = info.read_text(encoding="utf-8-sig").rstrip("\n") + "\n" if info.exists() else ""
        info.write_text(antes + "\n".join(mover_linhas) + "\n", encoding="utf-8")
        subprocess.run([sys.executable, str(RAIZ / "atualizar.py")], cwd=RAIZ, capture_output=True,
                       env={**os.environ, "PYTHONIOENCODING": "utf-8"})
        return None
    if (destino / origem.name).exists():
        return f"Já existe um arquivo chamado {origem.name} nesse card."

    pasta_nova = SAIDA / slug(destino.parent.name) / slug(destino.name)
    pasta_nova.mkdir(parents=True, exist_ok=True)
    convertido = RAIZ / src
    for f in (convertido, convertido.with_name(convertido.stem + "-thumb.jpg")):
        if f.exists():
            shutil.move(f, pasta_nova / f.name)   # mantém a data: o atualizar.py não converte de novo
    shutil.move(origem, destino / origem.name)
    subprocess.run([sys.executable, str(RAIZ / "atualizar.py")], cwd=RAIZ, capture_output=True,
                   env={**os.environ, "PYTHONIOENCODING": "utf-8"})
    return None


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")  # sempre mostra a versão mais nova
        super().end_headers()

    def do_POST(self):
        nome = self.path.removeprefix("/api/")
        if nome == "mover":
            tamanho = int(self.headers.get("Content-Length", 0))
            try:
                erro = mover(json.loads(self.rfile.read(tamanho) or b"{}"))
            except (ValueError, OSError) as e:
                erro = f"Não consegui mover: {e}"
            self.send_response(400 if erro else 204)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            if erro:
                self.wfile.write(erro.encode("utf-8"))
            return
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
