# Simulação de usuários do Formandos [especulação]

2026-11-15 · 8 personas · rodada 2, tema 4 (outros tipos de turma: ABC, Ensino Médio, pós/MBA, Saúde) · personas em `sonnet` · síntese pelo agente principal

Arquivos desta pasta: `briefing.md`, `personas.md` (os mesmos perfis de `2026-11-08-2`), `entrevistas.md` (3 fases completas), `grupo.md` (3 rodadas do grupo e a tabela de notas).

## Resultado: REPROVADO

As duas condições dispararam. Bastava uma.

| Condição (texto do pré-compromisso) | Disparou? | Evidência (Fase 3) | Em `2026-11-08-2` |
|---|---|---|---|
| 4 ou mais das 8 personas rejeitarem | **Sim, 4 de 8, no limite** | Josinaldo 2, Yasmin 2, Rosângela 3, Dona Benedita 2 | Sim, 8 de 8 |
| O mesmo bloqueio aparecer em 4 ou mais personas | **Sim** | "Não dá recibo nem comprovante; o dinheiro continua por fora" (Marcos, Josinaldo, Ingrid, Hugo, Dona Benedita: 5). "Votação nova e aviso não avisam" (Marcos, Ingrid, Jamile, Dona Benedita: 4). "A escola não é a responsável; aluno com MEI" (Josinaldo, Yasmin, Rosângela, Hugo: 4) | Sim |

**Média: 2,4 → 4,4 na Fase 3; 1,6 → 4,4 no fim do grupo.**

**Leitura honesta** [especulação]: o tema se partiu em dois.
- **Turmas de adultos (pós, MBA, Saúde) passaram a adotar.** Ingrid, Hugo e Jamile foram de 3, 3 e 4 para 7. Na rodada 3, Ingrid e Jamile contam que a turma usa o site para votar e ver a parcela; Hugo usa para parcelas, presença e portaria, com o Excel de reserva. O que mudou para eles:
  - entrar por link e Google em menos de 2 minutos;
  - "Minha situação";
  - histórico de correções com nome e hora;
  - votar com prazo sem reunião.
- **Turmas de escola (ABC, Ensino Médio) continuam rejeitando, agora por decisão do próprio projeto.** A ADR-0011 tirou a aluna de 17 anos do site ("o site é feito pra quem não sou eu"). O resto vem de três decisões:
  - a ADR-0011 também manteve um voto por conta, sem responsável ligado ao aluno;
  - um participante comum fica em uma turma só;
  - o site não tem contrato com a escola.

  A coordenação continua sem levar o site à direção ("ninguém me trouxe um papel de jurídico nem contrato"). O pai que paga e a avó ficam com o recibo da secretaria.
- **A exceção é o pai da comissão do ABC** (Marcos, 3 → 5 → 6). Ele usa o site para as enquetes de tema e lembrancinha ("acabaram as 300 mensagens, e o 'não vi' sumiu"). O dinheiro fica na planilha. Os casos de pai separado e de gêmeos ele controla à mão.

## Pré-compromisso

Gravado em 2026-11-15, antes de qualquer entrevista. É o mesmo pré-compromisso da simulação de `2026-11-08-2`, repetido de propósito para a comparação valer (`docs/simulacoes/plano-rodada-2.md`). Os perfis são os mesmos de `2026-11-08-2/personas.md`. Não muda depois de ver os resultados.

### Espectro

| # | Tipo de turma | Perfil | Lente |
|---|---|---|---|
| T1 | Educação Infantil / ABC | mãe ou pai da comissão de pais | Power user |
| T2 | Ensino Médio (3º ano) | pai ou mãe que paga a festa | Cético |
| T3 | Ensino Médio (3º ano) | aluno(a) de 16 ou 17 anos | Indiferente |
| T4 | Escola (ABC e Ensino Médio) | coordenador(a) pedagógico(a) que acompanha as formaturas | Cético |
| T5 | Pós-graduação / MBA | aluno(a) adulto(a) que trabalha, turma híbrida | Pragmático |
| T6 | Pós-graduação / MBA | representante da turma que organiza | Power user |
| T7 | Área da Saúde | formanda(o) com plantões e estágio | Pragmático |
| T8 | Educação Infantil + Ensino Fundamental | mãe ou avó com duas crianças se formando em turmas diferentes | Indiferente |

Cada lente aparece 2 vezes.

### Definição de rejeição

Nota de 0 a 4 na chance de usar o site com a turma até a formatura (Fase 3), ou declaração explícita de que não usaria.

### Condição de parada

O resultado é **REPROVADO** se qualquer uma destas acontecer:

1. 4 ou mais das 8 personas rejeitarem;
2. o mesmo bloqueio aparecer em 4 ou mais personas.

