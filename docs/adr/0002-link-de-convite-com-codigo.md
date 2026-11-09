# ADR-0002: Link de convite com código embutido e retorno depois do login (item 1.1)

**Status:** Aceito
**Data:** 2026-11-08
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 1.1 (achado G: simulações 1, 3, 4, 6 e 8; validado na simulação 10)

## Contexto

Hoje o convite tem 3 passos manuais, e o código se perde no caminho:

1. `BotaoConvite` (`src/components/features/botao-convite.tsx`) copia o texto *"acesse {origem}/convite e use o código {codigo}"*. O código vai no texto, não no endereço.
2. Quem toca no link sem estar logado cai no `proxy.ts` (`src/proxy.ts`), que redireciona para `/entrar` **sem guardar o endereço pedido**.
3. Depois do login, tudo volta para `/dashboard`: `BotaoGoogle` (`botao-google.tsx`) e `FormEmailSenha` (`form-email-senha.tsx`) usam `callbackURL: "/dashboard"` fixo, inclusive no cadastro, cujo link de confirmação também volta para lá.
4. Sem turma, `exigirMembro` (`src/lib/dal.ts`) manda para `/convite`, onde o campo de código está vazio (`FormEntrarConvite` em `convite-forms.tsx`). A pessoa precisa voltar ao WhatsApp, achar o código e digitar.

