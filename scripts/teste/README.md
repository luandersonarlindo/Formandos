# Scripts de teste manual

Ferramentas para ver as telas funcionando de verdade, sem depender do login do
Google e sem tocar nos dados reais. Precisam do servidor rodando
(`npm run dev`), do `psql`, do Node 22+ e do Google Chrome.

Tudo o que é criado usa emails `teste-*@example.invalid` e códigos `TESTE*`, e é
apagado por `limpar.sh`. Os cookies ficam em `scripts/teste/.tmp/` (ignorado
pelo git). Nunca rode contra um banco de produção.

## Fluxo

```bash
scripts/teste/semear.sh        # cria os dados fictícios e os cookies de sessão
node scripts/teste/captura.mjs http://localhost:3000/dashboard /tmp/dash.png 1280 900
node scripts/teste/auditoria.mjs scripts/teste/.tmp/cookie.txt 360,768,1024,1920 /dashboard,/tarefas
scripts/teste/limpar.sh        # apaga tudo
```

## Testes de fluxo (preencher e clicar de verdade)

`fluxos.mjs` abre o Chrome, preenche formulários, clica e confere a tela e o
banco. São 78 passos em 6 grupos: `auth` (criar conta, confirmar email, entrar,
sair, esqueci a senha, estados vazios), `participante`, `app` (tarefas, votos,
dúvidas, terceiros), `admin` (membros, convite, evento, moderação, catálogos),
`master` e `extras` (tela de erro, animação em movimento, foco por teclado,
celular e TV).

Suba o servidor **com o SMTP desligado**, para nenhum email real ser enviado (o
email cai no log e o teste lê o link de lá), e com a conta fictícia como master:

```bash
mkdir -p scripts/teste/.tmp
SMTP_HOST= ADMIN_MASTER_EMAILS="seu@email,teste-sh@example.invalid" \
  npm run dev > scripts/teste/.tmp/dev.log 2>&1
scripts/teste/semear.sh
node scripts/teste/fluxos.mjs              # todos os grupos (~4 min)
node scripts/teste/fluxos.mjs admin,master # só alguns
```

Para reiniciar o servidor, mate pelo PID (`ss -ltnp | grep :3000`); `pkill -f`
derruba o próprio terminal do agente. O grupo `extras` cria e apaga
temporariamente `src/app/(app)/teste-erro/` para provocar a tela de erro.

## O que cada arquivo faz

- `fluxos.mjs` e `lib/navegador.mjs`: os testes de fluxo acima e o pequeno
  controle do Chrome que eles usam.

- `semear.sh`: cria a admin Maria Souza e o participante João Lima, a turma
  "Sistemas de Informação 2026" (código `TESTESH0001`) com evento, programação,
  tarefas, dúvidas, fornecedores e um voto, e grava os cookies
  (`cookie.txt` e `cookie-admin.txt` = admin, `cookie-participante.txt`).
  Usa o `DATABASE_URL` do ambiente ou do `.env.local`, e lê o
  `BETTER_AUTH_SECRET` sem imprimi-lo.
- `limpar.sh`: apaga só o que o `semear.sh` criou.
- `captura.mjs`: abre uma página no Chrome headless, tira um screenshot e mostra
  erros de console e de hidratação. `SEM=1` testa sem login; `COOKIE_FILE=…`
  troca de conta; `CLICK="Copiar"` clica num botão pelo texto.
- `auditoria.mjs`: para cada página e largura, mede estouro horizontal, alvos de
  toque pequenos e erros de console. Abaixo de 1100px liga a emulação de toque.
  Passe uma pasta como 4º argumento para salvar os screenshots.

## Dicas

- **Páginas do master:** o master vem de `ADMIN_MASTER_EMAILS`. Para testar sem
  editar o `.env.local`, suba o servidor com
  `ADMIN_MASTER_EMAILS="seu@email,teste-sh@example.invalid" npm run dev` e
  reinicie normalmente depois.
- **Espera:** o servidor de dev é lento e o conteúdo fica escondido até a página
  hidratar. Use pelo menos 3,5 s por página (`ESPERA_MS` na auditoria).
- **Falso negativo:** screenshot em branco quase sempre é espera curta, não bug.
- **Convite de outra turma:** a conta admin pode abrir `/convite`; a participante
  é redirecionada para o dashboard.