### Limite da comparação

As personas não lembram da rodada 1. A comparação é entre duas leituras independentes do mesmo perfil.

## Comparação com a rodada 1 (`2026-11-08-2`)

Mesmos perfis, mesma régua. Notas na ordem Fase 3 → fim do grupo.

| # | Persona | Tipo | Rodada 1 | Rodada 2 | O que mudou |
|---|---|---|---|---|---|
| T1 | Marcos, pai da comissão do ABC | ABC | 3 → 2 | 5 → 6 | Tesouraria, observador, exportar, histórico, "Mandar para o grupo". Continua: pai separado e gêmeos são 2 votos |
| T2 | Josinaldo, pai que paga | 3º ano | 2 → 1 | 2 → 3 | Gostou de "não recebe dinheiro" e da página pública sem conta. Continua: escola não assume, sem recibo |
| T3 | Yasmin, 17 anos | 3º ano | 2 → 1 | 2 → 2 | **Novo motivo:** não pode ter conta. "Quem entra e vota é minha mãe" |
| T4 | Rosângela, coordenadora | ABC e EM | 1 → 1 | 3 → 3 | Observador "é justo o que eu queria"; regra dos 18 resolve o menor. Continua: sem contrato, a mantenedora não assina |
| T5 | Ingrid, MBA híbrido | Pós/MBA | 3 → 2 | 7 → 7 | Link + Google em 2 minutos; "Minha situação". Largou a planilha |
| T6 | Hugo, representante da pós | Pós | 3 → 2 | 7 → 6 | Parcela, pagamento parcial, histórico de correção. Falta comprovante e relatório |
| T7 | Jamile, Enfermagem | Saúde | 4 → 3 | 7 → 7 | Votar sem reunião das 19h; site leve no A14. Falta pergunta de escala de plantão |
| T8 | Dona Benedita, avó | ABC + 9º ano | 1 → 1 | 2 → 1 | Igual: duas turmas, recibo da secretaria, "coisa demais" |
| | **Média** | | **2,4 → 1,6** | **4,4 → 4,4** | |

**Efeito do grupo:** na rodada 1 o grupo puxou todos para baixo (−0,8). Agora a média ficou estável. Na rodada 1, todas as mensagens perguntavam "alguém já usou?". Agora Marcos, Ingrid e Hugo contaram que testaram, e as respostas ao Josinaldo ("o dinheiro fica onde sempre ficou") vieram de quem usou.

### Achados da rodada 1 neste tema

| Achado de `2026-11-08-2` | Situação | Evidência |
|---|---|---|
| O site não avisa | **parcial** | Os 5 emails existem. Votação nova e aviso ainda não; Marcos, Ingrid e Jamile colam no WhatsApp |
| Sem pagamento, parcela ou recibo | **parcial** | Parcelas, "Minha situação" e "Já paguei" atendem Ingrid, Hugo e Jamile. Recibo e comprovante continuam faltando (5) |
| Comissão vê quem votou | **parcial** | Voto secreto por pergunta existe. Marcos aceita o voto aberto se a turma souber; Josinaldo ainda não quer |
| Sem regra para menor | **resolvido por decisão** | Regra dos 18 nos Termos e no cadastro. Rosângela aceitou. Efeito colateral: Yasmin fica de fora |
| Sem responsável ligado ao aluno (1 voto por família) | **continua (decisão)** | Marcos controla pai separado e gêmeos à mão |
| Escola fora do app | **parcial** | Observador agradou a coordenação; contrato com a escola continua faltando (Rosângela, Josinaldo) |
| Conta, senha, confirmação | **parcial** | Link + Google resolveu Ingrid e Jamile; Dona Benedita não entra |
| Projeto com MEI sem suporte | **continua** | Josinaldo, Rosângela, Yasmin, Hugo |
| Código vaza, sem aprovar entrada | **parcial** | A comissão pode remover; Marcos, Hugo e Rosângela toleram |
| Uma turma por participante | **continua** | Dona Benedita. Só administrador e observador entram em mais de uma |
| Não importa a lista | **resolvido** | Convite por lista de emails |
| Exportar a turma (CSV) | **resolvido** | Marcos citou como ponto forte |

## Adesão prevista por segmento [especulação]

| Segmento | Personas (Fase 3 → R2 → R3) | Média final | Adotam (≥5) | Rejeitam (≤4) | Motivo principal |
|---|---|---|---|---|---|
| Pós e MBA | Ingrid 7→7→7 · Hugo 7→6→6 | 6,5 | 2 | 0 | Parcela e histórico; falta comprovante e relatório |
| Saúde | Jamile 7→7→7 | 7 | 1 | 0 | Votar sem reunião; falta escala de plantão |
| ABC, comissão de pais | Marcos 5→5→6 | 6 | 1 | 0 | Enquete e histórico; dinheiro na planilha |
| Escola: pai, aluna, coordenação | Josinaldo 2→2→3 · Yasmin 2→2→2 · Rosângela 3→3→3 | 2,7 | 0 | 3 | Escola não assume; menor sem conta; sem recibo |
| Família com duas turmas | Dona Benedita 2→2→1 | 1 | 0 | 1 | Uma turma só; secretaria |
| **Total (8)** | | **4,4** | **4** | **4** | |

