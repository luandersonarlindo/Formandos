# Política de Segurança da Informação (PSI) — Formandos

**Controladora:** 61.557.779 LUANDERSON ARLINDO DE OLIVEIRA (MEI)
**Aprovada por (Direção):** Luanderson Arlindo de Oliveira
**Versão:** 1.0 — **Vigência desde:** 2026-10-10 — **Revisão:** anual ou após incidente relevante
**DPO / canal do titular:** luandersona.oliveira@unifacol.edu.br

> Hierarquia (aula 7): esta Política diz **o quê**. As Normas (`docs/SoA.md`,
> `docs/legislacao.md`) trazem regras obrigatórias; os Procedimentos explicam
> **como** (README, `db/migrate.mjs`, `scripts/teste/`); as Diretrizes são
> recomendações. Exceções a esta PSI são formais, com prazo e aceite da Direção.

## 1. Objetivo e escopo

Proteger os dados tratados no app Formandos — nome, email, votos em enquetes,
confirmações de presença, dúvidas, tarefas e fornecedores das turmas — contra
acesso indevido, alteração indevida e indisponibilidade. Vale para o titular da
MEI, colaboradores futuros e prestadores (hospedagem, banco de dados, SMTP).

## 2. Princípios

| Princípio | O que significa aqui | Onde vive no projeto |
|---|---|---|
| Confidencialidade | Só quem pode, acessa | RBAC master/admin/participante (`src/lib/dal.ts`: `exigirSessao`, `exigirMembro`, `exigirAdmin`, `exigirMaster`); sessão Better Auth; email confirmado obrigatório (`src/lib/auth.ts`) |
| Integridade | Dado não muda sem permissão | Validação Zod em toda Server Action; SQL parametrizado; transações (`src/lib/db.ts`) |
| Disponibilidade | Acesso quando preciso | Hospedagem gerenciada (Vercel + Neon); rotina de backup a formalizar (risco R-04 em `docs/riscos.md`) |
| Autenticidade | A origem é quem diz ser | Confirmação de email por link antes do primeiro login; Google OAuth |
| Não repúdio | Autor não nega o que fez | Emails transacionais registram remoções; trilha de auditoria persistente prevista (fase 3) |

## 3. Papéis e responsabilidades (RACI resumido)

| Atividade | Direção | DPO | Time dev (2ª linha) | Admins de turma (1ª linha) |
|---|---|---|---|---|
| Aprovar PSI e aceitar risco crítico/residual | **A** | C | R | I |
| Operar turmas (membros, presença, votações) | I | — | — | **R** |
| Implementar controles e testes | A | C | **R** | I |
| Atender direitos do titular (LGPD) | A | **R** | R | I |
| Responder à ANPD | A | **R** | C | — |

**Acúmulo declarado:** hoje todos os papéis estão com o titular da MEI. Auditoria
independente (3ª linha) não pode ser exercida por quem desenvolveu — ver
`docs/auditoria.md` (ameaça de autorrevisão).

## 4. Normas (regras obrigatórias)

- **N.01 — Controle de acesso:** senha mínima de 8 caracteres; email verificado
  exigido; papéis fora do banco quando forem de plataforma (`ADMIN_MASTER_EMAILS`
  em variável de ambiente); sessão invalidada na exclusão da conta.
- **N.02 — Dados e privacidade:** coletar o mínimo necessário (nome, email e dados
  da formatura); sem email descartável no cadastro (`src/lib/email-validacao.ts`);
  eliminação e correção sob pedido do titular (LGPD, art. 18); segredos só em
  variáveis de ambiente, nunca no repositório.
- **N.03 — Operação segura:** rate limit no convite (`tentativas_convite`,
  `src/actions/turmas.ts`); cabeçalhos de segurança (`next.config.ts`:
  `nosniff`, `DENY` frame, `Referrer-Policy`, `Permissions-Policy`);
  `poweredByHeader` desligado; dependências atualizadas antes de cada entrega.
- **N.04 — Incidentes:** comunicar à Direção em até 24h; registrar causa raiz
  (ação corretiva), não só o sintoma (correção); avaliar comunicação à ANPD e
  aos titulares conforme LGPD, arts. 48 e 50.

## 5. Procedimentos (como fazer)

- Deploy e migrações: `db/migrate.mjs` (roda no `prebuild`).
- Evidência de funcionamento: suite vitest (`npm test`) + E2E
  (`scripts/teste/fluxos.mjs`).
- Exclusão de conta e saída de turma: fluxos em `src/actions/conta.ts` e
  `src/actions/turmas.ts` (apagam em transação + notificam por email).

## 6. Diretrizes (recomendado)

- Ativar HSTS e Content-Security-Policy ao publicar em domínio próprio.
- Revisar a SoA a cada entrega relevante.
- Preferir listas mantidas pela comunidade a listas manuais (precedente:
  `disposable-domains` no lugar de lista própria).

## 7. Exceções formais

| # | Exceção | Motivo | Prazo | Aceite |
|---|---|---|---|---|
| E-01 | SMTP via conta Gmail institucional em dev (`SMTP_HOST=smtp.gmail.com`) | Sem provedor transacional contratado | Reavaliar ao publicar em domínio próprio | Direção, 2026-10-10 |
| E-02 | Sem HSTS/CSP | Deploy atual sem domínio próprio; headers básicos ativos | Idem E-01 | Direção, 2026-10-10 |

## 8. Descumprimento e revisão

Descumprimento por colaborador/prestador gera advertência e, em reincidência,
rescisão. Esta PSI é comunicada ao time a cada versão e revista anualmente ou
após incidente relevante, mudança legal ou mudança de arquitetura.
