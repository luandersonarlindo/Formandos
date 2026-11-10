#!/bin/sh
# Cópia de segurança do banco com prazo (ADR-0009): um pg_dump por dia em
# db/backups/ e apaga as cópias com mais de 30 dias. Dado excluído no site some
# das cópias nesse prazo, como diz a Política de Privacidade.
#
# Uso: DATABASE_URL=postgres://... scripts/backup.sh [pasta]
# No Docker, o serviço `backup` do compose.yaml roda isto uma vez por dia.
# As cópias têm dados de pessoas: a pasta fica fora do git (.gitignore).
#
# Restaurar (testado em 2026-11-09, ver R-04 em docs/auditoria-direitos/riscos.md),
# num container descartável, sem tocar no banco de verdade:
#   docker run -d --rm --name restauro -e POSTGRES_HOST_AUTH_METHOD=trust \
#     -e POSTGRES_DB=restauro -v "$PWD/db/backups:/backups:ro" postgres:18-alpine
#   docker exec restauro pg_restore -U postgres -d restauro --no-owner /backups/<arquivo>.dump
#   docker stop restauro
# Para voltar o banco do compose, o mesmo pg_restore com --clean contra o
# serviço db (faça antes uma cópia do estado atual).
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
