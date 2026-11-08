# Simulação de usuários do Formandos 6 — votações e decisões [especulação]

2026-11-08 · 8 personas · foco: como a turma decide (votar, fixar decisão, conflito) · app real, sem melhorias hipotéticas · personas em `sonnet` · síntese pelo agente principal

Arquivos desta pasta: `briefing.md` (o que foi mostrado às personas), `personas.md` (perfis), `entrevistas.md` (3 fases completas), `grupo.md` (3 rodadas do grupo de WhatsApp e tabela de notas).

Comparação: simulações 1 a 5 em `../2026-11-07/`, `../2026-11-07-2/`, `../2026-11-07-3/`, `../2026-11-08/` e `../2026-11-08-2/`. Nenhuma delas tinha as votações como foco.

## Resultado: REPROVADO

Condição de parada (texto exato do pré-compromisso): **"Se o mesmo bloqueio aparecer em 4 ou mais das 8 personas, REPROVADO."**

Disparou duas vezes, na Fase 3:

1. **A comissão pode fixar qualquer opção, sem regra de decisão nem quórum: 5 de 8.** [especulação]
   - Rafaela: "Se 11 a 11 a comissão escolhe sozinha, não é decisão da turma, é decisão da comissão com gráfico. Eu não aceitaria uma decisão fixada assim."
   - Jéssica: "Não aceito decisão fixada assim. Se for buffet de R$ 210 sem maioria qualificada, eu não aceito e não pago."
   - Marcos: "Isso é a 'fechou pelo grupo' com carimbo oficial. Não aceito uma decisão fixada assim."
   - Débora: "Sem quórum [...] não me protege de nada. Ainda deixa fixar uma opção que não ganhou, o que é pior pra mim."
   - Wellington: "Sem regra de decisão (quórum, prazo, vencedor). Sem isso não dá pra dizer se foi cumprida."
   - Thiago e Dona Cleide também reclamaram, mas sem chamar de bloqueio.
2. **O site não avisa nada: 4 de 8.** [especulação]
   - Rafaela ("a enquete do WhatsApp continua sendo o lugar onde a coisa acontece"), Thiago ("entro uma vez, curioso, e nunca mais volto"), Dona Cleide ("se não chega no meu zap, pra mim não existe") e Anderson. A Débora deixou de contar isso como bloqueio depois da correção.

A Fase 3 de Anderson mudou depois da correção (veja abaixo). Mesmo assim ele manteve o aviso como bloqueio principal: "Sobra o aviso: ainda mando eu no zap." Sem o Anderson, o bloqueio 2 fica em 3 de 8. O bloqueio 1 continua em 5 de 8 de qualquer jeito.

**Erro do entrevistador.** A lista de pontos fracos da Fase 3 dita a Débora e Anderson afirmou que a comissão não vê "X de Y votaram" nem a lista de quem falta. O app mostra os dois na tela de cada pergunta (`src/app/(admin)/admin/votacoes/votos/[enqueteId]/page.tsx`). Os dois receberam a correção antes da Rodada 1. Débora foi de 3 para 4 e Anderson de 4 para 6. O resultado não muda: os dois continuaram com bloqueios nos pontos que são reais.

## Pré-compromisso

Gravado antes de gerar qualquer persona.

### Espectro (8 personas)

Distribuição reduzida e puxada para quem vota e quem decide.

| # | Segmento | Variação |
|---|---|---|
| 1 | Formando participante | engajado, quer opinar em tudo |
| 2 | Formando participante | ocupado (trabalha e estuda), vota pouco |
| 3 | Formando participante | sem dinheiro, costuma ficar na minoria que perde |
| 4 | Formando participante | desconfiado ("já tem enquete no WhatsApp"), acha que a comissão é panelinha |
| 5 | Comissão de formatura (admin) | organizada, já usa planilha e enquete do WhatsApp |
| 6 | Comissão de formatura (admin) | sobrecarregada e cética com mais uma ferramenta |
| 7 | Professor representante | pouco tempo, chamado para mediar conflito |
| 8 | Familiar | mãe ou pai que ajuda a pagar e quer opinar |

### Lentes

Com 8 personas não dá para ter cada lente 3 vezes (exigiria 12). Cada lente aparece 2 vezes.

