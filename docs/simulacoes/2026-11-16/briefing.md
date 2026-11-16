# Briefing da simulação 20 (2026-11-16) — rodada 2, tema 10: turma que já tem planilha e grupo

Foco: uma turma no meio do ano, com planilha de pagamentos e grupo de WhatsApp funcionando, avalia passar a usar o site. Mesmas personas da simulação de `2026-11-08-7` (que testou um pacote hipotético); agora o pacote existe. Fonte: o código (`src/lib/importar-pagamentos.ts`, `src/lib/convite-lista.ts`, `src/lib/exportacao.ts`, `src/lib/texto-whatsapp.ts`, `src/lib/decisao-regras.ts`, `src/lib/email.ts`) e as ADR-0002 a 0016, com destaque para a ADR-0007 (exportar e importar), a ADR-0014 (importar lançamentos) e a ADR-0016 (WhatsApp oficial: não adotar). O bloco 1 é o mesmo da simulação de `2026-11-08-7`, com a situação de meio de ano. Nenhuma função hipotética.

## Bloco 1: Problema (Fase 1, sem citar o app)

Toda turma de formatura organiza a festa e o dinheiro pelo grupo de WhatsApp. Aviso importante some no meio de centenas de mensagens e muita gente silenciou o grupo. Votações em enquete do WhatsApp somem, metade não vota, e a comissão decide sozinha e leva a culpa. Ninguém sabe quanto custa cada opção antes de votar. O dinheiro vai para o Pix de alguém da comissão, anotado numa planilha; quem paga não sabe se o pagamento foi registrado, quem atrasa é cobrado em público. Na semana da festa, mudança de horário ou de portão não chega a todo mundo. Pais perguntam ao filho e o filho não sabe responder.

Situação desta turma: estamos em junho, a formatura é em dezembro. A turma tem 48 formandos, um grupo de WhatsApp com 52 pessoas e uma planilha de pagamentos no Google com quatro meses de parcelas lançadas pela tesoureira. O local e o buffet já foram decididos em enquetes do WhatsApp. Faltam o traje, a banda, a lista de convidados e as parcelas de julho a novembro.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site gratuito, feito por alunos da Unifacol (abre no navegador, não é app de loja). A comissão cria a turma e convida. O que existe para uma turma que já está no meio do caminho:

- **Entrar:** a comissão manda um link de convite no grupo (a pessoa toca, entra com o Google ou com email e senha, declara ter 18 anos ou mais e cai na turma) ou cola a lista de emails da planilha (até 200 por vez) e o site manda o convite para cada um.
- **Trazer os pagamentos da planilha:** a tesouraria copia as linhas da planilha (email, valor, data; forma, quem pagou e referência são opcionais) e cola no site. Antes de gravar, uma prévia mostra quantas linhas, a soma, quantas pessoas e as linhas com problema (email que não é da turma, valor ou data inválidos). Com qualquer problema, nada entra; corrige e cola de novo. **Colar a mesma planilha de novo não duplica**: o que já foi lançado fica de fora. Assim dá para colar a planilha inteira todo mês enquanto as duas existirem.
- **Plano de parcelas:** a tesouraria cadastra o valor total e as parcelas com vencimento. Cada formando vê a sua **"Minha situação"** (o que pagou, o que falta, o que vence), que só ela e a tesouraria veem. Pode marcar "Já paguei" e a tesouraria confirma. A turma vê só os totais do caixa. O site **registra**, não recebe dinheiro: o Pix continua indo para a conta de sempre.
- **Conferir site contra planilha:** a tesouraria baixa a planilha "Situação por pessoa" (plano, pago, falta, parcelas vencidas) para comparar de uma vez.
- **Decisões já tomadas no WhatsApp:** a comissão cria a pergunta (por exemplo, "Local") e fixa a opção decidida. Como ninguém votou no site, ela escreve a justificativa ("Decidido em enquete do WhatsApp em 12/03, 31 votos"), que fica visível para a turma no histórico.
- **Decisões que faltam:** votação com prazo, mínimo de participação, valor por pessoa em cada opção, voto secreto se a comissão quiser, "quem ainda não votou" para a comissão cobrar, e email para quem não votou perto do prazo.
- **Mandar para o grupo:** em avisos, votações, decisões e no evento, um botão monta o texto pronto e abre o WhatsApp para a comissão colar no grupo.
- **Emails só para o essencial:** decisão fixada, mudança no evento, prazo de votação (só para quem não votou), prazo de parcela e prazo de presença. Cada um pode desligar.
- **Presença com nomes, lista da portaria, página do evento para a família** (sem conta), **tarefas, fornecedores e histórico** de mudanças com nome e hora.
- **Exportar:** a comissão baixa planilhas de membros, votos, decisões, presença, portaria e fornecedores, e o registro da turma em PDF; a tesouraria baixa pagamentos e situação por pessoa.
- **Confiança:** responsável identificado (aluno com MEI), cópia de segurança diária, aviso de 60 dias se o site for encerrado (escrito nos Termos), prazo de exclusão ao arquivar.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **O site não posta no grupo do WhatsApp sozinho, e não vai postar.** O grupo decidiu não usar a API oficial do WhatsApp (custo, número próprio, telefone de cada um, aprovação da Meta, e ela não entra em grupo). A comissão continua colando o texto no grupo.
- **Votação nova e aviso novo não geram email nem notificação.** Para a turma ver, a comissão cola no grupo.
- **Durante a migração há dois lugares.** Enquanto a turma não entra toda, a comissão mantém planilha e site. Colar de novo não duplica, mas alguém precisa colar.
- **Importar só pagamentos.** O plano de parcelas, devoluções e ajustes são feitos à mão no site. Juros e multa não são calculados; a regra fica escrita em "Regras do dinheiro" e a diferença entra como ajuste.
- **O email é a chave.** Na importação e no convite por lista, a pessoa é identificada pelo email. Planilha com só nome e telefone precisa ganhar uma coluna de email. Quem paga com outro email (o pai, por exemplo) não casa.
- **Sem anexo:** comprovante, contrato e recibo continuam fora do site.
- **Decisões do WhatsApp entram como "fora da regra"**, com justificativa, porque não tiveram votos no site.
- **A família não vê a situação do formando.** "Minha situação" é só do formando e da tesouraria. Pai ou mãe sem conta vê só a página do evento. Se entrar pelo link de convite, vira participante da turma, com voto, como um formando.
- **Quem não entrar no site** continua sabendo só pelo grupo.
- **É um projeto de alunos**, sem suporte com prazo.
