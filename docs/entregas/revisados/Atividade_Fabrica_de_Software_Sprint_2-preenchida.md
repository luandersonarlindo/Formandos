# Atividade Prática — Fábrica de Software: Revisão da Sprint 1, Retrospectiva e Planejamento da Sprint 2

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Atividade** | Revisão da Sprint 1, Retrospectiva e Planejamento da Sprint 2 (120 minutos, Scrum adaptado) |
| **Data da atividade** | 20/10/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |
| **Documento-base** | [Revisão, Retrospectiva e Planejamento da Sprint 2](../20-10-2026/Revis%C3%A3o,%20Retrospectiva%20e%20Planejamento%20da%20Sprint%202.md) |

Esta é a resposta da equipe ao roteiro da atividade. Cada quadro foi preenchido com o estado real do projeto em **20/10/2026**, conferido contra o código, o histórico do repositório e os documentos do cronograma. Onde não havia registro, o campo ficou ⟨a definir⟩ — nada foi inventado.

**Critério de atribuição dos responsáveis** (Quadros C e D), tirado dos documentos do cronograma:

- **Luanderson Arlindo** — responsável pelo repositório (*Papéis*, seção 0; *Kick-off*): tudo que mexe em Git, ramo, Pull Request e CI é dele.
- As quatro **áreas de atuação** de *Papéis* (seção 0.1), na ordem em que os integrantes aparecem em *Papéis* e *Kick-off*:

| Integrante | Área (*Papéis* 0.1) | Cobre |
|---|---|---|
| Luanderson Arlindo | Acesso e turmas | Login, convite, papéis, painel master — além do repositório |
| Luiz Orlando | Votações e relatório | Catálogos, enquetes, votos, gráficos |
| José Renato | Dúvidas, tarefas e terceiros | Perguntas, tarefas, fornecedores |
| Vinícius | Interface e qualidade | Telas, componentes, responsividade, testes |

Item que cai em duas áreas tem dois responsáveis.

## 1. Etapa 1 — Resumo da execução da Sprint 1 (25 min)

A Sprint 1 entregou o **MVP inteiro navegável**: 12 itens do MVP planejados, 12 concluídos, fechados em 06/10/2026 com 50 commits. A meta da sprint ("MVP navegável de ponta a ponta: entrar, entrar em uma turma, votar, perguntar, acompanhar e administrar") foi **atingida**. A AV I, em 13/10/2026, demonstrou o produto rodando em 11 passos, sem correção de última hora, com 128 commits no repositório na data.

Do que a revisão do fechamento e da AV I apurou, ficaram pendentes quatro pontos: integração contínua (**G1**, não iniciada), plano e casos de teste escritos (**G2**, testes existem mas sem plano), teste de acessibilidade em aparelho real (**G7**, parcial) e a revisão por pares (todos os commits saíram da mesma conta).

Evidências: [Sprint 1](../29-09-2026/Sprint%201%20-%20Incremento%20funcional%20%2B%20Documenta%C3%A7%C3%A3o.md) · [Fechamento da Sprint 1](../06-10-2026/Fechamento%20da%20Sprint%201.md) · [AV I](../13-10-2026/Apresenta%C3%A7%C3%A3o%20da%20F%C3%A1brica%20%28AV%20I%29.md)

## 2. Quadro A — Revisão da Sprint 1

