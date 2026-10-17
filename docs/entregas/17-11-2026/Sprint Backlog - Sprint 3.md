# Sprint Backlog — Sprint 3

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 17/11/2026 (Sprint Backlog + Status Report II) |
| **Versão** | 1.0 — elaborada em 17/11/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

Este é o backlog da **Sprint 3**, a última antes da entrega final de 24/11/2026. A janela é curta — catorze dias — e o objetivo não é acrescentar nada: é fechar as pendências que a Sprint 2 deixou registradas e preparar a pré-banca. Ele continua o backlog da Sprint 2, com os itens **G1** a **G12** já concluídos.

## 0. Como este backlog se relaciona com os anteriores

| Backlog | Sprint | Itens | Estado |
|---|---|---|---|
| `01-09-2026/Sprint Backlog` | Sprint 1 | Épicos **A** a **F**, 12 itens do MVP | Concluído — 12 de 12 |
| Seção 3 do mesmo documento | Sprint 2 | **G1** a **G7** | 6 prontos, **G7** parcial |
| Este documento | Sprint 3 | **H1** a **H9** | Planejado |

Os itens **G8** a **G12** (travas, limitação por ação, `api/healthz`, congelamento de votação e paginação) foram criados durante a revisão de 20/10/2026 e já estão concluídos. Não entram neste backlog.

## 1. Meta da Sprint 3

> Entregar o produto com **zero pendência aberta de acessibilidade**, **banco com procedimento de backup escrito**, **documentação completa do ciclo de vida do software** e **pré-bancaEnsaiada**.

A Sprint 3 tem duas semanas e três entregas dentro delas. Não há espaço para escopo novo: se um item não serve à entrega final, ele sai.

## 2. Épico H — Encerramento e pré-banca

### Épico H — Encerramento e pré-banca

| ID | História | Prior. | Est. | Risco | Responsável |
|---|---|---|---|---|---|
| **H1** | Como ⟨avaliador⟩, quero **testar a acessibilidade em aparelho Android físico**, para confirmar que o teclado por toque e o leitor de ecrã funcionam em tela pequena de verdade | S | M | Alto — sem aparelho, fica parcial | ⟨a definir⟩ |
| **H2** | Como ⟨equipe⟩, quero um **procedimento de backup e restauração do banco**, para recuperar a base sem perder trabalho de demonstração | S | M | Médio | ⟨a definir⟩ |
| **H3** | Como ⟨equipe⟩, quero **ensaiar a pré-banca com perguntas previstas**, para não travar na hora da apresentação | S | M | Alto | ⟨a definir⟩ |
| **H4** | Como ⟨equipe⟩, quero o **manual de uso do administrador**, para a demonstração não depender de quem escreveu o código | S | S | Médio | ⟨a definir⟩ |
| **H5** | Como ⟨avaliador⟩, quero **abrir o projeto seguindo o README**, para avaliar sem ajuda de quem fez | S | S | Médio | ⟨a definir⟩ |
| **H6** | Como ⟨equipe⟩, quero **testar o envio de e-mail com um serviço real descartável**, para validar o que hoje só é testado pelo log | C | M | Médio | ⟨a definir⟩ |
| **H7** | Como ⟨avaliador⟩, quero **medir o tempo de resposta do painel com muitas turmas**, para saber onde o produto trava | C | M | Baixo | ⟨a definir⟩ |
| **H8** | Como ⟨equipe⟩, quero **coletar métricas do produto** (votos, dúvidas respondidas, tarefas concluídas), para mostrar as metas da visão com número | C | S | Baixo | ⟨a definir⟩ |
| **H9** | Como ⟨equipe⟩, quero **uma página de limitações conhecidas**, para declarar em vez de esconder | S | P | Baixo | ⟨a definir⟩ |

### Definição de pronto da Sprint 3

Um item só entra na coluna *Feito* quando todas as condições abaixo forem atendidas:

1. `npm run typecheck` e `npm test` passam.
2. O teste de fluxo passa nos grupos afetados.
3. A mudança passou por Pull Request revisado.
4. Se mudou dado, permissão ou autenticação, a revisão foi obrigatória de outra pessoa.
5. Se mudou tela, a auditoria de responsividade rodou nas 6 larguras.
6. Se mudou texto visível, existe versão em português do Brasil.
7. Se mudou comportamento, o teste correspondente foi escrito **antes** da correção.

## 3. O que fica para depois da entrega

Estes itens são reais, estão registrados e **não** cabem em catorze dias. Declarar é melhor que esconder.

| ID | Item | Por que fica | Quando |
|---|---|---|---|
| **P1** | Teste de carga real, com milhares de registros | O escopo da disciplina não cobre teste de carga; **H7** só dá um número grosseiro | Após a entrega |
| **P2** | Trilha de auditoria consultável por tela | A trilha é gravada e tem retenção de 5 anos, mas não há tela para consultar | Após a entrega |
| **P3** | Notificação por e-mail quando uma dúvida é respondida | Exige fila de envio e controle de taxa de envio | Após a entrega |
| **P4** | Exportar o relatório em PDF | Não estava no escopo do MVP nem da Sprint 3 | Após a entrega |
| **P5** | Migração do banco com teste de reversão | Nenhuma migração tem caminho de volta automático | Após a entrega |
| **P6** | Painel master em gráficos, além das tabelas | Os números existem; falta a forma de lê-los | Após a entrega |

## 4. Como o quadro é usado

| Coluna | Regra |
|---|---|
| **A fazer** | Cartão com o ID, o texto da história, a prioridade e o risco |
| **Em andamento** | Um cartão por pessoa; dois em andamento ao mesmo tempo é distração |
| **Em revisão** | Pull Request aberto, aguardando outra pessoa |
| **Feito** | Passou pelos sete pontos da definição de pronto |

**Ordem de ataque.** Se a sprint apertar, a ordem é **H3** (pré-banca), **H9** (limitações), **H5** (README), **H4** (manual do administrador), **H2** (backup), **H1** (aparelho físico). **H1** fica em último por depender de recurso externo; se o aparelho não aparecer, o item fecha como parcial e a limitação vai declarada para a pré-banca.

## 5. Riscos da Sprint 3

| Risco | Prob. | Impacto | Resposta |
|---|---|---|---|
| **Aparelho Android físico não disponível** | Média | Alto | **H1** fecha parcial; a limitação é declarada, não escondida |
| **Pré-banca sem tempo de ensaio** | Média | Alto | **H3** é o primeiro item atacado; o roteiro fica escrito mesmo sem ensaio |
| **Fim de semestre compete com os estudos dos integrantes** | Alta | Alto | Cada item tem responsável nomeado; um item parado passa para o próximo |
| **Backup escrito e não testado** | Média | Médio | **H2** só fecha depois de uma restauração bem-sucedida a partir do próprio backup |
| **Documentação do ciclo de vida do software incompleta** | Média | Médio | **H9** e **H5** cobrem o mínimo; o restante fica na seção 3, declarado |
