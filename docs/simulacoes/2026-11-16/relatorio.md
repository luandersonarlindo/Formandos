# Simulação de usuários do Formandos [especulação]

2026-11-16 · 8 personas · rodada 2, tema 10 (turma que já tem planilha e grupo) · personas em `sonnet` · síntese pelo agente principal

Arquivos desta pasta: `briefing.md`, `personas.md` (os mesmos perfis de `2026-11-08-7`), `entrevistas.md` (3 fases completas), `grupo.md` (3 rodadas e a tabela de notas e função).

## Resultado: REPROVADO

Condição de parada (texto exato do pré-compromisso): **"Se 4 ou mais das 8 personas rejeitarem a proposta central, REPROVADO."** Rejeição = nota da Fase 3 ≤ 4, ou dizer que a função central continua no WhatsApp ou na planilha.

**Disparou com 6 de 8** (rodada 1: 7 de 8). Contando só a nota (≤ 4), seriam 4 de 8, e ainda dispararia.

| Persona | Fase 3 | Função principal | Rejeição? | Rodada 1 (`2026-11-08-7`) |
|---|---|---|---|---|
| Bárbara (engajada) | 6 | site | não | 7, site |
| Kelly (sem dinheiro) | 6 | **site** | não | 7, WhatsApp/planilha |
| Patrícia (tesoureira) | 6 | WhatsApp/planilha | sim, pela régua | 4 |
| Igor (presidente) | 5 | WhatsApp/planilha | sim, pela régua | 6 |
| Davi (desconfiado) | 4 | WhatsApp/planilha | sim | 5 |
| Anderson (ocupado) | 3 | WhatsApp/planilha | sim | 4 |
| Dona Socorro (mãe) | 3 | WhatsApp/planilha | sim | 3 |
| Prof. Expedito | 2 | WhatsApp/planilha | sim | 2 |

**Média: 4,4 na Fase 3 e 5,5 no fim do grupo** (rodada 1: 4,75 e 5,5). Todas as notas subiram ou ficaram iguais no grupo.

**Leitura honesta** [especulação]:
- **A rodada 1 testou 5 melhorias descritas como hipóteses; esta testou o site real, com os limites reais.** A nota da Fase 3 caiu um pouco (4,75 → 4,4) e a final ficou igual (5,5). O que era promessa virou fato e funcionou: link, "Minha situação", valor por pessoa, regra de decisão, importar a planilha. Mas os pontos fracos reais apareceram:
  - votação nova sem aviso;
  - email como chave;
  - pai que paga com outro email;
  - juros à mão;
  - família sem acesso.
- **A migração custou pouco.** Patrícia colou a planilha de julho "em uns vinte minutos, porque não duplica". Bárbara gasta "uns dez minutos por mês". Kelly e Anderson entraram em dois minutos.
- **Depois de um mês, a turma usa os dois.** É o "registro duplo" da rodada 1, agora menor: o site virou "o espelho que a turma olha" (Patrícia) e a planilha continua "a minha base".
- **O ganho mais concreto foi social, não técnico.** A tesoureira parou de postar a lista de devedores no grupo, porque "Minha situação" resolveu o "paguei?". A votação do traje fechou como "decisão da turma": "ninguém me chamou de ditador dessa vez" (Igor).
- **A função de coordenar não passou para o site** porque o aviso continua no grupo (ADR-0016). Igor: "o trabalho que sobrou foi o meu: colar aviso no grupo, cobrar quem não entrou".

## Pré-compromisso

Gravado em 2026-11-16, antes de qualquer entrevista. Mesmos perfis e mesma régua da simulação de `2026-11-08-7`, que testou um pacote **hipotético** de melhorias. Agora o pacote existe e a turma está no meio do ano, com planilha e grupo funcionando (`docs/simulacoes/plano-rodada-2.md`). Não muda depois de ver os resultados.

### Espectro (8 personas)

Uma turma típica, com os perfis que mais rejeitaram nas simulações anteriores, para a comparação ser justa.

