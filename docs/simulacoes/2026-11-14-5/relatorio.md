# Simulação de usuários do Formandos [especulação]

2026-11-15 · 8 personas · rodada 2, tema 7 (reta final e dia do evento) · personas em `sonnet` · síntese pelo agente principal

Arquivos desta pasta: `briefing.md`, `personas.md` (os mesmos perfis de `2026-11-08-5`), `entrevistas.md` (3 fases completas), `grupo.md` (3 rodadas do grupo e a tabela de notas).

## Resultado: REPROVADO

Condição de parada (texto exato do pré-compromisso): **"Se 4 ou mais das 8 personas não ficariam sabendo da mudança pelo site, ou dizem que só saberiam pelo WhatsApp (ou por alguém repassando), REPROVADO."** A mudança do cenário tem duas partes: entrada às 19h **e** pelo portão lateral.

| Persona | Rodada 1 | Rodada 2: chega pelo site? | Como ficaria sabendo (Fase 3) |
|---|---|---|---|
| Camila (formanda) | sim | **sim** | Email "Mudou" para o horário; o portão "eu abriria o card porque abro todo dia". Os convidados dela, só por ela. |
| Josenildo (formando em turno) | não | **não** | "Pelo site, não." Email que não abre; só pelo zap do colega ou do grupo. |
| Thaís (formanda) | não | **não, pela metade** | "O horário eu sei" pelo email; "o portão é sorte". |
| Ricardo (baixa visão) | não | **sim** | Email lido pelo TalkBack na hora; o portão, "se eu abrisse o site de propósito", e ele abriria. |
| Mariana (comissão) | contada como sim | contada como sim | Origina a mudança. |
| Wellington (comissão) | contada como sim | contada como sim | Origina a mudança. Como formando comum, "pelo site, sozinho, não ficaria sabendo do portão". |
| Seu Antônio (avô) | não | **não** | "A Larissa me ligava." |
| Rosângela (buffet) | não | **não** | "Só se ela copiar e mandar pra mim." |

**Disparou com 4 de 8** (Josenildo, Thaís, Seu Antônio, Rosângela), contando a comissão a favor do site, como na rodada 1. Na rodada 1 foram 5 de 8. A diferença é Ricardo: o email "Mudou" chegou a ele.

Leitura mais branda: se a régua valesse só para o horário, Thaís contaria como "chega" e seriam 3 de 8, o que não dispararia. A régua fala da mudança inteira, e o portão é a parte que as personas disseram ser a mais perigosa. O resultado fica REPROVADO.

**Leitura honesta** [especulação]:
- **O horário passou a chegar pelo site.** O email "Mudou" funcionou para Camila, Ricardo e Thaís, e no grupo ninguém confundiu o horário.
- **O portão não chegou.** Conferido no código: `mudancasEvento` (`src/lib/lembretes-regras.ts`) só compara data, horário, local e endereço. As observações do local ficam de fora. Quem não abriu o card não soube do portão.
- **A rampa não chegou a lugar nenhum.** Quatro personas perguntaram se o portão lateral tinha rampa. Ninguém da comissão respondeu, nem no site nem no grupo.
- **O resultado simulado:** duas famílias chegaram às 20h no portão da frente e entraram 40 minutos atrasadas.
- **Quem está fora do grupo e sem conta** (avô, buffet, formando de turno) continua sabendo só por ligação ou mensagem direta.

## Pré-compromisso

Gravado em 2026-11-15, antes de qualquer entrevista. É o mesmo pré-compromisso e o mesmo cenário de teste da simulação de `2026-11-08-5`, repetidos de propósito para a comparação valer (`docs/simulacoes/plano-rodada-2.md`). Os perfis são os mesmos de `2026-11-08-5/personas.md`. Não muda depois de ver os resultados.

### Espectro (8 personas)

| # | Segmento | Variação | Lente |
|---|---|---|---|
| 1 | Formando participante | engajado, confirmou cedo, leva vários acompanhantes (incluindo alguém com mobilidade reduzida) | Power user |
| 2 | Formando participante | trabalha em turno, celular simples e internet ruim, só abre o WhatsApp | Indiferente |
| 3 | Formando participante | indeciso: estava em "talvez" e na véspera quer ir e levar mais gente que o limite | Pragmático |
| 4 | Formando participante | com necessidade de acessibilidade (baixa visão, usa leitor de tela ou zoom) | Cético |
| 5 | Comissão (admin) | coordena o dia do evento: número para o buffet, lista na portaria, programação | Power user |
| 6 | Comissão (admin) | sobrecarregado, cético com mais uma ferramenta na semana da festa | Cético |
| 7 | Familiar/convidado | parente que vem de outra cidade, não está no grupo nem no site | Indiferente |
| 8 | Fornecedor | cerimonial ou buffet que precisa do número final e do horário certo | Pragmático |

