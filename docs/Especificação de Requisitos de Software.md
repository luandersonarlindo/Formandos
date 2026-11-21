# Especificação de Requisitos de Software (ERS)

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Documento** | Especificação de Requisitos de Software (ERS) |
| **Padrão** | IEEE 830-1998 — *IEEE Recommended Practice for Software Requirements Specifications* |
| **Versão** | 2.0 |
| **Data** | 16/11/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |
| **Estado do produto** | MVP mais as decisões das ADR-0001 a ADR-0016, rodando em Docker na máquina local (`compose.yaml`). Sem hospedagem pública contratada até a data desta versão. |

---

## 1. Introdução

### 1.1 Propósito

Este documento especifica os requisitos do sistema **Formandos**, software web que organiza a preparação de formaturas: turmas, votações com regra, dinheiro da turma, presença, comunicação, evento e o fim do ciclo da turma.

Serve para quatro públicos ao mesmo tempo:

1. **Quem vai desenvolver** — encontra, para cada requisito, onde ele está no código e a ADR que o decidiu.
2. **Quem vai verificar** — encontra, para cada requisito, o teste automatizado ou a inspeção que o comprova.
3. **Quem vai avaliar** — encontra, na estrutura do IEEE 830-1998, cada seção exigida por norma.
4. **Quem vai operar** — encontra, nas seções 3.3 e 3.6, as janelas de execução, a recuperação, o nível de serviço e o que precisa ser monitorado.

A fonte de verdade deste documento é o **código do repositório**, conferido em 16/11/2026. Onde o código e a documentação divergem, o código prevalece e a divergência está na seção 4.5. As decisões de projeto estão nas ADRs (`docs/adr/`). As necessidades levantadas com usuários sintéticos estão em `docs/simulacoes/levantamento.md` (rodada 1) e `docs/simulacoes/levantamento-rodada-2.md` (rodada 2); os requisitos que vêm delas e ainda não foram feitos aparecem como **Proposto**.

### 1.2 Escopo

#### 1.2.1 Dentro do escopo

- Conta: cadastro só para maiores de 18 anos, confirmação de email, entrada por senha ou Google, redefinição de senha, correção do nome, preferência de email, exportação dos próprios dados e exclusão da conta.
- Papéis na turma: **participante**, **administrador** (com a marcação opcional de **tesouraria**) e **observador**. Papel de plataforma: **master**.
- Turma: criação, entrada por código, por link com código e por convite por lista de emails, troca de turma, saída, arquivamento com prazo de exclusão e exclusão automática.
- Votação: catálogo padrão, modelos por tipo de turma, catálogos próprios, escolha única e múltipla com opção exclusiva, valor por pessoa e link por opção, prazo e participação mínima por pergunta, voto secreto por pergunta, decisão fixada com justificativa quando foge da regra, relatório agregado e histórico.
- Dinheiro: plano de parcelas, lançamentos (pagamento, devolução, ajuste), "Já paguei" informado pela pessoa e confirmado pela tesouraria, "Minha situação" privada, caixa da turma só com totais, importação de pagamentos por colagem e planilha de situação por pessoa. O sistema **registra**, não recebe dinheiro.
- Evento: dados, programação, "Mudou em", página pública por link sem conta, presença com nome de cada acompanhante e prazo, lista da portaria.
- Comunicação: avisos, dúvidas com votação entre colegas, tarefas, fornecedores com orçamento, texto pronto para o grupo de WhatsApp ("Mandar para o grupo") e emails essenciais.
- Exportação: planilhas CSV da turma, registro da turma em PDF e "Meus dados".
- Confiança: Termos de Uso, Política de Privacidade, encarregado de dados, histórico visível, cópia de segurança com prazo e compromisso de aviso em caso de encerramento.
- Administração da plataforma pelo master.

#### 1.2.2 Fora do escopo

| Item | Motivo |
|---|---|
| Aplicativo de loja e funcionamento sem internet | O produto é web e responsivo. |
| Receber ou processar pagamento (Pix, boleto, cartão) | O sistema registra; o dinheiro passa por fora (ADR-0005). |
| Mensagem automática no WhatsApp pela API oficial | Avaliada e não adotada (ADR-0016). O canal é o texto pronto (ADR-0004). |
| Notificação no celular (push) | Não decidido; o canal é email e o texto pronto. |
| Conta para menor de 18 anos; papel de responsável ligado ao aluno; voto por família | Decidido fora (ADR-0011). Ver DEC-01. |
| Anexo de arquivos (comprovante, contrato, foto, vídeo) | Fora por decisão de escopo (levantamento da rodada 1, item 3.8). Ver RF-65. |
| Ingresso, QR code e check-in na portaria | Fora; a portaria usa a lista impressa (ADR-0013). |
| Juros e multa calculados pelo sistema | Fora; a diferença entra como ajuste (ADR-0014). |
| Login por rede social além do Google | Não pedido. |

### 1.3 Definições, acrônimos e abreviaturas

| Termo | Significado neste documento |
|---|---|
| **Turma** | Grupo de formandos com um código de convite próprio. Unidade de isolamento de todos os dados. |
| **Membro** | Relação entre uma pessoa e uma turma. |
| **Papel** | Permissão do membro na turma. O banco aceita `admin`, `participante` e `observador` (`db/schema.sql:49`). |
| **Comissão** | Os membros com papel `admin` de uma turma. |
| **Tesouraria** | Marcação de um administrador (`membros.tesouraria`) que dá acesso ao dinheiro de cada pessoa. Pode haver mais de uma na turma (ADR-0005). |
| **Observador** | Papel que vê tudo da turma, não vota e não administra; pensado para professor e coordenação (ADR-0012). |
| **Master** | Papel de plataforma, sem turma, definido só pela lista `ADMIN_MASTER_EMAILS` com email confirmado (`src/lib/master.ts`). |
| **Catálogo** | Conjunto de categorias e perguntas (enquetes). Catálogo com `turma_id` nulo é o padrão, global e somente leitura. |
| **Modelo de catálogo** | Catálogo pronto por tipo de turma (`docs/catalogos-modelo/*.md`) que a comissão copia e edita. |
| **Enquete / pergunta** | Pergunta de escolha `unica` ou `multipla`. |
| **Opção exclusiva** | Opção que não pode ser combinada com outras. |
| **Regra da pergunta** | Prazo e participação mínima combinados para uma pergunta (`regras_enquete`). |
| **Decisão** | Opção fixada pela comissão, com a "fotografia" do dia (votantes e membros) e, se fugir da regra, os motivos e a justificativa. |
| **Fora da regra** | Decisão sem votos, que não é a mais votada, em empate, sem a participação mínima ou antes do prazo (`src/lib/decisao-regras.ts`). |
| **Voto secreto** | Pergunta em que nenhuma tela e nenhuma planilha mostra quem votou em quê (ADR-0010). |
| **Plano de parcelas** | Valor e vencimentos combinados para a turma (até 60 parcelas). |
| **Lançamento** | Pagamento, devolução ou ajuste de uma pessoa. Estados: `informado`, `confirmado`, `recusado`. |
| **Minha situação** | Tela privada da pessoa com o que pagou, o que falta e o que vence. |
| **Página pública do evento** | Página `/evento/[token]`, sem conta, com os dados do evento para família, convidados e fornecedores (ADR-0008). |
| **Mudou em** | Aviso da última mudança de data, horário, local ou endereço, mostrado por 14 dias. |
| **Mandar para o grupo** | Botão que monta o texto pronto e abre o WhatsApp para a comissão colar no grupo (ADR-0004). |
| **Registro da turma** | Página para imprimir ou salvar em PDF com decisões, totais e histórico, sem dado pessoal além dos nomes da comissão (ADR-0007). |
| **Turma arquivada** | Turma somente leitura, com data de exclusão marcada (ADR-0009). |
| **ERS** | Este documento. Equivale ao SRS do IEEE 830-1998. |
| **RF / RN / RNF** | Requisito funcional / regra de negócio / requisito não funcional. |
| **EM** | Requisito de email. |
| **DEC** | Decisão de produto pendente (seção 3.2.11). |
| **RTO / RPO** | Tempo máximo para restaurar o serviço / perda máxima de dados aceitável. |
| **SLA** | Acordo de qualidade e prazos de atendimento. |
| **E.G.** | Cenário em Gherkin, seção 4.1. |

### 1.4 Referências

| Documento | Uso nesta especificação |
|---|---|
| IEEE 830-1998 | Estrutura das seções 1, 2 e 3. |
| ISO/IEC 25010:2011 | Taxonomia dos atributos de qualidade (3.5). |
| WCAG 2.1 nível AA | Contraste e acessibilidade (INT-12, RNF-03). |
| Lei 13.709/2018 (LGPD) | Base das regras de dados pessoais, retenção e exclusão. |
| `docs/adr/0001` a `0016` | Decisões que originam os requisitos RF-28 a RF-54 e as regras RN-29 a RN-43. |
| `docs/simulacoes/levantamento.md` | Achados da rodada 1 de simulações (letras A a O). |
| `docs/simulacoes/levantamento-rodada-2.md` | Achados da rodada 2; origem dos requisitos **Propostos** (RF-55 a RF-70) e das decisões DEC-01 a DEC-05. |
| `docs/entregas/15-09-2026/Requisitos Prioritários.md` | Origem dos identificadores RF-01 a RF-21, RN-01 a RN-09 e RNF-01 a RNF-10, mantidos aqui. |
| `db/schema.sql` | Estrutura do banco e restrições declarativas. |
| `README.md` | Execução, Docker e variáveis de ambiente. |

### 1.5 Visão geral

O sistema tem seis áreas, na ordem em que a pessoa as encontra:

1. **Pública** — vitrine (`/`), entrada e cadastro (`/entrar`), senha (`/esqueci-senha`, `/redefinir-senha`), `/termos`, `/privacidade` e a página do evento (`/evento/[token]`).
2. **Onboarding** — `/convite`, com ou sem `?codigo=`.
3. **Área do membro** — `/dashboard`, `/avisos`, `/tarefas`, `/duvidas`, `/terceiros`, `/votacoes` (com `/votacoes/[catalogoId]` e `/votacoes/relatorio`) e `/minha-situacao`.
4. **Conta** — `/conta` e `/conta/meus-dados`, mais a rota `/conta/exportar`.
5. **Comissão** — `/admin`, `/admin/membros`, `/admin/presenca` (e `/lista`), `/admin/tesouraria` (e `/[usuarioId]`), `/admin/turma` (com `/historico`, `/registro` e a rota `/exportar`) e `/admin/votacoes` (com `/nova`, `/[catalogoId]` e `/votos/[enqueteId]`).
6. **Master** — `/master`, `/master/turmas` (e `/[turmaId]`), `/master/usuarios`.