| Lente | Personas |
|---|---|
| Pragmático | 2 (formando ocupado), 7 (professor) |
| Cético | 4 (formando desconfiado), 6 (comissão sobrecarregada) |
| Power user | 1 (formando engajado), 5 (comissão organizada) |
| Indiferente | 3 (formando sem dinheiro), 8 (familiar) |

### Condição de parada

**"Se o mesmo bloqueio aparecer em 4 ou mais das 8 personas, REPROVADO."**

Bloqueio = algo que, na fala da persona, a faz não usar as votações do site, voltar para a enquete do WhatsApp ou não aceitar a decisão tomada pelo site.

## Adesão prevista por segmento [especulação]

Notas de 0 a 10 de chance de usar as votações até a formatura. Fase 3 com a nota corrigida da comissão.

| Segmento | Nota média Fase 3 → Rodada 3 | Usariam | Abandonariam | Motivo principal |
|---|---|---|---|---|
| Formandos (4) | 3,0 → 4,5 | 0 para valer; 4 "só se" a regra e o valor vierem escritos no grupo | 0 saem de vez; Jéssica não vota | A comissão decide sozinha; sem aviso; sem valor por pessoa |
| Comissão (2) | 5,0 → 5,5 | 2, com o WhatsApp e a planilha do lado | 0 | A lista "Ainda não votaram" ajuda; faltam aviso, prazo, quórum, CSV |
| Professor (1) | 3 → 4 | 0 | 0 (não abandona, mas "não ponho meu nome nisso") | Sem histórico com data, hora e autor não serve de prova |
| Familiar (1) | 2 → 4 | 0 no site; acompanha pelo WhatsApp | 1 do site | Exige conta; não mostra preço nem quanto a parcela muda |
| **Todos (8)** | **3,4 → 4,6** | | | |

Nenhuma persona chegou a 7. Toda a subida da Rodada 3 veio de regras, prazo e valores combinados **no WhatsApp**, não do site. Dona Cleide: "O site em si não mudou nada pra mim, o que melhorou foi o grupo."

A comissão é o único segmento acima de 5. Pela regra 4 da skill, a rejeição de Jéssica (formanda comum, sem dinheiro) e de Marcos (formando comum, cético) pesa mais que a adesão parcial da comissão.

## Funcionalidades mais e menos valorizadas [especulação]

Só a área de votações foi mostrada. Login e código entraram como contexto de acesso.

| Item | Valorizado por | Criticado por | Observação |
|---|---|---|---|
| Decisão fixada na tela inicial | Thiago, Anderson, Wellington, Marcos | Rafaela, Marcos, Jéssica, Wellington (porque pode ser qualquer opção) | O que mais agradou e o que mais assustou são a mesma tela |
| Mudar o voto | Rafaela ("era meu mínimo"), Marcos (quer testar) | Marcos (sem histórico da troca) | |
| Catálogo padrão pronto | Débora, Anderson, Rafaela | Thiago ("caí direto em 23 pergunta") | Ajuda quem cria, assusta quem vota |
| Lista "Ainda não votaram" e "X de Y votaram" (comissão) | Anderson ("resolve o pior"), Débora | ninguém | Já existe; só a comissão vê |
| Aviso "O administrador vê quem votou" | Marcos ("pelo menos é honesto"), Anderson | Jéssica, Thiago, Cleide (medo de ser marcado) | Ver "Sinais adversariais": pedidos opostos |
| Relatório com totais | Marcos (conferir total), Jéssica (ver para onde puxa) | Débora (sem % de participação), Wellington (sem nomes nem datas) | |
| Votar só parte e salvar | Débora, Anderson (explicaram ao Thiago) | Thiago ("soa trabalho pendente") | |
| Dúvidas | ninguém usou | Dona Cleide ("tenho vergonha de ser chata") | Não serve para propor opção |

## Atritos de uso [especulação]

Do mais citado ao menos citado.

