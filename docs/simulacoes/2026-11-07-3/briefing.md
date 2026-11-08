# Briefing da simulação 3 (2026-11-07) — foco na comissão

Público: só quem administra a formatura (comissão e professor que ajuda a organizar). Descreve o app **real**, sem as melhorias hipotéticas da simulação 2. Fonte: `README.md` e `docs/Especificação de Requisitos de Software.md`.

## Bloco 1: Problema (Fase 1, sem citar o app)

Ser da comissão de formatura numa faculdade brasileira costuma ser assim: a comissão (3 a 8 pessoas, às vezes com um professor) cuida de tudo no tempo livre, sem ganhar nada. Precisa fazer a turma votar (local, buffet, traje, música) em enquetes do WhatsApp ou formulários que ninguém sabe se fecharam. Precisa saber quem vai à festa e com quantos convidados, numa planilha que alguém atualiza à mão. Negocia com fornecedores pelo WhatsApp e guarda orçamentos em prints. Responde a mesma pergunta dezenas de vezes no privado. Divide tarefas (cotar buffet, reservar salão, encomendar beca) sem saber quem fez o quê. Quando alguém sai da comissão, a informação vai junto. E é a comissão que leva a culpa quando algo dá errado.

## Bloco 2: Produto (Fase 2, visão de quem administra)

**Formandos** é um site (abre no navegador do celular ou do computador, não é app de loja) para organizar a formatura de uma turma. Você entra com a conta Google ou com email e senha (com link de confirmação no email).

- **Criar a turma:** quem não tem turma pode criar uma e vira administrador dela. Um administrador pode estar em várias turmas e troca entre elas na barra lateral.
- **Convite:** a turma tem um código privado. Você copia o código já com uma mensagem pronta para colar no WhatsApp, e pode gerar um código novo se o antigo vazar. Cada formando entra sozinho digitando o código; não dá para cadastrar a lista da turma de uma vez.
- **Membros:** lista com busca por nome ou email. Você pode promover alguém a administrador, rebaixar ou remover. Todos os administradores têm os mesmos poderes (não existe "só tesoureiro" ou "só secretário"). O último administrador não pode sair enquanto houver outros membros.
- **Votações:** já vem um catálogo pronto com 10 temas e 23 perguntas (formato do evento, espaço, comida, bebida, música, fotos, segurança, traje, rituais, orçamento e arrecadação). Você pode desligar esse catálogo para a sua turma e criar catálogos próprios, do zero ou a partir de modelos (ensino médio, pós-graduação, saúde). As opções podem ser de escolha única, múltipla ou com uma opção que exclui as outras. Os alunos podem mudar o voto.
- **Ver quem votou:** em cada pergunta você vê, por opção, quem votou e quem ainda não votou. O relatório geral para a turma mostra só totais e percentuais, sem nomes.
- **Fixar decisão:** você fixa a escolha da turma numa pergunta. Ela aparece na tela inicial de todos e a votação fecha. Dá para reabrir. Não há prazo de encerramento automático nem quórum.
- **Dúvidas:** os alunos mandam perguntas e curtem as dos colegas; as mais curtidas sobem. Você responde, destaca, marca como respondida, reabre ou apaga.
- **Avisos:** você publica recados num mural; os 3 mais recentes aparecem na tela inicial de todos.
- **Dados do evento:** data, horário, local com endereço e botão "Como chegar", traje, observações e programação, tudo editável por você. A tela inicial mostra uma contagem regressiva.
- **Tarefas:** você cria tarefas com título, descrição, responsável, prazo e status. Os membros só podem mudar o status.
- **Presença:** cada membro diz se vai (vou, talvez, não vou) e quantos acompanhantes leva. Você define o máximo de acompanhantes por pessoa (padrão 5, até 20) e vê o total de pessoas esperadas, com filtro.
- **Fornecedores:** você cadastra fornecedores por categoria (buffet, músicos, fotógrafo, segurança etc.) com valor orçado e situação (cotando, contratado, descartado). No topo aparece o total orçado e o total já comprometido. Os alunos veem a vitrine, mas não os valores.
- **Arquivar ou excluir:** depois da festa, você arquiva a turma (fica só para leitura) ou exclui de vez, digitando o nome para confirmar.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **Não tem pagamento nem controle de parcelas.** Não cobra, não gera boleto nem Pix, não registra quem pagou. A parte de dinheiro da turma continua na sua planilha.
- **Não avisa ninguém.** Aviso novo, votação nova ou decisão fixada não geram email nem notificação. Os emails só cobrem eventos de conta (cadastro, senha, entrar ou sair da turma). Para a turma ver, você precisa avisar no WhatsApp.
- **Não importa nem exporta.** Não dá para importar a lista de formandos de uma planilha nem exportar votos, presença ou fornecedores para Excel.
- **Todos os administradores podem tudo.** Não há papéis diferentes na comissão nem registro de quem alterou o quê.
- **Sem prazo nem quórum nas votações.** A votação só fecha quando alguém fixa a decisão.
- **Sair da turma apaga** os votos, a presença e as dúvidas daquela pessoa. Tarefas, avisos e decisões que ela criou ficam, mas sem autor.
- **Não tem app de loja nem funciona sem internet.**
- **É um projeto acadêmico** de um grupo de 4 alunos. Não tem empresa por trás, nem suporte com prazo, nem monitoramento de falhas. Se sair do ar, não há compensação.
- **Fornecedor não tem acesso.** Tudo o que aparece sobre ele é a comissão que digita.
