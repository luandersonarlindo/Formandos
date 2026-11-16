# Briefing da simulação 14 (2026-11-14) — rodada 2, tema 6: dinheiro

Foco: como a turma lida com o dinheiro da formatura e o que o Formandos faz ou não faz nisso. Fonte: o código (`src/app/(app)/minha-situacao/page.tsx`, `src/app/(admin)/admin/tesouraria/page.tsx`, `src/lib/situacao-regras.ts`, `src/lib/importar-pagamentos.ts`, `src/lib/saida-turma.ts`) e as ADR-0003, 0005, 0006, 0007, 0008 e 0014. O bloco 1 é o mesmo da simulação de `2026-11-08-4`. Os blocos 2 e 3 descrevem o site como está hoje. Nenhuma função hipotética.

## Bloco 1: Problema (Fase 1, sem citar o app)

Formatura custa caro: baile, buffet, fotógrafo, banda, espaço, beca, colação. O dinheiro costuma sair de mensalidades por vários meses, rifas, festas para arrecadar e, às vezes, cota extra no final. Hoje quem cuida disso é alguém da comissão, que recebe Pix na conta pessoal ou numa conta aberta para a turma, anota numa planilha (ou num caderno) e cobra no grupo de WhatsApp. Quem paga não sabe se o pagamento foi registrado. Quem atrasa é cobrado em público ou fica com vergonha. Ninguém vê quanto já entrou, quanto falta e quanto foi gasto com cada fornecedor. Quando alguém desiste da festa, ninguém sabe se tem devolução. Há histórias de tesoureiro que sumiu com o dinheiro, de buffet que recebeu sinal e fechou, e de brigas porque "a comissão gastou sem perguntar". Pais que ajudam a pagar perguntam ao filho e o filho não sabe responder.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site gratuito, feito por alunos da Unifacol (abre no navegador do celular, não é app de loja). Cada formando entra com a conta Google ou com email e senha, pelo link de convite da turma. O site **não recebe dinheiro**: o Pix continua sendo feito para a conta que a turma já usa. O site registra. Ele não pede CPF nem dado de banco.

O que existe hoje ligado a dinheiro:

- **Tesouraria.** Uma pessoa da comissão é marcada como tesouraria. Só ela vê e lança o dinheiro de cada um. Os outros membros da comissão não veem quanto cada pessoa pagou.
- **Plano de parcelas.** A tesouraria monta o plano da turma (por exemplo, 10 parcelas de R$ 150, uma por mês). O plano é igual para todos.
- **Minha situação.** Uma tela só sua: total do plano, quanto você já pagou, quanto falta, cada parcela (paga, parcial, vencida, a vencer) e a próxima a vencer. Só você e a tesouraria veem.
- **Já paguei.** Depois de fazer o Pix, você toca em "Já paguei" e informa valor, data, forma, quem pagou (por exemplo "mãe") e o código do Pix. Fica como "aguardando confirmação" até a tesouraria conferir no extrato e confirmar ou recusar com o motivo.
- **Lançamentos da tesouraria.** Ela registra pagamento, devolução ou ajuste (desconto, crédito). Aceita pagamento parcial e pagamento adiantado: o valor é aplicado às parcelas em ordem de vencimento. Ela pode **colar a planilha** que já tem (email, valor, data, forma, quem pagou, referência) e o site lança tudo de uma vez.
- **Caixa da turma.** Todos veem "R$ X arrecadados de R$ Y previstos", sem nomes.
- **Regras do dinheiro.** Um texto escrito pela comissão sobre desistência, devolução e multa, que todos leem em "Minha situação".
- **Mudanças no plano.** Se a tesouraria muda o valor ou o vencimento de uma parcela, aparece para a turma uma lista com o antes e o depois.
- **Email de parcela.** Chega um email 2 dias antes do vencimento, só para quem está com a parcela em aberto. Dá para desligar.
- **Valor por pessoa nas votações.** Nas perguntas criadas pela comissão, cada opção pode mostrar o valor por pessoa e um link (orçamento, cardápio). A decisão tem prazo, mínimo de votos e histórico.
- **Planilhas.** A tesouraria baixa a "Situação por pessoa" e a lista de membros. Cada pessoa baixa os próprios dados em "Minha conta".
- **Fornecedores.** A comissão cadastra buffet, DJ, fotografia etc. e anota um valor orçado e a situação (cotando, contratado, descartado). Os formandos veem a lista e o contato, sem os valores.
- **Quem sai da turma:** os pagamentos confirmados continuam no caixa, sem o nome da pessoa.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **O site não recebe nem confere pagamento.** Não gera Pix nem boleto e não olha o banco. A tesouraria confere o extrato e confirma cada "Já paguei" à mão.
- **Não guarda comprovante.** Não dá para anexar imagem nem PDF. O que fica é o texto com o código do Pix. Não emite recibo.
- **O caixa mostra só o que entrou.** Não mostra quanto foi gasto, quanto sobrou nem para quem foi pago. O valor de cada fornecedor continua visível só para a comissão.
- **O plano é igual para todos.** Bolsa, desconto ou quem vai só à colação entram como "ajuste" lançado pela tesouraria, pessoa por pessoa.
- **Não calcula juros nem multa.** A regra de desistência e devolução é um texto: o site não aplica.
- **Tudo depende de uma pessoa.** Se a tesouraria não lança ou demora a confirmar, a sua situação fica desatualizada. A comissão pode trocar quem é a tesouraria.
- **A família não tem acesso.** Quem paga pelo formando não vê as parcelas, só se o formando mostrar a tela. O campo "quem pagou" é só um texto.
- **O fornecedor não tem acesso** e não confirma recebimento pelo site.
- **Aviso por WhatsApp não existe.** O lembrete de parcela é por email. Cobrança no grupo continua sendo feita por gente.
- **Quem cuida do dinheiro de verdade continua sendo a pessoa dona da conta do Pix.** O site não impede ninguém de sumir com o dinheiro: mostra o total que a tesouraria confirmou.
- **É um projeto de alunos**, com responsável identificado (nome, CNPJ de MEI, email de contato), cópia de segurança diária e aviso de 60 dias se for encerrado, mas sem empresa por trás nem suporte com prazo.
