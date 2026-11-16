# Briefing da simulação 19 (2026-11-15) — rodada 2, tema 9: família e convidado sem conta

Foco: a semana da festa vista por quem **não é da turma**: mãe, avô, namorada, pai que mora longe, irmã que organiza a família, tia, professor homenageado e fornecedor. Tema novo na rodada 2, sem base na rodada 1 (achado F: "convidado sem conta"). Fonte: o código (`src/app/(publico)/evento/[token]/page.tsx`, `src/lib/evento-publico.ts`, `src/lib/texto-whatsapp.ts`, `src/lib/email.ts`, `src/components/features/form-presenca.tsx`, `src/lib/exportacao.ts`) e as ADR-0004, 0006, 0008, 0011, 0012 e 0013. Nenhuma função hipotética.

## Bloco 1: Problema (Fase 1, sem citar o app)

Quem vai à formatura sem ser formando fica sabendo de tudo por tabela. A mãe pergunta ao filho a que horas é, e ele responde "depois eu vejo". O avô que mora no interior precisa saber com antecedência para pedir carona ou pegar o ônibus. A namorada não sabe o traje e tem vergonha de perguntar de novo. O pai que mora em outro estado precisa comprar passagem e não sabe se a data já está fechada. A irmã que leva a avó de cadeira de rodas quer saber se tem rampa, onde estacionar e por qual portão entrar. O professor homenageado recebe o convite impresso, mas o horário da homenagem muda e ninguém avisa. O buffet e o cerimonial pedem a lista de nomes da portaria e recebem um print de planilha pelo WhatsApp na véspera. Três dias antes, alguma coisa muda (horário, portão, local da foto), a comissão avisa no grupo da turma, e quem não está no grupo depende de alguém lembrar de repassar. Muita família recebe link estranho no WhatsApp e tem medo de golpe. No dia, tem convidado no portão errado, nome que não está na lista e avó esperando no sol.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site gratuito, feito por alunos da Unifacol, que a comissão de formatura usa para organizar a turma. Os formandos têm conta. **Família, convidados e fornecedores não precisam de conta.** O que chega até eles:

- **Página do evento, por link.** A comissão cria um link e repassa (no grupo da turma, e cada formando manda para a família). O link abre no navegador do celular, **sem conta, sem senha, sem baixar nada**. Mostra: "Formatura" e o nome da turma; data e horário de início e de término; local e endereço; botão **"Como chegar"**, que abre o mapa; traje; **"Bom saber"** (observações do local: estacionamento, rampa, portão, o que a comissão escrever); um texto da comissão; a **programação** com o horário de cada momento (entrada, colação, homenagens, jantar, festa); e no rodapé "Atualizado em dd/mm às hh:mm. Página da comissão de formatura, feita no Formandos."
- **"Mudou em".** Quando a comissão muda data, horário, local ou endereço, aparece no topo da página um aviso amarelo: "Mudou em 12/12 às 18h: Horário: era ~~20:00~~, agora é **19:00**". O aviso fica na página por 14 dias.
- **A página não pede nada nem mostra ninguém.** Não aparece no Google. Não mostra a lista de formandos, quem vai, votos nem dinheiro. Com esse link ninguém entra na turma.
- **Como o link chega:** a comissão tem um botão que monta o texto pronto para o WhatsApp, com "Link para repassar à família e aos convidados". O email que os formandos recebem quando algo muda no evento também traz o link para repassar. O link é **um só para a turma toda**; se a comissão gerar outro, o antigo para de funcionar.
- **Nome na lista da portaria.** O formando confirma presença no site e escreve o nome de cada acompanhante, marcando adulto ou criança, até o limite que a comissão definir e até o prazo. A comissão imprime a **lista da portaria** em ordem alfabética, com o nome de cada pessoa, se é adulto ou criança e de quem é convidada, e o total. Também sai em planilha, que a comissão manda ao buffet e ao cerimonial.
- **Professor homenageado ou paraninfo:** pode receber da comissão um convite para entrar no site como **observador**. Aí precisa criar conta (Google ou email e senha, maior de 18). Vê tudo da turma, confirma a própria presença e entra na lista da portaria, mas não vota nem administra. Se não quiser conta, recebe o link do evento como qualquer convidado.
- **Fornecedor** não tem conta. Recebe da comissão o link do evento e a planilha da portaria.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

**Cenário de teste:** três dias antes da festa, o espaço muda o horário de entrada de 20h para 19h e a entrada passa a ser pelo portão lateral. A comissão muda o horário no site e escreve o portão lateral no "Bom saber". A página do evento passa a mostrar "Mudou em ...: Horário: era 20:00, agora é 19:00". Os formandos recebem um email "Mudou: horário da formatura", com o link para repassar. A comissão cola o texto pronto no grupo da turma.

Pontos fracos:

- **A página não avisa ninguém.** Família e convidados não recebem email, mensagem nem notificação. Só sabem da mudança se **abrirem o link de novo** ou se o formando (ou alguém) avisar.
- **A troca de portão não entra no "Mudou em".** Ela aparece só no "Bom saber", sem destaque. O aviso amarelo cobre data, horário, local e endereço.
- **O link depende do formando repassar.** O site não manda nada direto para a família. Se o formando esquecer ou não for de repassar, a família fica sem.
- **O link é igual para todos e pode circular.** Qualquer pessoa com ele vê data, local e programação. Se a comissão gerar outro link, quem tinha o antigo fica com página que não abre ("Este link não existe ou foi desligado pela comissão").
- **O convidado não confirma presença.** Quem coloca o nome na lista é o formando, no site, até o prazo. Depois do prazo só a comissão muda. O convidado não vê se o nome dele está na lista.
- **Não tem ingresso, QR code nem check-in.** A portaria usa a lista impressa ou a planilha.
- **Não tem foto, vídeo nem álbum.** Nem antes nem depois.
- **Precisa de internet.** Sem sinal no local, a página não abre.
- **Professor que quiser ver mais que o evento precisa criar conta** como observador.
- **É um projeto de alunos.** O link tem endereço do Formandos, não da faculdade nem do buffet. A página diz "Página da comissão de formatura, feita no Formandos", sem o nome de quem é da comissão.
