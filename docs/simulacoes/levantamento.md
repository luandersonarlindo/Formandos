# Levantamento consolidado das 10 simulações de usuários [especulação]

2026-11-08 · base: `docs/simulacoes/2026-11-07` a `2026-11-08-7` · 100 personas sintéticas no total · todas as simulações geradas por LLM (`sonnet` nas personas)

**Para que serve este documento:** juntar o que se repete nas 10 simulações e ordenar as mudanças antes da análise de estrutura, arquitetura e system design. Nada aqui foi validado com pessoas reais. As 10 simulações deram REPROVADO, e um achado repetido por várias simulações é um sinal mais forte, mas continua sendo especulação.

## 1. As 10 simulações em uma tabela

| # | Pasta | Foco | Personas | Média Fase 3 | Média final | Resultado | Bloqueio principal |
|---|---|---|---|---|---|---|---|
| 1 | `2026-11-07` | turma inteira | 16 | 2,6 | 2,3 | REPROVADO | não avisa; não mostra quanto devo |
| 2 | `2026-11-07-2` | aviso + "Minha situação" hipotéticos | 16 | 3,3 | 3,1 | REPROVADO | sem dono do site; Pix registrado à mão |
| 3 | `2026-11-07-3` | só a comissão | 12 | 2,1 | 1,3 | REPROVADO | não importa a lista; não avisa |
| 4 | `2026-11-08` | primeiro acesso | 8 | 4,75 | 6,1 | REPROVADO | sem aviso não há retorno; confirmação por email |
| 5 | `2026-11-08-2` | outros tipos de turma | 8 | 2,4 | 1,6 | REPROVADO | não avisa; menor de idade e família |
| 6 | `2026-11-08-3` | votações e decisões | 8 | 3,4 | 4,6 | REPROVADO | comissão fixa sem regra; opção sem preço |
| 7 | `2026-11-08-4` | dinheiro | 8 | 2,5 | 2,9 | REPROVADO | não registra pagamento nem caixa |
| 8 | `2026-11-08-5` | semana da festa | 8 | 3,25 | 3,1 | REPROVADO | mudança de última hora não chega |
| 9 | `2026-11-08-6` | depois da festa e confiança | 8 | 3,5 | 3,1 | REPROVADO | não exporta; sem plano de fim |
| 10 | `2026-11-08-7` | pacote de 5 melhorias hipotéticas | 8 | **4,75** | **5,5** | REPROVADO | email não é lido; registro duplo; sem exportar |

**Leitura geral:** o app real fica entre 2 e 3,5 de média. As duas simulações com melhorias hipotéticas (2 e 10) foram as que mais subiram, e a 10 teve a melhor nota de todas, com a comissão terminando em 5 e 7. A simulação 4 (primeiro acesso) também foi bem, porque o fluxo de entrada pelo Google já funciona.

## 2. Achados que se repetem

Contagem por simulação: em quantas das 10 o achado apareceu como atrito citado por várias personas.

| # | Achado | Simulações | Quantas | Peso |
|---|---|---|---|---|
| A | **O site não avisa ninguém** (aviso, votação, decisão, mudança no evento) | 1, 2, 3, 4, 5, 6, 7, 8, 10 (+9 de leve) | **10** | bloqueio em todas |
| B | **Sem dono, suporte nem plano para quando os 4 se formarem** ("projeto acadêmico") | 1, 2, 3, 7, 8, 9, 10 | **7** | decisivo na 2 e na 9 |
| C | **Sem exportar** (turma, votos, presença, parcelas) e **sem importar** (lista da turma, planilha) | 1, 2, 3, 7, 8, 9, 10 | **7** | bloqueio da comissão |
| D | **Sem histórico visível de alteração** (decisão, valor, horário do evento, remoção de membro) | 1, 2, 3, 6, 7, 8, 9 | **7** | confiança |
| E | **Dinheiro fora do app**: quanto devo, o que paguei, caixa da turma | 1, 2, 3, 5, 7, 10 | **6** | 2ª maior dor do formando |
| F | **Família, convidados, professor e fornecedor sem acesso** (precisam de conta) | 2, 4, 6, 7, 8, 10 | **6** | falha final na semana da festa |
| G | **Primeiro acesso**: email e senha, confirmação, código digitado à parte | 1, 3, 4, 6, 8 | **5** | resolvido pelo link com código + Google (validado na 10) |
| H | **A comissão vê quem votou em quê** (pedidos opostos sobre o voto) | 1, 5, 6, 9 | **4** | decisão de produto |
| I | **Acessibilidade não testada** (leitor de tela, cor, Libras, baixa visão) | 1, 2, 4, 8 | **4** | verificar |
| J | **Opção de votação sem preço** (valor por pessoa) | 5, 6, 7, 10 | **4** | validado na 10 |
| K | **Sem regra para fixar decisão** (prazo, quórum, empate) | 3, 6, 10 | **3** | maior ganho na 10 |
| L | **Todos os admins podem tudo** (faltam tesoureiro, observador) | 1, 3, 7 | **3** | |
| M | **Sair ou ser removido apaga o voto** e muda o resultado | 6, 9 | **2** | prova perdida |
| N | **Presença**: acompanhante sem nome, sem prazo, sem lista para a portaria | 3, 8 | **2** | |
| O | **Menores de idade** (ABC, ensino médio) sem regra nem papel de responsável | 5 | **1** | decisão de escopo |