Rotas de serviço: `/api/auth/*` (Better Auth), `/api/cron/lembretes` (lembretes e exclusões, com `CRON_SECRET`) e `/api/healthz` (saúde do banco e do agendador).

---

## 2. Descrição geral

### 2.1 Perspectiva do produto

O Formandos é um sistema **autocontido**. Hoje roda em Docker na máquina local (`compose.yaml`), com seis serviços:

```
                         navegador
                             |
                      HTTP (local) / HTTPS (se publicado)
                             |
              +--------------+--------------+
              |   app: Next.js 16 (dev)     |
              |   Server Components +       |
              |   Server Actions            |
              +--------------+--------------+
                 |        |         |        \
                 |        |         |         \
          +------+--+ +---+----+ +--+-----+ +--+-----------------+
          |   db    | |  mail  | |  cron  | |  backup            |
          | Postgres| | Mailpit| | chama  | |  pg_dump diário,   |
          |         | | (SMTP  | | /api/  | |  apaga > 30 dias   |
          |         | |  local)| | cron/  | |                    |
          +----+----+ +--------+ |lembret.| +--------------------+
               |                 +--------+
          +----+----+
          | migrate | aplica db/schema.sql e o catálogo padrão
          +---------+

  Externos opcionais: Google OAuth (login) e um servidor SMTP real.
  Link de saída, sem integração: Google Maps ("Como chegar") e wa.me ("Mandar para o grupo").
```

O código também prevê a publicação na Vercel com banco gerenciado (`src/lib/auth.ts` lê `VERCEL_ENV`), mas nenhum ambiente público existe nesta versão (LAC-09).

Todos os dados de uma turma ficam delimitados por `turma_id`. A turma em uso vem da sessão e do banco, nunca de um campo da tela; o cookie só escolhe entre as turmas de que a pessoa já é membro (`src/lib/dal.ts`, `src/lib/vinculos.ts`).

### 2.2 Funções do produto

| Grupo | Funções |
|---|---|
| **Conta** | cadastrar (18+), confirmar email, entrar, redefinir senha, corrigir nome, ligar ou desligar emails da turma, ver e baixar os próprios dados, excluir conta |
| **Vínculo** | entrar por código ou link, convidar por lista, criar turma, trocar de turma, sair, observar várias turmas |
| **Votação** | votar, mudar voto, voto secreto, prazo e participação mínima, valor por pessoa, fixar decisão com justificativa, reabrir, relatório, quem votou e quem falta |
| **Dinheiro** | plano de parcelas, lançamentos, "Já paguei", confirmar ou recusar, Minha situação, caixa da turma, importar pagamentos, regras do dinheiro |
| **Evento** | dados e programação, "Mudou em", página pública, presença com nomes e prazo, lista da portaria |
| **Comunicação** | avisos, dúvidas, tarefas, fornecedores, "Mandar para o grupo", emails essenciais |
| **Histórico e exportação** | histórico da turma, histórico da comissão, planilhas, registro em PDF, Meus dados |
| **Fim da turma** | arquivar com prazo, avisos de exclusão, exclusão automática, backup com prazo |
| **Plataforma** | visão do master sobre turmas e usuários; exclusões |

### 2.3 Características dos usuários

| Papel | Quem é | O que pode fazer | O que não pode fazer |
|---|---|---|---|
| **Visitante** | Qualquer pessoa sem conta | Ler a vitrine, os Termos e a Política; criar conta (18+); abrir a página pública de um evento cujo link recebeu | Ver qualquer outro dado de turma |
| **Participante** | Membro com `papel = 'participante'` | Votar; ver relatório, decisões e histórico da turma; enviar e votar dúvidas; confirmar presença com nomes; ver avisos, tarefas e fornecedores; ver a própria situação e informar "Já paguei" | Ver o voto ou a situação de outra pessoa; administrar |
| **Administrador** (comissão) | `papel = 'admin'` | Tudo do participante, mais: catálogos, regras, decisões, avisos, tarefas, fornecedores, evento, presença, membros, convites, exportações, registro, arquivar e excluir a turma; ver quem votou nas perguntas não secretas | Ver valores de cada pessoa sem a marcação de tesouraria; remover a si mesmo; sair sendo o único admin com outros membros |
| **Tesouraria** | Administrador com `tesouraria = true` | Tudo do admin, mais: plano de parcelas, lançar, confirmar, recusar, editar e excluir lançamentos, importar pagamentos, baixar pagamentos e situação por pessoa, ver o histórico do dinheiro | — |
| **Observador** | `papel = 'observador'` | Ver tudo da turma, confirmar a própria presença, estar em várias turmas | Votar; administrar |
| **Família, convidado, fornecedor** | Sem conta | Abrir a página pública do evento | Ver qualquer dado além do evento |
| **Master** | Email em `ADMIN_MASTER_EMAILS`, confirmado | Ver todas as turmas e usuários; gerir membros de qualquer turma; excluir turmas e usuários | Excluir a si mesmo ou outro master; deixar uma turma sem admin |

Administrador e observador podem estar em mais de uma turma; participante comum fica em uma só (RN-03).

### 2.4 Restrições

| ID | Restrição | Origem |
|---|---|---|
| RES-01 | Node.js 22 ou superior | `package.json` |
| RES-02 | PostgreSQL com `pgcrypto` | `db/schema.sql` |
| RES-03 | Toda consulta usa parâmetros; nenhum valor entra concatenado em SQL | `src/lib/db.ts` |
| RES-04 | `BETTER_AUTH_SECRET` igual em todos os ambientes da mesma base | `.env.example` |
| RES-05 | `MIGRATION_DATABASE_URL` sem o sufixo `-pooler` | `README.md`, `db/migrate.mjs` |
| RES-06 | Login Google só com as duas credenciais e, quando há `VERCEL_ENV`, só em produção | `src/lib/auth.ts` |
| RES-07 | O proxy por cookie é checagem rápida, não autorização | `src/proxy.ts` |
| RES-08 | Esquema idempotente (`if not exists`) | `db/schema.sql` |
| RES-09 | Conta só para maiores de 18 anos, por declaração, sem data de nascimento | ADR-0011 |
| RES-10 | Sem API oficial do WhatsApp | ADR-0016 |
| RES-11 | Projeto acadêmico gratuito, mantido por um responsável com MEI; não é site oficial da Unifacol | ADR-0001, `src/lib/empresa.ts` |

### 2.5 Premissas e dependências

| ID | Premissa | Consequência se for falsa |
|---|---|---|
| PRE-01 | O serviço `backup` roda uma vez por dia. | O RPO de 24 h (REC-04) não vale. |
| PRE-02 | Se o site for publicado, o provedor mantém a produção em execução contínua. | DIS-01 passa a depender do plano. |
| PRE-03 | O agendador chama `/api/cron/lembretes` pelo menos de hora em hora. | Lembretes de prazo e exclusões automáticas atrasam. `/api/healthz` mostra a última execução. |
| PRE-04 | Cada turma tem uma comissão ativa que cola o texto pronto no grupo. | Votação nova e aviso novo não chegam a quem não abre o site (LAC-10). |
| PRE-05 | O formando repassa o link da página pública à família. | A família não recebe nada do sistema. |

Dependências opcionais: SMTP (sem ele, o email vai para o log; no Docker vai para o Mailpit) e Google (sem ele, só senha).

### 2.6 Parcelamento dos requisitos

Cada requisito pertence a exatamente uma seção normativa. As outras apenas remetem a ele.

| Requisito | Seção normativa | Citado, só por remissão, em |
|---|---|---|
| RF-01 a RF-70 | 3.2 | 1.5, 2.2, 4.2 |
| EM-01 a EM-21 | 3.2.10 | 4.2 |
| DEC-01 a DEC-05 | 3.2.11 | 1.2.2 |
| RN-01 a RN-43 | 4.3 | 4.2 |
| RNF-01 a RNF-15 | 3.5 | 2.3 |
| Disponibilidade, RTO, RPO | 3.3.3, 3.3.4 | 3.5 |
| Testabilidade | 3.3.5 | 3.5 |
| SLA | 3.3.6 | 3.5 |
| Monitoramento | 3.6 | 3.5 |

---

## 3. Requisitos específicos

### 3.1 Requisitos de interface externa

#### 3.1.1 Interfaces com o usuário

- **INT-01** — Toda a interface em português do Brasil.
- **INT-02** — Datas e horas no fuso `America/Sao_Paulo`, independentemente do navegador (`src/lib/datas.ts`).
- **INT-03** — Datas no padrão `DD/MM/AAAA` na exibição.
- **INT-04** — Mensagem de erro de validação na segunda pessoa, sem jargão, nomeando o campo.
- **INT-05** — Toda mensagem de erro tem ação de recuperação visível na mesma tela.
- **INT-06** — Operação destrutiva exige confirmação digitada (RN-15, RN-16).
- **INT-07** — Nenhuma tela exige rolagem horizontal entre 360 e 3840 px.
- **INT-08** — Navegação por teclado alcança todos os controles, com foco visível e link "Pular para o conteúdo".
- **INT-09** — Animações desligadas com `prefers-reduced-motion: reduce`.
- **INT-10** — Turma arquivada mostra faixa com a data de arquivamento e a data de exclusão; ações de escrita ficam indisponíveis.
- **INT-11** — A área master responde 404 para quem não é master.
- **INT-12** — Contraste mínimo de 4,5:1 (texto normal) e 3:1 (texto grande), WCAG 2.1 AA.
- **INT-23** — As telas de votar, de presença e do evento (card e página pública) DEVEM funcionar com leitor de tela (TalkBack e VoiceOver): título da página, foco movido ao concluir uma ação e cada informação lida uma vez (ADR-0015).
- **INT-24** — Toda tela de voto DEVE dizer quem vê o voto: "Os administradores da turma veem em qual opção você votou, menos nas perguntas com voto secreto. A turma vê só os totais. Ninguém da comissão muda o seu voto. Mudanças em decisões ficam no histórico da turma." (`AVISO_VISIBILIDADE_VOTO`).
- **INT-25** — O rodapé da vitrine e a tela de convite DEVEM dizer quem mantém o site e que ele não é oficial da Unifacol (`AVISO_INSTITUCIONAL`).

**Contagem de rotas de tela.** Pública: 7. Onboarding: 1. Membro: 9. Conta: 2. Comissão: 13. Master: 4.

#### 3.1.2 Interfaces externas

