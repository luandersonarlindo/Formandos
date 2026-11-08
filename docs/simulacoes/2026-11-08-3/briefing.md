# Briefing da simulação 6 (2026-11-08) — votações e decisões

Foco: como a turma decide coisas no Formandos (formato da festa, local, buffet, música, arrecadação) e o que acontece quando há conflito. Descreve o app **real**, conferido no código (`src/lib/votacoes.ts`, `src/actions/votos.ts`, `src/actions/decisoes.ts`, `src/app/(app)/votacoes/`, `src/app/(admin)/admin/votacoes/`, `db/schema.sql`) e no catálogo padrão (`docs/catalogos-modelo/catalogo-enquetes.md`).

## Bloco 1: Problema (Fase 1, sem citar o app)

Toda turma de formatura precisa decidir dezenas de coisas: baile ou churrasco, qual espaço, buffet, banda ou DJ, traje, se faz rifa ou mensalidade, onde gastar mais. Hoje isso acontece no grupo de WhatsApp: alguém solta uma enquete do próprio WhatsApp, metade não vota, a enquete some no meio das mensagens, outro abre uma enquete repetida. Quem perde a votação diz que "ninguém avisou" ou que "foi combinado entre a panelinha". A comissão às vezes decide sozinha porque ninguém responde, e depois leva a culpa. Às vezes quem não pagou nada vota igual a quem já pagou tudo. Ninguém sabe ao certo o que já foi decidido e o que ainda está aberto.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site (abre no navegador do celular, não é app de loja). Cada formando entra na turma com um código de convite. No menu tem **Votações**.

- **Catálogos de perguntas.** Em Votações aparecem um ou mais "catálogos". O **catálogo padrão** vem pronto: 23 perguntas em 10 categorias (Formato do Evento, Espaço, Comida, Bebidas, Música, Fotos e Recordações, Estrutura e Segurança, Traje e Decoração, Rituais e Pré-eventos, Orçamento e Arrecadação). Exemplos: "Qual formato de comemoração a turma prefere?" (Baile de Gala, Jantar Dançante, Churrasco, Festa Temática, Viagem, Sem preferência); "Como a turma prefere arrecadar o dinheiro?" (mensalidade fixa, rifas, festas, bazar, patrocínio, cota extra). A comissão pode desligar o catálogo padrão e criar **catálogos próprios** com as perguntas e opções que quiser (por exemplo "Qual destes 3 espaços?").
- **Votar.** Cada pergunta é de escolha única ou múltipla. Algumas têm opção "Sem preferência", que desmarca as outras. Dá para responder só parte das perguntas e salvar; o resto fica para depois. A tela mostra quantas perguntas de cada catálogo você já respondeu.
- **Mudar o voto.** Pode trocar o voto quantas vezes quiser enquanto a pergunta estiver aberta.
- **Voto identificado.** A tela avisa: "O administrador vê quem votou em cada opção." A comissão abre cada pergunta e vê a lista de nomes por opção.
- **Relatório.** Qualquer formando abre "Relatório das votações" e vê, em gráfico, o total de votos de cada opção, da mais votada para a menos votada, e quantos membros a turma tem. O relatório não mostra nomes para os formandos.
- **Decisão da turma.** A comissão "fixa a decisão" de uma pergunta escolhendo a opção (ou opções) vencedora. A partir daí a pergunta fecha para votos e a decisão aparece na tela inicial de todo mundo, em "Decisões da turma". A comissão pode reabrir a votação depois.
- **Dúvidas.** Existe uma área separada de Dúvidas, onde qualquer um pergunta e os outros dão "+1"; a comissão responde.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **Não tem prazo.** A pergunta fica aberta até a comissão fixar a decisão. Não há data de encerramento nem contagem regressiva para votar.
- **Não tem quórum nem regra de decisão.** A comissão pode fixar qualquer opção, inclusive uma que não foi a mais votada. O site não exige mínimo de votantes nem mostra "votaram 12 de 40" na hora de decidir.
- **Formando não cria pergunta nem sugere opção.** Só a comissão cria perguntas e opções. Quem quer propor algo tem que usar Dúvidas ou o WhatsApp.
- **Não tem discussão dentro da pergunta.** Não dá para comentar uma opção ("esse espaço é longe", "esse buffet atrasou na turma passada"). A conversa continua no WhatsApp.
- **O resultado parcial aparece para todos.** Quem ainda não votou já vê qual opção está ganhando.
- **Voto não é secreto para a comissão.** A comissão vê o nome de cada um em cada opção. O formando é avisado, mas não há opção de voto anônimo.
- **Todo voto vale igual.** Não importa se a pessoa pagou ou não, se vai à festa ou não.
- **Opções são só texto.** Não dá para pôr foto do espaço, preço, link do cardápio ou orçamento do fornecedor na opção.
- **O site não avisa nada.** Não há notificação de pergunta nova, de votação perto de fechar, nem de decisão fixada. É preciso abrir o site.
- **Não tem histórico.** Se a comissão trocar a decisão ou reabrir, não aparece para os formandos o que estava decidido antes nem quem trocou.
- **Quem sai ou é removido da turma tem os votos apagados.** O total do relatório muda.
- **É um projeto acadêmico** de 4 alunos, sem empresa grande nem suporte com prazo.
