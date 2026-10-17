# Fechamento da Sprint 1

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 06/10/2026 (fechamento da Sprint 1 + revisão dos artefatos) |
| **Versão** | 1.0 — elaborada em 06/10/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

Este documento fecha a Sprint 1 e registra o que a revisão dos artefatos encontrou nos documentos e no incremento entregues no dia 29/09/2026. Ele não repete o relatório da sprint: aponta o que passou, o que foi corrigido antes de declarar a sprint concluída e o que fica em aberto para a Sprint 2.

## 0. Os artefatos revisados

| Artefato | Entregue em | Situação na revisão |
|---|---|---|
| **Kick-off**, **Sprint Backlog**, **Definição do MVP** | 01/09/2026 | Consistente com o incremento entregue |
| **Termo de Abertura**, **Visão do Produto**, **Papéis** | 08/09/2026 | Consistente; papéis de PO e Scrum Master seguem ⟨a definir⟩ |
| **Stakeholders**, **Requisitos Prioritários** | 15/09/2026 | Consistente;Stakeholder **S4** (professora da Fábrica) sem nome ⟨a definir⟩ |
| **Arquitetura Inicial**, **Organização do Repositório Git** | 22/09/2026 | Consistente com o código em `src/` |
| **Sprint 1 — Incremento funcional + Documentação** | 29/09/2026 | Revisado neste marco |
| Código, banco e testes automatizados | 29/09/2026 | 12 itens do MVP, 12 concluídos |

## 1. O que a revisão encontrou

A revisão andou documento por documento conferindo cada afirmação contra o código. O que não bateu foi corrigido antes do fechamento; o que dependia de decisão do grupo foi registrado como pendência em vez de inventado.

| Achado | Onde | Correção |
|---|---|---|
| **Aplicação que dependia de `localhost` para montar o e-mail** | Envio de e-mail de confirmação | O endereço do servidor deixou de vazar para o conteúdo do e-mail |
| **Esquema do banco incompleto na Vercel** | `next.config.ts` | `db/schema.sql` passou a ser aplicado na compilação, junto das tabelas do Better Auth |
| **Exclusão sem confirmação** | Tarefas, avisos, dúvida, catálogo, conta, turma | Todo acesso destrutivo passou a pedir confirmação, com **Cancelar** ao lado de **Sim** |
| **Defeitos de UX nas telas internas e no acesso** | Voting, tarefas, dúvida, terceiros, entrar | Correção pontual de cinco defeitos de navegação e leitura |
| **Estados vazios sem ilustração** | Todas as telas internas | Ilustrações Amico (Storyset) com atribuição no rodapé da vitrine |
| **Questionário de pergunta clumsy demais** | Votações | Um formulário de pergunta por catálogo, com edição da programação em diálogo |

## 2. Correções aplicadas antes do fechamento

Entre 03/10/2026 e 05/10/2026 a equipe aplicou as correções da revisão. Foram 13 commits, todos no padrão *Conventional Commits*.

| Commit | Entrega |
|---|---|
| `feat: adiciona modo claro, escuro e sistema` | Controle de tema no painel, na vitrine e no acesso (item **G3** do backlog) |
| `feat: um formulário de pergunta por catálogo` | Um caminho só para perguntar dentro de um catálogo |
| `fix: corrige cinco defeitos de UX das telas internas e do acesso` | Navegação e legibilidade |
| `feat: apaga o rastro de quem sai da turma` | Rastro apagado em transação, com limite de acompanhantes |
| `feat: deixa os emails com a cara do site e cobre as turmas` | E-mail com identidade visual do produto |
| `feat: deixa corrigir o nome completo na conta` | Dado errado corrigível pelo próprio usuário |
| `feat: pede confirmação antes de excluir` | Confirmação em toda ação destrutiva |
| `fix: aplica db/schema.sql no build da Vercel` | Banco íntegro em ambiente novo |
| `fix: não deixa endereço de localhost vazar para o email` | Correção do achado de e-mail |
| `test: cobre o formulário único de pergunta e a edição em diálogo` | Cobertura do comportamento novo |

## 3. Situação do incremento no fechamento

| Indicador | Valor em 06/10/2026 |
|---|---|
| Itens do MVP | **12 de 12** concluídos |
| Commits no repositório | **50** desde o início do projeto |
| Arquivos TypeScript/TSX | 130 |
| Rotas de tela | 25 |
| Testes unitários | 20 passando (`npm test`) |
| Passos de teste de fluxo no navegador | 59 (`scripts/teste/fluxos.mjs`) |

O incremento é navegável de ponta a ponta: entrar, entrar na turma por convite, votar, perguntar, moderar, organizar o evento e administrar. Não há item do MVP bloqueado.

## 4. Pendências que seguem para a Sprint 2

| Pendência | Origem | Para quando |
|---|---|---|
| Nome do(a) professor(a) da Fábrica e canal de contato | Stakeholders **S4** | Antes da AV I |
| Product Owner e Scrum Master definidos | Papéis | Antes da revisão |
| Assinaturas do Termo de Abertura | Termo de Abertura | Antes da entrega final |
| Datas e horas da Sprint 1 por integrante | Sprint 1 | Se a disciplina pedir |
| Integração contínua com `typecheck` e testes a cada `push` | **G1** | Sprint 2 |
| Plano e casos de teste escritos | **G2** | Sprint 2 |
| Revisão de acessibilidade com leitor de ecrã | **G7** | Sprint 2 |

## 5. Decisões e riscos

**Decisões.** O projeto continua **sem hospedagem em produção**: o código fica no GitHub e roda localmente, conforme o Termo de Abertura. O catálogo padrão de 8 categorias passa a ser **opcional** na criação da turma, para a comissão poder começar do zero.

**Riscos.** O maior risco do fechamento é **depender de credenciais externas** para o login com Google; o login por email e senha já cobre esse caso. O segundo é a revisão por Pull Request, que segue **adotada por uma pessoa só** — cada commit sai da mesma conta, sem revisão de pares. A mitigação é a preparação da AV I, descrita no marco de 13/10/2026.