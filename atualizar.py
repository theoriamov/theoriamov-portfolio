"""
Lê a pasta midia/<Categoria>/<Cliente>/ e monta o portfólio.

- Converte os vídeos para MP4 leve (H.264, até 1080p) em assets/midia/
- Gera uma capa (thumbnail) de cada vídeo
- Reduz as fotos para no máximo 2000px
- Escreve assets/js/projetos.js (a lista que o site lê)

Rode de novo sempre que adicionar ou remover arquivos. O que já foi convertido é pulado.
"""

import json
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
ENTRADA = RAIZ / "midia"
SAIDA = RAIZ / "assets" / "midia"
JS = RAIZ / "assets" / "js" / "projetos.js"

VIDEOS = {".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"}
FOTOS = {".jpg", ".jpeg", ".png", ".webp"}


def slug(texto):
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-") or "item"


def ffmpeg(*args):
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], capture_output=True, text=True)
    if r.returncode != 0:
        print("    ! erro no ffmpeg:", r.stderr.strip().splitlines()[-1:] or r.stderr)
    return r.returncode == 0


def dimensoes(arquivo):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
         "-of", "json", str(arquivo)],
        capture_output=True, text=True,
    )
    try:
        s = json.loads(r.stdout)["streams"][0]
        return s["width"], s["height"]
    except (KeyError, IndexError, ValueError):
        return 16, 9


def atualizado(origem, destino):
    return destino.exists() and destino.stat().st_mtime >= origem.stat().st_mtime


def ler_info(pasta):
    """info.txt opcional: linhas 'titulo: ...', 'ano: 2025', 'youtube: <link> | <título do vídeo>'."""
    info = {"youtube": []}
    arq = pasta / "info.txt"
    if not arq.exists():
        return info
    for linha in arq.read_text(encoding="utf-8-sig", errors="ignore").splitlines():
        if ":" not in linha:
            continue
        chave, valor = linha.split(":", 1)
        chave, valor = chave.strip().lower(), valor.strip()
        if chave == "youtube":
            link, _, titulo = valor.partition("|")
            m = re.search(r"(?:v=|youtu\.be/|shorts/|embed/)([\w-]{11})", link)
            info["youtube"].append((m.group(1) if m else link.strip(), titulo.strip()))
        elif chave in ("titulo", "título"):
            info["titulo"] = valor
        elif chave == "ano":
            info["ano"] = valor
        elif chave in ("instagram", "canal", "tiktok", "site"):
            info.setdefault("redes", {})[chave] = valor
    return info


def web(caminho):
    return caminho.relative_to(RAIZ).as_posix()


def processar_cliente(pasta, categoria_id, gerados):
    destino = SAIDA / categoria_id / slug(pasta.name)
    destino.mkdir(parents=True, exist_ok=True)
    info = ler_info(pasta)
    itens, capa = [], None

    for arq in sorted(pasta.iterdir(), key=lambda p: p.name.lower()):
        ext = arq.suffix.lower()
        nome = slug(arq.stem)

        if ext in VIDEOS:
            mp4 = destino / f"{nome}.mp4"
            thumb = destino / f"{nome}-thumb.jpg"
            if not atualizado(arq, mp4):
                print(f"    convertendo vídeo: {arq.name}")
                ffmpeg("-i", str(arq),
                       "-vf", "scale='if(gte(iw,ih),min(1920,iw),-2)':'if(gte(iw,ih),-2,min(1920,ih))'",
                       "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p",
                       "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(mp4))
            if mp4.exists() and not atualizado(mp4, thumb):
                ffmpeg("-ss", "1", "-i", str(mp4), "-frames:v", "1", "-vf", "scale='min(1280,iw)':-2",
                       "-q:v", "4", str(thumb)) or ffmpeg("-i", str(mp4), "-frames:v", "1", "-q:v", "4", str(thumb))
            if not mp4.exists():
                continue
            w, h = dimensoes(mp4)
            gerados.update({mp4, thumb})
            itens.append({"tipo": "video", "src": web(mp4), "poster": web(thumb) if thumb.exists() else "",
                          "vertical": h > w})

        elif ext in FOTOS:
            jpg = destino / f"{nome}.jpg"
            if not atualizado(arq, jpg):
                print(f"    otimizando foto: {arq.name}")
                ffmpeg("-i", str(arq), "-vf", "scale='if(gte(iw,ih),min(2000,iw),-2)':'if(gte(iw,ih),-2,min(2000,ih))'",
                       "-q:v", "3", str(jpg))
            if not jpg.exists():
                continue
            gerados.add(jpg)
            if arq.stem.lower() == "capa":
                capa = web(jpg)
            else:
                itens.append({"tipo": "foto", "src": web(jpg)})

        elif ext and arq.name.lower() != "info.txt" and not arq.is_dir():
            print(f"    (ignorado, formato não suportado: {arq.name})")

    itens += [{"tipo": "youtube", "id": yt, **({"titulo": t} if t else {})} for yt, t in info["youtube"]]
    if not itens:
        return None

    if not capa:
        primeiro = next((i for i in itens if i.get("poster") or i["tipo"] == "foto"), None)
        if primeiro:
            capa = primeiro.get("poster") or primeiro["src"]
        elif itens[0]["tipo"] == "youtube":
            capa = f"https://img.youtube.com/vi/{itens[0]['id']}/hqdefault.jpg"

    return {
        "categoria": categoria_id,
        "titulo": info.get("titulo", pasta.name),
        "ano": info.get("ano", ""),
        "capa": capa or "",
        "redes": info.get("redes", {}),
        "itens": itens,
    }


def main():
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg não encontrado. Instale com: winget install ffmpeg")
    ENTRADA.mkdir(exist_ok=True)

    projetos, gerados = [], set()
    for pasta_cat in sorted(p for p in ENTRADA.iterdir() if p.is_dir()):
        cat_id = slug(pasta_cat.name)
        print(f"\n[{pasta_cat.name}]")
        for pasta_cli in sorted((p for p in pasta_cat.iterdir() if p.is_dir()), key=lambda p: p.name.lower()):
            print(f"  {pasta_cli.name}")
            projeto = processar_cliente(pasta_cli, cat_id, gerados)
            if projeto:
                projetos.append(projeto)
                print(f"    ok: {len(projeto['itens'])} item(ns)")
            else:
                print("    (pasta vazia, pulada)")

    # Remove arquivos convertidos de coisas que você apagou da pasta midia/
    if SAIDA.exists():
        for f in SAIDA.rglob("*"):
            if f.is_file() and f not in gerados:
                f.unlink()
        for d in sorted(SAIDA.rglob("*"), key=lambda p: len(p.parts), reverse=True):
            if d.is_dir() and not any(d.iterdir()):
                d.rmdir()

    projetos.sort(key=lambda p: (-int(p["ano"]) if str(p["ano"]).isdigit() else 0, p["titulo"].lower()))
    JS.write_text(
        "/* GERADO AUTOMATICAMENTE por atualizar.py — não edite à mão. */\n"
        f"const PROJETOS = {json.dumps(projetos, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"\nPronto! {len(projetos)} cliente(s) no portfólio.")


if __name__ == "__main__":
    main()