| Aspecto | Registro da equipe | Evidência / link |
|---|---|---|
| **O que foi planejado?** | Meta da Sprint 1: MVP navegável de ponta a ponta. Backlog com os épicos A a F (12 itens do MVP, histórias A1–A6, B1–B6, C1–C3, D1–D4, E1–E4, F1–F6) e mais os documentos do cronograma de 01/09 a 29/09. | [Sprint Backlog](../01-09-2026/Sprint%20Backlog.md) · [Definição do MVP](../01-09-2026/Defini%C3%A7%C3%A3o%20do%20MVP.md) |
| **O que foi concluído?** | 12 de 12 itens do MVP; épicos A a F completos, com **F6 (documentação)** fechada até 06/10. 50 commits no fechamento, 128 em 13/10 (AV I). 20 testes unitários e 59 passos de fluxo em 29/09, crescendo para 158 testes em 14 arquivos e 73 passos em 6 grupos em 20/10. Correções pós-revisão: 13 commits de 03 a 05/10 fechando 5 defeitos de UX, vazamento de endereço no e-mail e esquema do banco na Vercel. Revisão de acessibilidade concluída (8 commits, 12/10) e SGSI documentada (3 fases, 10/10). AV I apresentada sem correção de última hora. | [Fechamento da Sprint 1](../06-10-2026/Fechamento%20da%20Sprint%201.md) · [AV I](../13-10-2026/Apresenta%C3%A7%C3%A3o%20da%20F%C3%A1brica%20%28AV%20I%29.md) · `npm test` (158/158 em 14 arquivos) · `scripts/teste/fluxos.mjs` · `docs/auditoria-direitos/` |
| **O que ficou pendente?** | **G1** integração contínua: não iniciada, sem arquivo de CI no repositório. **G2** plano e casos de teste: testes cresceram, plano escrito fica para 03/11. **G7** acessibilidade: falta teste em aparelho real. **G6** imagem do fornecedor: não começou. Itens administrativos: PO e Scrum Master ⟨a definir⟩, nome da professora (S4) ⟨a definir⟩, assinaturas do Termo de Abertura ⟨a definir⟩. | `git log` (sem `.github/workflows/`) · [Pendências do Fechamento](../06-10-2026/Fechamento%20da%20Sprint%201.md) · [README das entregas](../README.md) |
| **O que não atendeu aos critérios de aceitação?** | Definição de pronto da Sprint 1 ficou com 2 de 7 itens por fechar: (1) teste em aparelhos reais e com leitor de tela **não feito**; (2) revisão por outro integrante via Pull Request **não adotada** — todos os commits partem de uma conta. Item **G2**: os testes existem, mas sem plano escrito a cobertura ficou irregular — muita regra de negócio, pouca tela. | [Definição de pronto — Sprint 1](../29-09-2026/Sprint%201%20-%20Incremento%20funcional%20%2B%20Documenta%C3%A7%C3%A3o.md) · [Perguntas da AV I](../13-10-2026/Apresenta%C3%A7%C3%A3o%20da%20F%C3%A1brica%20%28AV%20I%29.md) |
| **Quais foram os principais obstáculos?** | 1. **Contribuição concentrada**: nenhum erro pego por outra pessoa antes da `main`. 2. **Plano de testes deixado para o fim**: testes cresceram por acaso, cobertura irregular. 3. **Commit misturando correção e melhoria**: diffs grandes difíceis de revisar. 4. **Serviços externos**: login Google e SMTP do Gmail fora do controle nos testes (o e-mail aparece no log). 5. **Sem hospedagem**: nenhum ambiente parecido com produção. 6. **Leitor de ecrã real indisponível** na data da atividade. | [Lições da Sprint 1](../29-09-2026/Sprint%201%20-%20Incremento%20funcional%20%2B%20Documenta%C3%A7%C3%A3o.md) · [Riscos do Fechamento](../06-10-2026/Fechamento%20da%20Sprint%201.md) · [Retrospectiva](../20-10-2026/Revis%C3%A3o,%20Retrospectiva%20e%20Planejamento%20da%20Sprint%202.md) |

## 3. Quadro B — Retrospectiva

| Categoria | Pergunta orientadora | Registro da equipe |
|---|---|---|
| **Continuar** | O que funcionou bem e devemos manter? | 1. **Um documento por marco, com o mesmo formato** — quem não fez a sprint leu qualquer entrega em três minutos e entendeu o estado do projeto; manter cabeçalho fixo e numeração da seção 0. 2. **Incremento demonstrado em vez de descrito** — a AV I abriu e fechou sem correção de última hora; manter o roteiro de 11 passos e o ambiente de teste semeado. 3. **Correção de UX antes de nova funcionalidade** — 13 commits de 03 a 05/10 fecharam 5 defeitos de navegação e o vazamento de endereço no e-mail antes do fechamento; reservar o começo de cada sprint para defeitos conhecidos. 4. **E-mail com a cara do produto** — manter o componente de e-mail único. |
| **Parar** | O que prejudicou o trabalho ou gerou retrabalho? | 1. **Trabalhar sem branch e sem revisão por pares** — todos os commits saíram da mesma conta; nenhum erro foi pego por outra pessoa antes da `main`, e um erro de segurança só outra pessoa pegaria. 2. **Deixar o plano de testes para o fim** — os testes cresceram por acaso, não por plano; cobertura irregular, muito em regra de negócio e pouco em tela. 3. **Commitar correção e melhoria juntas** — diffs grandes difíceis de revisar; um commit por ideia. |
| **Começar** | Que prática nova devemos adotar? | 1. **Branch e Pull Request de verdade**: toda correção e funcionalidade entra por branch com revisão (prazo 27/10/2026). 2. **Integração contínua**: `typecheck` e `npm test` a cada `push` (27/10/2026). 3. **Acessibilidade como critério de pronto**: foco visível, nome acessível e teste no leitor de ecrã em todo item novo (Sprint 2 inteira). 4. **Revisão semanal em dupla**: uma hora por semana, dois integrantes, o mesmo código (Sprint 2 inteira). |
| **Melhorar** | O que precisa ser aperfeiçoado? | O **processo de teste**: escrever o plano de casos **antes** de escrever o teste e equilibrar a cobertura entre regras de negócio e telas. Meta verificável: plano escrito, casos mapeados para os 14 arquivos de teste e execução completa registrada no marco de 03/11/2026. |