O que já está certo e não muda:
- `entrarPorConvite` (`src/actions/turmas.ts`) valida o código, limita tentativas por usuário e por IP (`tentativas_convite`) e aplica `podeEntrarEmOutraTurma` (`src/lib/vinculos.ts`).
- `normalizarCodigo` (`src/lib/convite.ts`) já trata maiúsculas e espaços.
- Better Auth está com `requireEmailVerification: true` e `autoSignInAfterVerification: true` (`src/lib/auth.ts`). Por isso o `callbackURL` passado no cadastro segue dentro do link de confirmação e funciona **mesmo se a pessoa abrir o email em outro navegador**.
- No Next 16, `searchParams` da página é uma `Promise` e o `proxy` pode ler e gravar cookies e redirecionar (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` e `page.md`).

Forças em jogo:
- **Menos passos** no primeiro acesso (a simulação 4 perdeu gente aqui).
- **Segurança:** não criar redirecionamento aberto; não enfraquecer o limite contra adivinhar códigos; não colocar ninguém numa turma sem um clique da própria pessoa.
- **Funcionar em três caminhos:** Google, login com email e cadastro novo com confirmação por email.

## Decisão

1. **Formato do link:** `{origem}/convite?codigo=K7QM4R2X`. `BotaoConvite` passa a gerar esse link, e o texto da mensagem fica "Entre na turma {nome}: {link}".
2. **Destino preservado em todo o caminho (parâmetro `voltar`):**
   - `proxy.ts`: ao redirecionar quem não tem sessão, monta `/entrar?voltar=<caminho + query pedidos>`.
   - Nova função pura `destinoSeguro(voltar)` em `src/lib/redirecionamento.ts`, com teste. Aceita só caminho interno (começa com `/`, não começa com `//` nem com `/\`, sem esquema) e devolve `/dashboard` em qualquer outro caso.
   - `src/app/(publico)/entrar/page.tsx`: lê `searchParams.voltar`, passa por `destinoSeguro` e entrega como prop `destino` a `FormEmailSenha` e `BotaoGoogle`, que usam esse valor no `callbackURL` (login, cadastro e Google) e no `router.push` depois do login.
   - Quem já está logado e abre `/entrar?voltar=...` vai direto ao destino seguro, e não sempre ao `/dashboard`.
3. **Cookie de reserva:** quando o `proxy` vê `/convite?codigo=X`, grava também um cookie `convite_pendente` (httpOnly, `sameSite=lax`, 7 dias, só o código normalizado). Ele cobre o caso em que o `voltar` se perde, por exemplo quando a pessoa fecha a aba e volta depois pela página inicial. `entrarPorConvite` apaga o cookie quando dá certo.
4. **`/convite` preenche, não entra sozinho:** a página lê `codigo` da URL (ou do cookie), normaliza e passa como `valorInicial` para `FormEntrarConvite`. A pessoa vê o código já preenchido e toca em "Entrar na turma". **Não** há entrada automática, para que um link de terceiros não ponha ninguém numa turma sem querer.
5. **Sem prévia do nome da turma por enquanto.** Mostrar o nome antes de entrar exigiria consultar a turma pelo código fora de `entrarPorConvite`, o que abriria um jeito de testar códigos sem gastar tentativas. Fica para a página pública do evento (item 2.2), que usa outro token.

## Opções consideradas

### Opção A: só o parâmetro `voltar` (sem cookie)
| Dimensão | Avaliação |
|---|---|
| Complexidade | Baixa |
| Custo | Zero |
| Cobertura | Google, login e cadastro (o link de confirmação carrega o `callbackURL`) |
| Familiaridade | Alta (padrão comum de login) |

**Prós:** simples, sem estado guardado, funciona em outro navegador. **Contras:** se a pessoa sair do fluxo (fechar a aba e voltar pela página inicial), o código se perde.

### Opção B: só o cookie `convite_pendente`
| Dimensão | Avaliação |
|---|---|
| Complexidade | Baixa |
| Cobertura | só o mesmo navegador |

**Prós:** sobrevive a sair do fluxo. **Contras:** falha quando o email de confirmação é aberto no aplicativo de email (outro navegador), que é o caso mais comum no celular.

### Opção C: `voltar` + cookie de reserva (recomendada)
| Dimensão | Avaliação |
|---|---|
| Complexidade | Baixa a média (uma função pura, um cookie, 4 arquivos) |
| Custo | Zero |
| Cobertura | os três caminhos + saída do fluxo no mesmo navegador |
| Risco | controlado por `destinoSeguro` e pelo limite já existente em `entrarPorConvite` |

**Prós:** cobre os casos das simulações sem infraestrutura nova. **Contras:** dois mecanismos para manter; o cookie precisa ser apagado depois do uso.

### Opção D: entrada automática ao abrir o link
**Prós:** um passo a menos. **Contras:** link de terceiros põe a pessoa numa turma sem ela decidir; conflita com `podeEntrarEmOutraTurma` sem explicação na tela. Descartada.

### Opção E: rota curta `/c/{codigo}`
**Prós:** link mais curto no WhatsApp. **Contras:** mais uma rota; o ganho é estético. Pode ser acrescentada depois como redirecionamento para `/convite?codigo=`.

## Análise de trade-offs

O que decide é o caminho do cadastro novo. Com `autoSignInAfterVerification` ligado, o `callbackURL` dentro do link de confirmação leva a pessoa de volta ao convite mesmo em outro navegador. Só o cookie não faria isso. Por outro lado, o `voltar` some se a pessoa sair do fluxo, e é aí que o cookie ajuda. Os dois juntos custam pouco.

O risco novo é o redirecionamento aberto (`?voltar=https://site-falso`), e ele fica isolado numa função pura testada. O risco de adivinhar códigos não aumenta: a página só preenche o campo, e quem valida e conta tentativas continua sendo `entrarPorConvite`.

## Consequências

- **Fica mais fácil:** entrar pela primeira vez (um toque no link, login, um toque em "Entrar na turma"); a comissão para de responder "cadê o código?".
- **Fica mais fácil também:** qualquer página protegida passa a voltar ao lugar certo depois do login (ex.: link de uma votação mandado no grupo), o que já prepara os itens 1.4 e 1.6.
- **Fica mais difícil:** testar todos os caminhos de login (Google, email, cadastro com confirmação, já logado, sem turma, com turma, participante que não pode entrar em outra turma).
- **Rever depois:** prévia do nome da turma (com limite próprio) e a rota curta `/c/`; se um dia houver convite individual por email (item 2.1, importar lista), reaproveitar o mesmo `?codigo=`.

## Ações

1. [x] `src/lib/redirecionamento.ts` (novo): `destinoSeguro(voltar?: string | null): string`, com teste em `redirecionamento.test.ts` (caminho interno, `//evil`, `/\evil`, `https://`, `javascript:`, vazio, `/convite?codigo=X`).
2. [x] `src/proxy.ts`: anexar `voltar` no redirecionamento; em `/convite?codigo=`, gravar o cookie `convite_pendente` (só o código normalizado com `normalizarCodigo`).
3. [x] `src/app/(publico)/entrar/page.tsx`: ler `searchParams` (Promise), aplicar `destinoSeguro`, redirecionar quem já está logado ao destino, passar `destino` aos componentes.
4. [x] `src/components/features/botao-google.tsx` e `form-email-senha.tsx`: prop `destino` (padrão `/dashboard`) usada em `callbackURL` e em `router.push`.
5. [x] `src/app/(onboarding)/convite/page.tsx`: ler `codigo` da URL ou do cookie e passar `valorInicial` a `FormEntrarConvite` (`convite-forms.tsx`), que usa `defaultValue` no campo.
6. [x] `src/actions/turmas.ts` (`entrarPorConvite`): apagar o cookie `convite_pendente` quando a entrada der certo.
7. [x] `src/components/features/botao-convite.tsx`: gerar o link com `?codigo=` e a frase nova; texto revisado com `design:ux-copy`.
8. [ ] Testar à mão no Docker (Mailpit para o email de confirmação): Google; login com email; cadastro com confirmação aberta em outro navegador; já logado; participante que já tem turma (deve ver o erro atual de `podeEntrarEmOutraTurma`); código inválido (conta tentativa como hoje).
9. [ ] `npm run typecheck`, `npm test` e `scripts/teste/fluxos.mjs` (fluxos de entrada).

### Andamento (2026-11-09)

- Ações 1 a 7 feitas no commit `a5c994e`. A mensagem do convite ficou "Entre na turma "{nome}" no Formandos: {link}". O código que não depende de `node:crypto` foi para `src/lib/convite-link.ts` (`normalizarCodigo`, `linkConvite`, `codigoDoLink`, `COOKIE_CONVITE`), para rodar também no navegador e no proxy, com teste em `convite-link.test.ts`.
- Diferença da decisão, item 3: `entrarPorConvite` apaga o cookie `convite_pendente` depois de qualquer tentativa que passou pelo limite (deu certo, código inválido ou turma arquivada), e não só quando dá certo. Um código que já foi tentado não serve mais para preencher o campo, e assim um código errado não fica voltando por 7 dias.
- Em aberto: o teste à mão dos caminhos de login (ação 8) e os grupos `auth` e `participante` de `fluxos.mjs` (ação 9). No Docker esses grupos não rodam limpos, porque o teste lê os emails do log e lá eles vão para o Mailpit. `npm run typecheck` e `npm test` passaram.

