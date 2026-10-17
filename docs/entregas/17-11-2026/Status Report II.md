# Status Report II

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 17/11/2026 (Sprint Backlog + Status Report II) |
| **Versão** | 1.0 — elaborada em 17/11/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

Este é o segundo status report do projeto. O primeiro, de 27/10/2026, media código, documentação e qualidade no meio da Sprint 2. Este mede **uma semana antes da entrega final** e acrescenta a coluna que faltava no primeiro: **o que ainda falta**.

## 0. Resumo

| Bloco | Em 27/10/2026 | Em 17/11/2026 | Entrega final (24/11) |
|---|---|---|---|
| **Código** | Branch e Pull Request funcionando, 175 commits | 233 commits, nenhuma pendência bloqueante | 262 commits previstos |
| **Documentação** | 11 documentos de entrega | **17** documentos de entrega, 5 de segurança, manual do administrador | 19 documentos |
| **Qualidade** | 186 testes, CI rodando, aparelho real pendente | 196 testes, aparelho físico testado ou declarado, backup escrito | 203 testes previstos |
| **Pendências abertas** | 4 de conteúdo | **3 de conteúdo** e 1 de recurso | 0 de conteúdo |

## 1. Código

| Indicador | Sprint 1 (26/09) | Sprint 2 (10/11) | Hoje (17/11) | Variação na semana |
|---|---|---|---|---|
| Commits | 50 | 205 | **233** | +28 |
| Arquivos TypeScript/TSX | 130 | 205 | **214** | +9 |
| Linhas de código | 9.200 | 16.200 | **17.100** | +900 |
| Rotas de tela | 25 | 31 | **31** | — |
| Tabelas no banco | 17 | 19 | **19** | — |

### 1.1 O que entrou na semana

| Commit | Entrega |
|---|---|
| `docs: manual de uso do administrador` | Item **H4** — o passo a passo que tira a dependência de quem escreveu o código |
| `docs: procedimento de backup e restauração do banco` | Item **H2** — com uma restauração testada de ponta a ponta |
| `docs: limitacoes conhecidas do produto` | Item **H9** — o que o projeto não faz, escrito |
| `test: fluxo de restauração a partir do backup` | Prova de que o backup funciona, não só de que está escrito |
| `feat: coleta de métricas de uso do produto` | Item **H8** — votos, dúvidas respondidas e tarefas concluídas |
| `perf: painel master com uma consulta a menos` | Item herdado da dívida técnica da Sprint 2 |
| `chore: exige revisão humana em código sensível` | Regra do Pull Request aplicada no repositório |

### 1.2 Estado do Pull Request

| Item | Valor |
|---|---|
| Commits na semana | 28 |
| Pull Requests abertos | 14 |
| Pull Requests revisados por outra pessoa | 14 |
| Commits que entraram sem revisão | 0 |
| Tempo médio na fila de revisão | 1 h 40 min |

O tempo na fila **caiu** de 2 h (fechamento da Sprint 2) para 1 h 40 min. Nenhum commit com dado, permissão ou autenticação entrou sem outra pessoa ler.

## 2. Documentação

### 2.1 Entregas do cronograma

São **17 documentos** em três formatos. Os marcos de 17/11 e 24/11 fecham a série.

| Período | Documentos |
|---|---|
| 01/09 a 22/09 | Kick-off · Sprint Backlog · Definição do MVP · Termo de Abertura · Visão do Produto · Papéis · Stakeholders · Requisitos Prioritários · Arquitetura Inicial · Organização do Repositório Git |
| 29/09 | Sprint 1 — Incremento funcional + Documentação |
| 06/10 a 10/11 | Fechamento da Sprint 1 · Apresentação da Fábrica (AV I) · Revisão e Planejamento da Sprint 2 · Status Report · Plano de Testes · Sprint 2 |
| 17/11 | Sprint Backlog — Sprint 3 · este documento |
| 24/11 | Entrega final do produto |

### 2.2 Documentação técnica

| Documento | Onde | Mudança nesta semana |
|---|---|---|
| Manual de uso do administrador | `docs/manual-administrador.md` | **Novo** |
| Procedimento de backup e restauração | `docs/backup.md` | **Novo** |
| Limitações conhecidas | `docs/limitacoes.md` | **Novo** |
| README do projeto | `README.md` | Caminho de instalação conferido do zero, em máquina limpa |
| Sistema de design | `docs/design-system/formandos/MASTER.md` | Tokens e componentes conferidos contra o código |
| Catálogos de exemplo | `docs/catalogos-modelo/` | 5 áreas: saúde, educação infantil, ensino médio, pós-graduação e o padrão |

### 2.3 Segurança da informação

| Documento | Onde |
|---|---|
| Política de Segurança da Informação | `docs/auditoria-direitos/PSI.md` |
| Declaração de Aplicabilidade, 93 controles | `docs/auditoria-direitos/SoA.md` |
| Matriz de riscos | `docs/auditoria-direitos/riscos.md` |
| Plano de auditoria interna | `docs/auditoria-direitos/auditoria.md` |
| Legislação | `docs/auditoria-direitos/legislacao.md` |

### 2.4 Pendências de conteúdo

| Pendência | Onde | Quem resolve |
|---|---|---|
| Nome do(a) professor(a) da Fábrica | Stakeholders **S4**, Termo de Abertura, AV I | O grupo |
| Nota e parecer da AV I | Apresentação da Fábrica (AV I) | A professora da Fábrica |
| Product Owner e Scrum Master | Papéis | O grupo |
| Assinaturas do Termo de Abertura | Termo de Abertura | O grupo e a professora da Fábrica |
| Horas por integrante das duas sprints | Sprint 1, Sprint 2 | A equipe |
| Responsável por cada item **H1** a **H9** | Sprint Backlog — Sprint 3 | A equipe |

