"use client";

import * as React from "react";
import { useActionState } from "react";
import { Ellipsis, ShieldCheck, ShieldOff, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { alterarPapelMaster, removerMembroMaster } from "@/actions/master";
import type { EstadoForm } from "@/actions/tipos";
import { ConfirmarExclusao } from "@/components/features/confirmar-exclusao";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

const inicial: EstadoForm = {};

// Menu "⋯" de um membro na tela da turma do master (P-16 do plano de UX).
// Trocar o papel pede confirmação num AlertDialog de verdade: a action não tem
// "desfazer", e antes isso era um FormDialog sem campo nenhum, só com o botão
// de enviar. Remover usa o ConfirmarExclusao, como as outras exclusões.
//
// Não é o MenuAcoes porque ele não tem um item que abra um AlertDialog que não
// seja de exclusão (o botão de confirmar lá é vermelho e diz "Excluindo…").
// O gatilho leva o mesmo data-menu-acoes, para os testes acharem do mesmo jeito.
export function AcoesMembroMaster({
  turmaId,
  usuarioId,
  nome,
  admin,
}: {
  turmaId: string;
  usuarioId: string;
  nome: string;
  /** Papel atual é admin: a troca vai para participante; senão, para admin. */
  admin: boolean;
}) {
  const [aberto, setAberto] = React.useState<"papel" | "remover" | null>(null);
  const [estado, acao, pendente] = useActionState(alterarPapelMaster, inicial);

  React.useEffect(() => {
    if (!estado.ok) return;
    toast.success(admin ? `${nome} agora é participante.` : `${nome} agora é administrador.`);
    setAberto(null);
    // Só a resposta da action importa; nome e admin mudam junto com ela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Ações de ${nome}`}
            title={`Ações de ${nome}`}
            className="shrink-0"
            data-menu-acoes={nome}
          >
            <Ellipsis aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onSelect={() => setAberto("papel")}>
            {admin ? <ShieldOff aria-hidden /> : <ShieldCheck aria-hidden />}
            {admin ? "Tornar participante" : "Promover a administrador"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setAberto("remover")}>
            <UserMinus aria-hidden />
            Remover da turma
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={aberto === "papel"} onOpenChange={(v) => setAberto(v ? "papel" : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{admin ? "Tornar participante?" : "Promover a administrador?"}</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground wrap-break-word">{nome}</span>
              {admin
                ? " deixa de ser administrador e passa a ver a turma como participante."
                : " passa a gerir a turma: membros, votações, evento e avisos."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form action={acao} className="flex flex-col gap-3">
            <input type="hidden" name="turmaId" value={turmaId} />
            <input type="hidden" name="usuarioId" value={usuarioId} />
            <input type="hidden" name="papel" value={admin ? "participante" : "admin"} />
            {estado.erro && (
              <p role="alert" className="text-sm text-destructive">
                {estado.erro}
              </p>
            )}
            <AlertDialogFooter>
              <Button type="button" variant="outline" disabled={pendente} onClick={() => setAberto(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pendente}>
                {pendente && <Spinner />}
                {pendente ? "Salvando…" : admin ? "Sim, tornar participante" : "Sim, promover"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      <ConfirmarExclusao
        semGatilho
        aberto={aberto === "remover"}
        onAbertoChange={(v) => setAberto(v ? "remover" : null)}
        acao={removerMembroMaster}
        campos={{ turmaId, usuarioId }}
        alvo="o membro"
        verb="Remover"
        nome={nome}
        aviso="Perde o acesso à turma e recebe um email avisando."
        rotulo="Remover da turma"
        confirmar="Sim, remover"
        sucesso={`${nome} saiu da turma.`}
      />
    </>
  );
}
