# ADR-0004: "Mandar para o grupo" — texto pronto para o WhatsApp (item 1.4)

**Status:** Aceito
**Data:** 2026-11-09
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 1.4 (achado A, "o site não avisa ninguém", que travou 10 das 10 simulações). Na simulação 10, o email quase não foi lido, e o texto pronto colado no grupo **foi o aviso que de fato circulou** (`docs/simulacoes/2026-11-08-7/relatorio.md`).

## Contexto

### O problema

A turma vive no grupo do WhatsApp. O site guarda avisos, votações, decisões e dados do evento, mas ninguém fica sabendo de nada se a comissão não for ao grupo e escrever de novo, à mão, o que já está no site. Na simulação 10:

- o quórum só bateu porque o presidente "marcou o povo no grupo e colou o link de novo duas vezes";
- uma persona da comissão disse que deixaria de "repetir valor/data/onde paga" no grupo e passaria a mandar o link;
- a crítica que ficou: a comissão continua sendo **o carteiro**. Este item não resolve isso (ver "Opções", envio automático), mas tira o trabalho de escrever e lembrar o que dizer.

### O que já existe

- `BotaoCopiar` (`src/components/features/botao-copiar.tsx`): copia um texto, com `montarTexto` rodando só no clique (para usar `window.location.origin` sem quebrar o SSR), estado "Copiado!" e mensagem para leitor de tela.
- `BotaoConvite` (`botao-convite.tsx`) já faz isso para o convite, com o link de `linkConvite` (ADR-0002).
- Depois da ADR-0002, quem abre um link do site sem estar logado volta para o mesmo endereço depois do login (`?voltar=`). Só a âncora (`#...`) se perde, porque o navegador não a envia ao servidor.
- Dados que entram nos textos:
  - aviso: `avisos (titulo, conteudo)`, lista em `/avisos` (não há página de um aviso só);
  - pergunta: título, opções com `valor_pessoa` e `link`, `regras_enquete (prazo, quorum_pct)` (ADR-0003), página `/votacoes/{catalogoId}`, onde o título de cada pergunta tem `id="enquete-{id}"`;
  - decisão: opções fixadas, `votantes`, `membros` e `justificativa` em `decisoes` (ADR-0003), mostradas no dashboard;
  - evento: nome, data, local e endereço (`getDadosEvento` / `getEventoAdmin`), mostrados no dashboard.
- Formatação de data e de reais: `src/lib/datas.ts` (fuso `America/Sao_Paulo`) e `formatarReal` (`src/lib/orcamento.ts`).

### Forças em jogo

- **Custo zero e sem infraestrutura:** o projeto não tem deploy, agendador nem conta paga.
- **Texto que funciona no grupo:** curto, com o que importa na primeira linha, link no fim, sem depender de imagem. Simulações 1 e 8 pediram texto simples por causa de leitor de tela.
- **Privacidade:** o texto vai para fora do site. Não pode levar quem votou em quê, nome de membro, email nem telefone.
- **A comissão no controle:** ela precisa ver o texto antes de mandar, e às vezes quer acrescentar uma linha ("gente, falta pouco!").

## Decisão

### 1. Textos montados por funções puras

Arquivo novo `src/lib/texto-whatsapp.ts`, com teste, sem banco e sem `window`. Cada função recebe os dados e a origem do site (`https://...`) e devolve o texto.

| Função | Texto (modelo) | Link |
|---|---|---|
| `textoAviso` | `*Aviso da comissão: {título}*` / `{conteúdo}` / `Ver no Formandos: {link}` | `/avisos` |
| `textoVotacao` | `*Votação: {pergunta}*` / `Fecha em {12/12 às 23:59}. Precisa de {60}% da turma votando.` / uma linha por opção, com `R$ 95,00 por pessoa` quando houver / `Já votaram {22} de {38}.` (ou `Ninguém votou ainda.`) / `Vote aqui: {link}` | `/votacoes/{catalogoId}#enquete-{id}` |
| `textoDecisao` | `*Decidido: {pergunta}*` / `Escolha da turma: {opção}` / `Votaram {22} de {38}.` / `Motivo da comissão: {justificativa}` (só se houver) / `Ver detalhes no Formandos: {link}` | `/dashboard` |
| `textoEvento` | `*Formatura: {nome da turma}*` / `Quando: {sábado, 19 de dezembro às 20:00}` / `Onde: {local}, {endereço}` / `Ver detalhes no Formandos: {link}` | `/dashboard` |

Regras comuns, todas testadas:

- Linha sem dado não aparece (sem prazo, sem quórum, sem valor, sem motivo, sem endereço).
- Só o asterisco de negrito do WhatsApp na primeira linha. Sem emoji obrigatório e sem imagem.
- Conteúdo de aviso longo é cortado em 700 caracteres com "…" e o link para ler o resto. O título nunca é cortado.
- Asteriscos, sublinhados e tis digitados pela comissão não são escapados. O WhatsApp não tem escape, e o pior caso é um trecho em negrito.
- **Nunca** entram nomes de pessoas, quem votou em quê, email ou telefone. Só contagens, que a turma já vê no site.
- Datas sempre no fuso de Brasília.

