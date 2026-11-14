# ADR-0016: Canal oficial no WhatsApp — avaliação (item 3.1)

**Status:** Aceito
**Data:** 2026-11-14
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 3.1 (achado A, "o site não avisa ninguém", em 10 de 10 simulações). O item pede só a avaliação: "avaliar custo e regras da API oficial". Esta ADR não traz código.

## Contexto

### O que as simulações dizem

- A turma vive no **grupo** do WhatsApp. Na simulação 8, o site virou consulta e o WhatsApp, o alarme.
- Na simulação 10, o email quase não foi lido. O texto pronto colado no grupo foi o aviso que circulou.
- A crítica que ficou depois da ADR-0004: a comissão continua sendo **o carteiro**. Alguém precisa lembrar de abrir o site, copiar e colar.

### O que já existe

- **"Mandar para o grupo"** (ADR-0004): texto pronto com prévia editável, "Copiar" e `wa.me/?text=`. Sem integração, sem custo. Testado num grupo real.
- **Cinco emails** (ADR-0006 e ADR-0013): decisão, mudança no evento, prazo de votação, prazo de parcela e prazo de presença. Rodada de lembretes de hora em hora, com `lembretes_enviados` para não repetir e teto diário.
- O site **não guarda telefone** de ninguém (`db/schema.sql`).
- O projeto **não está hospedado**: roda em Docker local. É gratuito, sem receita, mantido por alunos.

### Como funciona a API oficial

Levantado em 14/11/2026. Os valores vêm de páginas de terceiros que reproduzem a tabela da Meta de outubro de 2026; a página oficial de preços não foi lida. **Conferir na Meta antes de qualquer decisão de gasto.**

| Ponto | Como é |
|---|---|
| Quem pode mandar | Uma conta comercial, com um número só dela. Esse número deixa de funcionar no aplicativo comum do WhatsApp. |
| Primeira mensagem | Só com **modelo aprovado** pela Meta antes. Texto livre só nas 24 horas depois de a pessoa escrever para o número. |
| Consentimento | A pessoa precisa ter aceitado receber mensagens daquele número, antes do primeiro envio. |
| Categoria do modelo | *Utilidade* (aviso sobre algo que a pessoa pediu ou combinou), *marketing* (o resto) e *autenticação*. Quem classifica é a Meta. |
| Preço no Brasil | Utilidade: cerca de US$ 0,0068 por mensagem (perto de R$ 0,035). Marketing: cerca de US$ 0,0625 (perto de R$ 0,32), nove vezes mais. Cobrança por mensagem entregue, a cada pessoa. |
| Limite inicial | 250 conversas iniciadas pela conta a cada 24 horas, enquanto a conta é nova. As fontes divergem sobre o que é preciso para subir. |
| Parte técnica | O site chama a API para enviar e precisa de um **endereço público com HTTPS** para receber o retorno (entregue, lida, bloqueada, resposta). |
| Grupos | Existe uma API de grupos, mas só para conta com selo oficial (o selo verde, que não vem com a verificação comum). O grupo é **criado pela conta**, com no máximo **8 participantes**. A conta não entra em grupo que já existe. |

### Forças em jogo

- **O canal que funciona é o grupo, não a conversa individual.** A API oficial não posta no grupo da turma.
- **Custo zero** é condição do projeto desde a ADR-0001.
- **Telefone é dado pessoal novo.** Hoje o site guarda nome e email.
- **Sem hospedagem, não há retorno da API.**

## Decisão

### 1. Não adotar a API oficial agora

O "Mandar para o grupo" (ADR-0004) continua sendo o canal do WhatsApp. Os cinco emails continuam.

Os motivos, em ordem de peso:

1. **Não chega no grupo.** Uma turma tem de 30 a 60 pessoas; o grupo da API tem 8 e exige o selo oficial. O que a API entrega é mensagem **individual**, de um número desconhecido, para cada formando. As simulações apontaram o grupo como o lugar do aviso; mensagem individual de número comercial é outro canal, que ninguém testou.
2. **Não tem onde rodar.** Precisa de endereço público com HTTPS, e o projeto fica só no Docker local.
3. **Exige telefone e consentimento de cada pessoa.** Campo novo no cadastro, base legal, texto na Política, exclusão e exportação. E quem não informar o telefone fica fora, do mesmo jeito que hoje fica quem não lê email.
4. **Tem custo, e o custo pode multiplicar por nove.** Ver a conta abaixo. Se a Meta classificar um modelo como marketing ("Nova votação aberta!" pode ser lido assim), o preço muda sem o site mudar.
5. **Depende de aprovação de terceiro.** Cada texto novo passa pela Meta. Conta nova, de projeto de alunos, sem site publicado, tem chance real de ficar presa na verificação.

### 2. Conta de custo, para registro

Estimativa, com a tabela de utilidade (R$ 0,035 por mensagem):

| Cenário | Mensagens | Custo |
|---|---|---|
| Turma de 60, só os lembretes de prazo e mudança no evento (cerca de 10 avisos no ano) | 600 | cerca de R$ 21 |
| Turma de 60, um aviso por decisão das 23 perguntas do catálogo padrão, mais os 10 acima | 1.980 | cerca de R$ 70 |
| O mesmo, classificado como marketing | 1.980 | cerca de R$ 640 |

