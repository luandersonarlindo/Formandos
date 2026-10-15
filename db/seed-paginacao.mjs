// Seed de TESTE para ver a paginação funcionando nas 6 telas.
// Cria dados marcados (emails @example.com, códigos TESTE-*) em volume que
// força 2+ páginas em cada lista. Idempotente: roda de novo sem duplicar.
// Uso: node --env-file=.env.local db/seed-paginacao.mjs         (sobe)
//      node --env-file=.env.local db/seed-paginacao.mjs --down   (apaga tudo)
// Senha de todos os usuários de teste: Teste123!
// NÃO apaga sem ordem explícita: os dados ficam até o teste terminar.
import pg from "pg";
import { hashPassword } from "better-auth/crypto";

const SENHA = "Teste123!";
const DOMINIO = "example.com";
const down = process.argv.includes("--down");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

async function acharOuCriarUsuario(email, nome) {
  const { rows } = await client.query("select id from usuarios where email = $1", [
    email,
  ]);
  if (rows.length > 0) return { id: rows[0].id, novo: false };
  const hash = await hashPassword(SENHA);
  const {
    rows: [u],
  } = await client.query(
    `insert into usuarios (name, email, "emailVerified", consentimento_em)
     values ($1, $2, true, now()) returning id`,
    [nome, email],
  );
  await client.query(
    `insert into account ("accountId", "providerId", "userId", password, "updatedAt")
     values ($1, 'credential', $2, $3, now())`,
    [u.id, u.id, hash],
  );
  return { id: u.id, novo: true };
}

async function acharOuCriarTurma(codigo, nome, criadoPor) {
  const { rows } = await client.query(
    "select id from turmas where codigo_convite = $1",
    [codigo],
  );
  if (rows.length > 0) return { id: rows[0].id, nova: false };
  const {
    rows: [t],
  } = await client.query(
    "insert into turmas (nome, codigo_convite, criado_por) values ($1, $2, $3) returning id",
    [nome, codigo, criadoPor],
  );
  return { id: t.id, nova: true };
}

if (down) {
  console.log("Apagando dados de teste (tag TESTE- / @example.com)...");
  const n = { auditoria: 0, turmas: 0, usuarios: 0 };
  // Auditoria primeiro: o FK faz SET NULL e perderíamos o rastro de quem era teste.
  {
    const { rowCount } = await client.query(
      `delete from auditoria where usuario_id in
       (select id from usuarios where email like '%@${DOMINIO}')`,
    );
    n.auditoria = rowCount;
  }
  // Turmas de teste: a cascata leva membros, presenças, dúvidas (+upvotes),
  // avisos, tarefas e fornecedores junto.
  {
    const { rowCount } = await client.query(
      "delete from turmas where codigo_convite like 'TESTE-%'",
    );
    n.turmas = rowCount;
  }
  // Usuários de teste: a cascata leva account, session e vínculos restantes.
  {
    const { rowCount } = await client.query(
      `delete from usuarios where email like '%@${DOMINIO}'`,
    );
    n.usuarios = rowCount;
  }
  console.log(`Apagados: ${n.auditoria} auditoria, ${n.turmas} turmas, ${n.usuarios} usuários.`);
  await client.end();
  process.exit(0);
}

const novos = { usuarios: 0, turmas: 0, membros: 0, duvidas: 0, avisos: 0, presencas: 0 };