## Como cada modelo de catálogo se saiu [especulação]

| Modelo | Quem avaliou | Acertou | Faltou |
|---|---|---|---|
| Educação Infantil / ABC | Marcos, Rosângela | Horário das crianças, alergias, cuidados, "quem participa são os responsáveis" | Autorização de imagem; o que a escola permite (horário de ensaio, regras do espaço) (Rosângela) |
| Ensino Médio | Josinaldo, Yasmin | Local, música, bar com menores | O aluno decide e quem vota é o pai: Josinaldo "fica de fora" do que interessa e a Yasmin fica sem voz |
| 9º ano do Fundamental | Dona Benedita | — | **Não há modelo** para formatura do 9º ano |
| Pós / MBA | Ingrid, Hugo | Formato, colação, local, convidados, traje | Turma híbrida: "quem vai presencial e quem acompanha online" (Hugo), sábado do encontro (Ingrid), valor do convidado extra (Hugo, de novo) |
| Saúde | Jamile | Jaleco, juramento, plantões, alergias | Escala de plantão (de novo); valor do baile como pergunta |

## Funcionalidades mais e menos valorizadas [especulação]

| Função | Reação | Quem |
|---|---|---|
| Link + Google, sem instalar | **a mais citada pelos adultos** | Ingrid, Jamile, Hugo |
| "Minha situação" | "exatamente o que eu quero" | Ingrid, Hugo, Jamile |
| Histórico com nome e hora | ajuda a prestar contas | Hugo, Marcos, Rosângela |
| Votar com prazo, sem reunião | "uma benção" para quem dá plantão | Jamile |
| Observador | "justo o que eu queria" | Rosângela, Marcos |
| Página pública sem conta | o único uso do pai e da aluna | Josinaldo, Yasmin |
| Presença e lista da portaria | usado na pós | Hugo |
| "Não recebe dinheiro" | tranquiliza | Josinaldo, Rosângela, Jamile |
| Regra dos 18 | coordenação aprova; a aluna fica de fora | Rosângela, Yasmin |
| Termos e tela "coisa demais" | cansa | Dona Benedita, Ingrid, Yasmin |

## Atritos de uso [especulação]

1. **Sem recibo nem comprovante** (5): Marcos, Josinaldo, Ingrid, Hugo, Dona Benedita.
2. **Votação nova e aviso não avisam** (4): Marcos, Ingrid, Jamile, Dona Benedita.
3. **Escola não assume; aluno com MEI** (4): Josinaldo, Yasmin, Rosângela, Hugo.
4. **Sem responsável ligado ao aluno; 2 votos por família** (2): Marcos, Josinaldo.
5. **Modelos sem pergunta de turma híbrida, convidado extra, escala de plantão, 9º ano** (4): Hugo, Ingrid, Jamile, Dona Benedita.
6. **Relatório para a reunião (PDF)** (1): Hugo.
7. **Uma turma por participante** (1, decisivo): Dona Benedita.
8. **Aluno menor sem conta** (1, decisivo): Yasmin.

## O que faria abandonar / recomendar [especulação]

**Abandonar:** metade da turma continuar respondendo no grupo (Ingrid: "tive que ficar olhando os dois lugares"); falta de comprovante e relatório (Hugo volta ao Excel); a escola não assinar (Rosângela).

**Recomendar:** Ingrid, Hugo, Jamile e Marcos recomendam, com ressalva ("pra representante de pós vale testar, só não esperem milagre", Hugo). Josinaldo, Rosângela e Dona Benedita não recomendam para escola. Yasmin não se importa.

## Dinâmica do grupo [especulação]

- **Dois blocos:** adultos que testaram (Marcos, Ingrid, Hugo, Jamile) e escola/família (Josinaldo, Rosângela, Dona Benedita). Yasmin ficou calada nas três rodadas, coerente com quem silenciou o grupo.
- **Ingrid puxou Jamile:** "abriu rápido no Redmi, sem instalar" deu coragem para Jamile testar no A14 trincado ("deu certo").
- **Josinaldo e Rosângela se reforçaram:** "o senhor tem razão, e é o que eu falei". Dona Benedita seguiu os dois.
- **Hugo e Marcos responderam ao Josinaldo** explicando que o site só registra. Josinaldo sobe de 2 para 3: "obrigado pela franqueza".
- **A convergência da rodada 1 não se repetiu.** Na rodada 1 as 8 terminaram com "ninguém usou". Agora cada bloco termina com o seu argumento.

