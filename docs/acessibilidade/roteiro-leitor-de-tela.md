# Roteiro de teste com leitor de tela

Teste manual do item 3.5 do levantamento, decidido na [ADR-0015](../adr/0015-leitor-de-tela-nas-telas-de-voto-presenca-e-evento.md). A sonda automática (`scripts/teste/leitor.mjs`) confere estrutura, nome e foco. Este roteiro confere o que ela não alcança: os gestos, a ordem em que as coisas são faladas e se dá para terminar cada tarefa **sem olhar a tela**.

Quem testa aqui está aprendendo o leitor de tela. O resultado vale como primeira checagem, não como opinião de quem usa leitor de tela todo dia.

## 1. Antes de começar

1. **Computador:** `docker compose up -d` e o site aberto em `http://localhost:3000`.
2. **Celular na mesma rede Wi-Fi:** `LAN_ORIGIN="http://SEU-IP:3000"` no `.env.local` e `docker compose up -d app` (README, passo "Celular, tablet ou TV na mesma rede"). No celular, abra `http://SEU-IP:3000`.
3. **Conta de teste:** crie uma conta com email e senha por `http://SEU-IP:3000/entrar`. O link de confirmação cai no Mailpit, `http://localhost:8025`, no computador. Entre na turma de teste com o código de convite. O login com Google não funciona pelo IP.
4. **Turma de teste com:** data e local do evento, pelo menos 2 itens na programação, limite de acompanhantes maior que zero, o catálogo padrão de votações e o link público do evento criado (dashboard da comissão, "Criar link para família e convidados").
5. **Navegador:** Chrome no Android, Safari no iPhone. São os pares que quase todo mundo usa com TalkBack e VoiceOver.
6. Faça **uma vez com a tela à vista**, para aprender os gestos. Depois repita cada tarefa **sem olhar** (tela virada para baixo ou brilho no mínimo). Só a segunda vez conta.

## 2. Ligar, desligar e os gestos

Com o leitor ligado, o toque muda: um toque só **lê**, e é preciso **dois toques** para acionar. Aprenda a desligar antes de ligar.

### TalkBack (Android)

- **Ligar e desligar:** Configurações → Acessibilidade → TalkBack. Atalho: segurar as **duas teclas de volume** por 3 segundos (o Android pergunta na primeira vez se quer ativar o atalho).
- **Gestos:**

  | Gesto | O que faz |
  |---|---|
  | Deslizar para a direita | Próximo item |
  | Deslizar para a esquerda | Item anterior |
  | Dois toques em qualquer lugar | Aciona o item em foco |
  | Deslizar com dois dedos | Rola a página |
  | Deslizar para cima e para baixo num movimento só | Troca o controle de leitura (escolha **Títulos**) |
  | Deslizar para baixo / para cima | Próximo / anterior do controle escolhido (o próximo título) |

  Em aparelhos com gestos de vários dedos, deslizar com três dedos para a esquerda ou para a direita também troca o controle de leitura.

### VoiceOver (iPhone)

- **Ligar e desligar:** Ajustes → Acessibilidade → VoiceOver. Atalho: Ajustes → Acessibilidade → Atalho de Acessibilidade → VoiceOver; depois, três cliques no botão lateral. Também dá para pedir à Siri: "desativar o VoiceOver".
- **Gestos:**

  | Gesto | O que faz |
  |---|---|
  | Deslizar para a direita | Próximo item |
  | Deslizar para a esquerda | Item anterior |
  | Dois toques em qualquer lugar | Aciona o item em foco |
  | Deslizar com três dedos | Rola a página |
  | Girar dois dedos na tela, como um botão | Abre o rotor (escolha **Títulos**) |
  | Deslizar para baixo / para cima | Próximo / anterior do item do rotor (o próximo título) |

## 3. As seis tarefas

Em "espera-se ouvir" está o **conteúdo**. As palavras exatas mudam de um leitor para outro ("botão", "caixa de seleção", "título nível 2").

### Tarefa 1 — Entrar com email e senha

- **Onde:** `/entrar`.
- **Fazer:** achar o campo de email, digitar, achar o campo de senha, digitar e entrar.
- **Espera-se ouvir:** o nome de cada campo antes de digitar; o nome do botão de entrar; com senha errada, a mensagem de erro falada sem precisar procurar.

### Tarefa 2 — Achar a data e o local do evento

- **Onde:** `/dashboard`.
- **Fazer:** navegar **por títulos** até "Contagem regressiva"; depois ouvir data e local.
- **Espera-se ouvir:** o nome da turma como primeiro título; "Contagem regressiva" como título; **uma frase só**, "Faltam N dias, N horas e N minutos para o evento", e não seis pedaços; "Data do evento" com a data; "Local" com o local; "Como chegar, abre em nova aba".

### Tarefa 3 — Confirmar presença com um acompanhante, e remover

- **Onde:** `/dashboard`, título "Você vai ao evento?".
- **Fazer:** abrir "Responder"; marcar "Vou"; "Adicionar acompanhante"; digitar um nome; escolher adulto ou criança; adicionar um segundo; remover o primeiro; salvar.
- **Espera-se ouvir:** ao abrir, o título do diálogo e a primeira opção; "Vou", "Talvez", "Não vou" como opções de escolha única, com marcado ou não; depois de "Adicionar acompanhante", o foco **já no campo** "Nome do acompanhante 1"; "N acompanhantes na lista" depois de cada mudança; "Remover o acompanhante 1, {nome}"; depois de remover, o foco no "Remover" que sobrou, **não** no começo do diálogo; depois de salvar, de volta ao dashboard com "Sua resposta: Vou, com 1 acompanhante".