Lentes: 2 de cada (pragmático, cético, power user, indiferente). Com 8 personas não dá para ter 3 de cada; a distribuição é proporcional.

### Cenário de teste (fixo, mostrado na Fase 3)

Três dias antes da festa, o espaço muda o horário de entrada de 20h para 19h e a entrada passa a ser pelo portão lateral. A comissão atualiza o horário e as observações do local no site e publica um aviso no mural ("ATENÇÃO: entrada às 19h pelo portão lateral"). (Na rodada 1, o site não mandava email, WhatsApp nem notificação. Na rodada 2, o cenário é o mesmo e o site manda o email "Mudou" do horário; ver `briefing.md`.)

Cada persona responde: como e quando ficaria sabendo dessa mudança?

### Condição de parada

**Se 4 ou mais das 8 personas não ficariam sabendo da mudança pelo site, ou dizem que só saberiam pelo WhatsApp (ou por alguém repassando), REPROVADO.**

Conta como "não chega pelo site": a persona diz que não abriria o site nesses três dias, que só veria se alguém mandasse no WhatsApp ou ligasse, ou que não tem acesso ao site. Conta como "chega pelo site" só se a persona diz que veria a mudança no site por conta própria antes do evento.

### Limite da comparação

As personas não lembram da rodada 1. A comparação é entre duas leituras independentes do mesmo perfil.

## Comparação com a rodada 1 (`2026-11-08-5`)

Mesmos perfis, mesma régua, mesmo cenário. Notas na ordem Fase 3 → fim do grupo.

| # | Persona | Rodada 1 | Rodada 2 | O que mudou |
|---|---|---|---|---|
| E1 | Camila (6 acompanhantes) | 5 → 5 | 8 → 8 | "Mudou em" com data, nomes dos acompanhantes, lista da portaria, página pública para a família |
| E2 | Josenildo (turno) | 3 → 3 | 3 → 3 | Igual. Só a página pública interessa, e só se o link chegar no zap |
| E3 | Thaís (indecisa) | 3 → 3 | 4 → 4 | O email "Mudou" chega. O prazo travado a manda para o privado da tesoureira |
| E4 | Ricardo (baixa visão) | 4 → 4 | 7 → 6 | Email lido pelo TalkBack. Caiu quando ninguém escreveu rampa, luz e degrau |
| E5 | Mariana (comissão) | 4 → 3 | 7 → 6 | Lista da portaria e prazo que trava. Continua com a planilha ao lado |
| E6 | Wellington (comissão) | 3 → 3 | 4 → 4 | Lista impressa. "Usa, mas imprime e liga" |
| E7 | Seu Antônio (avô) | 1 → 2 | 1 → 1 | Igual. Não usa site; precisa de ligação |
| E8 | Rosângela (buffet) | 3 → 2 | 3 → 3 | Prazo que trava e total adulto/criança agradam. Quer o PDF no zap |
| | **Média** | **3,25 → 3,1** | **4,6 → 4,4** | |

### Achados da rodada 1 neste tema

| Achado de `2026-11-08-5` | Situação | Evidência |
|---|---|---|
| A mudança não chega | **parcial** | O horário chega por email (Camila, Ricardo, Thaís). O portão, escrito nas observações, não chega. |
| A mudança não deixa rastro | **resolvido** | "Mudou em" com antes e depois. Ninguém confundiu o horário velho e o novo. |
| Convidado sem acesso | **parcial** | 31 convidados abriram a página pública. O avô e o buffet não abrem link; dependem de alguém ligar. |
| Acompanhante sem nome; sem lista para a portaria | **resolvido** | "A lista impressa salvou" (Mariana, Wellington). Rosângela: "número fechado ficou igual, sem susto na cozinha". |
| Presença sem prazo; baixar o limite corta gente | **resolvido** | Prazo que trava agradou a Mariana e Rosângela. Thaís, que decide em cima da hora, foi para o privado. |
| Comissão não sabe quem leu | **continua** | Mariana pediu 👍 no grupo; Ricardo: "👍 eu não consigo nem ver". |
| Acessibilidade do local não escrita | **continua** | Rampa, luz e degrau: Camila, Ricardo, Seu Antônio, Rosângela. A informação existia e ninguém escreveu. |

## Adesão prevista por segmento [especulação]

