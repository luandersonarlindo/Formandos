# Deploy no Render

Caminho escolhido pelo grupo: aplicação e banco PostgreSQL no **Render**, com a configuração descrita em [`render.yaml`](../render.yaml) (um *Blueprint*). O guia geral, com Vercel e Neon como alternativa, está em [`deploy.md`](deploy.md) (as seções de Google Cloud, checklist, segurança e rollback valem para os dois).

> Verificado na documentação do Render (26/09/2026): a sintaxe do `render.yaml` (`databases`, `fromDatabase`, `generateValue`, `sync: false`, regiões `oregon`, `ohio`, `virginia`, `frankfurt` e `singapore`) e as variáveis `RENDER_EXTERNAL_URL` e `PORT` (10000).
> **Não verificado:** o deploy em si (ele exige a conta do grupo) e se o build cabe na memória do plano gratuito.

---

## 1. O que esperar do plano gratuito

| Item | Como funciona | Consequência para o Formandos |
|---|---|---|
| Serviço web | Dorme depois de **15 minutos** sem requisições e leva cerca de 1 minuto para acordar | A primeira pessoa do dia espera. Depois fica rápido |
| Horas do serviço | 750 horas gratuitas por mês por workspace | Suficiente para um serviço |
| **PostgreSQL** | **Expira 30 dias depois de criado.** Há 14 dias de carência; passado esse prazo, o banco e os dados são **apagados**. Tem 1 GB de espaço | **Precisa de plano antes disso** ou de migração (seção 6) |
| Disco | Efêmero, sem disco persistente | O app não grava arquivos, então não há problema |

