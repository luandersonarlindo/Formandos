import type { Metadata } from "next";
import {
  alternarDestaque,
  alternarRespondida,
  apagarDuvida,
} from "@/actions/admin";
import { FormResposta } from "@/components/features/form-resposta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exigirAdmin } from "@/lib/dal";
import { listarDuvidas } from "@/lib/duvidas";

export const metadata: Metadata = { title: "Moderação de dúvidas" };

const formatarData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function AcaoSimples({
  acao,
  duvidaId,
  variante = "outline",
  children,
}: {
  acao: (formData: FormData) => Promise<void>;
  duvidaId: string;
  variante?: "outline" | "destructive";
  children: React.ReactNode;
}) {
  return (
    <form action={acao}>
      <input type="hidden" name="duvidaId" value={duvidaId} />
      <Button type="submit" variant={variante} size="sm">
        {children}
      </Button>
    </form>
  );
}

export default async function ModeracaoDuvidasPage() {
  const admin = await exigirAdmin();
  const duvidas = await listarDuvidas(admin, { moderacao: true });
  const abertas = duvidas.filter((d) => !d.respondida).length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Moderação de dúvidas
      </h1>
      <p className="mt-2 text-muted-foreground">
        {duvidas.length === 0
          ? "Nenhuma dúvida enviada ainda."
          : `${abertas} sem resposta de ${duvidas.length} no total. As não respondidas aparecem primeiro.`}
      </p>

      <ul className="mt-6 grid gap-4">
        {duvidas.map((d) => (
          <li key={d.id}>
            <Card>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {d.destaque && <Badge>Em destaque</Badge>}
                    <Badge variant={d.respondida ? "secondary" : "outline"}>
                      {d.respondida ? "Respondida" : "Aberta"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {d.votos} {d.votos === 1 ? "voto" : "votos"}
                    </span>
                  </div>
                  <p className="mt-2 wrap-break-word whitespace-pre-wrap">
                    {d.conteudo}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.autor} · {formatarData.format(d.criadaEm)}
                  </p>
                </div>

                <FormResposta duvidaId={d.id} resposta={d.resposta} />

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <AcaoSimples acao={alternarDestaque} duvidaId={d.id}>
                    {d.destaque ? "Tirar destaque" : "Destacar"}
                  </AcaoSimples>
                  <AcaoSimples acao={alternarRespondida} duvidaId={d.id}>
                    {d.respondida ? "Reabrir" : "Marcar como respondida"}
                  </AcaoSimples>
                  <AcaoSimples
                    acao={apagarDuvida}
                    duvidaId={d.id}
                    variante="destructive"
                  >
                    Apagar
                  </AcaoSimples>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
