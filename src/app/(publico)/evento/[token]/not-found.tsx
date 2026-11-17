import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Código errado, trocado ou página desligada pela comissão (ADR-0008, ADR-0017).
export default function EventoNaoEncontrado() {
  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-2xl px-4 py-16 text-center outline-none">
      <h1 className="text-2xl font-semibold">Este link não existe, foi trocado ou foi desligado</h1>
      <p className="mt-2 text-muted-foreground text-pretty">
        Isso não quer dizer que o evento foi cancelado. A comissão da formatura pode ter trocado ou
        desligado o link. Peça o link novo a quem mandou.
      </p>
    </main>
  );
}
