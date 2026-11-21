import { Plus } from "lucide-react";
import { criarTarefa } from "@/actions/tarefas";
import { FormDialog } from "@/components/features/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

// "Nova tarefa" no cabeçalho de /tarefas (plano de UX, Fase 2). Antes era um
// painel recolhível entre o progresso e os filtros; agora a lista vem primeiro
// e o formulário abre num diálogo, em uma coluna no celular.
export function FormNovaTarefa({ membros }: { membros: { id: string; nome: string }[] }) {
  return (
    <FormDialog
      rotulo="Nova tarefa"
      icone={<Plus aria-hidden />}
      variante="default"
      tamanho="default"
      titulo="Nova tarefa"
      descricao="Só o título é obrigatório."
      acao={criarTarefa}
      rotuloSubmit="Criar tarefa"
      rotuloPendente="Criando…"
    >
      <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" name="titulo" minLength={3} maxLength={255} placeholder="Ex.: Contratar o fotógrafo" required />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="descricao">Descrição (opcional)</Label>
          <Textarea id="descricao" name="descricao" rows={2} maxLength={1000} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="responsavelId">Responsável (opcional)</Label>
          <NativeSelect id="responsavelId" name="responsavelId" defaultValue="">
            <option value="">Ninguém</option>
            {membros.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prazo">Prazo (opcional)</Label>
          <Input id="prazo" name="prazo" type="date" />
        </div>
      </div>
    </FormDialog>
  );
}
