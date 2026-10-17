# Status Report — Código, Documentação e Qualidade

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 27/10/2026 (Status Report: código + documentação + qualidade) |
| **Versão** | 1.0 — elaborada em 27/10/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

Este é o primeiro status report depois da AV I. Ele mostra onde o projeto está em **código**, **documentação** e **qualidade**, com número medido e a fonte de cada número. Onde não há número, o texto diz que não há.

## 0. Resumo do trimestre

| Bloco | Situação em 20/10/2026 | Alvo em 27/10/2026 | Estado |
|---|---|---|---|
| **Código** | Funcional e estável, mas sem revisão por pares | Branch e Pull Request funcionando | Atingido |
| **Documentação** | 11 documentos de entrega, 5 de auditoria, sistema de design | Plano de testes escrito, produto e design documentados | Atingido |
| **Qualidade** | 158 testes unitários, 73 passos de fluxo, acessibilidade parcial | CI rodando, cobertura escrita, aparelho real conferido | Parcial |

## 1. Código

### 1.1 Tamanho

| Indicador | Valor | Como foi medido |
|---|---|---|
| Repositório | GitHub, ramo `main` | — |
| Commits | **175** | `git rev-list --count HEAD` |
| Commits desde 20/10/2026 | 38 | `git log --since=2026-10-21 --oneline \| wc -l` |
| Arquivos TypeScript/TSX | **196** | `find src -name '*.ts' -o -name '*.tsx' \| wc -l` |
| Linhas de código | 15.400 | `find src -name '*.ts*' -exec cat {} + \| wc -l` |
| Rotas de tela | **30** | `find src/app -name page.tsx \| wc -l` |
| Tabelas no banco | 19 (4 do Better Auth e 15 do domínio) | `db/schema.sql` |

### 1.2 Onde o código cresceu

| Área | O que entrou desde 06/10/2026 |
|---|---|
| **Concorrência** | Travas de banco em decisão, tetos e limite por IP no convite; índices compostos; tabela de limitação com coluna de IP |
| **Operação** | `api/healthz` com verificação de seleção no banco; chave `VOTACAO_CONGELADA=1` que pausa votos sem novo deploy; limitação por tipo de ação |
| **Desempenho** | Dashboard com menos consultas, com agregação no próprio SQL; `recharts` e `animejs` carregados sob demanda, só no ramo que os usa |
| **Interface** | Paginação de 10 itens por página, busca no painel master, validação de cliente espelhando o servidor, voto com estado e paginação sem salto de rolagem |
| **Direitos** | Exportação LGPD ampliada para incluir tentativas, auditoria e sessões, sem token |
| **Catálogo** | Imagem do fornecedor na vitrine de terceiros (**G6**) |

### 1.3 Revisão por pares

Este era o ponto mais fraco do projeto e era a principal ação da retrospectiva.

| Antes | Agora |
|---|---|
| Todos os commits partiam de uma conta | **Branch por ideia, Pull Request para revisão** |
| Nenhuma revisão antes de entrar na `main` | Um revisor diferente do autor é obrigatório em código que muda dado, permissão ou autenticação |
| Correção e melhoria no mesmo commit | Um commit = uma ideia; a convenção já está em **Organização do Repositório Git** |

Pull Requests abertos no período: **⟨a definir⟩**. A regra vale para todo o código que entra na `main`.

## 2. Documentação

### 2.1 Entregas do cronograma

São **17 documentos** em três formatos — `.md` para editar no GitHub, `.pdf` e `.doc` para entregar.

