"use client";

import { CampoValor } from "@/components/features/campo-valor";
import * as React from "react";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { LancamentoDetalhe } from "@/lib/pagamentos";

type Tipo = LancamentoDetalhe["tipo"];

// Miolo de cliente do CamposLancamento (ver campos-lancamento.tsx). Os rótulos
// vêm por prop: lib/pagamentos é server-only e não pode entrar no bundle.
//
// Uma coluna no celular, duas a partir de 640px. "Tipo" tem só três opções,
// então aparecem todas de uma vez (ToggleGroup) em vez de uma lista fechada. O
// ToggleGroup do Radix é feito de botões e não manda nada no form; quem leva o
// valor para a Server Action é o input oculto `tipo`, sincronizado com ele.
// "Quem pagou" e "Referência" são opcionais e ficam em "Mais detalhes"; no
// ajuste o motivo é obrigatório (lerLancamento), então ele sai do recolhido.
export function CamposLancamentoCliente({
  prefixo,
  hoje,
  inicial,
  semTipo = false,
  rotulosTipo,
  rotulosForma,
}: {
  rotulosTipo: Record<string, string>;
  rotulosForma: Record<string, string>;
  prefixo: string;
  hoje: string;
  inicial?: LancamentoDetalhe;
  /** "Já paguei" do formando: é sempre pagamento, sem escolher tipo. */
  semTipo?: boolean;
}) {
  const id = (campo: string) => `${prefixo}-${campo}`;
  const [tipo, setTipo] = React.useState<Tipo>(inicial?.tipo ?? "pagamento");
  const ajuste = !semTipo && tipo === "ajuste";

  const referencia = (
    <Field>
      <FieldLabel htmlFor={id("referencia")}>
        {ajuste ? "Motivo do ajuste" : semTipo ? "Id da transação do Pix ou observação" : "Referência"}
      </FieldLabel>
      <Input
        id={id("referencia")}
        name="referencia"
        maxLength={120}
        required={ajuste}
        defaultValue={inicial?.referencia ?? ""}
        aria-describedby={id("referencia-ajuda")}
      />
      <FieldDescription id={id("referencia-ajuda")} className="text-xs">
        {ajuste
          ? "Obrigatório no ajuste: fica registrado junto do valor."
          : semTipo
            ? "Ajuda a tesouraria a achar o pagamento no extrato."
            : "Id do Pix ou uma observação."}
      </FieldDescription>
    </Field>
  );

  return (
    <>
      {!semTipo && (
        <Field>
          <FieldLabel id={id("tipo-rotulo")}>Tipo</FieldLabel>
          <input type="hidden" name="tipo" value={tipo} />
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            value={tipo}
            // Sem isto, tocar na opção marcada desmarca tudo e o form vai sem tipo.
            onValueChange={(v) => v && setTipo(v as Tipo)}
            aria-labelledby={id("tipo-rotulo")}
            className="w-full"
          >
            {Object.entries(rotulosTipo).map(([valor, rotulo]) => (
              <ToggleGroupItem key={valor} value={valor} className="flex-1 pointer-coarse:min-h-11 data-[state=on]:border-destaque-borda data-[state=on]:bg-destaque-suave data-[state=on]:font-medium data-[state=on]:text-foreground">
                {rotulo}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={id("valor")}>Valor</FieldLabel>
          <CampoValor id={id("valor")} name="valor" placeholder="150,00" maxLength={14} required defaultValue={inicial?.valor} />
        </Field>
        <Field>
          <FieldLabel htmlFor={id("pagoEm")}>Data</FieldLabel>
          <Input id={id("pagoEm")} name="pagoEm" type="date" required defaultValue={inicial?.pagoEm ?? hoje} />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor={id("forma")}>Forma</FieldLabel>
          <NativeSelect id={id("forma")} name="forma" defaultValue={inicial?.forma ?? "pix"}>
            {Object.entries(rotulosForma).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      {ajuste && referencia}
      <PainelRecolhivel
        abertoInicial={!!inicial?.pagoPor || (!ajuste && !!inicial?.referencia)}
        className="group/mais rounded-lg border"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium pointer-coarse:min-h-11 [&::-webkit-details-marker]:hidden">
          Mais detalhes
          <span className="text-xs font-normal text-muted-foreground">opcional</span>
        </summary>
        <div className="flex flex-col gap-3 border-t p-3">
          <Field>
            <FieldLabel htmlFor={id("pagoPor")}>Quem pagou, se foi outra pessoa</FieldLabel>
            <Input id={id("pagoPor")} name="pagoPor" maxLength={120} placeholder="mãe, tio…" defaultValue={inicial?.pagoPor ?? ""} />
          </Field>
          {!ajuste && referencia}
        </div>
      </PainelRecolhivel>
    </>
  );
}
