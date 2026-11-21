"use client";

import { useActionState, useState } from "react";
import { Eye, FileUp } from "lucide-react";
import { importarPagamentos } from "@/actions/tesouraria";
import type { EstadoForm } from "@/actions/tipos";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};

// "Importar da planilha" (ADR-0014): primeiro a prévia (quantos lançamentos,
// quanto somam, que linhas têm problema), depois a importação. Os dois botões
// mandam o mesmo formulário com `etapa` diferente.
//
// "Importar" só libera depois de uma prévia sem problema, e volta a travar se o
// texto mudar depois dela: antes dava para importar sem ter visto nada. A regra
// do servidor não muda (com qualquer linha com problema, nada é importado).
export function FormImportarPagamentos() {
  const [estado, acao, pendente] = useActionState(importarPagamentos, inicial);
  // Guarda a resposta que estava na tela quando o texto mudou: uma resposta
  // nova (outra prévia) vale para o texto enviado e destrava de novo.
  const [mudouEm, setMudouEm] = useState<EstadoForm | null>(null);
  const mudou = mudouEm === estado;
  // Depois de importar a caixa volta vazia; na prévia e no erro, mantém o texto.
  const texto = estado.ok?.startsWith("Importado") ? "" : (estado.valores?.planilha ?? "");
  const previaOk = !!estado.ok?.startsWith("Prévia") && !mudou;
  const quantos = previaOk ? estado.ok?.match(/^Prévia: (\d+) /)?.[1] : undefined;

  return (
    <form action={acao} className="grid gap-3">
      <Field>
        <FieldLabel htmlFor="planilha-pagamentos">Pagamentos, um por linha</FieldLabel>
        <Textarea
          key={estado.ok ?? estado.erro ?? "inicio"}
          id="planilha-pagamentos"
          name="planilha"
          rows={6}
          defaultValue={texto}
          onChange={() => setMudouEm(estado)}
          placeholder={"ana@email.com; 150,00; 10/03/2026; pix; Pai da Ana; Parcela 1\nbruno@email.com; 300,00; 12/03/2026"}
          className="font-mono text-sm [field-sizing:fixed]"
          aria-describedby="planilha-ajuda"
          required
        />
      </Field>
      <PainelRecolhivel className="text-sm">
        <summary className="w-fit cursor-pointer text-muted-foreground underline-offset-4 hover:text-foreground hover:underline pointer-coarse:min-h-11 pointer-coarse:content-center">
          Formato das colunas
        </summary>
        <p id="planilha-ajuda" className="mt-2 text-xs text-muted-foreground text-pretty">
          Copie as linhas da sua planilha e cole aqui. Colunas, nesta ordem: <strong>email</strong>,{" "}
          <strong>valor</strong>, <strong>data</strong>, forma, quem pagou, referência. As três primeiras são
          obrigatórias. Separadas por tabulação (como sai da planilha) ou por ponto e vírgula. Até 500 linhas.
          Colar de novo não duplica: o que já está lançado fica de fora.{" "}
          <a href="/admin/turma/exportar?tipo=membros" download className="underline underline-offset-4">
            Baixar a lista de membros com os emails
          </a>
          .
        </p>
      </PainelRecolhivel>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" name="etapa" value="previa" variant={previaOk ? "outline" : "default"} size="sm" disabled={pendente}>
          <Eye aria-hidden /> Ver prévia
        </Button>
        <Button
          type="submit"
          name="etapa"
          value="importar"
          variant={previaOk ? "default" : "outline"}
          size="sm"
          disabled={pendente || !previaOk}
          aria-describedby={previaOk ? undefined : "importar-trava"}
        >
          {pendente ? <Spinner /> : <FileUp aria-hidden />}
          {quantos ? `Importar ${quantos} ${quantos === "1" ? "lançamento" : "lançamentos"}` : "Importar"}
        </Button>
        {!previaOk && (
          <span id="importar-trava" className="text-xs text-muted-foreground">
            Veja a prévia antes de importar.
          </span>
        )}
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
