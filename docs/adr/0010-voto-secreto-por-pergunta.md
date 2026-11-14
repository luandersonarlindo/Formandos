# ADR-0010: Voto secreto por pergunta (item 3.7)

**Status:** Aceito
**Data:** 2026-11-12
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 3.7 (achado H, "a comissão vê quem votou em quê", em 4 de 10 simulações). Os pedidos foram opostos: parte das personas quer que ninguém veja a escolha (perguntas de dinheiro e de formato da festa), parte da comissão quer continuar conferindo voto por voto. Em 12/11/2026 o grupo decidiu: **secreto por pergunta**, com o padrão igual ao de hoje.

## Contexto

### O que já existe

- **Voto com nome:** a tabela `votos` liga cada voto à conta (`usuario_id`). Isso é necessário para garantir um voto por pessoa e para a pessoa trocar o voto.
- **Quem vê o quê hoje:** a turma vê só os totais. A comissão vê, em `/admin/votacoes/votos/[enqueteId]`, o nome de cada pessoa em cada opção e a lista "Ainda não votaram" (`getVotosEnquete` em `src/lib/admin.ts`).
- **Exportação:** a planilha "Votos (quem votou em quê)" (`src/lib/exportacao.ts`, ADR-0007) traz o nome de quem votou em cada opção.
- **Aviso ao formando:** `AVISO_VISIBILIDADE_VOTO` em `src/lib/empresa.ts` ("Os administradores da turma veem em qual opção você votou. A turma vê só os totais."), mostrado em `/votacoes` e `/votacoes/[catalogoId]`.
- **Regra por turma:** `regras_enquete` (ADR-0003) guarda prazo e quórum de cada pergunta para cada turma. Vale também para perguntas do catálogo padrão. `salvarRegraEnquete` grava a mudança na auditoria (`regra.alterada`), que a turma vê no histórico.

### Forças em jogo

- **Pressão sobre o voto:** em pergunta de dinheiro, quem sabe que a comissão vê a escolha vota com a maioria ou não vota.
- **Conferência:** a comissão usa a lista nominal para cobrar quem falta e para tirar dúvida quando alguém reclama do resultado.
- **Promessa verdadeira:** "secreto" só pode ser escrito na tela se nenhuma tela e nenhum arquivo mostrar a escolha.
- **Pouco código:** a regra por turma já existe; a mudança deve caber nela.

## Decisão

### 1. Uma opção a mais na regra da pergunta

```sql
alter table regras_enquete add column if not exists secreto boolean not null default false;
```

- O diálogo de regra da pergunta (onde hoje ficam prazo e quórum) ganha a caixa **"Voto secreto"**, com a explicação: "Ninguém vê a escolha de cada pessoa, nem a comissão. Continua aparecendo quem já votou e quem falta."
- Sem linha em `regras_enquete`, ou com `secreto = false`, a pergunta funciona como hoje.
- `salvarRegraEnquete` passa a apagar a linha só quando prazo, quórum **e** secreto estão vazios.

### 2. O segredo só muda enquanto ninguém votou

- Ligar ou desligar "Voto secreto" só é aceito se a pergunta ainda não tem voto nesta turma. Com voto, a caixa aparece travada com o texto "Já existem votos. Esta opção não pode mais mudar."
- Motivo de travar o **desligar**: quem votou confiando no segredo não pode ser exposto depois.
- Motivo de travar o **ligar**: a comissão já pode ter visto os nomes; escrever "secreto" a partir daí seria falso.
- Prazo e quórum continuam podendo mudar a qualquer momento, como na ADR-0003.
- A mudança entra no `regra.alterada` da auditoria (`antes` e `depois` ganham `secreto`), que a turma já vê no histórico.

### 3. O que a comissão vê numa pergunta secreta

| Informação | Pergunta normal | Pergunta secreta |
|---|---|---|
| Total por opção | sim | sim |
| Nomes em cada opção | sim | **não** |
| Quem já votou (lista única, em ordem alfabética) | sim | sim |
| Quem ainda não votou | sim | sim |

- `getVotosEnquete` passa a ler `secreto`. Quando é secreto, a consulta devolve só a contagem por opção e a lista de quem votou, sem ligar pessoa a opção. O filtro fica no servidor: o nome por opção não chega ao navegador.
- A página `/admin/votacoes/votos/[enqueteId]` mostra o selo "Voto secreto" e, no lugar dos nomes em cada opção, só o número.
- A decisão (fixar, justificativa, fotografia em `decisoes`) não muda: ela já trabalha com totais.

### 4. Exportação

