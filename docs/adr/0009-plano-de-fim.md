# ADR-0009: Plano de fim da turma e do site (item 2.3)

**Status:** Aceito
**Data:** 2026-11-09
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 2.3 (achado B, "sem dono, suporte nem plano para quando os 4 se formarem", em 7 de 10 simulações). Na simulação 9 (`docs/simulacoes/2026-11-08-6/relatorio.md`), 6 de 8 personas rejeitaram o site por confiança. A turma arquivada fica guardada sem prazo (4 personas), ninguém soube dizer quanto tempo o backup guarda os dados nem o que o registro interno guarda depois da exclusão (3 personas), e a turma seguinte trocou o site por uma empresa de formatura por falta de "compromisso de continuar". O próprio grupo simulado inventou a saída: **exportar primeiro e excluir com data marcada** (a comissão marcou 60 dias depois do arquivamento). A exportação já existe (ADR-0007). Falta a data marcada e o compromisso escrito.

## Contexto

### O que já existe

- **Arquivar** (`arquivarTurma` em `src/actions/gestao-turma.ts`) grava `turmas.arquivada_em` e deixa a turma só de leitura. Não tem prazo: a turma fica guardada até alguém excluir à mão. Ninguém recebe aviso.
- **Excluir** existe em dois lugares com o mesmo código copiado: `excluirTurmaDoAdmin` (comissão, `gestao-turma.ts`) e `excluirTurma` (master, `src/actions/master.ts`). Os dois gravam `turma.excluida` na auditoria e apagam a turma; o resto sai em cascata (membros, votos, decisões, pagamentos, convites, lembretes, link público).
- **A auditoria sobrevive à turma:** `auditoria.turma_id` é `on delete set null`. Depois da exclusão ficam linhas sem turma, e algumas guardam dado pessoal (`membro.removido` guarda o email; pagamentos guardam o id do membro e o valor). A Política diz só "retenção própria (6 meses a 5 anos)".
- **Agendador:** `/api/cron/lembretes` roda de hora em hora (`rodarLembretes`, com trava e `lembretes_enviados`) e já faz uma limpeza por prazo (convites por lista com mais de 90 dias, ADR-0007).
- **Exportar:** a comissão baixa o registro da turma em PDF e planilhas (ADR-0007); cada pessoa baixa os próprios dados em `/conta`.
- **Página pública do evento:** fica no ar com "Evento encerrado" enquanto a turma arquivada existir (ADR-0008, que deixou o fim para esta ADR).
- **Backup:** não há rotina. Os arquivos em `db/backups/` são `pg_dump` feitos à mão antes das migrações. `docs/auditoria-direitos/riscos.md` (R-04) já aponta isso como risco alto.
- **Termos e Política** (`/termos`, `/privacidade`) não dizem o que acontece se o site for desligado.

### Forças em jogo

- **Guardar e apagar:** parte da turma quer o registro para prestar contas; parte quer os dados apagados. A simulação 9 mostrou que as duas coisas cabem juntas se houver data.
- **Ninguém é pego de surpresa:** quem tem dado na turma precisa saber a data antes, com tempo de baixar o que quiser.
- **Promessa que se cumpre:** "apagado" só vale se o backup e o registro interno também tiverem prazo escrito e verdadeiro.
- **Pouca manutenção:** o grupo é de 4 alunos. O fim tem de acontecer sozinho, sem alguém lembrar de apertar um botão.

## Decisão

### 1. Arquivar exige uma data de exclusão

```sql
alter table turmas add column if not exists excluir_em date;  -- nulo = turma ativa
```

- O diálogo "Arquivar turma" (`/admin/turma`) ganha a escolha **"Excluir tudo em: 30, 60, 90 ou 180 dias"**, com 90 marcado. A escolha é obrigatória: não existe "guardar para sempre". O diálogo mostra a data calculada ("A turma será excluída em 07/02/2027") e lembra de baixar o registro antes, com link para a exportação.
- Com a turma arquivada, o card mostra **"Será excluída em dd/mm/aaaa (faltam N dias)"** e o botão **"Mudar a data"**, com as mesmas 4 opções contadas a partir de hoje. Antecipar nunca deixa menos de 30 dias de aviso.
- **Desarquivar** apaga a data (`excluir_em = null`): a turma volta a ser ativa e o prazo deixa de existir.
- Auditoria: `turma.arquivada` passa a guardar `excluir_em`; ação nova `turma.prazo_exclusao` (antes e depois) quando a data muda. As duas entram em `ACOES_VISIVEIS_TURMA`: não têm dado de pessoa.
- A faixa de turma arquivada (`conteudo-turma.tsx`), que todo membro vê, passa a dizer: "Turma arquivada em {data}. Tudo será excluído em {data}. Baixe seus dados em Minha conta."

### 2. Dois avisos por email antes de excluir

| Quando | Assunto | Para quem |
|---|---|---|
| Ao arquivar e ao mudar a data | "Turma {nome} arquivada: exclusão em dd/mm" | todos os membros |
| 7 dias antes da data | "Prazo: a turma {nome} será excluída em dd/mm" | todos os membros |

