# Especificação de Requisitos de Software (ERS)

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Documento** | Especificação de Requisitos de Software (ERS) |
| **Padrão** | IEEE 830-1998 — *IEEE Recommended Practice for Software Requirements Specifications* |
| **Versão** | 1.0 |
| **Data** | 05/10/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |
| **Estado do produto** | MVP concluído, rodando em máquina local. Sem hospedagem pública contratada até a data desta versão. |

---

## 1. Introdução

### 1.1 Propósito

Este documento especifica os requisitos do sistema **Formandos**, software web que organiza a preparação de formaturas: cadastro das turmas, escolha de enquetes por votação, organização do evento e controle de tarefas.

Serve para quatro públicos ao mesmo tempo:

1. **Quem vai desenvolver** — encontra, para cada requisito, o arquivo e a linha do código que o implementam.
2. **Quem vai verificar** — encontra, para cada requisito, o teste automatizado ou a inspeção que o comprova.
3. **Quem vai avaliar** — encontra, na estrutura do IEEE 830-1998, cada seção exigida por norma.
4. **Quem vai operar** — encontra, nas seções 3.3 e 3.6, as janelas de execução, os tempos de recuperação, o nível de serviço e o que precisa ser monitorado.

A fonte de verdade deste documento é o código do repositório. Onde o código e a documentação anterior divergem, **o código prevalece** e a divergência está registrada na seção 4.5.

### 1.2 Escopo

#### 1.2.1 Dentro do escopo

- Cadastro, confirmação de email, entrada, redefinição de senha, correção do nome completo e exclusão de conta.
- Três papéis: **participante**, **administrador de turma** e **master**.
- Criação de turma, entrada por código de convite, troca de turma, saída e arquivamento.
- Votação em enquetes de escolha única e múltipla, com opção exclusiva, e relatório agregado.
- Perguntas e respostas de dúvidas, com votação entre colegas.
- Dados do evento, programação oficial, avisos, tarefas e vitrine de fornecedores.
- Envio de email transacional nos oito eventos de conta e turma.
- Administração da plataforma pelo master.

#### 1.2.2 Fora do escopo

- Aplicativo móvel nativo. A interface é web e responsiva.
- Offline. O sistema exige conexão; não há fila local nem sincronização.
- Integração com plataformas de pagamento, mapa ou calendário em tempo real.
- Edição do texto das perguntas do catálogo padrão (ver 4.5, divergência 2).
- Login por rede social além do Google.
- Painel com várias turmas em simultâneo para o mesmo usuário: a pessoa usa **uma** turma por vez e troca entre elas.

### 1.3 Definições, acrônimos e abreviaturas

