# Simulação de usuários do Formandos 10 — teste do pacote de melhorias [especulação]

2026-11-08 · 8 personas · foco: se o pacote das correções mais repetidas (avisos que chegam, link com código embutido, valor por pessoa, regra para fixar decisão, "Minha situação") transforma REPROVADO em APROVADO · **5 melhorias hipotéticas**, resto do app real · personas em `sonnet`

Arquivos desta pasta: `briefing.md` (o que foi mostrado às personas: 5 melhorias hipotéticas e o resto do app real), `personas.md`, `roteiro.txt` (as 3 fases, feitas em sequência no mesmo subagente), `rodada1.txt` a `rodada3.txt`, `entrevistas.md`, `grupo.md` (3 rodadas e tabela de notas).

## Resultado: REPROVADO

Condição de parada (texto exato do pré-compromisso): **"Se 4 ou mais das 8 personas rejeitarem a proposta central, REPROVADO."** Rejeição = nota da Fase 3 ≤ 4, ou dizer que a função central continua no WhatsApp ou na planilha.

**Disparou com 7 de 8.** Contando só a nota (≤ 4), seriam 4 de 8, e ainda dispararia.

| Persona | Nota Fase 3 | Função principal | Rejeição? |
|---|---|---|---|
| Bárbara (engajada) | 7 | site | não |
| Kelly (sem dinheiro) | 7 | WhatsApp/planilha | sim, pela régua |
| Igor (presidente) | 6 | WhatsApp/planilha | sim, pela régua |
| Davi (desconfiado) | 5 | WhatsApp/planilha | sim, pela régua |
| Anderson (ocupado) | 4 | WhatsApp/planilha | sim |
| Patrícia (tesoureira) | 4 | WhatsApp/planilha | sim |
| Dona Socorro (mãe) | 3 | WhatsApp/planilha | sim |
| Prof. Expedito | 2 | WhatsApp/planilha | sim |

**Mas é o melhor resultado das 10 simulações em nota.** A média foi 4,75 na Fase 3 e 5,5 depois do grupo. A média final só fica atrás da simulação 4 (6,1), que tinha um foco estreito (primeiro acesso). É a primeira vez que as notas sobem nas duas rodadas, que nenhuma nota cai e que **as duas pessoas da comissão terminam com 5 e 7**.

| | Sim 1 (app real) | Sim 2 (2 melhorias) | Sim 7 (dinheiro) | Sim 8 (semana da festa) | **Sim 10 (pacote)** |
|---|---|---|---|---|---|
| Média Fase 3 | 2,6 | 3,3 | 2,5 | 3,25 | **4,75** |
| Média final | 2,3 | 3,1 | 2,9 | 3,1 | **5,5** |
| Comissão (final) | rejeitou | rejeitou | 3 e 3 | 3 e 3 | **5 e 7** |

**Leitura [especulação]:** o pacote resolveu o que acontece **dentro** do site, e o WhatsApp deixou de ser o lugar onde se decide e se registra. O WhatsApp **continua sendo o canal**: onde se avisa, se cobra e se pergunta. Para 7 de 8, "função principal no WhatsApp" significa agora "eu fico sabendo pelo zap e pago por Pix", e não mais "o site não serve". A régua pré-fixada não separa esses dois sentidos, por isso o resultado é REPROVADO.

## Pré-compromisso

Gravado em 2026-11-08, antes de gerar qualquer persona. Os achados das simulações 1 a 9 foram usados para escolher o espectro e escrever os pontos fracos que continuam.

### Base de comparação (simulações anteriores, app real salvo onde indicado)

| Simulação | Foco | Resultado | Média Fase 3 | Média final |
|---|---|---|---|---|
| 1 | turma inteira | REPROVADO | 2,6 | 2,3 |
| 2 | aviso + "Minha situação" hipotéticos | REPROVADO | 3,3 | 3,1 |
| 3 | só comissão | REPROVADO | 2,1 | 1,3 |
| 4 | primeiro acesso | REPROVADO | 4,75 | 6,1 |
| 5 | outros tipos de turma | REPROVADO | 2,4 | 1,6 |
| 6 | votações e decisões | REPROVADO | 3,4 | 4,6 |
| 7 | dinheiro | REPROVADO | 2,5 | 2,9 |
| 8 | semana da festa | REPROVADO | 3,25 | 3,1 |
| 9 | depois da festa | REPROVADO | 3,5 | 3,1 |

### Espectro (8 personas)