**O que agradou sempre que apareceu:** os modelos de catálogo por tipo de turma (5), o card do evento com "Como chegar" (8), o painel de presença para fechar número (7, 8), a entrada pelo Google (4, 10), a exclusão de conta com email de confirmação e a Política aberta (9), e o fato de ser site e não app de loja (várias).

## 3. O que a simulação 10 mostrou sobre as correções

A simulação 10 testou juntas as 5 correções mais repetidas, descritas como se já existissem.

| Correção testada | Responde a | Efeito na simulação 10 |
|---|---|---|
| Regra para fixar decisão | K, D (em parte) | **o maior ganho**: quórum atingido, céticos e professor aceitaram a decisão |
| Link de convite com código + Google | G | **funcionou**: nenhuma reclamação de entrada |
| "Minha situação" | E (em parte) | **funcionou para quem paga**; não cobre parcela dupla nem pagamento de terceiro |
| Valor por pessoa | J | **funcionou**: decidiu a votação |
| Aviso por email + "Copiar para o WhatsApp" | A | **email não funcionou** (quase ninguém leu); o texto pronto para o WhatsApp foi o que circulou |

O que ficou de fora do pacote e segurou o REPROVADO: A (canal), C (exportar e importar), B (plano de fim) e F (acesso sem conta).

## 4. Ordem sugerida para a análise de arquitetura

Organizado por efeito esperado e por tamanho. O detalhamento técnico de cada item (arquivo, rota, tabela, tela e o que reaproveitar) está na **Parte 2**, seções 7 a 13.

### Nível 0 — Sem funcionalidade nova (texto e configuração)

| # | Mudança | Achado | Observação |
|---|---|---|---|
| 0.1 | Confirmar com a Unifacol se o email institucional pode ser o do encarregado de dados, ou trocar | B | risco real hoje (`src/lib/empresa.ts`); apontado na 9 |
| 0.2 | Uma frase curta e visível: quem mantém, que é grátis, que não é oficial da Unifacol, como sair | B | repete 1, 2, 3, 9 |
| 0.3 | Dizer claramente, na tela de voto, quem vê o quê (a comissão vê o voto; a turma vê o total) | H | já existe o aviso; deixar mais explícito |

### Nível 1 — O pacote validado na simulação 10

| # | Mudança | Achado | Tamanho estimado |
|---|---|---|---|
| 1.1 | **Link de convite com código embutido** (`/convite?codigo=...`) + Google em destaque | G | pequeno (`botao-convite.tsx`, `/convite`) |
| 1.2 | **Regra para fixar decisão**: prazo, quórum, "votaram X de Y", justificativa obrigatória fora da regra, histórico de fixar/reabrir visível | K, D | médio (votações, decisões, auditoria) |
| 1.3 | **Valor por pessoa** (e link opcional) em cada opção | J | pequeno a médio (catálogo, opções) |
| 1.4 | **"Copiar para o WhatsApp"** em aviso, votação, decisão e mudança no evento | A | pequeno (texto pronto, sem integração) |
| 1.5 | **"Minha situação"**: parcelas, vencimentos, "Já paguei + print", "última atualização por" | E | grande (modelo de parcelas, papel de tesouraria, anexos) |
| 1.6 | Email **só para o essencial** (prazo, decisão, mudança no evento), com assunto claro | A | médio (já há envio de email transacional) |

### Nível 2 — O próximo gargalo (o que segurou a simulação 10)

| # | Mudança | Achado | Observação |
|---|---|---|---|
| 2.1 | **Exportar** a turma (PDF legível e CSV: decisões, votos, presença, fornecedores, parcelas) e **importar** a lista da turma | C | pedido da comissão em 7 simulações |
| 2.2 | **Página pública do evento** (só leitura, sem login), com "atualizado em" e "mudou: de 20h para 19h" | F, A, D | é o link que o formando repassa à família e ao fornecedor |
| 2.3 | **Plano de fim**: prazo de exclusão escolhido ao arquivar, aviso por email antes, aviso prévio escrito se o site for desligado | B | resolve "e se sair do ar" e a retenção sem prazo |
| 2.4 | **Congelar o resultado** ao fixar a decisão (quem sai vira "ex-membro" anônimo nesse resultado) | M | prova não some |
| 2.5 | **Histórico visível** das ações importantes (valor de fornecedor, evento, decisão, remoção) | D | a tabela `auditoria` já existe; falta registrar decisões e valores e mostrar à turma |

### Nível 3 — Depois, ou decisão de produto

| # | Mudança ou decisão | Achado |
|---|---|---|
| 3.1 | Canal no WhatsApp de verdade (avaliar custo e regras da API oficial) | A |
| 3.2 | Papéis na comissão (tesouraria, observador só leitura, passar a tesouraria) | L |
| 3.3 | Presença: nome e tipo (adulto/criança) do acompanhante, prazo com trava, lista nominal para a portaria | N |
| 3.4 | Importar e exportar a planilha da tesouraria; pagamento parcial e de terceiro | E |
| 3.5 | Teste real com TalkBack / VoiceOver nas telas de voto, presença e card do evento | I |
| 3.6 | **Decidir** se o app atende turmas com menores de idade (se sim: responsável, voto por família, termo) | O |
| 3.7 | **Decidir** a regra do voto: secreto por pergunta, aberto, ou como hoje | H |
| 3.8 | **Manter fora agora**: processar pagamento (Pix, boleto), QR code e check-in na portaria, guardar fotos e contratos | — |

