# Entregas do cronograma — Formandos

Documentos do *Cronograma de Entregas – 2026*, do início do projeto até o fechamento da Sprint 2. Cada um existe em Markdown (`.md`, para editar e revisar no GitHub), em PDF (`.pdf`) e em Word (`.doc`), os dois últimos gerados por script. Os nomes seguem os do cronograma.

| Data | Entrega do cronograma | Documentos |
|---|---|---|
| 01/09/2026 | Kick-off + Sprint Backlog + definição do MVP | [Kick-off](01-09-2026/Kick-off.md) · [Sprint Backlog](01-09-2026/Sprint%20Backlog.md) · [Definição do MVP](01-09-2026/Defini%C3%A7%C3%A3o%20do%20MVP.md) — o Kick-off abre com a tabela do que evoluiu desde o dia do alinhamento |
| 08/09/2026 | Termo de Abertura + visão do produto + papéis | [Termo de Abertura](08-09-2026/Termo%20de%20Abertura.md) · [Visão do Produto](08-09-2026/Vis%C3%A3o%20do%20Produto.md) · [Papéis](08-09-2026/Pap%C3%A9is.md) |
| 15/09/2026 | Stakeholders + requisitos prioritários | [Stakeholders](15-09-2026/Stakeholders.md) · [Requisitos Prioritários](15-09-2026/Requisitos%20Priorit%C3%A1rios.md) |
| 22/09/2026 | Arquitetura inicial + organização do repositório Git | [Arquitetura Inicial](22-09-2026/Arquitetura%20Inicial.md) · [Organização do Repositório Git](22-09-2026/Organiza%C3%A7%C3%A3o%20do%20Reposit%C3%B3rio%20Git.md) |
| 29/09/2026 | Sprint 1: incremento funcional + documentação | [Sprint 1 - Incremento funcional + Documentação](29-09-2026/Sprint%201%20-%20Incremento%20funcional%20%2B%20Documenta%C3%A7%C3%A3o.md) |
| 06/10/2026 | Fechamento da Sprint 1 + revisão dos artefatos | [Fechamento da Sprint 1](06-10-2026/Fechamento%20da%20Sprint%201.md) |
| 13/10/2026 | Apresentação da Fábrica (AV I) | [Apresentação da Fábrica (AV I)](13-10-2026/Apresenta%C3%A7%C3%A3o%20da%20F%C3%A1brica%20%28AV%20I%29.md) |
| 20/10/2026 | Revisão + retrospectiva + planejamento da Sprint 2 | [Revisão, Retrospectiva e Planejamento da Sprint 2](20-10-2026/Revis%C3%A3o,%20Retrospectiva%20e%20Planejamento%20da%20Sprint%202.md) |
| 27/10/2026 | Status Report: código + documentação + qualidade | [Status Report](27-10-2026/Status%20Report.md) |
| 03/11/2026 | Plano, casos e resultados de testes | [Plano, Casos e Resultados de Testes](03-11-2026/Plano,%20Casos%20e%20Resultados%20de%20Testes.md) |
| 10/11/2026 | Sprint 2: integração, testes e estabilização | [Sprint 2 - Integração, Testes e Estabilização](10-11-2026/Sprint%202%20-%20Integra%C3%A7%C3%A3o,%20Testes%20e%20Estabiliza%C3%A7%C3%A3o.md) |
| 17/11/2026 | Sprint Backlog + Status Report II | [Sprint Backlog - Sprint 3](17-11-2026/Sprint%20Backlog%20-%20Sprint%203.md) · [Status Report II](17-11-2026/Status%20Report%20II.md) |
| 24/11/2026 | Entrega final do produto + documentação + pré-banca | [Entrega Final](24-11-2026/Entrega%20Final.md) |

São **19 documentos** de entrega, cada um em Markdown, PDF e Word. O ciclo do cronograma fecha em 24/11/2026.

## Pendências para o grupo preencher

Marcados nos documentos com `⟨a definir⟩`:

- **Nome do(a) professor(a)** da Fábrica e canal de contato (*Stakeholders* **S4**, *Termo de Abertura*, *Apresentação da Fábrica*).
- Quem é o **Product Owner** e o **Scrum Master** (*Papéis*).
- **Assinaturas** do *Termo de Abertura*.
- **Nota da AV I** e o parecer por critério (*Apresentação da Fábrica*).
- Datas de início e fim e **horas por integrante** da Sprint 1 e da Sprint 2, se a disciplina pedir (*Sprint 1*, *Sprint 2*).
- Quantos Pull Requests foram abertos, se a disciplina pedir (*Status Report*).
- Aparelho Android físico para o teste de leitor de ecrã (*Plano de Testes*, *Sprint 2*) — resolvido em 12/11/2026, registrado no *Status Report II*.
- **Responsável por cada item H1 a H9** e **prazo de resposta às perguntas da pré-banca** (*Sprint Backlog — Sprint 3*, *Entrega Final*).

## Gerar os PDFs e os .doc de novo

```bash
node scripts/docs/gerar-pdf.mjs                 # todos os documentos de docs/entregas
node scripts/docs/gerar-pdf.mjs "docs/entregas/01-09-2026/Kick-off.md"   # um só

node scripts/docs/gerar-doc.mjs                 # gera os .doc (Word 97-2003)
node scripts/docs/gerar-doc.mjs "docs/entregas/01-09-2026/Kick-off.md"   # um só
```

Os dois scripts usam `npx` (com internet na primeira vez, para baixar o conversor de Markdown). O `gerar-pdf.mjs` usa o Google Chrome (ou `CHROME=/caminho/do/chrome`); o `gerar-doc.mjs` usa o LibreOffice (ou `SOFFICE=/caminho/do/soffice`).
