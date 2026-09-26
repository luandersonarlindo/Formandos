import { PaginaVazia } from "@/components/features/pagina-vazia";

export default async function Pagina(
  props: PageProps<"/admin/votacoes/votos/[enqueteId]">,
) {
  const { enqueteId } = await props.params;
  return (
    <PaginaVazia
      titulo="Quem votou"
      descricao={`Votos identificados da enquete ${enqueteId}.`}
    />
  );
}