Fontes: [Deploy for Free (Render Docs)](https://render.com/docs/free) e [artigo sobre o prazo de 30 dias do Postgres gratuito](https://bex.co/blog/2026/09/23/render-free-postgres-30-day-expiry). Confira os limites atuais no site do Render antes de decidir.

**Anote a data de criação do banco** e marque no calendário um lembrete para o dia 25.

---

## 2. Antes de começar

1. O código com o `render.yaml` precisa estar no GitHub (`git push origin main`).
2. Tenha em mãos o `GOOGLE_CLIENT_ID` e o `GOOGLE_CLIENT_SECRET` (Google Cloud Console, seção 3 do `deploy.md`). Para produção use, de preferência, uma chave secreta **nova**.

---

## 3. Criar o serviço pelo Blueprint

1. No painel do Render: **New → Blueprint**.
2. Conecte o GitHub e escolha o repositório `luandersonarlindo/Formandos`.
3. O Render lê o `render.yaml` e mostra o que vai criar: o banco **formandos-db** e o serviço web **formandos**, ambos no plano **Free** e na região **Virginia**.
4. Ele pede os valores das variáveis marcadas como secretas: `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`. Digite direto no painel; **não cole em chat**.
5. Clique em **Apply**. O Render cria o banco, faz o build (`npm ci && npm run build`) e sobe o serviço (`npm start`).

O que o Blueprint configura sozinho:

| Variável | Origem |
|---|---|
| `DATABASE_URL` | Endereço **interno** do banco (não sai da rede privada do Render) |
| `BETTER_AUTH_SECRET` | Gerado aleatoriamente pelo Render |
| `BETTER_AUTH_URL` | Não definida: o app usa `RENDER_EXTERNAL_URL` (o endereço público do serviço) |
| `NODE_VERSION` | 22 |

Se quiser um domínio próprio depois, defina `BETTER_AUTH_URL` com ele.

> **O primeiro deploy sobe com o banco vazio.** A página inicial abre, mas o login ainda não funciona até a seção 4.

Se o Render recusar a região `virginia` ou o plano, avise: é só ajustar o arquivo.

**Se o build falhar** com `JavaScript heap out of memory` ou `Killed`, faltou memória no plano gratuito. Nesse caso escolha um plano pago para o serviço ou gere o build de outra forma; me chame com o trecho do log.

---

## 4. Criar as tabelas no banco

O banco nasce vazio. As tabelas são criadas **do seu computador**, apontando para o banco do Render, com os mesmos scripts do desenvolvimento:

1. No painel do Render, abra **formandos-db** e copie a **External Database URL** (não a Internal).
2. Crie na raiz do projeto o arquivo **`.env.producao`** (o `.gitignore` já o ignora, por causa do padrão `.env*`) com uma única linha:

   ```env
   DATABASE_URL_DIRETA="postgresql://...(External Database URL)...?sslmode=require"
   ```

   Não cole essa URL no chat: ela traz a senha do banco. Não a ponha no `.env.local`, senão o seu ambiente de desenvolvimento passaria a escrever no banco de produção.
3. Avise quando o arquivo estiver pronto. Rodo, lendo o arquivo sem imprimir o conteúdo:

   ```bash
   DATABASE_URL="$DATABASE_URL_DIRETA" npm run db:auth
   DATABASE_URL="$DATABASE_URL_DIRETA" npm run db:schema
   DATABASE_URL="$DATABASE_URL_DIRETA" npm run db:seed
   ```

   Os comandos só criam tabelas e o catálogo padrão; podem ser repetidos sem duplicar dados. Confirmo depois: **17 tabelas** e **84 opções** de enquete.
4. Se der erro de certificado ou de SSL na conexão, me avise com a mensagem; o ajuste é na forma de conectar, não no banco.

---

## 5. Google Cloud e teste

1. Descubra o endereço do serviço no painel do Render (algo como `https://formandos.onrender.com`; se o nome estiver em uso, o Render acrescenta um sufixo).
2. No Google Cloud Console, no cliente OAuth:
   - **Origens JavaScript autorizadas:** `https://SEU-SERVICO.onrender.com`
   - **URIs de redirecionamento autorizados:** `https://SEU-SERVICO.onrender.com/api/auth/callback/google`
3. Na tela de consentimento, mude para **"In production"** (Publicar app). Com só `openid`, `email` e `profile`, a documentação do Google diz que não há verificação nem limite de usuários.
4. Espere a propagação (de 5 minutos a algumas horas) e rode o checklist da seção 5 do [`deploy.md`](deploy.md) com duas contas Google.

---

## 6. Antes de o banco expirar

O banco gratuito **desaparece** com os dados da turma. Antes do dia 30, escolha uma saída:

- **Pagar o plano do Postgres** no Render (o preço atual está no site) e manter tudo como está; ou
- **Migrar para outro banco** (por exemplo o Neon, cujo plano gratuito não expira, ver `deploy.md`).

Em ambos os casos, comece pelo backup, feito do seu computador:

```bash
pg_dump "$DATABASE_URL_DIRETA" -Fc -f formandos-backup.dump
```

Guarde o arquivo **fora** do repositório (ele contém dados pessoais). Para restaurar em um banco novo:

```bash
pg_restore --no-owner --dbname "$NOVA_URL" formandos-backup.dump
```

Depois de migrar, troque a variável `DATABASE_URL` no serviço do Render pela nova string e faça um novo deploy.

---

## 7. Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Primeira página lenta (cerca de 1 minuto) | O serviço estava dormindo (plano gratuito) |
| `redirect_uri_mismatch` no Google | URI de redirecionamento não cadastrada ou com o endereço errado (seção 5) |
| "Acesso bloqueado" no Google | App ainda em "Testing" ou e-mail fora da lista de teste |
| Login volta com erro depois do Google | Tabelas não criadas (seção 4) ou `DATABASE_URL` errada |
| `Application failed to respond` | O serviço precisa escutar na `PORT` que o Render define; o `npm start` já faz isso. Veja os logs do serviço |
| Build falha sem memória | Limite do plano gratuito (seção 3) |
| Deploy antigo ainda aparece | O Render só reconstrói quando há push na `main`; use **Manual Deploy** para forçar |
