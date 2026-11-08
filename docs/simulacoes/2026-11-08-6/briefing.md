# Briefing da simulação 9 (2026-11-08) — depois da festa e confiança

Foco: o fim do ciclo de vida. O que acontece com a turma e com os dados depois da formatura: arquivar, sair, apagar, exportar, "e se o site sair do ar", a visão da coordenação da faculdade e a LGPD. Descreve o app **real**, conferido no código, não na especificação (desatualizada): `src/actions/gestao-turma.ts`, `src/actions/turmas.ts` (`sairDaTurma`), `src/actions/admin.ts` (`removerMembro`), `src/actions/conta.ts` (`excluirMinhaConta`), `src/lib/usuarios.ts` (`apagarUsuario`, `getMeusDados`), `src/app/(conta)/conta/exportar/route.ts`, `src/app/(admin)/admin/turma/page.tsx`, `src/app/(publico)/privacidade/page.tsx`, `src/app/(publico)/termos/page.tsx`, `src/lib/empresa.ts`, `src/lib/auditoria.ts`.

## Bloco 1: Problema (Fase 1, sem citar o app)

Depois da formatura, a turma se desfaz. O grupo de WhatsApp fica parado ou alguém sai e apaga. A planilha da comissão fica no Google Drive de uma pessoa só. Ninguém sabe onde ficou a lista de quem votou em quê, quanto foi pago, o contrato do buffet, as fotos. Às vezes, meses depois, alguém precisa provar uma decisão ("a turma votou isso"), pedir um reembolso ou achar o contato do fotógrafo, e não acha. Outras vezes a pessoa quer o contrário: sair de tudo, apagar telefone, nome e histórico de grupos e planilhas que ela nem sabe quem ainda tem. Muitas turmas usam aplicativos de empresas de formatura que, quando o contrato acaba, somem com os dados, ou continuam mandando propaganda. A faculdade, por sua vez, não sabe o que os alunos usam, quem guarda os dados dos alunos e quem responde se algo vazar com o nome da instituição.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site (abre no navegador, não é app de loja) feito por 4 alunos da Unifacol. A turma usou durante a organização da formatura: votações, presença, avisos, tarefas, fornecedores, dúvidas. Depois da festa:

- **Arquivar a turma (comissão).** A comissão aperta "Arquivar turma". A turma vira só leitura: todo o registro (votos, decisões, dúvidas, tarefas, programação, membros) continua lá para consulta, mas ninguém altera nada e ninguém novo entra pelo convite. Dá para desarquivar depois.
- **Excluir a turma (comissão).** Para apagar de vez, a comissão digita o nome exato da turma e confirma. Tudo some: membros, votos, dúvidas, tarefas, fornecedores. Não tem como recuperar.
- **Sair da turma (qualquer membro).** Quem sai tem apagado o próprio rastro naquela turma: votos, dúvidas, confirmação de presença, os "+1". O último administrador só sai se promover outra pessoa antes. Se a última pessoa sair, a turma é apagada. A pessoa recebe um email confirmando que saiu.
- **Ser removido (pela comissão).** A comissão pode remover alguém; o rastro dele na turma é apagado do mesmo jeito, e ele recebe um email avisando.
- **Minha conta.** Cada pessoa pode corrigir o nome, **baixar todos os seus dados** (um arquivo com conta, turmas, votos, presenças, dúvidas, tarefas e avisos que envolvem a pessoa) e **excluir a conta**: digita o próprio email para confirmar, tudo é apagado sem recuperação e chega um email confirmando, com a lista das turmas de que ela participava.
- **Registro interno de ações importantes.** O site guarda quem arquivou, desarquivou ou excluiu turma, quem mudou papel de alguém, quem removeu membro e quem excluiu a conta.
- **Termos de Uso e Política de Privacidade**, abertos a qualquer um. Dizem quem é o responsável (um dos alunos, como microempreendedor individual, com CNPJ), quem é o encarregado de dados (o mesmo aluno, com email institucional da Unifacol), o que é coletado (nome, email e o conteúdo da formatura), para quê (só organizar a formatura), com quem é compartilhado (só serviços técnicos: hospedagem, banco de dados, login do Google, envio de email), os direitos da LGPD, e que os dados ficam "enquanto a conta existir". Também diz que não coleta dado sensível, não vende dados e que dá para reclamar à ANPD.
- **Onde fica.** O site roda em serviços de nuvem conhecidos (hospedagem e banco de dados de empresas grandes). Senha é guardada embaralhada (nunca em texto), email confirmado é obrigatório.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **Não exporta a turma.** Não há como baixar o registro da turma inteira (decisões, resultado das votações, lista de presença, fornecedores, tarefas) em PDF ou planilha. O único download é o dos dados pessoais, e ele vem num arquivo técnico (JSON), difícil de abrir para quem não é de TI.
- **Sem prazo nem plano para o fim.** A turma arquivada fica guardada enquanto houver conta, sem prazo definido. Não existe compromisso escrito de avisar com antecedência se o site for desligado, nem de dar um tempo para baixar os dados antes. Os Termos dizem "serviço prestado como está, sem garantia de disponibilidade ininterrupta".
- **É um projeto acadêmico.** Quatro alunos que vão se formar. Não há empresa, contrato, suporte com prazo nem sucessor definido. O responsável legal é um aluno (MEI).
- **Não é da Unifacol.** A faculdade não contratou, não aprovou nem assina o site. Mesmo assim, o encarregado de dados usa um email institucional da Unifacol, o que pode fazer parecer que a faculdade está por trás.
- **Cópia de segurança.** O site depende das cópias automáticas do provedor do banco de dados. Não há backup próprio nem prazo de restauração prometido por escrito.
- **Sair apaga o voto, e o resultado muda.** Se alguém sai ou é removido depois de uma votação, o voto dele some e o total do relatório muda. Não fica registrado no site o resultado "como era" no dia da decisão.
- **O voto identificado fica no arquivo.** Na turma arquivada, a comissão continua vendo quem votou em cada opção.
- **O registro de ações importantes não é visível para os membros.** Só os responsáveis pelo site consultam. Não registra mudanças de valor nem de decisões.
- **Sem segundo fator de login** e sem tela que mostre ao usuário onde a conta dele está conectada.
- **Nada específico para menores de idade** (turmas de ensino médio ou ABC), nem termo de consentimento de pais.
- **Não há fotos nem documentos.** Contrato, recibo e álbum ficam fora do site, onde sempre ficaram.