## Sinais adversariais [especulação]

- **Yasmin (2):** "o site é feito pra quem não sou eu." Depois de um mês: "Se a comissão tiver testado o site, eu nem fiquei sabendo."
- **Rosângela (3):** "Eu não levei o site pra direção, porque ninguém me trouxe um papel de jurídico nem contrato."
- **Josinaldo (2 → 3):** "sem recibo eu fico na secretaria."
- **Dona Benedita (2 → 1):** "Os que gostaram eram gente mais nova, de pós e de MBA, não tem nada a ver comigo."
- **Hugo (7 → 6):** "a planilha do Excel continua de reserva e para montar o relatório que o site não faz, então ainda tenho trabalho dobrado."

## Sinal de alerta de viés

- **Aprovação: 50%** (4 de 8 com nota 5 ou mais). Abaixo de 80%.
- **Erros de persona:** Josinaldo diz que "os meninos" da turma talvez usem o site para enquete; pela regra dos 18, os alunos do 3º ano não têm conta. Marcos fala em "histórico de quem votou", que só vale nas perguntas que não são secretas. Dona Benedita leu "18 anos ou mais" como se fosse sobre ela ("tenho 66, passo").
- **Testes inventados:** Marcos, Ingrid, Hugo e Jamile "testaram" com a turma. Os resultados são invenção das personas e servem só para ilustrar.
- **O briefing citou a regra dos 18 e "uma turma por participante" como pontos fracos.** Isso pode ter puxado a nota das personas de escola para baixo, mas são fatos do site e foram os mesmos motivos da rodada 1 (menor e família).

## Recomendações [especulação]

| # | Área | Mudança sugerida | Tipo | Motivo | Sustentam |
|---|---|---|---|---|---|
| 1 | Emails | Email de votação nova aberta (mesma recomendação dos temas 1, 2, 3, 5) | adicionar | 4 personas aqui | 4 |
| 2 | Dinheiro | Recibo simples do lançamento confirmado (página para imprimir ou PDF com nome, valor, data, quem confirmou) | avaliar | Josinaldo, Dona Benedita, Hugo, Marcos | 5 |
| 3 | Escola | Uma página "Para a escola": quem é o responsável, que dados guarda, regra dos 18, o que a escola vê como observador, como apagar. Para a coordenação levar à direção | adicionar | Rosângela, Josinaldo | 2 |
| 4 | Catálogo | Pós: pergunta "presencial ou online" e convidado extra com valor. Saúde: escala de plantão antes da data. ABC: autorização de imagem. Avaliar um modelo de 9º ano | mudar | Hugo, Ingrid, Jamile, Rosângela, Dona Benedita | 5 |
| 5 | Turmas | Avaliar deixar o responsável (participante comum) entrar em duas turmas | avaliar | Dona Benedita; só faz sentido se escola for público | 1 |
| 6 | Escopo | Decidir se turma de escola é público. Se for, voto por família e responsável ligado ao aluno voltam à mesa; se não, dizer isso na vitrine e nos modelos de ABC e Ensino Médio | decidir | 4 rejeições vêm da escola | 4 |
| 7 | Relatório | Resumo do caixa para imprimir (entradas por mês, quem está em dia, sem nomes de devedores) | avaliar | Hugo | 1 |

**A recomendação 6 vem antes das outras.** As turmas de adultos já adotam com o site atual. As de escola só mudam se o projeto decidir atendê-las.

## Comparação com o MiroFish

O resultado do MiroFish é anterior às ADR-0001 a 0016 e não foi rodado de novo. Não serve para medir a melhoria.

## O que só usuários reais respondem

1. Uma coordenação real levaria uma página "Para a escola" à direção, ou exige contrato de qualquer jeito?
2. Uma turma de MBA real larga a planilha em um mês?
3. Turma de Enfermagem vota a data sem uma pergunta de escala de plantão?
4. Na turma de ABC, quantas famílias têm pai e mãe que querem votar separados?

**Plano curto de validação:**
- **Quem:** 1 turma de pós ou MBA, 1 de Saúde e 1 coordenação de escola particular.
- **Pós ou MBA:** usar parcelas e votações por 2 semanas. Contar quantos entram, quantos votam e se a planilha fica de lado.
- **Saúde:** testar o modelo da Saúde com 3 formandos, que marcam pergunta por pergunta "usaria", "não usaria" ou "falta".
- **Coordenação:** conversa de 15 minutos. Mostrar o papel de observador e os Termos, e perguntar o que a escola exigiria para indicar o site.
