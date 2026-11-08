# Briefing da simulação 2 (2026-11-07) — teste de melhorias

**Atenção:** esta simulação testa duas melhorias que **ainda não existem** no código: avisos por email/WhatsApp e a área "Minha situação". Elas foram descritas às personas como se já existissem, para medir se mudam a adesão. Todo o resto descreve o app real.

Fonte: `README.md` e `docs/Especificação de Requisitos de Software.md`. Este briefing tem três blocos, revelados às personas em fases diferentes.

## Bloco 1: Problema (Fase 1, sem citar o app)

Organizar uma formatura numa faculdade brasileira costuma ser assim: a turma tem um grupo de WhatsApp com dezenas ou centenas de pessoas, e as decisões se perdem no meio de figurinha, áudio e conversa paralela. Votações são feitas com enquetes soltas no próprio WhatsApp ou em formulários do Google, e ninguém sabe ao certo qual foi o resultado final ou se ainda dá para mudar. A comissão de formatura (alguns alunos e às vezes um professor) mantém planilhas para controlar quem vai à festa, quantos convidados cada um leva, quanto custa cada fornecedor e o que já foi contratado. Avisos importantes (prazo de pagamento, data da colação, traje) somem no grupo. Dúvidas repetidas aparecem toda semana. Fornecedores (buffet, fotógrafo, DJ) negociam por WhatsApp com quem estiver disponível na comissão. Quem trabalha e estuda perde as discussões; quem tem menos dinheiro se sente pressionado; a comissão fica sobrecarregada.

## Bloco 2: Produto (Fase 2, em linguagem de usuário)

**Formandos** é um site (abre no navegador do celular ou do computador, não é app de loja) para organizar a formatura de uma turma.

- **Entrar:** com a conta Google ou com email e senha. No cadastro por email, chega um link para confirmar o email.
- **Entrar na turma:** a comissão gera um código de convite privado e manda para a turma (por exemplo, no grupo do WhatsApp). Você digita o código e entra. Cada aluno participa de uma turma só.
- **Votações:** já vem um catálogo pronto com 10 temas (formato do evento, espaço, comida, bebida, música, fotos e vídeo, segurança e recepção, traje, rituais e pré-eventos, orçamento e arrecadação), 23 perguntas com opções descritivas. A comissão pode criar perguntas próprias ou usar modelos prontos (ensino médio, pós-graduação, área da saúde). Você pode mudar seu voto. Quando a comissão "fixa" uma decisão, ela aparece na tela inicial de todo mundo e aquela votação fecha (pode reabrir).
- **Relatório:** totais e percentuais de cada votação, sem mostrar quem votou o quê. Mas a comissão consegue ver quem votou em cada opção e quem ainda não votou.
- **Dúvidas:** qualquer um manda uma pergunta; os colegas dão "curtir" nas que também querem saber, e as mais curtidas sobem. A comissão responde, destaca e marca como respondida.
- **Avisos:** a comissão publica recados num mural; os 3 mais recentes aparecem na tela inicial.
- **Tela inicial:** contagem regressiva para a festa, data, horário, local com botão "Como chegar", traje, decisões da turma, programação e tarefas da comissão (responsável, prazo, progresso).
- **Presença:** você diz se vai (vou, talvez, não vou) e quantos acompanhantes leva (a comissão define o máximo, padrão 5). A comissão vê o total de pessoas esperadas.
- **Fornecedores:** a comissão cadastra buffet, fotógrafo, músicos, segurança etc., com valor orçado e situação (cotando, contratado, descartado). Os alunos veem a vitrine, mas não os valores.
- **Conta:** dá para sair da turma ou excluir a própria conta. A comissão pode arquivar a turma depois da festa (fica só para leitura).
- **Avisos que chegam até você:** quando sai um aviso novo, uma votação nova, uma decisão fixada ou uma resposta à sua dúvida, você recebe um email. Dois dias antes do fim de uma votação ou do vencimento de uma parcela, chega um lembrete. Cada aviso e decisão tem um botão "Copiar para o WhatsApp", que gera um texto pronto (sem imagem) com o link direto, para a comissão colar no grupo.
- **Minha situação:** cada pessoa tem uma tela só dela com o valor das parcelas, as datas de vencimento e quais parcelas a comissão já registrou como pagas. Só a própria pessoa e a comissão veem essa tela; ninguém mais da turma vê.
- Emails automáticos também chegam em eventos da sua conta: confirmação, boas-vindas, troca de senha, entrada e saída da turma.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **Não tem app de loja.** É um site; precisa abrir pelo navegador. Não tem notificação push no celular: os avisos chegam por email (que pode cair no spam) ou quando a comissão cola o texto no WhatsApp.
- **Não funciona sem internet.**
- **Não tem pagamento.** Não cobra, não gera boleto nem Pix. O Pix continua indo para o tesoureiro. A comissão precisa registrar à mão, no site, cada parcela paga para ela aparecer em "Minha situação"; se a comissão atrasar o registro, a tela fica desatualizada. Os valores de fornecedores continuam visíveis só para a comissão.
- **Votos não são anônimos para a comissão.** O relatório geral não mostra nomes, mas a comissão vê quem votou em cada opção.
- **Catálogo padrão não pode ser editado.** A turma pode desligar e criar o próprio, mas não alterar o texto das perguntas prontas.
- **Fornecedor não tem acesso.** Ele não entra no site; quem cadastra e atualiza é a comissão.
- **Um aluno, uma turma.** Participante só fica numa turma (comissão pode estar em várias).
- **Sem integração com calendário ou mapa em tempo real** (o "Como chegar" só abre o endereço).
- **É um projeto acadêmico** de um grupo de 4 alunos. Não tem empresa por trás, não tem suporte com prazo garantido nem compensação se sair do ar. Não há monitoramento de falhas.
- **Sair da turma apaga** seus votos, presença e dúvidas daquela turma.
