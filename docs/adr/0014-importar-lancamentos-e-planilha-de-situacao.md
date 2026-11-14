# ADR-0014: Importar lançamentos da planilha e planilha de situação (item 3.4)

**Status:** Aceito
**Data:** 2026-11-14
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 3.4 (achado E). Na simulação 10 (`docs/simulacoes/2026-11-08-7/relatorio.md`), três personas (Patrícia, tesoureira; Igor, presidente; e Bárbara) apontaram "registro duplo na tesouraria": o site "não tem pagamento parcial, nem pagamento de terceiro, nem juros, nem importação ou exportação", então "o controle de verdade continua na planilha" e alguém confere uma contra a outra. A recomendação 8 do relatório: "exportar a turma e as parcelas e importar a planilha da tesouraria" (4 personas). Na simulação 7, 2 personas pediram exportar e importar planilha.

## Contexto

### O que a simulação 10 testou e o que existe hoje

A simulação 10 avaliou um pacote **descrito**, antes de a ADR-0005 ser implementada. Três das cinco faltas apontadas já foram resolvidas no código:

| Falta apontada | Hoje |
|---|---|
| Pagamento parcial e duas parcelas juntas | **Existe.** Os lançamentos são soltos e `calcularSituacao` aplica o valor nas parcelas em ordem de vencimento (ADR-0005). |
| Pagamento de terceiro ("pai com outro nome") | **Existe.** Campo "Quem pagou" (`pagamentos.pago_por`). |
| Exportação | **Existe.** Planilha "Pagamentos" (ADR-0007), só para a tesouraria, uma linha por lançamento. |
| Importação | **Falta.** Cada pagamento é lançado um a um em `/admin/tesouraria/[usuarioId]`. |
| Juros | **Falta, e continua fora** (ver "Fora desta ADR"). |

### Outras peças

- `lancarPagamento` (`src/actions/tesouraria.ts`) grava o lançamento já confirmado e registra `pagamento.lancado` na auditoria, visível só para a tesouraria.
- **Convite por lista** (ADR-0007): a comissão cola linhas da planilha num campo, vê a prévia e confirma (`lerListaConvites`, `form-convites-lista.tsx`). É o padrão de colagem que o site já usa.
- `lerValorPessoa` (`src/lib/opcao-detalhe.ts`) lê valores como "150" e "150,50".
- `listarSituacoes` (`src/lib/pagamentos.ts`) calcula plano, pago, falta e estado de cada formando para a tela da tesouraria. Não há planilha com esse resumo.
- Observador (ADR-0012) não tem pagamentos.

### Forças em jogo

- **A tesouraria já tem meses de pagamentos na planilha** quando começa a usar o site. Lançar um a um é o que mantém o registro duplo.
- **Dinheiro não admite importação pela metade:** uma planilha meio importada é pior que nenhuma.
- **Colar duas vezes não pode dobrar o caixa.**
- **Pouco código:** sem leitor de arquivo `.xlsx`, sem biblioteca nova.

## Decisão

### 1. Importar por colagem, em `/admin/tesouraria`

- Botão **"Importar da planilha"**, só para a tesouraria, com um campo de texto grande. A tesouraria copia as linhas da planilha dela e cola.
- Uma linha por pagamento, com as colunas nesta ordem, separadas por **tabulação** (como sai do Excel e do Google Planilhas ao copiar) ou por **ponto e vírgula**:

```
email ; valor ; data ; forma ; quem pagou ; referência
```

- **Obrigatórias:** email, valor e data. As outras três são opcionais.
- **Email** identifica a pessoa. Nome não serve: há homônimos e apelidos. Precisa ser de um formando da turma.
- **Valor:** `150`, `150,50`, `R$ 1.250,00`. Sempre maior que zero.
- **Data:** `15/03/2026` ou `2026-03-15`. Não pode ser no futuro.
- **Forma:** pix, dinheiro, transferência ou outro. Vazia vira pix.
- A primeira linha é ignorada se for cabeçalho (primeira coluna sem "@").
- Vírgula não separa colunas, porque é o separador de centavos.
- Até **500 linhas** por vez.

### 2. Prévia obrigatória, e tudo ou nada

- Um formulário com dois botões, como no convite por lista: **"Ver prévia"** e **"Importar"**.
- A prévia mostra: quantas linhas serão lançadas, a soma em reais, quantas pessoas, quantas linhas já existem (item 3) e a **lista de linhas com problema**, cada uma com o número da linha e o motivo ("email não é de um formando desta turma", "valor inválido", "data inválida", "data no futuro", "forma desconhecida").
- **Com qualquer linha com problema, nada é importado.** A tesouraria corrige na planilha e cola de novo.
- O texto colado não é guardado; só os lançamentos criados.

### 3. Colar de novo não duplica

- Antes de gravar, cada linha é comparada com os lançamentos **confirmados** que já existem: mesma pessoa, mesmo valor e mesma data.
- Se a planilha traz 2 linhas iguais e o site já tem 1, entra só 1. Se já tem 2, não entra nenhuma. Assim dois pagamentos iguais no mesmo dia continuam possíveis, e colar a planilha inteira todo mês é seguro.
- A prévia diz: "12 linhas já estão lançadas e ficam de fora."

### 4. O que é gravado