| ID | Interface | Objeto |
|---|---|---|
| INT-13 | Google OAuth 2.0 | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (RES-06) |
| INT-14 | PostgreSQL | `DATABASE_URL` e `MIGRATION_DATABASE_URL` |
| INT-15 | Servidor SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`; teto diário `EMAIL_TETO_DIA` |
| INT-16 | Google Maps | Link de saída "Como chegar", sem chave e sem dado enviado pelo servidor |
| INT-17 | Agendador | Chama `/api/cron/lembretes` com `Authorization: Bearer $CRON_SECRET` (serviço `cron` no Docker) |
| INT-26 | WhatsApp | Link de saída `https://wa.me/?text=...` com o texto pronto; nada é enviado pelo servidor |

#### 3.1.3 Interfaces de comunicação

| ID | Interface | Direção | Transporte |
|---|---|---|---|
| INT-18 | Navegador e aplicação | bidirecional | HTTPS (TLS 1.2+) quando publicado; HTTP em `localhost` |
| INT-19 | Aplicação e banco | saída | TLS quando exigido |
| INT-20 | Aplicação e SMTP | saída | STARTTLS quando exigido |
| INT-21 | OAuth com o Google | bidirecional | HTTPS |

**INT-22** — Nenhuma informação pessoal vai para terceiros sem ação da pessoa. Os únicos envios automáticos são os emails da seção 3.2.10. O texto do "Mandar para o grupo" só sai se a comissão tocar no botão e colar.

---

### 3.2 Requisitos funcionais

Padrão: verbo observável, condição e critério de aceite. "DEVE" é obrigatório; "PODE" é opcional.

Prioridade MoSCoW: **M** obrigatório, **S** desejável, **C** possível. Situação apurada em 16/11/2026: **Atendido**, **Parcial**, **Pendente** (prometido e não feito) **Proposto** (vem das simulações; não decidido) ou **Descartado** (o grupo decidiu não fazer).

#### 3.2.1 Conta e acesso

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-01 | O sistema DEVE permitir entrar com conta Google verificada. | M | `/entrar` | E2E `auth`; `auth-config.test.ts` | Atendido |
| RF-02 | O sistema DEVE permitir criar conta com nome, email e senha e DEVE exigir a confirmação do email antes do primeiro acesso por senha. | M | `/entrar` | E2E `auth`; RN-12 | Atendido |
| RF-03 | O sistema DEVE enviar link de redefinição de senha e permitir definir a senha por ele. | S | `/esqueci-senha`, `/redefinir-senha` | E2E `auth` | Atendido |
| RF-22 | O sistema DEVE permitir corrigir o próprio nome, sem mudar email nem senha. | S | `/conta` | E2E `auth` | Atendido |
| RF-23 | O sistema DEVE permitir excluir a própria conta, digitando o email dela. | S | `/conta` | E2E `auth`, `admin` | Atendido |
| RF-24 | O sistema DEVE enviar os emails da seção 3.2.10. | M | transversal | `email.test.ts`, `lembretes-regras.test.ts`; E2E | Atendido |
| RF-29 | O cadastro DEVE exigir a declaração "Tenho 18 anos ou mais e aceito os Termos de Uso e a Política de Privacidade"; a entrada pelo Google DEVE mostrar a mesma declaração em texto. | M | `/entrar` | E2E passo ADR-0011 | Atendido |
| RF-44 | O sistema DEVE mostrar à pessoa os próprios dados em página legível, por seções, com "Salvar como PDF", e DEVE permitir baixá-los em JSON. | M | `/conta/meus-dados`, `/conta/exportar` | E2E passo ADR-0007 | Atendido |
| RF-52 | O sistema DEVE permitir à pessoa desligar os emails da turma; os emails da conta e os avisos de exclusão de turma continuam chegando. | S | `/conta` | E2E passo ADR-0006; RN-42 | Atendido |

#### 3.2.2 Turmas, vínculos e convites

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-04 | O sistema DEVE permitir, a quem não tem turma, entrar por código de convite ou criar uma turma. | M | `/convite` | E2E `auth`, `participante` | Atendido |
| RF-05 | O sistema DEVE permitir ao administrador e ao observador participar de mais de uma turma e escolher a turma em uso. | S | barra lateral | `vinculos.test.ts`; E2E `admin` | Atendido |
| RF-19 | O sistema DEVE permitir ao administrador ver o código de convite, copiá-lo com mensagem pronta e gerar um novo código. | M | `/admin/membros` | `convite.test.ts`; E2E `admin` | Atendido |
| RF-30 | O link de convite DEVE levar o código (`/convite?codigo=...`), e o código DEVE sobreviver ao cadastro, à confirmação de email e ao login pelo Google, levando a pessoa direto à turma. | M | `/convite` | `convite-link.test.ts`; E2E | Atendido |
| RF-31 | O sistema DEVE permitir à comissão colar uma lista de até 200 emails (ou "nome; email"), mostrar uma prévia (novos, já membros, já convidados, linhas com problema) e enviar o convite por email a cada um, sem criar conta. | S | `/admin/membros` | `convite-lista.test.ts`; E2E passo ADR-0007 | Atendido |
| RF-37 | O sistema DEVE permitir à comissão dar a alguém o papel de observador, que vê tudo da turma, confirma a própria presença e não vota nem administra. | S | `/admin/membros` | `papeis.test.ts`; E2E passo ADR-0012 | Atendido |
| RF-18 | O sistema DEVE permitir à comissão promover, rebaixar e remover membros. | M | `/admin/membros` | E2E `admin`; RN-17 | Atendido |

#### 3.2.3 Votação e decisões

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-06 | O sistema DEVE permitir votar em escolha única e múltipla, com opção exclusiva, e DEVE permitir mudar o voto. | M | `/votacoes/[catalogoId]` | `votos-regras.test.ts`; E2E `app` | Atendido |
| RF-07 | O sistema DEVE gerar relatório por pergunta com total, percentual e opção mais votada, sem identificar quem votou. | M | `/votacoes/relatorio` | E2E `admin`; RN-01 | Atendido |
| RF-08 | O sistema DEVE oferecer um catálogo padrão, igual para todas as turmas e não editável. | M | `/votacoes` | RN-23 | Atendido |
| RF-09 | O sistema DEVE permitir à comissão ver, por opção, quem votou e quem ainda não votou, exceto nas perguntas de voto secreto. | S | `/admin/votacoes/votos/[enqueteId]` | E2E `admin`, passo ADR-0010 | Atendido |
| RF-10 | O sistema DEVE permitir à comissão criar, renomear e excluir catálogos próprios, com categorias e perguntas. | S | `/admin/votacoes` | E2E `admin` | Atendido |
| RF-32 | O sistema DEVE permitir definir, por pergunta, prazo e participação mínima em percentual, e DEVE mostrar "votaram X de Y" e "precisa de N% da turma votando". Depois do prazo, o voto é recusado. | M | `/admin/votacoes/[catalogoId]`, card da pergunta | `decisao-regras.test.ts`; E2E passo ADR-0003 | Atendido |
| RF-33 | Ao fixar uma decisão, o sistema DEVE gravar votantes e membros do dia e, se a decisão fugir da regra, DEVE exigir justificativa, visível à turma. | M | fixar decisão | `decisao-regras.test.ts`; RN-30 | Atendido |
| RF-34 | O sistema DEVE permitir informar, em cada opção, o valor por pessoa e um link (orçamento, foto). | S | catálogo | `opcao-detalhe.test.ts` | Atendido |
| RF-35 | O sistema DEVE permitir marcar uma pergunta como voto secreto; nessa pergunta nenhuma tela e nenhuma planilha mostra quem votou em quê. | S | catálogo | E2E passo ADR-0010; RN-31 | Atendido |
| RF-53 | O sistema DEVE oferecer modelos de catálogo por tipo de turma (Educação Infantil e ABC, Ensino Médio, Pós-graduação e MBA, Área da Saúde), que a comissão copia e edita. | S | `/admin/votacoes/nova` | `modelos.test.ts` | Atendido |
| RF-54 | O sistema DEVE permitir à comissão esconder perguntas do catálogo padrão para a turma, sem alterar o catálogo global. | C | `/admin/votacoes` | inspeção (`enquetes_ocultas`) | Atendido |

#### 3.2.4 Dinheiro

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-38 | O sistema DEVE permitir marcar um ou mais administradores como tesouraria e, à tesouraria, cadastrar o plano de parcelas (até 60) e as "Regras do dinheiro" em texto. | M | `/admin/membros`, `/admin/tesouraria` | `situacao-regras.test.ts`; E2E passo ADR-0005 | Atendido |
| RF-39 | O sistema DEVE permitir à tesouraria lançar pagamento, devolução e ajuste, inclusive pagamento parcial e feito por outra pessoa, e editar ou excluir lançamentos com registro no histórico da tesouraria. | M | `/admin/tesouraria/[usuarioId]` | E2E passo ADR-0005; RN-33 | Atendido |
| RF-40 | O sistema DEVE mostrar a cada pessoa a "Minha situação" (pago, falta, o que vence) e permitir informar "Já paguei", que a tesouraria confirma ou recusa. A turma vê só os totais do caixa. | M | `/minha-situacao` | `situacao-regras.test.ts`; RN-32 | Atendido |
| RF-41 | O sistema DEVE permitir à tesouraria importar pagamentos colando linhas da planilha (email, valor, data; forma, quem pagou e referência opcionais), com prévia obrigatória, tudo ou nada, até 500 linhas, sem duplicar o que já foi lançado. | S | `/admin/tesouraria` | `importar-pagamentos.test.ts`; E2E passo ADR-0014; RN-34 | Atendido |

#### 3.2.5 Evento e presença

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-14 | O sistema DEVE exibir contagem regressiva, data, horário de início e término, local, endereço, "Como chegar", traje, observações do local e programação. | M | `/dashboard` | `evento.test.ts`; E2E `app` | Atendido |
| RF-15 | O sistema DEVE permitir à comissão editar o evento e a programação. | M | `/dashboard` | E2E `admin` | Atendido |
| RF-26 | O sistema DEVE permitir confirmar presença (`vou`, `talvez`, `nao`) e, com `vou`, informar o nome de cada acompanhante e se é adulto ou criança, até o limite da turma. | M | `/dashboard`, `/admin/presenca` | `presenca-regras.test.ts`; E2E passo ADR-0013 | Atendido |
| RF-45 | O sistema DEVE permitir à comissão criar, trocar e desligar um link público do evento, que abre sem conta e mostra só o que iria num convite impresso. | M | `/evento/[token]` | E2E passo ADR-0008; RN-39 | Atendido |
| RF-46 | O card do evento e a página pública DEVEM mostrar a última mudança de data, horário, local ou endereço dos últimos 14 dias ("Mudou em ...: era X, agora é Y"). | M | `/dashboard`, `/evento/[token]` | `evento.test.ts`; RN-40 | Atendido |
| RF-50 | O sistema DEVE permitir à comissão definir prazo de presença; depois dele a resposta trava e só a comissão muda. Baixar o limite de acompanhantes não corta ninguém: as respostas acima ficam marcadas. | M | `/admin/presenca` | `presenca-regras.test.ts`; RN-22, RN-41 | Atendido |
| RF-51 | O sistema DEVE gerar a lista da portaria em ordem alfabética, com nome, adulto ou criança, de quem é convidado e o total, para imprimir e em planilha. | M | `/admin/presenca/lista` | E2E passo ADR-0013 | Atendido |

