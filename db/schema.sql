-- Esquema do domínio do Formandos (PostgreSQL).
--
-- Ordem de execução:
--   1. Tabelas do Better Auth (usuarios, session, account, verification):
--        npx auth@latest migrate --config src/lib/auth.ts
--   2. Este arquivo:  npm run db:schema
--   3. Catálogo padrão: npm run db:seed
--
-- Depende de `usuarios(id)`, criada pelo Better Auth. Pode ser executado
-- mais de uma vez: só cria o que ainda não existe.

-- Turmas -------------------------------------------------------------------

create table if not exists turmas (
  id             uuid primary key default gen_random_uuid(),
  nome           varchar(255) not null,
  codigo_convite varchar(20)  not null unique,
  data_evento    timestamptz,
  local_evento   varchar(255),
  criado_por     uuid references usuarios(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- Turma arquivada: fica só para leitura (nada muda) até ser desarquivada.
alter table turmas add column if not exists arquivada_em timestamptz;

-- Configurações que o administrador da turma controla:
--   max_acompanhantes = quantos acompanhantes cada membro pode levar (0 a 20);
--   usar_catalogo_padrao = se a turma usa o catálogo padrão global.
alter table turmas add column if not exists max_acompanhantes smallint not null default 5
  check (max_acompanhantes between 0 and 20);
alter table turmas add column if not exists usar_catalogo_padrao boolean not null default true;

-- Detalhes do evento, editados pelo administrador e mostrados no dashboard.
alter table turmas add column if not exists descricao         text;
alter table turmas add column if not exists endereco          varchar(255);
alter table turmas add column if not exists link_mapa         varchar(500);
alter table turmas add column if not exists traje             varchar(100);
alter table turmas add column if not exists observacoes_local text;
alter table turmas add column if not exists data_fim_evento   timestamptz;

-- Quem é administrador em alguma turma pode participar de várias. Essa regra
-- ("só admin entra em outra turma") é conferida na aplicação, em
-- src/lib/vinculos.ts, e não no banco.
create table if not exists membros (
  turma_id   uuid not null references turmas(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  papel      varchar(20) not null default 'participante'
             check (papel in ('admin', 'participante')),
  created_at timestamptz not null default now(),
  primary key (turma_id, usuario_id)
);

-- Bancos criados antes de existirem várias turmas por admin tinham
-- `unique (usuario_id)`. Remove a restrição, se ainda existir.
alter table membros drop constraint if exists membros_usuario_id_key;
create index if not exists idx_membros_usuario on membros (usuario_id);

-- Enquetes -----------------------------------------------------------------

-- turma_id nulo = catálogo padrão (global, somente leitura).
-- turma_id preenchido = catálogo personalizado daquela turma.
create table if not exists catalogos (
  id         uuid primary key default gen_random_uuid(),
  turma_id   uuid references turmas(id) on delete cascade,
  nome       varchar(255) not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_catalogos_turma on catalogos (turma_id);
-- Só pode existir um catálogo padrão com cada nome (garante o seed idempotente).
create unique index if not exists uq_catalogos_padrao_nome
  on catalogos (nome) where turma_id is null;

create table if not exists categorias (
  id          uuid primary key default gen_random_uuid(),
  catalogo_id uuid not null references catalogos(id) on delete cascade,
  nome        varchar(100) not null,
  ordem       integer not null default 0
);
create index if not exists idx_categorias_catalogo on categorias (catalogo_id);

create table if not exists enquetes (
  id           uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references categorias(id) on delete cascade,
  titulo       text not null,
  tipo         varchar(20) not null default 'unica'
               check (tipo in ('unica', 'multipla')),
  ordem        integer not null default 0
);
create index if not exists idx_enquetes_categoria on enquetes (categoria_id);

-- exclusiva = opção neutra/negativa ("Sem preferência", "Nenhuma restrição").
-- Em pergunta múltipla, marcá-la desmarca as demais (regra aplicada na Server Action).
create table if not exists opcoes (
  id         uuid primary key default gen_random_uuid(),
  enquete_id uuid not null references enquetes(id) on delete cascade,
  texto      varchar(255) not null,
  exclusiva  boolean not null default false,
  ordem      integer not null default 0
);
create index if not exists idx_opcoes_enquete on opcoes (enquete_id);

-- Votos identificados: o admin vê quem votou. Mudar o voto = apagar os votos
-- do usuário naquela enquete e inserir os novos, em uma transação.
-- turma_id fica no voto porque o catálogo padrão é compartilhado entre turmas.
create table if not exists votos (
  turma_id   uuid not null references turmas(id) on delete cascade,
  opcao_id   uuid not null references opcoes(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (opcao_id, usuario_id)
);
create index if not exists idx_votos_turma on votos (turma_id);
create index if not exists idx_votos_usuario on votos (usuario_id);

-- Decisão da turma sobre uma enquete: a opção (ou opções, se a pergunta for de
-- múltipla escolha) que a comissão fixou. É por turma, porque o catálogo padrão
-- é compartilhado. Enquanto houver decisão, a enquete não aceita mais votos.
create table if not exists decisoes (
  turma_id    uuid not null references turmas(id) on delete cascade,
  enquete_id  uuid not null references enquetes(id) on delete cascade,
  opcao_id    uuid not null references opcoes(id) on delete cascade,
  decidido_por uuid references usuarios(id) on delete set null,
  created_at  timestamptz not null default now(),
  primary key (turma_id, opcao_id)
);
create index if not exists idx_decisoes_enquete on decisoes (turma_id, enquete_id);

-- Confirmação de presença: cada membro diz se vai ao evento e quantos
-- acompanhantes leva. Só quem vai ("vou") tem acompanhantes. Quantos são
-- permitidos é escolha da turma (turmas.max_acompanhantes).
create table if not exists presencas (
  turma_id      uuid not null references turmas(id) on delete cascade,
  usuario_id    uuid not null references usuarios(id) on delete cascade,
  status        varchar(10) not null check (status in ('vou', 'talvez', 'nao')),
  acompanhantes smallint not null default 0 check (acompanhantes between 0 and 20),
  observacao    varchar(255),
  updated_at    timestamptz not null default now(),
  primary key (turma_id, usuario_id)
);

-- Bancos criados com o teto de 10 acompanhantes passam a aceitar o mesmo teto
-- de turmas.max_acompanhantes.
alter table presencas drop constraint if exists presencas_acompanhantes_check;
alter table presencas add constraint presencas_acompanhantes_check
  check (acompanhantes between 0 and 20);

-- Mural de avisos: recados fixados da comissão, mostrados no dashboard e em
-- /avisos. Só o administrador publica e apaga; sem edição, como fornecedores.
create table if not exists avisos (
  id         uuid primary key default gen_random_uuid(),
  turma_id   uuid not null references turmas(id) on delete cascade,
  autor_id   uuid references usuarios(id) on delete set null,
  titulo     varchar(200) not null,
  conteudo   text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_avisos_turma on avisos (turma_id, created_at desc);

-- Dúvidas (Q&A) ------------------------------------------------------------

create table if not exists duvidas (
  id         uuid primary key default gen_random_uuid(),
  turma_id   uuid not null references turmas(id) on delete cascade,
  autor_id   uuid not null references usuarios(id) on delete cascade,
  conteudo   text not null,
  resposta   text,
  respondida boolean not null default false,
  destaque   boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_duvidas_turma on duvidas (turma_id);

create table if not exists duvida_upvotes (
  duvida_id  uuid not null references duvidas(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (duvida_id, usuario_id)
);

-- Tarefas e fornecedores ---------------------------------------------------

create table if not exists tarefas (
  id             uuid primary key default gen_random_uuid(),
  turma_id       uuid not null references turmas(id) on delete cascade,
  titulo         varchar(255) not null,
  descricao      text,
  status         varchar(20) not null default 'pendente'
                 check (status in ('pendente', 'em_andamento', 'concluida')),
  responsavel_id uuid references usuarios(id) on delete set null,
  prazo          date,
  created_at     timestamptz not null default now()
);
create index if not exists idx_tarefas_turma on tarefas (turma_id);

-- Vitrine de terceiros: fornecedores cadastrados pelo administrador da turma.
create table if not exists fornecedores (
  id         uuid primary key default gen_random_uuid(),
  nome       varchar(255) not null,
  categoria  varchar(100) not null,
  descricao  text,
  contato    varchar(255),
  imagem_url text,
  created_at timestamptz not null default now()
);
-- Bancos criados antes desta coluna a recebem aqui.
alter table fornecedores
  add column if not exists turma_id uuid references turmas(id) on delete cascade;
create index if not exists idx_fornecedores_turma on fornecedores (turma_id);

-- Orçamento: valor combinado com o fornecedor e status da negociação. Visível
-- só para administradores (a página de terceiros filtra isso na consulta).
alter table fornecedores add column if not exists valor_orcado numeric(10, 2);
alter table fornecedores add column if not exists status varchar(20)
  not null default 'cotando' check (status in ('cotando', 'contratado', 'descartado'));

-- Programação oficial da festa, exibida no dashboard.
create table if not exists programacao (
  id         uuid primary key default gen_random_uuid(),
  turma_id   uuid not null references turmas(id) on delete cascade,
  horario    timestamptz not null,
  titulo     varchar(255) not null,
  descricao  text,
  created_at timestamptz not null default now()
);
create index if not exists idx_programacao_turma on programacao (turma_id, horario);

-- Códigos de convite errados por usuário, para limitar tentativas de adivinhar.
create table if not exists tentativas_convite (
  id         bigserial primary key,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists idx_tentativas_convite_usuario
  on tentativas_convite (usuario_id, created_at);