- Cada linha vira um lançamento do tipo **pagamento**, já **confirmado**, com a tesouraria que importou em "lançado por" e "confirmado por". Devolução e ajuste continuam sendo feitos à mão, um a um.
- Sem referência na linha, grava "Importado da planilha".
- Tudo numa transação só.
- Auditoria: **uma** entrada `pagamento.importado` (quantidade, soma e pessoas), na lista que só a tesouraria vê (`ACOES_SO_TESOURARIA`). Não se grava uma entrada por linha.
- "Minha situação" de cada pessoa e o caixa da turma mudam na hora. Nenhum email é enviado.

### 5. Planilha "Situação por pessoa"

- Tipo novo em `src/lib/exportacao.ts`, só para a tesouraria, como "Pagamentos": uma linha por formando com **Nome, Email, Plano (R$), Pago (R$), Falta (R$), Situação, Parcelas vencidas, Aguardando confirmação**.
- Usa o mesmo cálculo da tela (`listarSituacoes`), para o número da planilha ser o da tela.
- Serve para conferir o site contra a planilha da tesouraria de uma vez, em vez de pessoa por pessoa.

### 6. Fora desta ADR

- **Juros e multa calculados pelo site.** Cada turma combina uma regra diferente; hoje ela fica escrita em "Regras do dinheiro" (ADR-0005) e a diferença entra como ajuste. Calcular exigiria configurar taxa, carência e arredondamento.
- **Enviar arquivo** `.xlsx` ou `.csv`. Colar resolve o mesmo caso sem biblioteca nova nem upload.
- **Importar o plano de parcelas** e **importar devoluções ou ajustes.**
- **Desfazer uma importação** com um botão. Cada lançamento pode ser corrigido pelo caminho que já existe.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Não fazer: lançar um a um | Mantém o registro duplo; foi a queixa das 3 personas. |
| Identificar a pessoa pelo nome | Homônimos, apelidos e acentos diferentes; um erro lança dinheiro na pessoa errada. |
| Importar as linhas boas e pular as ruins | A tesouraria teria de descobrir o que entrou e o que não entrou; com dinheiro, tudo ou nada é mais seguro. |
| Sempre gravar tudo, sem comparar com o que existe | Colar duas vezes dobraria o caixa. |
| Recusar qualquer linha igual a uma existente | Impede dois pagamentos iguais no mesmo dia, que acontecem (dois irmãos, duas parcelas). |
| Upload de arquivo `.xlsx` | Biblioteca nova, upload e validação de arquivo para o mesmo resultado da colagem. |
| Uma entrada de auditoria por linha | 300 linhas iguais escondem o resto do histórico; o lançamento já guarda quem lançou e quando. |

## Consequências

**Fica melhor**
- A tesouraria traz os meses anteriores de uma vez e pode colar a planilha de novo sem medo.
- Uma planilha só para conferir a situação de todos.
- A ADR registra que pagamento parcial, de terceiro e exportação já existem.

**Fica pior ou mais difícil**
- A tesouraria precisa arrumar as colunas na ordem pedida e ter o email de cada pessoa na planilha.
- Um erro numa linha segura a importação inteira.
- Um lançamento errado na planilha entra errado no site; não há "desfazer tudo".

**Arquivos**
- `src/lib/importar-pagamentos.ts` (novo, sem banco, com testes): lê o texto e monta a prévia. `src/actions/tesouraria.ts` (`importarPagamentos`), `src/components/features/form-importar-pagamentos.tsx` (novo), `/admin/tesouraria`; `src/lib/exportacao.ts` e `/admin/turma` (planilha nova); `src/lib/auditoria-acoes.ts`, `src/lib/historico-texto.ts`.
- Banco: nada.

**Teste de fluxo**
- Colar 3 linhas, uma com email de fora: prévia mostra o problema e nada entra. Corrigir, ver a prévia e importar: caixa e "Minha situação" batem. Colar de novo: "já estão lançadas" e nada muda. Baixar a planilha de situação e conferir o valor pago.

### Andamento (2026-11-14)

Tudo feito. Diferenças em relação ao texto acima:

- **Prévia e erros em texto:** o resultado aparece numa frase abaixo do formulário, como no convite por lista. Com problema, a mensagem lista até 12 linhas ("Linha 4: email não é de um formando desta turma (…).") e diz quantas faltam.
- **Formas aceitas além das quatro:** "espécie" vira dinheiro; "TED" e "DOC" viram transferência. Maiúsculas e acentos não importam.
- **Data anterior a 2000 é recusada**, junto com data que não existe e data no futuro.
- **Linha com menos de três colunas** vira problema ("faltam colunas"), inclusive quando a pessoa separou por vírgula.
- **A comparação com o que já existe olha só lançamentos do tipo pagamento, confirmados.** Devolução, ajuste e informe aguardando não contam como repetidos.
- **Trava no banco** (`importar:{turma}`): duas importações ao mesmo tempo esperam a vez, e a segunda já enxerga o que a primeira gravou.
- **Planilhas só da tesouraria** viraram uma lista, `TIPOS_SO_TESOURARIA` em `exportacao.ts` ("pagamentos" e "situacao"), usada pela rota e pela tela `/admin/turma`.
- `listarSituacoes` foi dividida: `todasSituacoes` calcula todos, e a tela e a planilha usam o mesmo resultado.
- O card "Importar da planilha" traz o link para baixar a lista de membros com os emails e o botão da planilha de situação. Não aparece em turma arquivada.
- Testes: `typecheck`, `npm test` (325; 12 novos em `importar-pagamentos.test.ts`). Passo "ADR-0014" no grupo `admin` de `fluxos.mjs`; bloco `participante,app,admin` no Docker, 65 de 65. `/admin/tesouraria` conferida em 360px.
