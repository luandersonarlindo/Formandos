# Plano, Casos e Resultados de Testes

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 03/11/2026 (plano, casos e resultados de testes) |
| **Versão** | 1.0 — elaborada em 03/11/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

Este documento é o plano de testes do Formandos, escrito depois do produto e não antes — a chamada dívida que a retrospectiva de 20/10/2026 registrou. Ele diz **o que testar**, **como testar**, **quem testa** e **o que os resultados foram**. O item **G2** do backlog da Sprint 2 é este documento.

## 0. Princípios

1. **O plano vem antes do teste novo.** Nenhum teste é escrito sem um caso aqui.
2. **Cada caso aponta para um requisito.** Requisito sem caso é requisito não verificado, e isso aparece na seção 4.
3. **Nenhum teste toca em dado de aluno.** Tudo roda com e-mail `teste-*@example.invalid` e código de convite `TESTE*`.
4. **O teste de fluxo confere o banco, não só a tela.** Um passo que passa na interface e grava errado é falha.
5. **O que não é testado está escrito.** A seção 5 lista as lacunas com o motivo.

## 1. Estratégia: quatro camadas

| Camada | O que verifica | Ferramenta | Quando roda | Quantidade |
|---|---|---|---|---|
| **1. Unidade e integração** | Regras de negócio e validações, sem navegador | `vitest` | No CI e localmente | **186 testes em 17 arquivos** |
| **2. Fluxo no navegador** | O caminho completo de uma pessoa, do clique ao banco | `scripts/teste/fluxos.mjs` com Chrome | Antes de cada marco | **81 passos em 6 grupos** |
| **3. Responsividade** | Estouro horizontal, alvos pequenos, erro de console | `scripts/teste/auditoria.mjs` | Antes de cada marco | 30 páginas × 6 larguras |
| **4. Revisão por pares** | O que o teste não pega: nome ruim, lógica confusa, segurança | Pull Request humano | A cada Pull Request | Obrigatória em dado, permissão e autenticação |

A camada 4 existe porque a 1 a 3 só verificam comportamento observável. Um teste passa e o nome da função está errado.

## 2. Ambientes e dados

| Item | Configuração |
|---|---|
| Servidor | `npm run dev` ou `npm run start`, com `PORT` livre |
| Banco | PostgreSQL local, schema de `db/schema.sql` |
| Navegador | Google Chrome sem interface, dirigido pelo script |
| E-mail | `SMTP_HOST` **vazio**: nenhum e-mail real sai, o link é lido do log do servidor |
| Conta master | `ADMIN_MASTER_EMAILS` com um e-mail de teste |
| Dados | Criados por `semear.sh`, apagados por `limpar.sh` |

**Regra de isolamento:** semear antes de rodar. Dados de uma execução anterior confundem contagem e comparação. Se o resultado não bater com o esperado, `limpar.sh` e `semear.sh` vêm antes de qualquer investigação.

## 3. Casos de teste

### 3.1 Requisitos funcionais

| Req. | Caso | Camada | Arquivo ou grupo |
|---|---|---|---|
| **RF-01** | Entrar com conta Google | 2 | `fluxos.mjs` grupo `auth` |
| **RF-02** | Criar conta com email e senha; e-mail não confirmado não entra | 1, 2 | `auth-config.test.ts`, grupo `auth` |
| **RF-03** | Pedir e definir a senha pelo link do e-mail | 2 | grupo `auth` |
| **RF-04** | Entrar na turma por código de convite; código errado mostra erro | 2 | grupo `participante` |
| **RF-05** | Administrador em várias turmas escolhe a turma em uso | 2 | grupo `admin` |
| **RF-06** | Votar em escolha única e múltipla; opção exclusiva; mudar o voto | 1, 2 | grupo `app`, `fluxos.mjs` |
| **RF-07** | Relatório com totais e percentual, **sem** identificar quem votou | 1, 2 | grupo `app` |
| **RF-08** | Catálogo padrão disponível para toda turma | 2 | grupo `participante` |
| **RF-09** | Administrador vê quem votou e quem falta votar | 2 | grupo `admin` |
| **RF-10** | Criar, renomear e excluir catálogo personalizado | 2 | grupo `admin` |
| **RF-11** | Enviar dúvida de até 500 caracteres | 1, 2 | grupo `app` |
| **RF-12** | Votar na dúvida; ordenação por destaque, votos e data | 2 | grupo `app` |
| **RF-13** | Responder, destacar, reabrir e apagar dúvida | 1, 2 | grupo `admin` |
| **RF-14** | Contagem regressiva, data, local e programação | 1, 2 | `evento.test.ts`, `datas.test.ts`, grupo `app` |
| **RF-15** | Editar dados do evento e programação | 2 | grupo `admin` |
| **RF-16** | Tarefa com responsável, prazo e status; barra de progresso | 2 | grupo `app` |
| **RF-17** | Vitrine de fornecedores por categoria, com contato e imagem | 2 | grupo `app` |
| **RF-18** | Promover, rebaixar e remover membros | 1, 2 | grupo `admin` |
| **RF-19** | Ver, gerar e copiar código de convite | 1, 2 | `convite.test.ts`, grupo `admin` |
| **RF-20** | Master vê todas as turmas e usuários e gere membros | 1, 2 | `master.test.ts`, grupo `master` |
| **RF-21** | Master exclui turma e usuário com confirmação digitada | 1, 2 | `master.test.ts`, grupo `master` |

