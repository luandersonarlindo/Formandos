# ADR-0001: Textos de confiança (nível 0 do levantamento)

**Status:** Aceito
**Data:** 2026-11-08
**Decisores:** grupo do Formandos (4 integrantes); o item 0.1 depende de resposta da Unifacol
**Origem:** `docs/simulacoes/levantamento.md`, itens 0.1, 0.2 e 0.3 (achados B e H)

## Contexto

Em 7 das 10 simulações, a desconfiança veio de três perguntas que o site não responde no lugar certo: **quem é o dono**, **se é da Unifacol** e **quem vê o meu voto**. Nada disso exige funcionalidade nova. O que existe hoje:

- `src/lib/empresa.ts` define `EMPRESA` (razão social MEI, nome fantasia, responsável) e `DPO` (nome e email). O email do encarregado é institucional da Unifacol (`@unifacol.edu.br`). Ele aparece em `/privacidade`, `/termos` e no card "Privacidade e DPO" de `/conta`.
- O rodapé da página inicial (`Rodape` em `src/components/vitrine/secoes.tsx`) tem links para Privacidade, Termos, GitHub e Guia, mas não diz quem mantém o site nem que ele não é oficial.
- `/convite` (`src/app/(onboarding)/convite/page.tsx`), a primeira tela depois do cadastro, não tem nenhum texto de confiança.
- O aviso "O administrador vê quem votou em cada opção" existe só na lista de votações (`src/app/(app)/votacoes/page.tsx`). A tela onde a pessoa de fato vota (`src/app/(app)/votacoes/[catalogoId]/page.tsx` com `form-votacao-catalogo.tsx`) não repete o aviso.

Forças em jogo:
- **Confiança e LGPD.** Na simulação 9, a persona da DPO leu o email institucional como "aval que não existe". O risco é a Unifacol ser cobrada por algo que não contratou.
- **Custo zero de infraestrutura.** São mudanças de texto, sem banco nem migração.
- **Fonte única.** A frase precisa sair da mesma constante (`EMPRESA`) que alimenta Termos e Política, para não ficar desatualizada em algum lugar.

## Decisão

1. **0.1 — Email do encarregado:** o grupo criou o email do projeto `companysexteto@gmail.com` (2026-11-08), que passa a ser o contato em todo o projeto: `DPO.email` em `src/lib/empresa.ts`, documentos de `docs/auditoria-direitos/`, remetente SMTP e conta do cliente OAuth do Google. O email institucional (`@unifacol.edu.br`) deixa de ser usado. Se um dia a Unifacol autorizar formalmente, a decisão pode ser revista.
2. **0.2 — Frase de confiança:** acrescentar em `src/lib/empresa.ts` uma constante `AVISO_INSTITUCIONAL` com uma frase curta, do tipo: *"O Formandos é um projeto gratuito de alunos da Unifacol, mantido por {responsável}. Não é um site oficial da Unifacol. Você pode baixar seus dados e excluir sua conta a qualquer momento."* (texto final revisado com `design:ux-copy`). A frase é mostrada em três lugares:
   - rodapé da página inicial (`Rodape`);
   - topo do card de `/convite`, abaixo do título;
   - card "Privacidade e DPO" de Minha conta (`src/app/(conta)/conta/page.tsx`), em forma curta, com link para `/termos`. (Antes previsto no rodapé do menu lateral; o grupo preferiu não ocupar o menu.)
3. **0.3 — Quem vê o voto:** levar o texto que já existe em `votacoes/page.tsx` para uma constante compartilhada e mostrá-lo também na tela de votar, logo acima do botão de salvar, com o mesmo tom: *"A comissão vê em qual opção você votou. A turma vê só os totais."*

## Opções consideradas

### 0.1 — Contato do encarregado

#### Opção A: manter o email institucional e pedir autorização depois
| Dimensão | Avaliação |
|---|---|
| Complexidade | Baixa |
| Custo | Zero |
| Risco | Alto: sugere vínculo com a Unifacol que não existe |
| Familiaridade | Já é assim |

