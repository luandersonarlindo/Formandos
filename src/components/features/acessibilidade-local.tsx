import { Accessibility } from "lucide-react";
import { linhasAcessibilidade, type Acessibilidade } from "@/lib/acessibilidade";

// Acessibilidade do local (ADR-0024), sempre em texto: o ícone é só enfeite.
// Sem resposta, diz "não informada", nunca "não tem".
export function AcessibilidadeLocal({ a, compacto = false }: { a: Acessibilidade; compacto?: boolean }) {
  const linhas = linhasAcessibilidade(a);
  return (
    <div className="flex gap-3">
      <Accessibility
        className="mt-0.5 size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">Acessibilidade</p>
        {linhas.length === 1 ? (
          <p className={compacto ? "text-sm" : ""}>{linhas[0]}</p>
        ) : (
          <ul className={compacto ? "text-sm" : ""}>
            {linhas.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        )}
        {a.obs && <p className={`mt-0.5 wrap-break-word ${compacto ? "text-xs" : "text-sm"} text-muted-foreground`}>{a.obs}</p>}
      </div>
    </div>
  );
}