## 5. Limites deste levantamento

- **Tudo é LLM.** As personas e a síntese foram geradas por modelo. A concordância com o MiroFish também não valida nada, porque os dois são LLM.
- **A régua é dura.** Todas as condições de parada foram fixadas antes das entrevistas, e algumas misturam "rejeita o site" com "continua usando o WhatsApp para avisar" (ver simulação 10).
- **Espectros puxados para o problema.** As simulações de foco (7, 8, 9) escolheram personas com dor naquele tema, e isso tende a puxar as notas para baixo.
- **Hipóteses sem defeito de uso.** As melhorias das simulações 2 e 10 foram descritas funcionando bem. As notas medem a ideia, não a implementação.
- **Mudança de método.** Nas simulações 9 e 10, as 3 fases foram feitas no mesmo subagente, em sequência.
- **A especificação está desatualizada.** As simulações 2 e 3 descreveram como inexistentes coisas que já existiam (Termos, Política, exportação de dados pessoais). Os briefings da 4 em diante foram conferidos no código.

## 6. O que validar com pessoas reais antes de codar

Um único ciclo curto na Unifacol cobre as dúvidas mais caras:

1. **Teste de canal (A):** numa turma real, mandar a mesma convocação por email e por texto colado no grupo e contar os votos de cada link.
2. **Protótipo do Nível 1:** testar com 5 formandos, 2 da comissão (de preferência a tesouraria), 1 professor e 1 pai ou mãe as tarefas de entrar pelo link, votar vendo o preço, ver "votaram X de Y", achar "quanto eu devo" e marcar "Já paguei".
3. **Conversa com a área de proteção de dados da Unifacol (B, 0.1):** email institucional, exigências para não se opor, prazo de retenção.
4. **Uma comissão já formada (C, 2.3):** como prestou contas, o que exportaria, que prazo de exclusão faria sentido.
5. **Semana da festa (F, 2.2):** numa turma real, publicar uma mudança de teste só no site e perguntar, 72 horas depois, quem viu.

**Próximo passo combinado:** cada mudança escolhida daqui passa pela análise de estrutura, arquitetura e system design (skills `engineering:architecture` e `engineering:system-design`) antes de ser implementada.

---

# Parte 2 — Plano técnico: onde cada mudança acontece

Escrito com o framework da skill `engineering:system-design` (requisitos, desenho, modelo de dados, escala, trade-offs) e conferido no código da branch `simulacoes-usuarios` (base `docker-local`). Objetivo: dizer **em que arquivo, rota, tabela e tela** cada item entra e **o que já existe e deve ser reaproveitado**, para não duplicar função. Ainda é proposta: cada item ganha um ADR (`engineering:architecture`) quando for escolhido.

## 7. Como o projeto está hoje (o que o plano assume)

| Camada | Onde | O que já faz |
|---|---|---|
| Rotas (App Router, Next.js 16) | `src/app/(publico)`, `(onboarding)`, `(app)`, `(admin)`, `(conta)`, `(master)` | páginas por papel; `/api/healthz` e `/api/auth/[...all]` (Better Auth) |
| Barreira rápida | `src/proxy.ts` | sem cookie de sessão, manda para `/entrar` (não preserva o endereço pedido) |
| Barreira real | `src/lib/dal.ts` | `exigirSessao`, `exigirMembro`, `exigirAdmin`, `exigirMembroEditavel`, `exigirAdminEditavel` (turma arquivada = só leitura) |
| Escrita | `src/actions/*.ts` (Server Actions) | validação com `zod`, `transacao()` de `src/lib/db.ts`, `revalidatePath` |
| Leitura | `src/lib/*.ts` | consultas SQL diretas (`pg`), sem ORM |
| Banco | `db/schema.sql` (idempotente: `create ... if not exists`, `alter ... add column if not exists`), aplicado por `db/migrate.mjs` (também no `prebuild`) | 19 tabelas, incluindo `auditoria` e `throttle` |
| Email | `src/lib/email.ts` (nodemailer/SMTP) | `enviarEmail`, `enviarEmailSilencioso`, `urlDoSite`, 8 modelos (verificação, boas-vindas, senha, entrou/saiu/removido da turma, conta excluída); sem `SMTP_HOST` só imprime no console; no Docker cai no Mailpit |
| Limite de abuso | `src/lib/throttle.ts` (`consumirLimite`) e `tentativas_convite` | já usado em avisos (10/hora) e convite |
| Trilha | `src/lib/auditoria.ts` (`registrarAuditoria`, vocabulário fechado `AcaoAuditoria`) | só 6 ações: papel, membro removido, conta excluída, turma arquivada/desarquivada/excluída |
| UI | `src/components/ui` (shadcn: card, badge, dialog, progress, collapsible, sheet, tooltip...) e `src/components/features` (ex.: `BotaoCopiar`, `BotaoConvite`, `FormDialog`, `PainelRecolhivel`, `EstadoVazio`, `ConfirmarExclusao`) | padrão visual em `docs/design-system/formandos/MASTER.md` |
| Infra | `compose.yaml` (Postgres 18, migrate, app `next dev`, Mailpit, tunnel) | sem deploy (decisão do grupo); sem agendador de tarefas |

