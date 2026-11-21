# Simulação de usuários do Formandos [especulação]
2026-11-20 · 1 persona · foco: Nível 2 (dinheiro e família), itens 2.1 a 2.6 · modelo da persona: sonnet

## Resultado: 2 itens saem da ordem, 1 sai na forma descrita

Condição de parada (pré-compromisso): "item que ela rejeitar ('não usaria' ou 'atrapalha') sai da ordem do Nível 2 até ouvir uma tesoureira real. Os outros seguem na ordem que ela der."

Disparou para três itens, considerando a entrevista e a passada adversarial (feita porque a entrevista aprovou 5 de 6, acima dos 80% da regra 3):

| Item | Entrevista | Passada adversarial | Situação |
|---|---|---|---|
| 2.4 Link para a família | NÃO USARIA | (não atacado: já rejeitado) | **Sai da ordem.** |
| 2.3 Email de quem paga | USARIA, com mudanças | NÃO USARIA do jeito descrito; "ATRAPALHA" se o pagamento cair sozinho | **Sai na forma descrita.** Fica, para a tesoureira real, a versão "sugestão que a tesouraria confirma linha por linha", com aviso de privacidade. |
| 2.2 Recibo | USARIA, com ressalva | NÃO USARIA como recibo; "disse por educação" | **Sai da ordem.** Aceitaria um "comprovante de registro" sem numeração com cara de fiscal. |
| 2.1 Saídas do caixa | USARIA (1ª prioridade) | AINDA USARIA, como espelho opcional | Segue, 1º. |
| 2.6 Link de documento | USARIA, com ressalva | AINDA USARIA, só para quem está logado e com aviso de Drive restrito; "disse por educação" | Segue, 2º, com pouca força. |
| 2.5 Acessibilidade | USARIA, "não é pra mim" | AINDA USARIA, se vazio mostrar "não informado" | Segue, 3º; não é assunto da tesouraria. |

**Ordem que sobra:** 2.1, 2.6, 2.5. Os itens 2.2, 2.3 e 2.4 esperam a tesoureira real. [especulação]

## Pré-compromisso

Gravado antes de gerar a persona e antes da entrevista.

**Adaptação da skill:** o pedido foi uma persona só, abaixo do mínimo de 8 da skill `simular-usuarios`. Sem rodadas de grupo (não há grupo com uma pessoa). As três fases da entrevista ficam, e a Fase 3 inclui as seis propostas do Nível 2, uma por uma.

**Espectro:** 1 tesoureira de comissão de formatura, especialista em finanças, com mestrado. Ela não substitui as "duas tesoureiras reais" do item 4 da seção 6 do levantamento: é a melhor hipótese até lá.

**Lentes:** power user (quer profundidade, acha casos de borda) e cética (dinheiro, responsabilidade, dado de terceiro). As duas, na mesma pessoa, de propósito: uma especialista simpática demais não serve.

**Condição de parada (escolhida pelo grupo em 20/11/2026):** item que ela rejeitar ("não usaria" ou "atrapalha") sai da ordem do Nível 2 até ouvir uma tesoureira real. Os outros seguem na ordem que ela der.

## Adesão prevista

| Momento | Nota (0 a 10) | O que diz |
|---|---|---|
| Site como está | 4 | Usaria "Minha situação" e "Já paguei", que tiram o "recebeu meu Pix?" do privado. A planilha continua sendo a fonte da verdade. |
| Com as propostas que aprovou na entrevista | 6 | Melhora, mas não toca no Pix não identificado nem no extrato. |
| Com saídas + as três coisas dela (abaixo) | 8 | — |

Ela não largaria a planilha antes de dois meses com os números batendo. Se site e planilha divergirem uma vez e ela não achar o motivo numa noite, volta de vez. [especulação]

## O que vale mais que as seis propostas (pedido dela, fora do Nível 2)

1. **Pix recebido e não identificado:** um lugar no caixa para "entrou R$ X, não sei de quem", resolvido depois. Com ele, "confirmado + não identificado" fecha com o extrato. Para ela, vale mais que as seis propostas juntas.
2. **Conferência com o extrato (OFX):** não para o site confirmar sozinho, e sim para mostrar a diferença e as linhas que não casaram.
3. **Uma segunda pessoa vendo o dinheiro e o histórico (o presidente, que divide a conta):** leitura, sem lançar. "Se eu sou a única que audita a mim mesma, não é controle interno, é confiança."

## Funcionalidades mais e menos valorizadas (do que existe)

- **Mais:** "Minha situação" e "Já paguei" (acabam com o "recebeu meu Pix?"); a prévia que trava a colagem inteira se uma linha tiver problema; o site não receber dinheiro nem pedir CPF.
- **Menos:** o caixa só com entradas; a colagem pedir email, quando a planilha dela é por nome.

