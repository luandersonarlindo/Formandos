# Simulação de usuários do Formandos [especulação]

2026-11-15 · 8 personas · rodada 2, tema 8 (depois da festa e confiança) · personas em `sonnet` · síntese pelo agente principal

Arquivos desta pasta: `briefing.md`, `personas.md` (os mesmos perfis de `2026-11-08-6`), `entrevistas.md` (3 fases completas), `grupo.md` (3 rodadas do grupo, notas e motivo).

## Resultado: APROVADO

Condição de parada (texto exato do pré-compromisso): **"Se 4 ou mais das 8 personas disserem que não confiariam os dados da turma ao site, ou que não o recomendariam por causa de dados, continuidade ou LGPD (nota final da Fase 3 igual ou menor que 4 com esse motivo), REPROVADO."**

**Não disparou: 1 de 8** (na rodada 1, 6 de 8).

| Persona | Fase 3 | Motivo | Conta? | Frase |
|---|---|---|---|---|
| Camila (quer sair, brigou com a comissão) | 4 | confiança | **sim** | "a prova some se a comissão quiser, o voto não é secreto e o responsável é um aluno com Gmail" |
| Diego (indiferente) | 4 | outro | não | "não é confiança nem LGPD, é que eu simplesmente não tenho interesse" |
| Prof. Severino (paraninfo) | 4 | outro | não | o site não guarda o vídeo da homenagem, "não serve pra minha dor" |
| Thaís (quer guardar) | 5 | outro | não | "usaria pra organizar, mas não pra guardar" |
| Rafael (cético com dados) | 5 | confiança | não | "é bem melhor que planilha no Drive, mas não é cofre" |
| Dra. Mônica (coordenação) | 5 | confiança | não | "pode usar por conta e risco da turma [...] Eu não assino nada" |
| Juliana (comissão) | 6 | confiança | não | "Resolve metade da minha dor [...] mas a prova não tem como ser verificada" |
| Lucas (turma seguinte) | 6 | outro | não | "Confiaria o que eu consigo exportar, sim. O que só existe lá dentro, não." |

**Média: 3,5 → 4,9 na Fase 3; 3,1 → 5,25 no fim do grupo.** Primeira vez neste tema em que a média **sobe** no grupo.

**Leitura honesta** [especulação]: o pacote da ADR-0009 respondeu ao que derrubou o tema na rodada 1. As personas citaram, sem ninguém pedir:
- prazo de exclusão obrigatório;
- exclusão que espera o aviso;
- email mesmo para quem desligou;
- backup de 30 dias;
- registro em PDF;
- "Meus dados" legível;
- "não é oficial da Unifacol".

Rafael: "Isso é o que eu cobrei na comissão e ninguém fez." Dra. Mônica: "Isso eu não vejo nem em empresa grande."

Mas **ninguém passou a tratar o site como cofre**. O consenso é "ferramenta para organizar, com tudo baixado antes do prazo". Na rodada 3, todas as personas que se importavam tinham guardado cópia fora: Drive de duas pessoas, disco criptografado, PDF impresso na caixa de sapato. A turma seguinte, que na rodada 1 fechou com a empresa de formatura, agora adota com backup semanal (Lucas, 3 → 7).

O APROVADO é limitado: as notas ficam entre 4 e 7. Ninguém deu nota alta.

## Pré-compromisso

Gravado em 2026-11-15, antes de qualquer entrevista. É o mesmo pré-compromisso da simulação de `2026-11-08-6`, repetido de propósito para a comparação valer (`docs/simulacoes/plano-rodada-2.md`). Os perfis são os mesmos de `2026-11-08-6/personas.md`. Não muda depois de ver os resultados.

### Espectro (8 personas)

| # | Segmento | Variação | Lente |
|---|---|---|---|
| 1 | Formando participante | recém-formado que quer guardar o registro da turma (decisões, contatos, lembrança) e depois seguir a vida | Pragmático |
| 2 | Formando participante | desconfiado com dados (já teve dado vazado), quer apagar tudo e conferir que apagou | Cético |
| 3 | Comissão (admin) | vai arquivar a turma e prestar contas finais; quer provar decisões depois | Power user |
| 4 | Formando participante | nunca mais volta ao site; esquece que tem conta | Indiferente |
| 5 | Coordenação da faculdade | coordenador(a) de curso ou setor de LGPD/jurídico da Unifacol, preocupado com dados e imagem da instituição | Cético |
| 6 | Professor representante | paraninfo/representante, pouca intimidade com tecnologia | Indiferente |
| 7 | Formando participante | brigou com a comissão e quer sair antes da festa; quer saber o que acontece com voto e dados | Power user |
| 8 | Comissão da turma seguinte | turma do ano que vem que quer usar o site e pergunta se ele ainda vai existir | Pragmático |

