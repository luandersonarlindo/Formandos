# Briefing da simulação 16 (2026-11-15) — rodada 2, tema 2: só a comissão

Público: só quem administra a formatura (comissão e professor que ajuda a organizar). Fonte: o código (`src/app/(admin)/admin/`, `src/lib/exportacao.ts`, `src/lib/convite-lista.ts`, `src/lib/importar-pagamentos.ts`, `src/lib/papeis.ts`, `src/lib/decisao-regras.ts`, `src/lib/fim-da-turma.ts`) e as ADR-0002 a 0016. O bloco 1 é o mesmo da simulação de `2026-11-07-3`. Os blocos 2 e 3 descrevem o site como está hoje. Nenhuma função hipotética.

## Bloco 1: Problema (Fase 1, sem citar o app)

Ser da comissão de formatura numa faculdade brasileira costuma ser assim: a comissão (3 a 8 pessoas, às vezes com um professor) cuida de tudo no tempo livre, sem ganhar nada. Precisa fazer a turma votar (local, buffet, traje, música) em enquetes do WhatsApp ou formulários que ninguém sabe se fecharam. Precisa saber quem vai à festa e com quantos convidados, numa planilha que alguém atualiza à mão. Negocia com fornecedores pelo WhatsApp e guarda orçamentos em prints. Responde a mesma pergunta dezenas de vezes no privado. Divide tarefas (cotar buffet, reservar salão, encomendar beca) sem saber quem fez o quê. Quando alguém sai da comissão, a informação vai junto. E é a comissão que leva a culpa quando algo dá errado.

## Bloco 2: Produto (Fase 2, visão de quem administra)

**Formandos** é um site gratuito, feito por alunos da Unifacol (abre no navegador do celular ou do computador, não é app de loja). Você entra com a conta Google ou com email e senha. Só para maiores de 18 anos.

**Montar a turma**
- Você cria a turma e recebe um **link de convite** que já leva o código: a pessoa toca, entra com a conta e cai na turma. Dá para mandar no grupo.
- **Convidar por lista:** você cola até 200 emails de uma vez (por exemplo, da sua planilha) e o site manda o convite para cada um.
- **Tela de Membros:** quem já entrou e quem falta. Baixa a lista em planilha.
- **Papéis:** administrador (comissão), participante (formando) e **observador** (professor, coordenador: lê tudo e confirma a própria presença, não vota e não entra nas contas). Qualquer administrador pode marcar um administrador como **tesouraria**.
- **Modelos de catálogo de perguntas** por tipo de turma (área da saúde, ensino médio, pós-graduação, educação infantil), além do catálogo padrão de 23 perguntas.

**Decidir**
- Cada pergunta pode ter **prazo** e **mínimo de votos** (por exemplo, 60% da turma). Cada opção pode ter **valor por pessoa** e link.
- Voto identificado ou **secreto**, por pergunta.
- Você vê "X de Y votaram" e a lista de quem ainda não votou.
- Quem **fixa** a decisão é a comissão. Se for fora da regra (opção que não ganhou, empate, sem o mínimo, antes do prazo), o site **obriga a escrever a justificativa** e mostra para a turma inteira.
- **Histórico** visível para toda a turma: decisão fixada, votação reaberta, regra alterada, mudança no evento, mudança no plano de parcelas, com nome e hora.

**Avisar**
- **5 emails automáticos** para a turma: decisão fixada; mudança de data, horário, local ou endereço; votação que fecha em 2 dias (só para quem não votou); parcela que vence em 2 dias; prazo de presença.
- **Mandar para o grupo:** botão que monta o texto pronto de uma decisão, aviso ou mudança e abre o WhatsApp para colar.
- **Avisos** no mural. **Dúvidas** com "+1" para responder uma vez só.

**Dinheiro (só a tesouraria)**
- Plano de parcelas, **Minha situação** para cada formando, "Já paguei" com confirmação, **colar a planilha de pagamentos** para lançar tudo de uma vez, caixa da turma com o total arrecadado, regras de desistência em texto. Os outros administradores não veem o valor de cada pessoa.

**Evento e presença**
- Card do evento, programação, **página pública** sem login para família e fornecedores, aviso "Mudou em".
- Presença com **nome de cada acompanhante**, adulto ou criança, **prazo** que trava as respostas, **lista da portaria** para imprimir.

**Organizar**
- **Tarefas** com responsável, prazo e progresso. **Fornecedores** com valor orçado e situação (só a comissão vê os valores).

**Guardar e encerrar**
- Planilhas: membros, votos, decisões, presença, lista da portaria, fornecedores (e pagamentos e situação, só para a tesouraria). **Registro da turma** para imprimir ou salvar em PDF.
- Ao **arquivar** a turma depois da festa, a comissão escolhe em quantos dias tudo é apagado (30 a 180); todos recebem email ao arquivar e 7 dias antes.
- Termos e Política com responsável (nome, CNPJ de MEI, email), cópia de segurança diária, aviso de 60 dias se o site for encerrado.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **Não tem notificação no celular nem WhatsApp automático.** Aviso novo e votação nova aberta não geram email. No grupo, só chega o que a comissão colar.
- **Importar a turma é por lista de emails.** Não importa nome nem telefone da planilha; quem não tem email na lista entra só pelo link.
- **Os papéis são poucos.** Todo administrador pode tudo, menos ver o dinheiro de cada um (que é da tesouraria). Não há "secretário" ou "só tarefas". A turma pode ter mais de uma tesouraria.
- **Dinheiro:** o site não recebe nem confere pagamento, não guarda comprovante, não mostra o que saiu do caixa, não calcula juros nem multa.
- **Não tem ata de reunião** nem anexos (contrato, orçamento em PDF, foto).
- **Fornecedor não tem acesso**; recebe a página pública e as planilhas pela comissão.
- **Um aluno, uma turma.** O participante fica numa turma só; a comissão pode estar em várias.
- **Não funciona sem internet.**
- **É um projeto de alunos**, com responsável identificado, mas sem empresa por trás nem suporte com prazo.
- **Sair da turma apaga** os votos, a presença e as dúvidas da pessoa. Pagamentos confirmados ficam no caixa, sem o nome.
