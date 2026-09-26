import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NaoEncontrada() {
  return (
    <main id="conteudo" className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Página não encontrada</h1>
      <p className="max-w-sm text-muted-foreground">
        O endereço não existe ou você não tem acesso a esta página.
      </p>
      <Link href="/dashboard" className={cn(buttonVariants())}>
        Ir para o início
      </Link>
    </main>
  );
}
