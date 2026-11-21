import type { Metadata } from "next";
import { RefreshCw, RotateCw, UserMinus, X } from "lucide-react";
import { alterarPapel, regenerarConvite, removerMembro } from "@/actions/admin";
import { alternarTesouraria } from "@/actions/tesouraria";
import type { EstadoForm } from "@/actions/tipos";
import { ROTULO_PAPEL } from "@/lib/papeis";
import { removerConvite, reenviarConvite } from "@/actions/convites";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { BotaoConvite } from "@/components/features/botao-convite";
import { BotaoCopiar } from "@/components/features/botao-copiar";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { CampoBusca } from "@/components/features/campo-busca";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { ConvidarPorEmail } from "@/components/features/form-convites-lista";
import { AcaoDialogo, MenuAcoes } from "@/components/features/menu-acoes";
import { MenuGestao, type ConfirmacaoMenu } from "@/components/features/menu-gestao";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { Paginacao } from "@/components/features/paginacao";
import { EquipeAmico } from "@/components/ilustracoes/equipe-amico";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listarMembrosAdmin } from "@/lib/admin";
import { lerBusca } from "@/lib/busca";
import { formatarDataHora } from "@/lib/datas";
import { exigirAdmin } from "@/lib/dal";
import { pool } from "@/lib/db";
import { formatarReal } from "@/lib/orcamento";
import { lerPagina } from "@/lib/paginacao";

export const metadata: Metadata = { title: "Membros" };

