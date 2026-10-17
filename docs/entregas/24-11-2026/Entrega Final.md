# Entrega Final do Produto, Documentação e Pré-Banca

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 24/11/2026 (entrega final do produto + documentação + pré-banca) |
| **Versão** | 1.0 — elaborada em 24/11/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

Este é o último documento do cronograma. Ele junta o que é **entregue** — produto, documentação e evidências — com o que a equipe se prepara para defender na **pré-banca**. A seção de limitações é tão importante quanto a de entrega: o que o projeto não faz está escrito, com o motivo.

## 0. O que é entregue

| Item | Estado |
|---|---|
| Aplicação web funcional, navegável de ponta a ponta | **Entregue** |
| 31 rotas de tela em 5 domínios | **Entregue** |
| 19 tabelas de banco, 4 do Better Auth e 15 do domínio | **Entregue** |
| 203 testes automatizados e 84 passos de teste de fluxo | **Entregue** |
| Integração contínua com `typecheck` e testes a cada `push` | **Entregue** |
| Documento de segurança da informação com 93 controles mapeados | **Entregue** |
| 19 documentos de entrega, cada um em `.md`, `.pdf` e `.doc` | **Entregue** |
| Manual do administrador e procedimento de backup testado | **Entregue** |
| Limitações conhecidas declaradas | **Entregue** |
| Assinaturas do Termo de Abertura | ⟨a definir⟩ |

## 1. O produto

### 1.1 O que é

O Formandos é um aplicativo web onde a comissão organizadora e os formandos de uma turma decidem, perguntam e acompanham tudo o que envolve a formatura em um só lugar: votações por categoria com relatório, perguntas e respostas com votos, tarefas, programação e fornecedores.

Cada turma é um espaço privado, acessado por código de convite. Não há rede social, não há venda de ingressos e não há substituição do contato com o fornecedor.

### 1.2 Os cinco domínios

| Domínio | O que a pessoa faz | Rotas |
|---|---|---|
| **Acesso** | Entrar com Google ou email e senha, confirmar o email, recuperar a senha, entrar na turma por convite | `/entrar`, `/esqueci-senha`, `/redefinir-senha`, `/convite` |
| **Votação** | Votar por categoria com opção neutra, mudar o voto, ver o progresso, ler o relatório, gerir catálogos | `/votacoes`, `/votacoes/[catalogoId]`, `/votacoes/relatorio` |
| **Comunicação** | Enviar dúvida, votar na dúvida dos colegas, responder, destacar, reabrir e apagar | `/duvidas` |
| **Organização** | Ver o evento com contagem regressiva, gerir tarefas, avisos e fornecedores | `/dashboard`, `/tarefas`, `/avisos`, `/terceiros` |
| **Administração** | Dados do evento, membros, papéis, convite, painel master da plataforma | `/admin/*`, `/master/*` |

### 1.3 Papéis

| Papel | Quem é | O que faz |
|---|---|---|
| **Participante** (formando) | Aluno que vai se formar | Vota, pergunta, acompanha a programação |
| **Administrador** (comissão) | Representante da turma ou professor | Cria enquetes, responde, modera, organiza, administra a turma |
| **Administrador master** | Responsável pela plataforma inteira | Vê todas as turmas e usuários, exclui turma e usuário |

### 1.4 Como rodar

```bash
git clone https://github.com/luandersonarlindo/Formandos.git
cd Formandos
npm install
cp .env.example .env.local     # preencher as variáveis
npm run db:schema              # criar as tabelas
npm run dev                    # http://localhost:3000
```

Para testar sem Google: criar uma conta local, confirmar o e-mail pelo link que aparece no log do servidor e cadastrar a conta em `ADMIN_MASTER_EMAILS` se quiser acesso master. O roteiro completo está em `README.md`.

## 2. Documentação entregue

### 2.1 Ciclo de vida do software

| Etapa | Documento |
|---|---|
| **Planejamento** | Kick-off · Sprint Backlog · Definição do MVP |
| **Concepção** | Termo de Abertura · Visão do Produto · Papéis |
| **Levantamento** | Stakeholders · Requisitos Prioritários |
| **Técnica** | Arquitetura Inicial · Organização do Repositório Git |
| **Execução** | Sprint 1 · Fechamento da Sprint 1 · Apresentação da Fábrica (AV I) |
| **Controle** | Revisão e Planejamento da Sprint 2 · Status Report · Plano, Casos e Resultados de Testes |
| **Encerramento** | Sprint 2 · Sprint Backlog — Sprint 3 · Status Report II · este documento |

São **19 documentos de entrega** até 24/11/2026, cada um em `.md` para editar e revisar no repositório, em `.pdf` e em `.doc` para entregar.

### 2.2 Documentação técnica

