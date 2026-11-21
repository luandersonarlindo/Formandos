import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { Fornecedor, Saida } from "@/lib/saidas-regras";

// Campos do formulário de saída do caixa (ADR-0022), para lançar e editar.
export function CamposSaida({
  prefixo,
  hoje,
  fornecedores,
  inicial,
}: {
  prefixo: string;
  hoje: string;
  fornecedores: Fornecedor[];
  inicial?: Saida;
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${prefixo}-descricao`}>Descrição</Label>
        <Input
          id={`${prefixo}-descricao`}
          name="descricao"
          maxLength={200}
          defaultValue={inicial?.descricao}
          placeholder="Ex.: Sinal do buffet"
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${prefixo}-valor`}>Valor (R$)</Label>
          <Input
            id={`${prefixo}-valor`}
            name="valor"
            inputMode="decimal"
            defaultValue={inicial ? inicial.valor.toFixed(2).replace(".", ",") : undefined}
            placeholder="1500,00"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${prefixo}-data`}>Data do pagamento</Label>
          <Input id={`${prefixo}-data`} name="pagoEm" type="date" defaultValue={inicial?.pagoEm ?? hoje} required />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${prefixo}-fornecedor`}>Fornecedor (opcional)</Label>
        <NativeSelect id={`${prefixo}-fornecedor`} name="fornecedorId" defaultValue={inicial?.fornecedorId ?? ""}>
          <option value="">Sem fornecedor</option>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${prefixo}-referencia`}>Referência (opcional)</Label>
        <Input
          id={`${prefixo}-referencia`}
          name="referencia"
          maxLength={120}
          defaultValue={inicial?.referencia ?? undefined}
          placeholder="Código do Pix ou número do documento"
          aria-describedby={`${prefixo}-referencia-ajuda`}
        />
        <p id={`${prefixo}-referencia-ajuda`} className="text-xs text-muted-foreground">
          Só a tesouraria vê. Serve para casar com o extrato.
        </p>
      </div>
      <div className="flex items-start gap-2.5 rounded-lg border bg-muted/50 p-3">
        <Input
          id={`${prefixo}-so-comissao`}
          name="soComissao"
          type="checkbox"
          defaultChecked={inicial?.soComissao}
          className="mt-0.5 size-5 shrink-0 sm:size-4"
          aria-describedby={`${prefixo}-so-comissao-ajuda`}
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${prefixo}-so-comissao`} className="text-sm">
            Descrição só para a comissão
          </Label>
          <p id={`${prefixo}-so-comissao-ajuda`} className="text-xs text-muted-foreground text-pretty">
            A turma vê “Outras despesas”, sem a descrição e sem o fornecedor. O valor aparece para todos e entra no
            total.
          </p>
        </div>
      </div>
    </>
  );
}