- Os dois vão a **todos os membros com email confirmado, mesmo quem desligou os emails** em Minha conta. É aviso sobre os dados da própria pessoa, como os emails da conta (confirmação e senha); a Política passa a dizer isso.
- O texto diz o que some (votos, dúvidas, pagamentos, presença, histórico, página pública), o que fazer (baixar os próprios dados em Minha conta; pedir o registro à comissão) e quem marcou a data.
- O aviso ao arquivar sai em `after()`, pelo `enviarParaTurma` (conta no teto diário). O de 7 dias sai pela rodada de lembretes e fica marcado em `lembretes_enviados` com o tipo novo `exclusao` (referência = id da turma). Mudar a data apaga essas marcas, para o aviso de 7 dias sair de novo para a data nova.

### 3. A exclusão acontece sozinha, nunca sem aviso

- Função nova `apagarTurma(db, { turmaId, usuarioId, por })` em **`src/lib/fim-da-turma.ts`**, com `por` = `admin`, `master` ou `prazo`. `excluirTurmaDoAdmin` e `excluirTurma` (master) passam a chamá-la; o código copiado sai.
- `rodarLembretes` ganha um passo, `excluirTurmasNoPrazo()`: exclui turmas **arquivadas** com `excluir_em <= hoje` (fuso de Brasília) **e** cujo aviso de 7 dias já chegou a todos os membros com email confirmado há pelo menos 7 dias. Se o teto diário de emails atrasou o aviso, a exclusão atrasa junto. A regra é "no dia marcado ou logo depois, nunca sem o aviso".
- Uma turma por transação, no máximo 20 por rodada. O resultado entra em `cron_execucoes` (`{ votacao, parcela, excluidas }`).
- Sem email depois da exclusão: quem precisava saber já recebeu dois avisos.

### 4. O que sobra depois da exclusão

- `apagarTurma` apaga também **as linhas da auditoria daquela turma**, antes de apagar a turma. Fica só a linha `turma.excluida`, com o nome da turma, a data e quem excluiu (`admin`, `master` ou `prazo`), guardada por 5 anos como prova de que a exclusão aconteceu.
- A Política passa a dizer isso em uma frase: "Quando a turma é excluída, apagamos tudo dela, inclusive o histórico. Guardamos só o nome da turma e a data da exclusão, por 5 anos."
- A página pública do evento some junto (o código fica em `turmas`).

### 5. Backup com prazo

- Rotina nova `scripts/backup.sh`: `pg_dump` diário do banco em `db/backups/` e **apaga os arquivos com mais de 30 dias**. Roda pelo mesmo serviço `cron` do `compose.yaml` (uma vez por dia) ou à mão. Os arquivos ficam fora do git, como hoje.
- A Política diz: "Cópias de segurança do banco são apagadas em até 30 dias. Dado excluído some das cópias nesse prazo."
- Se um dia houver hospedagem, o prazo de backup do provedor tem de caber nesses 30 dias antes de publicar (entra em `docs/auditoria-direitos/riscos.md`, R-04).

### 6. Se o site for encerrado

Seção nova nos Termos, **"Se o Formandos for encerrado"**:

- Aviso a todos os usuários **por email e numa faixa no site, com 60 dias de antecedência**.
- Durante esses 60 dias: não se cria turma nova; tudo o que existe continua funcionando, inclusive exportar o registro da turma e baixar os próprios dados.
- No fim do prazo, todos os dados são apagados; as cópias de segurança somem em até 30 dias.
- Quem mantém: o responsável já indicado (`EMPRESA.responsavel`, CNPJ MEI). Se outra pessoa assumir o site, todos os usuários são avisados por email antes, com o nome de quem assume.

Agora é só texto. A faixa e o email em massa do encerramento não são construídos nesta ADR: se um dia forem necessários, são uma variável de ambiente e um script com `enviarEmail`, que já existe.

### 7. Turmas já arquivadas

A migração dá data às turmas arquivadas antes desta ADR: `excluir_em = maior entre (arquivada_em + 180 dias) e (hoje + 30 dias)`. Elas recebem o aviso de 7 dias normalmente. Nenhuma turma é excluída sem os 30 dias.

## Opções consideradas

### Prazo de exclusão

| Opção | Prós | Contras |
|---|---|---|
| A. Sem prazo (hoje) | nada a fazer | retenção sem fim; o motivo de rejeição da simulação 9 |
| B. Prazo único da plataforma (ex.: 180 dias) | regra simples | a comissão não escolhe; a simulação 9 quis decidir a data |
| **C. A comissão escolhe entre 30, 60, 90 e 180 dias, obrigatório (escolhida)** | atende quem guarda e quem apaga; teto conhecido | mais um campo no diálogo |
| D. Como C, com a opção "nunca" | flexível | volta ao problema A |

### Quem executa a exclusão

