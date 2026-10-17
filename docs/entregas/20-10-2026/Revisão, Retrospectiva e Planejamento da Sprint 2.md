# Revisão, Retrospectiva e Planejamento da Sprint 2

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 20/10/2026 (revisão + retrospectiva + planejamento da Sprint 2) |
| **Versão** | 1.0 — elaborada em 20/10/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

Este documento fecha o ciclo da Sprint 1: revisa o que foi apresentado na AV I, registra a retrospectiva com uma ação concreta por tema e define o que a Sprint 2 vai entregar. Tudo que já está pronto e verificado aparece aqui como concluído, para o backlog não carregar trabalho que a equipe já fez.

## 0. Como a revisão foi feita

A revisão do incremento e dos artefatos usou quatro fontes, nesta ordem:

1. **Os documentos do cronograma**, conferidos contra o que existe em `src/`.
2. **A lista de compromissos da AV I**, para verificar se cada promessa tem destino.
3. **O código**, rodando com o ambiente de teste de `scripts/teste/`.
4. **O histórico do repositório**, para datar o que entrou e quando.

Nenhuma conclusão veio de memória da equipe. O que não pôde ser conferido ficou marcado como ⟨a definir⟩.

## 1. Revisão dos artefatos da AV I

| Compromisso assumido na AV I | Situação em 20/10/2026 | Evidência |
|---|---|---|
| Ampliar os testes e escrever o plano de casos | **Parcial** — os testes cresceram; o plano escrito está no marco de 03/11/2026 | 158 testes unitários em 14 arquivos; 73 passos de fluxo em 6 grupos |
| Revisão de acessibilidade | **Concluída** — 8 commits em 12/10/2026 | Foco visível, alvos de toque de 44 px, *landmarks* corrigidos, *live regions*, títulos por página, alternativa textual no gráfico do relatório |
| Documentar a segurança da informação | **Concluída** — 3 fases em 10/10/2026 | `docs/auditoria-direitos/` com PSI, SoA, matriz de riscos, plano de auditoria e legislação |
| Configurar a integração contínua | **Não iniciado** | Não há configuração de CI no repositório |

Dois achados novos surgiram da revisão e não estavam na lista da AV I:

- **Animação que podia esconder o conteúdo.** A vitrine esconde o texto até a animação montar; se o JavaScript não rodasse, a página ficava vazia. Corrigido em 12/10/2026 — o conteúdo aparece sempre, com a animação por cima.
- **Limite de tentativas de código de convite inexistente.** Qualquer pessoa podia ficar reenviando códigos. Corrigido: 10 tentativas a cada 15 minutos por utilizador, com trava no banco.

## 2. Retrospectiva da Sprint 1

### O que manter

| Tema | O que funcionou | Como seguir |
|---|---|---|
| **Um documento por marco, com o mesmo formato** | Alguém que não fez a sprint leu qualquer entrega em três minutos e entendeu o estado do projeto | Manter o cabeçalho fixo e a numeração a partir da seção 0 |
| **Incremental demonstrado em vez de descrito** | A AV I abriu e fechou sem correção de última hora | Continuar com o roteiro de 11 passos e o ambiente de teste semeado |
| **Correção de UX antes de nova funcionalidade** | Os 13 commits de 03 a 05/10 fecharam cinco defeitos de navegação e o vazamento de endereço no e-mail, tudo antes do fechamento | Reservar o começo de cada sprint para defeitos conhecidos |
| **Mensagem do produto com a cara do produto** | O e-mail deixou de ser um texto solto e passou a ter identidade | Manter o componente de e-mail único |

### O que parar

| Tema | O que atrapalhou | Por que parar |
|---|---|---|
| **Trabalhar sem branch e sem revisão por pares** | Todos os commits saíram da mesma conta; nenhum erro foi pegado por outra pessoa antes de chegar na `main` | Um erro de segurança só seria encontrado por outra pessoa; o risco não compensa |
| **Deixar o plano de testes para o fim** | Os testes cresceram por acaso, e não por plano: a cobertura ficou irregular, muito em regras de negócio e pouco em tela | Escrever o plano antes de escrever o teste |
| **Commitar a correção e a melhoria no mesmo commit** | Diffs grandes ficaram difíceis de revisar | Um commit por ideia, como já está na convenção |

### O que tentar

| Tema | Ação concreta | Prazo |
|---|---|---|
| **Branches e Pull Request de verdade** | Toda correção e funcionalidade entra por branch e passa por Pull Request | 27/10/2026 |
| **Integração contínua** | `typecheck` e `npm test` rodam a cada `push` | 27/10/2026 |
| **Acessibilidade como critério de pronto** | Todo item novo entra com foco visível, nome acessível e teste no leitor de ecrã | Sprint 2 inteira |
| **Revisão semanal em dupla** | Uma hora por semana, dois integrantes, o mesmo código | Sprint 2 inteira |

