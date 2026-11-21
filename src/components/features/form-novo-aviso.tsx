import { Plus } from "lucide-react";
import { criarAviso } from "@/actions/avisos";
import { FormDialog } from "@/components/features/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// "Novo aviso" no cabeçalho de /avisos. Antes o formulário ficava sempre
// aberto acima da lista; agora a lista vem primeiro e o formulário abre num
// diálogo (plano de UX, Fase 2). O sucesso fecha o diálogo e vira toast.
export function FormNovoAviso() {
  return (
    <FormDialog
      rotulo="Novo aviso"
      icone={<Plus aria-hidden />}
      variante="default"
      tamanho="default"
      titulo="Novo aviso"
      descricao="O recado aparece para toda a turma em Avisos e no Início."
      acao={criarAviso}
      rotuloSubmit="Publicar aviso"
      rotuloPendente="Publicando…"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="titulo-aviso">Título</Label>
        <Input
          id="titulo-aviso"
          name="titulo"
          minLength={3}
          maxLength={200}
          placeholder="Ex.: Prazo do pagamento do buffet"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="conteudo-aviso">Recado</Label>
        <Textarea
          id="conteudo-aviso"
          name="conteudo"
          minLength={3}
          maxLength={2000}
          rows={4}
          placeholder="Escreva o recado para a turma."
          required
        />
      </div>
    </FormDialog>
  );
}