Uma turma típica, com os perfis que mais rejeitaram nas simulações anteriores, para a comparação ser justa.

| # | Segmento | Variação | Lente | O que testa |
|---|---|---|---|---|
| 1 | Formando participante | engajado, lê tudo, cobra detalhe | Power user | regra de decisão, valor por pessoa |
| 2 | Formando participante | sem dinheiro, paga parcelado com dificuldade, tem vergonha de dever | Pragmático | "Minha situação", valor por pessoa |
| 3 | Formando participante | trabalha e estuda, silenciou o grupo, quase não lê email | Indiferente | avisos que chegam, link de convite |
| 4 | Formando participante | desconfiado de app novo ("já tem o grupo do WhatsApp"), acha que a comissão decide sozinha | Cético | regra de decisão, confiança |
| 5 | Comissão (admin) | tesoureira com planilha, controladora | Power user | carga de registrar parcelas, valor por pessoa |
| 6 | Comissão (admin) | presidente sobrecarregado, quer parar de repetir aviso e de levar a culpa | Pragmático | avisos, regra de decisão |
| 7 | Familiar | mãe ou pai que paga as parcelas e quer ver o que foi pago | Cético | se o pacote chega à família |
| 8 | Professor representante | pouca intimidade com tecnologia, chamado para mediar conflito | Indiferente | link de convite, decisões visíveis |

Lentes: 2 de cada (pragmático, cético, power user, indiferente).

### Condição de parada (a mesma régua das simulações 7 e 8)

**Se 4 ou mais das 8 personas rejeitarem a proposta central, REPROVADO.**

Proposta central: usar o Formandos (com as melhorias) para acompanhar e organizar a formatura até o fim. Conta como rejeição: nota final da Fase 3 igual ou menor que 4, ou dizer que a função central para aquela pessoa continua no WhatsApp ou na planilha (formando e família: ficar sabendo das coisas e da própria situação; comissão: coordenar a turma). Se menos de 4 rejeitarem, APROVADO.

Regra 3 da skill: se mais de 80% aprovarem (7 ou 8 de 8), registrar que as personas provavelmente estão simpáticas demais e refazer as críticas com mais viés adversarial antes de concluir.


## Adesão prevista por segmento [especulação]

| Segmento | Nota média (Fase 3 → Rodada 3) | O que passou para o site | O que ficou no WhatsApp ou na planilha |
|---|---|---|---|
| Formando (4) | 5,75 → 6,25 | votar, ver a decisão e quantos votaram, ver a própria situação | ficar sabendo (email não é lido), Pix, conversa e cobrança |
| Comissão (2) | 5,0 → 6,0 | votação com quórum, decisão com justificativa, "Minha situação" para parar o "paguei?" | colar aviso no grupo, cobrar quem não votou, Pix, controle financeiro real (planilha) |
| Familiar (1) | 3 → 4 | nada sozinha; a filha mostra "Minha situação" | tudo |
| Professor (1) | 2 → 3 | nada | combina tudo de boca, quer papel impresso |

## Melhorias: o que funcionou e o que não [especulação]

| Melhoria | Funcionou | Não funcionou | Evidência |
|---|---|---|---|
| **Regra para fixar decisão** | **sim, a mais forte** | regra de empate e "admin pode apagar voto?" ficaram sem resposta escrita | Quórum atingido (33 a 40 de 62, contra "19 votos" antes); Davi: "o histórico [...] vira munição pra mim"; Igor: "quem reclamar [...] agora tem a conta de quem votou aí"; o professor-mediador achou razoável |
| **"Minha situação"** | **sim, para quem paga** | depende da tesouraria lançar (1 a 3 dias de atraso); casos de parcela dupla e de pai pagando com outro nome ficaram fora | Kelly: "resolve meu maior problema"; Bárbara e Davi conferiram e estava em dia; Patrícia lançou "o que cabia" e o resto foi para a aba de observações |
| **Link de convite com código** | **sim** | o professor e a mãe não entram sozinhos | Kelly, Anderson e Igor: "um toque com o Google"; nenhuma reclamação de código |
| **Valor por pessoa** | **sim** | sem total da festa nem contrato anexado | o mais barato (R$ 70) venceu; Kelly e Dona Socorro votaram/opinaram por preço; Davi quer a proposta completa |
| **Avisos por email** | **não** | email não é lido; o quórum só bateu porque Igor, Patrícia e Bárbara marcaram gente no grupo | Anderson: o email "caiu na caixa velha no meio de propaganda"; Patrícia: "pelo email sozinho não ia"; Igor colou o aviso no grupo com o "Copiar para o WhatsApp" |

