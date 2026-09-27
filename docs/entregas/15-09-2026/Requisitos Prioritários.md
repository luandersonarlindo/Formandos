# Requisitos Prioritários

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 15/09/2026 (Stakeholders + requisitos prioritários) |
| **Versão** | 1.0 — elaborada em 26/09/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

## 0. Nota sobre esta versão — evolução do pensamento até a Sprint 1

Este documento foi fechado em 26/09/2026, no encerramento da Sprint 1. Os requisitos marcados com **†** (RF-02, RF-03, RF-05, RF-20 e RF-21) não estavam no pensamento do primeiro commit: entraram depois, quando a equipe decidiu que o login só com Google não bastava, que um administrador podia ajudar mais de uma turma, e que faltava um papel para gerir toda a plataforma. A tabela completa, com o commit de cada mudança e o porquê, está em **Kick-off** (seção 0).

## 1. Como ler este documento

- **RF** = requisito funcional (o que o sistema faz). **RNF** = requisito não funcional (como o sistema se comporta). **RN** = regra de negócio.
- **Prioridade (MoSCoW):** **M** = deve ter (MVP), **S** = deveria ter, **C** = poderia ter.
- **Onde** indica a rota principal do requisito no aplicativo. **Situação** é a de 26/09/2026.

## 2. Requisitos funcionais

### 2.1. Acesso e turmas

| ID | Requisito | Prior. | Onde | Situação |
|---|---|---|---|---|
| RF-01 | O sistema deve permitir **entrar com a conta Google** | M | `/entrar` | Atendido |
| RF-02 **†** | O sistema deve permitir **criar conta e entrar com email e senha**, exigindo a confirmação do email por link | M | `/entrar` | Atendido |
| RF-03 **†** | O sistema deve permitir **definir ou recuperar a senha** por um link enviado ao email | S | `/esqueci-senha`, `/redefinir-senha` | Atendido |
| RF-04 | O usuário sem turma deve poder **entrar em uma turma com um código de convite** ou **criar uma turma** | M | `/convite` | Atendido |
| RF-05 **†** | O administrador deve poder **participar de várias turmas** e escolher a turma em uso | S | barra lateral | Atendido |

### 2.2. Votações e relatório

| ID | Requisito | Prior. | Onde | Situação |
|---|---|---|---|---|
| RF-06 | O participante deve **votar** nas enquetes (escolha única ou múltipla, com opção exclusiva) e **mudar o voto** | M | `/votacoes/[catalogoId]` | Atendido |
| RF-07 | O sistema deve gerar um **relatório** por pergunta, com gráfico, totais, percentuais e a opção mais votada, **sem identificar** quem votou | M | `/votacoes/relatorio` | Atendido |
| RF-08 | O sistema deve oferecer um **catálogo padrão** (8 categorias, 16 perguntas) a todas as turmas | M | `/votacoes` | Atendido |
| RF-09 | O administrador deve **ver quem votou** em cada opção e quem ainda não votou | S | `/admin/votacoes/votos/[enqueteId]` | Atendido |
| RF-10 | O administrador deve **criar, renomear e excluir catálogos personalizados**, com categorias e perguntas próprias | S | `/admin/votacoes` | Atendido |

### 2.3. Dúvidas

| ID | Requisito | Prior. | Onde | Situação |
|---|---|---|---|---|
| RF-11 | O participante deve **enviar dúvidas** (até 500 caracteres) | M | `/duvidas` | Atendido |
| RF-12 | O participante deve **votar nas dúvidas** dos colegas; a lista ordena por destaque, votos e data | S | `/duvidas` | Atendido |
| RF-13 | O administrador deve **responder, destacar, reabrir e apagar** dúvidas | M | `/admin/duvidas` | Atendido |

### 2.4. Evento, tarefas e terceiros

| ID | Requisito | Prior. | Onde | Situação |
|---|---|---|---|---|
| RF-14 | O sistema deve mostrar **contagem regressiva, data, local e programação** da festa | M | `/dashboard` | Atendido |
| RF-15 | O administrador deve **editar os dados do evento e a programação** | M | `/admin/evento` | Atendido |
| RF-16 | O sistema deve permitir **tarefas** com título, descrição, responsável, prazo e status, com barra de progresso; o responsável atualiza o andamento | M | `/tarefas` | Atendido |
| RF-17 | O sistema deve exibir uma **vitrine de fornecedores** por categoria, com contato; o administrador cadastra e remove | S | `/terceiros` | Atendido |

### 2.5. Administração