**Ação mais importante:** parar de commitar direto na `main`. É a mudança de costume que mais reduz risco e a mais barata de adotar.

## 3. O que entra na Sprint 2

O backlog da Sprint 2 já estava escrito em **Sprint Backlog**, na seção 3, com os itens **G1** a **G7**. A revisão mostrou que cinco deles já foram entregues durante a correção pós-AV I. O quadro abaixo é o estado real.

| ID | Item | Est. | Estado em 20/10/2026 | Evidência |
|---|---|---|---|---|
| **G1** | `typecheck` e testes a cada `push` | M | Planejado | Falta o arquivo de configuração de CI |
| **G2** | Ampliar testes de ponta a ponta e escrever o plano e os casos de teste | G | **Parcial** | 73 passos de fluxo prontos; o plano escrito vai no marco de 03/11/2026 |
| **G3** | Tema escuro com alternância | M | **Pronto** | Modo claro, escuro e sistema, com controle no painel, na vitrine e no acesso |
| **G4** | Editar uma pergunta já criada | M | **Pronto** | Editor de opções em lista, pergunta criada dentro da categoria e renomeada no lugar |
| **G5** | Ocultar perguntas do catálogo padrão | M | **Pronto** | Foco na pergunta, duplicados resolvidos e pré-visualização na gestão de catálogo |
| **G6** | Imagem do fornecedor na vitrine de terceiros | P | Planejado | Ainda não começou |
| **G7** | Revisão de acessibilidade com leitor de ecrã | M | **Parcial** | O que depende só de código foi feito; falta teste em aparelho real |

### Incremento de estabilidade que entrou depois

Cinco correções feitas depois da AV I não estavam no backlog e passaram a fazer parte da Sprint 2, porque mexem em concorrência e operação — a parte que o MVP não exercitou:

| ID | Item | Estado |
|---|---|---|
| **G8** | Travas de banco em decisão, tetos e limite por IP no convite | Pronto |
| **G9** | `api/healthz` para checagem de seleção no banco | Pronto |
| **G10** | Chave `VOTACAO_CONGELADA=1` para pausar votos sem novo deploy | Pronto |
| **G11** | Limitação por tipo de ação (dúvida, voto a favor, aviso) | Pronto |
| **G12** | Paginação de 10 itens, busca no painel master e paginação em tarefas e terceiros | Pronto |

## 4. Meta da Sprint 2

> Fechar o que a AV I deixou aberto: **testes escritos antes de tudo**, **integração contínua funcionando**, **acessibilidade conferida em aparelho real** e **o produto estável sob uso concorrente**.

A Sprint 2 não acrescenta funcionalidade nova ao usuário. Ela tira dívida, fecha lacuna de qualidade e estabiliza.

## 5. Riscos da Sprint 2

| Risco | Prob. | Impacto | Resposta |
|---|---|---|---|
| Integração contínua quebrar o dia que a Vercel compila | Média | Alto | O `typecheck` roda localmente antes de qualquer `push`; o CI não é substituto, é rede de segurança |
| Testes de fluxo dependerem de dados de execuções anteriores | Média | Médio | Limpar e semear antes de rodar; `limpar.sh` e `semear.sh` já existem |
| Leitor de ecrã real não disponível para o teste | Alta | Médio | Testar com o leitor do sistema operacional e registrar a limitação como pendência |
| Equipe pequena demais para Pull Review em toda entrega | Média | Alto | Branch e Pull Request só para código que muda dado, permissão ou autenticação |
| Escopo crescer com **G6** e destabilizar o restante | Média | Médio | **G6** é o único item opcional da sprint; ele sai primeiro se o prazo apertar |

## 6. Como a sprint será fechada

A revisão da Sprint 2 acontece em **10/11/2026**, com o mesmo formato desta: comparação com a meta, retrospectiva com uma ação por tema, e os artefatos conferidos contra o código. Antes disso:

| Marco | Data | O que precisa estar pronto |
|---|---|---|
| **Status Report** | 27/10/2026 | Branch e Pull Request funcionando, CI configurado, **G6** e **G7** decididos |
| **Plano, casos e resultados de testes** | 03/11/2026 | Plano escrito, casos mapeados para os 14 arquivos de teste, resultados da execução completa |
| **Fechamento da Sprint 2** | 10/11/2026 | Incremento demonstrado, meta avaliada, retrospectiva escrita |

O **Status Report II** e o backlog da Sprint 3 saem em **17/11/2026**, depois do fechamento desta.