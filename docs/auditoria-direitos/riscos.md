# Matriz de Riscos — Formandos

**Método (aula 1):** Risco = Probabilidade × Impacto (escala 1–3 cada; escore =
P×I: 1–2 baixo, 3–4 médio, 6–9 alto). **Tratamento:** aceitar, transferir,
mitigar ou evitar. **Versão:** 1.0 — 2026-10-10. **Dono:** Direção.

## Riscos avaliados

| # | Risco (vulnerabilidade × ameaça) | P | I | Escore | Tratamento | Controle / evidência | Residual |
|---|---|---|---|---|---|---|---|
| R-01 | Vazamento de sessão (cookie roubado via XSS) | 1 | 3 | 3 médio | Mitigar | `nosniff` + `DENY` frame + React escapa output por padrão; único `dangerouslySetInnerHTML` é o script estático de tema (`layout.tsx:49`), sem dado de usuário | Baixo |
| R-02 | Enumeração de contas no login/reset | 1 | 2 | 2 baixo | Mitigar | Resposta genérica no reset (`form-senha.tsx:49`); erro genérico no login | Baixo |
| R-03 | Injeção SQL | 1 | 3 | 3 médio | Mitigar | 100% SQL parametrizado (`$1…`); Zod em toda action | Baixo |
| R-04 | Perda de dados (sem rotina própria de backup) | 2 | 3 | 6 **alto** | Transferir + mitigar | Herdado Neon/Vercel; **ação:** confirmar PITR do plano Neon e documentar RPO/RTO — prazo 30 dias | Médio |
| R-05 | Adivinhação de código de convite | 1 | 2 | 2 baixo | Mitigar | Rate limit `tentativas_convite` (`turmas.ts:119-138`) + alfabeto sem ambíguos | Baixo |
| R-06 | Conta falsa / descartável | 2 | 2 | 4 médio | Mitigar | Verificação obrigatória + anti-descartável/typo (`email-validacao.ts`, hook `auth.ts`) | Baixo |
| R-07 | Vazamento via email (SMTP interceptado) | 1 | 3 | 3 médio | Transferir | TLS no SMTP; sem senha/link sensível no corpo (só links com token e validade) | Baixo |
| R-08 | Privilégio indevido (participante vira admin) | 1 | 3 | 3 médio | Mitigar | Gates `exigirAdmin` em layout + actions; master via env fora do banco | Baixo |
| R-09 | Falha de deploy quebra disponibilidade | 2 | 2 | 4 médio | Mitigar | `prebuild` com migrate; typecheck + 157 testes + E2E antes de entrega | Baixo |
| R-10 | Dependência de terceiros (Vercel/Neon/Google/SMTP) | 2 | 2 | 4 médio | Aceitar | Sem alternativa viável p/ MEI; monitorado via E2E e erros de console | Médio |
| R-11 | Sanção LGPD (direito não atendido, incidente não comunicado) | 1 | 3 | 3 médio | Mitigar | `docs/legislacao.md`; exclusão de conta pronta; canal DPO; N.04 da PSI | Baixo |
| R-12 | Autorrevisão (dev audita o próprio código) | 3 | 2 | 6 **alto** | Mitigar | Testes automatizados como evidência objetiva + auditoria 2ª parte recomendada (`docs/auditoria.md`) | Médio |

## Leituras da matriz

- **Maiores escores:** R-04 (backup) e R-12 (autorrevisão) — únicos altos, ambos
  com ação aberta e prazo.
- **PDCA aplicado:** Planejar (esta matriz + PSI), Executar (controles no
  código), Checar (testes + auditoria), Agir (correção do sintoma + ação
  corretiva na causa — ex.: domínios `hidesit/18lover/darkemail/emailnox`
  entraram na lista após teste manual real).
- **Revisão:** a cada entrega relevante ou incidente. Risco residual acima é
  aceito pela Direção nesta versão.
