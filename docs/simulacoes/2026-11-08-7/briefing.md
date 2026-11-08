# Briefing da simulação 10 (2026-11-08) — teste do pacote de melhorias

**Atenção:** esta simulação testa **cinco melhorias que ainda não existem** no código. Elas foram descritas às personas como se já existissem, para medir se as correções mais repetidas nas simulações 1 a 9 transformam REPROVADO em APROVADO. Todo o resto descreve o app real, conferido no código.

As cinco melhorias e de onde vieram:

| Melhoria | Achado que ela responde | Simulações em que apareceu |
|---|---|---|
| Avisos que chegam (email + "Copiar para o WhatsApp" + aviso de mudança no evento) | "o site não avisa ninguém" | todas (1 a 9) |
| Link de convite com o código embutido | "cadê o código?" | 1, 2, 3, 4, 8 |
| Valor por pessoa em cada opção de votação | decisão sem preço; dinheiro fora do app | 5, 6, 7 |
| Regra para fixar decisão (prazo, quórum, "votaram X de Y", justificativa, histórico) | comissão fixa qualquer opção sem regra | 6, 9 |
| "Minha situação" (parcelas registradas, só para a pessoa e a tesouraria) | "quanto paguei, quanto falta" | 1, 2, 7 |

Não entraram no pacote, e continuam como pontos fracos reais: exportação da turma, plano de fim, caixa da turma, página pública para convidados, acompanhante com nome, prazo de presença, papéis na comissão.

## Bloco 1: Problema (Fase 1, sem citar o app)

Toda turma de formatura organiza a festa e o dinheiro pelo grupo de WhatsApp. Aviso importante some no meio de centenas de mensagens e muita gente silenciou o grupo. Votações em enquete do WhatsApp somem, metade não vota, e a comissão decide sozinha e leva a culpa. Ninguém sabe quanto custa cada opção antes de votar. O dinheiro vai para o Pix de alguém da comissão, anotado numa planilha; quem paga não sabe se o pagamento foi registrado, quem atrasa é cobrado em público. Na semana da festa, mudança de horário ou de portão não chega a todo mundo. Pais perguntam ao filho e o filho não sabe responder.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site (abre no navegador do celular, não é app de loja), feito por 4 alunos da Unifacol, gratuito.

**Entrar.** A comissão manda no grupo um **link de convite que já leva à turma**: a pessoa toca no link, entra com o Google (um toque, sem senha) ou com email e senha, e já cai dentro da turma, sem digitar código.

**Avisos que chegam até você.** Quando a comissão publica um aviso, abre uma votação, fixa uma decisão ou responde a sua dúvida, você **recebe um email**. Dois dias antes do fim de uma votação, ou do vencimento de uma parcela sua, chega um lembrete. Se a comissão mudar a data, o horário ou o local da festa, todo mundo recebe um email com "**mudou: entrada às 19h (antes era 20h)**", e o card do evento mostra "atualizado em 12/12, 14h". Avisos podem ser marcados como **urgentes** e ficam fixados no topo. Em cada aviso, votação e decisão há um botão **"Copiar para o WhatsApp"**, que gera um texto pronto (sem imagem) com o link direto, para a comissão colar no grupo.

**Votações com preço.** A comissão cria as perguntas (ou usa o catálogo pronto: formato da festa, espaço, buffet, música, arrecadação etc.). Cada opção pode ter um **valor por pessoa** (ex.: "Buffet A — R$ 95 por pessoa", "Banda — R$ 40 por pessoa") e um link ou descrição curta.

**Regra para fixar a decisão.** Antes de abrir uma votação, a comissão define o **prazo de encerramento** e o **quórum mínimo** (ex.: "pelo menos metade da turma"), e quem vota vê essa regra. Quando a comissão fixa a decisão, todo mundo vê **"votaram 22 de 38"** e se a opção escolhida foi a mais votada. Se a comissão fixar uma opção que não foi a mais votada, ou sem atingir o quórum, precisa escrever uma **justificativa**, que aparece para todos. Há um **histórico** visível: quem fixou, quando, se reabriu e o que estava decidido antes. A comissão vê quem votou em cada opção; a turma vê só os totais.

**Minha situação.** Cada pessoa tem uma tela só dela com o **valor das parcelas, as datas de vencimento e quais parcelas a tesouraria registrou como pagas**, com "última atualização em 03/12 por Fulana". Se você pagou e ainda não aparece, toca em **"Já paguei, aguardando confirmação"** e anexa o print do Pix. Só você e a tesouraria veem essa tela; ninguém mais da turma vê quem pagou ou quem deve.

**O que já existia e continua:** presença (vou / talvez / não vou e número de acompanhantes), card do evento com endereço, "Como chegar", traje e programação, fornecedores (a comissão vê valor orçado; a turma vê só nome e contato), tarefas da comissão, dúvidas com "+1", arquivar a turma depois da festa, baixar os seus dados e excluir a conta, Termos de Uso e Política de Privacidade.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

Limites das próprias melhorias:
- **O site não recebe nem processa pagamento.** O Pix continua indo para a tesouraria. A tesouraria precisa registrar à mão cada parcela paga; se atrasar, "Minha situação" fica desatualizada (a data da última atualização aparece).
- **Email pode cair no spam ou não ser lido.** Não há WhatsApp, SMS nem notificação no celular automáticos. O "Copiar para o WhatsApp" depende de alguém da comissão colar no grupo.
- **O valor por pessoa é digitado pela comissão**, não vem do fornecedor. Não há total da festa por pessoa nem caixa da turma.
- **Prazo e quórum são definidos pela comissão** e podem ser mudados por ela (fica no histórico). A comissão ainda pode fixar qualquer opção, desde que justifique.
- **O voto é identificado para a comissão.** Não existe voto secreto.

Pontos fracos que continuam iguais:
- **Convidados e família não têm acesso.** Não recebem os emails. Dependem do formando repassar.
- **Não exporta a turma** (decisões, votações, presença, parcelas) em PDF ou planilha. O único download é o dos dados pessoais, em arquivo técnico (JSON).
- **Não há caixa da turma** (quanto entrou, quanto saiu) visível para os formandos.
- **Acompanhante é só um número**, sem nome; a lista da portaria e o número do buffet continuam sendo feitos fora do site. A presença não tem prazo de fechamento.
- **É um projeto acadêmico** de 4 alunos, sem empresa, sem suporte com prazo e sem plano escrito para quando eles se formarem. O site não é oficial da Unifacol.
