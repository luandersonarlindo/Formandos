---
name: simular-usuarios
description: Simula como usuários reais reagiriam ao Formandos com muitas personas sintéticas (estilo MiroFish), entrevistas em 3 fases e rodadas de grupo onde as personas reagem umas às outras. Use quando pedirem "simular usuários", "testar com personas", "como a turma reagiria", "entrevista sintética", "prever adesão" ou "rodar a simulação". O resultado é especulação, não validação, e termina com um plano para validar com pessoas reais.
argument-hint: "[foco opcional, ex.: 'votações e orçamento'] [--personas N]"
---

# Simular usuários do Formandos

Simulação de reação de usuários com várias personas, inspirada no MiroFish (muitas personas que interagem), no Arness Stress Interview (entrevista em 3 fases com lentes adversariais) e no Mocked Persona Interview do Mycelium (disciplina contra viés de confirmação).

Tudo em português do Brasil. Contexto fixo: app de gestão de formatura usado numa faculdade brasileira (Unifacol, Pernambuco).

## Regras de disciplina (não negociáveis)

1. **Espectro e condição de parada são definidos ANTES de gerar qualquer persona** e gravados no relatório antes das entrevistas. Nunca mude depois de ver os resultados.
2. **Perfil primeiro, entrevista depois.** As respostas têm que ser coerentes com o perfil. Não reescreva perfil para justificar resposta.
3. **Se quase todo mundo gostou, desconfie.** Mais de 80% de aprovação = personas simpáticas demais. Registre isso e refaça as personas críticas com mais viés adversarial.
4. **Não tire média das rejeições.** Uma rejeição forte de um perfil típico (formando comum, comissão) pesa mais que vários elogios de perfis de nicho.
5. **Se a condição de parada disparou, o resultado é REPROVADO.** Nada de "no geral positivo, com ressalvas".
6. **Tudo é especulação.** Cada conclusão leva o rótulo `[especulação]`. O relatório sempre termina com o que só usuários reais podem responder.
7. **Personas não sabem o que o código faz por dentro.** Elas reagem ao que um usuário vê e ouve, não a rotas, tabelas ou RFs.

## Passo 0: Preparar

1. Leia o argumento: foco opcional e `--personas N` (padrão 16, mínimo 8, máximo 24).
2. Crie a pasta `docs/simulacoes/AAAA-MM-DD/` (data de hoje). Se já existir, use sufixo `-2`, `-3`.
3. Leia `README.md` (seções de visão geral, dúvidas, catálogos) e `docs/Especificação de Requisitos de Software.md`. Escreva `briefing.md` na pasta com três blocos:
   - **Problema** (sem citar o app): como turmas organizam formatura hoje (WhatsApp, planilhas, votação por enquete solta, cobrança de dinheiro, quem vai na festa). Usado na Fase 1.
   - **Produto** em linguagem de usuário: o que a pessoa faz no app (entrar por link de email, entrar na turma por código de convite, votações por catálogo, confirmar presença, orçamento, avisos, tarefas, dúvidas). Usado na Fase 2.
   - **Pontos fracos conhecidos**: limitações reais e o que ficou fora do MVP. Usado na Fase 3. Seja honesto; puxe do README e da especificação.

## Passo 1: Pré-compromisso (antes de qualquer persona)

Monte o espectro e mostre ao usuário. Distribuição padrão para 16 personas (ajuste proporcionalmente para outro N):

| Segmento | Qtd | Variações obrigatórias |
|---|---|---|
| Formando participante | 7 | engajado; ocupado (trabalha e estuda); sem dinheiro; desconfiado de app novo ("já tem o grupo do WhatsApp"); celular simples/internet ruim; com necessidade de acessibilidade; curinga (alguém fora do perfil esperado, ex.: aluno mais velho, EAD) |
| Comissão de formatura (admin) | 3 | organizado que já usa planilha; sobrecarregado; cético com mais uma ferramenta |
| Professor representante | 2 | pouco tempo e pouca intimidade com tecnologia; entusiasmado |
| Fornecedor de evento | 2 | buffet/fotografia que vive de WhatsApp; empresa maior com processo próprio |
| Familiar/convidado | 1 | pai ou mãe que ajuda a pagar |
| Coordenação da faculdade | 1 | preocupado com dados e imagem da instituição |

Cada persona recebe uma **lente** (distribua de forma que todas apareçam, no mínimo 3 vezes cada):
- **Pragmático**: quer saber se economiza tempo hoje. Barreira prática de adoção.
- **Cético**: confiança, dados pessoais, "e se o app sumir", dinheiro.
- **Power user**: quer profundidade, encontra limites e casos de borda.
- **Indiferente**: não vê problema a resolver, só entra se for obrigado.

Depois defina a **condição de parada** com o usuário (use `AskUserQuestion`). Ofereça:
- "Se metade dos formandos rejeitar a proposta central, REPROVADO."
- "Se 2 dos 3 membros da comissão rejeitarem, REPROVADO" (sem comissão o app não existe).
- "Se o mesmo bloqueio aparecer em 5 ou mais personas, REPROVADO."

Grave espectro, lentes e condição de parada em `relatorio.md` (seção "Pré-compromisso") ANTES do Passo 2.

## Passo 2: Gerar perfis

