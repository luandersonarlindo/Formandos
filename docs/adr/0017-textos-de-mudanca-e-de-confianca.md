# ADR-0017: Textos de mudança e de confiança (itens 0.1, 0.4 e 0.5 da rodada 2)

**Status:** Aceito
**Data:** 2026-11-16
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento-rodada-2.md`, Nível 0, itens 0.1, 0.4 e 0.5 (ERS 2.0: RF-56, RF-62 e RF-63). Temas 7, 9 e 10 da rodada 2. O item 0.6 (RF-70) foi descartado pelo grupo: ver a decisão 4.

## Contexto

### O que as simulações dizem

- **O texto do grupo não diz que algo mudou** (temas 7 e 9). No tema 9, 7 de 8 pessoas leram o texto colado no grupo, mas só desconfiou da mudança quem lembrava do horário antigo.
- **Medo de voto alterado** (tema 10). Personas perguntaram se a comissão pode mudar o voto de alguém. O site não diz que não.
- **Link público trocado** (tema 9). Quem abre um link antigo da página do evento vê só "não existe" e acha que o evento foi cancelado.
- **Gmail do encarregado** (tema 8). O encarregado de dados aparece com um endereço do Gmail. Mesmo sendo a conta do projeto, as personas leram como email pessoal.

### O que já existe

- `textoEvento` (`src/lib/texto-whatsapp.ts`) monta o texto do botão "Mandar para o grupo" com nome, "Quando", "Onde" e o link. O tipo `DadosEvento` não recebe a mudança.
- `getUltimaMudancaEvento` (`src/lib/evento-publico.ts`) devolve a última mudança de data, horário, local ou endereço dos últimos 14 dias (`DIAS_DESTAQUE_MUDANCA`). É o que alimenta o "Mudou em" do dashboard e da página pública.
- `AVISO_VISIBILIDADE_VOTO` (`src/lib/empresa.ts`) aparece em `/votacoes` e na tela de votar.
- `src/app/(publico)/evento/[token]/not-found.tsx` é a página de link inexistente.
- `DPO.email` (`src/lib/empresa.ts`) aparece em `/privacidade`, `/termos` e "Minha conta".

### Forças em jogo

- **O texto colado no grupo é o canal que chega** (ADR-0004, ADR-0016). Melhorar o texto vale mais que um email a mais.
- **Sem mudança no banco.** Tudo aqui é texto e uma função.
- **O link `wa.me` tem limite de tamanho.** A linha nova precisa ser curta.

## Decisão

### 1. O texto do grupo diz o que mudou

- `DadosEvento` ganha `mudanca?: { rotulo: string; antes: string; depois: string }[]`, no mesmo formato de `MudancaRecente.mudancas`.
- Quando houver mudança, `textoEvento` começa com uma linha por item: `*MUDOU:* horário era 20:00, agora é 19:00`.
- A janela é a mesma do "Mudou em": 14 dias. Quem monta os dados do botão do evento passa a chamar `getUltimaMudancaEvento`.
- A prévia editável do "Mandar para o grupo" continua: a comissão pode apagar a linha se quiser.
- Reaproveitar `umaLinha` e `juntar`, para não passar do limite do link.

### 2. Frase "ninguém muda o seu voto"

`AVISO_VISIBILIDADE_VOTO` ganha no fim: "Ninguém da comissão muda o seu voto. Mudanças em decisões ficam no histórico da turma."

Antes de mudar o texto, conferir no código que nenhuma ação altera o voto de outra pessoa. Hoje só `salvarVotos` (da própria pessoa) e a saída da turma mexem em votos.

### 3. Link público trocado

A página de "não encontrado" do evento passa a dizer: "Este link não existe, foi trocado ou foi desligado pela comissão. Peça o link novo a quem mandou."

### 4. O email do encarregado não muda (item 0.6 descartado)

`DPO.email` continua sendo o email do projeto que já está no site. O grupo decidiu, em 16/11/2026, não trocar o endereço. A crítica do tema 8 fica registrada aqui, sem mudança no código.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Guardar o código antigo do link público (`turmas.token_anterior`) para dizer "este link foi trocado" com certeza | Mantém um identificador a mais guardado. A frase genérica resolve o susto. |
| Mostrar a mudança só no email "Mudou" | A família lê o grupo e não recebe email. |
| Destacar a mudança no texto por mais de 14 dias | Diverge do "Mudou em" da tela. Duas janelas diferentes confundem. |
| Trocar o email do encarregado por um endereço com domínio próprio (item 0.6) | Descartado pelo grupo. O email atual já é do projeto, e um domínio só viria com a publicação. |

## Consequências

**Fica melhor**
- Quem lê o grupo vê o que mudou, sem lembrar do valor antigo.
- A turma lê, em letra clara, que o voto não é alterado.
- O link velho não parece evento cancelado.

**Fica pior ou mais difícil**
- O texto do grupo fica uma ou duas linhas mais longo quando há mudança.
- A frase do voto vira promessa: qualquer ação futura que mexa em voto de outra pessoa precisa mudar a frase junto.

**Arquivos**
- `src/lib/texto-whatsapp.ts` (`DadosEvento`, `textoEvento`) e `texto-whatsapp.test.ts`.
- O componente que monta os dados do botão do evento.
- `src/lib/empresa.ts` (`AVISO_VISIBILIDADE_VOTO`).
- `src/app/(publico)/evento/[token]/not-found.tsx`.

**Teste de fluxo**
- Casos novos em `texto-whatsapp.test.ts`: com mudança, sem mudança e com duas mudanças.
- Passo no E2E: salvar o horário novo e conferir a linha "MUDOU" no texto do botão.

### Andamento (2026-11-16)

Feita. Diferenças em relação ao texto acima:

- **De onde vem a mudança:** o dashboard já buscava `getUltimaMudancaEvento` para o "Mudou em". O mesmo resultado agora vai por props para `EventoAdmin`, que o passa ao "Mandar para o grupo". Nenhuma consulta nova.
- **Página de link trocado:** além do título "Este link não existe, foi trocado ou foi desligado", o texto diz que isso não quer dizer que o evento foi cancelado, que era o susto do tema 9.
- **Frase do voto, conferida no código:** nenhuma ação muda a escolha de outra pessoa. Os votos de alguém só somem quando a pessoa sai ou é removida da turma, ou quando a comissão a muda para observador (ADR-0012), e aí só os votos das perguntas ainda sem decisão. Opção com voto não pode ser removida. A frase continua verdadeira, mas qualquer ação nova que mexa em voto precisa rever o texto.
- Testes: `typecheck`, `npm test` (335; 3 novos em `texto-whatsapp.test.ts`). O passo "ADR-0008" do grupo `admin` em `fluxos.mjs` passou a conferir a linha "MUDOU" no texto do botão do evento e o texto novo do link trocado. Bloco `participante,app,admin` no Docker, 66 de 66.
