#!/bin/bash
# Cria dados FICTÍCIOS para testar as telas no navegador:
#   - Maria Souza (admin) e João Lima (participante), emails teste-*@example.invalid
#   - a turma "Sistemas de Informação 2026" (código TESTESH0001) com evento,
#     programação, tarefas, dúvidas, fornecedores e um voto
#   - um cookie de sessão para cada uma das contas, em scripts/teste/.tmp/
# Só mexe em linhas com email teste-%@example.invalid e código TESTE%.
# Para apagar tudo depois, rode scripts/teste/limpar.sh.
set -euo pipefail
cd "$(dirname "$0")/../.."
TMP=scripts/teste/.tmp
mkdir -p "$TMP"

# DATABASE_URL do ambiente vence; senão lê do .env.local (sem imprimir).
if [ -z "${DATABASE_URL:-}" ] && [ -f .env.local ]; then
  DATABASE_URL=$(grep -E '^DATABASE_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
fi
: "${DATABASE_URL:?defina DATABASE_URL ou crie o .env.local}"

psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 <<'SQL'
insert into usuarios (name,email,"emailVerified") values
  ('Maria Souza','teste-sh@example.invalid',true),
  ('João Lima','teste-jl@example.invalid',true)
on conflict do nothing;

insert into turmas (nome,codigo_convite,data_evento,local_evento,criado_por)
select 'Sistemas de Informação 2026','TESTESH0001',now()+interval '40 days','Chácara Bela Vista, Recife',u.id
  from usuarios u
 where u.email='teste-sh@example.invalid'
   and not exists (select 1 from turmas where codigo_convite='TESTESH0001');

insert into membros (turma_id,usuario_id,papel)
select t.id,u.id,case when u.email='teste-sh@example.invalid' then 'admin' else 'participante' end
  from turmas t, usuarios u
 where t.codigo_convite='TESTESH0001' and u.email like 'teste-%@example.invalid'
on conflict do nothing;

insert into programacao (turma_id,horario,titulo,descricao)
select t.id, now()+interval '40 days'+(v.h||' hours')::interval, v.ti, v.de
  from turmas t,
       (values (0,'Recepção dos convidados','Welcome drink e fotos'),
               (2,'Cerimônia','Colação simbólica'),
               (4,'Jantar',null),
               (6,'Pista de dança','Até o amanhecer')) v(h,ti,de)
 where t.codigo_convite='TESTESH0001'
   and not exists (select 1 from programacao p where p.turma_id=t.id);

insert into tarefas (turma_id,titulo,descricao,status,responsavel_id,prazo)
select t.id, v.ti, v.de, v.st, (select id from usuarios where email=v.em), v.pz::date
  from turmas t,
       (values ('Contratar o fotógrafo','Pedir 3 orçamentos e comparar pacotes','em_andamento','teste-sh@example.invalid',to_char(now()+interval '10 days','YYYY-MM-DD')),
               ('Fechar o buffet',null,'pendente','teste-jl@example.invalid',to_char(now()-interval '3 days','YYYY-MM-DD')),
               ('Reservar a chácara','Sinal pago via PIX','concluida','teste-sh@example.invalid',null)) v(ti,de,st,em,pz)
 where t.codigo_convite='TESTESH0001'
   and not exists (select 1 from tarefas x where x.turma_id=t.id);

insert into duvidas (turma_id,autor_id,conteudo,resposta,respondida,destaque)
select t.id,(select id from usuarios where email=v.em),v.c,v.r,v.rd,v.d
  from turmas t,
       (values ('teste-jl@example.invalid','Qual é o prazo final para enviar as fotos do telão?','O prazo é dia 20/10, por email para a comissão.',true,true),
               ('teste-sh@example.invalid','Posso levar acompanhante além dos convidados da lista?',null,false,false)) v(em,c,r,rd,d)
 where t.codigo_convite='TESTESH0001'
   and not exists (select 1 from duvidas x where x.turma_id=t.id);

insert into fornecedores (turma_id,nome,categoria,descricao,contato)
select t.id,v.n,v.c,v.d,v.ct
  from turmas t,
       (values ('Buffet Sabor & Arte','Buffet','Menu completo com 3 pratos.','(81) 99999-1234'),
               ('DJ Marcos Beat','Música e DJ','Som e iluminação para a pista.','https://djmarcosbeat.example.com'),
               ('Foco Estúdio','Fotografia e vídeo',null,'contato@focoestudio.example.com')) v(n,c,d,ct)
 where t.codigo_convite='TESTESH0001'
   and not exists (select 1 from fornecedores x where x.turma_id=t.id);

-- Um voto da Maria na primeira opção do catálogo padrão.
insert into votos (turma_id,opcao_id,usuario_id)
select t.id,o.id,u.id
  from turmas t, usuarios u,
       (select o.id from opcoes o join enquetes e on e.id=o.enquete_id order by e.ordem,o.ordem limit 1) o
 where t.codigo_convite='TESTESH0001' and u.email='teste-sh@example.invalid'
on conflict do nothing;

insert into session ("expiresAt",token,"updatedAt","userId")
select now()+interval '1 day','tokenteste-'||split_part(u.email,'@',1),now(),u.id
  from usuarios u
 where u.email like 'teste-%@example.invalid'
on conflict do nothing;
SQL

# Cookie do Better Auth: <token>.<HMAC-SHA256 do token, base64, com BETTER_AUTH_SECRET>.
cookie() {
  node -e '
    const c = require("crypto"), fs = require("fs");
    let segredo = process.env.BETTER_AUTH_SECRET;
    if (!segredo) for (const l of fs.readFileSync(".env.local", "utf8").split("\n")) {
      const m = l.match(/^BETTER_AUTH_SECRET="?([^"]*)"?$/); if (m) segredo = m[1];
    }
    const t = process.argv[1];
    console.log(encodeURIComponent(t + "." + c.createHmac("sha256", segredo).update(t).digest("base64")));
  ' "$1"
}
cookie tokenteste-teste-sh > "$TMP/cookie-admin.txt"
cookie tokenteste-teste-jl > "$TMP/cookie-participante.txt"
cp "$TMP/cookie-admin.txt" "$TMP/cookie.txt"
psql "$DATABASE_URL" -Atc "select id from turmas where codigo_convite='TESTESH0001'" > "$TMP/turma-id.txt"
echo "Dados de teste prontos. Cookies em $TMP/ (cookie.txt = admin)."
