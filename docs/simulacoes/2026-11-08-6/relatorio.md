# Simulação de usuários do Formandos 9 — depois da festa e confiança [especulação]

2026-11-08 · 8 personas · foco: fim do ciclo de vida (arquivar, sair, apagar, exportar, "e se sair do ar", coordenação da faculdade, LGPD) · app real, conferido no código · personas em `sonnet` · síntese pelo agente principal

Arquivos desta pasta: `briefing.md` (o que foi mostrado às personas, conferido no código), `personas.md`, `roteiro.txt` (as 3 fases), `rodada1.txt` a `rodada3.txt` (instruções das rodadas), `entrevistas.md` (3 fases completas), `grupo.md` (3 rodadas e tabela de notas).

Comparação: simulações 1 a 8 em `../2026-11-07/` a `../2026-11-08-5/`. As simulações 2 e 3 descreveram Termos, Política e exportação como inexistentes (erro corrigido no relatório da 4). Esta é a primeira que testa o fim do ciclo.

**Mudança de método:** para economizar chamadas, cada persona fez as 3 fases em sequência no mesmo subagente, gravando cada fase antes de ler o bloco seguinte (`roteiro.txt`). As rodadas de grupo seguiram o método normal.

## Resultado: REPROVADO

Condição de parada (texto exato do pré-compromisso): **"Se 4 ou mais das 8 personas disserem que não confiariam os dados da turma ao site, ou que não o recomendariam por causa de dados, continuidade ou LGPD (nota final da Fase 3 igual ou menor que 4 com esse motivo), REPROVADO."**

**Disparou com 6 de 8.**

| Persona | Nota Fase 3 | Motivo declarado | Frase |
|---|---|---|---|
| Rafael (formando cético) | 4 | confiança | "Não confiaria os dados da turma sem backup com prazo e política de fim de vida." |
| Juliana (comissão) | 4 | confiança | "Como única fonte, não. [...] Projeto acadêmico sem empresa e o email da Unifacol me deixam com um pé atrás." |
| Dra. Mônica (DPO da Unifacol) | 3 | confiança | "Tem LGPD básico melhor que muita empresa de formatura, mas é projeto acadêmico sem continuidade e usa o nome da instituição sem autorização." |
| Prof. Severino (paraninfo) | 4 | confiança | "Privacidade não o preocupa, sumir sim." |
| Camila (quer sair antes) | 4 | confiança | "O site não resolve o que me importa [...] e ainda pode apagar a minha prova." |
| Lucas (turma seguinte) | 3 | confiança | "Sem exportar planilha e sem compromisso de continuar, a empresa de formatura com app grátis fecha negócio antes." |
| Thaís (quer guardar) | 4 | outro | falta exportação legível da turma e lugar para fotos e contrato |
| Diego (indiferente) | 2 | outro | "não vê motivo" para entrar |

A comissão (Juliana) rejeitou. A coordenação (Dra. Mônica) não proibiria, mas também não recomendaria: "ciente, sem aval". Seis meses depois, a **turma seguinte (Lucas) fechou com a empresa de formatura**.

## Pré-compromisso

Gravado em 2026-11-08, antes de gerar qualquer persona.

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

## Adesão prevista por segmento [especulação]

| Segmento | Nota média (Fase 3 → Rodada 3) | Confiaria os dados ao site | Motivo principal |
|---|---|---|---|
| Formando (4) | 3,5 → 3,5 | 0 (como única fonte) | não exporta a turma; sair apaga o voto; backup sem prazo |
| Comissão (1) | 4 → 3 | 0 | toda a prova ficou na mão dela; a responsabilidade legal caiu na comissão |
| Coordenação (1) | 3 → 3 | não; "ciente, sem aval" | sem dono depois da formatura, sem prazo de retenção, email institucional |
| Professor (1) | 4 → 3 | não | "sumir" |
| Turma seguinte (1) | 3 → 2 | não; foi para a empresa de formatura | sem exportação e sem plano de continuidade |
| **Total (8)** | **3,5 → 3,1** | **0** | |

## O que as personas entenderam e valorizaram [especulação]

**Entendimento:** as 8 personas descreveram corretamente, depois da Fase 2, o que acontece ao sair, ao arquivar e ao excluir a conta. O ciclo de vida está claro. O que gera desconfiança é o que o ciclo **não** cobre.