Lentes: 2 de cada (pragmático, cético, power user, indiferente).

### Condição de parada

**Se 4 ou mais das 8 personas disserem que não confiariam os dados da turma ao site, ou que não o recomendariam por causa de dados, continuidade ou LGPD (nota final da Fase 3 igual ou menor que 4 com esse motivo), REPROVADO.**

Conta como rejeição só quando o motivo citado é confiança, dados, continuidade ("e se sair do ar") ou LGPD. Nota baixa por outro motivo (ex.: "não preciso disso") é registrada, mas não conta.

### Limite da comparação

As personas não lembram da rodada 1. A comparação é entre duas leituras independentes do mesmo perfil. Na rodada 1, cada persona fez as 3 fases no mesmo subagente com um roteiro; aqui as fases são reveladas uma a uma, como nos outros temas. As perguntas são as mesmas.

## Comparação com a rodada 1 (`2026-11-08-6`)

Mesmos perfis, mesma régua. Notas na ordem Fase 3 → fim do grupo.

| # | Persona | Rodada 1 | Rodada 2 | O que mudou |
|---|---|---|---|---|
| D1 | Thaís, quer guardar | 4 → 4 | 5 → 5 | Registro em PDF e "Meus dados" em PDF. Continua: sem fotos e documentos |
| D2 | Rafael, cético com dados | 4 → 4 | 5 → 6 | Prazo obrigatório, backup de 30 dias, aviso mesmo com emails desligados. Continua: Gmail, sem comprovante da exclusão da turma, sem 2FA |
| D3 | Juliana, comissão | 4 → 3 | 6 → 6 | Registro, "fotografia" da decisão ("votaram 41 de 63"), registro de quem baixou. Continua: a prova é editável e depende de ela exportar |
| D4 | Diego, indiferente | 2 → 2 | 4 → 4 | Aviso antes de apagar (por causa do reembolso). Motivo "outro" |
| D5 | Dra. Mônica, coordenação | 3 → 3 | 5 → 5 | "Não é oficial", prazo, aviso, 18+. Continua: aluno responsável, Gmail, sem contrato; agora a preocupação é com as cópias baixadas |
| D6 | Prof. Severino, paraninfo | 4 → 3 | 4 → 4 | Registro impresso. Continua: sem fotos e vídeo. Motivo "outro" |
| D7 | Camila, quer sair | 4 → 4 | 4 → 5 | Sair apaga o rastro; recebeu o registro e a planilha. Continua: só a comissão baixa; voto não secreto por padrão |
| D8 | Lucas, turma seguinte | 3 → 2 | 6 → 7 | Exportar, prazo, aviso de 60 dias. Na rodada 1 foi para a empresa de formatura; agora usa com backup semanal |
| | **Média** | **3,5 → 3,1** | **4,9 → 5,25** | |

### Recomendações da rodada 1 neste tema

| # | Recomendação de `2026-11-08-6` | Situação | Evidência |
|---|---|---|---|
| 1 | Exportar a turma em PDF e CSV | **resolvido** | Juliana e Lucas exportaram; Thaís, Camila e o professor receberam |
| 2 | Plano de fim escrito (60 dias) | **parcial** | Está nos Termos, mas faixa e email não existem. 6 de 8 chamaram de "promessa no papel" |
| 3 | Prazo de exclusão ao arquivar | **resolvido** | "a exclusão aconteceu como avisaram" (Thaís, Rafael, Lucas) |
| 4 | Email do encarregado e "não é oficial" | **parcial** | "Não é oficial" agradou a coordenação. O Gmail pessoal agora é a crítica (Rafael, Mônica, Camila, Juliana) |
| 5 | Congelar o resultado ao fixar | **parcial** | A "fotografia" resolveu a briga do buffet (Juliana). Votações abertas ainda mudam quando alguém sai |
| 6 | "Meus dados" em PDF | **resolvido** | Thaís, Rafael, Camila baixaram |
| 7 | Prazo do backup na Política | **resolvido** | Rafael aprovou; ainda quer prova de que sumiu do backup |
| 8 | Responsável pelos dados da turma | **continua** | Dra. Mônica: "ninguém respondeu minha pergunta sobre quem responde" pelas cópias baixadas |
| 9 | Histórico visível aos membros | **resolvido** | Camila e Rafael aprovaram |
| 10 | Email de exclusão como comprovante | **parcial** | Existe para conta excluída. Para a turma excluída não há email depois (ADR-0009): Rafael ficou sem comprovante |
| 11 | Frase na primeira tela (quem mantém, não é da Unifacol) | **resolvido** | O professor: "eu não ia dizer 'a Unifacol recomenda', porque não recomenda" |