**"Copiar para o WhatsApp" foi usado e ajudou, mas mantém a comissão como "carteiro"** (Igor, Fase 3). É o recurso de aviso que de fato circulou, como na simulação 2.

## Atritos que sobraram [especulação]

1. **Email não é o canal** (7 de 8). Só a Bárbara e a comissão leem. Kelly, Anderson, Dona Socorro e o professor pedem o aviso no WhatsApp.
2. **Registro duplo na tesouraria** (Patrícia, Igor, Bárbara). O site não tem pagamento parcial, nem pagamento de terceiro, nem juros, nem importação ou exportação. Por isso o controle de verdade continua na planilha, e Bárbara confere uma contra a outra.
3. **Não exporta** (Patrícia, Bárbara, professor, Davi). Patrícia: "Não consegui exportar nada pro Igor ou pro professor, então o relatório eu montei na planilha mesmo." O professor quer "os papéis" impressos.
4. **Projeto sem plano para depois** (Bárbara, Davi, Patrícia, Dona Socorro, professor, Igor). "E meu histórico, some?" (Bárbara). É o mesmo achado da simulação 9.
5. **Família e professor sem acesso** (Dona Socorro, professor). Dona Socorro só viu "Minha situação" porque a filha mostrou no celular.
6. **Regra de empate e poder do admin sobre votos sem resposta escrita** (Bárbara, Davi). O empate foi decidido "na palavra do Igor", no grupo.
7. **Contrato e proposta completa do fornecedor** (Davi). Valor por pessoa sem documento não bastou para ele.

## Dinâmica do grupo [especulação]

- **A regra de decisão mudou o tom da turma.** Na Rodada 1, Bárbara e Davi exigiram regra de quórum e de empate e que nada mudasse com a votação aberta. Igor respondeu por escrito: quórum sobre os 62, sem mexer em prazo, justificativa visível. Davi, o mais desconfiado, terminou com "cumpriu o que disse" e subiu de 5 para 6.
- **O quórum bateu por causa do WhatsApp.** As três pessoas que mais cobraram (Igor, Patrícia, Bárbara) fizeram isso marcando gente no grupo. O site registrou a decisão; o grupo trouxe as pessoas.
- **A tesoureira ganhou confiança ao avisar o limite do site.** "Se eu ainda não lancei não é porque não pagou, pode levar um ou dois dias." Kelly e Dona Socorro citaram essa frase como o que as tranquilizou.
- **Privacidade da dívida funcionou.** Kelly pediu "me chama no privado, não coloca meu nome aqui no grupo de novo", e Patrícia fez isso.
- **"Depois não venha dizer que não sabia"** (Igor) irritou Dona Socorro: "mãe não tem email e não tá no grupo, como é que vai saber?".

Notas: 4,75 (Fase 3) → 4,9 (Rodada 2) → 5,5 (Rodada 3). Ninguém caiu na Rodada 3.

## Sinais adversariais

1. **Prof. Expedito (2 → 3).** Não entra, não tem conta, quer tudo impresso. Para ele, o site só serviu porque "a justificativa visível" é o que faltava quando foi chamado para mediar.
2. **Dona Socorro (3 → 4).** O pacote não chega a quem paga sem passar pelo filho. "Eu mesma não abri link nenhum."
3. **Patrícia (4 → 5).** O site virou uma segunda planilha, mais simples que a dela. Casos reais de pagamento (duas parcelas juntas, pai com outro nome) não cabem.
4. **Anderson (4 → 5).** Usou o link e votou, mas só fica sabendo das coisas se o marcarem no grupo.
5. **Davi (5 → 6).** Vigia a comissão pelo histórico, mas quer contrato, proposta completa e garantia de que o admin não apaga voto.

## Sinal de alerta de viés

**Aprovação pela régua: 1 de 8 (12%). Notas ≥ 6 no fim: 4 de 8 (50%).** Não passou de 80%: não há sinal de personas simpáticas demais.

Riscos registrados:
- **As melhorias são hipotéticas e foram descritas sem defeito de uso.** Na prática, email transacional pode ter entrega pior, e "Minha situação" exige telas e regras que não foram desenhadas. As notas medem a ideia, não a implementação.
- **A régua mistura duas coisas.** "Função no WhatsApp" pegou quem continua só recebendo aviso pelo zap (Kelly, nota 7; Igor, nota 7). Mudar a régua agora seria trocar o pré-compromisso depois de ver o resultado, então o REPROVADO fica.
- **Método simplificado nas fases** (3 fases no mesmo subagente) e números divergentes do quórum na Rodada 3.

