# Plano de Auditoria Interna — Formandos

**Critério:** `docs/PSI.md` + `docs/SoA.md` + `docs/legislacao.md` + ERS.
**Versão:** 1.0 — 2026-10-10. **Aprovada por:** Luanderson Arlindo de Oliveira.

> Auditoria é sistemática, independente, documentada e baseada em evidência;
> achado = evidência comparada com o critério (aula 8).

## 1. Independência (limitação declarada)

Todo o projeto é desenvolvido por uma pessoa (MEI unipessoal). Auditar o
próprio trabalho é **ameaça de autorrevisão** à independência. Medidas:

1. Evidência objetiva e reproduzível no lugar de julgamento próprio: suite
   vitest (157 testes), E2E `scripts/teste/fluxos.mjs`, typecheck.
2. Auditoria interna aqui equivale a **autoverificação de 1ª linha**, não a 3ª
   linha. Para certificação ou disputa relevante, exigir 2ª parte (colega,
   professor, cliente) ou 3ª parte (certificadora).

## 2. Abordagens usadas

| Abordagem (aula 8) | Como se aplica aqui |
|---|---|
| Ao redor do computador | E2E `fluxos.mjs`: compara entrada (clique/form) com saída (texto, banco) sem olhar o código |
| Através do computador | Revisão de `dal.ts`, `auth.ts`, actions: lógica de gates, hooks, transações |
| Com o computador | `psql` direto no banco (ex.: contas descartáveis apagadas em 2026-10-08); `npm audit`; `auditoria.mjs` (responsividade/console) |

## 3. Programa (o que auditar, quando, evidência)

| # | Objeto | Critério | Evidência | Frequência |
|---|---|---|---|---|
| A-01 | Autenticação e cadastro | PSI N.01/N.02, SoA 8.5 | `auth-config.test.ts`, `email-validacao.test.ts` (21), E2E auth | Por entrega |
| A-02 | Autorização (RBAC) | PSI N.01, SoA 5.15–5.18 | E2E "participante que abre o painel volta ao dashboard"; `dal.ts` | Por entrega |
| A-03 | Validação de entrada e SQL | PSI N.03, SoA 8.25–8.28 | Zod em actions; grep `pool.query` sem `$` deve voltar vazio; typecheck | Por entrega |
| A-04 | Headers e config | PSI N.03, SoA 8.9 | `next.config.ts`; teste de resposta HTTP | Por entrega |
| A-05 | Direitos do titular (LGPD) | `legislacao.md`, SoA 8.10 | E2E exclusão de conta; conta apagada cita turmas por email | Trimestral |
| A-06 | Dependências | SoA 8.8 | `npm audit`; `package-lock.json` versionado | Mensal |
| A-07 | Backup/RPO (risco R-04) | PSI §2, SoA 8.13 | Comprovante PITR Neon + teste de restore | Até 2026-11-10, depois semestral |

## 4. Registro de achados (modelo)

| Data | Achado (evidência × critério) | Classificação | Correção (sintoma) | Ação corretiva (causa) | Prazo | Status |
|---|---|---|---|---|---|---|
| 2026-10-08 | 4 domínios temporários (`hidesit`, `18lover`, `darkemail`, `emailnox`) criaram conta — evidência: 6 linhas em `usuarios`; critério: PSI N.02 | Não conformidade | Contas apagadas via `psql` | Domínios na lista + pacote `disposable-domains` no hook (commit `d7197ec`) | — | Fechado |
| … | | | | | | |

## 5. Relatório

Cada ciclo gera: escopo, critério, amostra (comandos e saídas), achados na
tabela acima, conclusão (conformidade + riscos residuais) e assinatura da
Direção. Sem relatório assinado, a entrega não conta como auditada.