### 2. Um diálogo "Mandar para o grupo", com prévia editável

Componente novo `src/components/features/mandar-para-grupo.tsx` (cliente):

- Botão secundário com o ícone de compartilhar e o rótulo **"Mandar para o grupo"**.
- Abre um diálogo com o texto numa `Textarea` **editável**, já preenchido. A comissão pode acrescentar ou apagar linhas antes de mandar. O texto editado não é salvo em lugar nenhum.
- Dois botões:
  - **"Copiar texto"**: reaproveita a lógica do `BotaoCopiar` (Clipboard API, estado "Copiado!", aviso para leitor de tela, mensagem de erro com "selecione e copie à mão").
  - **"Abrir no WhatsApp"**: link `https://wa.me/?text={texto codificado}` em nova aba. No celular abre o app com o texto pronto para escolher o grupo; no computador abre o WhatsApp Web ou o app instalado.
- O texto é montado no clique (`window.location.origin`), como no `BotaoConvite`.

### 3. Onde aparece, e para quem

Só para a **comissão** (`papel = 'admin'`), porque é ela quem fala no grupo da turma. Quatro lugares:

| Lugar | Arquivo | Texto |
|---|---|---|
| Cada aviso em `/avisos`, na fileira de ações | `src/app/(app)/avisos/page.tsx` | `textoAviso` |
| Cada pergunta na tela da comissão | `src/app/(admin)/admin/votacoes/[catalogoId]/page.tsx` | `textoVotacao` |
| Card "Decisão da turma", quando há decisão | `src/app/(admin)/admin/votacoes/votos/[enqueteId]/page.tsx` | `textoDecisao` |
| Card "Dados do evento" | `src/components/features/evento-admin.tsx` | `textoEvento` |

As leituras já existentes trazem quase tudo. Falta só levar o `catalogoId` e as contagens para os pontos onde o texto é montado.

### 4. Sem banco, sem servidor novo, sem registro

Nada muda no esquema. Não há Server Action nova. O site não registra quem copiou nem quando: copiar não é uma ação sobre os dados da turma, e registrar daria um rastro sem uso.

## Opções consideradas

### Como o texto chega ao grupo

| Opção | Complexidade | Custo | Funciona onde | Prós | Contras |
|---|---|---|---|---|---|
| A. Só "Copiar" | baixa | zero | todo navegador moderno | já existe (`BotaoCopiar`) | no celular, a pessoa ainda precisa abrir o WhatsApp e achar o grupo |
| B. Só link `wa.me/?text=` | baixa | zero | celular e computador com WhatsApp | um toque abre o app com o texto | sem WhatsApp instalado ou logado, não serve; texto muito longo pode ser cortado pela URL |
| C. Menu nativo do celular (`navigator.share`) | baixa | zero | celular; no computador, só alguns navegadores | mostra todos os apps de mensagem | comportamento diferente em cada aparelho; no computador quase sempre falta |
| **D. Prévia editável + "Copiar" + "Abrir no WhatsApp" (escolhida)** | baixa | zero | todo lugar (copiar sempre funciona) | a comissão vê e ajusta o texto; um toque no celular; copiar como reserva | dois botões em vez de um |
| E. Envio automático (API oficial do WhatsApp Business) | alta | por conversa | — | tira a comissão do papel de carteiro | conta Business, modelos aprovados pela Meta, custo por mensagem, servidor no ar; o projeto não tem deploy. Fica no item 3.1 |

### Quem vê o botão

| Opção | Prós | Contras |
|---|---|---|
| **Só a comissão (escolhida)** | é quem fala no grupo; menos botões para quem só vota | um formando que quer mandar a decisão para a família precisa copiar à mão |
| Todos os membros | qualquer um repassa | mais ruído na tela; vários textos iguais no grupo |

Pode ser revisto sem custo: as funções de texto não dependem do papel.

### Onde montar o texto

| Opção | Prós | Contras |
|---|---|---|
| **Funções puras em `src/lib/` (escolhida)** | testáveis; mesmo texto em qualquer tela; reaproveitáveis no email do item 1.6 | os dados precisam chegar ao componente |
| Texto escrito dentro de cada componente | nada a passar | quatro textos divergindo com o tempo; sem teste |

## Análise de trade-offs

O que decide é o que as simulações mostraram: o email não é lido e o grupo é onde a turma está. Enquanto não houver envio automático (caro e fora do alcance sem deploy), o melhor que o site pode fazer é deixar o trabalho da comissão a um toque: texto certo, link certo, sem precisar lembrar prazo, quórum e preço de cada opção.