- Na planilha "Votos", as linhas de pergunta secreta saem com **"(voto secreto)"** na coluna "Quem votou" e com a coluna "Votou em" vazia. A hora fica de fora porque, junto com a lista de quem votou, ajudaria a descobrir a escolha.
- O registro da turma em PDF (`src/lib/registro.ts`) já mostra só totais; não muda.
- A exportação dos próprios dados em `/conta` continua mostrando o voto da própria pessoa: o dado é dela.

### 5. O que o formando vê

- Na pergunta secreta aparece o selo **"Voto secreto"** com o texto "Ninguém vê sua escolha, nem a comissão. Aparece só que você votou."
- `AVISO_VISIBILIDADE_VOTO` passa a ser: "Os administradores da turma veem em qual opção você votou, menos nas perguntas com voto secreto. A turma vê só os totais."
- "Copiar para o WhatsApp" (ADR-0004) inclui "Voto secreto." no texto da pergunta quando for o caso.

### 6. Limites que ficam escritos

- **No banco o voto continua ligado à conta.** É o que permite um voto por pessoa e a troca de voto. O segredo vale para telas e arquivos; quem administra o servidor (o grupo do Formandos) tecnicamente consegue consultar. A Política de Privacidade passa a dizer isso em uma frase.
- **Turma pequena ou resultado unânime:** se todos votaram na mesma opção, o total revela a escolha. Não há como evitar com totais abertos.
- **Acompanhar o total ao vivo:** quem olha o total e a lista de quem votou a cada voto consegue deduzir escolhas. Aceito como limite; esconder os totais até o prazo fica fora desta ADR.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Como hoje (comissão sempre vê) | Não atende quem pediu segredo; em pergunta de dinheiro o voto fica sob pressão. |
| Sempre secreto | A comissão perde a conferência nominal nas perguntas em que ela ajuda. |
| Sempre aberto para a turma | Aumenta a pressão sobre o voto; nenhuma simulação pediu isso de forma majoritária. |
| Voto sem `usuario_id` (anônimo no banco) | Impede trocar o voto e garantir um voto por pessoa sem um esquema de token; complexidade alta para um grupo de 4. |
| Esconder totais até o prazo | Fecha o limite do "total ao vivo", mas muda a tela de resultado de todas as perguntas; pode virar ADR própria se as próximas simulações pedirem. |

## Consequências

**Fica melhor**
- A comissão escolhe, pergunta a pergunta, entre conferência e segredo.
- A promessa escrita na tela bate com o que as telas e os arquivos mostram.
- A turma vê no histórico quando uma pergunta foi marcada como secreta.

**Fica pior ou mais difícil**
- Em pergunta secreta a comissão não consegue tirar dúvida sobre o voto de uma pessoa.
- Mais um caminho em `getVotosEnquete` e na exportação para manter e testar.

**Arquivos**
- `db/schema.sql` (coluna), `src/actions/catalogos.ts` (`salvarRegraEnquete`), `src/lib/admin.ts` (`getVotosEnquete`, regra da pergunta), `src/lib/votacoes.ts` (selo para o formando), `src/lib/exportacao.ts`, `src/lib/texto-whatsapp.ts`, `src/lib/empresa.ts`, diálogo de regra e página de votos do admin, `/privacidade`.

**Teste de fluxo**
- Passo novo: marcar secreto sem votos; votar; conferir que a página do admin e a planilha não trazem nome por opção; tentar desligar com votos e receber a recusa.

### Andamento (2026-11-13)

Tudo feito. Diferenças em relação ao texto acima:

- O botão do diálogo deixou de se chamar "Prazo e quórum" e passou a "Regra da votação", porque agora guarda três coisas.
- Com voto na pergunta, a caixa "Voto secreto" aparece travada e um campo escondido mantém o valor atual no envio. Assim prazo e quórum continuam mudando sem desligar o segredo. Quem força o envio sem o campo recebe a recusa do servidor.
- O voto passou a pegar, em modo compartilhado, a mesma trava que `salvarRegraEnquete` pega em modo exclusivo (`turma:enquete`). Não entra voto entre a conferência "ninguém votou" e a troca do segredo.
- `getVotosEnquete` lê a regra antes dos votos. Em pergunta secreta a consulta já agrupa por opção e não busca nome. O tipo `VotosEnquete` ganhou `votos` em cada opção e a lista `votaram`.
- A página de votos da comissão mostra o card "Já votaram" só em pergunta secreta. Na pergunta normal os nomes já aparecem dentro de cada opção.
- Texto em "Mandar para o grupo": "Voto secreto: ninguém vê sua escolha, nem a comissão."
- Histórico: "voto secreto ligado" ou "voto secreto desligado" na frase de `regra.alterada`.
- Testes: `typecheck`, `npm test` (301). Passo "ADR-0010" no grupo `admin` de `fluxos.mjs`; bloco `participante,app,admin` no Docker, 62 de 62. Diálogo, página de votos e card do formando conferidos em 360px.
