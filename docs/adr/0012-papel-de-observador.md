# ADR-0012: Papel de observador na turma (item 3.2)

**Status:** Aceito
**Data:** 2026-11-13
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 3.2 (achado L, "todos os admins podem tudo", em 3 de 10 simulações). Nas simulações 1, 2 e 3, professores e orientadores (Danielle, Luana, Socorro) não se acharam na divisão comissão/aluno: não querem administrar igual aos alunos nem votar como formando. A simulação 3 (`docs/simulacoes/2026-11-07-3/relatorio.md`) pediu três papéis: administrador pleno, tesoureiro e observador somente leitura.

## Contexto

### O que já existe

- **Dois papéis:** `membros.papel` aceita `admin` e `participante` (`check` no `db/schema.sql`). `alterarPapel` em `src/actions/admin.ts` troca entre os dois, nunca deixa a turma sem administrador e grava `papel.trocado` na auditoria.
- **Tesouraria já existe** (ADR-0005): `membros.tesouraria` marca o admin que cuida do dinheiro. `exigirTesouraria` protege `/admin/tesouraria`; os outros admins não veem quanto cada pessoa pagou. `alternarTesouraria` liga e desliga a marca em um admin e grava `papel.tesouraria`.
- **Quem pode alterar:** as ações de formando usam `exigirMembroEditavel` (votar, dúvidas, presença, tarefa, "Já paguei"). As da comissão usam `exigirAdminEditavel`.
- **A turma é contada pelos membros:** quórum e "X de Y votaram" (`votacoes.ts`, `admin.ts`, `relatorio.ts`, `decisoes.ts`, `dashboard.ts`), "Ainda não votaram" (`getVotosEnquete`), parcelas e caixa (`pagamentos.ts`), lembretes de prazo (`lembretes.ts`).
- **Várias turmas:** só quem é admin em alguma turma pode entrar em outra (`podeEntrarEmOutraTurma` em `src/lib/vinculos.ts`).

### Forças em jogo

- **O professor não é formando:** se entra como participante, conta no quórum, aparece em "Ainda não votaram", recebe parcela e lembrete. Se entra como admin, pode apagar e fixar decisão.
- **Dois dos três papéis pedidos já estão prontos:** administrador e tesouraria. Falta o observador.
- **Pouco código novo:** o levantamento previa trocar a coluna `tesouraria` por um papel no `check`. A coluna funciona e está testada; trocar não entrega nada a quem usa.

## Decisão

### 1. Terceiro papel: `observador`

```sql
alter table membros drop constraint if exists membros_papel_check;
alter table membros add constraint membros_papel_check
  check (papel in ('admin', 'participante', 'observador'));
```

- Nome na tela: **"Observador"**, com a explicação "Acompanha a turma sem votar e sem pagar. Para professor, orientador ou coordenador."
- A tesouraria **continua** como marca em um admin (`membros.tesouraria`). Não vira papel. É a diferença desta ADR para o que o levantamento previa.

### 2. O que o observador vê e faz

| Área | Observador |
|---|---|
| Dashboard, decisões, histórico da turma, avisos, evento | vê |
| Votações | vê as perguntas e os totais; não vota |
| Dúvidas, tarefas, fornecedores | vê; não envia, não apoia, não assume tarefa |
| Presença | **confirma a própria presença** e acompanhantes |
| Minha situação (dinheiro) | não tem; o menu não aparece |
| Área da comissão (`/admin`) | não entra |

- Regra em uma frase: **o observador só lê; a única coisa que preenche é a própria presença**, porque o professor vai à festa e o buffet precisa do número.
- No servidor: função nova `exigirFormandoEditavel()` em `src/lib/dal.ts` (membro que não é observador, turma não arquivada). Passam a usá-la: votar, dúvidas (enviar, editar, apagar, apoiar), assumir tarefa e "Já paguei". A presença continua com `exigirMembroEditavel`.
- Na tela: as opções de voto aparecem travadas com o texto "Você acompanha esta turma como observador e não vota."; os botões de enviar dúvida e de apoiar não aparecem.

### 3. O observador não entra na conta da turma

Regra única em **`src/lib/papeis.ts`** (arquivo novo, sem banco): constante SQL `CONTA_COMO_FORMANDO = "papel <> 'observador'"` e as funções `ehObservador`, `rotuloPapel`.

| Onde | Com observador |
|---|---|
| Quórum, "X de Y votaram", participação no dashboard | fora da conta |
| "Ainda não votaram" | não aparece |
| Parcelas, "Minha situação", caixa da turma, lista da tesouraria | fora |
| Lembretes de prazo de votação e de parcela | não recebe |
| Lista de membros, planilha de membros | aparece, com o papel |
| Presença (painel e total para o buffet) | conta |
| Emails "Decidido", "Mudou no evento" e de exclusão da turma | recebe |
| Fotografia da decisão (`decisoes.membros`) | passa a contar só formandos |

### 4. Como alguém vira observador

- O convite continua igual: quem entra, entra como participante. Em `/admin/membros`, a troca de papel passa de dois para três valores (administrador, participante, observador).
- **De participante para observador:** os votos da pessoa nas perguntas abertas são apagados, com aviso no diálogo ("Os votos de {nome} serão apagados."). Voto em pergunta já decidida não muda a decisão: a fotografia fica.
- **Com dinheiro lançado** (pagamento informado ou confirmado), a troca é recusada: "{nome} tem pagamentos lançados. A tesouraria resolve antes." Assim nenhum valor some sem a tesouraria ver.
- **De admin para observador:** vale a regra de hoje, a turma nunca fica sem administrador; a marca de tesouraria cai junto.
- A troca grava o `papel.trocado` que já existe (`de`, `para`), visível no histórico da comissão.

