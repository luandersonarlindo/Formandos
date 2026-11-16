# Briefing da simulação 11 (2026-11-14) — rodada 2, tema 1: turma inteira

Fonte: o código e as ADR-0001 a ADR-0016 (não a Especificação, que está desatualizada). O bloco 1 é o mesmo da simulação de `2026-11-07`, sem alteração. Os blocos 2 e 3 descrevem o site como ele está hoje. Nenhuma função hipotética.

## Bloco 1: Problema (Fase 1, sem citar o app)

Organizar uma formatura numa faculdade brasileira costuma ser assim: a turma tem um grupo de WhatsApp com dezenas ou centenas de pessoas, e as decisões se perdem no meio de figurinha, áudio e conversa paralela. Votações são feitas com enquetes soltas no próprio WhatsApp ou em formulários do Google, e ninguém sabe ao certo qual foi o resultado final ou se ainda dá para mudar. A comissão de formatura (alguns alunos e às vezes um professor) mantém planilhas para controlar quem vai à festa, quantos convidados cada um leva, quanto custa cada fornecedor e o que já foi contratado. Avisos importantes (prazo de pagamento, data da colação, traje) somem no grupo. Dúvidas repetidas aparecem toda semana. Fornecedores (buffet, fotógrafo, DJ) negociam por WhatsApp com quem estiver disponível na comissão. Quem trabalha e estuda perde as discussões; quem tem menos dinheiro se sente pressionado; a comissão fica sobrecarregada.

## Bloco 2: Produto (Fase 2, em linguagem de usuário)

**Formandos** é um site (abre no navegador do celular ou do computador, não é app de loja) para organizar a formatura de uma turma. É gratuito, feito por alunos da Unifacol, e só para maiores de 18 anos.

- **Entrar:** com a conta Google ou com email e senha (no cadastro por email chega um link para confirmar). Você marca uma caixa: "Tenho 18 anos ou mais e aceito os Termos e a Política de Privacidade".
- **Entrar na turma:** a comissão manda um link de convite (no grupo do WhatsApp ou por email, a partir de uma lista de emails da turma). O link já leva o código: você toca, entra com a sua conta e já cai dentro da turma, sem digitar nada.
- **Votações:** catálogo pronto com 10 temas e 23 perguntas, mais perguntas criadas pela comissão. Cada opção pode mostrar o **valor por pessoa** e um link. Cada pergunta pode ter **prazo** e **quórum** (mínimo de gente votando). Você pode mudar o voto até fechar.
- **Quem vê o seu voto:** a turma vê só os totais. A comissão vê em qual opção você votou, menos nas perguntas marcadas como **voto secreto**: nessas ninguém vê, nem a comissão. O aviso aparece antes de você votar.
- **Decisão:** quando a comissão fixa uma decisão, ela aparece na tela inicial de todos. Se a comissão fixar fora da regra (antes do prazo, sem quórum, opção que não ganhou, empate), precisa escrever a justificativa, e isso fica num **histórico de decisões** que a turma inteira lê.
- **Minha situação:** uma tela só sua com as suas parcelas, o que já pagou, o que falta e o próximo vencimento. Você pode tocar em "Já paguei" para avisar a tesouraria, que confirma. Só você e a tesouraria veem os seus valores. A turma inteira vê o **caixa da turma** só em totais (quanto entrou, quanto falta), sem nomes. O site **não recebe o dinheiro**: o Pix continua sendo feito fora, o site registra.
- **Emails da turma (só 5):** decisão fixada; mudou data, horário ou local da festa (com "era X, agora é Y"); votação que fecha em 2 dias (só para quem não votou); parcela que vence em 2 dias; prazo para confirmar presença. Dá para desligar em "Minha conta".
- **Mandar para o grupo:** a comissão tem um botão que monta o texto pronto de uma decisão, de um aviso ou de uma mudança, e abre o WhatsApp para ela colar no grupo da turma.
- **Avisos:** mural de recados da comissão; os 3 mais recentes aparecem na tela inicial.
- **Dúvidas:** qualquer um pergunta, os colegas curtem, as mais curtidas sobem, a comissão responde.
- **Tela inicial:** contagem regressiva, data, horário, local com "Como chegar", traje, decisões, programação e tarefas da comissão.
- **Presença:** você diz se vai e informa o **nome** de cada acompanhante (adulto ou criança), até um prazo definido pela comissão. A comissão imprime a lista da portaria.
- **Página pública do evento:** um link que abre sem conta, para a família e os convidados, com data, horário, local, como chegar e um aviso "Mudou em..." quando algo muda.
- **Professor ou coordenador:** entra como **observador**: lê o que a turma lê e confirma a própria presença, mas não vota e não tem parcela.
- **Fornecedores:** a comissão cadastra buffet, fotógrafo, músicos etc. Os alunos veem a vitrine, sem os valores orçados.
- **Seus dados:** em "Minha conta" você baixa tudo o que o site guarda sobre você e pode excluir a conta. Os Termos e a Política trazem o nome do responsável (um dos alunos, com CNPJ de MEI) e um email de contato. Depois da festa, a comissão arquiva a turma e escolhe em quantos dias tudo é apagado (30 a 180); todos são avisados por email ao arquivar e 7 dias antes da exclusão.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **Não tem app de loja nem notificação no celular.** O que chega sozinho é email, e só aqueles 5. Aviso novo no mural, votação nova aberta e resposta à sua dúvida **não** geram email.
- **O site não posta no grupo do WhatsApp sozinho.** Alguém da comissão precisa tocar em "Mandar para o grupo" e colar. Se a comissão esquecer, o grupo não fica sabendo.
- **Não recebe pagamento.** Não gera Pix nem boleto, não confere o banco. A tesouraria lança ou confirma cada pagamento à mão (ou cola a planilha). Não dá para anexar comprovante. Não calcula juros nem multa.
- **Voto identificado é o padrão.** Voto secreto existe, mas é a comissão que decide, pergunta por pergunta, e só antes de alguém votar.
- **Só maiores de 18.** O site não confere a idade, só pede para a pessoa declarar.
- **Família e convidado só veem a página pública do evento.** Não veem votação, nem quanto falta pagar. Quem ajuda a pagar depende do formando mostrar a tela.
- **Fornecedor não tem acesso.**
- **Um aluno, uma turma.**
- **Não funciona sem internet.**
- **É um projeto de alunos.** Tem um responsável com nome e CNPJ de MEI e um email de contato, mas não tem suporte com prazo garantido nem compensação se sair do ar. Há cópia de segurança diária guardada por 30 dias. Não há garantia de que continua no ar depois que os 4 se formarem; os Termos prometem aviso com 60 dias se o site for encerrado.
- **Sair da turma apaga** seus votos, presença e dúvidas. Pagamentos já confirmados ficam no caixa, sem o seu nome.
- **Foi testado com leitor de tela** (TalkBack e VoiceOver) só nas telas de voto, presença e evento, e pelo próprio grupo, não por uma pessoa cega.
