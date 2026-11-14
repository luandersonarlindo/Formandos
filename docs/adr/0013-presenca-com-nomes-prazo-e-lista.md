# ADR-0013: Presença com nome dos acompanhantes, prazo e lista da portaria (item 3.3)

**Status:** Aceito
**Data:** 2026-11-14
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 3.3 (achado N, em 2 de 10 simulações). Na simulação 8 (`docs/simulacoes/2026-11-08-5/relatorio.md`, semana da festa), 6 de 8 personas apontaram "acompanhante sem nome; sem lista nominal para imprimir". A lista da portaria saiu da planilha, copiada à mão, e dois nomes estavam errados na noite simulada. O painel "não separa adulto e criança" e "não tem prazo"; o fechamento foi "na mão". 3 personas reclamaram de que baixar o limite corta acompanhante sem avisar. Na simulação 3, a secretária da comissão pediu o nome de cada acompanhante.

## Contexto

### O que já existe

- **Resposta de presença** (`presencas`): status (`vou`, `talvez`, `nao`), **quantidade** de acompanhantes e observação livre. `responderPresenca` em `src/actions/presenca.ts`; o formulário é `form-presenca.tsx`, aberto no dashboard.
- **Limite por turma** (`turmas.max_acompanhantes`). `salvarLimiteAcompanhantes` baixa o limite e **corta** as respostas acima dele, sem avisar a pessoa.
- **Painel da comissão** (`/admin/presenca`, `src/lib/presenca.ts`): total esperado (quem vai + acompanhantes), filtros por resposta, lista paginada.
- **Planilha de presença** (`src/lib/exportacao.ts`, ADR-0007): uma linha por membro, com a quantidade.
- **Registro da turma para imprimir** (`/admin/turma/registro`, com `BotaoImprimir` e classes `print:`).
- **Lembretes** (`src/lib/lembretes.ts`, ADR-0006): rodada de hora em hora, com `lembretes_enviados` para não repetir.
- **Observador** (ADR-0012) também confirma presença.
- **ADR-0011:** a conta é de adulto, e a comissão não deve registrar dados de crianças além do necessário para o evento.

### Forças em jogo

- **A portaria trabalha com nomes;** o buffet, com números separados em adulto e criança (o preço é diferente).
- **Nome de acompanhante é dado de terceiro**, às vezes de criança. Só entra o mínimo.
- **Respostas já dadas não podem sumir** quando a regra muda.
- **O número precisa fechar numa data,** senão a comissão continua fechando na planilha.

## Decisão

### 1. Cada acompanhante tem nome e tipo

```sql
create table if not exists acompanhantes (
  id         uuid primary key default gen_random_uuid(),
  turma_id   uuid not null,
  usuario_id uuid not null,
  nome       varchar(80) not null,
  tipo       varchar(10) not null default 'adulto' check (tipo in ('adulto', 'crianca')),
  ordem      smallint not null default 0,
  foreign key (turma_id, usuario_id) references presencas (turma_id, usuario_id) on delete cascade
);
```

- No formulário, o campo "Quantos acompanhantes você leva?" vira uma **lista**: cada linha tem **nome** e **adulto ou criança**, com "Adicionar acompanhante" até o limite da turma e "Remover" em cada linha.
- `presencas.acompanhantes` continua existindo e guarda a quantidade, gravada na mesma transação que a lista. Assim os totais do painel, do dashboard e do registro não mudam de consulta.
- Só nome e tipo. Sem idade, documento, telefone ou restrição alimentar. A observação livre continua.
- Com "talvez" ou "não vou", a lista é apagada, como hoje a quantidade é zerada.

### 2. Respostas antigas continuam valendo

- Quem já respondeu "vou com 3" antes desta mudança fica com 3 no total e **sem nomes**. Nada é apagado.
- O card do dashboard mostra para essa pessoa: "Faltam os nomes de 3 acompanhantes", com o botão "Informar nomes".
- No painel e na lista da portaria, eles aparecem como "Acompanhante de {nome} (sem nome)".

