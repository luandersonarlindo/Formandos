import { Plus } from "lucide-react";
import { criarFornecedor } from "@/actions/terceiros";
import { FormDialog } from "@/components/features/form-dialog";
import { PainelRecolhivel } from "@/components/features/painel-recolhivel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

// "Novo fornecedor" no cabeçalho de /terceiros (P-09). Antes o formulário
// ficava num painel entre o orçamento e a lista; agora abre num diálogo, em
// uma coluna no celular, com os opcionais em "Mais detalhes" (D-04).
export function FormNovoFornecedor({ categorias }: { categorias: readonly string[] }) {
  return (
    <FormDialog
      rotulo="Novo fornecedor"
      icone={<Plus aria-hidden />}
      variante="default"
      tamanho="default"
      titulo="Novo fornecedor"
      descricao="Nome e categoria bastam. O valor orçado só a comissão vê."
      acao={criarFornecedor}
      rotuloSubmit="Adicionar fornecedor"
      rotuloPendente="Adicionando…"
    >
      <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" name="nome" minLength={2} maxLength={255} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoria">Categoria</Label>
          <NativeSelect id="categoria" name="categoria" defaultValue="" required>
            <option value="" disabled>
              Escolha…
            </option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="contato">Contato (opcional)</Label>
          <Input id="contato" name="contato" maxLength={255} placeholder="Telefone, e-mail ou endereço do site" />
        </div>
      </div>
      <PainelRecolhivel className="group">
        <summary className="cursor-pointer text-sm font-medium pointer-coarse:py-2.5">Mais detalhes</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" name="descricao" rows={2} maxLength={1000} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="imagemUrl">Imagem (link)</Label>
            <Input
              id="imagemUrl"
              name="imagemUrl"
              type="url"
              maxLength={500}
              placeholder="https://… (imagem já hospedada em outro lugar)"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="valorOrcado">Valor orçado</Label>
            <Input id="valorOrcado" name="valorOrcado" inputMode="decimal" maxLength={20} placeholder="Ex.: 1500,00" />
          </div>
        </div>
      </PainelRecolhivel>
    </FormDialog>
  );
}
