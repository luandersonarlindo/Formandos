# Levantamento da rodada 2 de simulações [especulação]

2026-11-16 · base: as 10 pastas da rodada 2 (`docs/simulacoes/2026-11-14` a `2026-11-16`) comparadas com a rodada 1 (`2026-11-07` a `2026-11-08-7`, resumida em `levantamento.md`) · 92 personas · personas em `sonnet` · plano em `plano-rodada-2.md`

**Para que serve:** responder às duas perguntas do plano. (1) O que melhorou com as ADR-0001 a 0016? (2) O que ainda falta, e qual é o próximo gargalo? Nada aqui foi validado com pessoas reais. Uma nota que sobe não prova a melhoria; serve para escolher o que validar.

## 1. As duas rodadas lado a lado

Notas médias na ordem Fase 3 → fim do grupo.

| # | Tema | Pasta (rodada 2) | Personas | Rodada 1 | Rodada 2 | Resultado (rodada 1 → 2) | O que disparou na rodada 2 |
|---|---|---|---|---|---|---|---|
| 1 | Turma inteira | `2026-11-14` | 16 | 2,6 → 2,3 | **4,1 → 4,4** | REPROVADO → REPROVADO | só o bloqueio: 13 de 16 "aviso e votação nova não chegam". Formandos 2 de 7 e comissão 1 de 3 rejeitam (antes 5 de 7 e 3 de 3) |
| 2 | Só a comissão | `2026-11-14-6` | 12 | 2,1 → 1,3 | **4,4 → 4,75** | REPROVADO → REPROVADO | 6 de 12 rejeitam, no limite (antes 12 de 12); 11 de 12 com o mesmo bloqueio. Presidente, tesoureiro e secretária não rejeitam |
| 3 | Primeiro acesso | `2026-11-14-2` | 8 | 4,75 → 6,1 | **5,75 → 6,4** | REPROVADO → REPROVADO | só o bloqueio: 8 de 8 "só volto se colarem no grupo". 1 de 8 rejeita |
| 4 | Outros tipos de turma | `2026-11-15` | 8 | 2,4 → 1,6 | **4,4 → 4,4** | REPROVADO → REPROVADO | 4 de 8 rejeitam, no limite (antes 8 de 8): só turmas de escola. Pós, MBA e Saúde foram de 3-4 para 7 |
| 5 | Votações e decisões | `2026-11-14-3` | 8 | 3,4 → 4,6 | **6,1 → 6,5** | REPROVADO → REPROVADO | 4 de 8, no limite, pelo aviso de votação nova. 8 de 8 aceitaram a decisão tomada dentro da regra |
| 6 | Dinheiro | `2026-11-14-4` | 8 | 2,5 → 2,9 | **4,6 → 5,0** | REPROVADO → **APROVADO** | 3 de 8 rejeitam (antes 8 de 8) |
| 7 | Reta final e dia do evento | `2026-11-14-5` | 8 | 3,25 → 3,1 | **4,6 → 4,4** | REPROVADO → REPROVADO | 4 de 8 não ficariam sabendo da mudança (antes 5 de 8). Briefing otimista: ver seção 5 |
| 8 | Depois da festa e confiança | `2026-11-15-2` | 8 | 3,5 → 3,1 | **4,9 → 5,25** | REPROVADO → **APROVADO** | 1 de 8 rejeita por confiança (antes 6 de 8) |
| 9 | Família e convidado sem conta (novo) | `2026-11-15-3` | 8 | sem base | **3,5 → 4,5** | REPROVADO | 5 de 8 rejeitam; 8 de 8 "abro o link uma vez e não volto". Sozinhos, 2 de 8 sabem do horário e 0 de 8 do portão |
| 10 | Turma que já tem planilha e grupo | `2026-11-16` | 8 | 4,75 → 5,5 (pacote hipotético) | **4,4 → 5,5** | REPROVADO → REPROVADO | 6 de 8 dizem que coordenar ou ficar sabendo continua no WhatsApp/planilha (antes 7 de 8) |

