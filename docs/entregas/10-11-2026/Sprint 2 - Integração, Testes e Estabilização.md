# Sprint 2 — Integração, Testes e Estabilização

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 10/11/2026 (Sprint 2: integração, testes e estabilização) |
| **Versão** | 1.0 — elaborada em 10/11/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

Este documento fecha a Sprint 2. A sprint foi planejada em 20/10/2026 com um objetivo só: fechar o que a AV I deixou aberto. Não entrou funcionalidade nova para o usuário — entrou teste escrito, integração contínua, acessibilidade conferida e estabilidade sob uso concorrente.

## 0. Meta e resultado

> **Meta da Sprint 2:** fechar o que a AV I deixou aberto — testes escritos antes de tudo, integração contínua funcionando, acessibilidade conferida em aparelho real e o produto estável sob uso concorrente.

| Item da meta | Estado | Como se mede |
|---|---|---|
| Integração contínua funcionando | **Atingido** | `typecheck` e `npm test` rodam a cada `push` e bloqueiam o merge |
| Plano e casos de teste escritos | **Atingido** | `docs/entregas/03-11-2026/Plano, Casos e Resultados de Testes.md` |
| Acessibilidade conferida em aparelho real | **Parcial** | Testado com leitor de ecrã em desktop e em emulador Android; aparelho físico segue ⟨a definir⟩ |
| Estabilidade sob uso concorrente | **Atingido** | Travas de banco, tetos por ação e limite por IP operando em produção local |

**Veredito: meta atingida com uma pendência**, a única que depende de recurso que a equipe não tem — um aparelho Android físico.

## 1. Incremento entregue

### 1.1 Backlog original

| ID | Item | Estado no fechamento |
|---|---|---|
| **G1** | `typecheck` e testes a cada `push` | **Pronto** — `.github/workflows/ci.yml` |
| **G2** | Ampliar testes de ponta a ponta e escrever o plano de casos | **Pronto** — 186 testes, 81 passos de fluxo, plano escrito |
| **G3** | Tema escuro com alternância | **Pronto** — modo claro, escuro e sistema |
| **G4** | Editar uma pergunta já criada | **Pronto** — editor de opções em lista e renomeação no lugar |
| **G5** | Ocultar perguntas do catálogo padrão | **Pronto** — foco, duplicados e pré-visualização |
| **G6** | Imagem do fornecedor na vitrine de terceiros | **Pronto** |
| **G7** | Revisão de acessibilidade com leitor de ecrã | **Parcial** — código pronto, aparelho físico pendente |

### 1.2 Estabilidade e operação

| ID | Item | Estado |
|---|---|---|
| **G8** | Travas de banco em decisão, tetos e limite por IP no convite | Pronto |
| **G9** | `api/healthz` com verificação de seleção no banco | Pronto |
| **G10** | Chave `VOTACAO_CONGELADA=1` que pausa votos sem novo deploy | Pronto |
| **G11** | Limitação por tipo de ação | Pronto |
| **G12** | Paginação de 10 itens, busca no painel master, paginação em tarefas e terceiros | Pronto |

### 1.3 Como G8 a G12 aparecem para quem usa

Nenhuma delas é visível na primeira tela, e essa foi a intenção. O que muda na prática:

| Mudança | Efeito para quem usa |
|---|---|
| Paginação de 10 itens | A lista de tarefas e de terceiros não cresce sem parar; a rolagem acaba |
| Busca no painel master | O administrador master acha uma turma pelo nome em vez de rolar a lista |
| Voto com estado e paginação sem salto | Trocar de pergunta não joga a rolagem para o topo nem perde o que foi digitado |
| Validação no cliente espelhando o servidor | O erro aparece antes de enviar, e o texto é o mesmo nos dois lados |
| Chave de congelamento de votação | Se algo sair errado no produto, dá para pausar a votação sem novo deploy |
| `api/healthz` | Plataforma e banco podem ser conferidos por um monitor externo |

## 2. Integração e testes

| Indicador | Sprint 1 (26/09) | Sprint 2 (10/11) | Variação |
|---|---|---|---|
| Commits | 50 | **205** | +155 |
| Arquivos TypeScript/TSX | 130 | **205** | +75 |
| Linhas de código | 9.200 | **16.200** | +7.000 |
| Rotas de tela | 25 | **31** | +6 |
| Tabelas no banco | 17 | **19** | +2 |
| Testes unitários | 20 | **186** | +166 |
| Arquivos de teste | 1 | **17** | +16 |
| Passos de teste de fluxo | 59 | **81** | +22 |
| Grupos de teste de fluxo | 4 | **6** | +2 |

### 2.1 Cobertura por requisito

| Grupo | Requisitos | Estado |
|---|---|---|
| Acesso | RF-01 a RF-05 | Coberto nas camadas 1, 2 e 4 |
| Decisão | RF-06 a RF-10, RN-01, RN-02, RN-08, RN-09 | Coberto |
| Comunicação | RF-11 a RF-13 | Coberto |
| Organização | RF-14 a RF-17 | Coberto |
| Controle de acesso | RF-18 a RF-21, RN-03 a RN-07 | Coberto |

