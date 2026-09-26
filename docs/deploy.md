# Guia de deploy — Formandos

Como publicar o app na internet. A arquitetura recomendada é **Vercel** (aplicação) + **PostgreSQL gerenciado** (banco) + **Google Cloud** (login). Nenhum passo abaixo foi executado pelo agente: ele exige as contas do grupo.

> O que foi verificado no projeto: o build funciona **sem acesso ao banco**, o servidor de produção (`next start`) sobe, protege as rotas e devolve a URL de login do Google com o redirecionamento certo, e os scripts `db:auth`, `db:schema` e `db:seed` funcionam usando **só** a variável `DATABASE_URL` (sem `.env.local`).
> O que **não** foi verificado: preços e limites atuais dos planos gratuitos de cada serviço. Confira nas páginas dos fornecedores antes de decidir.

---

## 1. Antes de começar

| Decisão | Sugestão | Alternativas |
|---|---|---|
| Hospedagem do app | Vercel (feita pelos criadores do Next.js) | Qualquer servidor com Node.js 22+ (`npm run build && npm start`) |
| Banco PostgreSQL | Um serviço gerenciado com plano gratuito (por exemplo Neon ou Supabase) | PostgreSQL no próprio servidor |
| Domínio | O endereço gratuito da hospedagem (`algo.vercel.app`) | Domínio próprio |
| Repositório | GitHub | GitLab ou Bitbucket |

O código já está no GitHub: <https://github.com/luandersonarlindo/Formandos>. Confira se o repositório está **privado**, a não ser que o grupo queira o código público (o histórico não contém segredos, mas mostra a estrutura do projeto e os nomes dos membros). Para enviar novas mudanças:

```bash
git push origin main
```

---

## 2. Banco de dados em produção

1. Crie um projeto PostgreSQL no serviço escolhido e copie a **string de conexão**. Ela deve terminar com `?sslmode=require`. Bancos gerenciados exigem conexão criptografada.
2. Se o serviço oferecer duas strings (direta e "pooled"), use a **pooled** no app da Vercel e a direta para as migrações.
3. Crie as tabelas **de fora do app**, no seu computador, apontando para o banco de produção. Só `DATABASE_URL` é necessária, e ela tem prioridade sobre o `.env.local`:

   ```bash
   export DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
   npm run db:auth      # tabelas do Better Auth (usuarios, session, account, verification)
   npm run db:schema    # tabelas do domínio
   npm run db:seed      # catálogo padrão (8 categorias, 16 perguntas)
   ```

   Os três comandos podem ser repetidos sem duplicar dados. Use `unset DATABASE_URL` depois, para não rodar nada em produção por engano.
4. Confirme: `psql "$DATABASE_URL" -c "select count(*) from opcoes"` deve dar **84**.

**Atenção.** O `db/schema.sql` só cria o que não existe; ele **não altera tabelas já criadas**. Quando o esquema mudar depois do lançamento, escreva um arquivo de migração novo (por exemplo `db/migracoes/001_....sql`) e aplique-o à mão, com backup antes.

---

## 3. Login com Google (Google Cloud Console)

No mesmo cliente OAuth usado no desenvolvimento (ou em um novo, só para produção):

1. **Origens JavaScript autorizadas:** adicione `https://SEU-DOMINIO`.
2. **URIs de redirecionamento autorizados:** adicione `https://SEU-DOMINIO/api/auth/callback/google`.
3. Em **Tela de consentimento OAuth**, mude o status de "Testing" para **"In production"** (Publicar app). Com **somente** os escopos `openid`, `email` e `profile`, a documentação do Google diz que não há verificação, aviso nem limite de 100 usuários.
4. **Não peça nenhum escopo além desses três.**
5. Espere de 5 minutos a algumas horas para o Google propagar as mudanças.

> Antes de publicar o app na tela de consentimento, só os "usuários de teste" cadastrados conseguem entrar.

---

## 4. Vercel

1. Em vercel.com, **Add New → Project** e importe o repositório do GitHub. O framework (Next.js) é detectado sozinho; não mude os comandos de build.
2. Em **Environment Variables**, cadastre (marque **Production**):

   | Variável | Valor |
   |---|---|
   | `DATABASE_URL` | string de conexão do banco de produção (com `?sslmode=require`) |
   | `BETTER_AUTH_SECRET` | um segredo **novo**, só de produção: `openssl rand -base64 32` |
   | `BETTER_AUTH_URL` | `https://SEU-DOMINIO` (sem barra no final) |
   | `GOOGLE_CLIENT_ID` | do Google Cloud |
   | `GOOGLE_CLIENT_SECRET` | do Google Cloud |
   | `DB_POOL_MAX` | opcional; padrão 5 conexões por instância |