**Valorizado:**
- **Exclusão real com email de confirmação** (Dra. Mônica, Rafael, Camila, Lucas). Lucas: "mais do que o app da atlética fez."
- **Baixar os próprios dados** (Rafael, Camila, Thaís, Juliana). Todos reclamaram do formato JSON.
- **Política aberta com responsável e encarregado identificados** (Dra. Mônica, Rafael, Camila). Camila: "mais séria do que eu esperava". Mônica: "LGPD básico melhor que muita empresa de formatura".
- **Arquivar como só leitura** (Thaís, Juliana, Severino).

**Rejeitado:**
- **Sair apaga o voto** (Juliana, Camila, Thaís, Lucas). Para quem precisa provar uma decisão, é o defeito mais grave.
- **"Enquanto a conta existir"** como prazo (Dra. Mônica, Rafael, Camila).
- **O registro interno invisível** (Juliana, Camila, Rafael).

## Atritos [especulação]

Do mais citado ao menos citado.

1. **Não exporta a turma em formato legível** (7: Thaís, Lucas, Juliana, Severino, Dra. Mônica, Camila, Rafael). Na prática, Juliana montou "o PDF do resultado 'como era no dia'" a partir de prints e da planilha dela: "a prova de verdade veio do que eu mesma guardei".
2. **Sem plano de continuidade nem sucessor** (7: Thaís, Lucas, Severino, Juliana, Dra. Mônica, Rafael, Camila). "Quem garante que o site existe daqui a dois anos?" (Thaís). Os Termos dizem "sem garantia de disponibilidade" e não prometem aviso antes de desligar.
3. **Sair apaga o voto e o resultado muda, sem guardar "como era"** (4: Juliana, Camila, Thaís, Lucas). Camila só saiu depois de receber o PDF feito à mão: "se eu sair meu voto some e o resultado muda".
4. **Turma arquivada sem prazo** (4: Dra. Mônica, Rafael, Camila, Thaís). A solução veio da comissão no grupo: exclusão 60 dias depois do arquivamento, escrita por Juliana.
5. **Email institucional da Unifacol no encarregado de dados** (4: Dra. Mônica, Lucas, Juliana, Rafael). Mônica, no email às comissões: "foi usado sem autorização da instituição e deve ser trocado". Rafael chamou de "enganoso".
6. **Backup sem prazo e registro interno sem explicação** (3: Rafael, Dra. Mônica, Camila). "Se ninguém sabe, então 'apagado' é só promessa" (Rafael). Ninguém respondeu essas perguntas até o fim da simulação.
7. **Jargão de LGPD incompreensível** (3: Severino, Diego, Thaís). "Encarregado de dados", "ANPD", "MEI com CNPJ".
8. **JSON ilegível** (3: Thaís, Lucas, Severino). "Eu não abro isso nem a pau."
9. **Fotos, vídeo e contrato fora do site** (3: Thaís, Severino, Juliana). O vídeo da homenagem do professor foi salvo no celular da filha e impresso.
10. **Dinheiro e reembolso ausentes do ciclo** (3: Camila, Juliana, Diego). O reembolso foi resolvido por Pix e zap, com atraso.
11. **Voto identificado no arquivo** (2: Rafael, Camila).
12. **Senha e email no primeiro acesso** (2: Diego, Severino).

## O que faria abandonar / recomendar [especulação]

**Abandonar:** depender só do site como registro (todas). A turma seguinte trocou o site pela empresa de formatura: "sem exportar planilha e sem compromisso de continuar".

**Recomendar:** "com ressalva", nas mesmas palavras de 5 personas: usar no dia a dia e guardar cópia por fora. Mônica deixou condições escritas para a turma de 2028: "nada de CPF nem telefone no site; nome do responsável da comissão e data de exclusão definidos por escrito no primeiro dia; nada do nome ou logo da Unifacol; guardar cópia da turma fora do site".

**O que mudaria a posição:** Mônica reavaliaria com "prazo de retenção, comissão como controladora, termo de uso, aviso prévio de desligamento, exportação da turma e retirada do email da Unifacol". Lucas olharia de novo para 2029 "se o site um dia exportar a turma em planilha e tiver alguém com nome e contato".

## Dinâmica do grupo [especulação]

