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

---

# Parte 2: levantamento de requisitos

As seções 8 a 10 fazem, para a rodada 2, o que as seções 7 a 9 de `levantamento.md` fizeram para a rodada 1: dizem como o código está hoje, o que reaproveitar e, item por item, o que mudar. Cada item usa o identificador da ERS 2.0 (`docs/Especificação de Requisitos de Software.md`, seção 3.2.11). Nada aqui foi implementado. Cada item, antes de ser feito, ganha uma ADR, como na rodada 1.

Convenção: **[R]** reaproveita o que existe; **[N]** é novo. "Banco" lista mudanças em `db/schema.sql`, sempre idempotentes.

## 8. Como o projeto está hoje (16/11/2026)

| Camada | Onde | O que já faz (o que mudou desde a rodada 1) |
|---|---|---|
| Rotas | `src/app/(publico)`, `(onboarding)`, `(app)`, `(admin)`, `(conta)`, `(master)` | 36 telas; novas: `/minha-situacao`, `/conta/meus-dados`, `/termos`, `/privacidade`, `/evento/[token]`, `/admin/tesouraria`, `/admin/presenca/lista`, `/admin/turma/historico`, `/admin/turma/registro` |
| Barreira | `src/lib/dal.ts` | `exigirSessao`, `exigirMembro`, `exigirAdmin`, `exigirTesouraria`, `exigir*Editavel`; o código do convite sobrevive ao login (`src/lib/convite-link.ts`) |
| Banco | `db/schema.sql` | 26 tabelas próprias, mais as do Better Auth; novas: `regras_enquete`, `parcelas`, `pagamentos`, `lembretes_enviados`, `cron_execucoes`, `convites_email`, `acompanhantes`, `enquetes_ocultas` |
| Email | `src/lib/email.ts`, `src/lib/email-turma.ts` | 15 modelos; emails da turma com preferência (`usuarios.receber_emails`) e teto diário (`EMAIL_TETO_DIA`) |
| Agendador | `/api/cron/lembretes` + serviço `cron` do Docker | lembretes de votação, parcela e presença; avisos e exclusão automática de turmas arquivadas (`src/lib/lembretes.ts`, `src/lib/fim-da-turma.ts`) |
| Texto para o grupo | `src/lib/texto-whatsapp.ts` + `MandarParaGrupo` | `textoAviso`, `textoVotacao`, `textoDecisao`, `textoEvento`, `linkWhatsApp` |
| Trilha | `src/lib/auditoria.ts`, `src/lib/auditoria-acoes.ts` | vocabulário amplo, com listas `ACOES_VISIVEIS_TURMA` e `ACOES_SO_TESOURARIA`; frases em `src/lib/historico-texto.ts` |
| Exportação | `src/lib/exportacao.ts`, `src/lib/csv.ts`, `src/lib/registro.ts` | 8 planilhas; registro em PDF pelo navegador |
| Infra | `compose.yaml` | `db`, `migrate`, `app`, `mail`, `cron`, `backup`; sem deploy (decisão do grupo); CI com typecheck e testes |

**Requisitos não funcionais que valem para todos os itens:**
- turmas de 30 a 150 pessoas;
- celular simples e 3G (páginas leves, sem JavaScript pesado);
- LGPD: dado mínimo e quem vê o quê;
- turma arquivada não muda (`exigir*Editavel`);
- tudo em português na interface;
- telas testadas com leitor de tela continuam passando em `scripts/teste/leitor.mjs` (ADR-0015);
- todo email novo da turma passa por `enviarParaTurma` e conta no teto.

## 9. Mapa de reaproveitamento (não duplicar)

Itens novos em relação ao mapa de `levantamento.md`, seção 8.

