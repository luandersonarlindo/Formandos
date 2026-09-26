# Termo de Abertura

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 08/09/2026 (Termo de Abertura + visão do produto + papéis) |
| **Versão** | 1.0 — elaborada em 26/09/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

O Termo de Abertura autoriza formalmente o projeto e registra o que ele é, o que pretende entregar e dentro de quais limites.

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| Nome do projeto | **Formandos** |
| Tipo | Aplicativo web (React e Next.js) com banco de dados PostgreSQL |
| Contexto | Projeto da *Fábrica* (disciplina com avaliação AV I em 13/10/2026 e entrega final em 24/11/2026) |
| Início | 01/09/2026 (kick-off) |
| Término | 24/11/2026 (entrega final + documentação + pré-banca) |
| Repositório | https://github.com/luandersonarlindo/Formandos |

## 2. Justificativa

A organização de formaturas depende de muitas decisões coletivas e de muita informação, hoje espalhadas em grupos de mensagens e planilhas. Um aplicativo único, com participação de todos e visão gerencial para a comissão, reduz retrabalho, dá voz à turma e deixa o histórico de decisões registrado. Para a equipe, o projeto é a oportunidade de aplicar, em um produto real, desenvolvimento web moderno, banco de dados, autenticação, testes e trabalho colaborativo com Git.

## 3. Objetivos

**Objetivo geral:** construir e entregar o **Formandos**, um aplicativo que permita a turmas e comissões organizarem uma formatura de forma participativa.

**Objetivos específicos** (mensuráveis):

1. Entregar um **MVP com os 12 itens** da *Definição do MVP* até a entrega da Sprint 1 (29/09/2026).
2. Ter **testes automatizados passando** e nenhuma tela com erro de console nas telas principais até a entrega dos testes (03/11/2026).
3. Entregar a documentação de cada marco do cronograma **na data prevista**.
4. Apresentar o produto funcionando na **AV I (13/10/2026)** e na **entrega final (24/11/2026)**.

## 4. Escopo

**Dentro:** acesso (Google e email e senha), turmas e convites, papéis, votações e relatório, dúvidas com votos, dashboard, tarefas, fornecedores, administração da turma e da plataforma. Detalhes em *Definição do MVP*.

**Fora:** hospedagem em produção, aplicativo nativo, pagamentos e notificações. Detalhes em *Definição do MVP*.

## 5. Entregas principais

| Entrega | Data |
|---|---|
| Kick-off, Sprint Backlog e definição do MVP | 01/09/2026 |
| Termo de Abertura, visão do produto e papéis | 08/09/2026 |
| Stakeholders e requisitos prioritários | 15/09/2026 |
| Arquitetura inicial e organização do repositório Git | 22/09/2026 |
| Sprint 1: incremento funcional e documentação | 29/09/2026 |
| Apresentação da Fábrica (AV I) | 13/10/2026 |
| Plano, casos e resultados de testes | 03/11/2026 |
| Sprint 2: integração, testes e estabilização | 10/11/2026 |
| Entrega final do produto, documentação e pré-banca | 24/11/2026 |

## 6. Premissas

- Os quatro integrantes têm tempo semanal para o projeto e acesso ao GitHub.
- Existe um computador com Node.js e PostgreSQL para rodar o sistema localmente.
- O login com Google e o envio de emails usam serviços gratuitos (Google Cloud e SMTP do Gmail).
- O *Cronograma de Entregas – 2026* da disciplina não muda.

## 7. Restrições

- **Prazo:** as datas do cronograma são fixas.
- **Custo:** nenhum orçamento para licenças ou hospedagem; só ferramentas gratuitas e de código aberto.
- **Tecnologia:** React, Next.js e PostgreSQL, conforme a proposta da disciplina.
- **Conhecimento:** a equipe está aprendendo Next.js durante o projeto.

## 8. Custos e recursos

| Item | Custo |
|---|---|
| Next.js, React, PostgreSQL, Better Auth, Tailwind, Zod, Vitest e demais bibliotecas | R$ 0 (código aberto) |
| Login com Google (projeto no Google Cloud) | R$ 0 |
| Envio de email (SMTP do Gmail com senha de app) | R$ 0 |
| Hospedagem | Não haverá |
| Trabalho da equipe | 4 integrantes, horas do curso |

## 9. Riscos de alto nível

| Risco | Resposta |
|---|---|
| Curva de aprendizado do Next.js 16 | Guia de estudo e leitura da documentação local |
| Prazo apertado entre marcos | MVP enxuto; melhorias vão para a Sprint 2 |
| Dependência do Google para o login | Login por email e senha como alternativa |
| Vazamento de credenciais | `.env.local` fora do Git e revisão antes dos commits |

A lista completa e atualizada de riscos acompanha o *Kick-off*.

## 10. Critérios de sucesso

- O fluxo principal (entrar, votar, ver relatório, perguntar, acompanhar tarefas) funciona ao vivo na apresentação.
- Todos os marcos do cronograma foram entregues com o documento correspondente.
- O repositório tem README claro, histórico organizado e roda em outra máquina seguindo o passo a passo.

## 11. Partes interessadas (resumo)

Comissão organizadora, formandos, equipe de desenvolvimento, professor(a) da Fábrica e fornecedores de eventos. Análise completa no documento **Stakeholders**.

## 12. Aprovação

| Nome | Papel | Assinatura | Data |
|---|---|---|---|
| Luanderson Arlindo | Equipe de desenvolvimento | | |
| Luiz Orlando | Equipe de desenvolvimento | | |
| José Renato | Equipe de desenvolvimento | | |
| Vinícius | Equipe de desenvolvimento | | |
| *(nome do(a) professor(a) da Fábrica)* | Patrocinador / orientador | | |
