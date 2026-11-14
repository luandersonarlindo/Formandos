"use client";

import { useActionState } from "react";
import { Eye, FileUp, LoaderCircle } from "lucide-react";
import { importarPagamentos } from "@/actions/tesouraria";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};

// "Importar da planilha" (ADR-0014): primeiro a prévia (quantos lançamentos,
// quanto somam, que linhas têm problema), depois a importação. Os dois botões
// mandam o mesmo formulário com `etapa` diferente.
export function FormImportarPagamentos() {
  const [estado, acao, pendente] = useActionState(importarPagamentos, inicial);
  // Depois de importar a caixa volta vazia; na prévia e no erro, mantém o texto.
  const texto = estado.ok?.startsWith("Importado") ? "" : (estado.valores?.planilha ?? "");

  return (
    <form action={acao} className="grid gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="planilha-pagamentos">Pagamentos, um por linha</Label>
        <Textarea
          key={estado.ok ?? estado.erro ?? "inicio"}
          id="planilha-pagamentos"
          name="planilha"
          rows={6}
          defaultValue={texto}
          placeholder={"ana@email.com; 150,00; 10/03/2026; pix; Pai da Ana; Parcela 1\nbruno@email.com; 300,00; 12/03/2026"}
          className="font-mono text-sm [field-sizing:fixed]"
          aria-describedby="planilha-ajuda"
          required
        />
        <p id="planilha-ajuda" className="text-xs text-muted-foreground">
          Copie as linhas da sua planilha e cole aqui. Colunas, nesta ordem: <strong>email</strong>,{" "}
          <strong>valor</strong>, <strong>data</strong>, forma, quem pagou, referência. As três primeiras são
          obrigatórias. Separadas por tabulação (como sai da planilha) ou por ponto e vírgula. Até 500 linhas.
          Colar de novo não duplica: o que já está lançado fica de fora.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" name="etapa" value="previa" variant="outline" size="sm" disabled={pendente}>
          <Eye aria-hidden /> Ver prévia
        </Button>
        <Button type="submit" name="etapa" value="importar" size="sm" disabled={pendente}>
          {pendente ? <LoaderCircle className="animate-spin" aria-hidden /> : <FileUp aria-hidden />}
          Importar
        </Button>
      </div>
      <p
        role={estado.erro ? "alert" : "status"}
        className={
          estado.erro
            ? "text-sm whitespace-pre-line text-destructive wrap-break-word"
            : "text-sm whitespace-pre-line text-muted-foreground"
        }
      >
        {estado.erro ?? estado.ok}
      </p>
    </form>
  );
}
