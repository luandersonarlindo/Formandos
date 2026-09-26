import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Formandos 🎓</h1>
      <p className="max-w-md text-muted-foreground">
        Gestão de formaturas e eventos para turmas e comissões organizadoras.
      </p>
      <Button asChild size="lg">
        <Link href="/entrar">Entrar</Link>
      </Button>
    </main>
  );
}
