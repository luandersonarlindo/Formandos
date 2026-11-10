#!/bin/sh
# Cópia de segurança do banco com prazo (ADR-0009): um pg_dump por dia em
# db/backups/ e apaga as cópias com mais de 30 dias. Dado excluído no site some
# das cópias nesse prazo, como diz a Política de Privacidade.
#
# Uso: DATABASE_URL=postgres://... scripts/backup.sh [pasta]
# No Docker, o serviço `backup` do compose.yaml roda isto uma vez por dia.
# As cópias têm dados de pessoas: a pasta fica fora do git (.gitignore).
set -eu

PASTA="${1:-db/backups}"
DIAS_GUARDA=30
: "${DATABASE_URL:?defina DATABASE_URL}"

mkdir -p "$PASTA"
arquivo="$PASTA/formandos-$(date -u +%Y-%m-%d).dump"
pg_dump --format=custom --no-owner --file="$arquivo.parcial" "$DATABASE_URL"
mv "$arquivo.parcial" "$arquivo"
echo "cópia: $arquivo"

# Todas as cópias (inclusive as feitas à mão antes de migrações) seguem o
# prazo. Só arquivos .dump direto na pasta, nada de subpastas.
find "$PASTA" -maxdepth 1 -type f -name '*.dump' -mtime +"$DIAS_GUARDA" -print -exec rm -f -- {} \;
