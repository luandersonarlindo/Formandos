# Briefing da simulação 15 (2026-11-15) — rodada 2, tema 7: reta final e dia do evento

Foco: a semana da festa e o próprio dia. Testa de novo a mudança de horário 3 dias antes. Fonte: o código (`src/app/(app)/dashboard/page.tsx`, `src/app/(publico)/evento/[token]/page.tsx`, `src/lib/evento-publico.ts`, `src/components/features/evento-admin.tsx`, `src/components/features/form-presenca.tsx`, `src/app/(admin)/admin/presenca/`, `src/lib/email.ts`) e as ADR-0004, 0006, 0008, 0012, 0013 e 0015. O bloco 1 é o mesmo da simulação de `2026-11-08-5`. Os blocos 2 e 3 descrevem o site como está hoje. Nenhuma função hipotética.

## Bloco 1: Problema (Fase 1, sem citar o app)

A semana da formatura é a mais caótica de todo o processo. O buffet quer o número final de pessoas. O espaço quer a lista de nomes para a portaria. Tem formando que confirmou que ia e desistiu, e formando que dizia "talvez" e agora quer levar mais três pessoas. Os pais perguntam a que horas chegar, onde estacionar e qual o traje. Avó de cadeira de rodas precisa saber se tem rampa. Aí, três dias antes, alguma coisa muda: o horário de entrada, o portão, o local da foto oficial, a hora do ensaio da colação. A comissão manda no grupo de WhatsApp, e a mensagem some no meio de 400 outras ("parabéns", figurinhas, briga sobre o DJ). Muita gente silenciou o grupo há meses. Os convidados nem estão no grupo e dependem do formando repassar. No dia, alguém chega no horário antigo, alguém vai para o portão errado, o nome do acompanhante não está na lista, e a comissão passa a noite atendendo ligação em vez de aproveitar a própria formatura.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site gratuito, feito por alunos da Unifacol (abre no navegador do celular, não é app de loja). Cada formando entra pelo link de convite da turma, com a conta Google ou com email e senha. A comissão administra.

O que existe para a reta final:

- **Card do evento na tela inicial.** Data, horário de início e de término, contagem regressiva, local, endereço, botão "Como chegar", traje, observações do local (estacionamento, rampa, portão) e programação com horário de cada momento.
- **"Mudou em".** Quando a comissão muda data, horário, local ou endereço, o card mostra um aviso: "Mudou em 12/12 às 18h: horário era 20h, agora é 19h". O mesmo aviso aparece na página pública.
- **Email "Mudou".** Na hora da mudança, todos os membros recebem um email com o assunto "Mudou: horário da formatura", dizendo o antes e o depois. Dá para desligar os emails da turma.
- **Mandar para o grupo.** Ao salvar a mudança, a comissão tem um botão que monta o texto pronto ("Mudou o horário: era 20h, agora é 19h...") e abre o WhatsApp para colar no grupo.
- **Página pública do evento.** Um link que abre sem conta e sem senha, para a família, os convidados e os fornecedores: data, horário, local, endereço, "Como chegar", traje, observações, programação e o aviso "Mudou em". Não aparece em buscador.
- **Confirmação de presença com nomes.** O formando diz se vai e informa o nome de cada acompanhante, marcando se é adulto ou criança, até o limite da comissão. Há um **prazo**: depois dele a resposta trava e só a comissão muda. Dois dias antes do prazo chega um email para quem não respondeu ou marcou "talvez".
- **Se a comissão baixa o limite**, ninguém é cortado: as respostas acima do limite ficam marcadas para a comissão conversar com a pessoa.
- **Painel de presença da comissão.** Total de pessoas, adultos e crianças, quem está em dúvida e quem não respondeu.
- **Lista da portaria.** Uma página para imprimir, em ordem alfabética, com o nome de cada pessoa, se é adulto ou criança e de quem é convidado, e o total no topo. Também sai em planilha.
- **Professor como observador** confirma a própria presença e entra na lista.
- **Avisos** no mural, com os 3 mais recentes na tela inicial. **Tarefas** e **Dúvidas** como antes.
- As telas de presença e do evento foram testadas com leitor de tela (TalkBack e VoiceOver).

## Bloco 3: Pontos fracos conhecidos (Fase 3)

**Cenário de teste:** três dias antes da festa, o espaço muda o horário de entrada de 20h para 19h e a entrada passa a ser pelo portão lateral. A comissão muda o horário no site e escreve o portão lateral nas observações do local. Publica um aviso no mural: "ATENÇÃO: entrada às 19h pelo portão lateral". O site manda o email "Mudou: horário da formatura" para todos os membros. A comissão tem o botão "Mandar para o grupo".

Pontos fracos:

- **O email "Mudou" cobre data, horário, local e endereço.** A troca de portão, escrita nas observações, não gera email nem entra no "Mudou em". Só aparece se a pessoa ler as observações ou o aviso do mural. Aviso novo no mural não gera email.
- **Não tem notificação no celular nem mensagem de WhatsApp automática.** No grupo só chega se alguém da comissão tocar em "Mandar para o grupo" e colar.
- **Quem desligou os emails da turma não recebe o "Mudou".**
- **Convidado só sabe se tiver o link da página pública.** O link é um só para a turma; o formando precisa repassar. O site não manda nada para o convidado.
- **Não tem ingresso, QR code nem check-in.** A lista da portaria é impressa ou aberta no celular por alguém da comissão.
- **Depois do prazo, a presença trava.** Quem quiser levar mais gente na véspera precisa falar com a comissão.
- **Precisa de internet.** Sem sinal no local, a página não abre. A lista impressa é a reserva.
- **Fornecedor não tem conta.** Recebe a página pública e a planilha pela comissão.
- **É um projeto de alunos**, com responsável identificado, cópia de segurança diária e aviso de 60 dias se for encerrado, mas sem suporte com prazo. Se cair no sábado à noite, não há quem atenda.