### Tarefa 4 — Votar em duas perguntas e salvar

- **Onde:** `/votacoes`, depois o catálogo.
- **Fazer:** abrir o catálogo; navegar **por títulos** até a segunda pergunta; ouvir as opções; marcar uma; ir à pergunta seguinte e marcar outra; achar "Salvar tudo" e salvar.
- **Espera-se ouvir:** a frase de quem vê o voto, antes das perguntas; cada categoria e cada pergunta como título; "Escolha uma opção" ou "Você pode escolher várias opções"; "N de M votaram" **uma vez** por pergunta; cada opção com marcado ou não; ao marcar, "N de 23 respondidas, alterações não salvas"; depois de salvar, a confirmação falada.
- **Atenção a:** o botão "Salvar tudo" fica preso no rodapé da tela. Anote se foi fácil ou difícil chegar nele sem ver.

### Tarefa 5 — Ouvir o resultado de uma pergunta

- **Onde:** `/votacoes/relatorio`.
- **Fazer:** navegar por títulos até uma pergunta que já tem voto; ouvir o resultado; abrir "Ver como tabela".
- **Espera-se ouvir:** "N de M membros responderam"; "Mais votada: {opção} (N%)"; o gráfico como **uma** imagem, com todas as opções, votos e percentuais no nome; "Ver como tabela: {pergunta}"; na tabela, as colunas Opção, Votos e % de quem respondeu.

### Tarefa 6 — Abrir a página pública do evento

- **Onde:** o link `/evento/{código}`, sem login (janela anônima ou outro celular).
- **Fazer:** ouvir a página do começo ao fim.
- **Espera-se ouvir:** o nome da turma como título; Quando, Onde, Traje e Bom saber, cada um com o seu valor; "Como chegar"; a programação com horário e nome de cada item; se o evento mudou, o aviso do que mudou.

## 4. Registro do teste

Uma tabela por leitor. "Conseguiu" = terminou a tarefa sem olhar a tela e sem ajuda.

### TalkBack

- **Data:** 14/11/2026
- **Quem testou:** pessoa do grupo (nome não registrado)
- **Aparelho, versão do Android e do Chrome:** não registrado
- **Resultado:** as seis tarefas terminadas, sem travar.

| Tarefa | Conseguiu? | Onde travou | O que o leitor falou de estranho |
|---|---|---|---|
| 1. Entrar | Sim | — | — |
| 2. Data e local | Sim | — | — |
| 3. Presença | Sim | — | — |
| 4. Votar | Sim | — | — |
| 5. Resultado | Sim | — | — |
| 6. Página pública | Sim | — | — |

### VoiceOver

- **Data:** 14/11/2026
- **Quem testou:** pessoa do grupo (nome não registrado)
- **Aparelho e versão do iOS:** não registrado
- **Resultado:** as seis tarefas terminadas, sem travar.

| Tarefa | Conseguiu? | Onde travou | O que o leitor falou de estranho |
|---|---|---|---|
| 1. Entrar | Sim | — | — |
| 2. Data e local | Sim | — | — |
| 3. Presença | Sim | — | — |
| 4. Votar | Sim | — | — |
| 5. Resultado | Sim | — | — |
| 6. Página pública | Sim | — | — |

**Lacunas deste registro:** o grupo informou o resultado ("funcionando em todas as tarefas"), sem o aparelho, as versões e o que o leitor falou em cada tela. No próximo teste, preencher esses campos: são eles que permitem comparar.

## 5. O que fazer com o resultado

- **Travou ou não deu para terminar:** correção na ADR-0015, com um caso novo na sonda quando a máquina consegue medir.
- **Terminou, mas com fala repetida ou confusa:** entra na lista de pendências abaixo, com dono.
- **Tudo certo:** registrar mesmo assim. "Passou" com data e aparelho é o que permite comparar no próximo teste.

Repetir o roteiro depois de qualquer mudança grande nas telas de voto, presença ou evento.

## 6. Pendências conhecidas

Coisas que a sonda mostrou e a ADR-0015 deixou fora, por serem telas da comissão ou por precisarem de leitura tela a tela.

- **"Editar item" repetido** na programação do dashboard da comissão (`evento-admin.tsx`): um botão por item, todos com o mesmo nome. O "Remover" ao lado já diz o nome do item.
- **Títulos de card sem nível** (`CardTitle` sem `nivel` continua um `div`, fora da navegação por títulos). Em 14/11/2026:

  | Tela ou componente | Usos |
  |---|---|
  | `/minha-situacao` | 5 |
  | `/conta` | 5 |
  | `/votacoes` e `/votacoes/[catalogoId]` (cabeçalho) | 2 |
  | `/tarefas`, `/terceiros` | 2 |
  | `convite-forms.tsx` | 2 |
  | `previa-enquete.tsx` | 1 |
  | Telas da comissão (`/admin/...`) | 25 |
  | `/master/turmas/[turmaId]` | 1 |

  Os cartões de número (`cartao-resumo.tsx` e o indicador do dashboard) usam `CardTitle` para o **valor**, não para um título. Esses ficam como estão.

  Para escolher o nível: abra a tela com `node scripts/teste/leitor.mjs <cookie> <caminho> --ler`, veja qual título vem antes e use o nível seguinte. A sonda acusa nível pulado.
- **Contraste, Libras e baixa visão:** fora da ADR-0015.
- **Teste com quem usa leitor de tela no dia a dia:** está na lista do que validar com pessoas reais (`docs/simulacoes/levantamento.md`, seção 6).
