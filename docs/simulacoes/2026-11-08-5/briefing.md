# Briefing da simulação 8 (2026-11-08) — reta final e dia do evento

Foco: a semana da festa e o próprio dia. Presença, acompanhantes, mudanças de última hora e avisos. Testa o bloqueio "o site não avisa" no momento em que ele mais pesa. Descreve o app **real**, conferido no código (`src/actions/presenca.ts`, `src/lib/presenca-regras.ts`, `src/lib/presenca.ts`, `src/app/(admin)/admin/presenca/page.tsx`, `src/components/features/form-presenca.tsx`, `src/actions/evento.ts`, `src/lib/evento.ts`, `src/app/(app)/dashboard/page.tsx`, `src/actions/avisos.ts`, `src/lib/email.ts`).

## Bloco 1: Problema (Fase 1, sem citar o app)

A semana da formatura é a mais caótica de todo o processo. O buffet quer o número final de pessoas. O espaço quer a lista de nomes para a portaria. Tem formando que confirmou que ia e desistiu, e formando que dizia "talvez" e agora quer levar mais três pessoas. Os pais perguntam a que horas chegar, onde estacionar e qual o traje. Avó de cadeira de rodas precisa saber se tem rampa. Aí, três dias antes, alguma coisa muda: o horário de entrada, o portão, o local da foto oficial, a hora do ensaio da colação. A comissão manda no grupo de WhatsApp, e a mensagem some no meio de 400 outras ("parabéns", figurinhas, briga sobre o DJ). Muita gente silenciou o grupo há meses. Os convidados nem estão no grupo e dependem do formando repassar. No dia, alguém chega no horário antigo, alguém vai para o portão errado, o nome do acompanhante não está na lista, e a comissão passa a noite atendendo ligação em vez de aproveitar a própria formatura.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site (abre no navegador do celular, não é app de loja). Cada formando entra com email ou Google e entra na turma com um código de convite. A comissão é quem administra.

O que existe para a reta final:

- **Card do evento na tela inicial.** Data, horário de início e de término, contagem regressiva, nome do local, endereço, botão "Como chegar" (abre o mapa), traje, observações do local (ex.: estacionamento, acessibilidade) e uma descrição. A comissão edita tudo isso quando quiser.
- **Programação.** Lista com horário e título de cada momento (ex.: 19h recepção, 20h colação simbólica, 21h jantar, 22h baile), que aparece para todos na tela inicial.
- **Confirmação de presença.** Na tela inicial, "Você vai ao evento?": Vou, Talvez ou Não vou. Quem marca "Vou" informa quantos acompanhantes leva, até o limite que a comissão definiu (padrão 5 por pessoa). Tem um campo de observação livre (ex.: "minha mãe e meu irmão; uma pessoa vegetariana"). Dá para mudar a resposta quando quiser.
- **Painel de presença da comissão.** Total de pessoas esperadas (formandos que vão + acompanhantes), quantos estão em dúvida, e uma lista filtrável por Vou, Talvez, Não vou e Sem resposta, com a observação de cada um. A comissão também define o limite de acompanhantes por pessoa.
- **Avisos.** A comissão publica recados no mural do site. Os mais recentes aparecem na tela inicial de todo mundo.
- **Tarefas.** A comissão cria tarefas com responsável e prazo (ex.: "Levar lista para a portaria", "Confirmar número com o buffet").
- **Dúvidas.** Qualquer formando pergunta, os outros dão "+1", a comissão responde (ex.: "Pode levar criança?").

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **O site não avisa ninguém de nada.** Aviso novo, mudança de horário, de local ou da programação não gera email, WhatsApp, SMS nem notificação no celular. Só aparece para quem abrir o site. Os únicos emails que o site manda são de conta (confirmar email, senha) e de entrar ou sair da turma.
- **Mudar o evento não deixa rastro.** Se a comissão trocar o horário de 20h para 19h, a tela mostra só o novo. Não aparece "mudou", nem qual era o horário antigo, nem quando mudou.
- **Aviso não tem destaque.** Não dá para marcar um aviso como urgente nem fixar no topo. O mais novo aparece primeiro e os outros descem. A comissão não sabe quem leu.
- **A presença não tem prazo.** Qualquer um muda a resposta até no dia da festa. A comissão não é avisada quando alguém muda. O número que foi para o buffet pode não bater com o da noite.
- **Acompanhante não tem nome nem acesso.** O site guarda só o número de acompanhantes. O nome só vai se a pessoa escrever na observação. Convidados e familiares não têm conta e não veem nada: dependem do formando repassar.
- **Não tem lista para a portaria.** Não tem ingresso, QR code nem check-in na entrada. A lista da comissão aparece de 10 em 10 nomes na tela e não dá para imprimir nem exportar.
- **Baixar o limite corta respostas sem avisar.** Se a comissão reduzir o limite de acompanhantes (ex.: de 5 para 2), quem tinha posto mais tem o número cortado automaticamente, e a pessoa não é avisada.
- **Precisa de internet.** Não funciona offline. Se no local não tiver sinal, ninguém abre a programação nem o endereço.
- **Fornecedor não tem acesso.** O buffet e o cerimonial recebem o número e o horário pela comissão, por fora.
- **É um projeto acadêmico** de 4 alunos, sem empresa nem suporte com prazo. Se o site cair no sábado à noite, não tem quem atenda.