Nenhum requisito funcional e nenhuma regra de negócio ficou sem caso de teste. A lista completa dos 30 casos está no documento de 03/11/2026.

### 2.2 Cadência de integração

| Semana | Commits | Pull Requests | Fila de revisão média |
|---|---|---|---|
| 21 a 27/10 | 38 | 12 | 4 h |
| 28/10 a 03/11 | 41 | 14 | 3 h |
| 04 a 10/11 | 47 | 16 | 2 h |

A fila de revisão **caiu** mesmo com mais commits, porque o Pull Request ficou pequeno: a regra de um commit por ideia pegou.

## 3. Estabilidade sob concorrência

A Sprint 1 entregou o produto sem exercitar duas pessoas ao mesmo tempo. A Sprint 2 procurou exatamente esse cenário.

| Cenário | O que acontecia | O que foi feito |
|---|---|---|
| Duas comissões votando no mesmo instante na mesma pergunta | A última gravação sobrescrevia a outra | Trava de banco na decisão; a transação decide quem grava |
| Limite por ação contado em memória | Perdia-se a contagem com duas instâncias | Tabela de limitação com coluna de IP |
| DezENA de tentativas de código de convite em paralelo | Nenhuma trava | 10 tentativas a cada 15 minutos por usuário, travado no banco |
| Importação em massa de votos de um catálogo | Cada voto era uma transação | Gravação de um catálogo inteiro numa transação única |
| Consultas repetidas no painel | Panel abria com dezenas de idas ao banco | Consultas agregadas no próprio SQL |

**Nenhuma correção de emergência** foi necessária durante a sprint: os problemas de concorrência apareceram nos testes de carga manuais, não em uso real.

## 4. Retrospectiva da Sprint 2

### O que funcionou

| Tema | Por que funcionou |
|---|---|
| **Escrever o plano de testes antes** | O plano de 03/11 revelou que faltava teste de limite e de concorrência — os dois problemas que a sprint encontrou |
| **Pull Request pequeno** | A fila de revisão caiu de 4 h para 2 h sem reduzir o ritmo de entrega |
| **Teste de fluxo reparado antes de ampliar** | Com 73 passos consertados, os 8 novos entraram sem quebrar o que já existia |
| **Congelar por variável de ambiente** | Nenhum deploy para pausar votação; a equipe ganhou minutos de reação |

### O que não funcionou

| Tema | Consequência |
|---|---|
| **Aparelho Android físico não estava disponível** | O item **G7** ficou parcial e virou dívida com prazo |
| **Revisão humana em toda Pull Request não deu conta** | A regra ficou restrita a dado, permissão e autenticação, para não virar gargalo |
| **Nenhuma medição de carga real** | Os travas de banco foram validados por teste manual, não por medição |
| **Documentação atrasou em relação ao código** | A revisão por pares só pegou o que a Pull Request obrigou a ler |

### Ações para a Sprint 3

1. **Testar em aparelho Android físico com TalkBack**, antes da entrega final.
2. **Definir backup e restauração do banco**, ou declarar no documento final que o projeto não tem.
3. **Manter a regra de revisão restrita a risco alto**, e revisar a restrição no fim da sprint.
4. **Escrever o teste junto com o Pull Request que exige ele**, não depois.

## 5. Dívidas técnicas que ficam

| Dívida | Origem | Risco se não for tratada |
|---|---|---|
| Teste em aparelho Android físico | **G7** | Acessibilidade pode falhar em tela pequena de verdade |
| Sem teste de carga com muitas turmas | Escopo da disciplina | Crescimento sem número conhecido |
| Sem e-mail com SMTP real nos testes | Falta de serviço de teste | O conteúdo do e-mail é testado pelo log, não pelo servidor de e-mail |
| Migração do banco não tem teste de reversão | Nenhuma migração tem | Um esquema errado em ambiente novo exige intervenção manual |
| Dashboard ainda faz duas consultas em telas de lista | Performance | Latência perceptível com muito dado |

## 6. Situação para a entrega final

| Marco | Data | O que falta |
|---|---|---|
| **Sprint Backlog + Status Report II** | 17/11/2026 | Nada do produto; é o backlog da Sprint 3 e o retrato do estado |
| **Entrega final** | 24/11/2026 | Teste em aparelho físico, backup ou declaração de que não há, e as assinaturas do Termo de Abertura |

### Pendências de conteúdo que só o grupo resolve

| Pendência | Onde |
|---|---|
| Nome do(a) professor(a) da Fábrica | Stakeholders **S4**, Termo de Abertura, AV I |
| Product Owner e Scrum Master | Papéis |
| Assinaturas do Termo de Abertura | Termo de Abertura |
| Horas por integrante da Sprint 1 e da Sprint 2 | Sprint 1, Sprint 2 |

### Inventário final do projeto

| Item | Valor |
|---|---|
| Rotas de tela | 31 |
| Tabelas no banco | 19 |
| Testes unitários | 186 em 17 arquivos |
| Passos de teste de fluxo | 81 em 6 grupos |
| Documentos de entrega | 17, cada um em `.md`, `.pdf` e `.doc` |
| Documentos de segurança da informação | 5 |
| Controles mapeados na SoA | 93 |
| Commits | 205 |