| # | Segmento | Variação | Lente | O que testa |
|---|---|---|---|---|
| 1 | Formando participante | engajado, lê tudo, cobra detalhe | Power user | regra de decisão, valor por pessoa |
| 2 | Formando participante | sem dinheiro, paga parcelado com dificuldade, tem vergonha de dever | Pragmático | "Minha situação", valor por pessoa |
| 3 | Formando participante | trabalha e estuda, silenciou o grupo, quase não lê email | Indiferente | avisos que chegam, link de convite |
| 4 | Formando participante | desconfiado de app novo ("já tem o grupo do WhatsApp"), acha que a comissão decide sozinha | Cético | regra de decisão, confiança |
| 5 | Comissão (admin) | tesoureira com planilha, controladora | Power user | carga de registrar parcelas, valor por pessoa |
| 6 | Comissão (admin) | presidente sobrecarregado, quer parar de repetir aviso e de levar a culpa | Pragmático | avisos, regra de decisão |
| 7 | Familiar | mãe ou pai que paga as parcelas e quer ver o que foi pago | Cético | se o pacote chega à família |
| 8 | Professor representante | pouca intimidade com tecnologia, chamado para mediar conflito | Indiferente | link de convite, decisões visíveis |

Lentes: 2 de cada (pragmático, cético, power user, indiferente).

### Condição de parada (a mesma de `2026-11-08-7`)

**Se 4 ou mais das 8 personas rejeitarem a proposta central, REPROVADO.**

Proposta central: usar o Formandos para acompanhar e organizar a formatura até o fim. Conta como rejeição: nota da Fase 3 igual ou menor que 4, ou dizer que a função central para aquela pessoa continua no WhatsApp ou na planilha (formando e família: ficar sabendo das coisas e da própria situação; comissão: coordenar a turma). Se menos de 4 rejeitarem, APROVADO.

Se 7 ou 8 de 8 aprovarem, registrar que as personas provavelmente estão simpáticas demais.

### Perguntas novas deste tema

Quanto tempo custa migrar? Há registro duplo? O que continua na planilha e no WhatsApp?

### Limite da comparação

As personas não lembram da rodada 1. Lá viram 5 melhorias descritas como hipotéticas; aqui veem o site real, com os pontos fracos reais. Na rodada 1, as 3 fases foram feitas de uma vez com roteiro; aqui, uma a uma.

## Comparação com a rodada 1 (`2026-11-08-7`)

| # | Persona | Rodada 1 (F3 → final) | Rodada 2 (F3 → final) | O que mudou |
|---|---|---|---|---|
| P1 | Bárbara | 7 → 7 | 6 → 6 | Conferiu "Minha situação" contra a planilha e bateu. Perde ponto por votação nova sem aviso e sem comprovante |
| P2 | Kelly | 7 → 7 | 6 → 7 | Agora a função é **site**: "atraso só a tesouraria vê" e o fim da lista de devedores no grupo |
| P3 | Anderson | 4 → 4 | 3 → 4 | Entrou uma vez, conferiu a parcela e saiu. Nem votou: "ninguém me avisou direto que estava acabando" |
| P4 | Davi | 5 → 6 | 4 → 6 | "Fora da regra" para decisão do WhatsApp agradou ("fica feio pra eles"). Continua querendo contrato e orçamentos no grupo |
| P5 | Patrícia | 4 → 6 | 6 → 7 | Importar sem duplicar e "Situação por pessoa". Falta: pai com outro email, juros, comprovante |
| P6 | Igor | 6 → 7 | 5 → 6 | Participação melhor com valor por pessoa; continua "carteiro" no grupo |
| P7 | Dona Socorro | 3 → 4 | 3 → 5 | Viu "pago" no celular da filha, com a conta da filha. "Sozinha eu não entro" |
| P8 | Prof. Expedito | 2 → 3 | 2 → 3 | Não entrou. Gostou de "histórico com nome e hora" para mediar |
| | **Média** | **4,75 → 5,5** | **4,4 → 5,5** | |

### Recomendações da rodada 1 neste tema