- **O email da DPO virou o centro da conversa.** Depois dele, Rafael, Camila e Juliana passaram a cobrar a comissão, não o aluno que fez o site. Mônica: "o controlador dos dados da turma é a comissão [...] Se vazar, a responsabilidade não é do aluno que montou o site: é de vocês."
- **A comissão assumiu, no grupo, o que o site não faz.** Juliana se nomeou responsável pelos dados, marcou a exclusão para 60 dias depois do arquivamento, montou o PDF do resultado "como era no dia", calculou reembolsos e pediu a troca do email institucional. A nota dela caiu de 4 para 3: "toda a prova fica na minha mão".
- **Querer guardar e querer apagar se resolveram juntos.** Thaís, Juliana e Camila querem o registro; Rafael e Mônica querem apagar com prazo. A saída que o grupo achou atende os dois: exportar primeiro, depois excluir com data marcada.
- **A cópia por fora venceu.** Thaís ajudou o professor a guardar vídeo e lista no celular da filha e em papel. Severino: "minha confiança continua na gente, não no sistema".
- **A turma seguinte foi embora.** O email da DPO "confirmou o que eu desconfiava" (Lucas). Seis meses depois, fechou com a empresa de formatura, "já com propaganda caindo no zap, como eu previa", e mantém planilha própria.
- **Perguntas que ficaram sem resposta até o fim:** o backup é apagado, e quando? O que o registro interno guarda depois da exclusão?

Notas: 3,5 (Fase 3) → 3,25 (Rodada 2) → 3,1 (Rodada 3).

## Sinais adversariais

1. **Lucas (turma seguinte, 3 → 2).** Perdido para a concorrência. Projeto "com cara de TCC", sem exportação e sem plano para quando os 4 se formarem.
2. **Dra. Mônica (DPO, 3 → 3).** Não proíbe, não recomenda, não permite uso de nome, logo ou email institucional. Cita um caso de 2022 em que um site abandonado ficou no ar com dados de alunos e logo da faculdade, e os pais cobraram a Unifacol.
3. **Juliana (comissão, 4 → 3).** O site não serve como prova. Ela fez a prestação de contas inteira fora dele.
4. **Camila (4 → 4).** Teve que adiar a própria saída para não perder a prova. Precisou citar o art. 18 duas vezes para receber o reembolso.
5. **Rafael (4 → 4).** Saiu e apagou a conta antes do arquivamento. "Fica o registro de que ninguém respondeu sobre backup nem sobre o que o registro interno guarda de pessoal."
6. **Prof. Severino (4 → 3).** Nunca abriu o site. "Sumir" é o medo dele.
7. **Thaís (4 → 4, motivo "outro").** Fez tudo por print e Drive. "Nunca mais abri a pasta, igual a do ensino médio."
8. **Diego (2 → 2, motivo "outro").** O reembolso de R$ 80 chegou por Pix, com cobrança duas vezes no zap.

## Sinal de alerta de viés

**Aprovação: 0 de 8.** A maior nota foi 4. Não há sinal de personas simpáticas demais.

Riscos registrados:
- **O tema convida à desconfiança.** Um espectro montado em torno de dados e continuidade tende a punir um projeto acadêmico. Mesmo assim, três céticas reconheceram que a base de LGPD individual é melhor que a de concorrentes.
- **Método simplificado nas fases** (ver topo). A persona escreve e grava cada fase antes de ler a seguinte, mas no mesmo subagente.
- **Fatos inventados na Rodada 3.** Lucas disse que mandou email ao "pessoal do site" e recebeu "resposta vaga". Juliana e Mônica relataram a troca do email institucional "depois de cobrança". Esses eventos não aconteceram no mundo real e não entram como evidência.
- **"Usado sem autorização"** é afirmação da persona da DPO, não um fato conferido. Só a equipe sabe se o uso do email institucional foi autorizado.

## Recomendações [especulação]

Nenhuma destas deve ser implementada antes do levantamento consolidado e da análise de arquitetura (ver plano das simulações).

