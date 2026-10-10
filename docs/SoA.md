# Declaração de Aplicabilidade (SoA) — Formandos

**Referência:** ISO/IEC 27002:2022 (93 controles: 37 organizacionais + 8 de
pessoas + 14 físicos + 34 tecnológicos). **Versão:** 1.0 — 2026-10-10.
**Aprovada por:** Luanderson Arlindo de Oliveira (Direção).

> SoA lista o aplicável e **justifica cada exclusão** (aula 5). Legenda:
> ✅ aplicável (com evidência) · 🔶 parcial/planejado · ❌ fora de escopo (com
> justificativa). Projeto de pessoa única (MEI): controles de segregação e de
> estrutura física de escritório não se aplicam — a compensação é teste
> automatizado + evidência versionada.

## 5.x — Organizacionais (37)

| # | Controle | Status | Evidência / justificativa |
|---|---|---|---|
| 5.1 | Políticas de segurança | ✅ | `docs/PSI.md` v1.0 |
| 5.2 | Papéis e responsabilidades | 🔶 | RACI na PSI; acúmulo em 1 pessoa declarado |
| 5.3 | Segregação de funções | ❌ | Inaplicável (MEI unipessoal). Compensação: gates + testes |
| 5.9 | Contato com autoridades | ✅ | DPO e ANPD em `docs/legislacao.md` |
| 5.10 | Contato com grupos de interesse | ❌ | Sem fórum setorial; reavaliar ao escalar |
| 5.12 | Classificação da informação | 🔶 | Implícita (mínimo necessário); sem tabela formal — fase 2 |
| 5.15–5.18 | Controle de acesso, identidade, autenticação, direitos | ✅ | RBAC `src/lib/dal.ts`; Better Auth; senha mín 8; email verificado; master via env |
| 5.20 | Segurança em acordos com fornecedores | 🔶 | Termos Vercel/Neon/Google aceitos; sem DPA dedicado — fase 2 |
| 5.21–5.23 | Cadeia de suprimento, serviços, nuvem | 🔶 | Responsabilidade compartilhada assumida (TLS, sslmode=require no Neon); sem documento formal |
| 5.24–5.28 | Planejamento e resposta a incidentes | 🔶 | N.04 da PSI (24h, causa raiz); evidência = emails transacionais; sem simulado |
| 5.29 | Continuidade | 🔶 | Herdada de Vercel/Neon; sem RTO/RPO escritos — risco R-04 |
| 5.30–5.34 | Conformidade legal, registros, PI, proteção de dados | ✅ | `docs/legislacao.md`; atribuição Freepik (`secoes.tsx:514`); exclusão de conta (`conta.ts`) |
| 5.35 | Revisão independente | 🔶 | `docs/auditoria.md`; limitação de autorrevisão declarada |
| 5.36–5.37 | Conformidade e procedimentos documentados | ✅ | README, ERS, guia-de-estudo, organograma |
| demais 5.x | Inteligência de ameaças, gestão de projetos etc. | ❌ | Sem capacidade organizacional; risco aceito e registrado |

## 6.x — Pessoas (8)

| # | Controle | Status | Evidência / justificativa |
|---|---|---|---|
| 6.1–6.2 | Seleção, termos e condições | ❌ | Sem colaboradores; aplicar ao contratar (cláusula padrão pronta na fase 2) |
| 6.3 | Conscientização e treinamento | 🔶 | Autocapacitação documentada (aulas 1–8 + este SGSI); sem programa formal |
| 6.4–6.7 | Disciplinar, pós-desligamento, teletrabalho, relato de eventos | ❌/🔶 | Sem equipe; relato de eventos = N.04 da PSI |
| 6.8 | Reporte de fraquezas | 🔶 | Canal DPO recebe relatos; sem formulário dedicado |

## 7.x — Físicos (14)

| # | Controle | Status | Evidência / justificativa |
|---|---|---|---|
| 7.1–7.6 | Perímetro, entrada, escritório, ameaças físicas | ❌ | Sem sede/escritório; datacenter herdado de Vercel/Neon/Google |
| 7.7–7.10 | Mesa limpa, mídias, equipamentos | 🔶 | Ativo físico = notebook dev: exigir criptografia de disco + bloqueio de tela (norma a formalizar) |
| 7.11–7.14 | Utilidades, cabeamento, manutenção, descarte | ❌ | Herdados dos provedores nuvem |

## 8.x — Tecnológicos (34)

| # | Controle | Status | Evidência / justificativa |
|---|---|---|---|
| 8.2–8.4 | Acesso privilegiado, restrição, código-fonte | ✅ | Master só via env; gates por rota; repo com acesso controlado |
| 8.5 | Autenticação segura | ✅ | `src/lib/auth.ts` + `form-email-senha.tsx`: mín 8, verificação obrigatória, anti-enumeração, anti-descartável (`email-validacao.ts`) |
| 8.8 | Gestão de vulnerabilidades | 🔶 | `npm audit` antes de entregas; sem rotina agendada — fase 3 |
| 8.9 | Gestão de configuração | ✅ | `next.config.ts` (headers, sem `poweredByHeader`); env fora do repo |
| 8.10 | Eliminação de dados | ✅ | Exclusão de conta/turma em transação + notificação (`conta.ts`, `turmas.ts`) |
| 8.13–8.14 | Backup e redundância | 🔶 | Herdados do Neon/Vercel; sem rotina própria nem RPO testado — risco R-04 |
| 8.15–8.16 | Registro e monitoramento | 🔶 | Emails transacionais como notificação; E2E checa erros de console; sem trilha de auditoria persistente — fase 3 |
| 8.20 | Segurança de rede | ✅ | TLS fim a fim (Vercel); `sslmode=require` no Neon; rate limit convite (`tentativas_convite`) |
| 8.22/8.31 | Segregação dev/prod | ✅ | Banco local dev vs Neon prod (`.env.local`: `APP_/MIGRATION_DATABASE_URL`) |
| 8.24 | Criptografia | ✅ | Senhas com hash via Better Auth (nunca texto puro); TLS; sem cripto própria |
| 8.25–8.29 | SDLC seguro e testes | ✅ | Zod em toda action; SQL parametrizado; escape HTML nos emails; 157 testes vitest + E2E `fluxos.mjs` + `auditoria.mjs` (responsividade) |
| 8.32 | Gestão de mudanças | ✅ | Git, commits convencionais em PT, typecheck + testes antes de cada entrega |
| 8.33 | Proteção de dados de teste | ✅ | E2E usa `example.invalid` (domínio reservado RFC), nunca email real |
| demais 8.x | DLP, mascaramento, filtragem web, endpoints | ❌ | Sem superfície que justifique hoje; reavaliar ao escalar |

## Exclusões — resumo

Fora de escopo com aceite da Direção (2026-10-10): segregação de funções,
estrutura física de escritório, inteligência de ameaças, DLP/mascaramento,
fornecedores além da nuvem contratada. Risco residual registrado em
`docs/riscos.md`. Revisão desta SoA a cada entrega relevante.
