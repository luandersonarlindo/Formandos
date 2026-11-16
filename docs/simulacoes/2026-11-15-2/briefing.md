# Briefing da simulação 18 (2026-11-15) — rodada 2, tema 8: depois da festa e confiança

Foco: o fim do ciclo (arquivar, sair, apagar, exportar, "e se sair do ar", coordenação da faculdade, LGPD). Fonte: o código (`src/lib/fim-da-turma.ts`, `src/lib/fim-da-turma-regras.ts`, `src/lib/exportacao.ts`, `src/app/(admin)/admin/turma/registro/`, `src/app/(conta)/conta/meus-dados/page.tsx`, `src/actions/turmas.ts`, `src/lib/empresa.ts`, `src/lib/auditoria-acoes.ts`, `src/app/(publico)/termos/page.tsx`, `src/app/(publico)/privacidade/page.tsx`) e as ADR-0001, 0003, 0005, 0007, 0009, 0010, 0011 e 0012. O bloco 1 é o mesmo da simulação de `2026-11-08-6`. Os blocos 2 e 3 descrevem o site como está hoje. Nenhuma função hipotética.

## Bloco 1: Problema (Fase 1, sem citar o app)

Depois da formatura, a turma se desfaz. O grupo de WhatsApp fica parado ou alguém sai e apaga. A planilha da comissão fica no Google Drive de uma pessoa só. Ninguém sabe onde ficou a lista de quem votou em quê, quanto foi pago, o contrato do buffet, as fotos. Às vezes, meses depois, alguém precisa provar uma decisão ("a turma votou isso"), pedir um reembolso ou achar o contato do fotógrafo, e não acha. Outras vezes a pessoa quer o contrário: sair de tudo, apagar telefone, nome e histórico de grupos e planilhas que ela nem sabe quem ainda tem. Muitas turmas usam aplicativos de empresas de formatura que, quando o contrato acaba, somem com os dados, ou continuam mandando propaganda. A faculdade, por sua vez, não sabe o que os alunos usam, quem guarda os dados dos alunos e quem responde se algo vazar com o nome da instituição.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site gratuito (abre no navegador, não é app de loja) feito por 4 alunos da Unifacol. A turma usou durante a organização da formatura: votações, presença, avisos, tarefas, fornecedores, parcelas, dúvidas. Depois da festa:

- **Registro da turma (comissão).** A comissão abre uma página "Registro da turma" e salva em PDF: evento, comissão, cada decisão (escolha, data, "votaram X de Y", se foi dentro da regra combinada e a justificativa quando não foi), resultado de cada votação (só totais), presença (só totais), fornecedores contratados com o total por categoria, o caixa (arrecadado e previsto) e o histórico de mudanças. Sem dado pessoal além dos nomes da comissão, para poder repassar à turma ou à coordenação.
- **Planilhas (comissão).** Membros, votos (quem votou em quê, menos nas perguntas de voto secreto), decisões, presença, lista da portaria e fornecedores. A tesouraria baixa também pagamentos e situação por pessoa. Cada download fica registrado (quem baixou e quando), e a comissão vê esse registro.
- **Arquivar com data de exclusão (comissão).** Ao arquivar, a comissão é obrigada a escolher quando tudo será apagado: em 30, 60, 90 ou 180 dias. Não existe "guardar para sempre". A turma vira só leitura e todos veem a faixa "Turma arquivada em ... Tudo será excluído em ...". A data pode mudar, mas nunca para menos de 30 dias a partir de hoje.
- **Dois avisos por email antes de apagar.** Todos os membros recebem um email ao arquivar (ou quando a data muda) e outro 7 dias antes da exclusão, mesmo quem desligou os emails da turma. O email diz o que some e como baixar os próprios dados.
- **A exclusão acontece sozinha, nunca sem aviso.** No dia marcado o site apaga a turma inteira, inclusive o histórico dela. Se o aviso de 7 dias não chegou a todos, a exclusão espera. Depois sobra só uma linha: o nome da turma, a data e quem excluiu, guardada por 5 anos como prova de que foi apagada.
- **Cópia de segurança.** Cópia diária do banco, e as cópias com mais de 30 dias são apagadas. Dado excluído some das cópias em até 30 dias.
- **Se o site for encerrado (Termos).** Aviso por email e numa faixa no site com 60 dias de antecedência. Nesses 60 dias tudo continua funcionando, inclusive exportar e baixar os próprios dados. Depois, tudo é apagado. Se outra pessoa assumir o site, todos são avisados antes, com o nome de quem assume.
- **Sair da turma (qualquer membro).** Quem sai tem apagado o próprio rastro naquela turma: votos, dúvidas, presença. Recebe um email confirmando. As decisões já fixadas guardam a "fotografia" do dia ("votaram 41 de 63"), que não muda se alguém sair depois.
- **Meus dados (cada pessoa).** Uma página legível, em seções (turmas, votos, presença, dúvidas, pagamentos, aparelhos conectados, ações feitas pela pessoa), com botão "Salvar como PDF". Também sai em arquivo técnico (JSON) para levar a outro serviço.
- **Excluir a conta.** A pessoa digita o próprio email para confirmar. Tudo é apagado sem recuperação e chega um email confirmando, com a lista das turmas de que ela participava.
- **Histórico da turma.** Todos os membros veem o histórico das mudanças que valem para todos: decisão fixada ou reaberta, regra alterada, valor de opção, plano de parcelas, data e local do evento, arquivamento e data de exclusão. Correções de pagamento ficam no histórico da tesouraria.
- **Voto.** A comissão vê em qual opção cada um votou, menos nas perguntas de voto secreto. A turma vê só os totais.
- **Termos e Política.** Abertos a qualquer um. Dizem quem é o responsável (um dos alunos, microempreendedor individual, com CNPJ e nome), quem é o encarregado de dados (o mesmo aluno, com um email do Gmail), o que é coletado, para quê, com quem é compartilhado (só serviços técnicos), os direitos da LGPD e os prazos acima. Dizem também, no rodapé e no convite: "Projeto gratuito de alunos da Unifacol. Não é um site oficial da Unifacol." A conta é só para maiores de 18 anos.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **É um projeto acadêmico.** Quatro alunos que vão se formar. O responsável legal é um aluno (MEI). Não há empresa, contrato nem suporte com prazo. O compromisso de 60 dias de aviso está escrito nos Termos, mas a faixa e o email em massa do encerramento ainda não foram construídos: seriam feitos se um dia fosse preciso.
- **Não é da Unifacol.** A faculdade não contratou, não aprovou nem assina. O site diz isso. O encarregado de dados usa um email pessoal do Gmail.
- **Só a comissão baixa o registro da turma.** O formando comum baixa só os próprios dados. Se a comissão não exportar antes da data, o registro some.
- **Depois da exclusão, não há como recuperar.** A turma não pode escolher "guardar para sempre". Quem quer guardar precisa baixar antes.
- **Sair apaga o voto.** O resultado das votações abertas muda; as decisões fixadas guardam a fotografia do dia.
- **O voto identificado fica visível para a comissão** enquanto a turma existe, nas perguntas que não são secretas.
- **Sem segundo fator de login.** "Meus dados" mostra os aparelhos conectados, mas não há botão para desconectar um aparelho específico.
- **Não há fotos nem documentos.** Contrato, recibo, comprovante e álbum ficam fora do site.
- **Nada passa para a turma do ano seguinte.** Ela começa do zero (pode usar os modelos de votação). Fornecedores e decisões da turma anterior não são transferidos.
- **O site não confere a idade.** A regra dos 18 anos é por declaração.
