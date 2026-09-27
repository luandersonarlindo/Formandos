# Papéis

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 08/09/2026 (Termo de Abertura + visão do produto + papéis) |
| **Versão** | 1.0 — elaborada em 26/09/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

## 0. Nota sobre esta versão — evolução do pensamento até a Sprint 1

Este documento foi fechado em 26/09/2026, no encerramento da Sprint 1. O papel de **administrador master**, a permissão de um administrador estar em **várias turmas** e o login por **email e senha** (marcados com **†**) só entraram no pensamento do produto depois do primeiro commit. A tabela completa, com o commit de cada mudança e o porquê, está em **Kick-off** (seção 0).

Este documento define dois tipos de papel: os **papéis da equipe** (quem faz o quê no projeto, no modelo Scrum) e os **papéis de usuário** (o que cada pessoa pode fazer dentro do aplicativo).

## 1. Papéis da equipe (Scrum)

| Papel | Responsabilidades | Quem |
|---|---|---|
| **Product Owner (PO)** | Dono da visão do produto; mantém e prioriza o *Product Backlog*; decide o que entra em cada sprint; aceita ou rejeita o que foi entregue | *A definir pelo grupo* |
| **Scrum Master (SM)** | Garante que o método seja seguido; remove impedimentos; conduz planejamento, revisão e retrospectiva | *A definir pelo grupo* |
| **Time de desenvolvimento** | Projeta, programa, testa e documenta os itens da sprint; estima o trabalho | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Responsável pelo repositório** | Mantém o repositório no GitHub, o ramo `main` e a organização do Git | Luanderson Arlindo |

> **Observação.** O documento não atribui PO e SM por decisão do grupo ainda não registrada. Recomendação: o PO e o SM serem pessoas diferentes; todos os quatro continuam no time de desenvolvimento, pois a equipe é pequena.

### 1.1. Áreas de atuação sugeridas no time de desenvolvimento

Como o projeto é pequeno, todos programam, mas cada um cuida de uma área para não haver conflito:

| Área | O que cobre | Arquivos principais |
|---|---|---|
| Acesso e turmas **†** | Login, convite, papéis, painel master | `src/lib/auth.ts`, `src/lib/dal.ts`, `src/actions/turmas.ts`, `src/actions/master.ts` |
| Votações e relatório | Catálogos, enquetes, votos, gráficos | `src/actions/votos.ts`, `src/actions/catalogos.ts`, `src/lib/votacoes.ts`, `src/lib/relatorio.ts` |
| Dúvidas, tarefas e terceiros | Perguntas e respostas, tarefas, fornecedores | `src/actions/duvidas.ts`, `tarefas.ts`, `terceiros.ts` |
| Interface e qualidade | Telas, componentes, responsividade, testes | `src/components/`, `src/app/`, `scripts/teste/` |

### 1.2. Cerimônias e quem participa

| Cerimônia | Objetivo | Participantes |
|---|---|---|
| Planejamento da sprint | Escolher os itens e a meta da sprint | Todos |
| Acompanhamento (*daily* curto ou por mensagem) | Alinhar o andamento e os bloqueios | Time e SM |
| Revisão da sprint | Demonstrar o incremento funcionando | Todos e o(a) professor(a) |
| Retrospectiva | Melhorar o jeito de trabalhar | Todos |

## 2. Papéis de usuário no aplicativo

| Papel | Descrição | Como se torna |
|---|---|---|
| **Participante** | Formando da turma | Entra na turma com o código de convite |
| **Administrador da turma** | Integrante da comissão organizadora | Cria a turma ou é promovido por outro administrador |
| **Administrador master** **†** | Gestor de toda a plataforma | Email listado na configuração `ADMIN_MASTER_EMAILS` do servidor |

### 2.1. Matriz de permissões

✅ pode · ❌ não pode · **\*** o master usa o aplicativo como qualquer usuário: dentro de uma turma, vale o papel que ele tem nela.

| Ação | Participante | Administrador da turma | Master **†** |
|---|---|---|---|
| Entrar com Google ou email e senha **†** | ✅ | ✅ | ✅ |
| Entrar em uma turma por convite **†** | ✅ (uma turma) | ✅ (várias) | \* |
| Ver dashboard, programação e terceiros | ✅ | ✅ | \* |
| Votar nas enquetes e mudar o voto | ✅ | ✅ | \* |
| Ver o relatório (só totais) | ✅ | ✅ | \* |
| Enviar dúvidas e votar nas dúvidas | ✅ | ✅ | \* |
| Atualizar o andamento de uma tarefa **sua** | ✅ | ✅ | \* |
| Criar, editar e apagar tarefas | ❌ | ✅ | \* |
| Responder, destacar e apagar dúvidas | ❌ | ✅ | \* |
| Editar dados do evento e a programação | ❌ | ✅ | \* |
| Criar catálogos personalizados e perguntas | ❌ | ✅ | \* |
| **Ver quem votou** em cada opção | ❌ | ✅ | \* |
| Cadastrar e remover fornecedores | ❌ | ✅ | \* |
| Gerar novo código de convite | ❌ | ✅ | ❌ (só vê o código) |
| Promover, rebaixar e remover membros | ❌ | ✅ (da sua turma) | ✅ (de qualquer turma) |
| Ver todas as turmas e usuários da plataforma | ❌ | ❌ | ✅ |
| Excluir turma ou usuário | ❌ | ❌ | ✅ (com confirmação) |

### 2.2. Regras que protegem os papéis

1. O painel do administrador (`/admin`) redireciona o participante para o dashboard.
2. O painel master (`/master`) **não existe** (erro 404) para quem não é master, sem revelar que a área existe.
3. Toda ação do servidor confere o papel antes de executar; esconder um botão nunca é a única proteção.
4. O **único administrador** de uma turma não pode ser rebaixado nem removido.
5. Excluir usuário ou turma exige digitar o email ou o nome para confirmar.