| ID | Requisito | Prior. | Onde | Situação |
|---|---|---|---|---|
| RF-18 | O administrador deve **promover, rebaixar e remover membros** | M | `/admin/membros` | Atendido |
| RF-19 | O administrador deve **ver e gerar um novo código de convite**, e **copiá-lo** com uma mensagem pronta | M | `/admin/convite` | Atendido |
| RF-20 **†** | O **master** deve **ver todas as turmas e usuários** e gerir os membros de qualquer turma | C | `/master` | Atendido |
| RF-21 **†** | O **master** deve **excluir turmas e usuários**, com confirmação digitada | C | `/master/turmas`, `/master/usuarios` | Atendido |

## 3. Regras de negócio

| ID | Regra | Prior. |
|---|---|---|
| RN-01 | O voto é **identificado**: só administradores veem quem votou; o relatório mostra apenas totais | M |
| RN-02 | O participante pode **mudar o voto**; mudar é apagar os votos da pergunta e gravar os novos, numa única transação | M |
| RN-03 | Só quem **não tem turma** ou **é administrador** em alguma turma pode entrar em outra turma | S |
| RN-04 | O **único administrador** de uma turma não pode ser rebaixado nem removido, nem sair enquanto houver outros membros | M |
| RN-05 | Se o **último membro** sair, a turma é apagada | S |
| RN-06 | O login por senha só vale **depois de confirmar o email** | M |
| RN-07 | O sistema aceita no máximo **10 códigos de convite errados a cada 15 minutos** por usuário | S |
| RN-08 | Em pergunta de múltipla escolha, marcar a **opção exclusiva** desmarca as demais, e vice-versa | S |
| RN-09 | O catálogo padrão é **somente leitura** e igual para todas as turmas | M |

## 4. Requisitos não funcionais

| ID | Requisito | Prior. | Como é atendido e verificado |
|---|---|---|---|
| RNF-01 | **Usabilidade:** interface em português, com estados de carregando, erro, vazio e página não encontrada | M | `loading.tsx`, `error.tsx`, `not-found.tsx`; conferido nas telas |
| RNF-02 | **Responsividade:** funcionar em celular, tablet, notebook e TV | S | Tailwind com ajuste da fonte da raiz em telas grandes; auditoria em 360, 768, 1024, 1440, 1920 e 3840 px sem rolagem horizontal |
| RNF-03 | **Acessibilidade:** navegação por teclado, foco visível, link "Pular para o conteúdo", rótulos nos campos e respeito a "reduzir movimento" | S | Contorno de foco global; ids únicos; animações desligadas com `prefers-reduced-motion` |
| RNF-04 | **Desempenho e estabilidade:** páginas renderizadas no servidor; animações não bloqueiam o conteúdo | S | Conteúdo completo sem JavaScript; animação só como acréscimo |
| RNF-05 | **Segurança de acesso:** a sessão é validada no servidor em toda página e ação; o painel master não existe para quem não é master | M | `src/lib/dal.ts`; `proxy.ts` é só uma checagem rápida |
| RNF-06 | **Segurança de dados:** validação de toda entrada (Zod), consultas SQL parametrizadas, cabeçalhos HTTP de segurança, limite de tentativas de convite | M | Zod nas Server Actions; `pg` com parâmetros; `next.config.ts` |
| RNF-07 | **Privacidade:** segredos fora do Git; o relatório não identifica votantes | M | `.gitignore`; `.env.local`; RN-01 |
| RNF-08 | **Manutenibilidade:** código em TypeScript, organizado por área, com testes automatizados | S | `npm run typecheck`, `npm test` (20 testes) e roteiro de fluxo com 59 passos |
| RNF-09 | **Portabilidade:** rodar em outra máquina com Node.js e PostgreSQL seguindo o README | M | README e `.env.example` |
| RNF-10 | **Compatibilidade:** navegadores atuais (Chrome e derivados) | S | Testado no Chrome |

## 5. Matriz de rastreabilidade (resumo)

| Objetivo do produto | Requisitos | Cobertura de testes |
|---|---|---|
| Decisão baseada em dados | RF-06 a RF-10, RN-01, RN-02, RN-08, RN-09 | Testes de fluxo: votar, relatório com empate, catálogo personalizado |
| Comunicação organizada | RF-11 a RF-13 | Testes de fluxo: enviar, votar, responder, destacar, reabrir, apagar |
| Organização da preparação | RF-14 a RF-17 | Testes de fluxo: tarefas, evento, programação, terceiros |
| Controle de acesso | RF-01 a RF-05, RF-18 a RF-21, RN-03 a RN-07 | Testes unitários das regras e testes de fluxo de criar conta, entrar, sair e redefinir a senha |

## 6. O que ficou como requisito futuro

Tema escuro, editar pergunta, ocultar perguntas do catálogo padrão, imagem de fornecedor, integração contínua e testes em aparelhos reais. Ver *Sprint Backlog* (itens G1 a G7).