## Adesão prevista por segmento [especulação]

| Segmento | Notas (Fase 3 → R2 → R3) | Média final | Motivo principal |
|---|---|---|---|
| Formandos (4) | Thaís 5→5→5 · Rafael 5→5→6 · Diego 4→4→4 · Camila 4→4→5 | 5,0 | usam para organizar, guardam fora; Camila desconfia da comissão |
| Comissão (1) | Juliana 6→6→6 | 6 | a prova continua nas costas dela |
| Coordenação (1) | Dra. Mônica 5→5→5 | 5 | "por conta e risco da turma"; quer saber quem guarda as cópias |
| Professor (1) | Prof. Severino 4→4→4 | 4 | site não guarda o que ele perdeu (vídeo) |
| Turma seguinte (1) | Lucas 6→6→7 | 7 | adota com backup semanal |
| **Total (8)** | | **5,25** | |

## Funcionalidades mais e menos valorizadas [especulação]

| Função | Reação | Quem |
|---|---|---|
| Prazo de exclusão obrigatório, sem "para sempre" | **a mais elogiada** | Rafael, Mônica, Camila, Lucas, Diego |
| Exclusão que espera o aviso; email mesmo com emails desligados | "o meu problema é sumir sem eu saber" | Thaís, Rafael, Diego, Mônica |
| Registro da turma em PDF | "aprovo de olhos fechados" | Prof. Severino, Thaís, Juliana, Lucas |
| "Fotografia" da decisão | "resolve exatamente a minha briga do buffet" | Juliana |
| Registro de quem baixou planilha | "evita briga na comissão" | Juliana, Lucas, Mônica, Rafael, Camila |
| "Meus dados" em PDF e JSON | usado por todos os desconfiados | Rafael, Camila, Thaís |
| "Não é oficial da Unifacol" | a coordenação gostou | Dra. Mônica, Prof. Severino |
| Aviso de 60 dias | **a mais criticada**: só texto | Rafael, Juliana, Mônica, Severino, Camila, Lucas |
| Encarregado com Gmail pessoal | fragilidade | Rafael, Mônica, Camila, Juliana |
| Só a comissão baixa o registro | "a prova fica na mão de quem não tem interesse" | Camila, Rafael, Thaís |

## Atritos de uso [especulação]

1. **O aviso de 60 dias é só texto** (6): Rafael, Juliana, Mônica, Severino, Camila, Lucas.
2. **Só a comissão baixa o registro da turma** (5): Thaís, Rafael, Camila, Lucas, Severino (que pediu impresso).
3. **Encarregado com Gmail pessoal, aluno responsável, sem contrato** (4): Rafael, Mônica, Camila, Juliana.
4. **Sem fotos e documentos** (3): Thaís, Severino, Juliana (contrato).
5. **Sem comprovante da exclusão da turma** (3): Rafael, Mônica, Camila.
6. **Quem responde pelas cópias baixadas** (3): Mônica, Rafael, Lucas (que mudou de ideia no grupo).
7. **Prova editável** (planilha de votos) (2): Juliana, Camila.
8. **Sem 2FA nem desconectar aparelho** (2): Rafael, Diego.
9. **Voto aberto por padrão** (2): Camila, Rafael.

## O que faria abandonar / recomendar [especulação]

**Abandonar:** a comissão não exportar a tempo (Thaís, Camila); o site sair do ar sem a faixa de aviso (Lucas); turma com briga, onde "o site vira mais um campo de batalha" (Camila).

**Recomendar:** 6 de 8 recomendariam com a mesma ressalva, "baixe tudo antes da data". Dra. Mônica não recomenda nem proíbe. Diego "não recomenda nem desrecomenda".

## Dinâmica do grupo [especulação]

- **A turma se organizou sozinha em torno da exportação.** Na rodada 1, 6 das 8 mensagens pediram que a comissão baixasse o registro e as planilhas antes da sexta.
- **Juliana passou de "não venham me cobrar" a postar o link.** Camila e Rafael cobraram; ela postou o PDF e a planilha de votos com data. Camila: "recebi, obrigada".
- **Lucas propôs Drive de duas pessoas. A Dra. Mônica rebateu** ("duas cópias no Drive é duas cópias com dado pessoal"). Na rodada 3, Lucas repetiu o argumento dela.
- **Thaís juntou as fotos e o vídeo da homenagem** para o professor, fora do site.
- **Diego ficou no vácuo** sobre os R$ 80 e foi cobrar a Juliana no privado depois da exclusão. É o caso que o site não cobre: valor pendente depois de a turma sumir.
- **Notas subiram no grupo** (4,9 → 5,25). Na rodada 1 caíram (3,5 → 3,1). Ver o ciclo inteiro funcionar ("aviso, exportar, arquivar, apagar", Lucas) contou a favor.