#### 3.2.6 Comunicação e organização

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-11 | O sistema DEVE permitir enviar dúvida de 5 a 500 caracteres. | M | `/duvidas` | E2E `participante` | Atendido |
| RF-12 | O sistema DEVE permitir votar nas dúvidas dos colegas e ordenar por destaque, votos e data. | S | `/duvidas` | E2E `participante` | Atendido |
| RF-13 | O sistema DEVE permitir à comissão responder, destacar, reabrir e apagar dúvidas. | M | `/duvidas` | E2E `admin` | Atendido |
| RF-27 | O sistema DEVE permitir à comissão publicar, editar e excluir avisos; os 3 mais recentes aparecem no painel. | S | `/avisos` | E2E `app` (publicar, excluir); edição sem passo | Atendido |
| RF-16 | O sistema DEVE permitir criar tarefas com título, descrição, responsável, prazo e status, e ao responsável alterar o status. | M | `/tarefas` | E2E `app`, `participante` | Atendido |
| RF-17 | O sistema DEVE exibir fornecedores por categoria e permitir à comissão cadastrar valor orçado e situação (cotando, contratado, descartado), com totais visíveis só à comissão. | S | `/terceiros` | `orcamento.test.ts`; E2E `app` | Atendido |
| RF-36 | Em aviso, votação, decisão e evento, o sistema DEVE oferecer "Mandar para o grupo", que monta o texto pronto e abre o WhatsApp para a comissão colar. | M | telas da comissão | `texto-whatsapp.test.ts`; E2E passo ADR-0004 | Atendido |

#### 3.2.7 Histórico e exportação

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-47 | O sistema DEVE mostrar à turma o histórico das mudanças que valem para todos (decisão fixada ou reaberta, regra, valor de opção, plano de parcelas, evento, arquivamento e prazo de exclusão, prazo de presença) e à comissão o histórico completo, com filtro por assunto. | M | `/dashboard`, `/admin/turma/historico` | `historico-texto.test.ts`, `auditoria-acoes.test.ts` | Atendido |
| RF-42 | O sistema DEVE permitir à comissão baixar planilhas CSV de membros, votos (nas perguntas secretas, "(voto secreto)" no lugar do nome e sem hora), decisões, presença, portaria e fornecedores, e à tesouraria também pagamentos e situação por pessoa. Cada download fica registrado. | M | `/admin/turma/exportar` | `csv.test.ts`; E2E passo ADR-0007 | Atendido |
| RF-43 | O sistema DEVE oferecer à comissão o Registro da turma (evento, comissão, decisões com a fotografia, resultado das votações e presença em totais, fornecedores contratados por categoria, caixa e histórico) para imprimir ou salvar em PDF, sem dado pessoal além dos nomes da comissão. | S | `/admin/turma/registro` | E2E passo ADR-0007 | Atendido |

#### 3.2.8 Fim da turma

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-25 | O sistema DEVE permitir à comissão arquivar e desarquivar a turma; a turma arquivada é somente leitura. | S | `/admin/turma` | E2E `admin` | Atendido |
| RF-48 | Ao arquivar, o sistema DEVE exigir a data de exclusão (30, 60, 90 ou 180 dias), mostrá-la a todos e permitir mudá-la, nunca para menos de 30 dias a partir de hoje. | M | `/admin/turma` | `fim-da-turma-regras.test.ts`; RN-35 | Atendido |
| RF-49 | O sistema DEVE excluir sozinho a turma arquivada na data marcada, só depois do aviso de 7 dias, apagando também o histórico dela e guardando apenas o registro da exclusão por 5 anos. | M | `/api/cron/lembretes` | E2E passo ADR-0009; RN-36, RN-37 | Atendido |
| RF-28 | O sistema DEVE publicar Termos de Uso e Política de Privacidade com responsável, CNPJ (MEI), encarregado de dados, direitos da LGPD, prazos de retenção, backup e o compromisso de aviso de 60 dias se o site for encerrado. | M | `/termos`, `/privacidade` | inspeção; E2E passo ADR-0011 | Atendido |

#### 3.2.9 Administração da plataforma

| ID | Requisito | Pri. | Onde | Verificação | Sit. |
|---|---|---|---|---|---|
| RF-20 | O sistema DEVE permitir ao master ver todas as turmas e usuários e gerir os membros de qualquer turma. | C | `/master` | E2E `master`; `master.test.ts` | Atendido |
| RF-21 | O sistema DEVE permitir ao master excluir turmas e usuários, com confirmação digitada. | C | `/master/turmas`, `/master/usuarios` | E2E `master` | Atendido |

#### 3.2.10 Emails

**Emails da conta** (sempre enviados; não contam no teto diário):

| ID | Evento | Destinatário | Quando | Sit. |
|---|---|---|---|---|
| EM-01 | Confirmação de email | a pessoa | no cadastro | Atendido |
| EM-02 | Boas-vindas | a pessoa | após a confirmação | Atendido |
| EM-03 | Definição de senha | a pessoa | ao pedir | Atendido |
| EM-04 | Entrada na turma | a pessoa | só em vínculo novo | Atendido |
| EM-05 | Saída da turma | a pessoa | ao sair | Atendido |
| EM-06 | Remoção da turma | só o removido | quando a comissão ou o master remove | Atendido |
| EM-07 | Exclusão da própria conta | a pessoa | ao excluir, citando as turmas | Atendido |
| EM-08 | Exclusão da conta pelo master | só o excluído | ao excluir | Atendido |

**Emails da turma** (só para membros com email confirmado e emails ligados, exceto onde dito; contam no teto diário):

| ID | Evento | Destinatário | Quando | Sit. |
|---|---|---|---|---|
| EM-13 | Decisão fixada | membros, menos quem fixou | ao fixar | Atendido |
| EM-14 | "Mudou: [data, horário, local ou endereço] da formatura", com antes e depois e o link público para repassar | membros | ao salvar a mudança | Atendido |
| EM-15 | Prazo de votação chegando | só quem não votou | antes do prazo, pela rodada de lembretes | Atendido |
| EM-16 | Prazo de parcela chegando | quem tem a parcela em aberto | antes do vencimento | Atendido |
| EM-17 | Prazo de presença chegando | quem não respondeu ou marcou "talvez" | 2 dias antes do prazo | Atendido |
| EM-18 | Turma arquivada, nova data de exclusão, exclusão em 7 dias | **todos** os membros com email confirmado, **mesmo com emails desligados** | ao arquivar, ao mudar a data e 7 dias antes | Atendido |
| EM-19 | Convite para a turma | cada email da lista | ao confirmar o convite por lista | Atendido |

**Regras dos emails:**

- **EM-09** — Emails da conta vão só para a pessoa afetada.
- **EM-10** — O email de exclusão de conta cita as turmas em que a pessoa estava no momento.
- **EM-11** — Falha de envio não impede a ação que o originou e é registrada em log.
- **EM-12** — O HTML só leva endereço quando o site está publicado (ou com `EMAIL_LINKS_LOCAIS=1`); o texto puro sempre leva.
- **EM-20** — Os emails da turma respeitam um teto diário (`EMAIL_TETO_DIA`, padrão 400); o que não cabe sai na próxima rodada. Os lembretes não se repetem (`lembretes_enviados`).
- **EM-21** — Votação aberta: a comissão avisa a turma por email, uma vez por pergunta com prazo, só a quem ainda não votou (`emailVotacaoAberta`, ADR-0018). Aviso novo **não** gera email.

#### 3.2.11 Requisitos propostos e decisões pendentes

Origem: `docs/simulacoes/levantamento-rodada-2.md`, seções 3 e 4. São **especulação** até a validação com pessoas reais. A coluna "Nível" segue a ordem sugerida lá.

| ID | Requisito proposto | Pri. | Nível | Origem | Sit. |
|---|---|---|---|---|---|
| RF-55 | O sistema DEVE enviar email "Votação nova aberta" aos membros quando a comissão abrir uma pergunta com prazo. | S | 1.1 | temas 1, 2, 3, 5, 10 | Atendido (ADR-0018) |
| RF-56 | O texto pronto do evento DEVE começar com "MUDOU: [campo] era X, agora é Y" quando houver mudança dos últimos 14 dias. | S | 0.1 | temas 7, 9 | Atendido (ADR-0017) |
| RF-57 | O evento DEVE ter um campo "Entrada / portão" que entra no "Mudou em", no EM-14 e no texto pronto. | S | 1.2 | temas 7, 9 | Atendido (ADR-0019) |
| RF-58 | Todo membro DEVE poder baixar o Registro da turma em PDF, pelo menos com a turma arquivada. | S | 1.3 | tema 8 | Atendido (ADR-0020: sempre, em `/registro`) |
| RF-59 | O sistema DEVE ter a faixa no site e o email a todos os usuários para o encerramento com 60 dias de aviso, prometidos nos Termos. | S | 1.4 | tema 8; ADR-0009 | Pendente |
| RF-60 | A tela de convite DEVE mostrar o nome da turma e de quem convidou. | S | 0.2 | tema 3 | Atendido (ADR-0020) |
| RF-61 | O "valor por pessoa" DEVE dizer se é o total ou por mês. | S | 0.3 | tema 5 | Proposto |
| RF-62 | A tela de votação DEVE dizer: "Ninguém da comissão muda o seu voto; mudanças em decisões ficam no histórico". | C | 0.4 | tema 10 | Atendido (ADR-0017) |
| RF-63 | Um link público trocado DEVE abrir uma página que diga "Este link foi trocado. Peça o novo a quem mandou". | C | 0.5 | tema 9 | Atendido (ADR-0017) |
| RF-64 | O caixa DEVE registrar saídas (pagamentos a fornecedor), com totais para a turma. | C | 2.1 | temas 2, 6 | Proposto |
| RF-65 | Decisão e fornecedor DEVEM aceitar um link de documento (contrato, orçamento) no lugar de anexo. | C | 2.6 | temas 2, 6, 10 | Proposto |
| RF-66 | A tesouraria DEVE poder gerar um recibo (página para imprimir) de um lançamento confirmado. | C | 2.2 | temas 4, 6 | Proposto |
| RF-67 | O formando DEVE poder ligar a ele o email de quem paga (pai, mãe), para a importação casar a linha. | C | 2.3 | tema 10 | Proposto |
| RF-68 | O formando DEVE poder gerar um link só de leitura da própria situação para quem paga, sem que a pessoa vire membro. | C | 2.4 | tema 10 | Proposto |
| RF-69 | O evento DEVE ter campos de acessibilidade do local (rampa, estacionamento perto, banheiro adaptado), mostrados na página pública. | C | 2.5 | temas 7, 9 | Proposto |
| RF-70 | O encarregado de dados DEVE ter um email próprio do projeto, no lugar do Gmail pessoal. | S | 0.6 | tema 8 | Descartado (ADR-0017) |