| Marco | Documentos |
|---|---|
| 01/09/2026 | Kick-off · Sprint Backlog · Definição do MVP |
| 08/09/2026 | Termo de Abertura · Visão do Produto · Papéis |
| 15/09/2026 | Stakeholders · Requisitos Prioritários |
| 22/09/2026 | Arquitetura Inicial · Organização do Repositório Git |
| 29/09/2026 | Sprint 1 — Incremento funcional + Documentação |
| 06/10/2026 | Fechamento da Sprint 1 |
| 13/10/2026 | Apresentação da Fábrica (AV I) |
| 20/10/2026 | Revisão, Retrospectiva e Planejamento da Sprint 2 |
| 27/10/2026 | Este documento |
| 03/11/2026 | Plano, Casos e Resultados de Testes |
| 10/11/2026 | Sprint 2 — Integração, Testes e Estabilização |

Cada documento começa pelo mesmo cabeçalho, numera as seções a partir da 0 e não cita histórico de commits: são documentos de projeto, não do código.

### 2.2 Documentação técnica

| Documento | Onde | Estado |
|---|---|---|
| Visão do Produto | `PRODUCT.md` | Atualizado com o produto real |
| Sistema de design do Formandos | `docs/design-system/formandos/MASTER.md` | Tokens, componentes e padrões |
| Requisitos de software | `docs/Especificação de Requisitos de Software.md` | Mapeado para as rotas |
| Organograma da aplicação | `docs/Organograma da Aplicação.md` | Fluxo por tela |
| Guia de estudo do projeto | `docs/guia-de-estudo.md` | Para quem entra agora |
| Catálogos de exemplo | `docs/catalogos-modelo/` | 5 áreas: saúde, educação infantil, ensino médio, pós-graduação e o catálogo padrão |

### 2.3 Segurança da informação

| Documento | Onde | Conteúdo |
|---|---|---|
| Política de Segurança da Informação (PSI) | `docs/auditoria-direitos/PSI.md` | Objetivo, princípios, papéis, normas obrigatórias e exceções formais |
| Declaração de Aplicabilidade (SoA) | `docs/auditoria-direitos/SoA.md` | **93 controles** mappedos por justificativa |
| Matriz de riscos | `docs/auditoria-direitos/riscos.md` | Risco por probabilidade e impacto, com resposta |
| Plano de auditoria interna | `docs/auditoria-direitos/auditoria.md` | Programa, periodicidade e modelo de achado |
| Legislação | `docs/auditoria-direitos/legislacao.md` | LGPD, Marco Civil, crimes cibernéticos, software e consumidor |

### 2.4 Pendências de documentação

| Pendência | Bloqueia o quê |
|---|---|
| Nome do(a) professor(a) da Fábrica | Stakeholders **S4**, Termo de Abertura e AV I |
| Product Owner e Scrum Master | Papéis |
| Assinaturas do Termo de Abertura | Entrega final |
| Horas por integrante da Sprint 1 | Se a disciplina pedir |

## 3. Qualidade

### 3.1 Testes automatizados

| Camada | Ferramenta | Quantidade | Estado |
|---|---|---|---|
| Unidade e integração | `vitest` | **186 testes em 17 arquivos** | Todos passando |
| Fluxo no navegador | `scripts/teste/fluxos.mjs` | **81 passos em 6 grupos** | Todos passando |
| Responsividade | `scripts/teste/auditoria.mjs` | 30 páginas × 6 larguras (360 a 3840 px) | Sem estouro horizontal |

O resumo de 81 passos é maior que os 73 passos reais porque cada um dos 6 grupos acrescenta uma verificação de que a página não deixou erro no console.

| Grupo | Cobre |
|---|---|
| `auth` | Criar conta, confirmar email, entrar, sair, esqueci a senha, estados vazios |
| `participante` | Votar, perguntar, acompanhar tarefas, avisos e terceiros |
| `app` | Fluxos internos de votação, dúvida e organização |
| `admin` | Membros, convite, evento, moderação e catálogos |
| `master` | Turmas e usuários pelo painel da plataforma |
| `extras` | Página de erro, animação em movimento, foco por teclado, celular e TV |

### 3.2 Integração contínua

O item **G1** da Sprint 2 está fechado.