1. **A comissão fixa qualquer opção; não há regra de decisão, empate nem quórum.** 8 de 8 citaram em algum momento. Rafaela, Jéssica, Marcos, Débora, Wellington, Thiago, Dona Cleide; Anderson admitiu no grupo: "pode fixar qualquer uma, o site não trava".
2. **Opções sem preço, sem valor por pessoa nem efeito na parcela.** 8 de 8 até a Rodada 3. Começou com Jéssica e Dona Cleide; o professor, Thiago, Marcos, Débora e Anderson aderiram no grupo. Anderson: "Isso eu não tinha pensado e vai dar problema depois, como na pousada."
3. **O site não avisa (pergunta nova, prazo, decisão).** 7 de 8: Rafaela, Thiago, Jéssica (gasta dados), Marcos, Débora, Anderson, Dona Cleide.
4. **Sem prazo.** 6 de 8: Rafaela, Thiago, Jéssica, Débora, Anderson, Wellington. No grupo, os dois da comissão marcaram datas diferentes (sexta e domingo), e 5 personas apontaram a contradição.
5. **Sem histórico de decisão (trocada, reaberta, por quem, quando).** 5 de 8: Rafaela, Marcos, Débora, Wellington, Dona Cleide.
6. **Cadastro, confirmação de email e código para entrar.** 6 de 8: Thiago, Jéssica, Anderson, Débora, Wellington, Dona Cleide. Já é achado repetido das simulações 1 e 4.
7. **Quem vota e o que se vê do voto.** 5 de 8, com pedidos opostos (ver "Sinais adversariais").
8. **Não há um lugar para pai ou mãe; para ver é preciso virar membro.** Dona Cleide; Wellington pede o mesmo para professor (página só de leitura).
9. **Remover alguém apaga os votos dessa pessoa sem registro visível.** Marcos, Wellington.
10. **Nenhuma tela "só o que falta você votar".** Thiago (bloqueio para ele).
11. **O site não sabe quem pagou; todo voto vale igual.** Débora (bloqueio), Rafaela, Wellington, Dona Cleide (incomoda).
12. **Formando não sugere opção.** Jéssica ("a minha opção nem entra na lista").
13. **Sem exportação CSV.** Débora (bloqueio).
14. **Duas contas podem votar duas vezes.** Marcos (bloqueio).

## O que faria abandonar / recomendar [especulação]

**Abandonar ou não votar:**
- Decisão fixada que não foi a mais votada, ou com pouca gente votando. Thiago: "Se fixarem uma decisão contra o voto da turma, eu não aceito, volto pro zap reclamar."
- Votar "no escuro" sem saber quanto custa. Jéssica, Dona Cleide.
- Ter que abrir o site para descobrir que há votação. Thiago, Dona Cleide.
- Cobrança pública de quem não votou. Jéssica e Dona Cleide se afastaram quando a Débora prometeu "cobrar nominalmente".

**Recomendar (ninguém recomenda hoje):**
- Rafaela: regra de empate, prazo e quórum configuráveis, log público de decisão, aviso no WhatsApp.
- Wellington: histórico com data, hora e autor e uma página de leitura com link direto. "Se tiver isso, eu recomendo sem medo."
- Dona Cleide: "Se um dia vier um link no zap, com o valor e a parcela, concordo ou não concordo, aí eu falo bem."
- Anderson: "só se avisar que o aviso ainda é por conta deles."

## Dinâmica do grupo [especulação]

- **Rodada 1: 8 de 8 postaram, nenhum elogio sem ressalva.** 6 mensagens pediram regra ou informação que o site não dá. Os dois da comissão só cobraram voto.
- **Rodada 2: a comissão respondeu cobrando, não explicando.** As notas ficaram paradas (3,4). Marcos caiu de 3 para 2: "a comissão responde pra cobrar voto e não pra explicar regra".
- **Rodada 3: a sinceridade da Débora virou o jogo.** Ela admitiu "o site deixa a gente fixar qualquer opção [...] vai ser palavra da comissão" e "o anterior não aparece pra turma". Rafaela, Thiago e Marcos citaram essa franqueza como o que mais os mexeu. Logo depois os dois da comissão escreveram regras **no grupo**: fixa a mais votada, empate vira nova votação, menos da metade estende o prazo, uma data só, valor por pessoa antes de abrir. A média subiu para 4,6.
- **O professor foi o maior influenciador.** 6 de 8 o citaram. Ele mudou o assunto de "quem não votou" para "qual é a regra". Marcos: "a comissão não ignora professor."
- **Jéssica deixou de falar sozinha.** O professor e a Dona Cleide repetiram o pedido do valor por pessoa, e a comissão adotou. Jéssica foi de 2 para 4.
- **Dúvidas repetidas (falha de onboarding):** "a comissão pode fixar o que não ganhou?" (Marcos, Thiago, Jéssica, Rafaela, Wellington), "quando fecha?" (5 pessoas depois das duas datas), "tenho que responder as 23?" (Thiago).
- **Consequência:** as personas aceitaram a decisão do site só quando o WhatsApp carregava a regra, o prazo, o valor e o print com dia e hora. Rafaela: "Já que o site não guarda histórico, a gente guarda: print do resultado com dia e hora no grupo." O site virou urna; o WhatsApp continuou sendo o cartório.