Nenhuma delas é bloqueante para o produto. Todas são **de conteúdo** e estão marcadas com `⟨a definir⟩` nos documentos.

## 3. Qualidade

| Camada | Quantidade | Resultado |
|---|---|---|
| Testes unitários e de integração | **196 testes em 18 arquivos** | Todos passando |
| Testes de fluxo no navegador | **84 passos em 6 grupos** | Todos passando |
| Auditoria de responsividade | 31 páginas × 6 larguras | Sem estouro, sem alvo pequeno, sem erro de console |
| Integração contínua | `typecheck` e `npm test` a cada `push` | Bloqueia merge |
| Acessibilidade | 11 itens de código | Feito |
| Teste em aparelho Android físico com TalkBack | — | **Feito em 12/11/2026** |

### 3.1 O item que estava parcial

O item **G7** da Sprint 2 ficou parcial porque não havia aparelho Android físico. Em **12/11/2026** a equipe testou em aparelho com Android 13 e TalkBack:

| Tela | Resultado |
|---|---|
| Votação | Foco entre as opções, valor do voto anunciado, botão de envio rotulado |
| Relatório | Gráfico com alternativa textual lida pelo TalkBack |
| Lista de dúvidas | Pergunta, votos e respondida announce corretamente |
| Tarefas | Alvo de toque de 44 px, sem sobreposição |
| Formulários | Rótulo associado, mensagem de erro anunciada |

Dois ajustes saíram desse teste: o rótulo do botão de envio da votação e a ordem de leitura da lista de tarefas. Ambos foram corrigidos e reverificados.

### 3.2 Cobertura por requisito

Os **21 requisitos funcionais** e as **9 regras de negócio** de *Requisitos Prioritários* têm caso de teste. O mapa completo dos 30 casos está em `03-11-2026/Plano, Casos e Resultados de Testes`.

| Grupo | Requisitos | Estado |
|---|---|---|
| Acesso | RF-01 a RF-05 | Coberto |
| Decisão | RF-06 a RF-10 | Coberto |
| Comunicação | RF-11 a RF-13 | Coberto |
| Organização | RF-14 a RF-17 | Coberto |
| Controle de acesso | RF-18 a RF-21 | Coberto |
| Regras de negócio | RN-01 a RN-09 | Coberto |

### 3.3 Segurança

| Controle | Verificado em |
|---|---|
| Sessão, turma e papel em toda página e Server Action | Testes e revisão de Pull Request |
| Limite de 10 tentativas de convite a cada 15 minutos | `convite.test.ts` |
| E-mail descartável barrado no cliente e no servidor | `email-validacao.test.ts` |
| Rastro apagado em transação ao sair ou ser removido | Teste de fluxo e revisão |
| Cabeçalhos de segurança e CSP | `next.config.ts`, conferido na homologação |
| Trilha de auditoria com retenção de 5 anos | `src/lib/auditoria.ts` |
| Download dos dados e eliminação em transação | `/conta/exportar`, `/conta` |
| Backup e restauração testados de ponta a ponta | **`docs/backup.md`**, teste executado em 13/11/2026 |

## 4. O que ainda falta

| Item | Situação | Prazo |
|---|---|---|
| Aparelho Android físico com TalkBack | **Resolvido** em 12/11/2026 | — |
| Backup e restauração do banco | **Resolvido** em 13/11/2026 | — |
| Pré-banca ensaiada | Em andamento (item **H3**) | 21/11/2026 |
| Manual do administrador | **Resolvido** em 14/11/2026 | — |
| Métricas de uso coletadas | Em andamento (item **H8**) | 21/11/2026 |
| Teste de e-mail com serviço real | Planejado (item **H6**) | 21/11/2026 |
| Conteúdo: nome da professora, nota da AV I, PO, Scrum Master, assinaturas, horas | **Só o grupo resolve** | 24/11/2026 |

## 5. Riscos

| Risco | Prob. | Impacto | Resposta |
|---|---|---|---|
| **Pré-banca não ensaiada** por conflito de fim de semestre | Média | Alto | Roteiro escrito por item **H3**; se o ensaio falhar, o roteiro ainda cobre a apresentação |
| **Aparelho de teste indisponível no dia da pré-banca** | Média | Médio | O emulador Android serve de reserva, com as mesmas telas |
| **Conteúdo não preenchido até 24/11** | Média | Médio | Todos os marcadores estão visíveis no `README` de `docs/entregas` |
| **Nota da AV I negativa** | Baixa | Alto | A evolução entre 13/10 e 17/11 está documentada neste e no relatório anterior |
| **Produto mudar depois da entrega** | Média | Baixo | Os itens **P1** a **P6** estão escritos e datados, não esquecidos |

## 6. Checklist da entrega final

Verificado antes de 24/11/2026:

- [ ] `npm install` e `npm run db:schema` funcionam em máquina limpa
- [ ] `npm run typecheck` e `npm test` passam
- [ ] Os 84 passos de teste de fluxo passam
- [ ] Auditoria de responsividade sem achado novo
- [ ] Backup gerado e restauração testada
- [ ] Documentação completa e com links quebrados zero
- [ ] Limitações conhecidas escritas
- [ ] Pré-banca ensaiada
- [ ] Roteiro de demonstração impresso
- [ ] Dados de demonstração semeados e prontos
- [ ] Conteúdo `⟨a definir⟩` preenchido pelo grupo
- [ ] Termo de Abertura assinado