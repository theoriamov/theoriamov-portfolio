"""
Baixa vídeos do Instagram/YouTube direto para midia/<Categoria>/<Cliente>/.

Uso: python baixar.py lista.txt

Formato da lista (linhas em branco e # são ignoradas):
    [Gastronômico / Frelas Gastronomia]
    https://www.instagram.com/p/XXXX/
    https://www.instagram.com/reel/YYYY/

Cada link vira 01-..., 02-... na ordem da lista. O que já foi baixado é pulado.
"""

import re
import subprocess
import sys
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent


def codigo(url):
    m = re.search(r"/(?:p|reel|reels|shorts)/([\w-]+)|[?&]v=([\w-]{11})|youtu\.be/([\w-]{11})", url)
    return next((g for g in (m.groups() if m else []) if g), None)


def main(lista):
    pasta, n, falhas = None, 0, []
    for linha in Path(lista).read_text(encoding="utf-8-sig").splitlines():
        linha = linha.strip()
        if not linha or linha.startswith("#"):
            continue
        cab = re.fullmatch(r"\[(.+?)\s*/\s*(.+?)\]", linha)
        if cab:
            pasta = RAIZ / "midia" / cab.group(1) / cab.group(2)
            pasta.mkdir(parents=True, exist_ok=True)
            n = 0
            print(f"\n== {cab.group(1)} / {cab.group(2)}")
            continue
        n += 1
        cod = codigo(linha)
        if pasta is None or not cod:
            print(f"  ? linha ignorada: {linha}")
            continue
        if any(pasta.glob(f"*{cod}*")):
            print(f"  {n:02d} já baixado ({cod})")
            continue
        time.sleep(6)
        print(f"  {n:02d} baixando {cod} ...", flush=True)
        r = subprocess.run(
            [sys.executable, "-W", "ignore", "-m", "yt_dlp", "--no-warnings", "-q",
             "-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b", "--merge-output-format", "mp4",
             "-o", str(pasta / f"{n:02d}-%(playlist_index&{{}}-|)s{cod}.%(ext)s"), linha],
            capture_output=True, text=True,
        )
        if r.returncode != 0 or not any(pasta.glob(f"*{cod}*")):
            erro = (r.stderr.strip().splitlines() or ["?"])[-1]
            print(f"     FALHOU: {erro}")
            falhas.append((pasta.name, linha))

    if falhas:
        print("\nNão consegui baixar (baixe manualmente e coloque na pasta):")
        for cli, url in falhas:
            print(f"  [{cli}] {url}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "lista.txt")