| Precisa de... | Já existe | Onde |
|---|---|---|
| Mandar email a toda a turma, com preferência e teto | `destinatariosDaTurma`, `enviarParaTurma` | `src/lib/email-turma.ts` |
| Não repetir lembrete | tabela `lembretes_enviados` e `marcar(...)` | `src/lib/lembretes.ts` |
| Comparar o evento antes e depois | `mudancasEvento`, `listarRotulos`, tipo `EstadoEvento` | `src/lib/lembretes-regras.ts` |
| Última mudança do evento (14 dias) | `getUltimaMudancaEvento`, `DIAS_DESTAQUE_MUDANCA` | `src/lib/evento-publico.ts` |
| Texto pronto para o grupo | `textoEvento`, `textoVotacao`, `textoAviso`, `textoDecisao` e o componente `MandarParaGrupo` | `src/lib/texto-whatsapp.ts`, `src/components/features/mandar-para-grupo.tsx` |
| Regra da pergunta (prazo, quórum, secreto) | `salvarRegraEnquete`, tabela `regras_enquete` | `src/actions/catalogos.ts` |
| Valor e link de opção | `lerValorPessoa`, `lerDetalheOpcao` | `src/lib/opcao-detalhe.ts` |
| Situação de cada pessoa e caixa | `listarSituacoes`, `getCaixa`, regras puras | `src/lib/pagamentos.ts`, `src/lib/situacao-regras.ts` |
| Lançamento com histórico da tesouraria | `lancarPagamento`, `editarPagamento`, `excluirPagamento`, ações `pagamento.*` | `src/actions/tesouraria.ts`, `src/lib/auditoria-acoes.ts` |
| Importar colando planilha | `lerPlanilhaPagamentos`, `descontarExistentes` e a prévia tudo ou nada | `src/lib/importar-pagamentos.ts` |
| Página para imprimir | layout de `/admin/turma/registro` e de `/admin/presenca/lista` (`@media print`) | `src/app/(admin)/admin/turma/registro/page.tsx` |
| Página pública sem login por código | `getEventoPublico`, padrão de código de 22 caracteres | `src/lib/evento-publico.ts` |
| Registro da turma | `getRegistroTurma` | `src/lib/registro.ts` |
| Faixa no topo de todas as telas | faixa de turma arquivada no `AppShell` | `src/components/features/app-shell.tsx` |
| Responsável, encarregado, textos de confiança | `EMPRESA`, `DPO`, `AVISO_INSTITUCIONAL`, `AVISO_VISIBILIDADE_VOTO` | `src/lib/empresa.ts` |

## 10. Item por item

### Nível 0 — texto e ajustes pequenos

**0.1 Texto pronto do evento diz que mudou (RF-56)**
- Problema no código: `textoEvento` (`src/lib/texto-whatsapp.ts:110`) só monta nome, "Quando", "Onde" e o link. `DadosEvento` não recebe a mudança.
- Mudanças:
  1. `DadosEvento` [R] ganha `mudanca?: { rotulo: string; antes: string; depois: string }[]`.
  2. `textoEvento` [R] começa com `*MUDOU:* horário era 20:00, agora é 19:00` quando há mudança.
  3. Quem monta os dados do botão (o card do evento da comissão) passa a mudança vinda de `getUltimaMudancaEvento` [R], a mesma do "Mudou em" (14 dias).
- Banco: nada. Teste: caso novo em `texto-whatsapp.test.ts` [R].
- Cuidado: o texto não pode passar o limite do link `wa.me`; reaproveitar `umaLinha` e `juntar` [R].

**0.2 Tela de convite com o nome da turma (RF-60)**
- Problema no código: `/convite` (`src/app/(onboarding)/convite/page.tsx`) recebe o código do link ou do cookie e só preenche o campo; não mostra de qual turma é.
- Mudanças:
  1. Leitura nova `getTurmaPorCodigo(codigo)` [N, pequena] em `src/lib/convite.ts`, que devolve só `nome` e o nome de quem criou.
  2. Na página, com código vindo do link, mostrar "Você foi convidado para a turma **X**" acima do botão "Entrar na turma" [R].
- Trade-off: ler o nome pelo código permite adivinhar turmas. Mitigação: só fazer a leitura quando o código vem do link ou do cookie de convite (não do campo digitado) e contar a leitura em `tentativas_convite` [R], com o mesmo limite de `entrarPorConvite`.
- Email de convite: o assunto `Convite: entre na turma X no Formandos` (`emailConviteTurma`) [R] fica. Cair no spam é questão de domínio e assinatura do remetente (SPF, DKIM), que só se resolve com a publicação. Registrar na ADR.