**Prós:** nada a mudar. **Contras:** é o problema que as simulações apontaram. Se a Unifacol não autorizar, já ficou exposto.

#### Opção B: trocar já por um email do projeto (recomendada)
| Dimensão | Avaliação |
|---|---|
| Complexidade | Baixa (uma constante) |
| Custo | Zero (conta de email gratuita) |
| Risco | Baixo; a caixa precisa ser lida por alguém do grupo |
| Familiaridade | Alta |

**Prós:** separa projeto e instituição; não depende da resposta da Unifacol. **Contras:** mais uma caixa de email para cuidar; quem responde precisa estar definido.

#### Opção C: email pessoal do responsável
**Prós:** simples. **Contras:** mistura vida pessoal e projeto; some quando o responsável se formar (achado B: continuidade).

### 0.2 — Onde mostrar a frase

#### Opção A: só em `/termos` e `/privacidade`
**Contras:** ninguém lê; as simulações pediram "em uma frase, na primeira tela".

#### Opção B: rodapé da vitrine + `/convite` + rodapé do menu (recomendada)
**Prós:** aparece antes do cadastro, no primeiro uso e sempre depois. **Contras:** mais um texto na interface; precisa ser curto.

#### Opção C: banner ou modal de aceite
**Contras:** interrompe o fluxo e repete o consentimento que já existe no cadastro (`usuarios.consentimento_em`).

## Análise de trade-offs

Tudo aqui é texto, e o custo de errar é baixo e reversível. O ponto que pesa é o 0.1: manter o email institucional sem autorização é um risco para a instituição. Trocar não custa nada e pode ser desfeito se a Unifacol autorizar. Na 0.2, guardar a frase em `empresa.ts` evita três textos diferentes divergindo com o tempo. Na 0.3, reaproveitar o texto que já existe evita uma segunda versão contraditória ("administrador" num lugar e "comissão" no outro).

## Consequências

- **Fica mais fácil:** responder "de quem é isso?" e "a faculdade está por trás?" sem a pessoa abrir os Termos.
- **Fica mais difícil:** nada relevante. O grupo precisa definir quem lê a caixa do email do projeto.
- **Rever depois:** quando houver plano de continuidade (item 2.3), a frase deve dizer o que acontece com os dados se o projeto acabar. Se a Unifacol autorizar o email institucional, voltar a ele e registrar a autorização.

## Ações

1. [x] Grupo cria o email do projeto (`companysexteto@gmail.com`). [ ] Definir quem lê a caixa.
2. [ ] Opcional: perguntar à Unifacol se há objeção ao uso do nome da instituição na frase de confiança (o email já não depende dela).
3. [x] `src/lib/empresa.ts`: trocar `DPO.email` (feito, junto com `docs/auditoria-direitos/legislacao.md` e `PSI.md`). [ ] Criar `AVISO_INSTITUCIONAL` e o texto curto do rodapé.
4. [ ] `src/components/vitrine/secoes.tsx` (`Rodape`): mostrar `AVISO_INSTITUCIONAL`.
5. [ ] `src/app/(onboarding)/convite/page.tsx`: mostrar `AVISO_INSTITUCIONAL` abaixo do texto de abertura.
6. [ ] `src/app/(conta)/conta/page.tsx`: versão curta no card "Privacidade e DPO", com link para `/termos`.
7. [ ] `src/app/(app)/votacoes/[catalogoId]/page.tsx` ou `form-votacao-catalogo.tsx`: aviso de quem vê o voto, perto do botão de salvar; mesma constante usada em `votacoes/page.tsx`.
8. [ ] Revisar os textos com `design:ux-copy` e conferir contraste e leitura por leitor de tela com `design:accessibility-review`.
9. [ ] Rodar `npm run typecheck` e a auditoria de interface (`scripts/teste/auditoria.mjs`) nas larguras do projeto.