## Sinais adversariais [especulação]

- **Camila (4 → 5):** "o registro só tem totais, e a lista de quem votou em quê ficou só com a comissão, então a prova da irregularidade vale pouco sem confiar nela. Voto ainda devia ser secreto por padrão."
- **Dra. Mônica (5):** "O que sobrou foi o que eu previa, cópias espalhadas. [...] Nada disso tem prazo nem dono confirmado."
- **Rafael (6):** "Não vi prova de que sumiu dos backups, nem comprovante com data como eu queria. Só tenho a palavra do site."
- **Juliana (6):** "A parte de quem votou em quê ficou só comigo na planilha, e isso é editável, então prova forte mesmo não tenho."
- **Diego (4):** "Se eu tivesse perdido os R$ 80 por causa de o site apagar tudo, aí ficaria furioso."

## Sinal de alerta de viés

- **Aprovação: 50% na Fase 3** (4 de 8 com nota 5 ou mais), 75% no fim. Abaixo de 80%.
- **O briefing listou os pontos fracos com franqueza**, inclusive "a faixa e o email ainda não foram construídos". Rafael, Mônica e Camila elogiaram a honestidade ("prefiro mil vezes lista de fraquezas escrita do que promessa bonita"). Isso pode ter subido a nota; num site real a lista não aparece assim.
- **Erro de rótulo:** Lucas marcou "MOTIVO: outro" mas disse "é continuidade, mais que tudo". Não muda o resultado (nota 6).
- **Método diferente da rodada 1:** lá as 3 fases foram feitas de uma vez com roteiro; aqui, uma a uma. As perguntas são as mesmas.
- **Cenário otimista na rodada 3:** a exclusão "aconteceu como avisaram" por definição do cenário. O teste real da exclusão automática é o passo de `fluxos.mjs` da ADR-0009, não esta simulação.

## Recomendações [especulação]

| # | Área | Mudança sugerida | Tipo | Motivo | Sustentam |
|---|---|---|---|---|---|
| 1 | Encerramento | Construir a faixa e o email em massa do encerramento (o que a ADR-0009 deixou como texto) | adicionar | "promessa no papel" | 6 |
| 2 | Registro | Deixar todo membro baixar o Registro da turma em PDF (já não tem dado pessoal), pelo menos na turma arquivada | mudar | a prova não pode depender da comissão (previsto em "rever depois" da ADR-0009) | 5 |
| 3 | Encarregado | Email do encarregado próprio do projeto (domínio ou conta do Formandos), não Gmail pessoal | mudar | Rafael, Mônica, Camila, Juliana | 4 |
| 4 | Exclusão | Email "Turma excluída em dd/mm" para os membros, com o que foi apagado, como comprovante | adicionar | Rafael, Mônica, Camila | 3 |
| 5 | Arquivar | No diálogo e no email de arquivar, uma linha para a comissão: "Quem baixar planilhas é responsável por elas. Combine onde ficam e quando apagar." | mudar | Mônica, Rafael, Lucas | 3 |
| 6 | Dinheiro | Aviso à tesouraria, ao arquivar, quando há pagamento "informado" pendente ou reembolso em aberto | avaliar | Diego | 1 |
| 7 | Conta | Botão "sair deste aparelho" por sessão em "Meus dados" | avaliar | Rafael, Diego | 2 |
| 8 | Continuidade | Nomear uma segunda pessoa responsável nos Termos | avaliar | Lucas, Mônica | 2 |

## Comparação com o MiroFish

O resultado do MiroFish é anterior às ADR-0001 a 0016 e não foi rodado de novo. Não serve para medir a melhoria.

## O que só usuários reais respondem

1. Uma coordenação real aceita "por conta e risco da turma", ou pede algo assinado?
2. A comissão real exporta antes do prazo sem alguém cobrar?
3. Quantos membros baixam "Meus dados" depois do email de arquivamento?
4. O email de 7 dias chega e é lido, ou cai no spam?

**Plano curto de validação:**
- **Teste com uma turma de verdade (ou de mentira, com 5 colegas):** arquivar com 30 dias. Conferir se os dois emails chegam e quantos abrem. Contar quantos baixam "Meus dados". Ver a exclusão acontecer.
- **Conversa de 15 minutos com o setor de LGPD da Unifacol:** mostrar a Política, a faixa "não é oficial" e o diálogo de arquivar. Perguntar o que falta para não se opor.
- **3 formandos:** pedir que expliquem com as próprias palavras o que acontece com os dados ao sair, ao arquivar e ao excluir a conta. Medir se a resposta bate com o site.