| Verificação | Quando roda | Bloqueia merge? |
|---|---|---|
| `npm run typecheck` | A cada `push` e a cada Pull Request | Sim |
| `npm test` | A cada `push` e a cada Pull Request | Sim |

Arquivo: `.github/workflows/ci.yml`. A ausência de erro na integração continua valendo: o `typecheck` roda localmente antes de qualquer `push`.

### 3.3 Cobertura de teste por módulo

| Módulo | Testado | Observação |
|---|---|---|
| Autenticação e e-mail | Sim | `auth-config`, `email`, `email-validacao` |
| Convite e limite de tentativas | Sim | `convite` |
| Votação e decisões | Sim | Inclui trava de concorrência no banco |
| Presença | Sim | `presenca-regras` |
| Orçamento de terceiros | Sim | `orcamento` |
| Paginação | Sim | `paginacao`, `busca` |
| Tema claro e escuro | Sim | `tema` |
| Datas e fuso de São Paulo | Sim | `datas` |
| Vínculos entre turmas | Sim | `vinculos` |
| Catálogo de perguntas | Parcial | Regras cobertas; edição em tela coberta pelo teste de fluxo |
| Master | Parcial | Regras cobertas; telas cobertas pelo teste de fluxo |
| Modelo e migração do banco | Sim | `modelos` |

### 3.4 Acessibilidade

| Item | Situação |
|---|---|
| Link "Pular para o conteúdo" | Feito |
| Títulos por página | Feito |
| *Landmarks* e regiões | Feito, inclusive em `/conta` |
| Foco visível | Feito |
| Alvos de toque de 44 px | Feito, com piso também nos componentes |
| Mensagens de erro anunciadas | Feito, com *live regions* |
| Nomes acessíveis em controles sem texto | Feito |
| Código de convite exposto para leitor de ecrã | Feito |
| Gráfico do relatório com alternativa textual | Feito |
| Telas de carregamento, erro e página não encontrada em português | Feito |
| **Teste em aparelho real com leitor de ecrã** | **Parcial** — testado no leitor do sistema operacional em desktop; teste em celular físico ainda é ⟨a definir⟩ |

### 3.5 Segurança

| Controle | Onde |
|---|---|
| Sessão, turma e papel validados em toda página e toda Server Action | `src/lib/dal.ts` |
| Entradas validadas com Zod, SQL parametrizado | Todo o projeto |
| Limite de 10 tentativas de convite a cada 15 minutos por utilizador | `src/lib/` |
| E-mail descartável barrado e sugestão de domínio correto | `src/lib/email-validacao.ts` |
| Aceite explícito de Termos e Privacidade, com carimbo `consentimento_em` | Cadastro |
| Rastro apagado em transação ao sair ou ser removido | `src/lib/saida-turma.ts` |
| Cabeçalhos de segurança e CSP | `next.config.ts` |
| Trilha de auditoria com retenção de 5 anos | `src/lib/auditoria.ts` |
| Download dos dados, canal do DPO e eliminação | `/conta/exportar`, `/conta` |

## 4. Riscos abertos

| Risco | Prob. | Impacto | Resposta |
|---|---|---|---|
| CI pode falhar por falta de serviço do repositório | Baixa | Alto | `typecheck` e testes rodam localmente antes do `push` |
| Cobertura de tela depende de navegador real | Média | Médio | O teste de fluxo usa Chrome sem interface; falta o aparelho físico |
| Revisão por pares em commits pequenos pode atrasar a entrega | Média | Médio | A revisão é obrigatória só onde o risco é alto |
| Documentação cresce mais rápido que o código | Média | Baixo | Documentos com número medido; sem número, o texto diz que não tem |

## 5. Próximos marcos

| Marco | Data | Foco |
|---|---|---|
| Plano, casos e resultados de testes | 03/11/2026 | Escrever o plano que nunca existiu e publicar os resultados |
| Sprint 2 — Integração, testes e estabilização | 10/11/2026 | Fechar a sprint e avaliar a meta |