**Ação mais importante:** parar de commitar direto na `main`. É a mudança de costume que mais reduz risco e a mais barata de adotar.

## 4. Quadro C — Plano de ação da retrospectiva

| Problema / oportunidade | Ação concreta | Responsável | Prazo |
|---|---|---|---|
| Commits saem todos da mesma conta, sem revisão antes da `main` | Adotar branch por ideia e Pull Request com revisor obrigatório em código que muda dado, permissão ou autenticação; um commit = uma ideia | Luanderson Arlindo (repositório) | 27/10/2026 |
| Sem integração contínua: regressão só aparece na hora de rodar | Criar `.github/workflows/ci.yml` com `npm run typecheck` e `npm test` a cada `push` e a cada Pull Request, bloqueando o merge em caso de falha | Luanderson Arlindo (repositório) | 27/10/2026 |
| Plano de testes nunca escrito; cobertura irregular (muita regra, pouca tela) | Escrever o plano de casos antes de novos testes; mapear cada caso para os 14 arquivos de teste e publicar resultados da execução completa | Vinícius (área Interface e qualidade) | 03/11/2026 |
| Acessibilidade feita como esforço pontual, não como critério | Tornar acessibilidade definição de pronto: foco visível, nome acessível e teste no leitor de ecrã em todo item novo; revisão semanal em dupla de uma hora | Vinícius (Interface e qualidade) + segundo integrante em rodízio | Sprint 2 inteira (10/11/2026) |

## 5. Quadro D — Planejamento da Sprint 2

**Meta da Sprint 2:**

> Fechar o que a AV I deixou aberto: **testes escritos antes de tudo**, **integração contínua funcionando**, **acessibilidade conferida em aparelho real** e **o produto estável sob uso concorrente**. A sprint não acrescenta funcionalidade nova ao usuário: tira dívida, fecha lacuna de qualidade e estabiliza.

| | |
|---|---|
| **Duração prevista** | 3 semanas (20/10 a 10/11/2026), com marcos internos em 27/10, 03/11 e 10/11 |
| **Data de início** | 20/10/2026 |
| **Data de término** | 10/11/2026 |

