type PaginaVaziaProps = {
  titulo: string;
  descricao: string;
  children?: React.ReactNode;
};

// Marcador das telas ainda não implementadas.
export function PaginaVazia({ titulo, descricao, children }: PaginaVaziaProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
      <p className="mt-2 text-muted-foreground">{descricao}</p>
      {children}
    </div>
  );
}
