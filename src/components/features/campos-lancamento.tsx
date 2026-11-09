import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { ROTULO_FORMA, ROTULO_TIPO, type LancamentoDetalhe } from "@/lib/pagamentos";

// Campos de um lançamento (ADR-0005), usados em "Lançar" e "Editar" da
// tesouraria. `prefixo` deixa os ids únicos quando há vários diálogos na tela.
export function CamposLancamento({
  prefixo,
  hoje,
  inicial,
  semTipo = false,
}: {
  prefixo: string;
  hoje: string;
  inicial?: LancamentoDetalhe;
  /** "Já paguei" do formando: é sempre pagamento, sem escolher tipo. */
  semTipo?: boolean;
}) {
  const id = (campo: string) => `${prefixo}-${campo}`;
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {!semTipo && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={id("tipo")} className="text-xs">Tipo</Label>
            <NativeSelect id={id("tipo")} name="tipo" defaultValue={inicial?.tipo ?? "pagamento"}>
              {Object.entries(ROTULO_TIPO).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>{rotulo}</option>
              ))}
            </NativeSelect>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("valor")} className="text-xs">Valor (R$)</Label>
          <Input
            id={id("valor")}
            name="valor"
            inputMode="decimal"
            placeholder="150,00"
            maxLength={14}
            required
            defaultValue={inicial ? inicial.valor.toFixed(2).replace(".", ",") : undefined}
            className="tabular-nums"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("pagoEm")} className="text-xs">Data</Label>
          <Input id={id("pagoEm")} name="pagoEm" type="date" required defaultValue={inicial?.pagoEm ?? hoje} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id("forma")} className="text-xs">Forma</Label>
          <NativeSelect id={id("forma")} name="forma" defaultValue={inicial?.forma ?? "pix"}>
            {Object.entries(ROTULO_FORMA).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("pagoPor")} className="text-xs">Quem pagou, se foi outra pessoa (opcional)</Label>
        <Input id={id("pagoPor")} name="pagoPor" maxLength={120} placeholder="mãe, tio…" defaultValue={inicial?.pagoPor ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id("referencia")} className="text-xs">
          {semTipo
            ? "Id da transação do Pix ou observação (opcional, ajuda a tesouraria a achar)"
            : "Referência: id do Pix ou observação (no ajuste, o motivo)"}
        </Label>
        <Input id={id("referencia")} name="referencia" maxLength={120} defaultValue={inicial?.referencia ?? ""} />
      </div>
    </>
  );
}