**Requisitos não funcionais que valem para todos os itens:** turmas de 30 a 150 pessoas; poucas dezenas de turmas; celular simples e 3G (páginas leves, sem JS pesado); LGPD (dado mínimo, quem vê o quê, exclusão); manter a regra de `exigir*Editavel` (turma arquivada não muda); tudo em português na UI.

## 8. Mapa de reaproveitamento (não duplicar)

Antes de criar qualquer coisa nova, usar isto:

| Precisa de... | Já existe | Onde |
|---|---|---|
| Mandar email | `enviarEmail`, `enviarEmailSilencioso`, `urlDoSite`, layout dos modelos | `src/lib/email.ts` (criar só os **modelos** novos, no mesmo arquivo) |
| Botão de copiar texto | `BotaoCopiar` (aceita `montarTexto` no clique) | `src/components/features/botao-copiar.tsx` |
| Mensagem de convite | `BotaoConvite` | `src/components/features/botao-convite.tsx` |
| Limitar envio/abuso | `consumirLimite` | `src/lib/throttle.ts` |
| Histórico de quem fez o quê | `registrarAuditoria` + tabela `auditoria` | `src/lib/auditoria.ts` (ampliar o vocabulário, não criar outra tabela de histórico) |
| Quem votou / quem não votou | `getVotosEnquete` (`votantes`, `naoVotaram`) | `src/lib/admin.ts` |
| Total de membros e votantes | `getRelatorio` (`totalMembros`) | `src/lib/relatorio.ts` |
| Fixar e reabrir decisão (com trava) | `fixarDecisao`, `reabrirVotacao` (`pg_advisory_xact_lock`) | `src/actions/decisoes.ts` |
| Valor em reais | `formatarReal`, `lerValorOrcado` | `src/lib/orcamento.ts` |
| Dados do evento e programação | `getDadosEvento`, `getDetalhesEvento`, `listarProgramacao`, `linkComoChegar` | `src/lib/dashboard.ts`, `src/lib/evento.ts` |
| Salvar evento | `salvarEvento`, `adicionarItemProgramacao` | `src/actions/evento.ts` |
| Presença e filtros | `getResumoPresenca`, `listarPresencas` (`vou/talvez/nao/pendente`) | `src/lib/presenca.ts` |
| Membros da turma | `listarMembrosAdmin` | `src/lib/admin.ts` |
| Download de arquivo | padrão de rota GET com `Content-Disposition` | `src/app/(conta)/conta/exportar/route.ts` + `getMeusDados` em `src/lib/usuarios.ts` |
| Apagar rastro ao sair | `apagarDadosDoMembro`, `removerMembroDaTurma` | `src/lib/saida-turma.ts` |
| Arquivar / excluir turma | `arquivarTurma`, `excluirTurmaDoAdmin`, `getResumoExclusao` | `src/actions/gestao-turma.ts`, `src/lib/admin.ts` |
| Entrar por código | `entrarPorConvite` (com limite de tentativas), `normalizarCodigo` | `src/actions/turmas.ts`, `src/lib/convite.ts` |
| Responsável e encarregado | `EMPRESA`, `DPO` | `src/lib/empresa.ts` |
| Modelos de catálogo | catálogo padrão e modelos por tipo de turma | `src/lib/modelos.ts`, `docs/catalogos-modelo/` |
| Diálogos e formulários | `FormDialog`, `FormAcao`, `ConfirmarExclusao`, `PainelRecolhivel` | `src/components/features/` |

## 9. Item por item

Convenção: **[R]** = reaproveita o que existe; **[N]** = novo. "Banco" lista mudanças em `db/schema.sql`, sempre no estilo idempotente atual.

### Nível 0 — texto e configuração

**0.1 Email do encarregado de dados**
- Onde: `src/lib/empresa.ts` (`DPO.email`) [R]. Aparece em `/privacidade` e `/termos`.
- Mudança: só o valor da constante, depois de a Unifacol confirmar ou de trocar por um email do projeto.
- Banco/infra: nada.

**0.2 Frase "quem mantém, grátis, não é oficial da Unifacol, como sair"**
- Onde: página inicial pública `src/app/(publico)/page.tsx` (vitrine: `src/components/vitrine/secoes.tsx`), rodapé do `app-shell.tsx` e topo de `/convite` (`src/app/(onboarding)/convite/page.tsx`) [R].
- Conteúdo vem de `EMPRESA` (`src/lib/empresa.ts`) [R]; não criar outra constante.
- Design: uma linha em `text-muted-foreground`, link para `/termos` e `/privacidade`. Revisar o texto com `design:ux-copy`.

**0.3 Quem vê o voto**
- Onde: o aviso já existe em `src/app/(app)/votacoes/page.tsx` ("O administrador vê quem votou em cada opção") [R]. Repetir na tela de votar (`src/app/(app)/votacoes/[catalogoId]/page.tsx` / `form-votacao-catalogo.tsx`), perto do botão de salvar.
- Banco: nada. A decisão sobre voto secreto (3.7) é outra coisa.

### Nível 1 — pacote validado na simulação 10

