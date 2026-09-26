import { PaginaVazia } from "@/components/features/pagina-vazia";

export default async function Pagina(
  props: PageProps<"/admin/votacoes/[catalogoId]">,
) {
  const { catalogoId } = await props.params;
  return (
    <PaginaVazia
      titulo="Editar catálogo"
      descricao={`Categorias e perguntas do catálogo ${catalogoId}.`}
    />
  );
}