**Decisões de produto pendentes** (não são requisitos até a equipe decidir):

| ID | Decisão | Origem |
|---|---|---|
| DEC-01 | Turma de escola (ABC, Ensino Médio) é público? Se sim: responsável ligado ao aluno, voto por família, página "Para a escola". Se não: dizer na vitrine e nos modelos. | tema 4; ADR-0011 |
| DEC-02 | Permissões por área para a comissão (só tarefas, só presença). | tema 2 |
| DEC-03 | Turma com subgrupos (duas festas com colação comum). | tema 2 |
| DEC-04 | Memória entre turmas (levar catálogo e fornecedores para a turma do ano seguinte). | temas 2, 8 |
| DEC-05 | Notificação no celular. | temas 1, 3, 9 |

---

### 3.3 Requisitos de desempenho, disponibilidade, testabilidade e nível de serviço

#### 3.3.1 Desempenho de resposta

| ID | Requisito | Situação |
|---|---|---|
| DES-01 | Primeiro byte de página autenticada em até 1,5 s (p95), em conexão de 10 Mbps. | Não medido: não há produção |
| DES-02 | Resposta visual em até 200 ms para estado local e 1,0 s para Server Action (p95). | Parcial: por inspeção |
| DES-03 | O conteúdo principal de toda página está no HTML da primeira resposta. | Atendido: Server Components |
| DES-04 | Nenhuma animação bloqueia leitura ou interação. | Atendido |

#### 3.3.2 Capacidade e limites

| ID | Requisito | Limite | Origem |
|---|---|---|---|
| CAP-01 | Membros por turma | 500 (alvo) | sem restrição declarativa |
| CAP-02 | Turmas por instância | 1.000 (alvo) | sem restrição declarativa |
| CAP-03 | Catálogos por turma / categorias por catálogo / perguntas por categoria | 10 / 20 / 50 | `src/actions/catalogos.ts` |
| CAP-06 | Acompanhantes por membro | 0 a 20 | `db/schema.sql` |
| CAP-07 | Conexões no banco | 5 por instância (`DB_POOL_MAX`) | `.env.example` |
| CAP-09 | Parcelas por plano | 60 | `src/lib/situacao-regras.ts` |
| CAP-10 | Linhas por importação de pagamentos | 500 | `src/lib/importar-pagamentos.ts` |
| CAP-11 | Convites por lista, por vez | 200 | `src/lib/convite-lista.ts` |
| CAP-12 | Emails da turma por dia | 400 (`EMAIL_TETO_DIA`) | `src/lib/email-turma.ts` |
| CAP-13 | Turmas excluídas por rodada de lembretes | 20 | `src/lib/fim-da-turma.ts` |

Os limites contra abuso estão em RN-43.

#### 3.3.3 Disponibilidade — janelas de execução

Enquanto o site não for publicado (LAC-09), esta seção é o **alvo** para a publicação, não um compromisso atual.

| Janela | Definição | Valor |
|---|---|---|
| **JAN-01 — Operação** | Período em que o sistema DEVE atender | 24 h por dia, 7 dias por semana, entre 01/03 e 30/11 |
| **JAN-02 — Mudança** | Deploy, migração e alteração de esquema | Domingo, 02:00 às 04:00 (Brasília), com aviso de 48 h |
| **JAN-03 — Testes** | Suíte automatizada | Qualquer dia, só contra ambiente de teste |

- **DIS-01** — Disponibilidade mínima de 99,5% da JAN-01, medida mês a mês por `/api/healthz`.
- **DIS-02** — Indisponibilidade não planejada na JAN-01 conta; manutenção na JAN-02 não.
- **DIS-03** — O aviso da JAN-02 tem 48 h de antecedência, com janela, motivo e responsável.

#### 3.3.4 Recuperação de falhas

| ID | Situação | RTO | RPO | Como se recupera |
|---|---|---|---|---|
| REC-01 | Aplicação fora do ar, banco íntegro | 4 h | 0 | Subir de novo a versão anterior |
| REC-02 | Migração com efeito colateral | 8 h | 0 | Backup obrigatório antes de `alter table` em tabela com dados; restaurar |
| REC-03 | Falha de SMTP | não se aplica | 0 | A ação conclui (EM-11); os lembretes saem na próxima rodada |
| REC-04 | Perda do banco | 24 h | **24 h** | Restaurar a cópia diária de `db/backups/` (`scripts/backup.sh`). Com banco gerenciado com *point-in-time recovery*, o RPO cai para o do fornecedor |
| REC-05 | Rotação de `BETTER_AUTH_SECRET` | 1 h | 0 | Pessoas entram de novo |

- **REC-06** — Restaurar uma cópia em ambiente isolado DEVE ser testado uma vez por mês. **Situação: não feito.**
- **REC-07** — Recriar o ambiente a partir do repositório (`docker compose up`) DEVE levar até 2 h.
- **REC-08** — Cópias com mais de 30 dias DEVEM ser apagadas, para que dado excluído suma das cópias nesse prazo (RN-38).

#### 3.3.5 Testabilidade

- **TEST-01** — Todo requisito funcional atendido DEVE ter verificação automatizada ou inspeção registrada na matriz 4.2.
- **TEST-02** — A suíte unitária DEVE passar 100% antes de integrar. Hoje: **30 arquivos, 332 testes, cerca de 22 s** (`npm test`, em 16/11/2026).
- **TEST-03** — `npm run typecheck` sem erro antes de integrar.
- **TEST-04** — `npm run build` sem erro antes de integrar.
- **TEST-05** — O teste de ponta a ponta (`scripts/teste/fluxos.mjs`) DEVE passar contra banco de teste, nunca contra produção. Hoje: **93 passos em 6 grupos** (`auth`, `participante`, `app`, `admin`, `master`, `extras`), com passos próprios para as ADR-0003 a 0015.
- **TEST-06** — O E2E cria e apaga os próprios dados (`teste-*@example.invalid`, códigos `TESTE*`).
- **TEST-07** — Sem `SMTP_HOST`, o corpo do email vai para o log.
- **TEST-08** — Cobertura de linhas de `src/lib` de pelo menos 80%. **Não medida.**
- **TEST-09** — Auditoria de interface em 360, 768, 1024, 1440, 1920 e 3840 px (`scripts/teste/auditoria.mjs`).
- **TEST-10** — A suíte DEVE ser determinística. **Não verificado formalmente.**
- **TEST-11** — A sonda de leitor de tela (`scripts/teste/leitor.mjs`) DEVE passar nas telas de voto, presença e evento (ADR-0015).
- **TEST-12** — A integração contínua (`.github/workflows/ci.yml`) roda `typecheck` e `npm test` a cada push em `main` e em pull request. Build e E2E não rodam na CI.

#### 3.3.6 Nível de serviço (SLA)

Vale a partir da publicação. Projeto acadêmico, sem compensação financeira (SLA-04).

| Sev. | Definição | Primeira resposta | Resolução |
|---|---|---|---|
| S1 | Sistema indisponível ou função crítica parada para toda a turma | 30 min | 4 h |
| S2 | Função crítica parada para parte, com contorno | 2 h | 8 h |
| S3 | Falha com contorno, sem perda de dado | 8 h | 3 dias úteis |
| S4 | Falha visual ou de texto | 5 dias úteis | 10 dias úteis |

- **SLA-01** — Prazos em horário comercial (segunda a sexta, 08:00 às 18:00, Brasília).
- **SLA-02** — Para S1 e S2, o prazo corre mesmo com falha de provedor.
- **SLA-03** — Todo S1 gera registro escrito em até 1 dia útil.
- **SLA-04** — Sem compensação financeira; o SLA mede qualidade de resposta.
- **SLA-05** — Emails com SMTP real: alvo de 99% entregues em até 60 s, dentro do teto diário (EM-20).
- **SLA-06** — Encerramento do site: aviso de 60 dias, com exportação liberada durante o prazo (RF-28; RF-59 pendente).

---

### 3.4 Restrições do sistema de software