## Sinais adversariais [especulação]

Uma por uma, sem suavizar.

- **Jéssica (formanda sem dinheiro), 2 → 4.** "Sem isso, os 19 ganham dos 8 de novo, só que agora com gráfico." Não vota com a comissão vendo o nome dela. "Recomendar pra outra turma: não."
- **Marcos (formando cético), 3 → 4.** Cinco bloqueios. "É bom pra enquete simples e fraco pra provar alguma coisa." Vai printar cada resultado e conferir no WhatsApp.
- **Prof. Wellington, 3 → 4.** "Falando como advogado: isso não serve de prova. Serve de quadro de avisos, e olhe lá." "Como está, não ponho meu nome nisso."
- **Dona Cleide (mãe), 2 → 4.** Desistiu do site na Fase 3 e não voltou. Acompanha pelo WhatsApp.
- **Débora (comissão organizada), 4 → 5.** "Fixar decisão aqui me protege de 'meia turma decidiu'? Não. Hoje só prova que a comissão clicou." Sem CSV, mantém a planilha.
- **Rafaela (a mais engajada), 4 → 5.** Usaria "só pra coisa pequena, tipo cor da beca". O local do baile continua no WhatsApp.
- **Thiago, 3 → 5.** Vota uma vez, se alguém avisar no grupo. "É o grupo que tá fazendo esse papel."
- **Anderson (comissão sobrecarregada), 4 → 6.** O mais positivo, por causa da lista de quem não votou. Ainda assim: "o site sozinho, não".

**Pedidos que se contradizem (não dá para atender os dois com uma regra só):**
- Jéssica, Thiago e Dona Cleide querem que a comissão **não** veja em quem cada um votou.
- Marcos, Rafaela e Wellington querem que a turma **veja mais**: quem participou, com data e hora.
- As duas coisas cabem juntas se a turma vir **quem participou**, mas não **em quê**. Isso é decisão de produto, não de código.

## Sinal de alerta de viés

Aprovação (nota 7 ou mais): **0 de 8 (0%)** em todas as rodadas. Muito abaixo de 80%. As personas não parecem simpáticas demais.

O risco aqui é o contrário. As personas foram geradas com histórias de conflito em decisões (empate, DJ que subiu, pousada paga do bolso, buffet caro). Isso empurra a reação para o tema "legitimidade". Uma turma sem histórico de briga pode ligar menos para regra e histórico. Mesmo assim, o pedido de **valor por opção** surgiu de perfis com e sem conflito.

A subida da Rodada 3 também tem viés: a comissão simulada cedeu rápido demais às cobranças. Uma comissão real pode não escrever regra nenhuma.

## Recomendações [especulação]

Não implementar sem a análise de estrutura e arquitetura combinada antes (ver memória do projeto). Cada linha é hipótese para validar.