Gere todos os perfis num só subagente (`Agent`, `subagent_type: general-purpose`) passando espectro, lentes e o bloco **Problema** do briefing. Cada perfil, um parágrafo: nome, idade, curso, cidade, rotina, renda/constraint, relação com tecnologia, como a turma se organiza hoje, o que faria aderir ou abandonar, lente.

Salve em `personas.md`. Revise: se os perfis parecerem genéricos ou todos simpáticos, peça uma nova versão com mais atrito.

## Passo 3: Entrevistas em 3 fases

Um subagente por persona, todos em paralelo na mesma mensagem. Para reduzir custo, use `model: "sonnet"` nos subagentes de persona. Cada subagente recebe o perfil e a instrução: "Você É esta pessoa. Responda em primeira pessoa, linguagem falada de Pernambuco quando natural, sem sair do personagem, sem ser educado demais. Se não se importaria, diga."

As fases revelam informação aos poucos. Continue o MESMO subagente com `SendMessage` entre fases para ele lembrar do que disse (se `SendMessage` não estiver disponível, crie um novo subagente e cole as respostas anteriores).

- **Fase 1, problema às cegas** (só o bloco Problema): como sua turma organiza a formatura hoje? O que mais irrita? Já perdeu dinheiro, prazo ou informação? Usaria algo novo para isso?
- **Fase 2, revelação** (bloco Produto): primeira reação. O que você usaria primeiro? O que não entendeu? Como seria seu primeiro acesso (link por email, código de convite)? O que falta?
- **Fase 3, pontos fracos** (bloco Pontos fracos + o que a própria persona criticou): isso faz você desistir? Voltaria para o WhatsApp? Recomendaria para outra turma? Nota de 0 a 10 de chance de usar até a formatura.

Salve as transcrições completas em `entrevistas.md`, organizadas por persona.

## Passo 4: Rodadas de grupo (o que aproxima do MiroFish)

Simula o grupo de WhatsApp da turma depois do lançamento. Use os mesmos subagentes das entrevistas.

1. **Rodada 1**: cada persona escreve UMA mensagem para o grupo da turma sobre o app (pode ser reclamação, dúvida, elogio, meme, silêncio = "não postaria nada").
2. Monte o feed com todas as mensagens, em ordem aleatória, com nome e papel de quem postou.
3. **Rodada 2**: mande o feed para cada persona. Ela responde a uma ou duas mensagens, ou ignora. Pergunte também: "Sua opinião sobre o app mudou depois de ler o grupo? De quanto para quanto (0 a 10)?"
4. **Rodada 3**: repita com o feed acumulado. Foco em quem convenceu quem.

Salve o feed completo em `grupo.md` e registre a mudança de nota de cada persona (Fase 3 → Rodada 2 → Rodada 3).

Influência a observar: comissão e formandos engajados puxando adesão; céticos espalhando desconfiança; dúvidas repetidas que indicam falha de onboarding.

## Passo 5: Síntese honesta

Faça a síntese você mesmo (agente principal), lendo `entrevistas.md` e `grupo.md`. Escreva em `relatorio.md`, nesta ordem:

```
# Simulação de usuários do Formandos [especulação]
Data · N personas · foco · modelo das personas

## Resultado: APROVADO / REPROVADO
Condição de parada (texto exato do pré-compromisso) e se disparou, com evidência.

## Pré-compromisso
Espectro, lentes e condição de parada (gravados antes das entrevistas).

## Adesão prevista por segmento
Tabela: segmento, nota média, quantos usariam, quantos abandonariam, motivo principal.

## Funcionalidades mais e menos valorizadas
Login, convite por código, votações, presença, orçamento, avisos, tarefas, dúvidas.

## Atritos de uso
Do mais citado ao menos citado, com quem citou.

## O que faria abandonar / recomendar

## Dinâmica do grupo
Mudanças de opinião, quem influenciou quem, dúvidas repetidas.

## Sinais adversariais
As rejeições, uma por uma. Não suavize.

## Sinal de alerta de viés
Percentual de aprovação. Se passou de 80%, diga que as personas provavelmente estão simpáticas demais.

## Recomendações
Tabela: #, área do app, mudança sugerida, tipo (adicionar/mudar/remover), motivo, quantas personas sustentam.

## Comparação com o MiroFish (se existir)
Se `/home/luan/Documentos/Projetos/MiroFish/resultados-formandos/resultado-formandos.md` existir, compare: onde concordam, onde divergem. Concordância entre os dois NÃO é validação, os dois são LLM.

## O que só usuários reais respondem
Perguntas abertas + plano curto de validação: quem entrevistar na Unifacol (5 formandos, 2 da comissão, 1 professor), quais 5 perguntas fazer, qual teste de usabilidade rodar.
```

## Passo 6: Fechar

Mostre ao usuário: resultado (aprovado/reprovado), 3 achados principais, número de recomendações, caminho da pasta. Não faça commit; o usuário decide.

## Erros

- **Persona sai do personagem** (vira assistente, fica educada demais, cita código): reenvie a mensagem reforçando perfil e lente. Se falhar de novo, registre a lacuna no relatório e siga.
- **Subagente falha**: tente uma vez com prompt mais curto. Se falhar, pergunte ao usuário se pula a persona.
- **Custo**: cada persona gera cerca de 6 chamadas (3 fases + 3 rodadas). Com 16 personas, cerca de 100 chamadas. Avise o usuário antes de passar de 16 personas.