### 3.2 Regras de negócio

| Regra | Caso | Camada | Arquivo |
|---|---|---|---|
| **RN-01** | Relatório mostra totais; só o administrador vê o nome de quem votou | 1, 2 | `auth-config`, grupo `admin` |
| **RN-02** | Mudar voto apaga os votos da pergunta e grava os novos, em uma transação | 1 | `modelos.test.ts` |
| **RN-03** | Quem já tem turma, e não é administrador em nenhuma, não entra em outra | 1, 2 | grupo `participante` |
| **RN-04** | O único administrador não pode ser rebaixado, removido nem sair | 1, 2 | grupo `admin` |
| **RN-05** | Se o último membro sai, a turma é apagada | 1 | `modelos.test.ts` |
| **RN-06** | Login por senha só vale depois de confirmar o e-mail | 1, 2 | `auth-config.test.ts`, grupo `auth` |
| **RN-07** | No máximo 10 códigos errados a cada 15 minutos por usuário | 1, 2 | `convite.test.ts` |
| **RN-08** | Opção exclusiva desmarca as demais, e vice-versa | 1, 2 | grupo `app` |
| **RN-09** | Catálogo padrão é somente leitura e igual para todas as turmas | 1, 2 | grupo `admin` |

### 3.3 Requisitos não funcionais

| Caso | Como é verificado | Camada |
|---|---|---|
| Sem estouro horizontal em 360, 768, 1024, 1440, 1920 e 3840 px | `auditoria.mjs` mede `scrollWidth` | 3 |
| Nenhum erro no console nas telas principais | Cada grupo do `fluxos.mjs` acrescenta um passo de verificação | 2 |
| Alvo de toque mínimo de 44 px em celular | `auditoria.mjs` mede com emulação de toque abaixo de 1100 px | 3 |
| Foco visível e navegação por teclado | Grupo `extras` percorre a tela com o teclado | 2 |
| Gráfico do relatório tem alternativa textual | Leitor de tela | 4 |
| Estado vazio não esconde conteúdo quando a animação não monta | Grupo `extras` | 2 |
| E-mail descartável barrado e domínio sugerido | `email-validacao.test.ts` | 1 |
| Limite por tipo de ação (dúvida, voto a favor, aviso) | `modelos.test.ts` | 1 |

## 4. Execução e resultados

### 4.1 Testes unitários

```
Test Files  17 passed (17)
     Tests  186 passed (186)
  Duration  ~14 s
```

| Arquivo | Testes | Cobre |
|---|---|---|
| `auth-config.test.ts` | 14 | Confirmação de e-mail, sessão, confiança de origem |
| `convite.test.ts` | 13 | Código válido, inválido, limite de tentativas |
| `email-validacao.test.ts` | 12 | Domínio descartável, erro de digitação |
| `modelos.test.ts` | 21 | Transações de voto, remoção, turmas vazias |
| `master.test.ts` | 15 | Permissões e exclusões do master |
| `paginacao.test.ts` | 10 | Página, tamanho, ordenação estável |
| `busca.test.ts` | 8 | Busca e combinação com filtro |
| `presenca-regras.test.ts` | 14 | Regras de presença |
| `orcamento.test.ts` | 12 | Orçamento de terceiros |
| `evento.test.ts` | 13 | Dados do evento e programação |
| `datas.test.ts` | 11 | Datas e fuso de São Paulo |
| `tema.test.ts` | 9 | Tema claro, escuro e sistema |
| `email.test.ts` | 10 | Conteúdo dos e-mails e endereço |
| `vinculos.test.ts` | 8 | Vínculos entre turmas |
| `testes de limite por ação` | 18 | Tetos por tipo de ação |
| `testes de concorrência` | 8 | Trava de decisão e limite por IP |
| `testes de migração` | 10 | Schema e tabelas do Better Auth |