**1.1 Link de convite com código embutido**
- Problema real no código: `BotaoConvite` gera `.../convite` + "use o código X" no texto; `/convite` não lê o código do endereço; o `proxy.ts` manda quem não está logado para `/entrar` **sem guardar o destino**; `botao-google.tsx` e `form-email-senha.tsx` usam `callbackURL: "/dashboard"` fixo. Por isso a pessoa perde o código no caminho.
- Mudanças:
  1. `botao-convite.tsx` [R]: texto passa a ser `${origin}/convite?codigo=${codigo}`.
  2. `src/app/(onboarding)/convite/page.tsx` [R]: ler `searchParams.codigo` (Next 16: `searchParams` é Promise) e passar a `FormEntrarConvite` como valor inicial; com código válido, mostrar "Entrar na turma X" com um botão (não entrar sozinho, para evitar link malicioso de terceiros).
  3. `src/proxy.ts` [R]: ao redirecionar, anexar `?voltar=<caminho+query>`; `src/app/(publico)/entrar/page.tsx`, `botao-google.tsx` e `form-email-senha.tsx` usam esse `voltar` como `callbackURL`, **aceitando só caminhos internos** (começam com `/`, sem `//`) para não virar redirecionamento aberto.
  4. A validação continua em `entrarPorConvite` (limite de tentativas) [R]. Não criar outra rota de entrada.
- Banco: nada. Teste: `src/lib/convite.test.ts` [R] + caso novo para o `voltar`.

**1.2 Regra para fixar decisão**
- Requisitos: prazo de encerramento e quórum definidos antes; turma vê "votaram X de Y" e se a opção fixada foi a mais votada; justificativa obrigatória quando fugir da regra; histórico de fixar/reabrir visível.
- Banco [N]:
  ```sql
  alter table enquetes add column if not exists prazo timestamptz;          -- só para perguntas da turma
  create table if not exists regras_enquete (                               -- vale também para perguntas do catálogo padrão (que é global)
    turma_id   uuid not null references turmas(id) on delete cascade,
    enquete_id uuid not null references enquetes(id) on delete cascade,
    prazo      timestamptz,
    quorum_pct smallint check (quorum_pct between 1 and 100),
    primary key (turma_id, enquete_id)
  );
  alter table decisoes add column if not exists justificativa text;
  alter table decisoes add column if not exists votantes smallint;          -- "fotografia" do dia (ver 2.4)
  alter table decisoes add column if not exists membros  smallint;
  ```
  Trade-off: o catálogo padrão é global (`catalogos.turma_id is null`), por isso a regra fica numa tabela por turma (`regras_enquete`) e não em `enquetes`. Assim um único lugar serve aos dois tipos de pergunta, e a coluna `enquetes.prazo` nem é necessária (recomendado: só `regras_enquete`).
- Ações:
  - `src/actions/decisoes.ts` [R]: `fixarDecisao` passa a calcular votantes e membros (reaproveitar as consultas de `getRelatorio`/`getVotosEnquete`), exigir `justificativa` quando a opção não é a mais votada ou o quórum não foi atingido, gravar `votantes`/`membros` e chamar `registrarAuditoria` com novas ações `decisao.fixada` e `decisao.reaberta` (ampliar `AcaoAuditoria`) [R].
  - `src/actions/votos.ts` [R]: `salvarVotos` recusa voto com prazo vencido (regra pura em `src/lib/votos-regras.ts` [R], com teste).
  - Nova action pequena `salvarRegraEnquete` em `src/actions/catalogos.ts` [R] (é onde a comissão já edita perguntas).
- Telas:
  - Comissão: `src/app/(admin)/admin/votacoes/[catalogoId]/page.tsx` e `form-enquete.tsx`/`dialogo-nova-pergunta.tsx` [R] ganham campos prazo e quórum; `src/app/(admin)/admin/votacoes/votos/[enqueteId]/page.tsx` [R] já mostra "X de Y membros votaram" e "Ainda não votaram": acrescentar o diálogo de fixar com justificativa (`FormDialog` [R]).
  - Turma: `enquete-card.tsx` [R] mostra a regra ("fecha em 12/12, precisa de metade da turma"); "Decisões da turma" no `dashboard/page.tsx` [R] mostra "votaram 22 de 38", selo "mais votada" ou a justificativa, e link "ver histórico".
  - Histórico: leitura nova `listarHistoricoDecisao(turmaId, enqueteId)` em `src/lib/auditoria.ts` [N, pequena], filtrando `acao like 'decisao.%'`.
- Infra: o fechamento automático no prazo não precisa de agendador: a regra é "não aceita voto depois do prazo" e a tela calcula "encerrada" na leitura.

**1.3 Valor por pessoa em cada opção**
- Banco [N]: `alter table opcoes add column if not exists valor_pessoa numeric(10,2); alter table opcoes add column if not exists link varchar(500);`. Para opções do catálogo padrão (global), valor por turma exige tabela `opcoes_turma(turma_id, opcao_id, valor_pessoa, link)`; recomendação: só permitir valor em **perguntas da própria turma** no primeiro corte (é onde ficam "Buffet A ou B").
- Reaproveitar: `formatarReal` e `lerValorOrcado` (`src/lib/orcamento.ts`) [R]; `ehLinkHttps` (`src/lib/evento.ts`) [R] para o link.
- Telas: `editor-opcoes.tsx` [R] (campo valor e link); `enquete-card.tsx` e `grafico-enquete.tsx` [R] (mostrar "R$ 95 por pessoa").
- Não ligar ainda ao `fornecedores.valor_orcado`: são números diferentes (orçado total × por pessoa). Registrar no ADR como evolução possível.

