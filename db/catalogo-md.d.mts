export type OpcaoMd = { texto: string; exclusiva: boolean };
export type EnqueteMd = { titulo: string; tipo: "unica" | "multipla"; opcoes: OpcaoMd[] };
export type CategoriaMd = { nome: string; enquetes: EnqueteMd[] };

export function lerCatalogo(markdown: string): CategoriaMd[];
export function lerModelo(markdown: string): {
  nome: string;
  descricao: string;
  categorias: CategoriaMd[];
};
