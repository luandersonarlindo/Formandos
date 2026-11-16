# Briefing da simulação 17 (2026-11-15) — rodada 2, tema 4: outros tipos de turma

Foco: turmas fora da graduação: Educação Infantil e ABC, Ensino Médio, Pós-graduação e MBA, Área da Saúde. Fonte: o código (`src/lib/vinculos.ts`, `src/lib/modelos.ts`, `docs/catalogos-modelo/*.md`, `src/app/(publico)/termos/page.tsx`, `src/app/(publico)/privacidade/page.tsx`, `src/components/features/enquete-card.tsx`) e as ADR-0002 a 0014, com destaque para a ADR-0011 (só maiores de 18) e a ADR-0012 (observador). O bloco 1 é o mesmo da simulação de `2026-11-08-2`. Os blocos 2 e 3 descrevem o site como está hoje. Nenhuma função hipotética.

## Bloco 1: Problema (Fase 1, sem citar o app)

Toda formatura dá trabalho, mas cada tipo de turma tem o seu jeito. Na formatura do ABC ou da educação infantil, quem organiza são os pais e a escola: as crianças não decidem nada, e cada família quer opinar sobre tema, roupa e lembrancinha. No terceiro ano do ensino médio, os alunos querem decidir a festa, mas muitos são menores de idade e quem paga são os pais. Na pós-graduação e no MBA, a turma é de adultos que trabalham, se veem pouco (às vezes só online) e querem resolver rápido. Na área da saúde, os plantões e estágios fazem ninguém conseguir estar livre no mesmo dia, e há cerimônias próprias da profissão. Em todos os casos, a conversa acontece num grupo de WhatsApp, as votações são enquetes soltas, os pagamentos ficam numa planilha e os avisos se perdem.

## Bloco 2: Produto (Fase 2, o que a pessoa vê e faz)

O **Formandos** é um site gratuito, feito por alunos da Unifacol (abre no navegador do celular ou do computador, não é app de loja), para organizar a formatura de uma turma.

- **Conta só para maiores de 18 anos.** No cadastro há uma caixa: "Tenho 18 anos ou mais e aceito os Termos de Uso e a Política de Privacidade". Quem entra com o Google declara o mesmo. Os Termos dizem: em turmas de crianças e adolescentes, quem cria conta, vota e confirma presença é o pai, a mãe ou o responsável. Uma conta é um voto. Se a turma quiser um voto por família, a comissão convida um responsável por aluno.
- **Entrada:** a comissão manda um link de convite (a pessoa toca, entra com o Google ou com email e senha, e cai na turma) ou cola uma lista de até 200 emails, e o site manda o convite para cada um.
- **Papéis:** a comissão é administradora. Uma ou mais pessoas da comissão podem ser marcadas como tesouraria. Há o papel de **observador**: professor, coordenação ou orientador vê tudo da turma, mas não vota nem administra. O observador pode acompanhar várias turmas com a mesma conta.
- **Modelos de votação por tipo de turma:** ao montar as votações, a comissão pode começar do catálogo padrão ou de um modelo pronto e editar:
  - **Educação Infantil e ABC** ("Nesta turma, quem participa são os responsáveis"): onde fazer a cerimônia, momentos, melhor horário para as crianças, tema, roupa, festa depois, cardápio, alergias das crianças, lembranças, cuidados prioritários.
  - **Ensino Médio** ("quem tem menos de 18 anos participa pelo responsável"): formato, onde entregar os certificados, quem convidar, local, serviços de apoio, bar considerando menores de idade, músicas, momentos antes da formatura, tradições, lembranças.
  - **Pós-graduação e MBA:** formato, colação, dia e horário, local, convidados, traje, comida, alergias, bar, programação, música.
  - **Área da Saúde:** cerimônias da profissão (jaleco, juramento), traje da colação, homenagens, formato, dia e horário considerando plantões, local, comida, bar, alergias, ação solidária, lembranças.