| Opção | Prós | Contras |
|---|---|---|
| **A. A rodada de lembretes exclui sozinha (escolhida)** | acontece mesmo que a comissão esqueça | erro no código apaga sem ninguém olhar (mitigado pela regra do aviso e pelo teste) |
| B. A rodada só avisa a comissão, que exclui à mão | ninguém perde dado por automação | o prazo vira promessa; é o "apagado é só promessa" da simulação 9 |

### Auditoria depois da exclusão

| Opção | Prós | Contras |
|---|---|---|
| A. Manter tudo sem turma (hoje) | prova completa | guarda email e valores de quem pediu para apagar |
| **B. Apagar tudo da turma, menos `turma.excluida` (escolhida)** | "apagado" vale de verdade; continua provado que excluiu | a comissão perde o histórico (ela pode exportar antes) |
| C. Anonimizar as linhas | mantém estatística | trabalho para pouco uso; o nome volta em `detalhe` |

### Aviso para quem desligou os emails

| Opção | Prós | Contras |
|---|---|---|
| A. Respeitar a preferência | coerente com a ADR-0006 | a pessoa perde os dados sem saber |
| **B. Mandar mesmo assim, como email da conta (escolhida)** | ninguém é pego de surpresa | são 2 emails a mais por turma, uma vez só |

## Análise de trade-offs

O ponto central é que a data passa a existir sempre: arquivar sem prazo deixa de ser possível. Isso troca um pouco de liberdade da comissão (guardar para sempre) por uma promessa que o site cumpre sozinho. Quem quer guardar exporta; quem quer apagar sabe quando.

O risco da exclusão automática é apagar cedo demais. Por isso a regra é presa ao aviso, e não só à data: se o email de 7 dias não saiu, a turma não é excluída. O pior caso vira "excluída alguns dias depois", nunca "excluída sem aviso".

Apagar a auditoria da turma vai contra o costume de guardar tudo, mas é o que torna verdadeira a frase da Política. A prova que importa (a turma foi excluída, quando e por quem) continua.

O texto de encerramento do site não custa código e responde à pergunta "e se sair do ar", que derrubou a turma seguinte na simulação 9. Construir o mecanismo agora seria trabalho para um caso que talvez nunca aconteça.

## Consequências

- **Fica mais fácil:** responder "quando isso é apagado?" com uma data; a comissão prestar contas e encerrar sem guardar dado para sempre; o projeto cumprir a LGPD (prazo de retenção) sem trabalho manual.
- **Fica mais fácil também:** os dois códigos de exclusão viram um só (`apagarTurma`).
- **Fica mais difícil:** um erro em `excluirTurmasNoPrazo` apaga dado de verdade; precisa de teste com turma de mentira e da regra do aviso. A rotina de backup ocupa disco (30 arquivos).
- **Rever depois:** turma abandonada sem arquivar (ex.: exclusão sugerida 1 ano depois da data do evento); deixar os membros baixarem o PDF do registro na turma arquivada, sem depender da comissão; mecanismo de encerramento do site (faixa + email a todos) se um dia for preciso.

## Ações

1. [ ] Backup (`pg_dump`). `db/schema.sql`: `turmas.excluir_em`; `lembretes_enviados.tipo` aceita `exclusao`; migração das turmas já arquivadas.
2. [ ] `src/lib/fim-da-turma.ts`: `apagarTurma` (apaga a auditoria da turma, grava `turma.excluida`, apaga a turma) e regras puras do prazo (`dataExclusao(hoje, dias)`, opções 30/60/90/180, piso de 30 dias), com teste. `excluirTurmaDoAdmin` e `excluirTurma` (master) passam a usar.
3. [ ] `arquivarTurma` com o prazo; action `mudarPrazoExclusao`; `desarquivarTurma` apaga a data. Auditoria `turma.prazo_exclusao` em `auditoria-acoes.ts` e frase em `historico-texto.ts`.
4. [ ] Telas: escolha do prazo no diálogo de arquivar, "Será excluída em" e "Mudar a data" no card, faixa de turma arquivada com a data.
5. [ ] Emails `emailTurmaArquivada` e `emailExclusaoProxima` em `src/lib/email.ts`; aviso ao arquivar e ao mudar a data em `after()`; aviso de 7 dias e `excluirTurmasNoPrazo` em `src/lib/lembretes.ts`.
6. [ ] `scripts/backup.sh` (diário, apaga com mais de 30 dias) e chamada no serviço `cron` do `compose.yaml`.
7. [ ] Termos ("Se o Formandos for encerrado") e Política (prazo da turma arquivada, aviso mesmo com emails desligados, o que sobra depois da exclusão, backup em 30 dias). Atualizar R-04 em `docs/auditoria-direitos/riscos.md`.
8. [ ] Textos revisados com `design:ux-copy`; telas em 360px; `typecheck`, `npm test` e passo novo em `fluxos.mjs` (arquivar com 30 dias, ver a data na faixa, mudar a data, forçar a data para ontem com o aviso marcado e ver a turma excluída pela rota de lembretes com só `turma.excluida` na auditoria; sem o aviso, a turma não é excluída).