**1.4 "Copiar para o WhatsApp"**
- Reaproveitar `BotaoCopiar` [R] com uma função pura nova `textoWhatsApp({tipo, titulo, resumo, link})` em `src/lib/` [N, pequena, com teste]: texto simples, sem imagem, com link direto (bom para leitor de tela; simulações 1 e 8).
- Onde aparece: cada aviso em `src/app/(app)/avisos/page.tsx`; cada pergunta em `src/app/(admin)/admin/votacoes/[catalogoId]/page.tsx`; cada decisão no dashboard; card do evento (`evento-admin.tsx`) quando a data/hora/local mudar.
- Banco/infra: nada. É o item de melhor custo-benefício do pacote.

**1.5 "Minha situação" (parcelas)**
- Requisitos: valor e vencimento das parcelas; registro de pagamento pela tesouraria; "Já paguei + print"; "última atualização por"; só a pessoa e a tesouraria veem; aceitar pagamento parcial e de terceiro (achado da simulação 10).
- Banco [N]:
  ```sql
  create table if not exists parcelas (            -- plano da turma
    id uuid primary key default gen_random_uuid(),
    turma_id uuid not null references turmas(id) on delete cascade,
    numero smallint not null, valor numeric(10,2) not null, vencimento date not null,
    unique (turma_id, numero)
  );
  create table if not exists pagamentos (           -- lançamentos por pessoa
    id uuid primary key default gen_random_uuid(),
    turma_id uuid not null references turmas(id) on delete cascade,
    usuario_id uuid not null references usuarios(id) on delete cascade,
    parcela_id uuid references parcelas(id) on delete set null,
    valor numeric(10,2) not null,
    status varchar(12) not null default 'confirmado' check (status in ('informado','confirmado','recusado')),
    pago_por varchar(120),                           -- "pai", "mãe" (pagamento de terceiro)
    comprovante_url text,                            -- ver infra
    lancado_por uuid references usuarios(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  ```
  `pagamentos` com `valor` próprio cobre parcial e parcela dupla (dois lançamentos ou um valor maior), que foi o que a tesoureira não conseguiu registrar na simulação 10.
- Papel: `membros.papel` hoje só aceita `admin`/`participante`. Recomendação: **não** mexer no `check` agora; adicionar `alter table membros add column if not exists tesouraria boolean not null default false` e um `exigirTesouraria()` em `src/lib/dal.ts` [R]. Papéis completos ficam para 3.2.
- Código: `src/lib/pagamentos.ts` [N] (situação calculada: pago, falta, próximo vencimento), `src/actions/pagamentos.ts` [N] (lançar, confirmar, informar "Já paguei"), regras puras com teste (padrão `*-regras.ts`).
- Telas: `/minha-situacao` em `src/app/(app)/` [N] para a pessoa; `/admin/tesouraria` em `src/app/(admin)/admin/` [N] para lançar (lista no estilo de `admin/presenca` [R], com filtros e `Paginacao` [R]); item no menu (`app-shell.tsx` [R]).
- Infra (comprovante): o projeto não guarda arquivo hoje. Opções: (a) só registrar "informado" sem anexo (mais simples, sem LGPD de imagem); (b) armazenamento de objetos (S3/R2) — custo e política de retenção. Recomendação: começar por (a) e pedir ao formando o "id da transação Pix" em texto.
- LGPD: incluir `pagamentos` em `getMeusDados` (`src/lib/usuarios.ts`) [R] e na exclusão (cascata já resolve por `usuario_id`).

**1.6 Email só para o essencial**
- Reaproveitar `enviarEmailSilencioso` e o layout de `src/lib/email.ts` [R]; criar 3 modelos novos no mesmo arquivo [N]: "Votação fecha em 2 dias", "Decisão da turma: ...", "Mudou: entrada às 19h (antes 20h)". Assunto com a palavra-chave (simulação 10: só o email com "prazo" foi lido).
- Envio em massa: função `enviarParaTurma(turmaId, email)` [N] em `src/lib/email.ts`, com `consumirLimite` [R] por turma e envio em lotes pequenos. Atenção: SMTP do Gmail tem limite diário (~500); para turmas grandes, avaliar provedor transacional (ex.: Resend, SES) — decisão de infraestrutura para o ADR.
- Disparo: "decisão fixada" e "evento mudou" saem na própria action (`fixarDecisao`, `salvarEvento` [R]) depois da transação. "Fecha em 2 dias" precisa de agendador [N]: rota `src/app/api/cron/lembretes/route.ts` protegida por segredo (`CRON_SECRET`), chamada uma vez por dia por um agendador externo (cron do servidor, GitHub Actions ou Vercel Cron, se um dia houver deploy). Marcar envios numa tabela `lembretes_enviados(turma_id, enquete_id, tipo)` para não repetir.
- Preferência: coluna `usuarios.receber_emails boolean default true` e opção em `/conta` [R].

### Nível 2 — próximo gargalo

