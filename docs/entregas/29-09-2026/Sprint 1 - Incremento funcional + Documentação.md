# Sprint 1 - Incremento funcional + Documentação

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 29/09/2026 (Sprint 1: incremento funcional + documentação) |
| **Versão** | 1.0 — elaborada em 26/09/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |
| **Fechamento da sprint** | 06/10/2026 (revisão dos artefatos) |

## 1. Resumo

A Sprint 1 entregou um **incremento funcional que cobre o MVP inteiro**: uma pessoa entra com Google ou email e senha, entra em uma turma por convite, vota nas enquetes, vê o relatório, faz e vota dúvidas, acompanha tarefas, programação e fornecedores, e a comissão administra tudo. Junto com o código, foram entregues os documentos de planejamento do cronograma (kick-off até arquitetura) e os testes automatizados.

| Indicador | Valor em 26/09/2026 |
|---|---|
| Meta da sprint | **Atingida**: MVP navegável de ponta a ponta |
| Itens do MVP (12) | 12 de 12 concluídos |
| Histórias do *Sprint Backlog* | Todas as dos épicos A a F concluídas, exceto **F6 (documentação)**, em andamento até o fechamento |
| Rotas de tela | 25 páginas, mais a API do Better Auth |
| Tabelas no banco | 17 (4 do Better Auth e 13 do domínio) |
| Código-fonte | 107 arquivos TypeScript/TSX (cerca de 8,5 mil linhas) |
| Commits | 32, todos no padrão *Conventional Commits* |
| Testes unitários | 20 passando (`npm test`) |
| Testes de fluxo no navegador | 59 passos passando (`scripts/teste/fluxos.mjs`) |
| Auditoria de responsividade | 20 páginas × 6 larguras (360 a 3840 px), sem rolagem horizontal |

## 2. Meta da sprint

> Entregar um **MVP navegável de ponta a ponta**: entrar, entrar em uma turma, votar, perguntar, acompanhar o evento e administrar.

## 3. Incremento funcional entregue

| Área | O que o usuário consegue fazer | Rotas |
|---|---|---|
| Acesso | Entrar com Google; criar conta com email e senha e confirmar por link; recuperar a senha | `/entrar`, `/esqueci-senha`, `/redefinir-senha` |
| Turmas | Entrar por código de convite ou criar turma; administradores em várias turmas com seletor | `/convite`, barra lateral |
| Vitrine | Página inicial animada que apresenta o projeto | `/` |
| Votações | Votar, mudar o voto, ver o progresso, catálogo padrão e catálogos personalizados | `/votacoes`, `/votacoes/[catalogoId]` |
| Relatório | Gráficos por pergunta, totais e opção mais votada (com aviso de empate) | `/votacoes/relatorio` |
| Dúvidas | Enviar, votar e filtrar por status; ver a resposta oficial | `/duvidas` |
| Dashboard | Contagem regressiva, data, local, programação e indicadores | `/dashboard` |
| Tarefas | Lista com filtro por status, prazo, atraso e progresso; responsável atualiza o andamento | `/tarefas` |
| Terceiros | Fornecedores por categoria com contato clicável | `/terceiros` |
| Administração | Membros e papéis, convite (copiar código e mensagem), evento e programação, moderação de dúvidas, catálogos, quem votou | `/admin/*` |
| Master | Todas as turmas e usuários, papéis e exclusões com confirmação | `/master/*` |
| Qualidade | Telas de erro, carregamento e 404; redesenho de UX/UI; responsividade para celular, tablet, notebook e TV | todas |

## 4. Evidências: histórico do repositório

| Commit | Data | O que entregou | Itens do backlog |
|---|---|---|---|
| `e9cf8c9` | 25/09 | Projeto criado com `create-next-app` | — |
| `ead6633` | 26/09 | README, catálogo de enquetes e guia de estudo | F6 |
| `7b9ba5a` | 26/09 | Esquema PostgreSQL, seed do catálogo e dependências | B3 |
| `78596a2` | 26/09 | Login com Google, turmas, convites e painel de membros | A1, A4, A5, E3 |
| `f5dc94a` | 26/09 | Votação com voto identificado e alterável | B1, B2 |
| `16936b9` | 26/09 | Dúvidas com upvote e moderação | C1 a C3 |
| `8264eea` | 26/09 | Relatório com gráficos de barras | B5 |
| `cf8407c` | 26/09 | Dashboard, tarefas e vitrine de terceiros | D1, D3, D4, E1 |
| `76e43b3` | 26/09 | Evento, programação, catálogos personalizados e lista de votantes | B4, B6, D2, E2 |
| `008b378` | 26/09 | Limite de tentativas de convite e cabeçalhos de segurança | F2 |
| `a140614` | 26/09 | Vitest e testes das funções puras | F3 |
| `16ef99e` | 26/09 | Telas de erro, carregamento e não encontrada, títulos e acessibilidade | F1 |
| `ecdf802` | 26/09 | Login com email e senha, confirmação de email e boas-vindas | A2, A3 |
| `5288fe5` | 26/09 | Administrador master | E4 |
| `6bde3fc` | 26/09 | Administradores em várias turmas | A6 |
| `ee93e30` | 26/09 | Página inicial como vitrine animada | F4 |
| `d8f2c93` a `89c67f8` | 26/09 | Animações e redesenho das telas de acesso, da turma, do administrador e do master | F4 |
| `499d9cc` | 26/09 | Responsividade para tablet, celular e TV | F5 |
| `b556c8b`, `c7eabf9` | 26/09 | Scripts de teste e testes de fluxo no navegador | F3 |
| `e929444` | 26/09 | Correção de id repetido no campo de dúvida | F3 (achado dos testes) |

