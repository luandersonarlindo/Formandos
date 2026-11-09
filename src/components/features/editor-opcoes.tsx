"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
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
  valorPessoa?: number | null;
  link?: string | null;
};

type Detalhe = { valor: string; link: string };
const semDetalhe = (): Detalhe => ({ valor: "", link: "" });

// "R$ 95 por pessoa" e o link do cardápio (ADR-0003). Os campos ficam sempre
// no formulário (só escondidos quando a pessoa não abre "Valor e link"), para
// salvar a pergunta sem apagar o valor que já existia.
function CamposDetalhe({
  visivel,
  rotulo,
  nomes,
  valores,
  aoMudar,
}: {
  visivel: boolean;
  rotulo: string;
  nomes?: { valor: string; link: string };
  valores: Detalhe;
  aoMudar?: (d: Detalhe) => void;
}) {
  const controlado = aoMudar !== undefined;
  return (
    <div className={visivel ? "grid grid-cols-[7rem_1fr] gap-2 pl-3" : "hidden"}>
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">R$ por pessoa</Label>
        <Input
          name={nomes?.valor}
          inputMode="decimal"
          placeholder="95,00"
          maxLength={14}
          className="h-9 tabular-nums"
          aria-label={`Valor por pessoa de ${rotulo}`}
          {...(controlado
            ? { value: valores.valor, onChange: (e) => aoMudar({ ...valores, valor: e.target.value }) }
            : { defaultValue: valores.valor })}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Link (cardápio, site)</Label>
        <Input
          name={nomes?.link}
          type="url"
          inputMode="url"
          placeholder="https://"
          maxLength={500}
          className="h-9 min-w-0"
          aria-label={`Link de ${rotulo}`}
          {...(controlado
            ? { value: valores.link, onChange: (e) => aoMudar({ ...valores, link: e.target.value }) }
            : { defaultValue: valores.link })}
        />
      </div>
    </div>
  );
}

const valorComoTexto = (v?: number | null) =>
  v === null || v === undefined ? "" : v.toFixed(2).replace(".", ",");

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
  // Valor e link de cada linha, na mesma posição de `linhas`.
  const [detalhes, setDetalhes] = useState<Detalhe[]>([semDetalhe(), semDetalhe()]);
  const [exclusiva, setExclusiva] = useState<string | null>(null);
  const [comDetalhes, setComDetalhes] = useState(
    opcoesIniciais.some((o) => o.valorPessoa != null || o.link),
  );

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
    setDetalhes((atual) => [...atual, semDetalhe()]);
    if (exclusiva !== null) setExclusiva(null);
  }

  function apagarLinha(i: number) {
    if (linhas.length <= MIN) return;
    const eraExclusiva = linhas[i].trim() === exclusiva;
    setLinhas((atual) => atual.filter((_, j) => j !== i));
    setDetalhes((atual) => atual.filter((_, j) => j !== i));
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
    setDetalhes((atual) => [
      ...atual.slice(0, i + 1),
      ...partes.map(semDetalhe),
      ...atual.slice(i + 1),
    ]);
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
              <div key={o.id} className="flex flex-col gap-1.5">
              <div
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
                    className="shrink-0 rounded-md p-2 text-muted-foreground hover:text-destructive pointer-coarse:grid pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:place-items-center pointer-coarse:p-0"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                )}
                {/* Só existe quando marcado: o servidor compara com "on". */}
                {removido && <input type="hidden" name={`remover-${o.id}`} value="on" />}
              </div>
              <CamposDetalhe
                visivel={comDetalhes && !removido}
                rotulo={o.texto}
                nomes={{ valor: `valor-${o.id}`, link: `link-${o.id}` }}
                valores={{ valor: valorComoTexto(o.valorPessoa), link: o.link ?? "" }}
              />
              </div>
            );
          })
        : linhas.map((linha, i) => (
            <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
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
                  className="shrink-0 rounded-md p-2 text-muted-foreground hover:text-destructive pointer-coarse:grid pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:place-items-center pointer-coarse:p-0"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </div>
            <CamposDetalhe
              visivel={comDetalhes && !linhaExclusiva(i)}
              rotulo={linha.trim() || `opção ${i + 1}`}
              valores={detalhes[i] ?? semDetalhe()}
              aoMudar={(d) => setDetalhes((atual) => atual.map((x, j) => (j === i ? d : x)))}
            />
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
      {editando && (
        <CamposDetalhe
          visivel={comDetalhes && novaOpcao.trim() !== ""}
          rotulo="nova opção"
          nomes={{ valor: "novaValor", link: "novaLink" }}
          valores={semDetalhe()}
        />
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
          <input
            type="hidden"
            name="detalhes"
            value={JSON.stringify(
              linhas
                .map((texto, i) => ({ texto: texto.trim(), ...(detalhes[i] ?? semDetalhe()) }))
                .filter((d) => d.texto && (d.valor.trim() || d.link.trim())),
            )}
          />
        </>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!editando && (
          <Button type="button" variant="outline" size="sm" onClick={() => novaLinha()} disabled={total() >= MAX}>
            <Plus className="size-3.5" aria-hidden /> Adicionar opção
          </Button>
        )}
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={comDetalhes}
            onChange={(e) => setComDetalhes(e.target.checked)}
          />
          Valor por pessoa e link
        </label>
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