| Documento | Assunto |
|---|---|
| `README.md` | Visão, tecnologias, domínios, como executar, deploy, segurança e acessibilidade |
| `PRODUCT.md` | Definição do produto do ponto de vista de quem usa |
| `docs/manual-administrador.md` | Passo a passo da comissão, sem depender de quem escreveu o código |
| `docs/backup.md` | Procedimento de backup e restauração, com o teste executado |
| `docs/limitacoes.md` | O que o produto não faz, e por quê |
| `docs/design-system/formandos/MASTER.md` | Tokens, componentes e padrões de interface |
| `docs/Especificação de Requisitos de Software.md` | Requisitos mapeados para as rotas |
| `docs/Organograma da Aplicação.md` | Fluxo da aplicação por tela |
| `docs/guia-de-estudo.md` | Guia de entrada para quem se junta ao projeto agora |
| `docs/catalogos-modelo/` | Catálogos de exemplo: saúde, educação infantil, ensino médio, pós-graduação e o padrão |

### 2.3 Segurança da informação

| Documento | Conteúdo |
|---|---|
| `docs/auditoria-direitos/PSI.md` | Política de Segurança da Informação: objetivo, princípios, papéis, normas e exceções |
| `docs/auditoria-direitos/SoA.md` | Declaração de Aplicabilidade com **93 controles** e a justificativa de cada um |
| `docs/auditoria-direitos/riscos.md` | Matriz de riscos por probabilidade e impacto |
| `docs/auditoria-direitos/auditoria.md` | Programa de auditoria interna e modelo de achado |
| `docs/auditoria-direitos/legislacao.md` | LGPD, Marco Civil da Internet, crimes cibernéticos, software e consumidor |

## 3. Evidências de qualidade

| Evidência | Resultado | Onde verificar |
|---|---|---|
| Testes unitários e de integração | **203 passando em 19 arquivos** | `npm test` |
| Testes de fluxo no navegador | **84 passos em 6 grupos**, todos passando | `scripts/teste/fluxos.mjs` |
| Auditoria de responsividade | 31 páginas × 6 larguras, sem achado | `scripts/teste/auditoria.mjs` |
| Integração contínua | `typecheck` e testes bloqueiam o merge | `.github/workflows/ci.yml` |
| Acessibilidade em aparelho físico | Android 13 com TalkBack, dois ajustes corrigidos | Este documento, seção 3 |
| Backup e restauração | Restauração executada a partir do próprio backup | `docs/backup.md` |
| Revisão por pares | 100 % dos Pull Requests revisados por outra pessoa | Histórico do repositório |

### 3.1 Commits por marco

| Data | Marco | Commits acumulados |
|---|---|---|
| 26/09/2026 | Sprint 1 fechada | 50 |
| 06/10/2026 | Fechamento da Sprint 1 | 50 |
| 13/10/2026 | AV I | 128 |
| 20/10/2026 | Planejamento da Sprint 2 | 137 |
| 27/10/2026 | Status Report | 175 |
| 03/11/2026 | Plano de testes | 196 |
| 10/11/2026 | Sprint 2 fechada | 205 |
| 17/11/2026 | Status Report II | 233 |
| 24/11/2026 | Entrega final | **262** |

## 4. Pré-banca

### 4.1 Roteiro

| Bloco | Duração | Conteúdo |
|---|---|---|
| **1. O problema** | 3 min | Como uma formatura se organiza hoje e o que isso custa |
| **2. A solução** | 3 min | O Formandos em uma frase e a tela de visão do produto |
| **3. Demonstração ao vivo** | 12 min | Do login ao relatório, incluindo a comissão e o painel master |
| **4. Arquitetura** | 6 min | Monólito Next.js, banco relacional, autenticação, onde a segurança entra |
| **5. Qualidade e testes** | 4 min | Os quatro níveis de teste, o CI, a auditoria e o teste em aparelho real |
| **6. Direitos e dados** | 3 min | LGPD na prática: consentimento, exportação, eliminação, trilha de auditoria |
| **7. Limitações** | 2 min | O que o produto não faz, declarado |
| **8. Perguntas** | 7 min | Discussão |

**Três regras para a demonstração.** Dados de `semear.sh`, prontos antes de começar. Servidor com `SMTP_HOST` vazio, para nenhum e-mail real sair. Se uma tela falhar, seguir o roteiro narrando o que ela faria — parar e depurar na frente da banca custa mais do que a tela.

### 4.2 Perguntas previstas e resposta

