#!/bin/bash
# Apaga só os dados fictícios criados por semear.sh (e o que depende deles).
set -euo pipefail
cd "$(dirname "$0")/../.."
if [ -z "${DATABASE_URL:-}" ] && [ -f .env.local ]; then
  DATABASE_URL=$(grep -E '^DATABASE_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
fi
: "${DATABASE_URL:?defina DATABASE_URL ou crie o .env.local}"
psql "$DATABASE_URL" -q \
  -c "delete from turmas where codigo_convite like 'TESTE%'" \
  -c "delete from usuarios where email like 'teste-%@example.invalid'"
rm -rf scripts/teste/.tmp
echo "Dados de teste apagados."
