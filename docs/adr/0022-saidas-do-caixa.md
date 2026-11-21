# ADR-0022: Saídas do caixa (item 2.1 da rodada 2)

**Status:** Aceito
**Data:** 2026-11-20
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento-rodada-2.md`, Nível 2, item 2.1 (ERS 2.0: RF-64). Temas 2 e 6 da rodada 2. Primeiro item da ordem que sobrou na simulação da tesoureira (`docs/simulacoes/2026-11-20/relatorio.md`), o único que passou forte pela entrevista e pela passada adversarial.

## Contexto

### O que as simulações dizem

- **O caixa só mostra o que entrou** (temas 2 e 6). "E o sinal do buffet?" leva a comissão de volta à planilha.
- **A tesoureira sintética (20/11/2026)** usaria as saídas como **espelho**: lança em 2 minutos depois de fechar a planilha. Pediu:
  - o saldo dizendo que é "confirmado menos saídas lançadas", e não saldo do banco;
  - a referência do Pix da saída, para casar com o extrato;
  - a ligação com o fornecedor ("contratado, pago, falta");
  - poder marcar uma saída (tarifa bancária, por exemplo) como só da comissão.
- Na passada adversarial, ela disse que não usaria se a saída fosse obrigatória ou virasse a "verdade" da turma.

### O que já existe

- `pagamentos` guarda só dinheiro que entra, sempre de uma pessoa. `getCaixa` (`src/lib/pagamentos.ts`) soma os confirmados.
- O caixa aparece em "Minha situação", no registro da turma e na tesouraria como "pagamentos confirmados pela tesouraria" (commit `f6bec35`).
- `fornecedores` tem `valor_orcado` e `status` (`contratado`, entre outros), visíveis só à comissão.
- A tesouraria (ADR-0005) é quem lança dinheiro. A auditoria separa o que a turma vê (`ACOES_VISIVEIS_TURMA`) do que só a tesouraria vê (`ACOES_SO_TESOURARIA`).

## Decisão

### 1. Tabela de saídas

```sql
create table if not exists saidas (
  id            uuid primary key default gen_random_uuid(),
  turma_id      uuid not null references turmas(id) on delete cascade,
  fornecedor_id uuid references fornecedores(id) on delete set null,
  descricao     varchar(200) not null,
  valor         numeric(10,2) not null check (valor > 0),
  pago_em       date not null,
  referencia    varchar(120),
  so_comissao   boolean not null default false,
  lancado_por   uuid references usuarios(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
```

Sem dado de pessoa. O fornecedor, quando há, precisa ser da mesma turma.

### 2. Quem lança

Só a tesouraria (`exigirTesourariaEditavel`), numa página própria, `/admin/tesouraria/saidas`: lançar, editar e excluir. Campos: descrição, valor, data, fornecedor (opcional, da lista da turma), referência do Pix (opcional) e "só da comissão". Nada é obrigatório para usar o site: a turma que não lança saídas continua vendo só o que entrou.

### 3. O que a turma vê (decisão do grupo)

- **Cada saída:** data, descrição, valor e o nome do fornecedor.
- **Saída "só da comissão":** a turma vê "Outras despesas" no lugar da descrição e não vê o fornecedor. **O valor sempre aparece e entra no total**, para o saldo da turma ser o mesmo da tesouraria.
- A referência do Pix fica só com a tesouraria.

### 4. Caixa com três números

Onde hoje aparece o caixa ("Minha situação", registro da turma e tesouraria):

- **Pagamentos confirmados pela tesouraria:** como hoje.
- **Saídas lançadas:** a soma das saídas.
- **Saldo:** confirmados menos saídas, com a frase "Não é o saldo do banco: é o que a tesouraria lançou no site."

Sem nenhuma saída lançada, o caixa fica como está hoje.

### 5. Fornecedor: contratado, pago e falta

Na página das saídas, só para a tesouraria: para cada fornecedor com saída ou marcado como contratado, o valor orçado, o pago (soma das saídas ligadas a ele) e o que falta. O valor orçado continua escondido da turma.

### 6. Histórico e planilha

- Ações novas na auditoria, **visíveis à turma** (é dinheiro da turma, não de pessoa): `saida.lancada`, `saida.editada`, `saida.excluida`. Na saída "só da comissão", o detalhe guardado diz "Outras despesas", e nunca a descrição.
- Planilha nova "Saídas" na exportação da comissão, com todas as colunas (inclusive descrição e referência).

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| A turma vê só os totais | Decisão do grupo: cada saída, sem dado de pessoa. O "e o sinal do buffet?" só se responde com a lista. |
| Esconder a saída inteira (valor também) | O saldo da turma ficaria diferente do da tesouraria, e uma saída sumida é o que gera desconfiança. |
| Não permitir "só da comissão" | Mais simples, mas a tesoureira pediu para despesas pequenas que viram briga (tarifa). O valor continua visível. |
| Saída como `pagamentos` com tipo novo | `pagamentos` é de uma pessoa (`usuario_id`) e entra na situação de cada um. Misturar quebraria `calcularSituacao`. |
| Anexar comprovante | Sem armazenamento de arquivo (mesmo motivo do item 2.6). A referência do Pix casa com o extrato. |

## Consequências

**Fica melhor**
- A turma vê para onde o dinheiro foi, sem perguntar à comissão.
- A tesouraria compara o pago com o contratado de cada fornecedor.
- O registro da turma passa a ter entrada, saída e saldo.

**Fica pior ou mais difícil**
- Mais um lugar para lançar. Se a tesouraria não lançar, o saldo fica maior que o real; a frase do saldo diz que é o que foi lançado.
- "Outras despesas" pode gerar a pergunta "o que é isso?". A resposta continua com a comissão.

**Arquivos**
- `db/schema.sql`.
- `src/lib/saidas.ts` (leitura e regras), `src/lib/pagamentos.ts` (`getCaixa`).
- `src/actions/saidas.ts` (lançar, editar, excluir).
- `/admin/tesouraria/saidas` (nova), `/admin/tesouraria`, `/minha-situacao`, `RegistroTurma` e `src/lib/registro.ts`.
- `src/lib/auditoria-acoes.ts`, `src/lib/historico-texto.ts`, `src/lib/exportacao.ts`.

**Teste de fluxo**
- Unitário: o que a turma vê de uma saída "só da comissão"; a conta de contratado, pago e falta; o texto do histórico.
- E2E (grupo `admin`): a tesouraria lança duas saídas (uma ligada a fornecedor, outra só da comissão); o participante vê o saldo, a saída do fornecedor e "Outras despesas" sem a descrição; a tesouraria edita e exclui; o histórico e a planilha mostram a saída.

### Andamento (2026-11-20)

Feita. Diferenças em relação ao texto acima:

- **"Minha situação" só mostra o caixa com plano de parcelas**, como antes. Uma turma com saídas e sem plano vê as saídas no registro da turma, não em "Minha situação".
- **As saídas aparecem num `<details>`** ("Ver as saídas (N)") dentro do card do caixa, para não alongar a tela de quem só quer a própria situação.
- **"Por fornecedor"** entra quem está marcado como contratado ou tem alguma saída. Sem valor orçado, "contratado" e "falta" aparecem como "—". Pagar além do orçado dá falta zero, nunca negativa.
- **Planilha "Saídas do caixa"** para qualquer admin da comissão (não só a tesouraria): não tem valor de pessoa.
- Testes: `typecheck`, `npm test` (355; 7 novos em `saidas-regras.test.ts` e no histórico). Passo novo "ADR-0022" no grupo `admin` de `fluxos.mjs`: a tesouraria lança uma saída ligada a fornecedor e outra só da comissão; contratado, pago e falta; o participante vê saldo e "Outras despesas", sem a descrição escondida nem referência, em "Minha situação" e no registro; correção e exclusão no histórico; planilha. Bloco `participante,app,admin` no Docker, 70 de 70.