**Leitura geral:**
- **As notas subiram em todos os 8 temas que eram do app real**, de 1,5 a 3 pontos na Fase 3. A média dos 9 temas comparáveis foi de 3,25 para 4,8 na Fase 3.
- **Os temas 6 e 8 viraram APROVADO.** Eram os do dinheiro e do fim da turma, justamente onde o site ganhou mais coisa (ADR-0005, 0007, 0009, 0014).
- **O grupo parou de puxar para baixo.** Na rodada 1, o grupo baixou a nota em 6 dos 10 temas. Na rodada 2, a nota ficou igual ou subiu em 9 dos 10 (só o tema 7 caiu, de 4,6 para 4,4). O motivo mais citado: agora há personas que "já usaram" e respondem às dúvidas das outras.
- **O tema 10 não subiu.** Lá a rodada 1 avaliou 5 melhorias descritas como hipóteses, sem os limites reais. Agora o site existe, e a nota final é a mesma (5,5). O que era promessa se cumpriu; os limites reais (aviso, email como chave, família) entraram no lugar.
- **8 dos 10 temas continuam REPROVADO.** Em 5 deles (1, 3, 5, 7 e 9), o motivo é um só: **o site não avisa quando algo novo acontece**.

## 2. Os achados da rodada 1, um por um

Letras de `levantamento.md`, seção 2.

| # | Achado da rodada 1 | Situação na rodada 2 | Onde se viu |
|---|---|---|---|
| A | O site não avisa ninguém | **continua, menor.** Os 5 emails (ADR-0006) chegam e ajudam: prazo, decisão, "Mudou". Mas **votação nova e aviso novo não geram email**, e a família não recebe nada | bloqueio nos temas 1, 2, 3, 5, 7, 9 e 10 |
| B | Sem dono, suporte nem plano de fim | **quase resolvido.** Responsável identificado, "não é oficial da Unifacol" e prazo de exclusão agradaram. Ainda pesam três coisas: a faixa e o email de encerramento só existem no texto, o encarregado usa um Gmail pessoal e não há suporte com prazo | tema 8 (APROVADO); "projeto de aluno" ainda citado nos temas 2, 4 e 6 |
| C | Sem exportar e importar | **resolvido** | tema 2 ("exporto todo mês"), tema 8, tema 10 ("uns vinte minutos, porque não duplica") |
| D | Sem histórico visível | **resolvido; é a função mais valorizada da rodada** | temas 2, 5, 6, 8 e 10 |
| E | Dinheiro fora do app | **resolvido para quem paga** ("Minha situação"). Faltam saída do caixa, recibo e comprovante | tema 6 (APROVADO), tema 10 (Kelly passou a função para o site) |
| F | Família, convidado e fornecedor sem acesso | **parcial.** A página pública agrada, mas ninguém reabre o link. A família não vê a situação do filho | temas 7, 9, 10 |
| G | Primeiro acesso | **resolvido.** Ninguém travou no código. Atritos novos: tela de convite sem o nome da turma, email de convite indo para o spam | tema 3 |
| H | A comissão vê o voto | **resolvido** (voto secreto por pergunta) | temas 4 e 5; Camila (tema 8) quer secreto por padrão |
| I | Acessibilidade não testada | **fora da simulação** (ADR-0015: teste real feito pelo grupo) | — |
| J | Opção sem preço | **resolvido.** Atrito novo: "valor por pessoa" não diz se é por mês ou o total | tema 5 |
| K | Sem regra para fixar decisão | **resolvido** | temas 5 e 10 ("ninguém me chamou de ditador dessa vez") |
| L | Todos os admins podem tudo | **parcial.** Tesouraria e observador existem; "todo admin pode tudo" continua | tema 2 |
| M | Sair apaga o voto | **parcial.** A decisão fixada guarda a "fotografia"; votações abertas mudam | temas 5 e 8 |
| N | Presença sem nome nem lista | **resolvido** | tema 7 |
| O | Menores de idade | **decidido: só maiores de 18** (ADR-0011). As turmas de escola continuam rejeitando, agora por essa decisão | tema 4 |