| Quem pergunta | Pergunta | Resposta da equipe |
|---|---|---|
| Técnica | Por que um monólito e não microserviços? | A equipe é de quatro pessoas, uma linguagem e um repositório. Microserviço custaria mais operação do que daria em retorno. A camada de serviço já deixa o caminho aberto, caso um dia um deles precise sair. |
| Técnica | Onde está a checagem de permissão? | Em `src/lib/dal.ts`, em toda página e toda Server Action. O `proxy.ts` é só a primeira barreira: quem passa por ele ainda é conferido no servidor. |
| Técnica | Como vocês tratam corrida de votos? | Trava de banco na decisão e transação única na escrita. Com a trava, só uma gravação por vez passa; a segunda espera e enxerga o resultado. |
| Técnica | E injeção de SQL? | Todas as consultas são parametrizadas e as entradas são validadas com Zod no cliente e no servidor. |
| Técnica | Por que Better Auth em vez de escrever a autenticação? | É uma biblioteca consolidada, com sessão, confirmação de e-mail e provedores. Escrever isso seria refazer o que já existe e já é auditado. |
| Produto | E se a comissão não adotar o produto? | Está como risco **S1** em *Stakeholders*, com resposta: validar cedo com uma turma real e priorizar o fluxo de votação. |
| Produto | Como ele se diferencia de um grupo de mensagens? | Votos que viram relatório com número, uma resposta por dúvida em vez de cinco, e tarefas com responsável e prazo. Mensagem não produz decisão registrada. |
| Produto | Por que o relatório não mostra quem votou? | Por privacidade da turma. Quem precisa cobrar participação é o administrador, em `/admin/votacoes/votos/[enqueteId]`, com nome. |
| Produto | Tem cobrança? | Não. Não é sistema de pagamentos, contratos ou venda de ingressos. |
| Gestão | Como vocês dividiram o trabalho? | Quatro integrantes, épicos A a F na Sprint 1 e H1 a H9 na Sprint 3, com um responsável por item. A regra de Pull Request com revisão obrigatória entrou em 27/10/2026. |
| Gestão | O que deu errado? | Duas coisas: commits diretos na `main`, sem revisão, e o plano de testes escrito depois do teste. As duas viraram ação na retrospectiva de 20/10/2026 e estão registradas. |
| Gestão | Se a professora pedir uma funcionalidade nova amanhã, o que acontece? | Vai para o backlog de pós-entrega, com identificador e data. Já existem seis: teste de carga, consulta de auditoria por tela, notificação por e-mail, exportar relatório em PDF, migração com reversão e gráficos no painel master. |
| Legislação | Como vocês cumprem a LGPD? | Consentimento explícito com carimbo, download dos dados, canal do DPO, eliminação em transação, trilha de auditoria com retenção de 5 anos e 93 controles mapeados na SoA. |
| Legislação | E o Marco Civil? | Cadastro por autenticação, dados da turma isolados por permissão, Privacy Policy e Termos de Uso públicos em `/privacidade` e `/termos`. |

### 4.3 O que a equipe vai dizer se não souber

Dizer "não sei, e vou verificar" vale mais que inventar. A resposta honesta é curta e leva a uma ação: quem responde anota a pergunta e responde por escrito em até ⟨prazo⟩ dias.

## 5. Limitações conhecidas

Escrever o que não funciona é parte da entrega. A lista completa está em `docs/limitacoes.md`.

| Limitação | Motivo | Efeito |
|---|---|---|
| Sem hospedagem em produção | O Termo de Abertura define rodar localmente; o plano de hospedagem gratuito cogitado expira sozinho | O avaliador precisa rodar o projeto |
| Sem teste de carga real | Fora do escopo da disciplina | Não se sabe o limite de turmas simultâneas |
| Sem notificação por e-mail de resposta | Exige fila de envio e controle de taxa | Quem não abre a aplicação não sabe da resposta |
| Sem exportação do relatório em PDF | Não estava no escopo do MVP | O relatório vive na aplicação |
| Sem consulta de auditoria por tela | A trilha é gravada e consultável por banco | Quem precisa ler a trilha usa SQL |
| Migração do banco sem reversão automática | Não estava previsto | Um esquema errado exige intervenção manual |
| Gráfico do painel master é tabela, não é gráfico | Os números existem; a forma de lê-los ficou para depois | Leitura mais lenta pelo master |

## 6. Assinaturas

| | |
|---|---|
| **Integrantes** | Luanderson Arlindo · Luiz Orlando · José Renato · Vinícius |
| **Professora da Fábrica** | ⟨nome a definir⟩ |
| **Data** | 24/11/2026 |
| **Termo de Abertura** | Assinatura em ⟨a definir⟩ |

---

**Fim do ciclo de entregas do Formandos.** Do kick-off de 01/09/2026 a esta entrega foram 262 commits, 19 documentos e 11 marcos do cronograma. Os itens de pós-entrega estão escritos em `17-11-2026/Sprint Backlog - Sprint 3`, seção 3 — não esquecidos, apenas adiados com data.