A prévia editável custa um diálogo, mas responde a duas coisas: a comissão confere o que vai sair antes de mandar para 60 pessoas, e pode dar o tom do grupo sem o site tentar adivinhar. Copiar fica sempre disponível porque o link `wa.me` depende de o WhatsApp estar instalado e logado.

O link com âncora (`#enquete-{id}`) se perde se a pessoa precisar fazer login no meio do caminho. Ela cai na página do catálogo, não na pergunta. É aceitável: a página tem a navegação por categoria, e quem já está logado (a maioria, no celular) vai direto à pergunta.

## Consequências

- **Fica mais fácil:** avisar a turma sem reescrever nada; cada aviso, votação, decisão e dado do evento chega ao grupo com o link para o site, o que leva gente para dentro (e o link de volta depois do login já funciona, ADR-0002).
- **Fica mais fácil também:** o item 1.6 (email só para o essencial) reaproveita as mesmas funções de texto, e o 2.2 (página pública do evento) só troca o link de `textoEvento`.
- **Fica mais difícil:** nada relevante. Quatro textos para manter, mas num arquivo só e com teste.
- **Não resolve:** a comissão continua sendo quem cola no grupo ("carteiro"). Isso é o item 3.1 (canal WhatsApp de verdade), que depende de deploy e custo.
- **Rever depois:** texto de mudança no evento ("mudou de 20h para 19h"), que precisa do histórico do evento (item 2.5); botão também para os membros, se a comissão pedir; link para um aviso específico, se um dia houver página de aviso.

## Ações

1. [x] `src/lib/texto-whatsapp.ts` (novo): `textoAviso`, `textoVotacao`, `textoDecisao`, `textoEvento`, com teste em `texto-whatsapp.test.ts` (linhas opcionais somem, corte do aviso longo, valor em reais, prazo no fuso de Brasília, link absoluto com a origem, nenhum nome de pessoa no texto).
2. [x] `src/components/features/mandar-para-grupo.tsx` (novo): botão "Mandar para o grupo", diálogo com `Textarea` editável, "Copiar texto" e "Abrir no WhatsApp" (`wa.me/?text=`). Extrair a cópia de `BotaoCopiar` para um hook (`useCopiar`) e usar nos dois, sem duplicar.
3. [x] `/avisos`: botão em cada aviso, só para a comissão.
4. [x] `/admin/votacoes/[catalogoId]`: botão em cada pergunta (precisa de opções com valor, regra e votantes, que `getCatalogoAdmin` já traz, e do total de membros).
5. [x] `/admin/votacoes/votos/[enqueteId]`: botão no card "Decisão da turma" quando há decisão (`getVotosEnquete` já traz decisão, justificativa e contagens).
6. [x] `evento-admin.tsx`: botão no card "Dados do evento", só quando há data ou local.
7. [x] Textos dos botões, do diálogo e dos modelos revisados com `design:ux-copy`.
8. [ ] Testar à mão no celular (360px): abrir o diálogo, editar, copiar, "Abrir no WhatsApp"; conferir o texto colado num grupo de teste.
9. [x] `npm run typecheck`, `npm test` e um passo novo em `scripts/teste/fluxos.mjs` (grupo `admin`): abrir o diálogo de uma pergunta e conferir a prévia (pergunta, prazo, valor e link).

### Andamento (2026-11-09)

Ações feitas, com uma pendência na 8.

- Ação 2: a cópia saiu de `BotaoCopiar` para o hook `src/hooks/use-copiar.ts`, usado também por `MandarParaGrupo`.
- Ação 4: o botão aparece só em pergunta ainda não decidida e não oculta. Pergunta decidida usa o texto da decisão, no card da decisão. `getCatalogoAdmin` passou a trazer `membros` e `decidida`.
- Ação 5: o texto usa os números do dia em que a decisão foi fixada (`decisoes.votantes` e `membros`), não a contagem atual.
- Ação 6: a data do evento vem como horário de Brasília ("AAAA-MM-DDTHH:mm") e é lida com `-03:00`; o Brasil não tem horário de verão desde 2019.
- Ação 7: textos revisados. Link no fim com rótulo uniforme ("Ver no Formandos", "Ver detalhes no Formandos", e "Vote aqui" na votação), "Ninguém votou ainda." em vez de "0 de N", e a descrição do diálogo diz que o texto mudado não fica salvo.
- Ação 8: diálogo conferido em 360px. A primeira versão usava o `Textarea` com `field-sizing-content`, e o link longo e sem espaço alargava a caixa e cortava o texto; agora o tamanho é fixo e o link quebra linha. Testado num grupo de WhatsApp de verdade, com o link `wa.me` aberto no celular (2026-11-09): funciona.
- Ação 9: `typecheck` e `npm test` passando (229 testes, 11 deles de `texto-whatsapp`). Passo novo "ADR-0004" no grupo `admin` de `fluxos.mjs` (prévia da pergunta e do aviso, link direto, contagem, link do WhatsApp, nenhum nome de membro): grupo com 25 de 31 no Docker, e as falhas são as que já existiam.

