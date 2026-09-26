# Visão do Produto

| | |
|---|---|
| **Projeto** | Formandos — gestão administrativa de formaturas e eventos |
| **Marco do cronograma** | 08/09/2026 (Termo de Abertura + visão do produto + papéis) |
| **Versão** | 1.0 — elaborada em 26/09/2026 |
| **Equipe** | Luanderson Arlindo, Luiz Orlando, José Renato e Vinícius |
| **Repositório** | https://github.com/luandersonarlindo/Formandos |

## 1. Declaração de visão

> **Para** comissões organizadoras e formandos de uma turma  
> **que** precisam decidir e organizar juntos a formatura,  
> **o Formandos** é um **aplicativo web de gestão de formaturas e eventos**  
> **que** reúne votações, dúvidas, tarefas, programação e fornecedores em um só lugar.  
> **Diferente de** grupos de mensagens e planilhas,  
> **o nosso produto** dá voz a toda a turma com votos que viram relatório, responde dúvidas uma única vez e mostra à comissão quem falta participar.

## 2. O problema e a oportunidade

Organizar uma formatura exige decisões coletivas (local, comida, música, traje) e muita comunicação. Em grupos de mensagens as opiniões se perdem, quem fala mais decide, as dúvidas se repetem e ninguém sabe o que já foi combinado. **A oportunidade** é transformar a preferência da turma em **dado**, organizado por categoria, e centralizar a comunicação e as tarefas.

## 3. Público-alvo e personas

| Persona | Quem é | Dor | O que ganha |
|---|---|---|---|
| **Comissão organizadora** (administrador) | Representantes da turma e professores que organizam a festa | Decidir sem dados, responder a mesma pergunta várias vezes, acompanhar tarefas | Relatório de preferências, moderação de dúvidas, tarefas com responsável e prazo |
| **Formando** (participante) | Aluno que vai se formar | Não sabe o que foi decidido, acha que sua opinião não conta | Vota, pergunta, vê a programação e a contagem regressiva |
| **Gestor da plataforma** (master) | Quem mantém o sistema | Precisa apoiar várias turmas | Visão de todas as turmas e usuários |

## 3.1. Cenários de uso

1. **Decidir o local:** a comissão publica as enquetes, os formandos votam em uma semana e o relatório mostra que 46% preferem salão de festas. A decisão sai com números, não com discussão.
2. **Tirar dúvidas:** um formando pergunta o prazo para enviar as fotos; outros dez votam na mesma dúvida; a comissão responde uma vez e a resposta fica visível para todos.
3. **Acompanhar a preparação:** a comissão cadastra a tarefa "Contratar o fotógrafo" com responsável e prazo, e todos veem o progresso no dashboard.

## 4. Proposta de valor

- **Participação de todos:** votos por categoria com opções descritivas (nada de "sim ou não").
- **Decisão baseada em dados:** relatório automático com gráficos e a opção mais votada em destaque.
- **Transparência e organização:** dúvidas respondidas em um lugar; tarefas com responsável; programação e contagem regressiva à vista.
- **Simplicidade:** entra-se por convite, com a conta Google ou por email e senha; funciona no celular, no notebook e até na TV.

## 5. Principais funcionalidades

| Grupo | Funcionalidades |
|---|---|
| Acesso | Login Google ou email e senha; confirmação de email; código de convite; várias turmas para administradores |
| Decisão | Catálogo padrão (8 categorias) e catálogos personalizados; escolha única, múltipla e opção neutra; alterar voto; relatório com gráficos |
| Comunicação | Dúvidas com votos e moderação (responder, destacar, apagar) |
| Organização | Dashboard, programação, tarefas, terceiros |
| Administração | Membros e papéis, convite, dados do evento; painel master |

## 6. Diferenciais

- **Voto identificado com privacidade no relatório:** a comissão vê quem votou (para cobrar participação), mas o relatório da turma só mostra totais.
- **Catálogo padrão pronto:** toda turma começa com 16 perguntas bem pensadas, sem precisar montar do zero.
- **Inspiração no Letmeask:** o módulo de dúvidas ordena pelas mais votadas.
- **Um só lugar:** decisão, comunicação e organização no mesmo app.

## 7. Metas do produto

| Meta | Indicador |
|---|---|
| Tornar as decisões mais participativas | Percentual de membros que votaram (visível ao administrador) |
| Reduzir dúvidas repetidas | Dúvidas respondidas em relação às enviadas |
| Manter a preparação em dia | Percentual de tarefas concluídas |

## 8. O que o produto NÃO é

- Não é um sistema de pagamentos, contratos ou venda de ingressos.
- Não substitui o contato com fornecedores: apenas os divulga.
- Não é uma rede social: cada turma é um espaço privado, acessado por convite.

## 9. Restrições e premissas da visão

- Produto acadêmico, sem hospedagem em produção neste ciclo.
- Foco em turmas de ensino superior, mas o modelo serve a qualquer evento coletivo.
- A evolução prevista (tema escuro, edição de perguntas, integração contínua) está no *Sprint Backlog*.