| Segmento | Personas e notas (Fase 3 → R2 → R3) | Média final | Usariam (≥5) | Rejeitam (≤4) | Motivo principal |
|---|---|---|---|---|---|
| Formandos (4) | Camila 8→8→8 · Josenildo 3→3→3 · Thaís 4→4→4 · Ricardo 7→6→6 | 5,25 | 2 | 2 | Quem não abre site nem email não é alcançado |
| Comissão (2) | Mariana 7→6→6 · Wellington 4→4→4 | 5,0 | 1 | 1 | O site é apoio; "papel e telefone" continuam |
| Familiar (1) | Seu Antônio 1→1→1 | 1,0 | 0 | 1 | Não usa site |
| Fornecedor (1) | Rosângela 3→3→3 | 3,0 | 0 | 1 | Quer o PDF e o aviso no zap |
| **Total (8)** | | **4,4** | **3** | **5** | |

## Funcionalidades mais e menos valorizadas [especulação]

| Função | Reação | Quem |
|---|---|---|
| Lista da portaria (impressa e planilha) | **a mais valorizada pela comissão**; "salvou" | Mariana, Wellington, Rosângela, Camila |
| Prazo que trava a presença | número fechado para o buffet | Mariana, Rosângela; contra: Thaís, Camila (trocar o nome da madrinha) |
| "Mudou em" com antes e depois | "por escrito e com data" | Camila, Josenildo, Ricardo, Thaís |
| Email "Mudou" | chegou a quem lê email | Camila, Ricardo, Thaís |
| Página pública | 31 convidados abriram; Thaís mandaria aos pais | Camila, Thaís, Josenildo, Rosângela |
| Nomes e adulto/criança | Camila confere com o Keep; Rosângela cobra diferente por criança | Camila, Rosângela |
| Mandar para o grupo | nenhuma persona da comissão citou ter usado no grupo; escreveram o aviso à mão | — |
| Observações do local | onde a informação crítica ficou escondida | Ricardo, Camila, Thaís, Wellington |

## Atritos de uso [especulação]

1. **A troca de portão não gera email nem entra no "Mudou em"** (7): Camila, Thaís, Ricardo, Mariana, Wellington, Seu Antônio, Rosângela.
2. **Acessibilidade do local (rampa, luz, degrau, percurso) não tem campo nem aviso** (5): Camila, Ricardo, Mariana, Seu Antônio, Rosângela.
3. **Quem não está no grupo nem lê email só sabe por ligação ou mensagem direta** (5): Josenildo, Wellington, Seu Antônio, Rosângela, Thaís.
4. **A comissão não sabe quem leu o aviso** (3): Mariana, Wellington, Ricardo.
5. **Aviso do mural não gera email** (4): Camila, Thaís, Ricardo, Mariana.
6. **Depois do prazo, mudar a lista é pedir à comissão** (2): Thaís, Camila.
7. **Necessidade especial por acompanhante** (cadeirante, restrição alimentar) não tem campo (3): Camila, Ricardo, Rosângela.
8. **Buffet quer um responsável só e o PDF com hora de corte** (1): Rosângela.

## O que faria abandonar / recomendar [especulação]

**Abandonar:** um erro de número na lista (Wellington); manter site e planilha em paralelo para sempre (Mariana); a comissão mexer no número depois do corte sem avisar (Rosângela); a página pesar no 3G (Josenildo).

**Recomendar:** Camila, Ricardo, Mariana, Wellington e Rosângela (para a comissão) recomendariam com ressalva. Frases: "confere o portão e a rampa por escrito toda manhã e manda o link pros convidados" (Camila); "serve, mas confira as observações do local todo dia" (Ricardo); "usa pra número e lista, mas o aviso importante você manda direto no WhatsApp" (Mariana); "usa, mas imprime e liga" (Wellington); "não deixem os avós só no site" (Seu Antônio).

## Dinâmica do grupo [especulação]

- **6 de 8 postaram na rodada 1.** Josenildo (grupo silenciado) e Thaís (grupo arquivado) não.
- **A comissão avisou o portão no grupo com texto próprio**, em dois tons diferentes (Mariana e Wellington). Rosângela: "a comissão avisando em dois tons diferentes". Nenhuma das duas citou o botão "Mandar para o grupo".
- **Ricardo puxou o grupo:** "'tá no card do evento' não é aviso", "escreve em texto, que 👍 eu não consigo nem ver quem reagiu". Mariana reconheceu depois da festa: "Ricardo, tu tinha razão: texto, não 👍".
- **A pergunta da rampa ficou sem resposta.** Camila, Ricardo, o avô e o buffet perguntaram. Mariana e Wellington prometeram "confirmo hoje". O grupo não viu a resposta.
- **Depois da festa:** comissão e formandos chegaram à mesma regra: "portão, rampa e luz vão escritos no aviso". O avô: "se tivesse escrito a rampa, ajudava a neta a me avisar".
- **Nenhuma nota subiu no grupo.** Média 4,6 → 4,4.

## Sinais adversariais [especulação]