**0.3 "Valor por pessoa" diz se é total ou por mês (RF-61)**
- Onde: `enquete-card.tsx` e `editor-opcoes.tsx` [R].
- Caminho mais barato: mudar só o rótulo para "Valor total por pessoa" e a dica do campo para "o valor que cada um paga no total; se for parcelado, explique no texto da opção". Sem banco.
- Caminho completo (avaliar na ADR): coluna `opcoes.parcelas smallint` para mostrar "R$ 2.400 por pessoa (12 × R$ 200)". Só vale se a turma usar.

**0.4 Frase "ninguém muda o seu voto" (RF-62)**
- Onde: `AVISO_VISIBILIDADE_VOTO` em `src/lib/empresa.ts` [R], que já aparece em `/votacoes` e na tela de votar.
- Mudança: acrescentar "Ninguém da comissão muda o seu voto. Mudanças em decisões ficam no histórico da turma." Conferir antes no código que nenhuma ação altera voto de outra pessoa (só `salvarVotos` da própria pessoa e a saída da turma).

**0.5 Link público trocado (RF-63)**
- Onde: `src/app/(publico)/evento/[token]/not-found.tsx` [R].
- Mudança sem banco: o texto de "não encontrado" passa a dizer "Este link não existe, foi trocado ou foi desligado pela comissão. Peça o link novo a quem mandou."
- Mudança com banco (só se a frase genérica não bastar): `turmas.token_anterior` para dizer "este link foi trocado" com certeza. Não recomendado: guardar o código antigo mantém um identificador a mais.

**0.6 Email próprio para o encarregado (RF-70) — descartado pelo grupo em 16/11/2026 (ADR-0017, decisão 4)**
- Onde: `DPO.email` em `src/lib/empresa.ts` [R]. Aparece em `/privacidade`, `/termos` e "Minha conta".
- Mudança: só o valor, depois de o grupo criar o endereço (do domínio do projeto, quando houver, ou um email do projeto que não seja pessoal). Decisão do grupo, não de código.

### Nível 1 — o gargalo

**1.1 Email de votação nova aberta (RF-55)**
- Problema: não há evento "pergunta aberta". As perguntas existem no catálogo desde a criação; a regra (prazo) é salva em `salvarRegraEnquete` [R]. O catálogo padrão tem 23 perguntas: avisar cada uma lotaria a caixa e o teto diário.
- Recomendação: email **disparado pela comissão**, como o "Mandar para o grupo". Um botão "Avisar a turma por email" ao lado do "Mandar para o grupo" da pergunta, habilitado quando a pergunta tem prazo e ainda não foi avisada.
- Mudanças:
  1. Modelo novo `emailVotacaoAberta({ pergunta, prazo, url })` [N] em `src/lib/email.ts`, no padrão dos outros ("Votação aberta: X, fecha em dd/mm").
  2. Action `avisarVotacao(enqueteId)` [N] em `src/actions/catalogos.ts`: confere a regra, usa `destinatariosDaTurma` e `enviarParaTurma` [R] (preferência e teto), marca em `lembretes_enviados` com tipo novo `abertura` [R] para não repetir, e registra `votacao.avisada` na auditoria [R].
  3. Banco: ampliar o `check` de `lembretes_enviados.tipo` com `abertura` (`alter table ... drop constraint ... add constraint`, como já foi feito para `exclusao` e `presenca`).
- Alternativa avaliada: disparar sozinho quando o prazo é salvo pela primeira vez. Mais simples para a comissão, mas manda email quando a comissão só está montando o catálogo. Escolher na ADR.
- Teste: `email.test.ts` [R] e um passo novo no grupo `admin` de `fluxos.mjs`.

**1.2 Campo "Entrada / portão" no "Mudou" (RF-57)**
- Problema no código: `mudancasEvento` (`src/lib/lembretes-regras.ts:68`) compara só `inicio`, `local` e `endereco` (`EstadoEvento`). As observações do local (`turmas.observacoes_local`) ficam fora.
- Recomendação: campo próprio, e não comparar as observações inteiras (texto livre, qualquer vírgula viraria "mudou").
- Banco [N]: `alter table turmas add column if not exists entrada varchar(120);`
- Mudanças:
  1. `EstadoEvento` e `mudancasEvento` [R] ganham `entrada`, com rótulo "entrada".
  2. `salvarEvento` (`src/actions/evento.ts:77`) [R] lê e salva o campo; a auditoria `evento.alterado` já guarda as mudanças calculadas [R].
  3. O campo aparece no card do evento, na página pública (ao lado de "Onde") e na lista da portaria [R].
  4. O EM-14 (`emailEventoMudou`) e o "Mudou em" já mostram qualquer item de `mudancasEvento` [R]; o 0.1 leva o mesmo item ao texto do grupo.
