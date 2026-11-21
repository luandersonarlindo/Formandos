import type { Metadata } from "next";
import Link from "next/link";
import { MailWarning, ShieldCheck, Trash2 } from "lucide-react";
import { excluirUsuario } from "@/actions/master";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import { CabecalhoPagina } from "@/components/features/cabecalho-pagina";
import { CampoBusca } from "@/components/features/campo-busca";
import { EstadoVazio } from "@/components/features/estado-vazio";
import { AcaoExcluir, MenuAcoes } from "@/components/features/menu-acoes";
import { Paginacao } from "@/components/features/paginacao";
import { EquipeAmico } from "@/components/ilustracoes/equipe-amico";
import { Badge } from "@/components/ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { lerBusca } from "@/lib/busca";
import { exigirMaster } from "@/lib/dal";
import { emailsMaster } from "@/lib/master";
import { lerPagina } from "@/lib/paginacao";
import { ROTULO_PAPEL } from "@/lib/papeis";
import { listarUsuarios } from "@/lib/plataforma";

export const metadata: Metadata = { title: "Usuários" };

// Usuários da plataforma, vistos pelo master. Uma linha por conta; as turmas
// são links para a turma (onde se troca o papel). "Excluir usuário" é raro e
// irreversível: fica no "⋯" e continua pedindo o email digitado (LGPD).
export default async function UsuariosMasterPage({ searchParams }: PageProps<"/master/usuarios">) {
  const master = await exigirMaster();
  const { busca: buscaParametro, pagina: paginaParametro } = await searchParams;
  const busca = lerBusca(buscaParametro);
  const { itens: usuarios, total, pagina, totalPaginas } = await listarUsuarios(lerPagina(paginaParametro), { busca });
  const masters = emailsMaster();

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <CabecalhoPagina
        titulo="Usuários"
        descricao={`${total} ${total === 1 ? "usuário cadastrado" : "usuários cadastrados"}.`}
      />

      <CampoBusca
        className="mt-6"
        acao="/master/usuarios"
        valor={busca}
        placeholder="Buscar por nome ou email"
        rotulo="Buscar usuário por nome ou email"
      />
      {busca && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {total} {total === 1 ? "usuário encontrado" : "usuários encontrados"} para “{busca}”.
        </p>
      )}

      {usuarios.length === 0 ? (
        <EstadoVazio
          className="mt-6"
          ilustracao={<EquipeAmico />}
          titulo="Nenhum usuário encontrado"
          descricao="Confira o nome ou o email e tente de novo."
        />
      ) : (
        <ul data-grupo className="mt-4 divide-y rounded-lg border">
          {usuarios.map((u) => {
            const ehMasterAlvo = masters.includes(u.email.toLowerCase());
            const podeExcluir = u.id !== master.id && !ehMasterAlvo;
            return (
              <Item asChild key={u.id}>
                <li data-usuario={u.email} className="rounded-none not-first:border-t-border">
                  <ItemMedia>
                    <AvatarUsuario nome={u.name} imagem={u.image} className="size-10" />
                  </ItemMedia>
                  <ItemContent className="min-w-0 basis-56">
                    <ItemTitle className="max-w-full">
                      <span className="truncate">{u.name}</span>
                      {u.id === master.id && <span className="font-normal text-muted-foreground">(você)</span>}
                    </ItemTitle>
                    <ItemDescription className="truncate">{u.email}</ItemDescription>
                    <ItemDescription className="line-clamp-none text-xs">
                      {u.turmas.length > 0 ? (
                        u.turmas.map((t, i) => (
                          <span key={t.id}>
                            {i > 0 && " · "}
                            <Link href={`/master/turmas/${t.id}`} className="underline underline-offset-4 hover:text-foreground">{t.nome}</Link> ({ROTULO_PAPEL[t.papel].toLowerCase()})
                          </span>
                        ))
                      ) : (
                        "Sem turma"
                      )}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="flex-wrap">
                    {ehMasterAlvo && (
                      <Badge>
                        <ShieldCheck aria-hidden /> Master
                      </Badge>
                    )}
                    {!u.emailVerificado && (
                      <Badge variant="outline">
                        <MailWarning aria-hidden /> Email não confirmado
                      </Badge>
                    )}
                    {podeExcluir && (
                      <MenuAcoes nome={u.name}>
                        <AcaoExcluir
                          acao={excluirUsuario}
                          campos={{ usuarioId: u.id }}
                          alvo="o usuário"
                          nome={u.name}
                          aviso="Apaga a conta, a participação e os votos e dúvidas dessa pessoa."
                          rotulo="Excluir usuário"
                          icone={<Trash2 aria-hidden />}
                          sucesso="Usuário excluído."
                          confirmacao={{
                            rotulo: (
                              <>
                                Digite o email, <strong>{u.email}</strong>, para confirmar
                              </>
                            ),
                            esperado: u.email,
                          }}
                        />
                      </MenuAcoes>
                    )}
                  </ItemActions>
                </li>
              </Item>
            );
          })}
        </ul>
      )}
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        caminho="/master/usuarios"
        parametros={{ busca: busca || undefined }}
      />
    </div>
  );
}
