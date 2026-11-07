# Arquivos de IA do projeto

Mapa dos arquivos e pastas que as IAs usam neste repositório. Eles ficam na
raiz por exigência das ferramentas — não mova sem conferir a coluna "Pode mover?".

| Caminho | O quê | Dono | Pode mover? |
|---|---|---|---|
| `AGENTS.md` | Regras de agente (bloco gerenciado pelo `next dev`) | Next.js | Não |
| `CLAUDE.md` | Ponteiro para `AGENTS.md` (`@AGENTS.md`) | Claude Code | Não |
| `.claude/` | Config local do Claude Code (`settings.json`) | Claude Code | Não |
| `.opencode/` | Skills e config do OpenCode | OpenCode | Não |
| `.impeccable/` | Sidecar do design system (`design.json`) | Skill impeccable | Não |
| `PRODUCT.md` | Verdade de produto (carregado da raiz pelo impeccable) | Time + IA | Não |
| `DESIGN.md` | Verdade visual (carregado da raiz pelo impeccable) | Time + IA | Não |
| `docs/design-system/` | Cópia persistida do design system (MASTER + páginas) | Time + IA | Sim (já está em `docs/`) |
| `docs/sessoes/` | Notas de sessão de trabalho com IA | IA | Sim |

Regras rápidas:

- Nunca edite à mão o bloco `BEGIN:nextjs-agent-rules` de `AGENTS.md`: o `next dev` o reescreve.
- `PRODUCT.md` e `DESIGN.md` são fonte de verdade: mude o produto ou o visual primeiro no código, depois reflita aqui (ou peça à IA).
- `docs/sessoes/` é rascunho de trabalho; pode apagar quando a sessão virar commit.