// A action da tesouraria não devolve estado; a confirmação do menu precisa de
// um texto para o toast (e de fechar o diálogo).
async function tesouraria(_: EstadoForm, dados: FormData): Promise<EstadoForm> {
  "use server";
  await alternarTesouraria(dados);
  return { ok: "Tesouraria atualizada." };
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

// Membros da turma: uma linha por pessoa e um "⋯" com as mudanças de papel
// (D-05). Antes eram até quatro botões do mesmo peso por pessoa — numa turma de
// 40, uns 160 botões e dezenas de paradas no D-pad. Toda mudança de poder
// (papel, observador, tesouraria) agora pede confirmação (P-16).
export default async function MembrosPage({ searchParams }: PageProps<"/admin/membros">) {
  const admin = await exigirAdmin();
  const { busca: buscaParametro, pagina: paginaParametro } = await searchParams;
  const busca = lerBusca(buscaParametro);
  const [{ rows: membros }, { itens: rows, pagina, totalPaginas, totais, encontrados }, { rows: convidados }] =
    await Promise.all([
      pool.query("select codigo_convite from turmas where id = $1", [admin.turmaId]),
      listarMembrosAdmin(admin.turmaId, {
        busca,
        pagina: lerPagina(paginaParametro),
      }),
      // Convidados por lista que ainda não entraram (ADR-0007).
      pool.query(
        `select email, nome, enviado_em as "enviadoEm",
                enviado_em < now() - interval '1 day' as "podeReenviar"
           from convites_email where turma_id = $1 order by enviado_em desc`,
        [admin.turmaId],
      ),
    ]);
  const codigo: string = membros[0].codigo_convite;
  const totalAdmins = totais.admins;
  const observadores = totais.observadores;
  const participantes = totais.membros - totalAdmins - observadores;

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        titulo="Membros"
        descricao={[
          `${plural(totais.membros, "membro", "membros")} na turma`,
          plural(totalAdmins, "administrador", "administradores"),
          plural(participantes, "participante", "participantes"),
          observadores > 0 ? plural(observadores, "observador", "observadores") : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        acao={<ConvidarPorEmail desligado={!!admin.arquivadaEm} />}
      />

      {/* O código é o caminho mais comum para entrar: fica compacto, com
          "Copiar mensagem de convite" à vista. Trocar o código é raro e
          invalida o atual, então vai para o "⋯". */}
      <section aria-labelledby="titulo-convite" className="mt-6 rounded-xl border px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="min-w-0 flex-1 basis-48">
            <h2 id="titulo-convite" className="text-sm text-muted-foreground">
              Código de convite
            </h2>
            <p className="font-mono text-2xl font-semibold tracking-[0.2em] break-all">{codigo}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BotaoConvite nomeTurma={admin.turmaNome} codigo={codigo} />
            <BotaoCopiar texto={codigo} rotulo="Copiar código" variante="outline" />
            <MenuAcoes nome="código de convite">
              <AcaoDialogo
                rotulo="Gerar novo código"
                icone={<RefreshCw aria-hidden />}
                titulo="Gerar um novo código"
                descricao="O código anterior deixa de funcionar. Quem já entrou continua na turma."
                acao={regenerarConvite}
                rotuloSubmit="Gerar novo código"
                rotuloPendente="Gerando…"
              />
            </MenuAcoes>
          </div>
        </div>
        {convidados.length > 0 && (
          <PainelRecolhivel className="mt-3 border-t pt-3">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium pointer-coarse:min-h-11">
              Convidados que ainda não entraram ({convidados.length})
            </summary>
            <ul className="mt-2 divide-y text-sm">
              {convidados.map((c) => (
                <li key={c.email} data-convidado={c.email} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                  <span className="min-w-0 flex-1 truncate">
                    {c.nome ? `${c.nome} · ` : ""}
                    {c.email}
                  </span>
                  <span className="text-xs text-muted-foreground">enviado em {formatarDataHora.format(c.enviadoEm)}</span>
                  {!admin.arquivadaEm && (
                    <span className="flex gap-1">
                      {c.podeReenviar && (
                        <form action={reenviarConvite}>
                          <input type="hidden" name="email" value={c.email} />
                          <Button type="submit" size="sm" variant="outline">
                            <RotateCw aria-hidden /> Reenviar
                          </Button>
                        </form>
                      )}
                      <form action={removerConvite}>
                        <input type="hidden" name="email" value={c.email} />
                        <Button
                          type="submit"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Tirar ${c.email} da lista`}
                          title={`Tirar ${c.email} da lista`}
                        >
                          <X aria-hidden />
                        </Button>
                      </form>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Reenvio no máximo uma vez por dia. O endereço some quando a pessoa entra, ou em 90 dias.
            </p>
          </PainelRecolhivel>
        )}
      </section>

      <CampoBusca
        acao="/admin/membros"
        valor={busca}
        placeholder="Buscar por nome ou email"
        rotulo="Buscar membro por nome ou email"
        className="mt-6"
      />
      {busca && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {encontrados} {encontrados === 1 ? "membro encontrado" : "membros encontrados"} para “{busca}”.
        </p>
      )}

      {rows.length === 0 ? (
        <EstadoVazio
          className="mt-4"
          descricao="Confira o nome ou o email e tente de novo."
          ilustracao={<EquipeAmico />}
          titulo="Nenhum membro encontrado"
        />
      ) : (
        <ul data-grupo className="mt-4 divide-y rounded-xl border">
          {rows.map((m) => {
            const ehVoce = m.id === admin.usuarioId;
            const ultimoAdmin = m.papel === "admin" && totalAdmins === 1;
            const confirmacoes: ConfirmacaoMenu[] = [];
            if (!ultimoAdmin) {
              confirmacoes.push({
                rotulo: m.papel === "admin" ? "Tornar participante" : "Promover",
                titulo: m.papel === "admin" ? `Tornar ${m.name} participante?` : `Promover ${m.name}?`,
                descricao:
                  m.papel === "admin"
                    ? `${m.name} deixa de ser administrador e vira participante.`
                    : `Promover ${m.name} a administrador. Administradores gerenciam a turma inteira.`,
                acao: alterarPapel,
                campos: { usuarioId: m.id, papel: m.papel === "admin" ? "participante" : "admin" },
                confirmar: m.papel === "admin" ? "Sim, tornar participante" : "Sim, promover",
              });
            }
            // Observador (ADR-0012): professor ou orientador que acompanha sem
            // votar e sem pagar. A troca passa por participante.
            if (m.papel !== "admin") {
              const volta = m.papel === "observador";
              confirmacoes.push({
                rotulo: volta ? "Voltar a participante" : "Tornar observador",
                titulo: volta ? `${m.name} volta a participante?` : `Tornar ${m.name} observador?`,
                descricao: volta
                  ? `${m.name} volta a votar, a contar no quórum e a ter parcelas.`
                  : `${m.name} passa a acompanhar a turma sem votar e sem pagar: sai do quórum, das parcelas e dos lembretes de prazo. Continua vendo tudo e confirmando a própria presença. Os votos de ${m.name} em perguntas ainda abertas serão apagados. Para professor, orientador ou coordenador.`,
                acao: alterarPapel,
                campos: { usuarioId: m.id, papel: volta ? "participante" : "observador" },
                confirmar: volta ? "Sim, voltar a participante" : "Sim, tornar observador",
              });
            }
            // Só admin cuida do dinheiro (ADR-0005). Quem é tesouraria vê e
            // lança quanto cada pessoa pagou.
            if (m.papel === "admin") {
              const rotulo = m.tesouraria ? "Tirar da tesouraria" : "Pôr na tesouraria";
              confirmacoes.push({
                rotulo,
                titulo: `${rotulo}: ${m.name}?`,
                descricao: m.tesouraria
                  ? `${m.name} deixa de ver e lançar os pagamentos de cada pessoa.`
                  : `${m.name} passa a ver e lançar os pagamentos de cada pessoa da turma.`,
                acao: tesouraria,
                campos: { usuarioId: m.id },
                confirmar: m.tesouraria ? "Sim, tirar da tesouraria" : "Sim, pôr na tesouraria",
              });
            }
            return (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                <AvatarUsuario nome={m.name} imagem={m.image} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium">
                    <span className="truncate">{m.name}</span>
                    {ehVoce && <span className="font-normal text-muted-foreground">(você)</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  {/* Papel embaixo do nome: no celular, ao lado, espremia o email. */}
                  <p className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant={m.papel === "admin" ? "default" : "secondary"}>{ROTULO_PAPEL[m.papel]}</Badge>
                    {m.tesouraria && <Badge variant="outline">Tesouraria</Badge>}
                  </p>
                </div>
                {(confirmacoes.length > 0 || !ehVoce) && (
                  <MenuGestao
                    nome={m.name}
                    confirmacoes={confirmacoes}
                    excluir={
                      ehVoce
                        ? undefined
                        : {
                            acao: removerMembro,
                            campos: { usuarioId: m.id },
                            alvo: "o membro",
                            nome: `${m.name} (${m.email})`,
                            aviso:
                              m.pagou > 0
                                ? `Some da turma junto com o que deixou nela: votos, dúvidas e presença. ${
                                    admin.tesouraria
                                      ? `Pagou ${formatarReal.format(m.pagou)}: `
                                      : "Tem pagamentos registrados: "
                                  }os confirmados continuam no caixa da turma, sem o nome. Se houver devolução, a tesouraria deve lançar antes.`
                                : "Some da turma junto com o que deixou nela: votos, dúvidas, confirmações de presença e votos nas dúvidas dos outros.",
                            rotulo: "Remover",
                            icone: <UserMinus aria-hidden />,
                            sucesso: "Membro removido.",
                          }
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/admin/membros"
        parametros={{ busca: busca || undefined }}
      />
    </div>
  );
}