| ID | Restrição | Verificação |
|---|---|---|
| SSR-01 | TypeScript `strict`; `npm run typecheck` sem erro | `tsconfig.json`; CI |
| SSR-02 | SQL sempre com parâmetros | inspeção |
| SSR-03 | Entrada de formulário validada com Zod antes do banco | inspeção das actions |
| SSR-04 | Cookies de sessão e de turma `httpOnly`, `sameSite=lax`, `secure` em produção | `src/lib/dal.ts` |
| SSR-05 | Sessão validada no banco em toda página protegida e toda Server Action | `src/lib/dal.ts` |
| SSR-06 | O banco recusa valor fora do domínio: papel, status de presença, tipo de acompanhante, tipo, forma e status de lançamento, status de tarefa e de fornecedor, acompanhantes 0 a 20, parcela 1 a 60, valores maiores que zero, participação mínima 1 a 100 | `db/schema.sql` |
| SSR-07 | Segredos fora do Git | `.gitignore` |
| SSR-08 | Cabeçalhos em todas as respostas: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` e `Content-Security-Policy` | `next.config.ts` |
| SSR-09 | Link de mapa só `https` com host com ponto | `src/lib/evento.ts` |
| SSR-10 | Conteúdo de pessoa escapado no HTML do email | `email.test.ts` |
| SSR-11 | CSV com proteção contra fórmula: célula que começa com `=`, `+`, `-`, `@`, tab ou retorno ganha apóstrofo | `csv.test.ts` |
| SSR-12 | Página pública com `noindex, nofollow` e `referrer: no-referrer` | `src/app/(publico)/evento/[token]/page.tsx` |
| SSR-13 | `/api/cron/lembretes` só com `Authorization: Bearer $CRON_SECRET` | rota do cron |

#### 3.4.1 Restrições conhecidas e não resolvidas

| ID | Lacuna | Situação em 16/11 | Consequência |
|---|---|---|---|
| LAC-01 | Limitação de taxa | **Parcial**: avisos, dúvidas, apoios, convite por lista, informe de pagamento e código de convite têm limite (RN-43). Voto não tem. | Um membro pode votar e trocar voto sem limite. |
| LAC-02 | Sem token CSRF explícito | Continua | Depende de `sameSite=lax` e da verificação de origem do Better Auth. |
| LAC-03 | Sem CSP e HSTS | **Resolvida** (SSR-08) | — |
| LAC-04 | Sem telemetria de erro e desempenho | Continua | DIS-01 só pode ser medida pelo `/api/healthz`. |
| LAC-05 | Sem health check | **Resolvida**: `/api/healthz` (banco e última execução dos lembretes) | — |
| LAC-06 | Sem integração contínua | **Parcial**: CI com typecheck e testes; sem build e sem E2E (TEST-12) | — |
| LAC-07 | `fornecedores.turma_id` aceita nulo | Continua | Registro antigo sem turma não aparece. |
| LAC-08 | Encerramento do site só em texto | Continua (RF-59) | O aviso de 60 dias depende de trabalho manual se for preciso. |
| LAC-09 | Sem hospedagem pública | Continua | 3.3.3, 3.3.6 e o monitoramento são alvo, não compromisso. |
| LAC-10 | Votação nova e aviso novo sem email | Parcial: votação resolvida (RF-55, ADR-0018); aviso novo continua sem email | A comissão cola no grupo; quem silenciou o grupo não fica sabendo. |
| LAC-11 | O texto pronto do evento não diz que algo mudou | Resolvido (RF-56, ADR-0017) | Quem lê só o grupo não percebe a mudança. |

---

### 3.5 Atributos de qualidade do software

| ID | Atributo | ISO 25010 | Requisito normativo |
|---|---|---|---|
| RNF-01 | Usabilidade | Usabilidade | INT-01 a INT-05, INT-24, INT-25 |
| RNF-02 | Responsividade | Compatibilidade | INT-07 |
| RNF-03 | Acessibilidade | Usabilidade | INT-08, INT-09, INT-12, INT-23; TEST-11 |
| RNF-04 | Estabilidade de entrega | Confiabilidade | DES-03 |
| RNF-05 | Segurança de acesso | Segurança | SSR-04, SSR-05, SSR-13, INT-11 |
| RNF-06 | Segurança de dados | Segurança | SSR-02, SSR-03, SSR-08, SSR-11, RN-43 |
| RNF-07 | Privacidade | Segurança | RN-01, RN-31, RN-32, RN-39; SSR-07, SSR-12 |
| RNF-08 | Manutenibilidade | Manutenibilidade | SSR-01, TEST-02, ADRs |
| RNF-09 | Portabilidade | Portabilidade | RES-01, REC-07 (Docker) |
| RNF-10 | Compatibilidade | Compatibilidade | Navegadores atuais; testado no Chrome; leitor de tela no Android e iOS |
| RNF-11 | Disponibilidade e continuidade | Confiabilidade | 3.3.3, 3.3.4 |
| RNF-12 | Nível de serviço | Confiabilidade | 3.3.6 |
| RNF-13 | Testabilidade | Manutenibilidade | 3.3.5 |
| RNF-14 | Observabilidade | Manutenibilidade | 3.6 |
| RNF-15 | Proteção de dados (LGPD) | Segurança | RF-28, RF-44, RF-48, RF-49, RN-29, RN-35 a RN-38 |

---

### 3.6 Outros requisitos — monitoramento e operação

O monitoramento continua **mínimo**: existe `/api/healthz`, e o resto é alvo para a publicação.

#### 3.6.1 Sinais a monitorar

| ID | Sinal | Origem | Limite de alerta | Sev. | Situação |
|---|---|---|---|---|---|
| MON-01 | Disponibilidade externa | monitor sintético chamando `/api/healthz` | 3 falhas seguidas | S1 | Alvo |
| MON-02 | Saúde do banco | `/api/healthz` (`select` e 503 se falhar) | 1 falha | S1 | **Atendido** (a rota existe) |
| MON-03 | Taxa de erro 5xx | log da hospedagem | > 1% em 5 min | S2 | Alvo |
| MON-04 | Latência | log da hospedagem | p95 > 3 s por 15 min | S2 | Alvo |
| MON-05 | Pool de conexões | processo | > 80% de `DB_POOL_MAX` | S2 | Alvo |
| MON-06 | Falha de email | `enviarEmailSilencioso` | qualquer | S3 | Só em log |
| MON-07 | Erro em Server Action | `console.error` | qualquer | S3 | Só em log |
| MON-08 | Login recusado | Better Auth | 10 em 5 min na mesma conta | S3 | Alvo |
| MON-09 | Limite de convite atingido | `tentativas_convite` | 10 por pessoa ou 50 por IP em 15 min | S4 | Alvo |
| MON-10 | Exclusão destrutiva | auditoria (`turma.excluida`, contas) | qualquer | S4 | Registrado na auditoria |
| MON-11 | Mudança fora da JAN-02 | processo de deploy | qualquer | S3 | Alvo |
| MON-17 | Agendador parado | `/api/healthz` (`lembretes`) | sem execução há mais de 2 h | S2 | Dado disponível; alerta é alvo |
| MON-18 | Teto diário de email atingido | `email-turma.ts` | qualquer | S3 | Alvo |

**MON-12** — Falha de SMTP precisa gerar alerta, porque EM-11 a esconde do usuário.

#### 3.6.2 Registro e retenção

| ID | Requisito | Situação |
|---|---|---|
| MON-13 | Toda escrita importante registra horário, pessoa, turma, ação e detalhe | **Atendido** para as ações da auditoria (`src/lib/auditoria-acoes.ts`); sem log estruturado de sucesso fora dela |
| MON-14 | Nenhum log contém senha ou token | Atendido por construção |
| MON-15 | Retenção de log de pelo menos 30 dias | A definir com a hospedagem |
| MON-16 | Sem SMTP em produção, alerta em vez de silêncio | Pendente |
| MON-19 | A auditoria de uma turma é apagada junto com ela; fica só `turma.excluida` por 5 anos | Atendido (RN-37) |

---

## 4. Anexos

### 4.1 Cenários em Gherkin

Vocabulário em português: **Dado**, **Quando**, **Então**, **E**, **Mas**.

#### E.G.01 — Cadastro e confirmação de email (RF-02, RF-29, RN-12, RN-29)

```gherkin
Funcionalidade: Cadastro com confirmação de email
  Cenário: Cadastro válido leva à confirmação
    Dado uma pessoa sem conta
    Quando ela se cadastra com nome "Ana Souza", email "ana@example.invalid", senha "Senha12345"
      e marca "Tenho 18 anos ou mais e aceito os Termos de Uso e a Política de Privacidade"
    Então o cadastro é aceito
    E a sessão ainda não é iniciada
    E um email de confirmação é enviado

  Cenário: Cadastro sem a declaração é recusado
    Dado uma pessoa sem conta
    Quando ela se cadastra sem marcar a declaração de 18 anos
    Então o cadastro é recusado

  Cenário: Login por senha é recusado antes da confirmação
    Dado uma conta com email ainda não confirmado
    Quando ela tenta entrar com a senha correta
    Então o acesso é recusado
    E o sistema informa que o email precisa ser confirmado
```

#### E.G.02 — Redefinição de senha (RF-03)

```gherkin
Funcionalidade: Recuperação de senha
  Cenário: Pedido de redefinição gera link utilizável
    Dado uma conta com email confirmado
    Quando a pessoa pede a redefinição de senha
    Então um email de definição de senha é enviado
    E ao seguir o link, a nova senha passa a valer
```

#### E.G.03 — Entrada por convite (RF-04, RF-30, RN-07, RN-13)

```gherkin
Funcionalidade: Entrada em turma por convite
  Cenário: Link com código leva direto à turma depois do cadastro
    Dado uma turma com código "TESTESH0001"
    Quando uma pessoa sem conta abre "/convite?codigo=TESTESH0001"
    E cria a conta e confirma o email
    Então ela vira membro da turma com papel "participante"
    E não precisa digitar o código

  Cenário: Décima tentativa errada trava por 15 minutos
    Dado uma pessoa que errou o código 10 vezes nos últimos 15 minutos
    Quando ela envia qualquer código
    Então a tentativa é recusada
```

#### E.G.04 — Votação (RF-06, RF-07, RF-32, RN-02, RN-08, RN-24)

```gherkin
Funcionalidade: Votação
  Cenário: Opção exclusiva desmarca as demais
    Dado uma pergunta de múltipla escolha com a opção exclusiva "Nenhuma"
    E a pessoa votou em "Festa"
    Quando ela marca "Nenhuma"
    Então só "Nenhuma" fica marcada

  Cenário: Voto é recusado depois do prazo
    Dado uma pergunta com prazo vencido e sem decisão fixada
    Quando uma pessoa tenta votar
    Então o voto é recusado

  Cenário: Voto é recusado com decisão fixada
    Dado uma pergunta com decisão fixada
    Quando uma pessoa tenta votar
    Então o voto é recusado
```

#### E.G.05 — Decisão fora da regra (RF-33, RN-30)

```gherkin
Funcionalidade: Fixar decisão
  Cenário: Fixar a opção menos votada exige justificativa
    Dado uma pergunta em que "Buffet A" tem 20 votos e "Buffet B" tem 12
    Quando a comissão fixa "Buffet B" sem justificativa
    Então a decisão é recusada
    E o motivo informado é "A opção escolhida não é a mais votada."

  Cenário: Decisão justificada fica visível com a fotografia
    Dado a mesma pergunta, com 32 votantes de 48 membros
    Quando a comissão fixa "Buffet B" com a justificativa "Buffet A sem data livre"
    Então a turma vê "Buffet B", "votaram 32 de 48", o motivo e a justificativa
    E o histórico da turma registra quem fixou e quando
```

#### E.G.06 — Voto secreto (RF-35, RN-31)

```gherkin
Funcionalidade: Voto secreto
  Cenário: A comissão não vê quem votou na pergunta secreta
    Dado uma pergunta marcada como voto secreto com 10 votos
    Quando a comissão abre a lista de quem votou
    Então a lista não mostra o nome de quem votou em cada opção
    E a planilha de votos mostra "(voto secreto)" no lugar do nome, sem a hora
