# Stakeholders

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 15/09/2026 (Stakeholders + requisitos prioritários) |
| **Versão** | 1.0 — elaborada em 26/09/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

## 0. Nota sobre esta versão — evolução do pensamento até a Sprint 1

Este documento foi fechado em 26/09/2026, no encerramento da Sprint 1. O stakeholder **S7 (administrador master)**, marcado com **†**, só passou a existir depois do primeiro commit do projeto — não havia, na ideia original, um papel de gestão de toda a plataforma. A tabela completa, com o commit de cada mudança e o porquê, está em **Kick-off** (seção 0).

*Stakeholders* são as pessoas e os grupos que **afetam** o projeto ou **são afetados** por ele. Conhecê-los ajuda a decidir quem ouvir, quando e como.

## 1. Registro de stakeholders

| ID | Stakeholder | Tipo | Interesse no projeto | Expectativa principal |
|---|---|---|---|---|
| S1 | **Comissão organizadora** (administradores das turmas) | Usuário-chave | Organizar a formatura com menos retrabalho | Relatório de preferências, moderação de dúvidas, tarefas e programação sob controle |
| S2 | **Formandos** (participantes) | Usuário | Participar das decisões e tirar dúvidas | Votar de forma simples, ser ouvido e saber o que foi decidido |
| S3 | **Equipe de desenvolvimento** (Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius) | Interno | Aprender e entregar um produto de qualidade | Prazos viáveis, escopo claro e boa divisão do trabalho |
| S4 | **Professor(a) da Fábrica** | Patrocinador e avaliador | Ver a aplicação dos conteúdos e a evolução da equipe | Entregas nas datas, documentação e produto funcionando na AV I e na entrega final |
| S5 | **Instituição de ensino** | Contexto | Formaturas bem organizadas e imagem positiva | Uso responsável dos dados dos alunos |
| S6 | **Fornecedores e prestadores** (buffet, música, fotografia, decoração, equipe de apoio) | Indireto | Ser conhecido pela turma e receber contatos | Vitrine com informações corretas e contato atualizado |
| S7 **†** | **Administrador master** (gestor da plataforma) | Operacional | Manter turmas e usuários em ordem | Visão de toda a plataforma e ferramentas seguras de exclusão |
| S8 | **Provedores de serviço** (Google para o login, Gmail para o email) | Externo | Cumprir seus termos de uso | Uso dentro dos limites gratuitos e das regras de cada serviço |
| S9 | **Familiares e convidados** | Indireto | Participar da festa | Informações de data, local e programação (não usam o sistema hoje) |

## 2. Matriz poder × interesse

| | **Interesse baixo** | **Interesse alto** |
|---|---|---|
| **Poder alto** | *Manter satisfeitos:* S5 Instituição, S8 Provedores | *Gerenciar de perto:* S1 Comissão, S3 Equipe, S4 Professor(a) |
| **Poder baixo** | *Monitorar:* S9 Familiares e convidados | *Manter informados:* S2 Formandos, S6 Fornecedores, S7 Master **†** |

## 3. Análise e estratégia de engajamento

| Stakeholder | Influência | Como envolver | Frequência |
|---|---|---|---|
| S1 Comissão | Alta: define se o produto é adotado | Demonstrações do incremento; ouvir o que falta para decidir e organizar | A cada sprint |
| S2 Formandos | Média: seu uso valida a hipótese do produto | Interface simples, no celular; teste com poucos usuários antes da entrega | Nos testes de aceitação |
| S3 Equipe | Alta | Planejamento, revisão, retrospectiva e divisão do trabalho | Toda semana |
| S4 Professor(a) | Alta: aprova e avalia | Entregar os marcos do cronograma; apresentar o produto rodando | Em cada marco |
| S5 Instituição | Média | Respeitar privacidade e boas práticas de dados | Não há reunião prevista |
| S6 Fornecedores | Baixa | Cadastro feito pela comissão; sem acesso ao sistema | Sob demanda |
| S7 Master **†** | Média | Painel próprio com confirmação em exclusões | A cada sprint |
| S8 Provedores | Média | Respeitar limites e termos; configurar chaves em variáveis de ambiente | Na configuração |

## 4. Necessidades por stakeholder e como o produto responde

| Necessidade | Requisito relacionado |
|---|---|
| A comissão precisa decidir com dados | RF-06 a RF-08 (votações, relatório e catálogo padrão) |
| Os formandos querem ser ouvidos | RF-06 (votar e mudar o voto), RF-11 e RF-12 (dúvidas com votos) |
| A comissão precisa saber quem participou | RF-09 (quem votou), RN-01 |
| O gestor precisa de visão geral **†** | RF-20, RF-21 (painel master) |
| A instituição espera cuidado com dados pessoais | RNF-05 a RNF-07 (segurança e privacidade) |
| Os fornecedores querem visibilidade | RF-17 (vitrine de terceiros) |

Os identificadores acima estão detalhados em **Requisitos Prioritários**.

## 5. Plano de comunicação

| Assunto | Para quem | Canal | Frequência |
|---|---|---|---|
| Andamento da sprint | Equipe | Quadro do projeto e mensagens do grupo | Diária ou sob demanda |
| Demonstração do incremento | Professor(a) e, quando possível, uma comissão de teste | Reunião de revisão | Fim de cada sprint |
| Entregas e documentos | Professor(a) | Repositório do GitHub (pasta `docs/`) | Em cada marco do cronograma |
| Dúvidas técnicas | Equipe | Issues e mensagens | Conforme surgirem |
| Decisões do produto | Equipe e PO | Registro no Sprint Backlog e nos documentos | A cada decisão |

## 6. Riscos ligados a stakeholders

| Risco | Stakeholder | Resposta |
|---|---|---|
| Comissão não adotar o produto | S1 | Validar cedo com uma turma real; priorizar o fluxo de votação |
| Formandos não votarem | S2 | Painel do administrador mostra quem ainda não votou |
| Mudança de expectativa do(a) professor(a) | S4 | Confirmar o escopo em cada marco e registrar por escrito |
| Vazamento de dados dos alunos | S2, S5 | Validação de entradas, checagem de permissão e segredos fora do Git |
| Fim ou mudança nos termos do Google ou do Gmail | S8 | Login por email e senha como alternativa |

## 7. Itens a confirmar pelo grupo

- Nome do(a) professor(a) da Fábrica e canal oficial de contato com ele(a).
- Se haverá uma turma real para testar o produto antes da entrega final.
