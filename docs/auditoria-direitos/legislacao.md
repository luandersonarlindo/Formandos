# Direito e Legislação em Informática — Formandos

**Versão:** 1.0 — 2026-10-10. **Responsável:** Luanderson Arlindo de Oliveira
(Direção + DPO). **Canal do titular:** luandersona.oliveira@unifacol.edu.br.

> Cada lei abaixo mapeia para o status real no projeto: ✅ atendido (com
> evidência) · 🔶 parcial/planejado (fase 2) · ❌ lacuna com prazo.

## 1. LGPD — Lei 13.709/2018

Base legal do tratamento: **consentimento** no cadastro + **legítimo interesse**
na operação da turma (organizar a formatura). Dados: nome, email e conteúdo da
formatura (votos, presença, dúvidas, tarefas). Sem dado sensível (art. 11).

| Direito (art. 18) | Status | Onde |
|---|---|---|
| Confirmação e acesso (I) | ✅ | Telas + download JSON em `/conta` (`conta/exportar/route.ts`, `usuarios.ts:getMeusDados`) |
| Correção (III) | ✅ | Nome corrigível (`conta.ts:atualizarMeuNome`); email via re-cadastro |
| Anonimização/bloqueio/eliminação (IV, VI) | ✅ | Exclusão de conta em transação + notificação (`conta.ts:excluirMinhaConta`); saída de turma apaga rastro (`turmas.ts`) |
| Portabilidade (V) | ✅ | Mesma exportação JSON do acesso |
| Consentimento | ✅ | Checkbox obrigatório no cadastro email/senha + carimbo `usuarios.consentimento_em` (hook `auth.ts`); Google consente via OAuth |
| Revogação do consentimento (IX) | ✅ | Excluir a conta = revogar; sem retenção além do necessário |
| Oposição e revisão automatizada (art. 18, §2º; art. 20) | ✅ | Sem decisão automatizada no app; nada a revisar |

Obrigações do controlador:

- **Registro e finalidade (arts. 16, 23):** finalidade declarada na PSI §1; sem
  compartilhamento além dos operadores (Vercel, Neon, Google, SMTP).
- **Segurança e comunicação de incidente (arts. 46, 48):** controles na SoA;
  N.04 da PSI (24h + avaliação de comunicação à ANPD e titulares).
- **DPO (art. 41):** identificado no cabeçalho; canal divulgado em
  `/privacidade`, `/termos` e no cartão de `/conta` (`src/lib/empresa.ts`).
- **Relatório de impacto (art. 38):** dispensável pelo porte/risco atual;
  reavaliar se tratar dado sensível ou escalar base.

## 2. Marco Civil da Internet — Lei 12.965/2014

- **Neutralidade e liberdade (arts. 3º, 8º):** respeitadas; sem bloqueio ou
  discriminação de conteúdo de turma.
- **Guarda de registros (arts. 13–15):** ✅ tabela `auditoria`
  (`db/schema.sql`, escrita em `src/lib/auditoria.ts`, instrumentada em
  `admin.ts`, `master.ts`, `conta.ts`, `gestao-turma.ts`); retenção 5 anos com
  limpeza manual registrada em relatório. Sessões Better Auth cobrem o
  operacional.
- **Remoção de conteúdo (art. 19):** reserva judicial como regra; no app, o
  autor apaga a própria dúvida e o admin modera — regra contratual da turma,
  documentada nos Termos (fase 2).

## 3. Crimes cibernéticos — Lei 12.737/2012 (Carolina Dieckmann)

Invasão de dispositivo/conta alheia é crime (art. 154-A CP). Medidas do
projeto: sessão exigida em toda rota (`proxy.ts` + gates `dal.ts`); sem
endpoint que opere em conta alheia (exclusão só da própria, id vem da sessão —
`conta.ts:14`); tentativa de convite com rate limit.

## 4. Software — Lei 9.609/1998 e direitos autorais (Lei 9.610/1998)

- Código do app: titularidade da MEI (61.557.779 LUANDERSON ARLINDO DE
  OLIVEIRA); dependências MIT/compatíveis (`package.json`); ilustrações Amico
  com atribuição exigida (`secoes.tsx:514`).
- Engenharia reversa/uso indevido por terceiros: Termos de Uso (fase 2)
  proíbem scraping abusivo e repasse de acesso; rate limit já dificulta.

## 5. Consumidor — CDC (Lei 8.078/1990), no que couber

Serviço gratuito entre formandos; ainda assim: informação clara (telas em PT,
erros em linguagem simples), sem cláusula abusiva futura nos Termos, canal de
atendimento = DPO. Se houver plano pago um dia, reavaliar oferta e arrependimento.

## 6. Adequação executada (fases 2–3, 2026-10-10)

1. ✅ Páginas públicas `/privacidade` e `/termos` + links no rodapé e no cadastro.
2. ✅ Exportar meus dados em `/conta` (JSON) — acesso + portabilidade.
3. ✅ Consentimento explícito no signup com timestamp (`consentimento_em`).
4. ✅ Canal DPO visível em `/conta`, `/privacidade` e `/termos`.
5. ✅ HSTS + CSP (`next.config.ts`); trilha `auditoria` com retenção definida.
