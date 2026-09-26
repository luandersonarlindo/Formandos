# Sprint Backlog

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 01/09/2026 (Kick-off + Sprint Backlog + definição do MVP) |
| **Versão** | 1.0 — elaborada em 26/09/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

## 1. Como ler este documento

- **Épico:** grande tema do produto. **História:** pedido de um usuário, no formato *"Como [papel], quero [ação], para [benefício]"*.
- **Prioridade (MoSCoW):** **M** = deve ter (MVP), **S** = deveria ter, **C** = poderia ter, **W** = fica para depois.
- **Estimativa relativa:** **P** (pequeno, até meio dia), **M** (médio, cerca de 1 dia), **G** (grande, 2 dias ou mais). É uma comparação entre itens, não uma promessa de horas.
- **Status** em 26/09/2026, conferido no repositório: **Concluído**, **Em andamento** ou **Planejado**.

## 2. Meta da Sprint 1

> Entregar um **MVP navegável de ponta a ponta**: uma pessoa entra com a conta, entra em uma turma, vota, pergunta, acompanha o evento e a comissão administra tudo.

## 3. Backlog da Sprint 1

### Épico A — Acesso e turmas

| ID | História | Prior. | Est. | Status |
|---|---|---|---|---|
| A1 | Como formando, quero **entrar com minha conta Google**, para não criar mais uma senha | M | M | Concluído |
| A2 | Como formando, quero **entrar com email e senha** (com confirmação do email), para acessar mesmo sem Google | M | G | Concluído |
| A3 | Como formando, quero **recuperar ou criar minha senha** por email, para não perder o acesso | S | M | Concluído |
| A4 | Como formando, quero **entrar em uma turma com um código de convite**, para participar da minha formatura | M | M | Concluído |
| A5 | Como administrador, quero **criar uma turma** e receber um código de convite, para chamar os colegas | M | M | Concluído |
| A6 | Como administrador, quero **participar de várias turmas** e trocar entre elas, para ajudar mais de uma comissão | S | G | Concluído |

### Épico B — Votações e relatório

| ID | História | Prior. | Est. | Status |
|---|---|---|---|---|
| B1 | Como formando, quero **votar nas enquetes** de cada categoria, para dizer o que a turma prefere | M | G | Concluído |
| B2 | Como formando, quero **mudar meu voto**, para corrigir uma escolha | S | P | Concluído |
| B3 | Como turma, queremos um **catálogo padrão** de 8 categorias e 16 perguntas já pronto | M | M | Concluído |
| B4 | Como administrador, quero **criar catálogos personalizados** com categorias e perguntas próprias | S | G | Concluído |
| B5 | Como turma, queremos um **relatório com gráficos** por pergunta, com a opção mais votada em destaque | M | G | Concluído |
| B6 | Como administrador, quero **ver quem votou em cada opção**, para cobrar quem não votou | S | M | Concluído |

### Épico C — Dúvidas (perguntas e respostas)

| ID | História | Prior. | Est. | Status |
|---|---|---|---|---|
| C1 | Como formando, quero **enviar uma dúvida** sobre o evento | M | M | Concluído |
| C2 | Como formando, quero **votar nas dúvidas dos colegas**, para as mais comuns subirem na lista | S | M | Concluído |
| C3 | Como administrador, quero **responder, destacar e apagar dúvidas**, para responder oficialmente | M | M | Concluído |

### Épico D — Evento e tarefas

| ID | História | Prior. | Est. | Status |
|---|---|---|---|---|
| D1 | Como formando, quero ver a **contagem regressiva, a data, o local e a programação** da festa | M | M | Concluído |
| D2 | Como administrador, quero **editar os dados do evento e a programação** | M | M | Concluído |
| D3 | Como administrador, quero **cadastrar tarefas com responsável e prazo**, e como membro, acompanhar o progresso | M | G | Concluído |
| D4 | Como responsável por uma tarefa, quero **atualizar o andamento** dela | S | P | Concluído |

### Épico E — Terceiros e administração

| ID | História | Prior. | Est. | Status |
|---|---|---|---|---|
| E1 | Como formando, quero **ver os fornecedores** indicados pela comissão, com contato | S | M | Concluído |
| E2 | Como administrador, quero **cadastrar e remover fornecedores** | S | P | Concluído |
| E3 | Como administrador, quero **gerenciar membros** (promover, rebaixar, remover) e **gerar novo código de convite** | M | M | Concluído |
| E4 | Como gestor da plataforma (**master**), quero **ver e gerir todas as turmas e usuários** | C | G | Concluído |

### Épico F — Qualidade

| ID | Item | Prior. | Est. | Status |
|---|---|---|---|---|
| F1 | Telas de **erro, carregamento e página não encontrada** | S | P | Concluído |
| F2 | **Segurança:** validação de entrada, checagem de permissão, limite de tentativas de convite, cabeçalhos HTTP | M | M | Concluído |
| F3 | **Testes automatizados** das regras de negócio e testes de fluxo no navegador | S | G | Concluído |
| F4 | **Redesenho de UX/UI** no estilo da página inicial, com animações | C | G | Concluído |
| F5 | **Responsividade** para celular, tablet, notebook e TV | S | G | Concluído |
| F6 | **Documentação** (README, guia de estudo e artefatos de entrega) | M | M | Em andamento |

## 4. Backlog para a Sprint 2 e além

| ID | Item | Prior. | Est. | Status |
|---|---|---|---|---|
| G1 | Configurar **ESLint** e rodar o `typecheck` e os testes a cada `push` (integração contínua) | S | M | Planejado |
| G2 | Ampliar os **testes de ponta a ponta** e organizar o **plano e os casos de teste** | S | G | Planejado |
| G3 | **Tema escuro** com alternância | C | M | Planejado |
| G4 | **Editar uma pergunta** já criada em um catálogo personalizado | C | M | Planejado |
| G5 | **Ocultar perguntas** do catálogo padrão para uma turma | C | M | Planejado |
| G6 | **Imagem do fornecedor** na vitrine de terceiros | C | P | Planejado |
| G7 | Revisão de **acessibilidade** com leitor de tela e teste em **aparelhos reais** | S | M | Planejado |

## 5. Acompanhamento

- **Quadro:** colunas *A fazer → Em andamento → Em revisão → Feito*. Cada história vira um cartão com o ID acima.
- **Revisão da sprint:** demonstrar o incremento rodando (não slides).
- **Retrospectiva:** o que manter, o que parar e o que tentar, registrando uma ação concreta por tema.
- **Evidência de andamento:** o histórico de commits do repositório (ver **Sprint 1 - Incremento funcional + Documentação**).