| Item / história | Tarefas técnicas | Critérios de aceitação | Responsável(is) | Prioridade | Estimativa |
|---|---|---|---|---|---|
| **G1** — `typecheck` e testes a cada `push` (integração contínua) | Criar `.github/workflows/ci.yml`; rodar `npm run typecheck` e `npm test`; travar merge em falha | Workflow existe e roda a cada `push` e PR; falha de tipo ou de teste bloqueia o merge; `typecheck` segue rodando localmente antes de todo `push` | Luanderson Arlindo (repositório) | Alta (meta) | M |
| **G2** — Ampliar testes de ponta a ponta e escrever plano e casos | Escrever o plano de casos; mapear casos para os 14 arquivos de teste; ampliar grupos de fluxo; registrar execução completa | Plano escrito publicado no marco de 03/11/2026; todo caso tem arquivo de destino; execução completa passa (unidade + 73 passos de fluxo) sem erro de console | Vinícius (área Interface e qualidade) | Alta (meta) | G |
| **G3** — Tema escuro com alternância | Modo claro, escuro e sistema; persistir preferência; controles no painel, na vitrine e no acesso | Os três modos funcionam nas três telas; preferência persiste entre sessões; contraste legível nos dois modos | Vinícius (Interface e qualidade) | Média | M |
| **G4** — Editar uma pergunta já criada | Editor de opções em lista; renomear pergunta no lugar; manter categoria | Pergunta renomeada sem duplicar categoria; opções editadas refletem na votação; caminho coberto por teste de fluxo | Luiz Orlando (área Votações e relatório) | Média | M |
| **G5** — Ocultar perguntas do catálogo padrão | Foco na pergunta; resolver duplicados; pré-visualização na gestão de catálogo | Pergunta oculta não aparece no catálogo padrão da turma; duplicados tratados; pré-visualização mostra o estado real | Luiz Orlando (Votações e relatório) | Média | M |
| **G6** — Imagem do fornecedor na vitrine de terceiros | Upload e exibição da imagem; alternativa textual; tratamento de ausência | Imagem aparece na vitrine com alternativa textual; sem imagem, o layout não quebra | José Renato (área Dúvidas, tarefas e terceiros) | Baixa (único item opcional; sai primeiro se o prazo apertar) | P |
| **G7** — Revisão de acessibilidade com leitor de ecrã | Testar foco, nomes e live regions no leitor; testar em aparelho real; registrar limitação se não houver aparelho | Foco visível, alvos de 44 px e mensagens anunciadas verificados; teste em leitor de ecrã registrado; pendência de aparelho físico declarada se não resolvida | Vinícius (área Interface e qualidade) | Alta (meta) | M |
| **G8** — Travas de banco em decisão, tetos e limite por IP no convite | Trava transacional em decisão; teto por período; tabela de limitação com coluna de IP | Travas impedem corrida e abuso; teste automatizado de concorrência passa | Luanderson Arlindo (Acesso e turmas — convite, IP) e Luiz Orlando (Votações — decisão e tetos) | Alta (entregue na revisão de 20/10) | — (entregue) |
| **G9** — `api/healthz` para checagem de seleção no banco | Endpoint de healthcheck com verificação real no banco | Endpoint responde e falha quando o banco não responde | Luanderson Arlindo (repositório) | Alta (entregue na revisão de 20/10) | — (entregue) |
| **G10** — Chave `VOTACAO_CONGELADA=1` para pausar votos | Kill-switch lido em runtime; mensagem clara ao participante | Com a chave ativa, votos não mudam sem novo deploy; mensagem exibida; desligar restaura o voto | Luiz Orlando (área Votações e relatório) | Alta (entregue na revisão de 20/10) | — (entregue) |
| **G11** — Limitação por tipo de ação (dúvida, voto a favor, aviso) | Limite por tipo e por usuário; registro no banco | Cada tipo de ação respeita seu teto; excesso é recusado com mensagem; comportamento testado | Luiz Orlando (Votações — voto) e José Renato (Dúvidas, tarefas e terceiros — dúvida e aviso) | Alta (entregue na revisão de 20/10) | — (entregue) |
| **G12** — Paginação de 10 itens, busca no painel master, paginação em tarefas e terceiros | Paginação com 10 itens por página; busca no painel master; paginação sem salto de rolagem | Listas longas paginam em 10; busca filtra no master; rolagem não salta ao mudar de página | Vinícius (área Interface e qualidade) | Alta (entregue na revisão de 20/10) | — (entregue) |

**Itens que já estavam prontos na data do planejamento:** **G8** a **G12** nasceram da revisão pós-AV I (concorrência e operação, que o MVP não exercitou) e entraram na sprint como entregues; **G3**, **G4** e **G5** também foram concluídos na correção de 03 a 05/10. O trabalho realmente em aberto em 20/10 é **G1**, **G2** (parcial), **G6**, **G7** (parcial) e o plano de ação da retrospectiva.

### Dependências e riscos registrados

| Risco | Prob. | Impacto | Resposta |
|---|---|---|---|
| CI falhar no dia em que a Vercel compila | Média | Alto | `typecheck` roda localmente antes de qualquer `push`; o CI é rede de segurança, não substituto |
| Testes de fluxo dependerem de dados de execuções anteriores | Média | Médio | Limpar e semear antes de rodar (`scripts/teste/limpar.sh` e `semear.sh`) |
| Leitor de ecrã real indisponível | Alta | Médio | Testar com o leitor do sistema operacional e registrar a limitação como pendência |
| Equipe pequena para Pull Request em toda entrega | Média | Alto | Branch e PR obrigatórios só para código que muda dado, permissão ou autenticação |
| Escopo crescer com **G6** e destabilizar o restante | Média | Médio | **G6** é o único item opcional; sai primeiro se o prazo apertar |

### Marcos de fechamento

