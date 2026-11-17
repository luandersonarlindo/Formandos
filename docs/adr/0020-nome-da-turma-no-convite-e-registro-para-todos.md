# ADR-0020: Nome da turma no convite e registro para todos (itens 0.2 e 1.3 da rodada 2)

**Status:** Aceito
**Data:** 2026-11-16
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento-rodada-2.md`, itens 0.2 e 1.3 (ERS 2.0: RF-60 e RF-58). Temas 3 e 8 da rodada 2.

## Contexto

### O que as simulações dizem

- **Convite sem nome** (tema 3). Quem abre o link de convite não vê de qual turma ele é, e desconfia.
- **Registro só para a comissão** (tema 8). Formandos que desconfiam da comissão querem a prova consigo. 5 personas pediram isso.

### O que já existe

- **Convite:** `/convite` (`src/app/(onboarding)/convite/page.tsx`) recebe o código do link ou do cookie e só preenche o campo. `entrarPorConvite` conta tentativas em `tentativas_convite` (ADR-0002).
- **Registro:** `/admin/turma/registro` usa `exigirAdmin`. O conteúdo de `getRegistroTurma` (`src/lib/registro.ts`) já não tem dado pessoal, por desenho (ADR-0009).
- **Faixa de turma arquivada** no `AppShell` e email de exclusão da turma (`emailExclusaoTurma`).

### Forças em jogo

- **Ler o nome pelo código permite adivinhar turmas.** Um código válido não pode virar um jeito de listar turmas.
- **O registro é a prova do que a turma decidiu.** Se só a comissão tem, a prova depende de quem está sendo questionado.

## Decisão

### 1. Convite mostra o nome da turma

- Leitura nova `getTurmaPorCodigo(codigo)` em `src/lib/convite.ts`. Devolve só o nome da turma e o nome de quem criou.
- Na página, **só quando o código vem do link ou do cookie de convite**, aparece "Você foi convidado para a turma **X**" acima do botão "Entrar na turma".
- Código digitado no campo não mostra o nome.
- A leitura conta em `tentativas_convite`, no mesmo limite de `entrarPorConvite`.
- O assunto do email de convite fica como está. Cair no spam é questão de domínio e assinatura do remetente (SPF, DKIM), que só se resolve com a publicação.

### 2. Registro para todos os membros

- Rota nova `/registro` na área do membro (`src/app/(app)/registro/page.tsx`), com `exigirMembro`.
- O corpo da página da comissão vira o componente `RegistroTurma`, usado nas duas rotas. Mesmo layout de impressão.
- Link "Baixar o registro da turma" na faixa de turma arquivada e no email de exclusão da turma.
- **Liberado sempre**, e não só na turma arquivada. Decidido pelo grupo em 16/11/2026.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Mostrar o nome também para código digitado | Fica mais fácil descobrir turmas tentando códigos. |
| Não mostrar o nome e só melhorar o texto do convite | Não resolve a desconfiança do tema 3. |
| Registro só com a turma arquivada | Mais restrito, mas o conteúdo é o mesmo que a turma já vê em partes, e quem desconfia quer a prova durante o processo. |
| Registro como PDF gerado no servidor | O layout de impressão do navegador já funciona e não traz dependência nova. |

## Consequências

**Fica melhor**
- Quem recebe o convite sabe de qual turma é antes de entrar.
- Todo membro guarda a prova do que a turma decidiu.

**Fica pior ou mais difícil**
- Uma leitura nova antes do login, que precisa de limite.
- Uma tela a mais na área do membro.

**Arquivos**
- `src/lib/convite.ts` (`getTurmaPorCodigo`).
- `src/app/(onboarding)/convite/page.tsx`.
- `src/app/(app)/registro/page.tsx` (nova).
- `RegistroTurma` (componente extraído de `/admin/turma/registro`).
- `app-shell.tsx` (link na faixa) e `src/lib/email.ts` (`emailExclusaoTurma`).

**Teste de fluxo**
- Passo no E2E: o link de convite mostra o nome da turma; o código digitado não mostra.
- Passo no E2E: o participante abre `/registro`.
- A sonda de leitor de tela (`leitor.mjs`, ADR-0015) na tela nova.
