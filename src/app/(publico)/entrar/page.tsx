import { redirect } from "next/navigation";
import { BotaoGoogle } from "@/components/features/botao-google";
import { getSessao } from "@/lib/dal";

export default async function EntrarPage() {
  if (await getSessao()) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
      <p className="max-w-sm text-muted-foreground">
        Acesse com a sua conta Google. Não é preciso criar senha.
      </p>
      <BotaoGoogle />
    </main>
  );
}
