# Briefing da simulação 13 (2026-11-14) — rodada 2, tema 5: votações e decisões

Foco: como a turma decide coisas no Formandos e o que acontece quando há conflito. Fonte: o código (`src/lib/decisao-regras.ts`, `src/lib/votos-regras.ts`, `src/lib/votacoes.ts`, `src/components/features/historico-decisoes.tsx`, `src/lib/saida-turma.ts`) e as ADR-0003, 0004, 0006, 0007, 0010 e 0012. O bloco 1 é o mesmo da simulação de `2026-11-08-3`. Os blocos 2 e 3 descrevem o site como está hoje. Nenhuma função hipotética.

## Bloco 1: Problema (Fase 1, sem citar o app)

Toda turma de formatura precisa decidir dezenas de coisas: baile ou churrasco, qual espaço, buffet, banda ou DJ, traje, se faz rifa ou mensalidade, onde gastar mais. Hoje isso acontece no grupo de WhatsApp: alguém solta uma enquete do próprio WhatsApp, metade não vota, a enquete some no meio das mensagens, outro abre uma enquete repetida. Quem perde a votação diz que "ninguém avisou" ou que "foi combinado entre a panelinha". A comissão às vezes decide sozinha porque ninguém responde, e depois leva a culpa. Às vezes quem não pagou nada vota igual a quem já pagou tudo. Ninguém sabe ao certo o que já foi decidido e o que ainda está aberto.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site gratuito, feito por alunos da Unifacol (abre no navegador do celular, não é app de loja). Cada formando entra na turma por um link de convite. No menu tem **Votações**.

- **Catálogos de perguntas.** O catálogo padrão vem pronto: 23 perguntas em 10 categorias (formato do evento, espaço, comida, bebidas, música, fotos, estrutura, traje, rituais, orçamento e arrecadação). A comissão pode criar **perguntas próprias** (por exemplo "Qual destes 3 espaços?").
- **Valor por pessoa.** Nas perguntas criadas pela comissão, cada opção pode mostrar o **valor por pessoa** (por exemplo "Espaço A, R$ 180 por pessoa") e um **link** (cardápio, fotos do lugar, orçamento).
- **Regra da votação.** Em cada pergunta a comissão pode definir um **prazo** (dia e hora em que a votação fecha) e um **mínimo de votos para valer**, que o site chama de quórum (por exemplo, 60% da turma). A regra aparece para todos antes de votar. Passado o prazo, ninguém mais vota.
- **Votar e mudar o voto.** Escolha única ou múltipla. Pode trocar o voto até a pergunta fechar.
- **Quem vê o seu voto.** A turma vê só os totais. A comissão vê o nome de quem votou em cada opção, **menos nas perguntas marcadas como voto secreto**. Nessas, ninguém vê a escolha de cada um, nem a comissão: aparece só a lista de quem já votou e quem falta. O aviso aparece na tela antes de você votar.
- **Decisão.** Quem fixa a decisão é a comissão. O site confere a regra na hora. Se a comissão fixar **fora da regra** (opção que não foi a mais votada, empate, menos votos que o mínimo, antes do prazo com gente faltando votar), ela é obrigada a escrever uma **justificativa**, e o site mostra para a turma inteira o motivo ("a opção escolhida não é a mais votada") junto com a justificativa.
- **Histórico de decisões.** A turma inteira lê uma lista com dia, hora e nome de quem fez: decisão fixada, votação reaberta, regra alterada. O registro guarda quantos votaram e quantos membros a turma tinha no dia da decisão.
- **Relatório.** Qualquer formando vê, em gráfico, o total de votos de cada opção.
- **Avisos.** Chega email quando uma decisão é fixada, e 2 dias antes de uma votação fechar (só para quem ainda não votou). A comissão tem um botão "Mandar para o grupo", que monta o texto da decisão para colar no WhatsApp.
- **Para a comissão.** Em cada pergunta: "X de Y votaram" e a lista "Ainda não votaram". Baixa os votos em planilha.
- **Professor ou coordenador** entra como observador: lê tudo o que a turma lê, mas não vota e não entra na conta do mínimo de votos.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **Quem define a regra é a comissão**, e ela pode mudar o prazo ou o mínimo de votos depois que a votação começou. A mudança fica no histórico, com nome e hora, mas o site não impede.
- **A comissão continua podendo fixar qualquer opção.** O site não bloqueia: obriga a justificar e mostra para todos.
- **Empate não tem desempate automático.** A comissão escolhe e justifica.
- **Prazo vencido não decide sozinho.** A votação fecha, mas a decisão só existe quando alguém da comissão fixa.
- **Prazo e mínimo de votos são opcionais.** Se a comissão não definir, a pergunta fica como antes: aberta até alguém fixar.
- **Voto identificado é o padrão.** Voto secreto é a comissão que liga, pergunta por pergunta, e só antes do primeiro voto.
- **O resultado parcial aparece para todos.** Quem ainda não votou já vê qual opção está ganhando. Em turma pequena ou resultado unânime, o total revela o voto mesmo no secreto.
- **Valor por pessoa e link só nas perguntas criadas pela comissão**, não nas 23 do catálogo padrão. Não dá para pôr foto na opção.
- **Formando não cria pergunta nem sugere opção.** Não dá para comentar dentro da pergunta. A discussão continua no WhatsApp.
- **Todo voto vale igual**, tenha a pessoa pago ou não, vá à festa ou não. O mínimo de votos conta todos os membros.
- **Votação nova aberta não avisa ninguém.** Os emails são só o de decisão fixada e o de "fecha em 2 dias". No WhatsApp só chega o que a comissão colar.
- **Quem sai ou é removido da turma tem os votos apagados.** O total de uma votação aberta muda. A decisão já fixada guarda a contagem do dia.
- **Família não tem acesso.** Quem ajuda a pagar não vê a votação nem o valor por pessoa, só se o formando mostrar a tela.
- **É um projeto de alunos**, com responsável identificado (nome, CNPJ de MEI, email), sem empresa por trás nem suporte com prazo.
