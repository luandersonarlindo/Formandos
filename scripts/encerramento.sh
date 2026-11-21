#!/usr/bin/env bash
# Aviso de encerramento do site por email (ADR-0021).
#
# Antes: defina ENCERRAMENTO_EM=AAAA-MM-DD no .env.local e recrie o app
# (`docker compose up -d app`). A faixa aparece em todas as telas e criar
# turma passa a ser recusado.
#
# Depois rode este script. Ele manda o aviso a todo usuário com email
# confirmado que ainda não recebeu, até o teto diário (EMAIL_TETO_DIA).
# Se sobrar gente ("faltam" maior que 0), rode de novo no dia seguinte:
# ninguém recebe duas vezes.
#
#   scripts/encerramento.sh                       # contra http://localhost:3000
#   BASE_URL=https://site scripts/encerramento.sh # contra outro endereço
set -euo pipefail
cd "$(dirname "$0")/.."

BASE_URL="${BASE_URL:-http://localhost:3000}"
if [ -z "${CRON_SECRET:-}" ] && [ -f .env.local ]; then
  CRON_SECRET="$(grep -E '^CRON_SECRET=' .env.local | head -1 | cut -d= -f2- | tr -d '"')"
fi
if [ -z "${CRON_SECRET:-}" ]; then
  echo "CRON_SECRET vazio: defina no ambiente ou no .env.local." >&2
  exit 1
fi

curl -sS --fail-with-body -X POST \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "${BASE_URL}/api/encerramento"
echo
