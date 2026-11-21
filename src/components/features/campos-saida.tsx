import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { Fornecedor, Saida } from "@/lib/saidas-regras";

// Campos do formulário de saída do caixa (ADR-0022), para lançar e editar.
// Mesmo Field e mesmo tamanho de rótulo do CamposLancamento: os dois forms são
// irmãos e devem parecer. O "só da comissão" é um Checkbox do Radix; ele manda
// "on" por um input oculto quando marcado e nada quando não, que é o que a
// action já lê (soComissao !== "").
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
      <Field>
        <FieldLabel htmlFor={`${prefixo}-descricao`}>Descrição</FieldLabel>
        <Input
          id={`${prefixo}-descricao`}
          name="descricao"
          maxLength={200}
          defaultValue={inicial?.descricao}
          placeholder="Ex.: Sinal do buffet"
          required
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${prefixo}-valor`}>Valor (R$)</FieldLabel>
          <Input
            id={`${prefixo}-valor`}
            name="valor"
            inputMode="decimal"
            defaultValue={inicial ? inicial.valor.toFixed(2).replace(".", ",") : undefined}
            placeholder="1500,00"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefixo}-data`}>Data do pagamento</FieldLabel>
          <Input id={`${prefixo}-data`} name="pagoEm" type="date" defaultValue={inicial?.pagoEm ?? hoje} required />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor={`${prefixo}-fornecedor`}>Fornecedor (opcional)</FieldLabel>
        <NativeSelect id={`${prefixo}-fornecedor`} name="fornecedorId" defaultValue={inicial?.fornecedorId ?? ""}>
          <option value="">Sem fornecedor</option>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${prefixo}-referencia`}>Referência (opcional)</FieldLabel>
        <Input
          id={`${prefixo}-referencia`}
          name="referencia"
          maxLength={120}
          defaultValue={inicial?.referencia ?? undefined}
          placeholder="Código do Pix ou número do documento"
          aria-describedby={`${prefixo}-referencia-ajuda`}
        />
        <FieldDescription id={`${prefixo}-referencia-ajuda`} className="text-xs">
          Só a tesouraria vê. Serve para casar com o extrato.
        </FieldDescription>
      </Field>
      <Field orientation="horizontal" className="rounded-lg border p-3">
        <Checkbox
          id={`${prefixo}-so-comissao`}
          name="soComissao"
          defaultChecked={inicial?.soComissao}
          aria-describedby={`${prefixo}-so-comissao-ajuda`}
        />
        <FieldContent>
          <FieldLabel htmlFor={`${prefixo}-so-comissao`}>Descrição só para a comissão</FieldLabel>
          <FieldDescription id={`${prefixo}-so-comissao-ajuda`} className="text-xs text-pretty">
            A turma vê “Outras despesas”, sem a descrição e sem o fornecedor. O valor aparece para todos e entra no
            total.
          </FieldDescription>
        </FieldContent>
      </Field>
    </>
  );
}
