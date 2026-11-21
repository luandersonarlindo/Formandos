"use client";

import { useActionState, useState } from "react";
import { Eye, MailPlus, Send } from "lucide-react";
import { convidarPorLista } from "@/actions/convites";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};

// "Convidar por lista" (ADR-0007): primeiro a prévia (quantos novos, quantos já
// são membros, que linhas têm problema), depois o envio. Os dois botões mandam
// o mesmo formulário com `etapa` diferente.
export function FormConvitesLista() {
  const [estado, acao, pendente] = useActionState(convidarPorLista, inicial);
  // Depois do envio a caixa volta vazia; na prévia e no erro, mantém o texto.
  const texto = estado.ok?.startsWith("Convites enviados") ? "" : (estado.valores?.lista ?? "");

  return (
    <form action={acao} className="grid gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lista-convites">Emails, um por linha</Label>
        <Textarea
          key={estado.ok ?? estado.erro ?? "inicio"}
          id="lista-convites"
          name="lista"
          rows={6}
          defaultValue={texto}
          placeholder={"ana@email.com\nBruno Lima; bruno@email.com"}
          className="font-mono text-sm [field-sizing:fixed]"
          required
        />
        <p className="text-xs text-muted-foreground">
          Pode colar direto da planilha: só o email, ou nome e email separados por ponto e vírgula, vírgula ou
          tabulação. Até 200 por vez. Ninguém entra na turma sem tocar no link do convite.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" name="etapa" value="previa" variant="outline" size="sm" disabled={pendente}>
          <Eye aria-hidden /> Ver prévia
        </Button>
        <Button type="submit" name="etapa" value="enviar" size="sm" disabled={pendente}>
          {pendente ? <Spinner /> : <Send aria-hidden />}
          Enviar convites
        </Button>
      </div>
      <p
        role={estado.erro ? "alert" : "status"}
        className={estado.erro ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
      >
        {estado.erro ?? estado.ok}
      </p>
    </form>
  );
}

// Ação primária de /admin/membros: abre a lista num diálogo. O diálogo não usa
// o FormDialog porque o formulário tem dois botões (prévia e envio) e a
// mensagem da prévia precisa ficar à vista, com o diálogo aberto.
export function ConvidarPorEmail({ desligado = false }: { desligado?: boolean }) {
  const [aberto, setAberto] = useState(false);
  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button type="button" disabled={desligado}>
          <MailPlus aria-hidden /> Convidar por email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Convidar por email</DialogTitle>
          <DialogDescription>
            Cole os emails da turma e cada pessoa recebe o link de convite. Ninguém ganha conta nem entra sem tocar
            no link.
          </DialogDescription>
        </DialogHeader>
        <FormConvitesLista />
      </DialogContent>
    </Dialog>
  );
}
