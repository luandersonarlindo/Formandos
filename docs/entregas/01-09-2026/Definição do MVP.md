# Definição do MVP

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 01/09/2026 (Kick-off + Sprint Backlog + definição do MVP) |
| **Versão** | 1.0 — elaborada em 26/09/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

## 0. Nota sobre esta versão — evolução do pensamento até a Sprint 1

Este documento foi fechado em 26/09/2026, no encerramento da Sprint 1, revisando a definição do dia do kick-off. O primeiro código do projeto (commits `e9cf8c9` a `7b9ba5a`) previa um MVP mais enxuto: login só com Google, uma turma fixa por formando, sem administrador master e sem hospedagem definida. Os itens abaixo marcados com **†** só entraram no MVP depois do primeiro commit — a tabela completa, com o commit de cada mudança e o porquê, está em **Kick-off** (seção 0).

## 1. O que é o MVP

MVP (*Minimum Viable Product*) é a **menor versão do produto que já resolve o problema de verdade** e permite aprender com o uso. Para o Formandos, o MVP é: *uma turma consegue decidir, perguntar e se organizar para a formatura dentro do aplicativo, sem depender de grupos de mensagens e planilhas.*

## 2. Hipótese a validar

> Se a comissão organizadora e os formandos tiverem um lugar único para **votar, perguntar e acompanhar tarefas e programação**, as decisões saem mais rápido, com mais participação, e as dúvidas param de se repetir.

## 3. O que está DENTRO do MVP

| # | Capacidade | Critério de aceite (resumido) |
|---|---|---|
| 1 | **Acesso** com Google ou email e senha **†** | Login funciona; email de senha só entra após confirmar o link; quem não está logado vai para o login |
| 2 | **Turmas e convite** | Administrador cria a turma e recebe um código; formando entra com o código; código errado mostra erro |
| 3 | **Papéis** | Administrador e participante veem coisas diferentes; o participante não acessa o painel do administrador |
| 4 | **Votações** | Formando vota (escolha única ou múltipla), muda o voto e vê o que já respondeu |
| 5 | **Catálogo padrão + personalizados** | 8 categorias e 16 perguntas prontas; administrador cria catálogos próprios |
| 6 | **Relatório** | Gráfico por pergunta, totais e opção mais votada, sem mostrar quem votou |
| 7 | **Dúvidas** | Enviar, votar nas dúvidas dos colegas; administrador responde, destaca e apaga |
| 8 | **Dashboard** | Contagem regressiva, data, local, programação e indicadores |
| 9 | **Tarefas** | Título, responsável, prazo e status; barra de progresso da turma |
| 10 | **Terceiros** | Lista de fornecedores por categoria com contato |
| 11 | **Administração** | Membros, papéis, código de convite, dados do evento |
| 12 | **Qualidade mínima** | Validação de entradas, checagem de permissão, telas de erro e 404, testes automatizados |

## 4. O que está FORA do MVP

| Item | Motivo |
|---|---|
| Hospedagem em produção **†** | O foco é o código; o projeto roda localmente e vive no GitHub |
| Aplicativo móvel nativo | O site já é responsivo (celular, tablet, notebook e TV) |
| Tema escuro | Melhoria estética, fica para a Sprint 2 |
| Editar pergunta já criada | Dá para apagar e recriar; fica para a Sprint 2 |
| Ocultar perguntas do catálogo padrão | Exige tabela extra; baixa prioridade |
| Imagem de fornecedor | Melhoria visual da vitrine |
| Pagamentos, contratos e notificações | Fora da proposta do produto |
| Login com outros provedores (Facebook, Apple) | O Google e o email e senha bastam |

## 5. Papéis de usuário no MVP

| Papel | Quem é | O que pode |
|---|---|---|
| **Participante** | Formando da turma | Votar, mandar e votar dúvidas, ver tarefas, programação e terceiros |
| **Administrador da turma** | Comissão organizadora | Tudo do participante, mais gerir membros, convite, evento, tarefas, dúvidas, catálogos e fornecedores |
| **Administrador master** **†** | Gestor da plataforma | Ver e gerir todas as turmas e usuários; definido por configuração do servidor |

## 5.1. Regras de negócio essenciais

1. O voto é **identificado**: só os administradores da turma veem quem votou; o relatório mostra apenas totais.
2. O formando pode **mudar o voto** quando quiser.
3. Um formando pertence a **uma turma**; administradores podem ter **várias**.
4. O **único administrador** não pode sair nem ser rebaixado sem antes promover outro membro.
5. Se o **último membro sair**, a turma é apagada.
6. Erros repetidos de código de convite são **limitados** (10 tentativas a cada 15 minutos por usuário).

## 6. Definição de pronto (DoD) de cada item do MVP

- [x] Funciona no navegador, do início ao fim.
- [x] A entrada é validada e a permissão é conferida no servidor.
- [x] Existe estado de **carregando**, de **erro** e de **lista vazia**.
- [x] As regras de negócio têm teste automatizado.
- [x] Foi testado em telas pequenas e grandes.
- [x] O comportamento novo aparece na documentação.

## 7. Métricas de sucesso

| Métrica | Meta para o MVP |
|---|---|
| Fluxo principal (entrar → votar → ver relatório) concluído sem ajuda | Sim, em uma demonstração ao vivo |
| Itens do MVP concluídos | 12 de 12 |
| Testes automatizados | Todos passando (`npm test`, `npm run typecheck`) |
| Erros no console do navegador nas telas principais | Nenhum |
| Telas sem rolagem horizontal em 360, 768, 1024, 1440, 1920 e 3840 px | Todas |

## 8. Situação em 26/09/2026

Os 12 itens do MVP estão implementados e conferidos no navegador. O histórico e as evidências estão no documento **Sprint 1 - Incremento funcional + Documentação**.