| Marco | Data | O que precisa estar pronto |
|---|---|---|
| Status Report | 27/10/2026 | Branch e PR funcionando, CI configurada, **G6** e **G7** decididos |
| Plano, casos e resultados de testes | 03/11/2026 | Plano escrito, casos mapeados para os 14 arquivos, resultados da execução completa |
| Fechamento da Sprint 2 | 10/11/2026 | Incremento demonstrado, meta avaliada, retrospectiva escrita |

## 6. Etapa 4 — Apresentação da equipe (20 min, ~3 min por equipe)

- **Principal resultado da Sprint 1:** MVP navegável de ponta a ponta — 12 de 12 itens concluídos, demonstrado na AV I em 11 passos sem correção de última hora, com 158 testes unitários e 73 passos de fluxo passando em 20/10/2026.
- **Maior dificuldade/aprendizado:** contribuição concentrada — todos os commits da mesma conta, sem revisão por pares; e o plano de testes deixado para o fim, o que deixou a cobertura irregular. Testar de verdade no navegador achou defeitos que a leitura do código não achou.
- **Ação de melhoria prioritária:** parar de commitar direto na `main` — branch por ideia e Pull Request com revisão, com CI travando o merge, até 27/10/2026.
- **Meta da Sprint 2 e entregas previstas:** fechar o que a AV I deixou aberto — plano e casos de teste escritos (03/11), integração contínua funcionando (27/10), acessibilidade conferida em aparelho real (10/11) e estabilidade sob uso concorrente (G8–G12, já entregues). Nenhuma funcionalidade nova para o usuário.

## 7. Respostas às perguntas orientadoras do professor

| Pergunta | Resposta da equipe |
|---|---|
| Como vocês comprovam que essa funcionalidade está concluída? | Três evidências combinadas: teste automatizado passando (`npm test`, 158 testes em 14 arquivos), passo de fluxo no navegador (`scripts/teste/fluxos.mjs`, 73 passos em 6 grupos) e demonstração ao vivo com dados do ambiente de teste semeado (`semear.sh`). Para documento, a afirmação é conferida contra o código — quem revisou o fechamento achou 6 divergências e corrigiu antes de declarar a sprint concluída. |
| Por que essa tarefa é mais prioritária que as outras? | Porque a meta da sprint é fechar lacuna de qualidade apontada pela AV I, não acrescentar tela. **G1** e **G2** têm prazo de compromisso público (27/10 e 03/11) e protegem todo o resto; **G6** é o único opcional e sai primeiro se o prazo apertar. |
| O que será feito de diferente na Sprint 2 para evitar a repetição do problema? | As quatro ações do Quadro C, com prazo: branch e PR obrigatórios, CI a cada `push`, plano de teste escrito antes do teste e acessibilidade como critério de pronto — mais revisão semanal em dupla de uma hora. |
| Como vocês pretendem testar o que será desenvolvido? | Teste escrito antes da correção; `npm test` e `npm run typecheck` a cada `push` (CI); grupo de fluxo do navegador para o comportamento novo; auditoria de responsividade nas 6 larguras quando mexer em tela; leitor de ecrã para acessibilidade. |
| Se um integrante ficar indisponível, o planejamento continua viável? | Sim, com ressalva: a sprint não tem funcionalidade nova e os itens são independentes entre si; a ressalva é a revisão por pares, que exige duas pessoas — por isso o PR é obrigatório só onde o risco é alto (dado, permissão, autenticação), e não em toda entrega. |

## 8. Critérios de um bom planejamento — autoverificação

- [x] Meta clara e relacionada ao objetivo do produto (fechar compromissos da AV I).
- [x] Itens prioritários, cabem na capacidade da equipe e sem escopo novo.
- [x] Tarefas pequenas o suficiente para acompanhar o progresso (G1–G12 com estados verificáveis).
- [x] Cada item com critério de aceitação verificável.
- [x] Dependências e riscos registrados (tabela de riscos da seção 5).
- [x] Ações da retrospectiva incorporadas ao plano (Quadro C com prazo e responsável).

Os responsáveis dos Quadros C e D seguem o critério da seção 1: papel documentado do repositório (Luanderson) e áreas de atuação de *Papéis* (seção 0.1) na ordem dos integrantes. Continuam ⟨a definir⟩ apenas o que os documentos do projeto não decidiram: **Product Owner**, **Scrum Master**, nome da professora da Fábrica (S4) e assinaturas do Termo de Abertura.