- Teste: casos novos em `evento.test.ts` e no teste de `mudancasEvento` [R].

**1.3 Registro da turma para todos (RF-58)**
- Problema no código: `/admin/turma/registro` usa `exigirAdmin` [R]. O conteúdo de `getRegistroTurma` (`src/lib/registro.ts`) já é sem dado pessoal, por desenho.
- Mudanças:
  1. Rota nova `/registro` [N] na área do membro (`src/app/(app)/registro/page.tsx`), com `exigirMembro` [R], que reaproveita `getRegistroTurma` e o mesmo layout de impressão. Melhor: extrair o corpo da página da comissão para um componente `RegistroTurma` [N] e usar nas duas rotas.
  2. Link "Baixar o registro da turma" na faixa de turma arquivada do `AppShell` [R] e no EM-18 (`emailExclusaoTurma`) [R].
- Decisão para a ADR: liberar sempre ou só com a turma arquivada. Recomendação: sempre, porque o conteúdo é o mesmo que a turma já vê em partes.
- Banco: nada.

**1.4 Faixa e email de encerramento do site (RF-59)**
- Promessa atual: Termos, seção "Se o Formandos for encerrado" (ADR-0009, item 6). A ADR deixou "uma variável de ambiente e um script" para quando for preciso.
- Mudanças:
  1. Variável `ENCERRAMENTO_EM=AAAA-MM-DD` [N]. Com ela, o `AppShell` [R] e a vitrine mostram a faixa "O Formandos será encerrado em dd/mm. Baixe seus dados em Minha conta e peça o registro à comissão.", e `criarTurma` [R] recusa turma nova.
  2. Script `scripts/encerramento.mjs` [N] que manda o aviso a todos os usuários com email confirmado, em lotes que respeitam o teto diário, marcando quem já recebeu (tabela pequena ou tipo novo em `lembretes_enviados`).
- Banco: só se a marcação de envio precisar de tabela.
- Teste: um passo de E2E com a variável ligada (faixa aparece, criar turma é recusado).

### Nível 2 — dinheiro e família

**2.1 Saída do caixa (RF-64)**
- Problema: `pagamentos` é sempre de uma pessoa (`usuario_id`); `getCaixa` (`src/lib/pagamentos.ts:262`) soma só entradas. Pagamento a fornecedor não tem lugar.
- Banco [N]:
  ```sql
  create table if not exists saidas (
    id            uuid primary key default gen_random_uuid(),
    turma_id      uuid not null references turmas(id) on delete cascade,
    fornecedor_id uuid references fornecedores(id) on delete set null,
    descricao     varchar(200) not null,
    valor         numeric(10,2) not null check (valor > 0),
    data          date not null,
    lancado_por   uuid references usuarios(id) on delete set null,
    created_at    timestamptz not null default now()
  );
  ```
- Mudanças: actions `lancarSaida`, `editarSaida`, `excluirSaida` [N] em `src/actions/tesouraria.ts`, com auditoria `saida.*` visível à turma (é dinheiro da turma, não de pessoa); `getCaixa` [R] devolve também `saidas` e `saldo`; o card do caixa e o Registro da turma [R] mostram "arrecadado, gasto, saldo"; planilha nova `saidas` em `TIPOS_EXPORTACAO` [R].
- Decisão para a ADR: a turma vê cada saída (descrição e valor) ou só o total gasto. Recomendação: cada saída, sem dado de pessoa.

**2.2 Recibo do pagamento confirmado (RF-66)**
- Mudanças: página para imprimir `/minha-situacao/recibo/[pagamentoId]` [N], com `exigirMembro` e a conferência de que o lançamento é da própria pessoa (ou da tesouraria), reaproveitando o layout de impressão [R]. Conteúdo: turma, nome, valor, data, forma, quem confirmou, número do lançamento e "Registro do Formandos; não é nota fiscal".
- Banco: nada (o `id` do lançamento serve de número).
- Cuidado: deixar claro que é comprovante de registro, não de recebimento pelo site.