| # | Recomendação de `2026-11-08-7` | Situação | Evidência |
|---|---|---|---|
| 1 | Regra para fixar decisão | **resolvido** | traje fechou como decisão da turma; "fora da regra" no que veio do WhatsApp |
| 2 | Link de convite com código | **resolvido** | Kelly, Anderson e Bárbara entraram sem reclamar |
| 3 | "Minha situação" | **resolvido** | Kelly passou a função para o site; Patrícia parou de responder "paguei?" |
| 4 | Valor por pessoa | **resolvido** | Igor: "o preço de cada opção estava na tela" |
| 5 | "Mandar para o grupo" | **resolvido, com limite** | o canal que funcionou; mantém a comissão como carteiro |
| 6 | Emails só para o essencial | **resolvido, mas não basta** | Anderson e Kelly quase não leem email |
| 7 | Canal no WhatsApp de verdade | **avaliado e não adotado** (ADR-0016) | continua sendo o motivo de "WhatsApp/planilha" para a comissão |
| 8 | Exportar e importar | **resolvido** | "uns vinte minutos, porque não duplica" |
| 9 | Página pública para família | **existe, não testada aqui** | a mãe quer a situação do filho, não o evento (ver tema 9) |

## Migração: custo, registro duplo e o que fica fora [especulação]

| Pergunta do plano | Resposta das personas |
|---|---|
| Quanto tempo custa migrar? | Tesoureira: ~20 min por mês para colar; correção à mão para quem pagou com outro email. Formandos: 2 a 10 minutos. Comissão: o custo é cobrar quem não entrou (19 de 48 na primeira semana) |
| Há registro duplo? | **Sim, por escolha.** Patrícia mantém a planilha "até dezembro" (juros, observações, comprovantes). Bárbara só larga a planilha "com três meses certos" |
| O que continua no WhatsApp? | Aviso de votação nova, conversa, cobrança de quem não votou, contrato e orçamentos (mandados no privado) |
| O que continua na planilha? | Juros e multa, pagamentos de terceiros com outro email, observações ("prometeu pagar dia 10"), comprovantes |

## Funcionalidades mais e menos valorizadas [especulação]

| Função | Reação | Quem |
|---|---|---|
| "Minha situação" privada | **a mais valorizada**; mudou o comportamento da tesoureira no grupo | Kelly, Bárbara, Davi, Anderson, Dona Socorro, Patrícia |
| Importar sem duplicar | "deu pouco trabalho" | Patrícia, Igor |
| Valor por pessoa + prazo | participação melhor no traje | Igor, Bárbara |
| "Fora da regra" com justificativa | transparência sobre o que veio do WhatsApp | Davi, Bárbara |
| Histórico com nome e hora | resposta a "quem pode apagar voto?" | Davi, Bárbara, Prof. Expedito |
| "Mandar para o grupo" | usado; "me dá um texto pronto" | Igor, Patrícia |
| Email como chave | **a mais criticada da migração** | Patrícia, Igor, Anderson |
| Família sem acesso | Dona Socorro entrou com a conta da filha | Dona Socorro |

## Atritos de uso [especulação]

1. **Votação nova e aviso não avisam** (7): todos menos Kelly. Anderson nem votou no traje.
2. **Dois lugares durante a migração** (5): Patrícia, Igor, Bárbara, Prof. Expedito, Kelly ("se ela largar eu volto pro zap").
3. **Email como chave; pai paga com outro email** (3): Patrícia, Igor, Anderson.
4. **Sem anexo: comprovante, contrato, orçamento** (5): Patrícia, Bárbara, Davi, Kelly, Dona Socorro.
5. **Família não vê a situação do filho** (1, decisivo): Dona Socorro. Entrar pelo link a tornaria participante com voto.
6. **Juros e multa à mão** (1): Patrícia.
7. **"Quem pode apagar voto?"** sem resposta na tela (2): Davi, Bárbara. O presidente respondeu no grupo.

## O que faria abandonar / recomendar [especulação]

**Abandonar:** a tesoureira cansar dos dois lugares (Kelly, Prof. Expedito); edição de pagamento sem rastro (Bárbara; existe no histórico da tesouraria, mas ela não vê); lista de atraso aparecer para alguém além da tesouraria (Kelly).

**Recomendar:** "pra turma que tem uma tesoureira organizada" (Kelly, Dona Socorro, Anderson); "pra turma com comissão que responde" (Davi).

## Dinâmica do grupo [especulação]