## Recomendações para o levantamento [especulação]

Este é o objetivo desta simulação: priorizar. Ordem sugerida pelo efeito observado.

| # | Área | Mudança | Tipo | Efeito observado nesta simulação | Personas |
|---|---|---|---|---|---|
| 1 | Votações | **Regra para fixar decisão** (prazo, quórum, "votaram X de Y", justificativa, histórico) | adicionar | o maior ganho de confiança; dobrou a participação com ajuda do grupo | 8 (inclusive os céticos e o professor) |
| 2 | Convite | **Link de convite com código embutido** + Google em destaque | mudar | nenhuma reclamação de entrada; pequeno e já mapeado no código (`botao-convite.tsx`) | 5 |
| 3 | Dinheiro | **"Minha situação"** com "Já paguei + print" e data da última atualização | adicionar | resolveu a dor de quem paga; tem que aceitar parcela dupla e pagamento de terceiro | 6 |
| 4 | Votações | **Valor por pessoa** em cada opção (e anexo ou link da proposta) | adicionar | decidiu a votação; Davi quer o documento | 5 |
| 5 | Avisos | **"Copiar para o WhatsApp"** em aviso, votação e decisão (texto puro com link) | adicionar | o canal que de fato funcionou | 7 |
| 6 | Avisos | Email: manter **só para o essencial** (prazo, decisão, mudança no evento) e com assunto claro ("prazo", "mudou") | ajustar | só o email com "prazo" no título foi lido | 7 (não leem) |
| 7 | Próximo gargalo | Canal no WhatsApp de verdade (avaliar custo e viabilidade da API oficial) | avaliar | é o que falta para "Minha função passou para o site" | 7 |
| 8 | Próximo gargalo | Exportar a turma e as parcelas (CSV/PDF) e importar a planilha da tesouraria | adicionar | tira a tesouraria do registro duplo; repete a simulação 9 | 4 |
| 9 | Próximo gargalo | Página pública do evento e da decisão, sem login, para família e professor | adicionar | repete a simulação 8 | 2 |
| 10 | Votações | Regra de empate e "o que a comissão pode apagar" escritas na tela | mudar | a pergunta que ficou sem resposta | 2 |

**Conclusão para o levantamento:** as 4 primeiras melhorias (regra de decisão, link com código, "Minha situação" e valor por pessoa) valem a pena e funcionaram juntas. O aviso por email, sozinho, não resolve o bloqueio que aparece em todas as simulações. O que resolve, em parte, é o texto pronto para o WhatsApp. O próximo salto depende de três coisas fora do pacote: canal no WhatsApp, exportação e importação, e acesso sem login para quem não é formando.

## Comparação com o MiroFish

O MiroFish disse que, consertados aviso, orçamento e convite, "todo mundo recomenda e esquece o WhatsApp". Aqui, com essas correções (hipotéticas), as notas subiram, mas **ninguém esqueceu o WhatsApp**: ele virou o canal de aviso e cobrança, e o site, o lugar da decisão e do registro. Concordância e divergência entre os dois não validam nada: os dois são LLM.

## O que só usuários reais respondem

1. Uma turma real lê email de "prazo"? Quantos abrem?
2. A tesouraria real lançaria parcelas no site se pudesse importar a planilha?
3. A regra de quórum aumenta mesmo a participação, ou é o grupo que faz isso?
4. Pais usariam "Minha situação" do filho, com acesso próprio de leitura?

Plano curto de validação:
- **Protótipo navegável** (Figma ou HTML) das 5 melhorias, testado com 5 formandos, 2 da comissão (de preferência a tesouraria), 1 professor e 1 pai ou mãe.
- **5 tarefas:** entrar pelo link de convite; votar sabendo o preço por pessoa; ver "votaram X de Y" e a justificativa; achar "quanto eu devo" e marcar "Já paguei"; (comissão) fixar uma decisão sem quórum e escrever a justificativa.
- **5 perguntas:** "Você leria um email do Formandos? Qual?"; "O que ainda mandaria no grupo?"; "O que te faria largar a planilha?"; "A regra de quórum muda o que você acha da comissão?"; "Seu pai ou mãe usaria essa tela?".
- **Teste de canal:** numa turma real, mandar a mesma convocação por email e por texto colado no grupo e contar quantos votam por cada link.