**2.3 Email de quem paga (RF-67)**
- Problema no código: a importação (`src/lib/importar-pagamentos.ts`) casa a linha pelo email do formando. Pagamento do pai com outro email vira linha com problema.
- Banco [N]:
  ```sql
  create table if not exists pagadores (
    turma_id   uuid not null references turmas(id) on delete cascade,
    usuario_id uuid not null references usuarios(id) on delete cascade,
    email      varchar(255) not null,
    primary key (turma_id, email)
  );
  ```
- Mudanças: o formando cadastra até 2 emails de quem paga em "Minha situação" [R]; a importação [R] procura primeiro em `membros` e depois em `pagadores`; a prévia mostra "pago por pai@... para Fulana".
- LGPD: é dado de terceiro. A Política [R] precisa citar, e o dado some quando o formando sai (cascade) ou exclui a conta.

**2.4 Link só de leitura da Minha situação (RF-68)**
- Banco [N]: `alter table membros add column if not exists token_situacao varchar(32) unique;`
- Mudanças: em "Minha situação" [R], "Gerar link para quem paga", "Trocar" e "Desligar", como na página pública do evento [R]; página nova `/situacao/[token]` [N], sem login, `noindex`, mostrando só o plano, o pago, o que falta e o que vence, sem botão de "Já paguei".
- Por que não deixar a família entrar na turma: ela viraria participante com voto (achado do tema 10).
- Teste: código inexistente devolve 404; desligar invalida.

**2.5 Acessibilidade do local (RF-69)**
- Banco [N]: `alter table turmas add column if not exists acessibilidade jsonb;` com chaves fixas `rampa`, `estacionamento_perto`, `banheiro_adaptado` (sim, não ou não informado) e uma observação curta.
- Mudanças: campos no formulário do evento (`evento-admin.tsx`) [R]; ícones e texto no card e na página pública [R]; passa no `leitor.mjs` [R] (texto, não só ícone).
- Não entra no "Mudou" no primeiro corte.

**2.6 Link de documento em decisão e fornecedor (RF-65)**
- Banco [N]: `alter table fornecedores add column if not exists link_documento varchar(500);` e `alter table decisoes add column if not exists link_documento varchar(500);`
- Mudanças: campo no fixar decisão e no formulário de fornecedor [R]; validação com `ehLinkHttps` (`src/lib/evento.ts`) [R]; na decisão, visível à turma; no fornecedor, só à comissão, como o orçamento [R].
- Por que link e não anexo: sem armazenamento de arquivo, sem custo, sem novo dado pessoal guardado no site.

### Nível 3 — decisões antes de qualquer código

Estes itens dependem de decisão do grupo (ERS, DEC-01 a DEC-05). Para cada um, o que a decisão destrava:

| Decisão | Se "sim", o primeiro requisito seria | Peso no código |
|---|---|---|
| DEC-01 Turma de escola é público | papel "responsável" ligado a um formando, um voto por família, página "Para a escola" | grande (muda papéis, voto e Termos; volta a ADR-0011) |
| DEC-02 Permissões por área na comissão | lista de permissões por admin (tarefas, presença, avisos, votações) | médio (`exigirAdmin` vira `exigirPermissao`) |
| DEC-03 Subgrupos na turma | `subgrupos` com membros e evento próprios, votações comuns ou por subgrupo | grande |
| DEC-04 Memória entre turmas | exportar e importar catálogo, fornecedores e tarefas sem valores e sem pessoas | médio |
| DEC-05 Notificação no celular | web push com permissão do navegador | grande (service worker, chaves, consentimento) |

### Ordem sugerida para as ADRs

1. **ADR-0017**: itens 0.1, 0.4 e 0.5 juntos (texto, sem banco). O 0.6 foi descartado.
2. **ADR-0018**: 1.1, email de votação aberta (o gargalo).
3. **ADR-0019**: 1.2 e 0.1 (entrada no "Mudou"; o 0.1 já pronto entra aqui).
4. **ADR-0020**: 0.2 e 1.3 (convite com nome e registro para todos).
5. **ADR-0021**: 1.4 (encerramento).
6. Nível 2 depois de validar com 2 tesoureiras reais (seção 6, item 4), na ordem 2.1, 2.2, 2.6, 2.3, 2.4, 2.5.

Antes de qualquer item do nível 2, rodar o teste com uma turma real (seção 6, item 1): ele pode mudar a ordem.