**Resumo:**
- Resolvidos: 8 de 15 (C, D, E, G, H, J, K, N).
- Parciais: 4 (B, F, L, M).
- Decididos: 2 (I, O).
- O que continua é o primeiro da lista: **A**.

## 3. O próximo gargalo

**É o aviso de coisa nova, e ele tem três partes.**

1. **Votação nova e aviso novo não geram email** (temas 1, 2, 3, 5 e 10). É a recomendação 1 de cinco relatórios. A comissão continua colando no grupo e vira "carteiro" (Igor, tema 10).
2. **O texto pronto para o WhatsApp não diz que algo mudou** (temas 7 e 9).
   - No código (`textoEvento` em `src/lib/texto-whatsapp.ts`), o texto do evento só traz nome, "Quando", "Onde" e o link.
   - No tema 9, 7 de 8 leram o texto no grupo, mas só desconfiou de mudança quem lembrava do horário antigo.
   - O mesmo vale para o texto da votação e do aviso, que a comissão cola no grupo: ele é o canal que de fato chega.
3. **Portão, rampa e observações ficam fora do "Mudou"** (temas 7 e 9). Sem ninguém da turma avisar direto, 0 de 8 convidados ficariam sabendo do portão.

O WhatsApp oficial continua fora (ADR-0016). Os itens 1 e 2 não dependem dele: um é email, o outro é texto.

## 4. Ordem sugerida

Mesmo formato de `levantamento.md`. Cada item diz de onde vem.

### Nível 0: texto e ajustes pequenos

| # | Mudança | Temas |
|---|---|---|
| 0.1 | Texto pronto do evento começa com "MUDOU: horário era 20h, agora é 19h" quando há mudança dos últimos 14 dias (a mesma do "Mudou em") | 7, 9 |
| 0.2 | Tela de convite com o nome da turma e de quem convidou; assunto do email de convite que não pareça propaganda | 3 |
| 0.3 | "Valor por pessoa" com "total" ou "por mês" ao lado | 5 |
| 0.4 | Frase na tela de votação: "Ninguém da comissão muda o seu voto; mudanças em decisões ficam no histórico" | 10 |
| 0.5 | Link público trocado: a página antiga diz "Este link foi trocado. Peça o novo a quem mandou" | 9 |
| 0.6 | Email próprio do projeto para o encarregado de dados, no lugar do Gmail pessoal | 8 |

### Nível 1: o gargalo

| # | Mudança | Temas |
|---|---|---|
| 1.1 | **Email de votação nova aberta** (para quem não desligou os emails) | 1, 2, 3, 5, 10 |
| 1.2 | **Campo "Entrada / portão"** no evento, que entra no "Mudou em", no email "Mudou" e no texto do grupo; observações do local com destaque quando mudam | 7, 9 |
| 1.3 | Todo membro baixa o **Registro da turma em PDF** (já não tem dado pessoal), pelo menos na turma arquivada | 8 |
| 1.4 | Construir a **faixa e o email de encerramento** que a ADR-0009 deixou só no texto | 8 |

### Nível 2: dinheiro e família

| # | Mudança | Temas |
|---|---|---|
| 2.1 | **Saída do caixa** (o que foi pago a fornecedor), com totais para a turma | 2, 6 |
| 2.2 | **Recibo** do pagamento confirmado (página para imprimir ou PDF) | 4, 6 |
| 2.3 | **Email de quem paga** ligado ao formando, para a importação casar o pagamento feito pelo pai | 10 |
| 2.4 | Link só de leitura da **"Minha situação"**, que o formando manda para quem paga, sem a família virar participante com voto | 10 |
| 2.5 | Campos de **acessibilidade do local** (rampa, estacionamento perto, banheiro adaptado) | 7, 9 |
| 2.6 | **Link de documento** (Drive) em decisão e fornecedor, no lugar de anexo | 2, 6, 10 |

### Nível 3: decisões de produto

