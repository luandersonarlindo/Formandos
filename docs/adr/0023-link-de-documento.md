# ADR-0023: Link de documento na decisão e no fornecedor (item 2.6 da rodada 2)

**Status:** Aceito
**Data:** 2026-11-21
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento-rodada-2.md`, Nível 2, item 2.6 (ERS 2.0: RF-65). Temas 2, 6 e 10 da rodada 2. Segundo da ordem que sobrou na simulação da tesoureira (`docs/simulacoes/2026-11-20/relatorio.md`), com as condições dela.

## Contexto

- Contrato e orçamento moram no Drive de alguém da comissão. A turma pergunta "cadê o contrato do buffet?" e a resposta é um print no grupo (temas 2, 6 e 10).
- O site não guarda arquivo, por decisão de escopo (levantamento da rodada 1, item 3.8): sem armazenamento, sem custo, sem dado pessoal novo guardado.
- As opções de votação já têm um link (orçamento, cardápio). A decisão e o fornecedor não têm.
- A tesoureira sintética usaria o link com três condições: só para quem está logado na turma; um aviso claro para conferir se o Drive está restrito; e saber quando o link foi colocado e por quem.

## Decisão

### 1. Dois campos

```sql
alter table decisoes add column if not exists link_documento varchar(500);
alter table fornecedores add column if not exists link_documento varchar(500);
```

Só `https://` (`ehLinkHttps`, o mesmo do link do mapa). Opcional nos dois.

### 2. Na decisão: a turma vê

- Campo "Link do documento (opcional)" no diálogo "Fixar decisão", com o aviso: "A turma inteira abre este link. Confira se o arquivo no Drive está restrito a quem tem o link e se não tem dado pessoal."
- O link aparece como "Ver documento" na decisão do dashboard e no registro da turma. As duas telas pedem login. A página pública do evento não mostra decisões.
- Quando e quem: a auditoria `decisao.fixada` já guarda quem fixou e quando. O detalhe passa a levar o link, e o histórico da turma mostra "Documento: …".

### 3. No fornecedor: só a comissão vê

- Campo "Link do documento (opcional)" no "Editar fornecedor", com o mesmo aviso.
- O link aparece só para admin, como o valor orçado. A consulta do participante não traz a coluna.
- Mudar o link entra em `fornecedor.alterado`, o histórico da comissão, com o antes e o depois.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Anexar o arquivo | Armazenamento, custo e dado pessoal guardado no site. Fora por escopo. |
| Conferir se o link do Drive é público | Exigiria chamar o Google. O aviso deixa a responsabilidade clara com quem cola. |
| Link do fornecedor visível para a turma | Contrato tem valor e dado de empresa; o valor orçado já é só da comissão. |

## Consequências

**Fica melhor**
- "Cadê o contrato?" se responde no site, para quem está na turma.
- O histórico mostra quem colocou o link e quando.

**Fica pior ou mais difícil**
- O site não sabe se o link quebrou ou se o Drive está aberto. O aviso é a única proteção.

**Arquivos**
- `db/schema.sql`; `src/actions/decisoes.ts`, `campos-fixar-decisao.tsx`, `/admin/votacoes/votos/[enqueteId]`; `src/lib/dashboard.ts` (`listarDecisoes`), o dashboard e `RegistroTurma`; `src/lib/historico-texto.ts`.
- `src/actions/terceiros.ts`, `src/lib/terceiros.ts`, `/terceiros`.

**Teste de fluxo**
- E2E: fixar com link e ver "Ver documento" no dashboard do participante; link sem https recusado; fornecedor com link aparece para a comissão e não para o participante.

### Andamento (2026-11-21)

Feita. Diferenças em relação ao texto acima:

- **`src/lib/link-documento.ts`** junta a leitura do campo (`lerLinkDocumento`), o limite de 500 caracteres e o aviso, usados na decisão e no fornecedor.
- **Link inválido na decisão** devolve o erro e não fixa nada; a justificativa digitada volta para o campo.
- **Registro da turma** mostra o endereço inteiro do link, para quem imprime.
- **O link vale para a decisão inteira:** fixar de novo (trocar a escolha) leva o link que estiver no campo, que já vem preenchido com o atual.
- Testes: `typecheck`, `npm test` (359; 4 novos em `link-documento.test.ts` e no histórico). Passo novo "ADR-0023" no grupo `admin` de `fluxos.mjs`: `http://` recusado sem fixar; com `https://`, o participante vê "Ver documento" no dashboard; o participante não vê o link do fornecedor; a comissão edita o link do fornecedor e a troca vai para o histórico. Bloco `participante,app,admin` no Docker, 71 de 71.