### 3. Prazo para responder

```sql
alter table turmas add column if not exists presenca_ate timestamptz;  -- nulo = sem prazo
```

- A comissão escolhe a data em `/admin/presenca` ("Prazo para confirmar presença"), ao lado do limite de acompanhantes.
- O formando vê no card: "Responda até dd/mm, HH:MM".
- **Depois do prazo a resposta trava.** O card mostra "A lista fechou em dd/mm. Para mudar, fale com a comissão." e `responderPresenca` recusa. Quem não respondeu fica como "sem resposta".
- A comissão reabre mudando ou apagando a data. A mudança vai para a auditoria (`presenca.prazo`, antes e depois), em `ACOES_VISIVEIS_TURMA`.
- **Lembrete por email** 2 dias antes do prazo, para quem ainda não respondeu ou marcou "talvez". Usa a rodada que já existe, com o tipo novo `presenca` em `lembretes_enviados`, e respeita quem desligou os emails. Passa a ser o 5º email da turma (ADR-0006 tinha 4).

### 4. Baixar o limite não corta mais ninguém

- `salvarLimiteAcompanhantes` deixa de reduzir as respostas. Quem já tinha mais acompanhantes que o limite novo **mantém** todos.
- O painel marca essas respostas com "acima do limite" e mostra a contagem: "2 respostas acima do limite novo". A comissão conversa com a pessoa.
- Quem estiver acima do limite e abrir o formulário pode remover nomes, mas não adicionar.
- O total esperado continua verdadeiro o tempo todo.

### 5. Lista da portaria e resumo para o buffet

- **Página para imprimir** `/admin/presenca/lista`, no padrão de `/admin/turma/registro`: uma linha por **pessoa** (formandos, observadores e acompanhantes), em ordem alfabética, com as colunas Nome, Tipo e "Convidado de". No topo, o resumo: total de pessoas, adultos e crianças, e a data e hora em que a lista foi gerada.
- **Planilha nova** "Lista da portaria" em `exportacao.ts`, com as mesmas colunas. A planilha "Presença" que já existe continua igual.
- O painel `/admin/presenca` passa a mostrar o total separado: "{n} pessoas: {a} adultos e {c} crianças". Acompanhante sem nome conta como adulto e aparece numa linha à parte ("{k} sem nome informado").
- Só entra na lista quem respondeu "vou". "Talvez" aparece só no painel.

### 6. Privacidade

- Quem vê os nomes: a própria pessoa e a comissão. A turma e a página pública do evento (ADR-0008) não veem.
- Os nomes somem junto com a resposta: ao sair ou ser removido da turma, ao excluir a conta e ao excluir a turma (cascata).
- A exportação dos próprios dados em `/conta` passa a incluir os acompanhantes informados.
- A Política ganha a frase: "Para a lista de entrada do evento, guardamos o nome dos acompanhantes que você informar e se cada um é adulto ou criança. Só você e a comissão veem."

### 7. Fora desta ADR

- QR code, check-in na portaria e pagamento de acompanhante extra (item 3.8 do levantamento).
- Restrição alimentar em campo próprio: é dado de saúde (sensível, LGPD art. 11). Continua na observação livre, se a pessoa quiser escrever.
- A comissão editar a resposta de outra pessoa. Depois do prazo, a saída é reabrir.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Só a quantidade, com os nomes na observação (como hoje) | Foi o que gerou a cópia à mão e os nomes errados na portaria. |
| Apagar a coluna `presencas.acompanhantes` e contar as linhas | Muda todas as consultas de total e perde as respostas antigas, que não têm nomes. |
| Obrigar quem já respondeu a informar os nomes para continuar contando | Tiraria gente do total do buffet sem ninguém ter mudado de ideia. |
| Continuar cortando ao baixar o limite, com email de aviso | Com nomes, cortar é o sistema escolher qual convidado sai. 3 personas rejeitaram o corte. |
| Prazo só como texto de aviso, sem trava | O número não fecha; a comissão continuaria conferindo na planilha. |
| Idade em vez de adulto/criança | Dado a mais, de menor; o buffet só precisa da faixa. |