```

#### E.G.07 — Minha situação (RF-40, RN-32)

```gherkin
Funcionalidade: Situação de pagamento
  Cenário: A pessoa informa um pagamento e a tesouraria confirma
    Dado uma pessoa com parcela de R$ 150 em aberto
    Quando ela marca "Já paguei" com o valor de R$ 150
    Então o lançamento fica "informado"
    E quando a tesouraria confirma, a parcela aparece como paga na "Minha situação"

  Cenário: Outro membro não vê a situação de ninguém
    Dado um participante que não é da tesouraria
    Quando ele abre a turma
    Então vê só os totais do caixa
    E não vê quanto cada pessoa pagou ou deve
```

#### E.G.08 — Importação de pagamentos (RF-41, RN-34)

```gherkin
Funcionalidade: Importar pagamentos
  Cenário: Colar a mesma planilha de novo não duplica
    Dado que a tesouraria já importou 12 pagamentos
    Quando ela cola a mesma planilha com 15 linhas, das quais 12 iguais
    Então a prévia diz "12 linhas já estão lançadas e ficam de fora"
    E só 3 lançamentos são criados

  Cenário: Uma linha com problema impede tudo
    Dado uma colagem em que uma linha tem email que não é da turma
    Quando a tesouraria pede para importar
    Então nada é importado
    E a prévia mostra o número da linha e o motivo
```

#### E.G.09 — Saída e remoção (RF-18, RN-04, RN-17, RN-19, EM-05, EM-06)

```gherkin
Funcionalidade: Saída de turma
  Cenário: Único administrador é impedido de sair
    Dado uma turma com 3 membros em que a pessoa é a única administradora
    Quando ela tenta sair
    Então a saída é recusada

  Cenário: Quem sai tem o voto apagado, mas a decisão fixada mantém a fotografia
    Dado uma decisão fixada com "votaram 41 de 63"
    Quando um dos votantes sai da turma
    Então os votos dele são apagados
    E a decisão continua mostrando "votaram 41 de 63"
```

#### E.G.10 — Exclusões com confirmação (RF-21, RF-23, RN-15, RN-16, EM-07)

```gherkin
Funcionalidade: Exclusão da própria conta
  Cenário: Confirmação com email diferente é recusada
    Dado uma conta com email "ana@example.invalid"
    Quando ela digita "outro@example.invalid" na confirmação
    Então a exclusão é recusada
```

#### E.G.11 — Fim da turma (RF-48, RF-49, RN-35, RN-36, RN-37, EM-18)

```gherkin
Funcionalidade: Exclusão automática da turma arquivada
  Cenário: A turma não é excluída sem o aviso de 7 dias
    Dado uma turma arquivada com data de exclusão vencida
    E o aviso de 7 dias ainda não chegou a todos os membros com email confirmado
    Quando a rodada de lembretes executa
    Então a turma não é excluída

  Cenário: Exclusão apaga a turma e guarda só o registro
    Dado uma turma arquivada com data vencida e aviso enviado há mais de 7 dias
    Quando a rodada de lembretes executa
    Então a turma e a auditoria dela são apagadas
    E fica só o registro "turma.excluida" com o nome, a data e quem excluiu
```

#### E.G.12 — Página pública do evento (RF-45, RF-46, RN-39, RN-40)

```gherkin
Funcionalidade: Página pública do evento
  Cenário: Família abre sem conta e vê a mudança
    Dado um evento com link público ligado
    E o horário mudou de 20:00 para 19:00 há 3 dias
    Quando uma pessoa sem conta abre o link
    Então vê data, local, "Como chegar", traje e programação
    E vê "Mudou em ...: Horário: era 20:00, agora é 19:00"
    E não vê membros, votos nem dinheiro

  Cenário: Link trocado deixa de funcionar
    Dado que a comissão gerou outro link
    Quando alguém abre o link antigo
    Então a página não é encontrada
```

#### E.G.13 — Presença com prazo e limite (RF-26, RF-50, RN-22, RN-41)

```gherkin
Funcionalidade: Presença
  Cenário: Depois do prazo a resposta trava
    Dado uma turma com prazo de presença vencido
    Quando um participante tenta mudar a presença
    Então a mudança é recusada

  Cenário: Baixar o limite não corta ninguém
    Dado uma turma com limite de 5 acompanhantes
    E um membro com 4 acompanhantes com nome
    Quando a comissão baixa o limite para 2
    Então o membro continua com 4 acompanhantes
    E aparece marcado no painel como acima do limite
    E só pode remover acompanhantes
```

#### E.G.14 — Permissões (INT-11, RN-04, RN-33)

```gherkin
Funcionalidade: Permissões
  Cenário: Quem não é master recebe 404
    Dado uma pessoa autenticada que não está em ADMIN_MASTER_EMAILS
    Quando ela acessa "/master/usuarios"
    Então a resposta é 404

  Cenário: Administrador sem tesouraria não vê valores de pessoa
    Dado um administrador sem a marcação de tesouraria
    Quando ele tenta abrir "/admin/tesouraria"
    Então o acesso é negado
    E ele não vê quanto cada pessoa pagou
```

#### E.G.15 — Notificação (EM-11, EM-12, EM-18, RN-42)

```gherkin
Funcionalidade: Emails
  Cenário: Falha de SMTP não impede a ação
    Dado o servidor de email indisponível
    Quando uma pessoa entra em uma turma com código válido
    Então ela entra normalmente
    E a falha é registrada em log

  Cenário: Aviso de exclusão chega mesmo com emails desligados
    Dado um membro que desligou os emails da turma
    Quando a comissão arquiva a turma
    Então esse membro recebe o email de turma arquivada com a data de exclusão