## Atritos de uso

1. Pix sem identificação não tem lugar: o caixa do site sempre fica abaixo do extrato, e essa diferença sem explicação é o que a faria abandonar.
2. Dois controles (extrato e site), três se a planilha antiga continuar.
3. A planilha dela é por nome; a colagem é por email. Aluno que entra com outro email vira linha com problema.
4. "Arrecadados" pode ser lido como saldo bancário. Ela pede o texto "pagamentos confirmados pela tesouraria".
5. Quem sai da turma: o pagamento que fica no caixa pode ter de ser devolvido (é um valor a devolver, não receita). Ela quer ver separado.
6. Só a tesouraria vê o histórico de pagamentos: falta segregação de função.

## Conferência com o código (o que ela supôs e como é)

A persona reage ao que ouviu, não ao código. Onde a suposição dela diverge do site real:

- **"Correção fica registrada ou apaga?"** Fica: `pagamento.editado` e `pagamento.excluido` vão para a auditoria, com nome e hora. Mas só a tesouraria vê (`ACOES_SO_TESOURARIA`), que é a crítica dela no item 6 acima.
- **"Pai que paga 360 por dois filhos: posso repetir a referência do Pix em dois lançamentos?"** Pode: `pagamentos.referencia` não é única.
- **"Pix em dobro vira crédito na próxima parcela?"** Vira: o pago cobre as parcelas em ordem (`calcularSituacao`). O histórico da pessoa mostra os lançamentos, mas não diz "este virou adiantamento de dezembro".
- **"Arrecadados" na tela:** o texto é "R$ X arrecadados de R$ Y previstos" (`minha-situacao/page.tsx`) e "Arrecadado" no registro. Não diz que é o que a tesouraria confirmou.

## Sinal de alerta de viés

Na entrevista, aprovou 5 de 6 (83%), acima do limite de 80%. A passada adversarial derrubou duas (recibo e email de quem paga) e admitiu que duas foram "por educação" (recibo e link de documento). Depois dela, 3 de 6 seguem (50%). As notas da entrevista (4 e 6) já eram baixas. Leia a entrevista como o teto, e a passada adversarial como o piso. [especulação]

## Recomendações [especulação]

| # | Área | Mudança | Tipo | Motivo |
|---|---|---|---|---|
| 1 | Caixa | Texto "pagamentos confirmados pela tesouraria" no lugar de "arrecadados" | mudar | Não parecer saldo bancário. Barato, sem banco. |
| 2 | Caixa | Saídas (2.1) como espelho: saldo rotulado "confirmado menos saídas lançadas", referência do Pix na saída, ligação com o fornecedor ("contratado, pago, falta"), saída marcável como só da comissão | adicionar | Única proposta que sobreviveu forte aos dois ataques. |
| 3 | Caixa | "Recebido, não identificado" (fora do Nível 2) | adicionar | Para ela, vale mais que as seis propostas. Levar para a tesoureira real antes de 2.1. |
| 4 | Tesouraria | Leitura do dinheiro e do histórico para uma segunda pessoa da comissão (fora do Nível 2) | adicionar | Segregação de função; protege quem lança. |
| 5 | Tesouraria | Conferência com o extrato OFX, só mostrando diferenças (fora do Nível 2) | adicionar | O trabalho real dela é conciliar. Grande; validar antes. |
| 6 | Link de documento (2.6) | Só para quem está logado, com o aviso "confira se o Drive está restrito", data e quem colou | mudar a proposta | Condição dela para usar. |
| 7 | Acessibilidade (2.5) | Vazio mostra "não informado", nunca "não tem" | mudar a proposta | Condição dela para usar. |
| 8 | 2.2, 2.3 e 2.4 | Não fazer agora; levar as versões alternativas à tesoureira real | remover da ordem | Regra do pré-compromisso. |

## O que só uma tesoureira real responde

- Quantos Pix por mês chegam sem identificação, e quanto tempo isso toma.
- Se ela largaria a planilha com saídas e "não identificado", ou se só com a conferência do extrato.
- Se o presidente (ou outra pessoa) quer mesmo ver o dinheiro por pessoa, ou só o total e o histórico.
- Se pai e mãe aceitariam ter o email cadastrado pelo filho, e se a sugestão confirmada à mão resolve o Pix da avó.
- Se o recibo vale alguma coisa para a família, ou se o print do "confirmado" basta.

**Plano curto:** as "duas tesoureiras" da seção 6 do levantamento, com uma conversa de 30 minutos cada. Uma que hoje usa planilha e outra que faz tudo no WhatsApp: a Débora disse que recomendaria o site para a segunda sem ressalva, e para a primeira só "testando um mês fechado". As perguntas são as cinco acima. Teste de uso: dar o site com um mês fechado da turma dela e medir se o total bate com o extrato e quanto tempo leva.
