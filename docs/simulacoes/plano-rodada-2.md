# Plano da rodada 2 de simulações de usuários

2026-11-14 · branch `simulacoes-usuarios` · skill `simular-usuarios`

## Para que serve

A rodada 1 (10 simulações, 100 personas, 07 e 08/11/2026) deu REPROVADO em todas e gerou o `levantamento.md`. Os Níveis 0 a 3 do levantamento foram implementados (ADR-0001 a ADR-0016). A rodada 2 repete os mesmos temas para responder a duas perguntas:

1. O que melhorou com o que foi implementado?
2. O que ainda falta, e qual é o próximo gargalo?

O resultado continua sendo especulação. Uma nota que sobe não prova a melhoria: serve para escolher o que validar com pessoas reais.

## Regras para a comparação valer

1. **Mesmas personas.** Em vez de gerar perfis novos no Passo 2 da skill, copiar o `personas.md` da pasta antiga do mesmo tema. Persona nova muda a nota por motivo que não é o app.
2. **Mesma régua.** Repetir o pré-compromisso da simulação antiga (as mesmas condições de REPROVADO) e as mesmas perguntas de nota.
3. **Briefing a partir do código.** A `Especificação de Requisitos de Software.md` está desatualizada. Conferir cada função no código e nas ADRs antes de escrever o briefing. Os briefings das simulações 2, 3 e 6 erraram por não fazer isso.
4. **Descrever só o que existe.** Nenhuma função hipotética nesta rodada.
5. **Seção fixa no relatório:** "Achados da rodada 1", com cada achado do tema marcado como *resolvido*, *parcial* ou *continua*, mais as notas antiga e nova lado a lado.
6. **Limite conhecido:** as personas não lembram da rodada 1. A comparação é entre duas leituras independentes do mesmo perfil, não um "antes e depois" vivido.

## As 10 simulações

Pastas novas em `docs/simulacoes/2026-11-14[-N]/` (ou a data do dia em que rodar).

| # | Tema | Personas | Reusar de | Nota antiga (Fase 3 → final) |
|---|---|---|---|---|
| 1 | Turma inteira | 16 | `2026-11-07` | 2,6 → 2,3 |
| 2 | Só a comissão | 12 | `2026-11-07-3` | 2,1 → 1,3 |
| 3 | Primeiro acesso | 8 | `2026-11-08` | 4,75 → 6,1 |
| 4 | Outros tipos de turma | 8 | `2026-11-08-2` | 2,4 → 1,6 |
| 5 | Votações e decisões | 8 | `2026-11-08-3` | 3,4 → 4,6 |
| 6 | Dinheiro | 8 | `2026-11-08-4` | 2,5 → 2,9 |
| 7 | Reta final e dia do evento | 8 | `2026-11-08-5` | 3,25 → 3,1 |
| 8 | Depois da festa e confiança | 8 | `2026-11-08-6` | 3,5 → 3,1 |
| 9 | Família e convidado sem conta (novo) | 8 | perfis novos | sem base |
| 10 | Comissão que já tem planilha e grupo (novo) | 8 | `2026-11-08-7` | 4,75 → 5,5 |

As simulações antigas 2 e 10 testaram um pacote hipotético. O pacote agora existe, então os temas 9 e 10 entram no lugar e seguem os gargalos que a antiga simulação 10 apontou: acesso sem login para a família e importar ou exportar a planilha.

### 1. Turma inteira

- **Cenário:** igual ao da `2026-11-07`: a comissão apresenta o site à turma no começo do ano.
- **Citar no briefing:** os 5 emails (decisão, mudança no evento, prazo de votação, prazo de parcela, prazo de presença), "Mandar para o grupo", "Minha situação", regra de decisão, link de convite com código, Termos e Política com responsável.
- **Achados antigos a conferir:** A (não avisa), E (quanto devo), B (sem dono), G (primeiro acesso).

### 2. Só a comissão

- **Cenário:** igual ao da `2026-11-07-3`: a comissão decide se troca a planilha e o grupo pelo site.
- **Citar:** convite por lista de emails, exportações em planilha (membros, votos, presença, situação, portaria), marca de tesouraria, papel de observador, regra e histórico de decisões, "Mandar para o grupo".
- **Achados antigos:** C (importar e exportar), A, L (todos os admins podem tudo), K (regra).

### 3. Primeiro acesso

- **Cenário:** igual ao da `2026-11-08`: a pessoa recebe o convite e tenta entrar pela primeira vez.
- **Citar:** link com `?codigo=` que sobrevive ao login, convite por email vindo da lista, caixa "Tenho 18 anos ou mais e aceito", entrada pelo Google e por email e senha.
- **Achados antigos:** G, A (sem aviso não há retorno). Observar se a caixa de 18 anos cria atrito novo.