## 5. Qualidade e testes

| Tipo | O que cobre | Resultado |
|---|---|---|
| Tipos | `npm run typecheck` (TypeScript estrito) | Sem erros |
| Testes unitários | Regras de convite, datas, vínculos e master | 20 de 20 |
| Testes de fluxo no navegador | Criar conta e confirmar por link; entrar e sair; redefinir a senha; convite; tarefas; votos; dúvidas; terceiros; membros; evento; catálogos; master; tela de erro; animação; foco; celular e TV | 59 de 59 |
| Responsividade | 20 páginas em 360, 768, 1024, 1440, 1920 e 3840 px | Sem rolagem horizontal; alvos de toque de pelo menos 40 px |

**Defeitos encontrados e corrigidos durante a sprint**

| Defeito | Como apareceu | Correção |
|---|---|---|
| Erro de hidratação ao animar a página | Teste no navegador mostrou o aviso do React | A animação passou a esperar o conteúdo hidratar |
| Campo de dúvida com o mesmo `id` do conteúdo principal | Teste que confere ids repetidos | Novo id `texto-duvida` |
| Barra lateral ocupava um terço da tela em tablet | Auditoria em 768 px | Barra lateral só a partir de 1024 px |
| Conteúdo minúsculo em telas de TV | Auditoria em 3840 px | Fonte da raiz cresce em telas grandes |

## 6. Documentação entregue

| Marco | Documentos |
|---|---|
| 01/09/2026 | Kick-off · Sprint Backlog · Definição do MVP |
| 08/09/2026 | Termo de Abertura · Visão do Produto · Papéis |
| 15/09/2026 | Stakeholders · Requisitos Prioritários |
| 22/09/2026 | Arquitetura Inicial · Organização do Repositório Git |
| 29/09/2026 | Este documento |
| Contínua | `README.md`, `docs/guia-de-estudo.md`, `docs/catalogo-enquetes.md`, `scripts/teste/README.md` |

Todos ficam em `docs/entregas/`, em Markdown e em PDF.

## 7. Definição de pronto

- [x] Funciona no navegador, do início ao fim.
- [x] Entrada validada e permissão conferida no servidor.
- [x] Estados de carregando, erro e lista vazia.
- [x] Regras de negócio com teste automatizado.
- [x] Testado em telas pequenas e grandes.
- [x] Comportamento documentado.
- [ ] Testado em **aparelhos reais** (celular, tablet e TV) e com **leitor de tela**: ainda não feito.
- [ ] Revisão por **outro integrante** por Pull Request: ainda não adotada (todos os commits partem de uma conta).

## 8. Impedimentos, riscos e lições

| Tema | Situação | Ação |
|---|---|---|
| Curva de aprendizado do Next.js 16 | Mudanças em relação aos tutoriais (`proxy.ts`, `params` como *Promise*) | Seguir o `AGENTS.md`: ler a documentação local antes de codar |
| Contribuição concentrada | Todos os commits vêm de uma conta | Adotar ramos e Pull Requests na Sprint 2 |
| Uso de serviços externos | O email real depende do SMTP do Gmail | Nos testes o SMTP fica desligado, e o email aparece no log |
| Sem hospedagem | Não há ambiente parecido com produção | Documentar o passo a passo local |
| Lição | Testar de verdade no navegador achou defeitos que a leitura do código não achou (id repetido, hidratação) | Manter o roteiro de fluxo e ampliá-lo |

## 9. Roteiro de demonstração (revisão da sprint)

1. Entrar como participante: dashboard, votar em uma enquete e mudar o voto.
2. Enviar uma dúvida e votar em outra.
3. Entrar como administrador: ver quem votou, responder e destacar uma dúvida.
4. Abrir o relatório: gráfico, opção mais votada e empate.
5. Criar uma tarefa com prazo e acompanhar o progresso no dashboard.
6. Copiar o código de convite e entrar com ele em outra conta.
7. Abrir o painel master: turmas e usuários.
8. Redimensionar a janela: notebook, tablet, celular e tela grande.

## 10. Próximos passos

| Quando | O que |
|---|---|
| 06/10/2026 | Fechar a Sprint 1 e revisar os artefatos |
| 13/10/2026 | Apresentação da Fábrica (AV I): produto rodando |
| 20/10/2026 | Revisão, retrospectiva e planejamento da Sprint 2 (integração contínua, ESLint, mais testes de ponta a ponta, tema escuro, edição de perguntas) |

## 11. Itens a confirmar pelo grupo

- Quem foi o Product Owner e o Scrum Master da sprint (ver **Papéis**).
- Datas exatas de início e fim da Sprint 1 e horas gastas por integrante, se a disciplina exigir.
