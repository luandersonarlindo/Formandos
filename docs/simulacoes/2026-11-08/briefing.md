# Briefing da simulação 4 (2026-11-08) — primeiro acesso

Foco: os primeiros minutos de quem recebe o convite da turma. Descreve o app **real**, conferido no código (`src/app/(publico)/entrar`, `src/app/(onboarding)/convite`, `src/components/features/form-email-senha.tsx`, `src/lib/empresa.ts`) e na especificação (RF-01 a RF-04, RN-06, RN-07, RN-11 a RN-14).

**Correção para as simulações 1 a 3:** a especificação usada antes estava desatualizada. O app já tem Termos de Uso e Política de Privacidade com o responsável identificado (nome, CNPJ de MEI e email de contato), com aceite obrigatório no cadastro. Também tem exportação dos dados pessoais em `/conta` e trilha de auditoria interna (não visível para a comissão). Os pontos fracos "sem responsável identificado" e "sem termos nem política" foram descritos de forma pior do que é.

## Bloco 1: Problema (Fase 1, sem citar o app)

Toda turma de formatura acaba pedindo para os formandos entrarem em alguma coisa nova: um formulário do Google para votar, uma planilha para confirmar presença, um app de fotos, a área do cliente da empresa de formatura, um site de rifa. O link chega no grupo de WhatsApp no meio de centenas de mensagens. Cada coisa pede um cadastro diferente, uma senha diferente, às vezes um código. Uns entram na hora, outros deixam para depois e esquecem, outros desconfiam que é golpe. A comissão fica cobrando quem não entrou.

## Bloco 2: Produto (Fase 2, o passo a passo do primeiro acesso)

A comissão criou a turma no **Formandos** (um site, abre no navegador do celular, não é app de loja) e mandou no grupo uma mensagem pronta com o endereço do site e um **código de convite** de 8 letras e números.

1. **Abrir o link.** Abre a página "Entre para acompanhar a formatura da sua turma".
2. **Entrar.** Duas opções:
   - **"Continuar com o Google"**: escolhe a conta Google que já está no celular e pronto.
   - **"Crie a sua conta"** com nome completo, email e senha (no mínimo 8 caracteres). É preciso marcar "Li e aceito os Termos de Uso e a Política de Privacidade". Depois aparece "Confira o seu email": chega um email com um link de confirmação. Só depois de clicar no link dá para entrar com a senha. Se tentar antes, aparece "Confirme seu email antes de entrar. Reenviamos o link para a sua caixa de entrada."
3. **Entrar na turma.** Quem ainda não tem turma vê a tela "Entre em uma turma" e digita o código de convite. O código aceita letras minúsculas, espaços e hífen. Ele não usa as letras e números que confundem (sem 0, O, 1, I e L). Também há a opção de criar uma turma nova (é o que a comissão faz).
4. **Pronto.** A pessoa vira membro da turma, recebe um email de "entrada na turma" e cai na tela inicial: contagem regressiva para a festa, data, local com botão "Como chegar", traje, decisões da turma e os 3 avisos mais recentes. No menu: Votações, Dúvidas, Avisos, Tarefas, Presença, Fornecedores.
5. **Esqueceu a senha?** Em "Esqueci minha senha" chega um link por email para criar uma nova.

## Bloco 3: Pontos fracos conhecidos (Fase 3)

- **O código não vem embutido no link.** É preciso copiar o código da mensagem e digitar na tela.
- **Não dá para ver nada sem criar conta.** Nem a data da festa.
- **O cadastro por email depende de abrir o email.** Se o email demorar ou cair no spam, a pessoa não entra. Quem esqueceu a senha também depende do email.
- **Errar o código 10 vezes em 15 minutos bloqueia** novas tentativas por 15 minutos.
- **Cada formando entra em uma turma só.** Quem já está numa turma não entra em outra (só a comissão pode).
- **Depois de entrar, o site não avisa nada.** Não há notificação no celular nem email de aviso novo; é preciso voltar ao site.
- **Não tem app de loja e não funciona sem internet.**
- **É um projeto acadêmico** de 4 alunos. Os Termos e a Política de Privacidade trazem o nome e o CNPJ (MEI) do responsável e um email de contato. Mas não há empresa grande por trás nem suporte com prazo.