### 4. Outros tipos de turma

- **Cenário:** igual ao da `2026-11-08-2` (ABC, Ensino Médio, pós, Saúde), agora com a regra "só maiores de 18" visível.
- **Citar:** modelos de catálogo, regra de idade (ADR-0011), papel de observador, página pública do evento para a família.
- **Achados antigos:** O (menores), F (família), A. A pergunta central é como a turma com menores reage à barreira: desiste, ou os responsáveis usam no lugar?

### 5. Votações e decisões

- **Cenário:** igual ao da `2026-11-08-3`: votação com opções de preços diferentes e a comissão fixando o resultado.
- **Citar:** prazo e quórum por pergunta, justificativa obrigatória fora da regra, valor por pessoa e link em cada opção, voto secreto por pergunta, histórico visível à turma, lembrete só para quem não votou.
- **Achados antigos:** K, J (opção sem preço), H (quem vê o voto), M (sair apaga o voto), D (histórico).

### 6. Dinheiro

- **Cenário:** igual ao da `2026-11-08-4`: parcelas ao longo do ano, com atraso, pagamento por terceiro e mudança de valor.
- **Citar:** "Minha situação" privada, parcelas e pagamentos, "Já paguei" informado e confirmado, caixa só com totais, pagamento parcial e de terceiro, importar lançamentos por colagem, planilha "Situação por pessoa", texto de desistência e multa. Dizer com clareza que o site registra e não recebe pagamento.
- **Achados antigos:** E, D (histórico de mudança de valor), "valor orçado" ambíguo, comprovante (não há anexo: conferir se segue como bloqueio).

### 7. Reta final e dia do evento

- **Cenário:** igual ao da `2026-11-08-5`: o horário muda 3 dias antes da festa.
- **Citar:** email "Mudou no evento", "Mandar para o grupo", página pública com "Mudou em", acompanhantes com nome, prazo de presença com lembrete, lista da portaria para imprimir.
- **Achados antigos:** A (5 de 8 não saberiam da mudança), F (convidado sem conta), N (presença). Medir de novo quantas personas ficariam sabendo da mudança.

### 8. Depois da festa e confiança

- **Cenário:** igual ao da `2026-11-08-6`: a festa passou e a turma pergunta o que acontece com os dados.
- **Citar:** prazo de exclusão obrigatório ao arquivar (30, 60, 90 ou 180 dias), aviso por email ao arquivar e 7 dias antes, exportar o registro da turma, "Meus dados", backup de 30 dias, Termos com encerramento em 60 dias, responsável e email de contato atuais.
- **Achados antigos:** B, C, M, questionamento da DPO simulada sobre o email do encarregado.

### 9. Família e convidado sem conta (novo)

- **Cenário:** semana da festa, visto por quem não é da turma: mãe, avô, namorada, professor homenageado, fornecedor.
- **Perfis novos (8):** gerar com espectro de idade e de intimidade com tecnologia. Incluir pelo menos uma pessoa que só usa o WhatsApp.
- **Citar:** página pública `/evento/[token]` sem login, papel de observador para professor, acompanhante com nome informado pelo formando.
- **Perguntas:** a pessoa abre o link? Confia? Entende o "Mudou em"? O que ainda pergunta no WhatsApp?
- **Achado antigo:** F.

### 10. Comissão que já tem planilha e grupo (novo)

- **Cenário:** a turma está no meio do ano, com planilha de pagamentos e grupo de WhatsApp funcionando. A comissão avalia migrar.
- **Citar:** convite por lista, importar lançamentos, exportações, "Mandar para o grupo", ADR-0016 (o site não posta no grupo sozinho).
- **Perguntas:** quanto tempo custa migrar? Há registro duplo? O que continua na planilha?
- **Achados antigos:** C e A (canal), "registro duplo" da antiga simulação 10.

## Ordem

1. Temas 1, 3, 5, 6 e 7: os maiores bloqueios da rodada 1 (aviso, acesso, regra, dinheiro).
2. Temas 2, 4 e 8.
3. Temas 9 e 10.

## O que fica fora

- **Leitor de tela (ADR-0015):** persona sintética não mede isso. O teste real com TalkBack e VoiceOver já foi feito pelo grupo.
- **WhatsApp oficial (ADR-0016):** decisão de não adotar. Aparece só como limite no tema 10.

## Depois da rodada

1. Levantamento novo (`levantamento-rodada-2.md`) com a tabela comparativa das duas rodadas.
2. Validação com pessoas reais, começando pelos achados que continuam.
3. Slides.