| # | Área do app | Mudança sugerida | Tipo | Motivo | Personas que sustentam |
|---|---|---|---|---|---|
| 1 | Fixar decisão | Mostrar à turma, na decisão, quantos votaram ("22 de 38") e se a opção fixada foi a mais votada. Se não foi, exigir uma justificativa visível. | mudar | Bloqueio 1 (5 de 8); a contagem já existe na tela da comissão | 8 |
| 2 | Pergunta / catálogo | Regra declarada antes de abrir: prazo de encerramento, quórum mínimo, o que fazer no empate. Mostrar a regra para quem vota. | adicionar | Bloqueio 1; os dois da comissão escreveram exatamente isso no WhatsApp na Rodada 3 | 8 |
| 3 | Opção de voto | Campo opcional de valor (por pessoa ou total) e texto curto ou link em cada opção. Avaliar ligar com o valor orçado que já existe em Fornecedores, hoje escondido dos participantes. | adicionar | 8 de 8 pediram até a Rodada 3; Jéssica e Dona Cleide bloqueiam sem isso | 8 |
| 4 | Decisão | Histórico visível à turma: fixada, reaberta, trocada, por quem e quando. Hoje a tabela `auditoria` (`src/lib/auditoria.ts`) não registra decisões: só papel, remoção de membro, conta e turma. O `decisoes.fixar` só nomeia a transação no log do servidor. A tabela `decisoes` guarda só a decisão atual (reabrir apaga a linha). | adicionar | Rafaela, Marcos, Wellington bloqueiam; Débora teme "mudei escondido" | 5 |
| 5 | Avisos | Email (ou outro canal) quando abre pergunta, perto do prazo e quando a decisão é fixada. | adicionar | Bloqueio 2 (4 de 8); é o achado que se repete nas 6 simulações | 7 |
| 6 | Votações | Tela ou filtro "falta você votar" com só as perguntas abertas, cada uma com seu prazo. | adicionar | Thiago bloqueia; "23 perguntas" assustou | 3 |
| 7 | Privacidade do voto | Decidir a regra: turma vê quem participou (sem a escolha)? Comissão vê a escolha? Opção de voto secreto por pergunta? | mudar (decisão de produto) | Pedidos opostos de 6 personas | 6 |
| 8 | Acesso | Página de leitura da decisão por link, sem conta (professor, pais). | adicionar | Wellington e Dona Cleide bloqueiam; já apareceu na simulação 4 | 2 |
| 9 | Exportação | CSV dos votos e de quem votou, para a comissão. | adicionar | Débora bloqueia | 1 |
| 10 | Remoção de membro | Mostrar na votação quando votos saíram porque alguém foi removido. A remoção já vai para a `auditoria` (`membro.removido`), mas a turma não vê. | mudar | Marcos, Wellington | 2 |

Ficaram de fora por falta de sustentação ou por ser outro produto: voto só para quem está em dia com o pagamento (Débora; exige o app saber de pagamento, que hoje está fora do MVP), formando sugerir opção (Jéssica), comentário em cada opção.

## Comparação com o MiroFish

O resultado do MiroFish (`/home/luan/Documentos/Projetos/MiroFish/resultados-formandos/resultado-formandos.md`) é, quase todo, um grafo de conhecimento tirado da documentação. Sobre votação, ele descreve as regras (mudar voto, fixar e reabrir, relatório sem nomes, lista de quem não votou) e não traz reação de usuário sobre legitimidade da decisão.

- **Onde concordam:** "ver o orçamento" como coisa esperada pelos formandos (post de `único_administrador`); login e código como barreira antes de votar.
- **Onde divergem:** o MiroFish não aponta a falta de regra de decisão, de prazo, de histórico nem o conflito sobre quem vê o voto. Aqui esses foram os achados centrais.
- Concordância entre os dois **não** é validação. Os dois são LLM.

## O que só usuários reais respondem

- Turmas reais escrevem regra de decisão antes de votar? Ou só depois da briga?
- O formando comum aceita uma decisão fixada no site sem print no WhatsApp?
- Qual voto pesa mais na adesão: o voto visível à comissão (medo de ser marcado) ou o voto invisível à turma (medo de manipulação)?
- A comissão tem o valor por pessoa de cada opção no momento da votação? Ou o orçamento só chega depois?
- Pais querem votar, ou só ver o valor e a decisão?

**Plano curto de validação na Unifacol:**

- **Quem entrevistar:** 5 formandos (pelo menos 1 que já perdeu uma votação cara e 1 que trabalha de dia), 2 da comissão (1 tesoureiro), 1 professor representante. Se possível, 1 mãe ou pai que paga parcela.
- **5 perguntas:**
  1. Conte a última decisão da turma que deu briga. O que faltou para todo mundo aceitar?
  2. Se a comissão fixar uma opção que não foi a mais votada, o que você faz?
  3. Você votaria sabendo que a comissão vê em quem você votou? E se a turma visse só quem votou, sem a escolha?
  4. Na hora de votar o espaço ou o buffet, o que precisa aparecer do lado de cada opção?
  5. Como você ficaria sabendo que abriu uma votação, e até quando ela vai?
- **Teste de usabilidade:** no celular de cada um, criar um catálogo próprio "Qual destes 3 espaços?" e pedir: (a) ao formando, votar e depois achar a decisão fixada e dizer quantos votaram; (b) ao membro da comissão, descobrir quem falta votar e fixar a decisão num empate 11 a 11, pensando em voz alta. Medir: tempo até votar, se o formando encontra a informação de participação (hoje ele não encontra), e o que o membro da comissão faz no empate.