| Termo | Significado neste documento |
|---|---|
| **Turma** | Grupo de formandos com um código de convite próprio. Unidade de isolamento de todos os dados do sistema. |
| **Membro** | Relação entre uma pessoa e uma turma. Toda pessoa em uma turma é membro dela. |
| **Papel** | Permissão do membro dentro da turma. Só dois valores são permitidos pelo banco: `admin` e `participante` (`db/schema.sql:49`). |
| **Master** | Papel de plataforma, sem turma. Definido **apenas** pela lista `ADMIN_MASTER_EMAILS` (`src/lib/master.ts:1-24`). Não existe tabela de role, nem tela de cadastro de master. |
| **Catálogo** | Conjunto de categorias e enquetes de votação. Catálogo com `turma_id` nulo é o catálogo padrão, global e somente leitura. |
| **Enquete** | Pergunta de uma categoria, de escolha `unica` ou `multipla`. |
| **Opção** | Alternativa de uma enquete. Opção `exclusiva` impede a combinação com outras. |
| **Decisão** | Resultado fixado de uma enquete em uma turma. É sempre por turma, nunca global. |
| **Acompanhantes** | Pessoas que o membro levará ao evento. Só existem quando a presença é `vou`. |
| **Turma arquivada** | Turma com `arquivada_em` preenchida. Fica **somente leitura**: nenhum membro e nenhum administrador altera o conteúdo. |
| **ERS** | Este documento. Equivale ao SRS do IEEE 830-1998. |
| **RF** | Requisito funcional: o que o sistema faz. |
| **RN** | Regra de negócio: condição ou restrição que os requisitos devem respeitar. |
| **RNF** | Requisito não funcional: como o sistema se comporta. |
| **RTO** | *Recovery Time Objective*: tempo máximo aceitável para restaurar o serviço. |
| **RPO** | *Recovery Point Objective*: perda de dados máxima aceitável, em minutos. |
| **SLA** | *Service Level Agreement*: acordo de qualidade e de prazos de atendimento. |
| **Janela de execução** | Intervalo em que uma atividade pode rodar. Neste documento há três janelas distintas: **operação** (3.3.3), **mudança** (3.3.3) e **testes** (3.3.5). |
| **SMTP** | Protocolo de envio de email, configurado em `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. |
| **E.G.** | Cenário em Gherkin, na seção 4.1. |

### 1.4 Referências

| Documento | Uso nesta especificação |
|---|---|
| IEEE 830-1998 | Estrutura das seções 1, 2 e 3 deste documento. |
| ISO/IEC 25010:2011 | Taxonomia dos atributos de qualidade da seção 3.5. |
| WCAG 2.1 nível AA | Critério de contraste de texto, RNF-03. |
| ISO 8601 | Formato de data nos requisitos de interface, seção 3.1.1. |
| `README.md` (348 linhas) | Visão geral, rotas, execução e deploy. |
| `docs/entregas/15-09-2026/Requisitos Prioritários.md` | Origem dos identificadores RF-01 a RF-21, RN-01 a RN-09 e RNF-01 a RNF-10. Este documento **mantém** esses identificadores e os estende. |
| `db/schema.sql` | Estrutura do banco. Fonte das restrições declarativas. |

### 1.5 Visão geral

O sistema tem quatro áreas, na ordem em que a pessoa as encontra:

1. **Vitrine pública** (`/`, `/entrar`, `/esqueci-senha`, `/redefinir-senha`) — apresentação do produto, cadastro e recuperação de senha.
2. **Onboarding** (`/convite`) — entrada na primeira turma por código de convite.
3. **Área do membro** (`/dashboard`, `/avisos`, `/tarefas`, `/duvidas`, `/terceiros`, `/votacoes`) — o dia a dia da turma.
4. **Áreas restritas** (`/admin/*` e `/master/*`) — gestão por administrador de turma e pelo master.

A seção 3.1 detalha as interfaces, a 3.2 os requisitos funcionais, a 3.3 desempenho, disponibilidade, testabilidade e SLA, a 3.4 restrições, a 3.5 os atributos de qualidade e a 3.6 o monitoramento. A seção 4 traz os cenários Gherkin e a rastreabilidade.

---

## 2. Descrição geral

### 2.1 Perspetiva do produto

O Formandos é um sistema **autocontido**. Não depende de serviço de terceiros para funcionar, exceto pelo banco de dados gerenciado e, quando configurado, pelos provedores de identidade e de email.

```
                      navegador
                      |
                   HTTPS (TLS 1.2+)
                                  |
                                  |
                      +-----------------------+
                      |  CDN + reverse proxy  |
                      |  next.config.ts:3-11  |
                      |   origem verificada   |
                      | src/lib/auth.ts:41-54 |
                      +-----------------------+
                                  |
                                  |
                      +-----------------------+
                      |  aplicacao Next.js 16 |
                      |  Server Components +  |
                      |     Server Actions    |
                      |   src/app/api/auth/*  |
                      +-----------------------+
                                  |
                                  |
            +---------------------+---------------------+
                                  |
            |
                                  |
                                                        |
    +---------------+     +---------------+     +---------------+
    |   PostgreSQL  |     |  Google OAuth |     | servidor SMTP |
    |     (Neon)    |     |   (opcional)  |     |   (opcional)  |
    +---------------+     +---------------+     +---------------+
```

Todos os dados de uma turma ficam delimitados por `turma_id`. Não existe consulta de listagem que não filtre pela turma da sessão — as funções de leitura recebem a turma como parâmetro obrigatório (`src/lib/dal.ts:93-97`).

### 2.2 Funções do produto

| Grupo | Funções |
|---|---|
| **Conta** | cadastrar, confirmar email, entrar, redefinir senha, corrigir nome completo, excluir conta |
| **Vínculo** | entrar por convite, criar turma, trocar de turma, sair, arquivar |
| **Votação** | votar, mudar voto, fixar decisão, reabrir, ver totais, ver quem votou |
| **Comunicação** | avisos, dúvidas, respostas, destaque, votação de dúvida, programação do evento |
| **Organização** | tarefas com responsável, prazo e status; presenças e acompanhantes |
| **Terceiros** | vitrine de fornecedores por categoria e orçamento |
| **Notificação** | oito emails transacionais, disparados por evento |
| **Plataforma** | visão do master sobre turmas e usuários; exclusão de turma e de usuário |

### 2.3 Características dos usuários

| Papel | Quem é | O que pode fazer | O que não pode fazer |
|---|---|---|---|
| **Visitante** | Qualquer pessoa, sem conta | Ler a vitrine; criar conta; pedir redefinição de senha; confirmar email | Ver qualquer dado de turma |
| **Participante** | Membro com `papel = 'participante'` | Votar; enviar e votar dúvidas; registrar presença; ver tarefas, avisos, terceiros e relatórios | Criar, editar ou excluir tarefas, avisos, enquetes, presets e terceiros; ver quem votou; gerir membros |
| **Administrador** | Membro com `papel = 'admin'` | Tudo do participante, mais criar, editar e excluir tarefas, avisos e terceiros; responder e apagar dúvidas; criar e decidir enquetes; ver quem votou; promover, rebaixar e remover membros; gerar e regenerar o código de convite; editar o evento; arquivar e excluir a turma | Sair da turma enquanto houver outros membros e for o único admin; remover a si mesmo; ver a área master |
| **Master** | Email em `ADMIN_MASTER_EMAILS`, com email confirmado | Ver todas as turmas e todos os usuários; gerir membros de qualquer turma; excluir turmas e usuários | Excluir a própria conta pelo painel de conta; excluir outro master; rebaixar ou remover o último admin de uma turma |

Uma pessoa pode ser **administrador em mais de uma turma** ao mesmo tempo (`src/lib/vinculos.ts:8-10`). Ela **não** pode ter dois papéis na mesma turma: `papel` é único por par (turma, pessoa).

### 2.4 Restrições

| ID | Restrição | Origem |
|---|---|---|
| RES-01 | Node.js versão 22 ou superior | `package.json:8` |
| RES-02 | PostgreSQL com extensão `pgcrypto` para geração de `uuid` | `db/schema.sql` |
| RES-03 | Toda consulta ao banco passa por parâmetros; nenhum valor entra concatenado em SQL | `src/lib/db.ts` |
| RES-04 | `BETTER_AUTH_SECRET` tem o **mesmo valor** em todos os ambientes, porque a assinatura de sessão é validada contra ele | `.env.example:19` |
| RES-05 | `MIGRATION_DATABASE_URL` não pode conter o sufixo `-pooler`; o script de migração recusa a configuração | `README.md:257`, `db/migrate.mjs` |
| RES-06 | O login Google só é habilitado quando as duas credenciais existem **e** o ambiente é produção | `src/lib/auth.ts:28-35`, `src/lib/auth.ts:98-105` |
| RES-07 | O proxy de verificação por cookie é apenas uma checagem rápida; **não** é barreira de autorização | `src/proxy.ts:4-25` |
| RES-08 | O esquema do banco é idempotente: `create table if not exists` e `alter table ... add column if not exists` | `db/schema.sql` |

### 2.5 Premissas e dependências

| ID | Premissa | Consequência se for falsa |
|---|---|---|
| PRE-01 | O fornecedor de banco mantém *point-in-time recovery*. | O RPO de 15 minutos (3.3.4) passa a depender de backup por snapshot, e a perda máxima sobe para a janela entre snapshots. |
| PRE-02 | O provedor de hospedagem mantém o ambiente de produção em execução contínua. | A disponibilidade de 99,5% (3.3.3) passa a depender do plano contratado. |
| PRE-03 | A rede da escola permite acesso ao endereço público de produção. | O produto fica inacessível fora da rede, e os requisitos 3.3.3 a 3.3.6 não se aplicam. |
| PRE-04 | Cada turma tem um administrador responsável por confirmar as presenças. | Sem confirmação, o painel do evento exibe totais que ninguém confirmou. |

Dependências opcionais: SMTP (os oito emails) e Google (login social). Ausentes, o sistema funciona com o email registrado no log do servidor e apenas com login por senha (`src/lib/email.ts`, seção 3.6.2).

### 2.6 Parcelamento dos requisitos

Cada requisito pertence a **exatamente uma** seção normativa deste documento. As outras seções apenas **remetem** a ele, sem repetir a obrigação. Essa regra existe para que não haja duas versões do mesmo requisito divergindo.

| Requisito | Seção normativa | Citado, só por remissão, em |
|---|---|---|
| RF-01 a RF-27 | 3.2 | 1.5, 2.2, 4.2 |
| RN-01 a RN-28 | 4.3 | 2.2, 4.2 |
| RNF-01 a RNF-10 | 3.5 | 1.5, 2.3 |
| Disponibilidade, RTO, RPO | 3.3.3, 3.3.4 | 2.5, 3.5 (RNF-11) |
| Testabilidade | 3.3.5 | 3.5 (RNF-13) |
| SLA | 3.3.6 | 3.5 (RNF-12) |
| Monitoramento | 3.6 | 3.5 (RNF-14) |

---

## 3. Requisitos específicos

### 3.1 Requisitos de interface externa

#### 3.1.1 Interfaces com o usuário

- **INT-01** — Toda a interface é escrita em **português do Brasil**. Não há texto em inglês na interface, exceto nomes próprios de provedores externos.
- **INT-02** — Datas e horas são exibidas no fuso `America/Sao_Paulo`, independentemente do fuso do navegador (`src/lib/datas.ts:2`).
- **INT-03** — Datas usam o padrão `AAAA-MM-DD` em formulário e `DD/MM/AAAA` na exibição.
- **INT-04** — Toda mensagem de erro de validação é escrita na segunda pessoa, sem jargão, e nomeia o campo quando o erro é de campo. Exemplo: "O título precisa ter pelo menos 3 caracteres."
- **INT-05** — Não há mensagem de erro sem ação de recuperação visível na mesma tela.
- **INT-06** — Nenhuma operação destrutiva pode ser concluída sem confirmação digitada (ver RN-15 e RN-16).
- **INT-07** — Nenhuma tela pode exigir rolagem horizontal entre 360 e 3840 pixels de largura.
- **INT-08** — A navegação por teclado alcança todos os controles; o elemento em foco tem contorno visível. O primeiro elemento focável da página é o link "Pular para o conteúdo", que aponta para `main#conteudo` (`src/components/features/app-shell.tsx:211`).
- **INT-09** — Animações são desligadas quando o sistema operacional pede `prefers-reduced-motion: reduce`.
- **INT-10** — Turma arquivada exibe faixa de aviso e todas as ações de escrita ficam indisponíveis (`src/components/features/app-shell.tsx:51-52,212`).
- **INT-11** — A área master responde **HTTP 404** para quem não é master, e não redireciona. A resposta não revela que a área existe (`src/lib/dal.ts:139-143`).
- **INT-12** — Contraste de texto em toda a interface: **razão mínima de 4,5:1** para texto normal e **3:1** para texto de pelo menos 18,66 px, ou negrito a partir de 14 px, conforme WCAG 2.1 AA.

**Contagem de telas.** Visitante: 4. Participante: 8. Administrador: 11. Master: 4. A lista completa de rotas, incluindo as telas de onboarding e conta, está em `docs/Organograma da Aplicação.md`, seção 1.

#### 3.1.2 Interfaces externas

| ID | Interface | Objeto |
|---|---|---|
| INT-13 | **Google OAuth 2.0** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Habilitada só em produção com as duas credenciais presentes. |
| INT-14 | **PostgreSQL** | `DATABASE_URL` (pool, em tempo de execução) e `MIGRATION_DATABASE_URL` (conexão direta, só para DDL). |
| INT-15 | **Servidor SMTP** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`. |
| INT-16 | **Google Maps** | Chamada de saída pelo navegador, por link de pesquisa. Nenhuma chave de API, nenhum dado enviado a partir do servidor. |
| INT-17 | **Provedor de hospedagem** | Executa o build. `VERCEL_ENV` determina se o Google está habilitado (`src/lib/auth.ts:28-35`). |

#### 3.1.3 Interfaces de comunicação

| ID | Interface | Direção | Transporte |
|---|---|---|---|
| INT-18 | HTTPS entre navegador e aplicação | bidirecional | TLS 1.2 ou superior |
| INT-19 | PostgreSQL pelo pool | aplicação para banco | TLS, quando exigido pelo provedor |
| INT-20 | SMTP | aplicação para servidor de email | STARTTLS quando o provedor exige |
| INT-21 | OAuth com o Google | bidirecional | HTTPS |

**INT-22** — Nenhuma informação pessoal é enviada a serviço de terceiros sem ação explícita da pessoa. O único envio automático é o email transacional, para o próprio endereço cadastrado.

---

### 3.2 Requisitos funcionais

Cada requisito segue o padrão: **verbo observável, condição e critério de aceite**. "O sistema DEVE" é obrigatório; "PODE" é opcional. Nenhum requisito contém "rápido", "fácil", "intuitivo" ou "robusto" sem medida.

Prioridade MoSCoW: **M** = MVP obrigatório, **S** = desejável, **C** = possível. Situação apurada em 05/10/2026.

#### 3.2.1 Conta e acesso

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-01 | O sistema DEVE permitir entrar com conta Google já verificada. | M | `/entrar` | E2E grupo `auth` | Atendido |
| RF-02 | O sistema DEVE permitir criar conta com nome completo, email e senha, e DEVE exigir a confirmação do email por link antes do primeiro acesso por senha. | M | `/entrar` | E2E `auth`; RN-12 | Atendido |
| RF-03 | O sistema DEVE enviar link de redefinição de senha ao email cadastrado e DEVE permitir definir a senha por esse link. | S | `/esqueci-senha`, `/redefinir-senha` | E2E `auth` | Atendido |
| RF-22 | O sistema DEVE permitir corrigir o próprio nome completo, preservando o email e a senha da conta. | S | `/conta` | E2E `auth` | Atendido |
| RF-23 | O sistema DEVE permitir à pessoa excluir a própria conta, mediante digitação do email da conta. | S | `/conta` | E2E `auth` e `admin` | Atendido |
| RF-24 | O sistema DEVE enviar email nos oito eventos da seção 3.2.6. | M | transversal | 13 asserções E2E sobre o log | Atendido |

#### 3.2.2 Turmas, vínculos e evento

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-04 | O sistema DEVE permitir, a quem não tem turma, entrar em uma turma por código de convite ou criar uma turma. | M | `/convite` | E2E `auth` e `participante` | Atendido |
| RF-05 | O sistema DEVE permitir ao administrador participar de mais de uma turma e escolher qual está em uso. | S | barra lateral | E2E `admin` | Atendido |
| RF-14 | O sistema DEVE exibir contagem regressiva, data, local e programação do evento. | M | `/dashboard` | E2E `app` | Atendido |
| RF-15 | O sistema DEVE permitir ao administrador editar os dados do evento e adicionar, editar e remover itens da programação. | M | `/admin/evento` | E2E `admin` | Atendido |
| RF-25 | O sistema DEVE permitir ao administrador **arquivar** e **desarquivar** a turma, com turma arquivada somente leitura. | S | `/admin/turma` | E2E `admin` | Atendido |
| RF-26 | O sistema DEVE permitir registrar presença com os valores `vou`, `talvez` e `nao`, e informar acompanhantes apenas quando o valor for `vou`. | M | `/admin/presenca` | `presenca-regras.test.ts`; E2E `admin` | Atendido |

#### 3.2.3 Votação

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-06 | O sistema DEVE permitir votar em enquetes de escolha única e múltipla, com opção exclusiva, e DEVE permitir **mudar** o voto já dado. | M | `/votacoes/[catalogoId]` | E2E `app`; RN-02 | Atendido no código; E2E só vota uma vez |
| RF-07 | O sistema DEVE gerar relatório por enquete com total, percentual e opção mais votada, **sem identificar** a pessoa que votou. | M | `/votacoes/relatorio` | E2E `admin`; RN-01 | Atendido |
| RF-08 | O sistema DEVE oferecer um catálogo padrão, igual para todas as turmas, e **não editável**. | M | `/votacoes` | RN-23 | Atendido |
| RF-09 | O sistema DEVE permitir ao administrador ver, por opção, quem votou e quem ainda não votou. | S | `/admin/votacoes/votos/[enqueteId]` | E2E `admin` | Atendido |
| RF-10 | O sistema DEVE permitir ao administrador criar, renomear e excluir catálogos próprios, com categorias e enquetes. | S | `/admin/votacoes` | E2E `admin` | Atendido |

#### 3.2.4 Comunicação e organização

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-11 | O sistema DEVE permitir enviar dúvida de 5 a 500 caracteres. | M | `/duvidas` | E2E `participante` | Atendido |
| RF-12 | O sistema DEVE permitir votar nas dúvidas dos colegas e DEVE ordenar a lista por destaque, votos e data decrescente. | S | `/duvidas` | E2E `participante` | Atendido |
| RF-13 | O sistema DEVE permitir ao administrador responder, destacar, reabrir e apagar dúvidas. | M | `/admin/duvidas` | E2E `admin` | Atendido |
| RF-27 | O sistema DEVE permitir ao administrador publicar avisos e DEVE permitir ao membro **editar o próprio** aviso. | S | `/admin/turma`, `/avisos` | E2E `app` cobre publicar, exibir e remover; a edição **não tem** passo | Atendido |
| RF-16 | O sistema DEVE permitir criar tarefas com título, descrição, responsável, prazo e status, e DEVE permitir ao membro alterar apenas o **status** das tarefas. | M | `/tarefas`, `/admin/turma` | E2E `app` e `participante` | Atendido |
| RF-17 | O sistema DEVE exibir vitrine de fornecedores por categoria e DEVE permitir ao administrador cadastrar, editar e remover fornecedor e orçamento. | S | `/terceiros` | `orcamento.test.ts`; E2E `app` | Atendido |

#### 3.2.5 Administração da plataforma

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-18 | O sistema DEVE permitir ao administrador promover, rebaixar e remover membros. | M | `/admin/membros` | E2E `admin`; RN-17 | Atendido |
| RF-19 | O sistema DEVE permitir ao administrador ver o código de convite, copiá-lo com mensagem pronta e gerar um novo código. | M | `/admin/convite` | `convite.test.ts`; E2E `admin` | Atendido |
| RF-20 | O sistema DEVE permitir ao master ver todas as turmas e todos os usuários e gerir os membros de qualquer turma. | C | `/master` | E2E `master` | Atendido |
| RF-21 | O sistema DEVE permitir ao master excluir turmas e usuários, com confirmação digitada. | C | `/master/turmas`, `/master/usuarios` | E2E `master` | Atendido |

#### 3.2.6 Notificação por email

| ID | Evento | Destinatário | Quando dispara | Sit. |
|---|---|---|---|---|
| EM-01 | Confirmação de email | a própria pessoa | no cadastro | Atendido |
| EM-02 | Boas-vindas | a própria pessoa | logo após a confirmação | Atendido |
| EM-03 | Definição de senha | a própria pessoa | ao pedir a redefinição | Atendido |
| EM-04 | Entrada na turma | a própria pessoa | só quando o vínculo é **novo** | Atendido |
| EM-05 | Saída da turma | a própria pessoa | ao sair, depois da transação | Atendido |
| EM-06 | Remoção da turma | **só** o membro removido | quando um administrador ou o master remove | Atendido |
| EM-07 | Exclusão da própria conta | a própria pessoa | ao excluir a conta | Atendido |
| EM-08 | Exclusão da conta por administrador | **só** o usuário excluído | quando o master exclui | Atendido |

**EM-09** — Nenhum email de turma ou conta é enviado a administrador ou master. A notificação é da ação **sobre** a pessoa afetada.

**EM-10** — O email de exclusão de conta DEVE citar as turmas em que a pessoa estava no momento da exclusão.

**EM-11** — Falha no envio do email **não** pode impedir a conclusão da ação que a originou. A falha DEVE ser registrada em log.

**EM-12** — O HTML do email DEVE conter endereço **somente** quando o site está publicado. Com `BETTER_AUTH_URL` apontando para `localhost`, `127.0.0.1`, `0.0.0.0` ou `[::1]`, ou com a variável ausente, o HTML DEVE ser emitido sem botão, sem endereço de reserva e sem endereço no rodapé. O texto puro DEVE continuar contendo o endereço, por ser o reserva para cliente que não mostra HTML.

---

### 3.3 Requisitos de desempenho, disponibilidade, testabilidade e nível de serviço

Esta seção é a normativa para desempenho, disponibilidade, recuperação, testabilidade e SLA. A seção 3.5 apenas remete a ela.

#### 3.3.1 Desempenho de resposta

| ID | Requisito | Situação |
|---|---|---|
| DES-01 | O sistema DEVE entregar a primeira byte de qualquer página autenticada em até **1,5 s**, com percentil 95, medido da rede do cliente ao primeiro byte, em conexão de 10 Mbps. | Não medido em produção |
| DES-02 | O sistema DEVE permitir resposta visual em até **200 ms** para alteração de estado local e **1,0 s** para resultado de Server Action, com percentil 95. | Parcial: validado por inspeção |
| DES-03 | O conteúdo principal de toda página DEVE estar no HTML entregue pela primeira resposta, sem depender de JavaScript. | Atendido: Server Components |
| DES-04 | Nenhuma animação DEVE bloquear a leitura ou a interação com o conteúdo. | Atendido |

#### 3.3.2 Capacidade

| ID | Requisito | Limite | Origem |
|---|---|---|---|
| CAP-01 | Membros por turma | 500 | Alvo de projeto; sem restrição declarativa |
| CAP-02 | Turmas por instância | 1.000 | Alvo de projeto; sem restrição declarativa |
| CAP-03 | Catálogos por turma | 10 | `src/actions/catalogos.ts:15` |
| CAP-04 | Categorias por catálogo | 20 | `src/actions/catalogos.ts:16` |
| CAP-05 | Enquetes por categoria | 50 | `src/actions/catalogos.ts:17` |
| CAP-06 | Acompanhantes por membro | 20 | `db/schema.sql:31` |
| CAP-07 | Conexões simultâneas no banco | 5 por instância, ajustável em `DB_POOL_MAX` | `.env.example:49` |
| CAP-08 | Tentativas de código de convite erradas | 10 a cada 15 minutos por pessoa | `src/actions/turmas.ts:38-39` |

Os limites CAP-01, CAP-02 e CAP-07 **não** são garantidos pelo código: são alvos de projeto que precisam de medição antes de qualquer afirmação de escala.

#### 3.3.3 Disponibilidade — janelas de execução

Três janelas distintas. Confundi-las é a origem mais comum de erro de operação.

| Janela | Definição | Valor | Condição |
|---|---|---|---|
| **JAN-01 — Operação** | Período em que o sistema **DEVE** atender requisições | **168 h por semana, 7 dias por semana, inclusive feriados** | Entre 01/03 e 30/11 |
| **JAN-02 — Mudança** | Janela única em que deploy, migração de banco e alteração de esquema são permitidos | Domingo, das **02:00 às 04:00**, horário de Brasília | Aviso prévio de 48 h no canal da equipe |
| **JAN-03 — Testes** | Janela em que a suíte automatizada pode rodar | Qualquer dia, **exclusivamente contra ambiente de teste**, nunca contra produção | Porta `3001`, sem `SMTP_HOST` |

**DIS-01** — O sistema DEVE estar disponível por **no mínimo 99,5%** do tempo da JAN-01, medido mês a mês por pings ao serviço de produção.

**DIS-02** — Indisponibilidade **não planejada** dentro da JAN-01 conta como tempo fora do ar. Janela de manutenção dentro da JAN-02 **não** conta.

**DIS-03** — O aviso de JAN-02 DEVE ser enviado com **48 h** de antecedência e DEVE conter a janela, o motivo e o responsável.

**DIS-04** — O código de convite mantém a mesma janela de execução do restante do sistema. Nenhuma etapa deixa de estar disponível por ser uma etapa com prazo.

#### 3.3.4 Recuperação de falhas

| ID | Situação | RTO | RPO | Como se recupera |
|---|---|---|---|---|
| REC-01 | Aplicação fora do ar, banco íntegro | **4 h** | 15 min | Relançar a versão anterior do deploy |
| REC-02 | Migração de banco com efeito colateral | **8 h** | **0**, sem perda | Restaurar backup do banco para o instante imediatamente anterior à migração. Backup é **obrigatório** antes de qualquer migração com `alter table` em tabela com dados. |
| REC-03 | Falha de envio de email por SMTP | Não se aplica: a ação do usuário **conclui** | 0 | Reprocessar pela fila de email. Ver EM-11. |
| REC-04 | Corrupção ou perda do banco | **24 h** | 15 min | Point-in-time recovery do fornecedor. Depende de PRE-01. |
| REC-05 | Sessão inválida em massa, por rotação de `BETTER_AUTH_SECRET` | **1 h** | 0 | Relogar as pessoas afetadas. A sessão é invalidada por assinatura. |

**REC-06** — **RPO de 15 minutos** é o alvo. A verificação é mensal, com restauração em ambiente isolado. Enquanto PRE-01 não for verificada, o RPO efetivo é **desconhecido** e não pode ser afirmado em documento voltado ao cliente.

**REC-07** — Não há backup próprio da aplicação: o código-fonte no Git **é** o backup da aplicação. Recriar um ambiente a partir do repositório e de `db/schema.sql` DEVE ser possível em até **2 h**.

#### 3.3.5 Testabilidade

**TEST-01** — Todo requisito funcional DEVE ter pelo menos **uma** verificação automatizada ou **uma** inspeção documentada, registrada na matriz 4.2. Requisito sem verificação é defeito do documento, não do produto.

**TEST-02** — A suíte unitária **DEVE** passar com **100%** dos testes verdes antes de qualquer integração. Hoje são **13 arquivos e 136 testes**, com limite de **60 s** de execução.

**TEST-03** — A verificação de tipos **DEVE** passar sem erro antes de qualquer integração. Comando: `npm run typecheck`.

**TEST-04** — O build de produção **DEVE** concluir sem erro antes de qualquer integração. Comando: `npm run build`.

**TEST-05** — O teste de ponta a ponta **DEVE** passar com **100%** dos passos verdes contra banco de teste, **nunca** contra produção. Hoje são **76 passos em 6 grupos**, executados por Chrome headless na porta `3001`.

**TEST-06** — O teste de ponta a ponta **DEVE** criar e remover seus próprios dados, identificando-os com o prefixo `teste-` no email e `TESTE` no código de convite, para permitir limpeza determinística (`scripts/teste/README.md:7-9`).

**TEST-07** — Sem `SMTP_HOST` configurado, o corpo completo do email **DEVE** ir para o log do servidor, incluindo o link de confirmação. Sem esse comportamento, os passos de confirmação e redefinição de senha ficam impossíveis de testar.

**TEST-08** — A cobertura de linhas do diretório `src/lib` DEVE ser de **no mínimo 80%**. **Status: não medida.** A métrica ainda não é coletada; o número é alvo, não resultado.

**TEST-09** — A auditoria de interface **DEVE** ser executada a cada integração, verificando estouro horizontal, alvo de toque e erro de console nas larguras 360, 768, 1024, 1440, 1920 e 3840 pixels (`scripts/teste/auditoria.mjs`).

**TEST-10** — A suíte **DEVE** ser determinística: repetida duas vezes seguidas sobre o mesmo banco de teste, **DEVE** produzir o mesmo resultado. Falta a criação dessa condição. Ver 4.5, divergência 4.

#### 3.3.6 Nível de serviço (SLA)

Severidades definidas por impacto real para o evento da formatura.

| Sev. | Definição | Exemplos | Primeira resposta | Resolução |
|---|---|---|---|---|
| **S1** | Sistema indisponível, ou função crítica inutilizável para **toda** a turma | Não é possível votar com a votação aberta; ninguém consegue entrar | **30 min** | **4 h** |
| **S2** | Função crítica inutilizável para **parte** dos usuários, com contorno disponível | Um participante não consegue enviar dúvida; catálogo não carrega para uma turma | **2 h** | **8 h** |
| **S3** | Falha com contorno, sem perda de dado | Email de notificação não enviado; faixa de arquivada não aparece | **8 h** | **3 dias úteis** |
| **S4** | Falha visual ou de texto, sem impacto em decisão | Rótulo desalinhado; texto de dica incorreto | **5 dias úteis** | **10 dias úteis** |

**SLA-01** — Os prazos contam em **horário comercial**, de segunda a sexta, das 08:00 às 18:00, horário de Brasília, excluindo feriados nacionais. **Fora desse horário, o prazo de first response começa no próximo dia útil às 08:00.**

**SLA-02** — Para S1 e S2, a contagem de prazo **não** é suspensa por indisponibilidade externa (provedor de banco, de hospedagem ou de email). O prazo corre.

**SLA-03** — Um incidente S1 DEVE gerar, em até **1 dia útil**, registro escrito contendo horário de início e fim, impacto em número de pessoas e de turmas, causa raiz e ação preventiva.

**SLA-04** — O alvo de disponibilidade da DIS-01 é o compromisso de disponibilidade. Não há compensação financeira contratual, por se tratar de projeto acadêmico sem relação comercial com terceiros. O SLA mede e promete **qualidade de resposta**, não indenização.

**SLA-05** — Os emails transacionais das EM-01 a EM-08 têm, quando há SMTP configurado, alvo de entrega de **99%** em até 60 s após o evento. Falha de SMTP é S3 e **não** impede a ação, por EM-11.

---

### 3.4 Restrições do sistema de software

| ID | Restrição | Verificação |
|---|---|---|
| SSR-01 | TypeScript com `strict: true`. `npm run typecheck` **não DEVE** produzir erro. | `tsconfig.json:8` |
| SSR-02 | Consultas SQL **DEVEM** usar parâmetros. Nenhum valor de formulário entra concatenado em SQL. | Inspeção de `src/lib/db.ts` e das actions |
| SSR-03 | Entrada de formulário **DEVE** ser validada com Zod **antes** de chegar ao banco. | Inspeção das actions |
| SSR-04 | Cookies de sessão e de turma em uso **DEVEM** ter `httpOnly` e `sameSite=lax`; `secure` é obrigatório em produção. | `src/lib/dal.ts:48-56` |
| SSR-05 | A sessão **DEVE** ser validada no banco em toda página protegida e em toda Server Action. O proxy por cookie **não** vale como autorização. | `src/lib/dal.ts:14-22` |
| SSR-06 | O banco **DEVE** recusar, por restrição declarativa, valor fora do domínio: `papel` fora de `admin`/`participante`, `status` de presença fora dos três valores, `acompanhantes` fora de 0 a 20, `max_acompanhantes` fora de 0 a 20. | `db/schema.sql:49,135,136,31` |
| SSR-07 | Segredos **DEVEM** ficar fora do Git. O `.gitignore` **DEVE** excluir `.env*`, exceto `.env.example`. | `.gitignore:34,46` |
| SSR-08 | O sistema **DEVE** emitir, em todas as respostas, os cabeçalhos `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy` com `camera`, `microphone` e `geolocation` desabilitadas. | `next.config.ts:3-11` |
| SSR-09 | Link de mapa informado pelo administrador **DEVE** ser aceito apenas se o esquema for `https` e o nome do host contiver ponto. `javascript:`, `data:` e `http` **DEVEM** ser recusados. | `src/lib/evento.ts:5-12` |
| SSR-10 | Conteúdo inserido por pessoa **DEVE** ser escapado antes de ir para o HTML do email. | `escapar` em `src/lib/email.ts`; `email.test.ts` |

#### 3.4.1 Restrições conhecidas e não resolvidas

Estas lacunas **não** estão resolvidas no código. Estão listadas para que ninguém as trate como atendidas.

| ID | Lacuna | Consequência |
|---|---|---|
| LAC-01 | **Não há limitação de taxa** para envio de dúvida nem para voto. O único limite é o de código de convite (`src/actions/turmas.ts:38-39`). | Um membro autenticado pode enviar muitas dúvidas em sequência, e o custo de envio de email cresce junto. |
| LAC-02 | **Não há token CSRF explícito.** Não existe menção a `csrf` ou `xsrf` no código. | A proteção depende de `sameSite=lax` e da verificação de origem do Better Auth. Não é falha comprovada, mas é defesa ausente. |
| LAC-03 | **Não há `Content-Security-Policy`** nem `Strict-Transport-Security`. | Reduz a defesa em profundidade que o CSS inline e o script de tema justificariam. |
| LAC-04 | **Não há telemetria** de erro, de desempenho ou de trajeto. | Nenhum número de DIS-01 pode ser medido hoje. Ver 3.6. |
| LAC-05 | **Não há rota de health check.** Não existe `/api/health` que responda sobre banco e sessão. | O monitoramento externo depende de chamar uma página autenticada. Ver MON-01. |
| LAC-06 | **Não há integração contínua.** Não existe arquivo de CI no repositório. | TEST-02, TEST-03 e TEST-04 dependem de disciplina manual. |
| LAC-07 | **`fornecedores.turma_id` aceita nulo**, porque a coluna foi adicionada por `alter table` (`db/schema.sql:207-208`). | Registro anterior à migração fica sem turma e **não aparece** em nenhuma listagem por turma. |

---

### 3.5 Atributos de qualidade do software

Cada linha remete à seção normativa. A obrigação está lá, não aqui.

| ID | Atributo | ISO 25010 | Requisito normativo |
|---|---|---|---|
| RNF-01 | Usabilidade | Usabilidade | Interface em português, com estados de carregando, erro, vazio e não encontrada; INT-01 a INT-05 |
| RNF-02 | Responsividade | Compatibilidade | Sem rolagem horizontal de 360 px a 3840 px; INT-07 |
| RNF-03 | Acessibilidade | Usabilidade | Navegação por teclado, foco visível, contraste 4,5:1; INT-08, INT-12 |
| RNF-04 | Estabilidade de entrega | Confiabilidade | Conteúdo no HTML da primeira resposta; DES-03 |
| RNF-05 | Segurança de acesso | Segurança | Sessão validada no banco em toda página e ação; área master em 404; SSR-05, INT-11 |
| RNF-06 | Segurança de dados | Segurança | Validação Zod, SQL parametrizado, cabeçalhos HTTP, limite de convite; SSR-02, SSR-03, SSR-08, CAP-08 |
| RNF-07 | Privacidade | Anônimato | Segredos fora do Git; relatório sem identificação; SSR-07, RN-01 |
| RNF-08 | Manutenibilidade | Manutenibilidade | TypeScript, código organizado por área, 136 testes automatizados; SSR-01, TEST-02 |
| RNF-09 | Portabilidade | Portabilidade | Rodar com Node 22 e PostgreSQL seguindo o README; RES-01, REC-07 |
| RNF-10 | Compatibilidade | Compatibilidade | Navegadores atuais baseados em Chromium; testado no Chrome |
| RNF-11 | Disponibilidade e continuidade | Confiabilidade | **3.3.3** e **3.3.4**: JAN-01, JAN-02, DIS-01, REC-01 a REC-07 |
| RNF-12 | Nível de serviço | Confiabilidade | **3.3.6**: severidades S1 a S4, SLA-01 a SLA-05 |
| RNF-13 | Testabilidade | Manutenibilidade | **3.3.5**: TEST-01 a TEST-10 |
| RNF-14 | Observabilidade | Manutenibilidade | **3.6**: MON-01 a MON-16 |

---

### 3.6 Outros requisitos — monitoramento e operação

**Esta seção é normativa.** Monitoramento do Formandos é hoje **inexistente**: não há telemetria, não há alerta, não há agregação de log (ver LAC-04). O que segue é o que **deve** existir, com o nível de maturidade explicitado. Nenhum item desta seção pode ser descrito como atendido.

#### 3.6.1 Sinais a monitorar

| ID | Sinal | Origem | Limite de alerta | Sev. |
|---|---|---|---|---|
| MON-01 | **Disponibilidade externa.** Pings ao endpoint público a cada minuto, de ponto externo à hospedagem | Monitor sintético | 3 falhas consecutivas | S1 |
| MON-02 | **Saúde do banco.** Rota que responde sobre conexão e consulta trivial | Aplicação | 1 falha | S1 |
| MON-03 | **Taxa de erro 5xx** | Log da hospedagem | acima de 1% em 5 min | S2 |
| MON-04 | **Latência de resposta** | Log da hospedagem | p95 acima de 3 s por 15 min | S2 |
| MON-05 | **Saturação do pool de conexões** | Métrica de processo | acima de 80% de `DB_POOL_MAX` | S2 |
| MON-06 | **Falha de envio de email** | `enviarEmailSilencioso` | qualquer ocorrência | S3 |
| MON-07 | **Erro capturado em Server Action** | `console.error` | qualquer ocorrência | S3 |
| MON-08 | **Login recusado** | Better Auth | 10 falhas na mesma conta em 5 min | S3 |
| MON-09 | **Limite de convite atingido** | `tentativas_convite` | 10 por pessoa em 15 min | S4 |
| MON-10 | **Exclusão destrutiva executada** | log da aplicação | qualquer ocorrência | S4, com aviso à equipe |
| MON-11 | **Fim da JAN-02 sem aviso prévio** | processo de deploy | qualquer ocorrência | S3 |

**MON-10** e **MON-11** não são falhas: são registros de que algo destrutivo aconteceu. Recebem alerta para que ninguém descubra uma exclusão por ausência.

#### 3.6.2 Comportamento de falha por sinal

**MON-12** — Falha de SMTP **não** pode ser registrada apenas em log de aplicação. Precisa gerar alerta, porque EM-11 faz o usuário não perceber a falha.

Este é o ponto mais delicado do monitoramento do Formandos. O sistema trata falha de email como não fatal por escolha (EM-11), o que é correto para quem está usando. O efeito colateral é que **uma queda inteira do provedor de SMTP é invisível** para o usuário: a conta é criada, a senha é redefinida, a pessoa entra, e nenhum email chega. Sem alerta em MON-06, o time só descobre o problema quando alguém pergunta por que não recebeu a confirmação.

#### 3.6.3 Registro e retenção

| ID | Requisito | Situação |
|---|---|---|
| MON-13 | Todo evento de escrita **DEVE** registrar: horário em ISO 8601, identificador do usuário, identificador da turma, ação e resultado. | Parcial: existe `console.error` em caminho de falha, sem registro estruturado de sucesso |
| MON-14 | Nenhum log **DEVE** conter senha, token de sessão, token de confirmação, token de redefinição ou corpo de senha. | Atendido por construção: a senha nunca entra no log |
| MON-15 | A retenção de log **DEVE** ser de **no mínimo 30 dias**, para permitir a análise de incidente S1. | A definir conforme o plano contratado |
| MON-16 | Com `SMTP_HOST` ausente, o corpo do email transacional, **incluindo o link de confirmação**, vai para o log do servidor. Isso é comportamento de desenvolvimento e **não** é aceitável em produção: em produção a ausência de SMTP **DEVE** gerar alerta em vez de silêncio. | Pendente: hoje é silêncio |

---

## 4. Anexos

### 4.1 Cenários em Gherkin

Vocabulário em português, conforme a convenção da comunidade Gherkin em português do Brasil. Equivalência: **Dado** = `Given`, **Quando** = `When`, **Então** = `Then`, **E** = `And`, **Mas** = `But`.

#### E.G.01 — Cadastro e confirmação de email (RF-02, RN-12)

```gherkin
Funcionalidade: Cadastro com confirmação de email
  Cenário: Cadastro válido conclui e leva a confirmação
    Dado uma pessoa sem conta
    Quando ela se cadastra com nome "Ana Souza", email "ana@example.invalid"
      e senha "Senha12345"
    Então o cadastro é aceito
    E a sessão ainda não é iniciada
    E um email de confirmação é enviado para "ana@example.invalid"
```

```gherkin
Funcionalidade: Cadastro com confirmação de email
  Cenário: Login por senha é recusado antes da confirmação
    Dado uma conta cadastrada com email "ana@example.invalid"
    E o email dessa conta ainda não foi confirmado
    Quando ela tenta entrar com a senha correta
    Então o acesso é recusado
    E o sistema informa que o email precisa ser confirmado
```

#### E.G.02 — Definição de senha (RF-03)

```gherkin
Funcionalidade: Recuperação de senha
  Cenário: Pedido de redefinição gera link utilizável
    Dado uma conta com email "ana@example.invalid" confirmado
    Quando a pessoa pede a redefinição de senha
    Então um email de definição de senha é enviado
    E o link recebido leva à rota de redefinição
    E ao seguir o link, a nova senha passa a valer
```

#### E.G.03 — Entrada por código de convite (RF-04, RN-13, RN-14)

```gherkin
Funcionalidade: Entrada em turma por convite
  Cenário: Código válido cria o vínculo e notifica a entrada
    Dado uma pessoa autenticada e sem turma
    E uma turma com código de convite "TESTESH0001"
    Quando ela envia o código "TESTESH0001"
    Então ela passa a ser membro da turma com papel "participante"
    E um email de entrada na turma é enviado
    E a pessoa é levada ao painel
```

```gherkin
Funcionalidade: Entrada em turma por convite
  Cenário: Código inválido é recusado e conta como tentativa
    Dado uma pessoa autenticada e sem turma
    Quando ela envia o código "ZZZZZZZZ"
    Então o sistema informa que o código não confere
    E nenhuma turma é criada para ela
    E uma tentativa é registrada
```

```gherkin
Funcionalidade: Entrada em turma por convite
  Cenário: Décima tentativa errada trava a entrada por 15 minutos
    Dado uma pessoa autenticada e sem turma
    E que já errou o código 10 vezes nos últimos 15 minutos
    Quando ela envia qualquer código
    Então o sistema recusa a tentativa
    E informa que o número de tentativas foi esgotado
```

#### E.G.04 — Votação (RF-06, RF-07, RN-01, RN-02, RN-08, RN-24)

```gherkin
Funcionalidade: Votação em enquetes
  Cenário: Voto em opção exclusiva desmarca as demais
    Dado uma enquete de múltipla escolha com uma opção exclusiva "Nenhuma"
    E a pessoa já votou na opção "Festa"
    Quando ela marca "Nenhuma"
    Então o voto em "Festa" é removido
    E só "Nenhuma" fica marcada
```

```gherkin
Funcionalidade: Votação em enquetes
  Cenário: Voto é substituído em vez de somado
    Dado uma pessoa que votou na opção A de uma enquete
    Quando ela vota na opção B da mesma enquete
    Então a pessoa tem exatamente 1 voto naquela enquete
    E esse voto está na opção B
```

```gherkin
Funcionalidade: Votação em enquetes
  Cenário: Voto é recusado depois que a decisão foi fixada
    Dado uma enquete com decisão fixada na opção "Sim"
    Quando uma pessoa tenta votar
    Então o voto é recusado
    E o motivo informado é que a decisão já está fechada
```

```gherkin
Funcionalidade: Relatório de votação
  Cenário: Relatório não identifica quem votou
    Dado uma enquete com votos de 3 pessoas
    Quando a pessoa abre o relatório
    Então o relatório mostra total, percentual e opção mais votada
    E o relatório não exibe nenhum nome de pessoa
```

#### E.G.05 — Saída e remoção (RF-18, RN-04, RN-17, RN-19, RN-20, EM-05, EM-06)

```gherkin
Funcionalidade: Saída de turma
  Cenário: Último membro sair apaga a turma
    Dado uma turma em que a pessoa é o único membro
    Quando ela sai da turma
    Então a turma é apagada do banco
    E um email de saída é enviado informando que o código não serve mais
```

```gherkin
Funcionalidade: Saída de turma
  Cenário: Único administrador é impedido de sair
    Dado uma turma com 3 membros
    E a pessoa é o único administrador
    Quando ela tenta sair
    Então a saída é recusada
    E o motivo informado é que ela precisa promover outro administrador
```

```gherkin
Funcionalidade: Remoção de membro
  Cenário: Administrador não pode remover a si mesmo
    Dado um administrador dentro da própria turma
    Quando ele tenta se remover da lista de membros
    Então a remoção é recusada
    E ele continua como administrador da turma
```

```gherkin
Funcionalidade: Remoção de membro
  Cenário: Remoção por administrador notifica só o removido
    Dado uma turma com o participante "João Lima" e um administrador
    Quando o administrador remove "João Lima" da turma
    Então "João Lima" deixa de ser membro
    E um email de remoção é enviado para "João Lima"
    E nenhum email é enviado ao administrador
```

#### E.G.06 — Exclusões com confirmação (RF-21, RF-23, RN-15, RN-16, EM-07, EM-08, EM-10)

```gherkin
Funcionalidade: Exclusão da própria conta
  Cenário: Confirmação com email diferente da conta é recusada
    Dado uma conta com email "ana@example.invalid"
    Quando ela solicita a exclusão e digita "outro@example.invalid" na confirmação
    Então a exclusão é recusada
    E a conta continua existindo
```

```gherkin
Funcionalidade: Exclusão da própria conta
  Cenário: Exclusão concluída apaga a conta e cita as turmas
    Dado uma conta que é membro de "Sistemas de Informação 2026"
    Quando ela solicita a exclusão e digita o próprio email na confirmação
    Então a conta é apagada do banco
    E um email de exclusão é enviado citando "Sistemas de Informação 2026"
    E a pessoa é levada à tela de entrada
```

```gherkin
Funcionalidade: Exclusão de turma
  Cenário: Confirmação com nome diferente do da turma é recusada
    Dado uma turma chamada "Sistemas de Informação 2026"
    Quando o administrador digita "Turma Errada" na confirmação de exclusão
    Então a exclusão é recusada
    E a turma continua existindo
```

#### E.G.07 — Permissões (INT-11, RN-04, RNF-05)

```gherkin
Funcionalidade: Área do master
  Cenário: Quem não é master recebe 404 na área do master
    Dado uma pessoa autenticada que não está em ADMIN_MASTER_EMAILS
    Quando ela acessa "/master/usuarios"
    Então a resposta é 404
    E o corpo não revela a existência da área master
```

```gherkin
Funcionalidade: Permissões de turma
  Cenário: Participante não altera status de tarefa alheia
    Dado uma tarefa atribuída a outro membro da turma
    Quando um participante que não é responsável tenta mudar o status
    Então a alteração é recusada
    E o status da tarefa permanece igual
```

#### E.G.08 — Presença e acompanhantes (RF-26, RN-22)

```gherkin
Funcionalidade: Registro de presença
  Cenário: Acompanhantes valem só para quem vai
    Dado uma pessoa que registrou presença com status "talvez" e 4 acompanhantes
    Quando a presença e salva
    Então o número de acompanhantes é gravado como 0
```

```gherkin
Funcionalidade: Registro de presença
  Cenário: Reduzir o limite corta respostas acima do novo teto
    Dado uma turma cujo limite de acompanhantes é 20
    E um membro que registrou 15 acompanhantes
    Quando o administrador reduz o limite para 10
    Então a resposta daquele membro passa a 10 acompanhantes
```

#### E.G.09 — Notificação (EM-11, EM-12)

```gherkin
Funcionalidade: Notificação por email
  Cenário: Falha de SMTP não impede a conclusão da ação
    Dado o servidor de email indisponível
    Quando uma pessoa entra em uma turma com código válido
    Então ela entra na turma normalmente
    E a falha de envio é registrada em log
```

```gherkin
Funcionalidade: Notificação por email
  Cenário: Email de desenvolvimento não expõe endereço local
    Dado o site rodando em "http://localhost:3001"
    Quando um email é montado
    Então o HTML não contém "localhost"
    E o HTML não contém botão nem endereço de reserva
    E o texto puro ainda contém o endereço
```

---

### 4.2 Matriz de rastreabilidade

| Requisito | Cenário Gherkin | Verificação automatizada | Situação |
|---|---|---|---|
| RF-01 | — | E2E `auth` | Atendido |
| RF-02 | E.G.01 | E2E `auth` | Atendido |
| RF-03 | E.G.02 | E2E `auth` | Atendido |
| RF-04 | E.G.03 | E2E `auth` | Atendido |
| RF-05 | — | E2E `auth` | Atendido |
| RF-06 | E.G.04 | E2E `app` | Parcial: a troca de voto não tem passo |
| RF-07 | E.G.04 | E2E `admin` | Atendido |
| RF-08 | — | RN-23 | Atendido |
| RF-09 | — | E2E `admin` | Atendido |
| RF-10 | — | E2E `admin` | Atendido |
| RF-11 | — | E2E `participante` | Atendido |
| RF-12 | — | E2E `participante` | Atendido |
| RF-13 | — | E2E `admin` | Atendido |
| RF-14 | — | E2E `app` | Atendido |
| RF-15 | — | E2E `admin` | Atendido |
| RF-16 | E.G.07 | E2E `app` | Atendido: só o caminho permitido. O caso negado de E.G.07 **não tem** passo |
| RF-17 | — | `orcamento.test.ts` | Atendido |
| RF-18 | E.G.05 | E2E `admin` | Atendido |
| RF-19 | — | `convite.test.ts` | Atendido |
| RF-20 | — | E2E `master` | Atendido |
| RF-21 | E.G.06 | E2E `master` | Atendido |
| RF-22 | — | E2E `auth` | Atendido |
| RF-23 | E.G.06 | E2E `auth` e `admin` | Atendido |
| RF-24 | E.G.09 | 13 asserções E2E sobre email | Atendido |
| RF-25 | — | E2E `admin` | Atendido |
| RF-26 | E.G.08 | `presenca-regras.test.ts` | Atendido |
| RF-27 | — | E2E `app`, parcial | Parcial: edição sem teste |
| EM-01 a EM-08 | E.G.03, E.G.05, E.G.06, E.G.09 | `email.test.ts` e E2E | Atendido |
| EM-11 | E.G.09 | `email.test.ts` | Atendido |
| EM-12 | E.G.09 | `email.test.ts` | Atendido |
| RNF-11 | — | — | **Pendente**: 3.3.3 e 3.3.4 |
| RNF-12 | — | — | **Pendente**: 3.3.6 |
| RNF-13 | — | TEST-02 a TEST-10 | Parcial: TEST-08 e TEST-10 pendentes |
| RNF-14 | — | — | **Pendente**: seção 3.6 inteira |

**Cobertura: 27 requisitos funcionais, 27 com verificação automatizada. 14 atributos de qualidade, dos quais 3 estão pendentes ou parciais.**

---

### 4.3 Regras de negócio

| ID | Regra | Verificação |
|---|---|---|
| RN-01 | O voto é identificado, mas o relatório mostra **apenas** totais. Somente o administrador vê quem votou. | `src/app/(app)/votacoes/relatorio/page.tsx` |
| RN-02 | Mudar de voto apaga os votos da enquete e grava os novos, **numa única transação**, com trava de escrita por pessoa. | `src/actions/votos.ts:60-81` |
| RN-03 | Só quem não tem turma, ou é administrador em alguma turma, pode entrar em outra. | `src/lib/vinculos.ts:8-10` |
| RN-04 | O único administrador não pode ser rebaixado, removido nem sair enquanto houver outros membros. | `src/actions/turmas.ts:219-226`, `src/actions/admin.ts:50-54`, `src/actions/master.ts:48-52,82-84` |
| RN-05 | Se o último membro sair, a turma é apagada. | `src/actions/turmas.ts:230-234` |
| RN-06 | O login por senha só vale depois de confirmar o email. | `src/lib/auth.ts:70` |
| RN-07 | O sistema aceita no máximo 10 códigos de convite errados a cada 15 minutos, por pessoa. Tentativas com mais de 1 dia são apagadas. | `src/actions/turmas.ts:118-141` |
| RN-08 | Em múltipla escolha, marcar a opção exclusiva desmarca as demais, e vice-versa. | `src/actions/votos.ts:32-58` |
| RN-09 | O catálogo padrão é somente leitura e igual para todas as turmas. | `src/lib/catalogo-visibilidade.ts:12-15` |
| RN-10 | O nome completo tem de 2 a 120 caracteres, com espaços internos normalizados. | `src/actions/conta.ts:32`, `form-email-senha.tsx:124` |
| RN-11 | A senha tem no mínimo 8 caracteres. | `src/lib/auth.ts:70` |
| RN-12 | O email precisa estar confirmado para o primeiro acesso por senha. | `src/lib/auth.ts:71` |
| RN-13 | O código de convite tem 8 caracteres do alfabeto `ABCDEFGHJKMNPQRSTUVWXYZ23456789`, sem `0`, `O`, `1`, `I` e `L`. A entrada é normalizada sem espaços e hífen, em maiúsculas. | `src/lib/convite.ts:4-17` |
| RN-14 | O código de convite aceita de 6 a 20 caracteres na entrada. | `src/actions/turmas.ts:31-36` |
| RN-15 | Excluir a própria conta exige digitar o **email** da conta. | `src/actions/conta.ts:67-69` |
| RN-16 | Excluir turma exige digitar o **nome** da turma. | `src/actions/gestao-turma.ts:30-53` |
| RN-17 | Um administrador não pode remover a si mesmo. | `src/actions/admin.ts:68` |
| RN-18 | O master não pode rebaixar ou remover o último admin de uma turma, não exclui a si mesmo e não exclui outro master. | `src/actions/master.ts:48-52,82-84,150-163` |
| RN-19 | Ao sair, o rastro pessoal é apagado: votos, presenças, dúvidas próprias e upvotes dados. A autoria fica sem dono: decisões, avisos e tarefas permanecem, com o responsável esvaziado. | `src/lib/saida-turma.ts:13-40` |
| RN-20 | Turma de membro único é apagada junto com a saída. | `src/actions/turmas.ts:230-234` |
| RN-21 | Link de mapa só é aceito com `https` e nome de host contendo ponto. | `src/lib/evento.ts:5-12` |
| RN-22 | Acompanhantes só existem quando a presença é `vou`. O teto é o limite da turma, entre 0 e 20, com padrão 5. Reduzir o limite corta as respostas acima do novo teto, na mesma transação. | `src/lib/presenca-regras.ts:14-39`, `src/actions/presenca.ts:76-95` |
| RN-23 | Catálogo padrão é global e somente leitura; catálogo de turma é visível só para a própria turma. | `src/lib/catalogo-visibilidade.ts:12-15` |
| RN-24 | Voto em enquete com decisão fixada é recusado. | `src/actions/votos.ts:66-84` |
| RN-25 | Fixar decisão em enquete de escolha única exige exatamente 1 opção. Em múltipla, não aceita opção exclusiva combinada. Reabrir apaga a decisão. | `src/actions/decisoes.ts:49-89` |
| RN-26 | Limites por turma: 10 catálogos, 20 categorias, 50 enquetes por categoria. | `src/actions/catalogos.ts:15-17` |
| RN-27 | Já sendo membro da turma, a pessoa segue direto para o painel, **sem** email novo. | `src/actions/turmas.ts:143-150` |
| RN-28 | Email de exclusão cita as turmas **do momento da exclusão**, lidas antes do `delete`. | `src/lib/usuarios.ts:14-53` |

---

### 4.4 Requisitos de teste derivados

| ID | Teste | Tipo | Origem |
|---|---|---|---|
| TD-01 | Suíte unitária verde antes de integração | automatico | TEST-02 |
| TD-02 | Verificação de tipos sem erro | automatico | TEST-03 |
| TD-03 | Build de produção sem erro | automatico | TEST-04 |
| TD-04 | 76 passos de ponta a ponta verdes | automatico | TEST-05 |
| TD-05 | Auditoria de interface em 6 larguras | automatico | TEST-09 |
| TD-06 | Cobertura de linhas de `src/lib` acima de 80% | automatico | TEST-08 |
| TD-07 | Suíte repetida duas vezes com o mesmo resultado | automatico | TEST-10 |
| TD-08 | Restauração de backup verificada em ambiente isolado | manual | REC-06 |
| TD-09 | Recriação de ambiente a partir do repositório em até 2 h | manual | REC-07 |
| TD-10 | Contraste de 4,5:1 conferido em todas as telas | manual | INT-12 |

---

### 4.5 Divergências conhecidas

Registradas para que ninguém trate documentação antiga como verdade.

| # | Onde diz | O que o código faz | Correção |
|---|---|---|---|
| 1 | `README.md:127` e `README.md:334`: "somente o autor apaga dúvida" e "a comissão não pode excluir dúvida de outra pessoa". | O administrador **tem** `apagarDuvida`, usada em `/admin/duvidas` (`src/actions/admin.ts:144-153`). O comentário em `src/actions/duvidas.ts:57-58` confirma a moderação pela comissão. | README precisa ser corrigido. RF-13 já descreve o comportamento real. |
| 2 | `db/schema.sql:149`: "avisos não têm edição". | Existe `atualizarAviso` (`src/actions/avisos.ts:43-60`), usada em `/avisos`. | Comentário do schema desatualizado. RF-27 reflete o código. |
| 3 | `README.md:214`: 10 arquivos de teste unitário. | São **13** arquivos, com **136** testes. `auth-config.test.ts` e `tema.test.ts` não são citados. | README precisa ser corrigido. |
| 4 | TEST-10 exige suíte determinística. | A primeira requisição autenticada da suíte depende de compilação fria, o que já produziu falha por tempo. Foi corrigido com aquecimento, mas a condição não está formalmente verificada. | Lacuna do requisito, não do código. |
| 5 | LAC-07: `fornecedores.turma_id` aceita nulo. | Registro anterior à migração fica sem turma e não aparece em listagem por turma. | Exige migração de dados ou filtro explícito. |

---

## 5. Histórico de revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 05/10/2026 | Equipe Formandos | Emissão inicial. Estrutura conforme IEEE 830-1998. Requisitos funcionais RF-01 a RF-27, regras RN-01 a RN-28 e atributos RNF-01 a RNF-14. Disponibilidade, recuperação, testabilidade e SLA nas seções 3.3.3 a 3.3.6. Monitoramento na seção 3.6, com as lacunas declaradas. Vinte e dois cenários em Gherkin, matriz de rastreabilidade e requisitos de teste derivados no anexo 4. |