3. Faça o **Deploy**. Se mudar uma variável depois, é preciso um novo deploy.
4. Escolha a **região** das funções mais próxima do banco (menos latência).

> `BETTER_AUTH_URL` errada é a causa mais comum de `redirect_uri_mismatch`: o Better Auth monta a URL de retorno a partir dela.

---

## 5. Teste depois do deploy

Faça na URL pública, com duas contas Google diferentes (uma será administradora):

- [ ] `/` abre e "Entrar" leva ao login do Google; ao voltar, cai no app.
- [ ] Conta A cria uma turma e vira administradora; conta B entra com o código de convite.
- [ ] B não abre `/admin` (volta para `/dashboard`).
- [ ] Votar em uma enquete, mudar o voto e ver o resultado em `/votacoes/relatorio`.
- [ ] A vê quem votou em `/admin/votacoes`.
- [ ] Enviar dúvida, votar nela e A responder e destacar em `/admin/duvidas`.
- [ ] A define data, local e programação em `/admin/evento`; o dashboard mostra a contagem regressiva.
- [ ] Criar tarefa, atribuir a B e B atualizar o andamento.
- [ ] Sair e entrar de novo funciona.
- [ ] O celular mostra tudo legível.

Se o login falhar, veja `redirect_uri_mismatch` (seção 3 e `BETTER_AUTH_URL`) e "acesso bloqueado" (o app ainda está em "Testing" ou o e-mail não é usuário de teste).

---

## 6. Segurança em produção

- **Segredos novos.** `BETTER_AUTH_SECRET` e a chave do Google de produção não devem ser os do desenvolvimento. Nunca os cole em chat, issue ou commit. O `.gitignore` já ignora `.env*` (menos `.env.example`).
- **Banco.** Ative os backups automáticos do serviço e use uma senha forte, diferente da do desenvolvimento. Não deixe o banco aberto para qualquer IP se o serviço permitir restringir.
- **Rotação.** Se uma chave vazar, gere outra no painel do fornecedor, atualize a variável na Vercel e faça novo deploy.
- **Privacidade.** O app guarda nome, e-mail e foto da conta Google, e o administrador vê quem votou em cada opção. Avise a turma. Se houver menores de idade, verifique as regras aplicáveis (LGPD).
- **Limites.** O código de convite tem limite de tentativas (10 a cada 15 minutos). Não há limite de envio de dúvidas nem de votos por usuário; se houver abuso, restrinja pela hospedagem.

---

## 7. Deploys de teste (preview) e ambientes

Cada branch enviada ao GitHub ganha um endereço próprio de "preview" na Vercel. O login com Google **não funciona** nesses endereços, porque o Google só aceita as URIs cadastradas. Duas saídas: testar sempre no domínio de produção, ou usar um projeto Vercel e um banco separados para "homologação", com o próprio cliente OAuth.

---

## 8. Voltar atrás (rollback)

- **Aplicação:** na Vercel, abra **Deployments**, escolha um deploy anterior que funcionava e use **Promote to Production**. É imediato.
- **Banco:** as migrações só avançam. Antes de qualquer mudança de esquema, faça um backup (`pg_dump "$DATABASE_URL" -f backup.sql`). Guarde o arquivo fora do repositório.

---

## 9. Alternativa: servidor próprio

Em qualquer máquina com Node.js 22+ e um PostgreSQL acessível:

```bash
npm ci
npm run build
BETTER_AUTH_URL=https://SEU-DOMINIO npm start   # porta 3000
```

Coloque um proxy reverso com HTTPS na frente (por exemplo Nginx ou Caddy). Defina as mesmas variáveis da seção 4 no ambiente do processo.

---

## 10. Resumo do que falta você fazer

1. Manter o código em dia no GitHub (`git push origin main`).
2. Criar o banco de produção e rodar `db:auth`, `db:schema` e `db:seed`.
3. Cadastrar a URL de produção no Google Cloud e publicar o app.
4. Criar o projeto na Vercel com as variáveis de ambiente.
5. Rodar o checklist da seção 5.