| # | Decisão | Temas |
|---|---|---|
| 3.1 | Turma de escola (ABC, Ensino Médio) é público do site? Se sim: responsável ligado ao aluno, voto por família, uma página "Para a escola". Se não: dizer na vitrine e nos modelos | 4 |
| 3.2 | Permissões por área para a comissão (só tarefas, só presença) | 2 |
| 3.3 | Turma com subgrupos (duas festas com colação comum) | 2 |
| 3.4 | Memória entre turmas (levar catálogo e fornecedores para a turma do ano seguinte) | 2, 8 |
| 3.5 | Manter fora: processar pagamento, QR code, fotos e vídeos, notificação no celular | todos |

## 5. Limites deste levantamento

- **Tudo é especulação.** As 92 personas são LLM, e a comparação é entre duas leituras independentes do mesmo perfil (as personas não lembram da rodada 1).
- **Os briefings mudaram de autor e de base.** A rodada 2 escreveu os briefings a partir do código. Dois erros foram achados e registrados:
  - **tema 1:** omitiu as exportações e disse que o link "já cai na turma";
  - **tema 7:** disse que o texto do grupo traz "Mudou o horário: era 20h, agora é 19h", e o código não traz isso. O resultado do tema 7 ficou otimista.

  Também houve omissões menores no tema 6 (auditoria de edição de pagamento) e no tema 9 (frase do texto pronto).
- **O método das rodadas 8 e 10 mudou:** na rodada 1 as 3 fases foram feitas de uma vez com roteiro; na rodada 2, uma a uma.
- **Falhas de execução:**
  - a pasta temporária foi apagada duas vezes;
  - no tema 2, as mensagens da rodada 1 do grupo foram regravadas;
  - no tema 9, uma mensagem foi refeita depois do limite de uso.

  Tudo foi refeito a partir de cópias salvas e registrado nos relatórios.
- **Viés de franqueza:** os briefings da rodada 2 listaram os pontos fracos com honestidade, e várias personas elogiaram isso ("prefiro lista de fraquezas escrita"). Num site real a lista não aparece assim.
- **Nenhum tema passou de 80% de aprovação.** O maior foi o tema 3 (7 de 8 no fim do grupo, mas com o bloqueio em 8 de 8).

## 6. O que validar com pessoas reais

1. **Uma turma real por 2 semanas**, com o site como está:
   - quantos entram só com o link no grupo;
   - quantos votam com e sem a comissão colar o aviso;
   - quanto tempo a tesoureira leva para colar a planilha.
2. **Duas famílias:** mandar o link uma semana antes, mudar o horário 3 dias antes e mandar só o texto pronto. No dia anterior, perguntar que horas é a entrada e por qual portão.
3. **Uma coordenação de escola e um setor de LGPD:** o que exigiriam para indicar o site (decide o item 3.1).
4. **Duas tesoureiras:** o que largariam da planilha e o que nunca largariam (decide os itens 2.1 a 2.3).

## 7. Pastas

| Tema | Rodada 1 | Rodada 2 |
|---|---|---|
| 1. Turma inteira | `2026-11-07` | `2026-11-14` |
| 2. Só a comissão | `2026-11-07-3` | `2026-11-14-6` |
| 3. Primeiro acesso | `2026-11-08` | `2026-11-14-2` |
| 4. Outros tipos de turma | `2026-11-08-2` | `2026-11-15` |
| 5. Votações e decisões | `2026-11-08-3` | `2026-11-14-3` |
| 6. Dinheiro | `2026-11-08-4` | `2026-11-14-4` |
| 7. Reta final | `2026-11-08-5` | `2026-11-14-5` |
| 8. Depois da festa | `2026-11-08-6` | `2026-11-15-2` |
| 9. Família sem conta | — | `2026-11-15-3` |
| 10. Planilha e grupo | `2026-11-08-7` | `2026-11-16` |

Cada pasta tem `briefing.md`, `personas.md`, `entrevistas.md`, `grupo.md` e `relatorio.md`.
