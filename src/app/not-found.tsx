import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NaoEncontrada() {
  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className="vitrine-fundo-hero flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center outline-none"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl border bg-background/80 text-[var(--vitrine-a)]">
        <Compass className="size-7" aria-hidden />
      </span>
      <p className="vitrine-texto-gradiente text-6xl font-semibold tracking-tight" aria-hidden>
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Página não encontrada</h1>
      <p className="max-w-sm text-muted-foreground text-pretty">
        O endereço não existe ou você não tem acesso a esta página.
      </p>
      <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
        <ArrowLeft aria-hidden /> Ir para o início
      </Link>
    </main>
  );
}