try {
  await client.query("begin");

  // 1. Admin da turma de teste + 25 membros (26 pessoas: membros e presença
  //    paginam de 20 em 20, então dá 2 páginas em cada tela).
  const admin = await acharOuCriarUsuario(
    `admin-teste@${DOMINIO}`,
    "Admin Teste Paginação",
  );
  if (admin.novo) novos.usuarios++;
  const membrosIds = [];
  for (let i = 1; i <= 25; i++) {
    const m = await acharOuCriarUsuario(
      `membro-${String(i).padStart(2, "0")}@${DOMINIO}`,
      `Membro Teste ${String(i).padStart(2, "0")}`,
    );
    if (m.novo) novos.usuarios++;
    membrosIds.push(m.id);
  }

  // 1b. Usuário master de teste (só funciona se o email estiver em
  // ADMIN_MASTER_EMAILS; ver instruções no fim). Não entra em turma nenhuma.
  const master = await acharOuCriarUsuario(
    `master-teste@${DOMINIO}`,
    "Master Teste Paginação",
  );
  if (master.novo) novos.usuarios++;
  //    27 no total com a que já existe dá 2 páginas; 30 usuários dá 2 páginas).
  // 2. Turma principal + 25 turmas extras (master lista turmas de 20 em 20;
  const turma = await acharOuCriarTurma("TESTE-PAG", "Turma Teste Paginação", admin.id);
  if (turma.nova) novos.turmas++;
  for (let i = 1; i <= 25; i++) {
    const t = await acharOuCriarTurma(
      `TESTE-M${String(i).padStart(2, "0")}`,
      `Turma Teste Master ${String(i).padStart(2, "0")}`,
      admin.id,
    );
    if (t.nova) novos.turmas++;
  }

  // 3. Vínculos: admin + 25 membros na turma principal.
  for (const [usuarioId, papel] of [
    [admin.id, "admin"],
    ...membrosIds.map((id) => [id, "participante"]),
  ]) {
    const { rowCount } = await client.query(
      `insert into membros (turma_id, usuario_id, papel) values ($1, $2, $3)
       on conflict do nothing`,
      [turma.id, usuarioId, papel],
    );
    novos.membros += rowCount;
  }

  // 4. Presenças variadas nos membros (a lista pagina sobre membros).
  const status = ["vou", "vou", "vou", "talvez", "nao"];
  for (const [i, usuarioId] of membrosIds.entries()) {
    if (i >= 16) break; // 16 com status + 10 pendentes: filtros com dados.
    const { rowCount } = await client.query(
      `insert into presencas (turma_id, usuario_id, status, acompanhantes)
       values ($1, $2, $3, $4) on conflict do nothing`,
      [turma.id, usuarioId, status[i % status.length], i % 3],
    );
    novos.presencas += rowCount;
  }

  // 5. 25 dúvidas (10 por página = 3 páginas), algumas respondidas/destaque.
  for (let i = 1; i <= 25; i++) {
    const { rowCount } = await client.query(
      `insert into duvidas (turma_id, autor_id, conteudo, resposta, respondida, destaque)
       select $1, $2, $3, $4, $5, $6
        where not exists
          (select 1 from duvidas where turma_id = $1 and conteudo = $3::text)`,
      [
        turma.id,
        membrosIds[(i - 1) % membrosIds.length],
        `Dúvida de teste ${String(i).padStart(2, "0")}: como funciona a paginação?`,
        i % 3 === 0 ? "Resposta oficial de teste: passando de 10 itens, aparece a página 2." : null,
        i % 3 === 0,
        i % 7 === 0,
      ],
    );
    novos.duvidas += rowCount;
  }

  // 6. 15 avisos (10 por página = 2 páginas).
  for (let i = 1; i <= 15; i++) {
    const { rowCount } = await client.query(
      `insert into avisos (turma_id, autor_id, titulo, conteudo)
       select $1, $2, $3, $4
        where not exists
          (select 1 from avisos where turma_id = $1 and titulo = $3::varchar)`,
      [
        turma.id,
        admin.id,
        `Aviso de teste ${String(i).padStart(2, "0")}`,
        "Conteúdo de teste para ver a paginação do mural de avisos funcionando.",
      ],
    );
    novos.avisos += rowCount;
  }

  // 7. 12 tarefas (10 por página = 2 páginas no "Todas") e 12 fornecedores
  // (idem), distribuídos em status/categorias para os filtros terem dados.
  const statusTarefa = ["pendente", "em_andamento", "concluida"];
  for (let i = 1; i <= 12; i++) {
    const titulo = `Tarefa de teste ${String(i).padStart(2, "0")}`;
    const { rowCount } = await client.query(
      `insert into tarefas (turma_id, titulo, descricao, status, responsavel_id)
       select $1, $2, $3, $4, $5
        where not exists
          (select 1 from tarefas where turma_id = $1 and titulo = $2::varchar)`,
      [
        turma.id,
        titulo,
        "Descrição de teste para ver a paginação de tarefas funcionando.",
        statusTarefa[i % 3],
        membrosIds[(i - 1) % membrosIds.length],
      ],
    );
    novos.tarefas = (novos.tarefas ?? 0) + rowCount;
  }
  const categorias = ["Buffet", "Decoração", "Fotografia e vídeo", "Música e DJ"];
  for (let i = 1; i <= 12; i++) {
    const nome = `Fornecedor de teste ${String(i).padStart(2, "0")}`;
    const { rowCount } = await client.query(
      `insert into fornecedores (turma_id, nome, categoria, descricao, contato)
       select $1, $2, $3, $4, $5
        where not exists
          (select 1 from fornecedores where turma_id = $1 and nome = $2::varchar)`,
      [
        turma.id,
        nome,
        categorias[i % categorias.length],
        "Descrição de teste para ver a paginação de terceiros funcionando.",
        `contato${i}@example.com`,
      ],
    );
    novos.fornecedores = (novos.fornecedores ?? 0) + rowCount;
  }

  await client.query("commit");
  console.log(
    `Seed paginação ok: +${novos.usuarios} usuários, +${novos.turmas} turmas, ` +
      `+${novos.membros} membros, +${novos.presencas} presenças, ` +
      `+${novos.duvidas} dúvidas, +${novos.avisos} avisos, ` +
      `+${novos.tarefas ?? 0} tarefas, +${novos.fornecedores ?? 0} fornecedores. ` +
      `Senha: ${SENHA}`,
  );
} catch (erro) {
  await client.query("rollback");
  throw erro;
} finally {
  await client.end();
}
