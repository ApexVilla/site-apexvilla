#!/usr/bin/env python3
"""Confere os hashes da CSP contra os scripts inline do dist/.

Rode depois de editar qualquer script inline em apex-villa/dist. Sai com erro se faltar
hash na configuração do nginx, porque o navegador bloquearia esse script.
"""
import base64
import glob
import hashlib
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(RAIZ, 'apex-villa', 'dist')
NGINX = sys.argv[1] if len(sys.argv) > 1 else '/root/apexvilla/deploy/nginx/default.conf'
INLINE = re.compile(r'<script(?![^>]*\bsrc=)(?![^>]*application/ld\+json)[^>]*>(.*?)</script>', re.S)

hashes = {}
for arquivo in glob.glob(os.path.join(DIST, '**', '*.html'), recursive=True):
    with open(arquivo, encoding='utf8', errors='replace') as f:
        for bloco in INLINE.findall(f.read()):
            if bloco.strip():
                digest = base64.b64encode(hashlib.sha256(bloco.encode()).digest()).decode()
                hashes.setdefault(f"'sha256-{digest}'", os.path.relpath(arquivo, DIST))

with open(NGINX, encoding='utf8') as f:
    conf = f.read()
faltam = {h: p for h, p in hashes.items() if h not in conf}
for h, p in hashes.items():
    print(('FALTA ' if h in faltam else 'ok    ') + h + '  ' + p)
sys.exit(1 if faltam else 0)
