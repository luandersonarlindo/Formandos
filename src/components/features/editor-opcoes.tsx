"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Editor de opções de uma enquete: a lista com remoção e "adicionar opção",
// o mesmo desenho de survey builder (SurveyJS, Qualtrics, Tally) e o padrão de
// tag input. Antes era um campo de texto com "uma opção por linha", que
// obrigava a contar linhas e só avisava do erro depois de enviar.
//
// Um componente para os dois momentos (criar e editar), porque são a mesma
// tarefa com contratos de campo diferentes:
//
// - "nova": ainda não há id. Envia `opcoes` (uma por linha, sem a exclusiva) e
//   `exclusiva` com o texto da linha marcada. Contrato de adicionarEnquete.
//
// - "editar": cada opção tem id e pode ter voto. Envia `opcao-<id>` com o
//   texto, `remover-<id>` para as marcadas e `exclusivaId` com o id escolhido.
//   Contrato de atualizarEnquete, que preserva o id — e o voto — de tudo que
//   sobrar.
//
// A opção exclusiva é a saída lógica da pergunta ("Sem preferência", "Nenhuma
// restrição"): só existe em escolha múltipla e é marcada com um clique na
// própria linha. Antes era um campo de texto solto que o servidor somava ao
// fim da lista, fazendo a linha da exclusiva e a opção de verdade parecerem
// duas coisas diferentes.

const MIN = 2;
const MAX = 12;

export type OpcaoExistente = {
  id: string;
  texto: string;
  exclusiva: boolean;
  votos: number;
};

