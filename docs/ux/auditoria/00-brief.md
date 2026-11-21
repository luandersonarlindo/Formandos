# Brief comum — auditoria de simplificação UX/UI (Formandos)

Repo: /home/luan/Imagens/formandos (Next.js 16 App Router, shadcn/ui style radix-nova, Tailwind 4, lucide). pt-BR.
Objetivo do dono: deixar o app MAIS SIMPLES para o usuário, MENOS interação/complexidade. Pode propor trocar componentes e estruturas (rotas, layouts, fusão de telas).

LEIA ANTES (obrigatório):
- PRODUCT.md e DESIGN.md (raiz) — usuários, princípios, regras visuais. Celular/tablet/TV (D-pad) são contextos reais.
- .opencode/skills/impeccable/reference/distill.md, clarify.md, critique.md, component-review.md (método de simplificação).
- .opencode/skills/ui-ux-pro-max/SKILL.md (só a parte de regras de UX; não use as paletas — design visual já está decidido).
- src/components/ui/ (componentes shadcn já instalados: badge button card collapsible dialog dropdown-menu input label native-select progress separator sheet sidebar skeleton textarea tooltip).
- src/components/features/app-shell.tsx e layouts dos grupos de rota.

Catálogo shadcn disponível para propor (https://ui.shadcn.com/docs/components): Accordion, Alert, Alert Dialog, Avatar, Badge, Breadcrumb, Button, Button Group, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox, Command, Context Menu, Data Table, Date Picker, Dialog, Drawer, Dropdown Menu, Empty, Field, Hover Card, Input, Input Group, Input OTP, Item, Kbd, Label, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Spinner, Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip.

Restrições (não negociáveis):
- NÃO editar nenhum arquivo. Só ler e reportar.
- Não mudar regra de negócio, RBAC, LGPD/auditoria, visibilidade admin-only. Simplificar apresentação e fluxo.
- Não inventar dados, métricas ou features. Toda afirmação ancorada em arquivo:linha.
- Respeitar DESIGN.md (one accent, flat, 44px touch, D-pad).

FORMATO DO RELATÓRIO (markdown, pt-BR, direto), salve em <scratchpad>/ux/<seu-grupo>.md E devolva o mesmo conteúdo como resposta final:

## Visão geral do grupo
3–6 bullets: padrões de complexidade que se repetem nessas telas.

## Por tela (uma seção para CADA rota do seu grupo, sem pular nenhuma)
### <rota> — `arquivo`
- Objetivo único da tela (1 frase) e quem usa.
- Inventário: nº aproximado de ações/botões, formulários, cards, seções visíveis de uma vez.
- Fricções (cada uma com arquivo:linha): o que complica e por quê.
- Proposta: o que remover, juntar, esconder (progressive disclosure), reordenar. Uma ação primária.
- Componentes: troca concreta (ex.: "lista de Cards → Item + Empty"; "native-select → Select"; "confirm em página → AlertDialog"; "form longo → Field + Drawer no mobile").
- Esforço P/M/G · Impacto alto/médio/baixo · Risco (o que pode quebrar: testes, a11y, D-pad).

## Mudanças transversais sugeridas
Componentes/padrões que valem para várias telas (ex.: um padrão de lista, um padrão de form em Dialog/Drawer, Sonner para feedback).

## Decisões que precisam do dono do produto
Perguntas fechadas com 2–4 opções cada e sua recomendação.