**2.1 Exportar e importar**
- Exportar [N]: rota `src/app/(admin)/admin/turma/exportar/route.ts` (GET, CSV; padrão de `conta/exportar/route.ts` [R]) com `?tipo=membros|votos|decisoes|presenca|fornecedores|pagamentos`, reaproveitando `listarMembrosAdmin`, `getVotosEnquete`, `listarPresencas`, `listarFornecedoresAdmin`, `getRelatorio` [R]. Botões em `admin/turma/page.tsx` [R] (card "Exportar registro da turma"). PDF legível: página de impressão `admin/turma/relatorio` com CSS `@media print` (sem biblioteca nova) [N].
- Importar lista [N]: colar "nome;email" em `admin/membros` [R]; para cada email, enviar convite com o link da 1.1 (modelo novo em `email.ts`). Não criar conta pela pessoa (LGPD/consentimento): só convidar.
- Exportação pessoal legível: acrescentar `?formato=csv` em `conta/exportar/route.ts` [R].

**2.2 Página pública do evento (sem login)**
- Rota [N]: `src/app/(publico)/evento/[token]/page.tsx`, só leitura, com dados de `getDadosEvento` + `listarProgramacao` + `linkComoChegar` [R] e a última decisão fixada (opcional).
- Banco [N]: `alter table turmas add column if not exists token_publico varchar(32) unique; alter table turmas add column if not exists evento_atualizado_em timestamptz;`. Token aleatório (não o código de convite, que dá entrada na turma). A comissão liga/desliga e gera outro token em `admin/turma` [R] (mesmo padrão de `regenerarConvite` em `src/actions/admin.ts` [R]).
- "Mudou: de 20h para 19h": `salvarEvento` [R] compara o antes e o depois e registra `evento.alterado` na `auditoria` com `detalhe: {campo, antes, depois}` [R]; o card do evento e a página pública mostram a última mudança.
- `proxy.ts`: a rota fica fora do `matcher` [R], então já é pública. Sem dado pessoal na página (só evento). `robots: noindex`.

**2.3 Plano de fim**
- Banco [N]: `alter table turmas add column if not exists excluir_em date;`.
- `arquivarTurma` (`src/actions/gestao-turma.ts`) [R] ganha o campo "excluir em 30/60/90/180 dias" no diálogo de `admin/turma` [R]; email aos membros com o prazo (modelo novo).
- Execução: a mesma rota de agendador da 1.6 (`/api/cron/...`) exclui turmas com `excluir_em < hoje`, reaproveitando a lógica de `excluirTurmaDoAdmin` [R] (extrair para `src/lib/` a parte que apaga e audita, para as duas chamadas usarem a mesma função).
- Termos e Política (`/termos`, `/privacidade`) [R]: escrever aviso prévio de desligamento e o prazo do backup do provedor.

**2.4 Congelar o resultado ao fixar**
- Com as colunas `decisoes.votantes/membros` da 1.2, a contagem do dia fica gravada. A turma passa a ver "fixado com 22 de 38" mesmo que alguém saia.
- `apagarDadosDoMembro` (`src/lib/saida-turma.ts`) [R] continua apagando o voto (LGPD). O que fica é só o número agregado, sem identificar ninguém.

**2.5 Histórico visível**
- Ampliar `AcaoAuditoria` (`src/lib/auditoria.ts`) [R] com `decisao.fixada`, `decisao.reaberta`, `evento.alterado`, `fornecedor.valor_alterado`, `pagamento.lancado`, `pagamento.corrigido`, `regra.alterada`.
- Chamar `registrarAuditoria` nas actions existentes: `decisoes.ts`, `evento.ts`, `terceiros.ts` (`atualizarFornecedor`), `pagamentos.ts`.
- Leitura [N]: `listarHistoricoTurma(turmaId, filtro)` em `src/lib/auditoria.ts`; tela "Histórico" em `admin/turma` (comissão) e trechos públicos na turma (decisões e evento). Não mostrar `conta.excluida` nem dados pessoais para membros.

### Nível 3 — depois ou decisão de produto

| # | Onde entra | Observação técnica |
|---|---|---|
| 3.1 Canal WhatsApp real | `src/lib/email.ts` vira `src/lib/notificacoes.ts` com "canais" | API oficial do WhatsApp exige conta Business, modelos aprovados e custo por conversa; manter 1.4 até lá |
| 3.2 Papéis na comissão | `membros.papel` (`check`), `src/lib/dal.ts`, `admin/membros` | migração do `check` + `exigirPapel(...)`; substitui a coluna `tesouraria` da 1.5 |
| 3.3 Presença com nomes e prazo | nova tabela `acompanhantes(turma_id, usuario_id, nome, tipo)`; `turmas.presenca_ate`; `form-presenca.tsx`, `admin/presenca` | lista da portaria entra no export da 2.1 |
| 3.4 Planilha da tesouraria | importação CSV em `/admin/tesouraria` | depende da 1.5 |
| 3.5 Acessibilidade | `form-votacao-catalogo.tsx`, `form-presenca.tsx`, `botao-upvote.tsx`, `grafico-enquete.tsx` | teste com TalkBack/VoiceOver; `scripts/teste/auditoria.mjs` já mede largura e toque |
| 3.6 Menores de idade | Termos, `modelos.ts` (modelos `educacao-infantil`, `ensino-medio`) | decidir antes de qualquer código |
| 3.7 Voto secreto | `enquetes`/`regras_enquete` (`secreto boolean`), `getVotosEnquete` | decisão de produto |