- **Votações:** escolha única, múltipla ou com opção que exclui as outras. Cada pergunta pode ter **prazo** e um mínimo de participação ("precisa de 60% da turma votando"). Cada opção pode mostrar o **valor por pessoa** e um link (orçamento, foto do local). A comissão pode marcar uma pergunta como **voto secreto**: aí ninguém, nem a comissão, vê quem votou em quê. Nas outras, a comissão vê. Quando a comissão fixa uma decisão fora da regra combinada, precisa escrever a justificativa. O **histórico de decisões** fica visível para toda a turma.
- **Emails só para o essencial:** decisão fixada, mudança de data, horário ou local do evento, prazo de votação chegando (só para quem não votou), prazo de parcela e prazo de presença. Cada pessoa pode desligar.
- **Mandar para o grupo:** em avisos, votações e decisões, um botão monta o texto pronto e abre o WhatsApp para a comissão colar no grupo.
- **Dinheiro:** a tesouraria cadastra o plano de parcelas e lança os pagamentos (inclusive parcial e pago por outra pessoa, como pai ou avó). Cada pessoa vê a sua **"Minha situação"** (o que pagou, o que falta, o que vence), que só ela e a tesouraria veem. A pessoa pode marcar "Já paguei" e a tesouraria confirma. A turma vê só os totais do caixa. Correções e exclusões de lançamento ficam registradas no histórico, com nome e hora. O site **registra**, não recebe dinheiro.
- **Presença:** cada pessoa diz se vai e dá o nome de cada acompanhante, marcando adulto ou criança, até o limite da comissão, com prazo. Sai a lista da portaria para imprimir.
- **Página pública do evento:** um link sem conta e sem senha, para família e convidados, com data, horário, local, "Como chegar", traje, programação e o aviso "Mudou em" quando algo muda.
- **Exportar:** a comissão baixa planilhas de membros, votos, decisões, presença, portaria e fornecedores; a tesouraria baixa pagamentos e situação por pessoa.
- **Confiança:** Termos de Uso e Política de Privacidade com o nome, o CNPJ (MEI) e o email do responsável, cópia de segurança diária e aviso de 60 dias se o site for encerrado. Ao arquivar a turma, a comissão escolhe em quanto tempo os dados são apagados. Cada pessoa pode baixar os próprios dados e excluir a conta.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **Aluno com menos de 18 anos não pode ter conta.** Na turma do ABC e do Ensino Médio, só o responsável entra. O aluno de 16 ou 17 anos não vota nem confirma presença por si. A regra é por declaração: o site não confere a idade.
- **Não existe o papel "responsável" ligado ao aluno.** Se o pai e a mãe entram, são dois votos. "Um voto por família" depende de a comissão convidar só um responsável por aluno.
- **Participante comum fica em uma turma só.** Só administrador e observador podem estar em mais de uma. Uma avó com um neto no ABC e outro no 9º ano não participa das duas turmas como participante.
- **A escola não é a responsável pelo site.** O responsável é um aluno com MEI. Não há contrato com a escola nem suporte com prazo.
- **Aviso novo e votação nova não geram email nem notificação.** Só os 5 emails da lista acima. Para a turma ver, a comissão cola no grupo de WhatsApp.
- **Não recebe pagamento, não guarda comprovante nem recibo.** O pagamento continua por fora (Pix, boleto da empresa, secretaria).
- **Nas perguntas que não são secretas, a comissão vê quem votou em cada opção.**
- **Quem tem o link de convite entra na turma**, sem aprovação prévia. A comissão pode remover quem não devia estar.
- **Os modelos não têm pergunta de autorização de imagem das crianças, nem de convidado extra pago, nem de escala de plantão.** A comissão pode criar.
- **Os Termos pedem que a comissão não escreva dados de crianças** (nome completo, foto, saúde) em avisos e observações além do necessário.
- **Não tem app de loja nem funciona sem internet.**
