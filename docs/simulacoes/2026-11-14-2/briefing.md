# Briefing da simulação 12 (2026-11-14) — rodada 2, tema 3: primeiro acesso

Foco: os primeiros minutos de quem recebe o convite da turma. Fonte: o código (`src/app/(publico)/entrar`, `src/app/(onboarding)/convite`, `src/components/features/form-email-senha.tsx`, `botao-google.tsx`) e as ADR-0002, 0006, 0007, 0008 e 0011. O bloco 1 é o mesmo da simulação de `2026-11-08`. Os blocos 2 e 3 descrevem o site como está hoje. Nenhuma função hipotética.

## Bloco 1: Problema (Fase 1, sem citar o app)

Toda turma de formatura acaba pedindo para os formandos entrarem em alguma coisa nova: um formulário do Google para votar, uma planilha para confirmar presença, um app de fotos, a área do cliente da empresa de formatura, um site de rifa. O link chega no grupo de WhatsApp no meio de centenas de mensagens. Cada coisa pede um cadastro diferente, uma senha diferente, às vezes um código. Uns entram na hora, outros deixam para depois e esquecem, outros desconfiam que é golpe. A comissão fica cobrando quem não entrou.

## Bloco 2: Produto (Fase 2, o passo a passo do primeiro acesso)

A comissão criou a turma no **Formandos** (um site gratuito, feito por alunos da Unifacol, que abre no navegador do celular; não é app de loja) e mandou o **link de convite** de dois jeitos: no grupo de WhatsApp, numa mensagem pronta, e por **email** para cada pessoa de uma lista de emails da turma.

1. **Tocar no link.** O link já leva o código da turma. Abre a página "Entre para acompanhar a formatura da sua turma".
2. **Entrar.** Duas opções:
   - **"Continuar com o Google"**: escolhe a conta Google que já está no celular. Embaixo do botão está escrito que, ao entrar com o Google, você declara ter 18 anos ou mais e aceita os Termos e a Política de Privacidade.
   - **"Crie a sua conta"** com nome completo, email e senha (no mínimo 8 caracteres). É preciso marcar a caixa "Tenho 18 anos ou mais e aceito os Termos de Uso e a Política de Privacidade". Depois aparece "Confira o seu email": chega um email com um link de confirmação. Ao tocar nesse link, a pessoa volta para o convite, já com o código.
3. **Entrar na turma.** Aparece a tela "Entre em uma turma" com o **código já preenchido**. A pessoa toca em "Entrar na turma". Não precisa copiar nem digitar nada. Se ela fechar tudo e voltar depois pelo mesmo celular, o código continua lá por 7 dias.
4. **Pronto.** Cai na tela inicial: contagem regressiva para a festa, data, local com "Como chegar", traje, decisões da turma e os 3 avisos mais recentes. No menu: Votações, Minha situação (suas parcelas e o que falta pagar), Dúvidas, Avisos, Tarefas, Presença, Fornecedores.
5. **Sem conta:** existe uma **página pública do evento**, outro link que a comissão pode mandar, que abre sem cadastro e mostra data, horário, local e como chegar.
6. **Esqueceu a senha?** Em "Esqueci minha senha" chega um link por email para criar uma nova.
7. **Depois de entrar**, chegam por email só 5 avisos: decisão fixada, mudança de data ou local da festa, votação que fecha em 2 dias (para quem não votou), parcela que vence em 2 dias e prazo para confirmar presença. Dá para desligar.
8. **Para a comissão:** a tela de Membros mostra quem já entrou; dá para baixar a lista em planilha e mandar o convite por email para quem falta.

Os Termos e a Política trazem o nome do responsável (um dos alunos), o CNPJ de MEI e um email de contato. O site não pede CPF, telefone nem dado de banco.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **O link não põe ninguém na turma sozinho.** Ainda há um toque em "Entrar na turma". Antes de entrar, a tela não mostra o nome da turma, só o código.
- **O cadastro por email continua dependendo de abrir o email.** Se o email demorar ou cair no spam, a pessoa não entra. Quem esqueceu a senha também depende do email.
- **O convite por email chega de um endereço que a pessoa não conhece** e pode cair no spam ou parecer golpe.
- **O código lembrado só vale no mesmo celular e navegador.** Quem abre o link no WhatsApp e depois entra pelo computador precisa do link de novo.
- **Sem conta só dá para ver a página pública do evento**, e só se a comissão mandar esse outro link.
- **A idade é só declarada.** O site não confere. Menores de 18 não podem ter conta.
- **Cada formando entra em uma turma só.**
- **Depois de entrar, o que chega sozinho são só aqueles 5 emails.** Aviso novo no mural e votação nova aberta não geram email. Não há notificação no celular. No WhatsApp, só chega o que alguém da comissão colar no grupo.
- **Não tem app de loja e não funciona sem internet.**
- **É um projeto de alunos.** Tem responsável com nome, CNPJ de MEI e email de contato, mas não há empresa por trás nem suporte com prazo.
