"use client";

import { useActionState } from "react";
import { Eye, LoaderCircle, Send } from "lucide-react";
import { convidarPorLista } from "@/actions/convites";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
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
          {pendente ? <LoaderCircle className="animate-spin" aria-hidden /> : <Send aria-hidden />}
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