## Consequências

**Fica melhor**
- A lista da portaria sai do site, sem cópia à mão.
- O buffet recebe adultos e crianças separados.
- O número fecha numa data combinada, e a turma vê a data.
- Ninguém perde acompanhante sem saber.

**Fica pior ou mais difícil**
- O formulário de presença fica mais longo para quem leva gente.
- O site passa a guardar nome de terceiros, inclusive de crianças.
- Mais um email para a turma.
- Respostas acima do limite passam a existir e a comissão precisa resolver conversando.

**Arquivos**
- `db/schema.sql`; `src/lib/presenca-regras.ts` (regras puras e testes), `src/lib/presenca.ts`; `src/actions/presenca.ts`; `form-presenca.tsx`, card de presença do dashboard; `/admin/presenca` (prazo, total por tipo, "acima do limite"), `/admin/presenca/lista` (nova); `src/lib/exportacao.ts`, `src/lib/lembretes.ts`, `src/lib/email.ts`, `src/lib/usuarios.ts` (exportar meus dados), `src/lib/auditoria-acoes.ts`, `src/lib/historico-texto.ts`; `/privacidade`.

**Entrega em duas partes**
1. Nomes e tipo, respostas antigas, limite sem corte, lista da portaria e planilha.
2. Prazo com trava e lembrete por email.

**Teste de fluxo**
- Parte 1: responder com dois acompanhantes (um adulto, uma criança), ver o total por tipo no painel, baixar o limite e conferir que ninguém foi cortado, abrir a lista e a planilha da portaria.
- Parte 2: marcar o prazo, forçar a data para ontem, conferir a trava na tela e a recusa do servidor, e o lembrete no Mailpit.

### Andamento (2026-11-14)

As duas partes feitas. Diferenças em relação ao texto acima:

- **Linha sem nome é erro, não some:** ao salvar, cada linha da lista precisa de nome ("Informe o nome de cada acompanhante ou remova a linha"). Quem tem resposta antiga e abre o formulário vê as linhas em branco já abertas, uma por acompanhante que tinha.
- **O botão do card muda de nome** para "Informar nomes" enquanto faltar nome em resposta antiga.
- **Acima do limite:** `vagasDeAcompanhante` (em `presenca-regras.ts`) dá o maior entre o limite da turma e o que a pessoa já tinha. A mesma função vale na tela e no servidor.
- **Recusa depois do prazo sem recarregar a página:** quem abriu o formulário antes do prazo e enviou depois lê a mensagem no diálogo. Recarregando, o card travado tirava o formulário e a mensagem sumia junto.
- **Mudar o prazo apaga as marcas do lembrete**, para o email sair de novo para a data nova. O observador também recebe o lembrete, porque também confirma presença.
- **Lista da portaria:** coluna "Tipo" com "Formando", "Observador", "Acompanhante (adulto)" e "Acompanhante (criança)". Quem é da comissão aparece como "Formando". A página mostra quantos ficaram fora (em dúvida e sem resposta).
- **Planilha "Presença"** (ADR-0007) continua igual, só com a quantidade. Os nomes saem na planilha nova, "Lista da portaria".
- **Teste antigo trocado:** o passo "limite de acompanhantes escolhido pelo admin corta as respostas acima" testava o comportamento que esta ADR removeu. Virou o passo da Parte 1.
- Testes: `typecheck`, `npm test` (313; 8 novos em `presenca-regras.test.ts`). Dois passos "ADR-0013" no grupo `admin` de `fluxos.mjs` e o passo de presença do grupo `participante` adaptado; bloco `participante,app,admin` no Docker, 64 de 64. Formulário de acompanhantes, `/admin/presenca` e `/admin/presenca/lista` conferidos em 360px.