### 5. Observador em várias turmas

- `podeEntrarEmOutraTurma` passa a aceitar quem é **admin ou observador** em alguma turma. Um professor acompanha mais de uma turma.
- Ao entrar em outra turma pelo convite, a pessoa entra como participante e a comissão dessa turma troca o papel.

### 6. Fora desta ADR

- Papel de secretário e permissões por função (cada admin escolher o que pode). Pedido em 1 simulação; exigiria uma tabela de permissões.
- Observador vendo a área da comissão (quem votou em quê, tesouraria). O pedido foi acompanhar, não auditar.
- Entrar já como observador por um link próprio. Fica para depois, se a troca manual incomodar.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Trocar a coluna `tesouraria` por um papel `tesoureiro` (plano do levantamento) | Mexe em todo o código da ADR-0005 (ações, consultas e telas da tesouraria), que funciona, para o mesmo resultado na tela. |
| Marca `observador boolean` em vez de papel | Permitiria "admin observador", combinação sem sentido; papel único é mais fácil de explicar e de testar. |
| Professor como participante, sem papel novo | Ele entra no quórum, na cobrança e em "Ainda não votaram"; foi a queixa das três personas. |
| Professor sem conta, usando só a página pública do evento (ADR-0008) | Não vê votações, decisões nem histórico, que é o que pediu para acompanhar. |
| Permissões configuráveis por pessoa | Tela e tabela novas para um grupo de 4 manter; nenhum pedido concreto além dos três papéis. |

## Consequências

**Fica melhor**
- Professor e orientador acompanham sem pesar no quórum nem na cobrança, e sem poder de comissão.
- Os três papéis pedidos na simulação 3 passam a existir: administrador, tesouraria e observador.
- A regra "quem conta como formando" fica em um lugar só.

**Fica pior ou mais difícil**
- Cerca de 10 consultas que contam membros ganham o filtro; esquecer uma faz o número divergir entre telas.
- Mais um estado para testar em cada ação de formando.
- Virar observador apaga votos; a troca precisa de confirmação clara.

**Arquivos**
- `db/schema.sql`; `src/lib/papeis.ts` (novo, com teste); `src/lib/dal.ts`, `src/lib/vinculos.ts`; `src/actions/admin.ts`, `votos.ts`, `duvidas.ts`, `tarefas.ts`, `tesouraria.ts`; `src/lib/votacoes.ts`, `admin.ts`, `relatorio.ts`, `dashboard.ts`, `pagamentos.ts`, `lembretes.ts`, `exportacao.ts`; `src/actions/decisoes.ts`; `/admin/membros`, `enquete-card.tsx`, telas de dúvidas e tarefas, `app-shell.tsx` (menu), área master (rótulo do papel).

**Teste de fluxo**
- Passo novo: tornar a Maria observadora; conferir que o quórum e "Ainda não votaram" não a contam, que ela não consegue votar nem enviar dúvida, que confirma presença, e que a troca é recusada para quem tem pagamento lançado.

### Andamento (2026-11-14)

Tudo feito. Diferenças em relação ao texto acima:

- **Filtro em função, não constante:** `contaComoFormandoSql(apelido)` em `src/lib/papeis.ts`, porque metade das consultas usa a tabela com apelido (`m.papel`). `podeEntrarEmOutraTurma` continuou em `src/lib/vinculos.ts`, onde já tinha teste.
- **Troca de papel num lugar só:** `trocarPapel` em `src/lib/troca-papel.ts`, usada pela comissão (`alterarPapel`) e pela gestão da plataforma (`alterarPapelMaster`). Antes o código era copiado nos dois.
- **Um diálogo para os dois sentidos** em `/admin/membros`: "Tornar observador" e "Voltar a participante". Com dois diálogos separados, o primeiro sumia da tela depois da troca e levava a confirmação junto.
- **Admin não vira observador direto pela tela:** passa por participante (dois cliques). O servidor aceita a troca direta.
- **Tela da gestão da plataforma:** mostra o rótulo "Observador", mas não ganhou botão próprio para a troca.
- **Ao virar observador**, além dos votos em perguntas abertas, as tarefas da pessoa ficam sem responsável e os informes de pagamento recusados são apagados. O `papel.trocado` guarda `votosApagados`.
- **Voto em pergunta já decidida fica**, como previsto. Efeito: nessa pergunta o total de votos pode passar em 1 o número de formandos de hoje. A fotografia da decisão (`decisoes`) não muda.
- **Dashboard da comissão:** "Membros" e "Presença confirmada" contam todo mundo; "Participação nas votações" usa só os formandos (`formandos` em `ResumoAdmin`).
- **Votação travada por propriedade** (`somenteLeitura` no `EnqueteCard`), não por um `fieldset` em volta do formulário.
- **Dúvidas:** o observador também não vê "Editar dúvida" nas que escreveu antes de virar observador.
- Testes: `typecheck`, `npm test` (305, 4 novos em `papeis.test.ts` e `vinculos.test.ts`). Passo "ADR-0012" no grupo `admin` de `fluxos.mjs`; bloco `participante,app,admin` no Docker, 63 de 63; grupo `master`, 6 de 6. Votações, dúvidas (como observador) e `/admin/membros` conferidos em 360px.
