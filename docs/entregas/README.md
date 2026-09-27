# Entregas do cronograma — Formandos

Documentos pedidos no *Cronograma de Entregas – 2026*, até 29/09/2026. Cada um existe em Markdown (`.md`, para editar e revisar no GitHub) e em PDF (`.pdf`, para entregar). Os nomes seguem os do cronograma.

| Data | Entrega do cronograma | Documentos |
|---|---|---|
| 01/09/2026 | Kick-off + Sprint Backlog + definição do MVP | [Kick-off](01-09-2026/Kick-off.md) · [Sprint Backlog](01-09-2026/Sprint%20Backlog.md) · [Definição do MVP](01-09-2026/Defini%C3%A7%C3%A3o%20do%20MVP.md) — cada um traz uma nota (seção 0) sobre como o pensamento evoluiu do primeiro commit até a Sprint 1 |
| 08/09/2026 | Termo de Abertura + visão do produto + papéis | [Termo de Abertura](08-09-2026/Termo%20de%20Abertura.md) · [Visão do Produto](08-09-2026/Vis%C3%A3o%20do%20Produto.md) · [Papéis](08-09-2026/Pap%C3%A9is.md) |
| 15/09/2026 | Stakeholders + requisitos prioritários | [Stakeholders](15-09-2026/Stakeholders.md) · [Requisitos Prioritários](15-09-2026/Requisitos%20Priorit%C3%A1rios.md) |
| 22/09/2026 | Arquitetura inicial + organização do repositório Git | [Arquitetura Inicial](22-09-2026/Arquitetura%20Inicial.md) · [Organização do Repositório Git](22-09-2026/Organiza%C3%A7%C3%A3o%20do%20Reposit%C3%B3rio%20Git.md) |
| 29/09/2026 | Sprint 1: incremento funcional + documentação | [Sprint 1 - Incremento funcional + Documentação](29-09-2026/Sprint%201%20-%20Incremento%20funcional%20%2B%20Documenta%C3%A7%C3%A3o.md) |

## Pendências para o grupo preencher

- Quem é o **Product Owner** e o **Scrum Master** (documento *Papéis*).
- **Nome do(a) professor(a)** da Fábrica (*Termo de Abertura* e *Stakeholders*).
- **Assinaturas** do *Termo de Abertura*.
- Datas de início e fim da Sprint 1 e horas por integrante, se a disciplina pedir (*Sprint 1*).

## Gerar os PDFs de novo

```bash
node scripts/docs/gerar-pdf.mjs                 # todos os documentos de docs/entregas
node scripts/docs/gerar-pdf.mjs "docs/entregas/01-09-2026/Kick-off.md"   # um só
```

O script usa `npx` (com internet na primeira vez, para baixar o conversor de Markdown) e o Google Chrome (ou `CHROME=/caminho/do/chrome`).