```

---

### 4.2 Matriz de rastreabilidade

| Requisito | ADR | Cenário | Verificação | Situação |
|---|---|---|---|---|
| RF-01 | — | — | E2E `auth`; `auth-config.test.ts` | Atendido |
| RF-02 | — | E.G.01 | E2E `auth` | Atendido |
| RF-03 | — | E.G.02 | E2E `auth` | Atendido |
| RF-04 | — | E.G.03 | E2E `auth`, `participante` | Atendido |
| RF-05 | 0012 | — | `vinculos.test.ts` | Atendido |
| RF-06 | — | E.G.04 | `votos-regras.test.ts`; E2E `app` | Atendido |
| RF-07 | — | — | E2E `admin` | Atendido |
| RF-08 | — | — | inspeção | Atendido |
| RF-09 | 0010 | E.G.06 | E2E `admin` | Atendido |
| RF-10 | — | — | E2E `admin` | Atendido |
| RF-11 a RF-13 | — | — | E2E `participante`, `admin` | Atendido |
| RF-14, RF-15 | — | — | `evento.test.ts`; E2E | Atendido |
| RF-16 | — | E.G.14 | E2E `app` | Atendido; caso negado sem passo |
| RF-17 | — | — | `orcamento.test.ts` | Atendido |
| RF-18 | — | E.G.09 | E2E `admin` | Atendido |
| RF-19 | — | — | `convite.test.ts` | Atendido |
| RF-20, RF-21 | — | E.G.14, E.G.10 | E2E `master`; `master.test.ts` | Atendido |
| RF-22, RF-23 | — | E.G.10 | E2E `auth` | Atendido |
| RF-24 | 0006 | E.G.15 | `email.test.ts`, `lembretes-regras.test.ts` | Atendido |
| RF-25 | 0009 | — | E2E `admin` | Atendido |
| RF-26 | 0013 | E.G.13 | `presenca-regras.test.ts` | Atendido |
| RF-27 | — | — | E2E `app` | Parcial: edição sem passo |
| RF-28 | 0001, 0009, 0011 | — | inspeção | Atendido |
| RF-29 | 0011 | E.G.01 | E2E passo ADR-0011 | Atendido |
| RF-30 | 0002 | E.G.03 | `convite-link.test.ts` | Atendido |
| RF-31 | 0007 | — | `convite-lista.test.ts` | Atendido |
| RF-32, RF-33 | 0003 | E.G.04, E.G.05 | `decisao-regras.test.ts`; E2E | Atendido |
| RF-34 | 0003 | — | `opcao-detalhe.test.ts` | Atendido |
| RF-35 | 0010 | E.G.06 | E2E passo ADR-0010 | Atendido |
| RF-36 | 0004 | — | `texto-whatsapp.test.ts` | Atendido |
| RF-37 | 0012 | — | `papeis.test.ts`; E2E | Atendido |
| RF-38 a RF-40 | 0005 | E.G.07, E.G.14 | `situacao-regras.test.ts`; E2E | Atendido |
| RF-41 | 0014 | E.G.08 | `importar-pagamentos.test.ts` | Atendido |
| RF-42, RF-43 | 0007, 0014 | — | `csv.test.ts`; E2E | Atendido |
| RF-44 | 0007 | — | E2E | Atendido |
| RF-45, RF-46 | 0008 | E.G.12 | `evento.test.ts`; E2E | Atendido |
| RF-47 | 0008 | E.G.05 | `historico-texto.test.ts`, `auditoria-acoes.test.ts` | Atendido |
| RF-48, RF-49 | 0009 | E.G.11 | `fim-da-turma-regras.test.ts`; E2E | Atendido |
| RF-50, RF-51 | 0013 | E.G.13 | `presenca-regras.test.ts`; E2E | Atendido |
| RF-52 | 0006 | E.G.15 | E2E | Atendido |
| RF-53 | — | — | `modelos.test.ts` | Atendido |
| RF-54 | — | — | inspeção | Atendido; sem teste |
| RF-55 a RF-70 | — | — | — | Proposto ou Pendente |
| EM-01 a EM-08 | — | E.G.03, E.G.09, E.G.10 | `email.test.ts`; E2E | Atendido |
| EM-13 a EM-19 | 0006, 0007, 0008, 0009 | E.G.15 | `email.test.ts`, `lembretes-regras.test.ts` | Atendido |
| RNF-11, RNF-12 | — | — | — | Alvo: depende de publicação |
| RNF-13 | — | — | TEST-02 a TEST-12 | Parcial: TEST-08 e TEST-10 pendentes |
| RNF-14 | — | — | 3.6 | Parcial: só `/api/healthz` |

**Cobertura:** 54 requisitos funcionais atendidos (RF-01 a RF-54), todos com verificação automatizada ou inspeção registrada; 15 propostos e 1 pendente (RF-55 a RF-70).

---

### 4.3 Regras de negócio

| ID | Regra | Onde |
|---|---|---|
| RN-01 | O voto é ligado à pessoa; o relatório mostra só totais; a comissão vê quem votou, exceto nas perguntas secretas (RN-31). | `votacoes/relatorio`, `AVISO_VISIBILIDADE_VOTO` |
| RN-02 | Mudar o voto apaga e regrava os votos da pergunta numa transação, com trava por pessoa. | `src/actions/votos.ts` |
| RN-03 | Só quem não tem turma, ou é administrador ou observador em alguma, pode entrar em outra turma. | `src/lib/vinculos.ts` |
| RN-04 | O único administrador não pode ser rebaixado, removido nem sair enquanto houver outros membros. | `turmas.ts`, `admin.ts`, `master.ts` |
| RN-05 | Se o último membro sair, a turma é apagada. | `src/actions/turmas.ts` |
| RN-06 | Login por senha só depois de confirmar o email. | `src/lib/auth.ts` |
| RN-07 | Código de convite: no máximo 10 erros por pessoa e 50 por IP a cada 15 minutos; tentativas com mais de 1 dia são apagadas. | `src/actions/turmas.ts` |
| RN-08 | Em múltipla escolha, marcar a opção exclusiva desmarca as demais, e vice-versa. | `src/actions/votos.ts` |
| RN-09 | O catálogo padrão é somente leitura e igual para todas as turmas. | `catalogo-visibilidade.ts` |
| RN-10 | Nome completo de 2 a 120 caracteres. | `src/actions/conta.ts` |
| RN-11 | Senha com no mínimo 8 caracteres. | `src/lib/auth.ts` |
| RN-12 | Email confirmado para o primeiro acesso por senha. | `src/lib/auth.ts` |
| RN-13 | Código de convite com 8 caracteres de `ABCDEFGHJKMNPQRSTUVWXYZ23456789`; entrada normalizada. | `src/lib/convite.ts` |
| RN-14 | O campo de código aceita de 6 a 20 caracteres. | `src/actions/turmas.ts` |
| RN-15 | Excluir a conta exige digitar o email dela. | `src/actions/conta.ts` |
| RN-16 | Excluir a turma exige digitar o nome dela. | `gestao-turma.ts` |
| RN-17 | Administrador não remove a si mesmo. | `src/actions/admin.ts` |
| RN-18 | O master não deixa turma sem admin, não exclui a si mesmo nem outro master. | `src/actions/master.ts` |
| RN-19 | Ao sair ou ser removido, a pessoa perde votos, presença, dúvidas e apoios naquela turma; decisões, avisos e tarefas ficam, com o responsável esvaziado. | `saida-turma.ts` |
| RN-20 | Turma de membro único é apagada junto com a saída. | `src/actions/turmas.ts` |
| RN-21 | Link de mapa só `https` com host com ponto. | `src/lib/evento.ts` |
| RN-22 | Acompanhantes só com `vou`; limite da turma de 0 a 20 (padrão 5). **Baixar o limite não corta ninguém**: quem está acima fica marcado e só pode remover. | `presenca-regras.ts`, `presenca.ts` |
| RN-23 | Catálogo de turma é visível só para a própria turma. | `catalogo-visibilidade.ts` |
| RN-24 | Voto é recusado com decisão fixada ou depois do prazo da pergunta. Prazo vencido não fixa nada: quem fixa é a comissão. | `votos.ts`, `regras_enquete` |
| RN-25 | Fixar em escolha única exige 1 opção; em múltipla, a exclusiva não se combina. Reabrir apaga a decisão. | `src/actions/decisoes.ts` |
| RN-26 | Limites de catálogo: 10 catálogos, 20 categorias, 50 perguntas por categoria. | `catalogos.ts` |
| RN-27 | Quem já é membro segue para o painel sem email novo. | `src/actions/turmas.ts` |
| RN-28 | O email de exclusão de conta cita as turmas lidas antes do `delete`. | `src/lib/usuarios.ts` |
| RN-29 | A conta é para maiores de 18 anos, por declaração no cadastro; conta de menor identificada é excluída. A comissão não deve escrever dados de crianças além do necessário. | ADR-0011; Termos |
| RN-30 | Uma decisão foge da regra quando: ninguém votou, não é a mais votada, empata, não atingiu a participação mínima ou o prazo não terminou e falta gente votar. Com algum motivo, a justificativa é obrigatória e fica visível à turma. | `decisao-regras.ts` |
| RN-31 | Em pergunta de voto secreto, nenhuma tela e nenhuma planilha mostra a escolha de alguém; o voto continua ligado à conta só para permitir a troca e um voto por pessoa. | ADR-0010; Política |
| RN-32 | A situação de cada pessoa é vista só por ela e pela tesouraria; a turma vê só os totais do caixa. | ADR-0005 |
| RN-33 | Só administrador com a marcação de tesouraria vê e lança valores de pessoa; o histórico de lançamentos (inclusive edição e exclusão) é visível só à tesouraria. | `ACOES_SO_TESOURARIA` |
| RN-34 | Importação: email de formando da turma como chave; valor maior que zero; data não futura; forma vazia vira Pix; até 500 linhas; qualquer linha com problema impede tudo; linha igual a lançamento confirmado (pessoa, valor, data) não entra de novo; o lançamento importado já nasce confirmado; nenhum email é enviado. | ADR-0014 |
| RN-35 | Arquivar exige data de exclusão de 30, 60, 90 ou 180 dias; mudar a data nunca deixa menos de 30 dias; desarquivar apaga a data. | ADR-0009 |
| RN-36 | A exclusão automática só acontece se o aviso de 7 dias chegou a todos os membros com email confirmado há pelo menos 7 dias; no máximo 20 turmas por rodada. | `fim-da-turma.ts` |
| RN-37 | Ao excluir a turma, a auditoria dela é apagada; fica só `turma.excluida` (nome, data, quem excluiu) por 5 anos. | ADR-0009 |
| RN-38 | Cópias de segurança são diárias e apagadas com mais de 30 dias. | `scripts/backup.sh` |
| RN-39 | A página pública usa um código de 22 caracteres, diferente do código de convite; não mostra membros, comissão, presença, votos, dinheiro, avisos nem dúvidas; gerar outro código invalida o antigo; turma arquivada mostra "Evento encerrado". | ADR-0008 |
| RN-40 | "Mudou em" cobre data, horário, local e endereço, e aparece por 14 dias. Observações do local não entram. | `evento-publico.ts`, `lembretes-regras.ts` |
| RN-41 | Depois do prazo de presença, a resposta trava e só a comissão muda. | ADR-0013 |
| RN-42 | Emails da turma vão só a membros com email confirmado e emails ligados, menos quem fez a ação; os avisos de exclusão de turma ignoram a preferência. Teto diário de 400 (configurável). | `email-turma.ts` |
| RN-43 | Limites contra abuso: 10 avisos por turma por hora; 20 dúvidas por pessoa por hora; 120 apoios por pessoa por hora; 10 convites por lista por turma por hora; 10 informes de pagamento por pessoa por dia; código de convite conforme RN-07. | `src/lib/throttle.ts` e actions |

---

### 4.4 Requisitos de teste derivados

| ID | Teste | Tipo | Origem |
|---|---|---|---|
| TD-01 | Suíte unitária verde | automático (CI) | TEST-02 |
| TD-02 | Typecheck sem erro | automático (CI) | TEST-03 |
| TD-03 | Build sem erro | automático, fora da CI | TEST-04 |
| TD-04 | E2E verde (93 passos) | automático, local | TEST-05 |
| TD-05 | Auditoria de interface em 6 larguras | automático, local | TEST-09 |
| TD-06 | Cobertura de `src/lib` acima de 80% | automático | TEST-08 (pendente) |
| TD-07 | Suíte repetida duas vezes com o mesmo resultado | automático | TEST-10 (pendente) |
| TD-08 | Restauração de cópia em ambiente isolado | manual, mensal | REC-06 (pendente) |
| TD-09 | Recriar o ambiente em até 2 h | manual | REC-07 |
| TD-10 | Contraste de 4,5:1 nas telas | manual | INT-12 |
| TD-11 | Sonda de leitor de tela e teste com TalkBack e VoiceOver | automático + manual | TEST-11, INT-23 |
| TD-12 | Exclusão automática só depois do aviso de 7 dias | automático (E2E ADR-0009) | RN-36 |
| TD-13 | Validação com pessoas reais dos requisitos propostos | manual | `levantamento-rodada-2.md`, seção 6 |

---

### 4.5 Divergências conhecidas

| # | Onde diz | O que o código faz | Correção |
|---|---|---|---|
| 1 | ERS 1.0, RF-27: "o membro edita o próprio aviso" | Criar, editar e excluir aviso exige administrador (`exigirAdminEditavel` em `src/actions/avisos.ts`). | Corrigido nesta versão. |
| 2 | ERS 1.0, RN-22 e E.G.08: "reduzir o limite corta as respostas" | Baixar o limite não corta ninguém (ADR-0013). | Corrigido nesta versão. |
| 3 | ERS 1.0, 2.1: hospedagem na Vercel e banco Neon | O projeto roda em Docker local; Vercel é só alvo possível. | Corrigido nesta versão. |
| 4 | `scripts/teste/README.md`: "73 passos" | `fluxos.mjs` tem 93 chamadas de `passo`. | Atualizar o README. |
| 5 | Briefings das simulações dos temas 1, 6, 7 e 9 da rodada 2 | Erros registrados nos relatórios (ex.: o texto pronto do evento não diz "Mudou"). | Registrado em `levantamento-rodada-2.md`, seção 5. |
| 6 | TEST-10 exige suíte determinística | Não verificado formalmente. | Lacuna do requisito. |
| 7 | LAC-07: `fornecedores.turma_id` aceita nulo | Registro antigo sem turma não aparece. | Migração de dados ou filtro explícito. |
| 8 | `docs/Organograma da Aplicação.md` e o PDF da ERS | Ainda descrevem a versão 1.0. | Atualizar a partir desta versão. |

---

## 5. Histórico de revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 05/10/2026 | Equipe Formandos | Emissão inicial. RF-01 a RF-27, RN-01 a RN-28, RNF-01 a RNF-14, 22 cenários Gherkin. |
| 2.0 | 16/11/2026 | Equipe Formandos | Conferida contra o código de 16/11/2026 e as ADR-0001 a 0016. Novos requisitos atendidos RF-28 a RF-54, emails EM-13 a EM-21, regras RN-29 a RN-43, papéis de observador e tesouraria, RNF-15 (LGPD). Requisitos propostos RF-55 a RF-70 e decisões DEC-01 a DEC-05, vindos de `docs/simulacoes/levantamento-rodada-2.md`. Corrigidos RF-05, RF-09, RF-27, RN-01, RN-03, RN-22 e RN-24. Arquitetura atualizada para Docker local, com backup diário de 30 dias. Lacunas LAC-03 e LAC-05 resolvidas, LAC-01 e LAC-06 parciais, LAC-08 a LAC-11 novas. Cenários Gherkin reescritos (E.G.01 a E.G.15). |