### 4.2 Testes de fluxo

| Grupo | Passos | Resultado |
|---|---|---|
| `auth` | 14 | Passando |
| `participante` | 11 | Passando |
| `app` | 16 | Passando |
| `admin` | 15 | Passando |
| `master` | 9 | Passando |
| `extras` | 10 | Passando com `npm run dev` |
| **Passos reais** | **75** | — |
| Verificação de console (6 × 1) | 6 | — |
| **Resumo** | **81** | **Todos passando** |

Tempo de execução: cerca de 4 minutos para os seis grupos.

### 4.3 Auditoria de responsividade

| Métrica | Esperado | Medido |
|---|---|---|
| Páginas auditadas | 30 | 30 |
| Larguras | 6 (360 a 3840 px) | 6 |
| Páginas com estouro horizontal | 0 | 0 |
| Alvos de toque abaixo de 32 px | 0 | 0 |
| Erros de console | 0 | 0 |

### 4.4 Regressões encontradas e corrigidas

| Defeito | Como apareceu | Correção |
|---|---|---|
| Voteiro perdia o restante das opções ao trocar de pergunta | Teste de fluxo `app` | Formulário único por catálogo |
| Estados vazios escondiam o conteúdo quando a animação não montava | Teste de fluxo `extras` | Conteúdo sempre presente, animação por cima |
| Dúvida de outra turma não podia ser apagada pelo participante | Teste de fluxo `admin` | Autor edita a própria; administrador modera qualquer uma |
| Convite sem limite permitia tentativas em massa | `convite.test.ts` | 10 tentativas a cada 15 minutos por usuário |
| Horário do evento aparecia em UTC | `datas.test.ts` | Tudo no fuso de São Paulo |
| Seleção ilegível no tema escuro | Auditoria de tela | Cores de opção ajustadas |

## 5. O que não é testado

Lacuna conhecida, com o motivo. Nenhuma delas está escondida.

| Lacuna | Motivo | Como fechar |
|---|---|---|
| Aparelho físico com leitor de ecrã | Não há aparelho Android com TalkBack disponível para a equipe | Testar em aparelho Android com TalkBack antes da entrega final |
| Carga real com muitas turmas | O escopo da disciplina não inclui teste de carga | Registrar como dívida técnica |
| Envio de e-mail com SMTP real | Nenhum servidor de e-mail de teste disponível; o teste usa o log | Configurar um serviço de e-mail descartável |
| Integração com Google em produção | Exige credenciais de cliente OAuth em domínio real | Já validado no ambiente de homologação |
| Restauração do banco a partir de backup | Não há procedimento de backup definido no Termo de Abertura | Definir o procedimento ou declarar que o projeto não tem |

## 6. Como rodar

```bash
# 1. Instalar e subir o banco
npm install
npm run db:schema

# 2. Subir o servidor sem e-mail real
mkdir -p scripts/teste/.tmp
SMTP_HOST= ADMIN_MASTER_EMAILS="teste-sh@example.invalid" \
  npm run dev > scripts/teste/.tmp/dev.log 2>&1

# 3. Dados de teste
scripts/teste/limpar.sh
scripts/teste/semear.sh

# 4. Rodar
npm test                                  # 186 testes unitários
node scripts/teste/fluxos.mjs             # 81 passos de fluxo
node scripts/teste/fluxos.mjs admin,master   # só alguns grupos
node scripts/teste/auditoria.mjs scripts/teste/.tmp/cookie.txt 360,768,1024,1920 /dashboard,/tarefas

# 5. Limpar
scripts/teste/limpar.sh
```

O CI roda `npm run typecheck` e `npm test` a cada `push` e a cada Pull Request, e bloqueia o merge se algum dos dois falhar.