- **A tesoureira mudou de atitude no grupo.** Kelly pediu o fim da lista de devedores, Patrícia confirmou que só ela vê atraso e prometeu parar. Davi, Kelly e Anderson citam isso como o que os convenceu.
- **Davi cobrou o presidente** (orçamentos, quem apaga voto). Igor se desculpou pelo "ditador" e respondeu com o histórico. Davi subiu de 4 para 6.
- **Kelly virou ponte de confiança** para Dona Socorro e Anderson ("não pede senha de banco, entrei pelo Google e só vi minha parte").
- **Anderson e o Prof. Expedito ficaram calados** nas três rodadas, coerente com os perfis.
- **Notas subiram nas duas rodadas** (4,4 → 5,25 → 5,5), como na rodada 1.

## Sinais adversariais [especulação]

- **Igor (6):** "usamos os dois, e vou ser sincero, é o que eu temia. [...] O trabalho que sobrou foi o meu: colar aviso no grupo, cobrar quem não entrou."
- **Anderson (4):** "Nem votei no traje, porque ninguém me avisou direto que estava acabando."
- **Dona Socorro (5):** "Sozinha eu não entro."
- **Prof. Expedito (3):** "Eu não entrei, não postei nada e não fiz nada."
- **Patrícia (7):** "a planilha continua sendo a minha base."

## Sinal de alerta de viés

- **Aprovação: 50% na Fase 3** (4 de 8 com nota 5 ou mais; só 2 dizem "site"), 75% no fim. Abaixo de 80%.
- **Erro de persona:** Dona Socorro entrou "com o Google da Ingrid", ou seja, na conta da filha. Viu a situação da filha, que é o que queria, mas isso não é acesso da família: é a filha mostrando.
- **Números inventados:** "29 de 48" foi dado pelo cenário; "uns vinte minutos" e "dez minutos por mês" vêm das personas.
- **Comissão ativa por cenário:** Igor foi à casa da Dona Socorro e Patrícia mudou de atitude. Uma comissão real pode não fazer nada disso.

## Recomendações [especulação]

| # | Área | Mudança sugerida | Tipo | Motivo | Sustentam |
|---|---|---|---|---|---|
| 1 | Emails | Email de votação nova aberta (recomendação 1 dos temas 1, 2, 3, 5) | adicionar | 7 de 8; Anderson não votou | 7 |
| 2 | Importar | Aceitar um "email de quem paga" ligado ao formando (pai, mãe), para a importação casar a linha | avaliar | o maior trabalho à mão da tesoureira | 3 |
| 3 | Família | Um link só de leitura da "Minha situação", que o formando pode gerar e mandar para quem paga (como a página do evento) | avaliar | Dona Socorro; evita a família virar participante com voto | 2 |
| 4 | Confiança | Na tela de votação, a frase "Ninguém da comissão muda o seu voto; mudanças em decisões ficam no histórico" | adicionar | Davi e Bárbara perguntaram no grupo | 2 |
| 5 | Migração | Texto curto "Como passar a sua turma para o site" (convite por lista, colar a planilha, registrar decisões já tomadas) na tela da comissão | adicionar | o caminho existe, mas a comissão descobre sozinha | 2 |
| 6 | Anexos | Campo de link (Drive) em decisão e fornecedor para contrato e orçamento | avaliar | Davi, Patrícia; mais barato que anexo | 3 |

## Comparação com o MiroFish

O resultado do MiroFish é anterior às ADR-0001 a 0016. Não serve para medir a melhoria.

## O que só usuários reais respondem

1. Quanto tempo uma tesoureira real leva para colar a planilha pela primeira vez, com as linhas sem email?
2. Quantos entram na primeira semana só com o link no grupo?
3. A tesoureira real para de postar a lista de devedores quando "Minha situação" existe?
4. A família quer ver a situação do filho, ou só quer saber o horário?

**Plano curto de validação:**
- **Uma turma real no meio do ano:** colar a planilha de pagamentos, registrar as decisões já tomadas e abrir uma votação. Medir quanto tempo a tesoureira leva, quantas linhas não casam e quantos entram em 7 dias.
- **Conversa com 2 tesoureiras:** o que elas largariam da planilha e o que nunca largariam.