export function EditorOpcoes({
  modo,
  tipo,
  opcoesIniciais = [],
}: {
  modo: "nova" | "editar";
  tipo: "unica" | "multipla";
  opcoesIniciais?: OpcaoExistente[];
}) {
  const multipla = tipo === "multipla";

  // Modo nova: as linhas são textos controlados e ainda não existem no banco.
  const [linhas, setLinhas] = useState<string[]>(["", ""]);
  const [exclusiva, setExclusiva] = useState<string | null>(null);

  // Modo editar: a pessoa só decide o que remover e qual é a exclusiva; os
  // textos existentes são inputs com valor inicial, preservados pelo navegador.
  const [removidos, setRemovidos] = useState<string[]>([]);
  const [novaOpcao, setNovaOpcao] = useState("");
  const [exclusivaId, setExclusivaId] = useState(
    opcoesIniciais.find((o) => o.exclusiva)?.id ?? "",
  );

  const editando = modo === "editar";

  function novosTextos() {
    return linhas.map((l) => l.trim()).filter(Boolean);
  }

  function total() {
    if (editando) {
      return (
        opcoesIniciais.length -
        removidos.length +
        (novaOpcao.trim() ? 1 : 0)
      );
    }
    return novosTextos().length;
  }

  function aviso() {
    const n = total();
    if (n > MAX) return `No máximo ${MAX} opções.`;
    if (n < MIN) return `Faltam ${MIN - n} ${MIN - n === 1 ? "opção" : "opções"}.`;
    return null;
  }

  // ---- modo nova ---------------------------------------------------------

  function editarLinha(i: number, texto: string) {
    setLinhas((atual) => atual.map((l, j) => (j === i ? texto : l)));
  }

  function novaLinha(texto?: string) {
    const valor = (texto ?? "").trim();
    if (total() >= MAX) return;
    setLinhas((atual) => [...atual, valor]);
    if (exclusiva !== null) setExclusiva(null);
  }

  function apagarLinha(i: number) {
    if (linhas.length <= MIN) return;
    const eraExclusiva = linhas[i].trim() === exclusiva;
    setLinhas((atual) => atual.filter((_, j) => j !== i));
    if (eraExclusiva) setExclusiva(null);
  }

  function alternarExclusiva(i: number) {
    if (!multipla) return;
    const texto = linhas[i].trim();
    setExclusiva((atual) => (atual === texto ? null : texto));
  }

  function colarLista(e: React.ClipboardEvent<HTMLInputElement>, i: number) {
    const colado = e.clipboardData.getData("text");
    if (!colado.includes("\n")) return;
    e.preventDefault();
    const partes = colado
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (partes.length === 0) return;
    setLinhas((atual) => [...atual.slice(0, i + 1), ...partes, ...atual.slice(i + 1)]);
  }

  function teclaLinha(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === "Enter") {
      // Sem preventDefault o Enter enviaria o formulário inteiro.
      e.preventDefault();
      if (i === linhas.length - 1) novaLinha();
      return;
    }
    if (e.key === "Backspace" && linhas[i] === "" && linhas.length > MIN) {
      e.preventDefault();
      apagarLinha(i - 1);
    }
  }

  // ---- modo editar -------------------------------------------------------

  function marcarRemover(id: string) {
    setRemovidos((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    );
  }

  function digitarNovaOpcao(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    setNovaOpcao((atual) => atual.trim());
  }

  // ---- desenho -----------------------------------------------------------

  const linhaExclusiva = (i: number) => multipla && linhas[i].trim() === exclusiva;

  return (
    <div className="flex flex-col gap-2">
      {editando
        ? opcoesIniciais.map((o) => {
            const removido = removidos.includes(o.id);
            return (
              <div
                key={o.id}
                className={`flex items-center gap-2 ${removido ? "opacity-60" : ""}`}
              >
                <Input
                  name={`opcao-${o.id}`}
                  defaultValue={o.texto}
                  maxLength={255}
                  className={`h-9 min-w-0 ${removido ? "line-through" : ""}`}
                  aria-label={`Opção ${o.texto}`}
                />
                {multipla && (
                  <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <input
                      type="radio"
                      name="exclusivaId"
                      value={o.id}
                      checked={!removido && exclusivaId === o.id}
                      onChange={() => setExclusivaId(o.id)}
                    />
                    Exclusiva
                  </label>
                )}
                {o.votos > 0 ? (
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {o.votos} {o.votos === 1 ? "voto" : "votos"}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => marcarRemover(o.id)}
                    aria-label={
                      removido
                        ? `Restaurar opção ${o.texto}`
                        : `Remover opção ${o.texto}`
                    }
                    className="shrink-0 rounded-md p-2 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                )}
                {/* Só existe quando marcado: o servidor compara com "on". */}
                {removido && <input type="hidden" name={`remover-${o.id}`} value="on" />}
              </div>
            );
          })
        : linhas.map((linha, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={linha}
                onChange={(e) => editarLinha(i, e.target.value)}
                onKeyDown={(e) => teclaLinha(e, i)}
                onPaste={(e) => colarLista(e, i)}
                maxLength={255}
                className="h-9 min-w-0"
                aria-label={`Opção ${i + 1}`}
                // A última linha é a que "cria" a próxima: é nela que o Enter
                // adiciona, e o texto diz isso.
                placeholder={i === linhas.length - 1 ? "Escreva e pressione Enter para adicionar outra" : undefined}
              />
              {multipla && (
                <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={linhaExclusiva(i)}
                    onChange={() => alternarExclusiva(i)}
                    aria-label={`Marcar opção ${linha.trim() || i + 1} como exclusiva`}
                  />
                  Exclusiva
                </label>
              )}
              {linhas.length > MIN && (
                <button
                  type="button"
                  onClick={() => apagarLinha(i)}
                  aria-label={`Remover opção ${linha.trim() || i + 1}`}
                  className="shrink-0 rounded-md p-2 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </div>
          ))}

      {editando && (
        <div className="flex items-center gap-2">
          <Input
            name="novaOpcao"
            value={novaOpcao}
            onChange={(e) => setNovaOpcao(e.target.value)}
            onKeyDown={digitarNovaOpcao}
            maxLength={255}
            className="h-9"
            aria-label="Nova opção"
            placeholder="Nova opção (opcional)"
          />
          {multipla && (
            <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <input
                type="radio"
                name="exclusivaId"
                value="nova"
                checked={exclusivaId === "nova"}
                onChange={() => setExclusivaId("nova")}
              />
              Exclusiva
            </label>
          )}
        </div>
      )}

      {multipla && editando && (
        <label className="flex items-center gap-1 text-xs text-muted-foreground">
          <input
            type="radio"
            name="exclusivaId"
            value=""
            checked={exclusivaId === ""}
            onChange={() => setExclusivaId("")}
          />
          Nenhuma opção exclusiva
        </label>
      )}

      {/* Campos que o servidor lê. Em "editar" quem vale é opcao-<id>. */}
      {!editando && (
        <>
          <input type="hidden" name="opcoes" value={novosTextos().filter((t) => t !== exclusiva).join("\n")} />
          <input type="hidden" name="exclusiva" value={multipla ? (exclusiva ?? "") : ""} />
        </>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!editando && (
          <Button type="button" variant="outline" size="sm" onClick={() => novaLinha()} disabled={total() >= MAX}>
            <Plus className="size-3.5" aria-hidden /> Adicionar opção
          </Button>
        )}
        <p role="status" className="text-xs text-muted-foreground">
          {total()} {total() === 1 ? "opção" : "opções"}
          {aviso() ? ` · ${aviso()}` : ""}
        </p>
      </div>

      {multipla && (
        <p className="text-xs text-muted-foreground">
          {editando
            ? "Marque a linha da saída lógica (ex.: “Sem preferência”): quem marcá-la não pode marcar as outras. Uma opção só é removida se ainda não tiver voto."
            : "Marque a linha da saída lógica (ex.: “Sem preferência”): quem marcá-la não pode marcar as outras."}
        </p>
      )}
    </div>
  );
}