- **Seu Antônio (1):** "Eu preciso é da ligação dela, não do site."
- **Josenildo (3):** "Fiquei sabendo pelo WhatsApp, pelo texto da Mariana no grupo, não pelo site nem pelo email."
- **Rosângela (3):** "Aviso que fica só no site não chega."
- **Thaís (4):** "Ver que duas famílias chegaram no portão errado e a rampa não estava escrita em lugar nenhum só confirmou que o aviso do site não chega em quem não procura."
- **Wellington (4):** "Como apoio, com papel e telefone, serve."

## Sinal de alerta de viés

- **Erro do briefing (achado em 16/11, no tema 9):** o briefing disse que "Mandar para o grupo" monta o texto "Mudou o horário: era 20h, agora é 19h...". No código (`textoEvento` em `src/lib/texto-whatsapp.ts`) o texto só traz o nome, "Quando", "Onde" e o link do evento; **não diz que algo mudou nem o antes e depois**. Quem neste tema ficou sabendo da mudança "pelo grupo" contou com um texto mais claro do que o real. O número de quem fica sabendo pelo site está, portanto, otimista.

- **Aprovação: 37,5%** (3 de 8 com nota 5 ou mais). Abaixo do limite de 80%.
- **O resultado da festa foi decidido pelo entrevistador** (duas famílias atrasadas, rampa existente e não escrita, 31 aberturas da página). O número de aberturas é inventado. A falha escolhida para o cenário é a que o código confirma (o portão nas observações não entra no "Mudou"), mas o tamanho do estrago é suposição.
- **A régua conta a comissão a favor do site**, como na rodada 1. Wellington, pensando como formando, disse que não saberia do portão. Sem esse ajuste seriam 5 de 8.
- **O cenário favorece o achado.** A rodada 1 já tinha posto o portão nas observações. Uma comissão real poderia escrever o portão no endereço, e aí o "Mudou" sairia.

## Recomendações [especulação]

| # | Área | Mudança sugerida | Tipo | Motivo | Sustentam |
|---|---|---|---|---|---|
| 1 | Mudou | Incluir as observações do local (e a programação) na detecção de mudança, com email e "Mudou em" | mudar | O portão não chegou; é o que reprova | 7 |
| 2 | Evento | Campo próprio de acessibilidade do local: rampa, degraus, iluminação, percurso do estacionamento à mesa, banheiro adaptado, com "atualizado em". Aparece no card, na página pública e no texto do "Mudou" | adicionar | Rampa existia e ninguém escreveu | 5 |
| 3 | Mandar para o grupo | Abrir o "Mandar para o grupo" sozinho depois de salvar uma mudança no evento, com o texto já trazendo o portão e a acessibilidade | mudar | A comissão escreveu à mão, em dois tons | 3 |
| 4 | Presença | Necessidade especial por acompanhante (cadeirante, restrição alimentar), visível só para a comissão e na lista da portaria | adicionar | Camila, Ricardo, Rosângela | 3 |
| 5 | Fornecedor | PDF da lista com hora do corte escrita, e resumo (adultos, crianças, necessidades) fácil de mandar no zap para o buffet | mudar | Rosângela | 1 |
| 6 | Aviso | Email também para o aviso do mural marcado como importante, com limite por semana | avaliar | Aviso do mural não gera email | 4 |
| 7 | Leitura | Mostrar à comissão quantos abriram o "Mudou" (email ou página) | avaliar | "Quem leu?" | 3 |

Fora do alcance por decisão já tomada: ligação, SMS e WhatsApp automático (ADR-0016).

## Comparação com o MiroFish

O resultado do MiroFish é anterior às ADR-0001 a 0016 e não foi rodado de novo. Não serve para medir a melhoria.

## O que só usuários reais respondem

1. Uma comissão real escreve o portão no endereço ou nas observações?
2. Quantos formandos abrem o email "Mudou" em até 24 horas?
3. Quantos convidados abrem a página pública quando o formando repassa o link?
4. A comissão usa "Mandar para o grupo" ou escreve à mão?
5. O buffet aceita a planilha ou o PDF gerado pelo site?

**Plano curto de validação:**

- **Quem:** 5 formandos (um que vive no zap e não abre email, um com familiar cadeirante, um com baixa visão, um que decide em cima da hora, um engajado), 2 da comissão, 1 avô ou avó, 1 buffet.
- **5 perguntas:** (1) Por onde você soube da última mudança de horário de um evento? (2) Nesta tela, por qual portão você entra e tem rampa? (3) Você repassaria este link para quem vai com você? (4) O que a comissão precisa mandar para o buffet na véspera? (5) O que te faria chegar no lugar errado?
- **Teste de usabilidade:** numa turma pequena, mudar o horário e o portão de um evento de teste 3 dias antes. Metade da turma recebe só o que o site manda; a outra metade também recebe o texto no grupo. Perguntar a cada pessoa, no dia, a hora e o portão.
