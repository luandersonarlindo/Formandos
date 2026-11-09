import { formatarDataHora } from "@/lib/datas";
import { descreverAcao } from "@/lib/historico-texto";
import type { AcaoAuditoria } from "@/lib/auditoria-acoes";

// Lista de histórico (ADRs 0003 e 0008): uma frase por ação, feita por
// descreverAcao. Serve ao histórico das decisões (turma) e à tela "Histórico"
// da comissão. Quem chama já filtrou o que esse público pode ver.

export type LinhaHistorico = {
  id: string;
  quando: Date;
  acao: AcaoAuditoria;
  autor: string | null;
  alvo?: string | null;
  detalhe: Record<string, unknown>;
};

export function HistoricoDecisoes({
  itens,
  mostrarPergunta = false,
}: {
  itens: LinhaHistorico[];
  // Mantido por compatibilidade: a frase já cita a pergunta.
  mostrarPergunta?: boolean;
}) {
  void mostrarPergunta;
  if (itens.length === 0) {
    return <p className="text-sm text-muted-foreground">Nada registrado ainda.</p>;
  }
  return (
    <ol className="flex flex-col gap-3 border-l pl-4">
      {itens.map((item) => {
        const { frase, detalhes, alerta } = descreverAcao(item.acao, item.detalhe, item.alvo ?? null);
        return (
          <li key={item.id} className="flex flex-col gap-0.5 text-sm">
            <time className="text-xs text-muted-foreground" dateTime={new Date(item.quando).toISOString()}>
              {formatarDataHora.format(new Date(item.quando))}
            </time>
            <p className="wrap-break-word">
              <strong className="font-medium">{item.autor ?? "Conta excluída"}</strong> {frase}
            </p>
            {detalhes.map((d) => (
              <p
                key={d}
                className={
                  alerta && d.startsWith("Fora da regra")
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-muted-foreground wrap-break-word"
                }
              >
                {d}
              </p>
            ))}
          </li>
        );
      })}
    </ol>
  );
}
