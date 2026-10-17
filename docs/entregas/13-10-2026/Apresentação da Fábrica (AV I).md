# Apresentação da Fábrica (AV I)

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 13/10/2026 (Apresentação da Fábrica — AV I) |
| **Versão** | 1.0 — elaborada em 13/10/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

Este documento registra o que foi apresentado na Avaliação 1: o roteiro seguido, o incremento demonstrado ao vivo, as perguntas da professora da Fábrica e o que a equipe prometeu para depois. Ele serve de evidência de que o produto funciona, não de resumo de linhas de código.

## 0. Roteiro da apresentação

| Bloco | Duração | Conteúdo |
|---|---|---|
| **1. O problema** | 5 min | Como uma formatura se organiza hoje em grupos de mensagens e planilhas, e o que isso custa |
| **2. A solução** | 5 min | O que o Formandos é, em uma frase, e a tela de visão do produto |
| **3. Demonstração ao vivo** | 15 min | Fluxo completo, da entrada na turma ao relatório de votação |
| **4. Arquitetura** | 8 min | Monólito Next.js, banco relacional, autenticação e onde a segurança entra |
| **5. Qualidade e documentação** | 5 min | Testes automatizados, testes de fluxo e documentos do cronograma |
| **6. Perguntas** | 7 min | Discussão |

A ordem é deliberada: **problema antes da solução**, e a demonstração vem antes da arquitetura. Nenhuma arquitetura se mostra antes de a pessoa ver o produto funcionando.

## 1. O incremento demonstrado

A demonstração usou o ambiente de teste de `scripts/teste/`, com dados fictícios (`teste-*@example.invalid`) e o SMTP desligado, para nenhum e-mail real sair e nenhum dado de aluno ser tocado.

| # | Passo | Tela | O que se viu |
|---|---|---|---|
| 1 | Entrar na plataforma | `/entrar` | Login por Google e por email e senha, com os dois caminhos lado a lado |
| 2 | Criar conta e confirmar email | `/entrar` | O e-mail de confirmação chega e libera o acesso; conta não confirmada não entra |
| 3 | Entrar na turma por convite | `/convite` | O código do convite leva ao **dashboard** da turma certa |
| 4 | Votar no catálogo | `/votacoes/[catalogoId]` | Escolha por categoria, com **neutra** disponível e alteração de voto sem perder o resto |
| 5 | Ver o progresso | `/votacoes/[catalogoId]` | Barras por categoria e total parcial |
| 6 | Ler o relatório | `/votacoes/relatorio` | Gráfico com o total de cada opção e o total de participação da turma |
| 7 | Fazer uma dúvida | `/duvidas` | A dúvida aparece na lista e pode ser votada pelos colegas |
| 8 | Moderar | `/duvidas` | O administrador responde, destaca, reabre e apaga qualquer dúvida da turma |
| 9 | Organizar o evento | `/tarefas`, `/avisos`, `/terceiros` | Tarefa com responsável e prazo, aviso, fornecedor com orçamento |
| 10 | Administrar a turma | `/admin/turma`, `/admin/membros` | Dados do evento, papéis, código de convite e lista de membros |
| 11 | Painel da plataforma | `/master` | Visão de todas as turmas e usuários pelo administrador master |

Onze passos, trinta minutos de preparação, zero correções durante a execução. Se um passo falhasse, o roteiro tinha um plano B: abrir a tela já semeada e narrar o que o passo faria.

## 2. O que a professora da Fábrica perguntou

| Pergunta | Resposta dada | Efeito no projeto |
|---|---|---|
| Como vocês garantem que só quem é da turma vê as votações? | Toda página protegida e toda Server Action validam sessão, turma e papel em `src/lib/dal.ts`; o `proxy.ts` é só a primeira barreira | Nenhum; a resposta era a arquitetura já descrita em **Arquitetura Inicial** |
| E se um formando sair da turma no meio da votação? | O rastro dele na turma é apagado em transação: votos, presença, dúvidas próprias e os votos que deu nas dúvidas dos outros. Tarefas, avisos e decisões ficam sem autor em vez de sumir | Nenhum; comportamento já implementado |
| Como vocês tratam dados de aluno, já que a LGPD vale? | Aceite explícito de Termos e Privacidade, download dos dados em `/conta/exportar`, canal do DPO e eliminação em transação | Nenhum; o SGSI ainda estava em construção e foi apresentado como planejado |
| Tem teste automatizado? | 20 testes unitários com `npm test` e 59 passos de teste de fluxo no navegador, mais auditoria de responsividade em 6 larguras | **Promessa de ampliar** — virou item **G2** da Sprint 2 |
| Dá para usar no celular? | A auditoria roda em 360, 768, 1024, 1440, 1920 e 3840 px sem rolagem horizontal | Parcial: a revisão de acessibilidade ainda não tinha sido feita |
| Por que não subir para produção? | O Termo de Abertura define rodar localmente com o código no GitHub; o plano de hospedagem gratuito cogitado expira sozinho e não compensava o esforço | Mantido; registrado no Termo de Abertura |

## 3. Avaliação recebida

**Nota: ⟨a definir⟩** — registrar no diário de classe depois da sessão, junto com o nome da professora da Fábrica.

| Critério | Autoavaliação da equipe | Parecer |
|---|---|---|
| Problema e público bem entendidos | Sim — a Visão do Produto e o Stakeholders cobrem isso | ⟨a definir⟩ |
| Produto navegável de ponta a ponta | Sim — 12 itens do MVP, 12 concluídos | ⟨a definir⟩ |
| Arquitetura coerente com o código | Sim — o que está em `src/` é o que está descrito | ⟨a definir⟩ |
| Qualidade e testes | Parcial — testes existem, mas o plano escrito ainda não | ⟨a definir⟩ |
| Documentação das entregas | Sim — 11 documentos do cronograma, em `.md`, `.pdf` e `.doc` | ⟨a definir⟩ |
| Acessibilidade | Não avaliada — revisão feita depois, em 12/10/2026 | ⟨a definir⟩ |

## 4. Compromissos assumidos

A AV I fechou com quatro compromissos, todos já com destino no cronograma:

1. **Ampliar os testes e escrever o plano de casos de teste** — item **G2**, para 03/11/2026.
2. **Fazer a revisão de acessibilidade** — item **G7**, com foco visível, alvos de toque de 44 px, leitura por ecrã e alternativa textual nos gráficos.
3. **Documentar a segurança da informação** — SGSI, com Política de Segurança da Informação, Declaração de Aplicabilidade, matriz de riscos e plano de auditoria.
4. **Configurar a integração contínua** — item **G1**, com `typecheck` e testes rodando a cada `push`.

## 5. Como a apresentação foi registrada

| Evidência | Onde |
|---|---|
| Roteiro e incremento demonstrado | Este documento |
| Perguntas e respostas | Seção 2 |
| Estado do produto na data | Repositório, 128 commits em 13/10/2026 |
| Arquitetura apresentada | `docs/entregas/22-09-2026/Arquitetura Inicial.md` |
| Problema e visão apresentados | `docs/entregas/08-09-2026/Visão do Produto.md` |
| Qualidade apresentada | `docs/entregas/29-09-2026/Sprint 1 - Incremento funcional + Documentação.md` |

O incremento foi demonstrado **rodando**, sem slides de apoio: a professora viu a pessoa entrar, votar, perguntar e ver o relatório. Isso é o que a revisão da sprint de 20/10/2026 vai cobrar.