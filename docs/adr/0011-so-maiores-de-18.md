# ADR-0011: Conta só para maiores de 18 anos (item 3.6)

**Status:** Aceito
**Data:** 2026-11-12
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 3.6 (achado O, em 1 de 10 simulações). Na simulação 5 (`docs/simulacoes/2026-11-08-2/relatorio.md`) as turmas de ABC e de Ensino Médio gostaram dos modelos de catálogo, mas apontaram que uma turma com menor de idade exige papel de responsável, voto por família e regra própria. O relatório recomendou decidir antes se o app atende menores. Em 12/11/2026 o grupo decidiu: **só maiores de 18**.

## Contexto

### O que já existe

- **Cadastro por email e senha** (`src/components/features/form-email-senha.tsx`): uma caixa "Li e aceito os Termos de Uso e a Política de Privacidade". O aceite fica carimbado em `usuarios` (`src/lib/auth.ts`).
- **Entrada pelo Google:** sem caixa; o comentário no código diz que o Google consente via OAuth.
- **Termos** (`/termos`, versão 1.0 de 10/10/2026) e **Política** (`/privacidade`) não falam de idade.
- **Modelos de catálogo** `educacao-infantil` e `ensino-medio` em `docs/catalogos-modelo/`, oferecidos ao criar a turma. Agradaram na simulação 5.
- **Presença:** guarda só a quantidade de acompanhantes, sem nome nem idade.

### Forças em jogo

- **LGPD, art. 14:** dado de criança exige consentimento específico de um dos pais ou do responsável. Coletar esse consentimento de forma verificável é um fluxo inteiro (papel de responsável, vínculo com o aluno, termo próprio).
- **Tamanho do grupo:** 4 alunos. O achado apareceu em 1 de 10 simulações.
- **Não perder o que agradou:** formatura de ABC e de Ensino Médio é organizada por adultos (pais, responsáveis, professores). Eles podem usar o site sem que a criança tenha conta.

## Decisão

### 1. A conta é de adulto

- Os Termos ganham a seção **"Quem pode usar"**: a conta é para pessoas com 18 anos ou mais. Em turmas de crianças e adolescentes, quem cria conta, vota e confirma presença é o pai, a mãe ou o responsável.
- Os Termos passam à **versão 1.1**, com a data da mudança.

### 2. Declaração no cadastro, sem pedir data de nascimento

- A caixa do cadastro passa a dizer: **"Tenho 18 anos ou mais e aceito os Termos de Uso e a Política de Privacidade."** Continua sendo uma caixa só e o mesmo carimbo de aceite; não há coluna nova.
- Abaixo do botão do Google entra a linha: "Ao entrar com o Google, você declara ter 18 anos ou mais e aceita os Termos de Uso e a Política de Privacidade."
- Não se pede data de nascimento: seria um dado pessoal a mais só para conferir uma regra que a declaração já cobre (minimização, LGPD art. 6º, III).
- Quem já tem conta não é chamado a aceitar de novo. A versão 1.1 vale para todos a partir da data; a mudança aparece no topo dos Termos.

### 3. Dados de menores

- A Política ganha o parágrafo: o Formandos não se destina a menores de 18 anos e não coleta dados deles de propósito. Se uma conta de menor for identificada, ela é excluída; o pedido pode ser feito pelo responsável ao encarregado (DPO).
- Os Termos pedem que a comissão não escreva dados de crianças (nome completo, foto, saúde) em avisos, dúvidas e observações de presença além do necessário para organizar o evento.

### 4. Modelos de ABC e de Ensino Médio continuam

- Os dois modelos ficam. A descrição de cada um ganha a frase: "Nesta turma, quem participa são os responsáveis."
- Não se cria papel de responsável nem voto por família. Uma conta é um voto. Se a turma quiser um voto por família, a comissão convida um responsável por aluno; a lista de convites (ADR-0007) já permite controlar isso.

### 5. Fora desta ADR

- Papel de responsável ligado a um aluno, consentimento parental verificável, voto por família imposto pelo sistema e conta para adolescente de 16 ou 17 anos. Voltam a ser avaliados se o site passar a mirar escolas.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Atender menores (responsável, consentimento, voto por família) | Maior item do Nível 3, para um achado de 1 em 10 simulações; exige fluxo de consentimento verificável que o grupo não consegue manter. |
| Deixar como está | O risco do art. 14 fica aberto e os Termos continuam sem resposta para uma pergunta que a simulação fez. |
| Pedir data de nascimento | Coleta um dado a mais e não impede quem mente; a declaração tem o mesmo efeito com menos dado. |
| Tirar os modelos de ABC e Ensino Médio | Perde o que agradou na simulação 5; os adultos dessas turmas são público válido. |

## Consequências

**Fica melhor**
- Regra de idade escrita e igual nos Termos, na Política e no cadastro.
- Nenhum dado novo coletado e nenhuma tabela nova.
- Turmas de ABC e de Ensino Médio continuam atendidas, pelos responsáveis.

**Fica pior ou mais difícil**
- Formando de Ensino Médio com 16 ou 17 anos não pode ter conta; quem participa é o responsável.
- A regra depende de declaração: o site não confere a idade.
- "Um voto por família" depende de a comissão convidar um responsável por aluno.

**Arquivos**
- `src/app/(publico)/termos/page.tsx`, `src/app/(publico)/privacidade/page.tsx`, `src/components/features/form-email-senha.tsx`, tela de entrada com o botão do Google, `docs/catalogos-modelo/educacao-infantil.md`, `docs/catalogos-modelo/ensino-medio.md`, `docs/auditoria-direitos/` (registrar a decisão em `legislacao.md` e `riscos.md`).

**Teste de fluxo**
- Conferir o texto novo da caixa no cadastro, a linha do Google e a seção nova em `/termos` e `/privacidade`.

### Andamento (2026-11-12)

Tudo feito. Diferenças em relação ao texto acima:

- A frase nos modelos não ficou igual nos dois. Em `educacao-infantil.md`: "Nesta turma, quem participa são os responsáveis." Em `ensino-medio.md`: "quem tem menos de 18 anos participa pelo responsável", porque parte dos formandos do Ensino Médio já tem 18 anos e pode ter conta.
- Os Termos ganharam a seção 2, "Quem pode usar"; as seções seguintes foram renumeradas (3 a 8). A linha da versão diz o que mudou.
- A Política também passou à versão 1.1.
- `docs/auditoria-direitos/`: linha do art. 14 em `legislacao.md` e risco R-13 em `riscos.md` (residual médio, porque a idade é declarada e não conferida).
- Testes: `typecheck`; grupo `auth` de `fluxos.mjs` no Docker, 18 de 18, com o passo novo "ADR-0011" e o rótulo novo da caixa do cadastro.
