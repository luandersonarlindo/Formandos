# Briefing da simulação 7 (2026-11-08) — dinheiro e orçamento

Foco: como a turma lida com o dinheiro da formatura (arrecadar, cobrar, pagar fornecedor, prestar contas) e o que o Formandos faz ou não faz nisso. Descreve o app **real**, conferido no código (`src/lib/orcamento.ts`, `src/lib/terceiros.ts`, `src/actions/terceiros.ts`, `src/app/(app)/terceiros/page.tsx`, `src/actions/presenca.ts`, `docs/catalogos-modelo/catalogo-enquetes.md`), não só na especificação (que está desatualizada).

## Bloco 1: Problema (Fase 1, sem citar o app)

Formatura custa caro: baile, buffet, fotógrafo, banda, espaço, beca, colação. O dinheiro costuma sair de mensalidades por vários meses, rifas, festas para arrecadar e, às vezes, cota extra no final. Hoje quem cuida disso é alguém da comissão, que recebe Pix na conta pessoal ou numa conta aberta para a turma, anota numa planilha (ou num caderno) e cobra no grupo de WhatsApp. Quem paga não sabe se o pagamento foi registrado. Quem atrasa é cobrado em público ou fica com vergonha. Ninguém vê quanto já entrou, quanto falta e quanto foi gasto com cada fornecedor. Quando alguém desiste da festa, ninguém sabe se tem devolução. Há histórias de tesoureiro que sumiu com o dinheiro, de buffet que recebeu sinal e fechou, e de brigas porque "a comissão gastou sem perguntar". Pais que ajudam a pagar perguntam ao filho e o filho não sabe responder.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site (abre no navegador do celular, não é app de loja). Cada formando entra com um link de email ou Google e entra na turma com um código de convite. A comissão é quem administra.

O que existe hoje ligado a dinheiro:

- **Terceiros (fornecedores).** A comissão cadastra os fornecedores (buffet, DJ, fotografia, espaço, decoração etc.) com nome, categoria, descrição, contato e foto. Todo formando vê essa lista com o contato de cada um, **sem valores**.
- **Orçamento da comissão.** Em cada fornecedor a comissão anota um "valor orçado" e um status: Cotando, Contratado ou Descartado. No topo da tela, só a comissão vê o total: "R$ X orçado · R$ Y contratado · R$ Z em cotação. Só administradores veem valores."
- **Votações sobre dinheiro.** O catálogo padrão de perguntas traz "Como a turma prefere arrecadar o dinheiro?" (mensalidade fixa, rifas, festas, bazar, patrocínio, cota extra se faltar) e "Onde o orçamento deve ser priorizado?" (colação, espaço, comida e bebida, música, fotos, decoração). A comissão vê quem votou em quê e pode fixar a decisão, que aparece na tela inicial de todo mundo.
- **Presença com acompanhantes.** Cada formando confirma se vai (vou / talvez / não vou) e quantos acompanhantes leva, até um limite que a comissão define. A comissão vê o total de pessoas, o que ajuda a fechar buffet e espaço.
- **Avisos.** A comissão publica avisos no mural do site (ex.: "Prazo do pagamento do buffet").
- **Tarefas.** A comissão cria tarefas com responsável e prazo (ex.: "Fechar contrato do fotógrafo").
- **Dúvidas.** Qualquer formando pergunta, os outros dão "+1", a comissão responde.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **O site não recebe nem registra pagamento.** Não tem Pix, boleto, cartão, mensalidade, parcela, nem lista de "quem já pagou / quem está devendo". Isso continua na planilha e no Pix pessoal de alguém.
- **Não tem caixa da turma.** Não mostra quanto entrou, quanto saiu e quanto sobra. O "orçamento" é só a soma do que a comissão anotou para os fornecedores.
- **Formando não vê nenhum valor.** Nem o total da festa, nem quanto custa cada fornecedor, nem quanto cabe a cada um. Só a comissão vê.
- **Não calcula valor por pessoa.** Não divide o total pelos formandos nem considera acompanhantes.
- **Não guarda comprovante, contrato nem recibo.** Não dá para anexar arquivo. A foto do fornecedor é só um link de imagem.
- **Não tem histórico de quem mudou um valor.** Se alguém da comissão alterar o valor ou o status de um fornecedor, não fica registrado quem mudou nem o valor anterior.
- **Não tem regra de desistência ou reembolso.**
- **O site não avisa nada.** Aviso novo, prazo de pagamento ou decisão não chega por email, WhatsApp nem notificação. É preciso abrir o site.
- **Fornecedor e família não têm acesso próprio.** O fornecedor não entra no site. Um pai ou mãe só entraria criando conta e usando o código da turma, como se fosse formando.
- **Votação sobre dinheiro não tem quórum nem prazo,** e a comissão pode fixar qualquer opção.
- **É um projeto acadêmico** de 4 alunos, sem empresa nem suporte com prazo. Tem Termos de Uso e Política de Privacidade com responsável identificado, e cada pessoa pode baixar os próprios dados em "Conta".