| # | Área do app | Mudança sugerida | Tipo | Motivo | Personas que sustentam |
|---|---|---|---|---|---|
| 1 | Turma (comissão) | **Exportar a turma** em PDF legível e CSV: decisões com data, resultado de cada votação, presença, fornecedores, tarefas e avisos | adicionar | bloqueio nº 1; a prestação de contas foi feita à mão | 7 |
| 2 | Termos / operação | **Plano de fim escrito:** aviso prévio por email (ex.: 60 dias) e exportação liberada antes de desligar o site; dizer quem mantém depois que os 4 se formarem | adicionar | "e se sair do ar"; a turma seguinte saiu por isso | 7 |
| 3 | Turma (comissão) | **Prazo de exclusão ao arquivar:** a comissão escolhe (ex.: 60, 90 ou 180 dias), os membros recebem email antes e a turma é excluída sozinha no prazo | adicionar | o grupo inventou exatamente isso (60 dias); atende quem quer guardar e quem quer apagar | 5 |
| 4 | Política / empresa | **Rever o email do encarregado de dados** (confirmar autorização da Unifacol ou trocar) e escrever "o Formandos não é um site oficial da Unifacol" | mudar | risco real hoje, no código (`src/lib/empresa.ts`); 4 personas leram como aval falso | 4 |
| 5 | Votações / decisões | **Congelar o resultado ao fixar a decisão:** guardar o total e a contagem do dia; se alguém sair depois, o voto vira "ex-membro" anônimo nesse resultado, em vez de sumir | mudar | quem sai apaga a prova; repete a simulação 6 (#10) | 4 |
| 6 | Minha conta | Exportação pessoal também em PDF ou planilha, além do JSON | mudar | "eu não abro isso" | 4 |
| 7 | Política | Escrever por quanto tempo o backup do provedor guarda os dados e o que o registro interno guarda depois da exclusão (e por quanto tempo) | mudar | pergunta sem resposta até o fim; sem ela, "apagado é só promessa" | 3 |
| 8 | Turma | Mostrar no site quem é o responsável pelos dados da turma (o controlador, da comissão) | adicionar | a DPO pôs a responsabilidade na comissão; hoje o site não registra isso | 3 |
| 9 | Turma | Histórico de ações importantes visível aos membros (arquivou, excluiu, fixou decisão, removeu membro) | mudar | o registro existe, mas ninguém da turma vê | 3 |
| 10 | Conta | Email de exclusão com data e hora e a lista do que foi apagado, para servir de comprovante | mudar | Rafael e Camila guardaram o email como prova | 3 |
| 11 | Entrada / Sobre | Uma frase na primeira tela: quem mantém, que é grátis e até quando, que não é da Unifacol, como sair | adicionar | Lucas: "resposta em uma frase, não política de privacidade"; repete as simulações 1 a 3 | 3 |
| 12 | Escopo | **Decidir:** não guardar fotos, vídeos nem contratos no site (custo, imagem, LGPD); dizer isso claramente e sugerir onde guardar | decidir | 3 personas queriam, mas guardar imagem aumenta o risco que as céticas apontaram | 3 |

As recomendações #1, #2 e #3 respondem à pergunta que reprovou a simulação: "o que acontece com a turma quando a formatura acaba, e quando o projeto acaba". A #4 é a única que aponta um risco do código de hoje e não precisa de funcionalidade nova.

## Comparação com o MiroFish

O MiroFish (`/home/luan/Documentos/Projetos/MiroFish/resultados-formandos/resultado-formandos.md`) não simulou o depois da festa. O grafo dele registra fatos que conversam com esta simulação: o SLA "sem compensação financeira [...] por se tratar de projeto acadêmico", a falta de rota de saúde do serviço (já existe `/api/healthz` no código) e a exclusão de conta. Nenhum agente do MiroFish reagiu a isso como usuário. Não há como comparar reações.

Concordância entre os dois não é validação: os dois são LLM.

## O que só usuários reais respondem

Perguntas abertas:
1. A coordenação ou a DPO real da Unifacol vê o Formandos como risco para a instituição? O email institucional do encarregado foi autorizado?
2. Comissões reais exportariam a turma e excluiriam no prazo, ou deixariam arquivada para sempre?
3. Uma turma do ano seguinte usaria um site feito por alunos que já se formaram? O que precisaria ver escrito?
4. Quem já saiu de uma turma confere se os dados foram apagados?
5. Quanto tempo o backup do provedor guarda os dados de fato? (pergunta para a equipe, no painel do banco)

Plano curto de validação:
- **Quem entrevistar na Unifacol:** a pessoa responsável por proteção de dados ou o jurídico da faculdade (1 conversa, a mais importante), 2 da comissão de uma turma já formada, 5 formandos já formados (pelo menos 1 que saiu de grupo ou pediu para apagar dados), 1 professor paraninfo.
- **5 perguntas:**
  1. "Depois da sua formatura, onde ficaram as decisões, a lista e os comprovantes? Você conseguiria achar hoje?"
  2. "Alguém já precisou provar uma decisão da turma depois? Como fez?"
  3. "Quando você sai de um grupo ou app, quer que apaguem seus dados? Como confere?"
  4. (comissão) "Se o site exportasse a turma em PDF e apagasse tudo 60 dias depois, você usaria? Que prazo faria sentido?"
  5. (faculdade) "O que a faculdade exigiria por escrito de uma ferramenta feita por alunos para não se opor?"
- **Teste de usabilidade:** num protótipo, pedir a 2 pessoas da comissão que arquivem a turma, exportem o registro e marquem a data de exclusão, e a 3 formandos que saiam da turma e excluam a conta guardando o comprovante. Medir se entendem o que fica e o que some, sem ler a Política.