Por turma o valor é baixo. O problema não é o tamanho: é que hoje é zero, não há receita, e quem pagaria é o responsável pelo MEI. Fora o número de telefone dedicado e a hospedagem.

### 3. Bibliotecas não oficiais ficam proibidas

Ferramentas que automatizam o WhatsApp Web (do tipo que lê o QR code e manda mensagem como se fosse uma pessoa) entram em qualquer grupo e não custam nada. Não serão usadas:

- violam os Termos do WhatsApp, e o número pode ser banido sem aviso;
- o número banido seria o de alguém da comissão ou do grupo;
- quebram a cada atualização do WhatsApp;
- o site passaria a ter acesso a **todas** as conversas daquele número.

### 4. Quando reabrir esta decisão

Reavaliar se **as três** condições forem verdade:

1. o site estiver publicado, com endereço HTTPS fixo;
2. turmas reais estiverem usando, e a comissão disser que copiar e colar não basta (evidência de gente de verdade, não de simulação);
3. houver quem pague, e o custo estiver escrito nos Termos ou combinado com a turma.

Ou se a API de grupos passar a aceitar grupos do tamanho de uma turma sem o selo oficial.

### 5. Se for reaberta, por onde começar

Registrado para não refazer a análise:

- **Só três avisos**, todos de utilidade e individuais: prazo de votação para quem não votou, prazo de parcela, mudança no evento. Os mesmos que já saem por email. Decisão fixada continua no grupo, pela comissão.
- **Canal por pessoa**, escolhido em `/conta`: email, WhatsApp ou nenhum. Telefone só para quem escolher WhatsApp, com o texto de consentimento na hora.
- **Mesmo motor:** `src/lib/lembretes.ts` e `lembretes_enviados` já decidem quem recebe o quê e não repetem. O envio sai de `src/lib/email-turma.ts` para uma camada com dois canais, como o levantamento previu (`notificacoes.ts`).
- **Teto diário próprio**, como o do email, para o gasto ter limite.

### 6. Fora desta ADR

- Melhorar o "Mandar para o grupo" (lembrete para a comissão de que há algo para mandar, por exemplo). Se as próximas simulações ou o uso real pedirem, vira item próprio.
- Telegram, SMS e notificação do navegador. Nenhuma simulação pediu.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| API oficial, mensagem individual, já | Motivos 1 a 5 da seção 1. |
| API oficial de grupos | Selo oficial e limite de 8 participantes. |
| Biblioteca não oficial que entra no grupo | Seção 3. |
| Provedor intermediário (empresa que revende a API com painel pronto) | Mesmas regras e mesmo preço da Meta, mais mensalidade. Resolve a parte técnica, não os motivos 1, 3 e 4. |
| Canal do WhatsApp (o de transmissão, aberto) criado pela comissão | A comissão já tem o grupo; seria um segundo lugar para olhar. E é ela quem publica, à mão, igual ao que faz hoje. |
| Pedir o telefone agora, "para o futuro" | Guardar dado pessoal sem uso é o contrário do que a Política promete. |

## Consequências

**Fica melhor**
- A decisão e os motivos ficam escritos; o item 3.1 sai da lista sem virar dívida.
- O site continua sem custo e sem guardar telefone.
- Há condições claras para reabrir, e um ponto de partida.

**Fica pior ou mais difícil**
- A comissão continua sendo o carteiro. O achado A fica **atenuado, não resolvido**.
- Quem não lê email e não está no grupo continua sem aviso.
- A próxima rodada de simulações provavelmente vai repetir o achado.

**Arquivos**
- Só este. Sem código, sem banco.

## Fontes

Consultadas em 14/11/2026. Só as duas primeiras são da Meta.

- [Groups API — Meta for Developers](https://developers.facebook.com/documentation/business-messaging/whatsapp/groups)
- [Get started with Groups API — Meta for Developers](https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/get-started)
- [WhatsApp Business API Pricing in Brazil (2026) — Vectalk](https://vectalk.com.br/blog/en/whatsapp-api-pricing-brazil/)
- [WhatsApp Business API Pricing (Nov 2026): Meta Rates by Country — FormBeep](https://formbeep.com/whatsapp-api-pricing/)
- [WhatsApp Business API Pricing (Oct 2026): Rates by Country — Flowcall](https://www.flowcall.co/blog/whatsapp-business-api-pricing)
- [WhatsApp Business API pricing in 2026 — Zapvoxia](https://zapvoxia.com.br/en/blog/whatsapp-business-api-pricing-2026)
- [The state of the WhatsApp Groups API in 2026 — Kapso](https://kapso.com/blog/whatsapp-groups-api-state-2026)
- [WhatsApp opt-in: policy requirements — Infobip](https://www.infobip.com/en/blog/how-to-collect-whatsapp-business-opt-ins)
- [Key Concepts for the WhatsApp Business Platform — Twilio](https://static0.twilio.com/docs/whatsapp/key-concepts)
- [Messaging limits in WhatsApp API — DoubleTick](https://learn.doubletick.io/whatsapp-business-api/messaging-limits-in-whatsapp-api)