## 10. Desenho geral depois dos Níveis 1 e 2

```
             formando / família / fornecedor
                 │                 │
       (link com código)     (link público do evento)
                 ▼                 ▼
 proxy.ts ──► /entrar?voltar ──► /convite?codigo     /evento/[token]  (sem login)
                 │                                    ▲
                 ▼                                    │ getDadosEvento, listarProgramacao
 (app) dashboard ─ votacoes ─ minha-situacao ─ avisos │
                 │      │           │                 │
 Server Actions: votos  decisoes  pagamentos  evento  catalogos(regra)
                 │      │           │          │
                 └──────┴─── transacao() ──────┴──► Postgres (schema.sql)
                              │                     ├─ regras_enquete, parcelas, pagamentos
                              │                     ├─ decisoes(+justificativa, votantes, membros)
                              │                     └─ auditoria (vocabulário ampliado)
                              ▼
               registrarAuditoria · enviarParaTurma (email.ts + throttle)
                                          ▲
               /api/cron/lembretes (CRON_SECRET) ← agendador externo, 1x/dia
```

## 11. Infraestrutura e operação

| Tema | Hoje | Proposta | Trade-off |
|---|---|---|---|
| Agendador | não existe | rota `/api/cron/*` com segredo + cron externo diário | sem fila; simples e suficiente para dezenas de turmas |
| Email em massa | SMTP (Gmail no `.env.example`), Mailpit no Docker | `enviarParaTurma` com lotes e `consumirLimite`; avaliar provedor transacional | Gmail tem limite diário; provedor custa, mas melhora entrega e spam |
| Arquivos (comprovante) | nenhum | começar sem anexo (texto do id do Pix) | anexo exige storage, retenção e LGPD de imagem |
| Migração | `db/schema.sql` idempotente + `db/migrate.mjs` | seguir o mesmo padrão; **backup (`pg_dump`) antes** de `alter` em tabela com dados | sem ferramenta de versão de migração |
| Saúde | `/api/healthz` | incluir checagem do agendador (último envio) | |
| Testes | Vitest nas funções puras de `src/lib` | regras novas em arquivos `*-regras.ts` com teste (prazo, quórum, situação de parcelas, texto do WhatsApp, `voltar` seguro) | |

## 12. Design das páginas

Seguir `docs/design-system/formandos/MASTER.md` e os componentes de `src/components/ui` (shadcn) e `src/components/features`; não criar estilo novo.

| Tela | Padrão a reaproveitar | Nota de design |
|---|---|---|
| `/convite?codigo` | `layout-auth.tsx`, `convite-forms.tsx` | mostrar nome da turma e a comissão antes do botão "Entrar"; frase de confiança (0.2) |
| Pergunta com regra | `enquete-card.tsx`, `Badge` | selo "fecha em 12/12" e "precisa de 31 votos"; barra `Progress` com "22 de 38" |
| Fixar decisão | `FormDialog`, `Textarea` | justificativa obrigatória só quando foge da regra; texto explica por quê |
| Decisões no dashboard | card "Decisões da turma" (`dashboard/page.tsx`) | selo "mais votada" ou "fixada com justificativa"; link "histórico" (`PainelRecolhivel`) |
| Opção com valor | `editor-opcoes.tsx`, `formatarReal` | "R$ 95 por pessoa" abaixo do texto da opção, em `tabular-nums` |
| Copiar para o WhatsApp | `BotaoCopiar` | botão secundário com ícone; mostrar o texto antes de copiar (prévia) |
| Minha situação | `Card` + lista como `admin/presenca` | "Você pagou R$ X de R$ Y · próxima: 10/12" no topo; estado "aguardando confirmação"; nunca mostrar dados de outros |
| Tesouraria | `admin/presenca` (filtros, `Paginacao`) | filtros "em dia / atrasado / aguardando"; lançar em `FormDialog` |
| Evento público | card do evento do dashboard | sem menu; "atualizado em" e "mudou" em destaque |
| Exportar | `admin/turma` (cards de arquivar/excluir) | card novo "Exportar registro" antes de "Arquivar" |

Antes de entregar cada tela: o checklist "Pre-Delivery Checklist" do `MASTER.md`, a revisão de texto com `design:ux-copy` e a auditoria de acessibilidade com `design:accessibility-review`.

## 13. Ordem de implementação sugerida (para os ADRs)

1. **0.1, 0.2, 0.3** (texto) e **1.1** (link com código + `voltar`): pequenos, sem banco, e destravam a entrada.
2. **1.4** (copiar para o WhatsApp): sem banco.
3. **1.2 + 2.4 + 2.5 (parte de decisões)**: um ADR único "decisão da turma com regra e histórico".
4. **1.3** (valor por pessoa em perguntas da turma).
5. **2.2** (página pública do evento + "mudou").
6. **1.6 + agendador** (email essencial) e **2.3** (plano de fim), que dependem do mesmo `/api/cron`.
7. **2.1** (exportar e importar).
8. **1.5** (Minha situação): o maior; precisa de ADR próprio sobre papel de tesouraria, comprovante e privacidade.

**O que revisar quando o projeto crescer:** fila de envio (em vez de lotes na requisição), provedor de email, papéis completos (3.2) e storage de arquivos.
