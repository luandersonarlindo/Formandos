"use client";

import { useState } from "react";
import { UserCheck, UserPlus, X } from "lucide-react";
import { responderPresenca } from "@/actions/presenca";
import { FormDialog } from "@/components/features/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_NOME_ACOMPANHANTE,
  ROTULO_ACOMPANHANTE,
  ROTULO_PRESENCA,
  STATUS_PRESENCA,
  TIPOS_ACOMPANHANTE,
  vagasDeAcompanhante,
  type Acompanhante,
  type StatusPresenca,
} from "@/lib/presenca-regras";

type Inicial = {
  status: StatusPresenca | null;
  acompanhantes: number;
  observacao: string;
  lista: Acompanhante[];
};

export function FormPresenca({
  inicial,
  limite,
}: {
  inicial: Inicial;
  // Quantos acompanhantes a turma permite (escolha do administrador).
  limite: number;
}) {
  const semNome = inicial.status === "vou" ? Math.max(0, inicial.acompanhantes - inicial.lista.length) : 0;
  return (
    <FormDialog
      rotulo={semNome > 0 ? "Informar nomes" : inicial.status ? "Mudar resposta" : "Responder"}
      icone={<UserCheck aria-hidden />}
      titulo="Você vai ao evento?"
      descricao={
        inicial.status
          ? "Você pode mudar a resposta quando quiser."
          : "A comissão precisa saber quantas pessoas vêm para fechar o espaço e a comida."
      }
      acao={responderPresenca}
      rotuloSubmit="Salvar resposta"
      rotuloPendente="Salvando…"
    >
      <CamposPresenca inicial={inicial} limite={limite} />
    </FormDialog>
  );
}

type Linha = Acompanhante & { chave: number };

// Campos controlados: o React limpa formulários depois da ação, e assim a
// resposta salva continua na tela.
function CamposPresenca({ inicial, limite }: { inicial: Inicial; limite: number }) {
  const [status, setStatus] = useState<StatusPresenca | null>(inicial.status);
  const [observacao, setObservacao] = useState(inicial.observacao);
  // Resposta antiga (ADR-0013) tem quantidade e nenhum nome: as linhas que
  // faltam abrem em branco, para a pessoa só preencher.
  const [linhas, setLinhas] = useState<Linha[]>(() => {
    const total = inicial.status === "vou" ? Math.max(inicial.acompanhantes, inicial.lista.length) : 0;
    return Array.from({ length: total }, (_, i) => ({
      chave: i,
      nome: inicial.lista[i]?.nome ?? "",
      tipo: inicial.lista[i]?.tipo ?? "adulto",
    }));
  });
  const [proxima, setProxima] = useState(linhas.length);
  // Espelha o servidor (vagasDeAcompanhante): quem já estava acima do limite
  // mantém a lista, mas só pode remover.
  const vagas = vagasDeAcompanhante(limite, inicial.status === "vou" ? inicial.acompanhantes : 0);
  const acima = linhas.length > limite;

  function mudar(chave: number, parte: Partial<Acompanhante>) {
    setLinhas((atual) => atual.map((l) => (l.chave === chave ? { ...l, ...parte } : l)));
  }
  function adicionar() {
    setLinhas((atual) => [...atual, { chave: proxima, nome: "", tipo: "adulto" }]);
    setProxima((n) => n + 1);
  }

  return (
    <>
      <fieldset className="grid gap-2 sm:grid-cols-3">
        <legend className="sr-only">Você vai ao evento?</legend>
        {STATUS_PRESENCA.map((s) => (
          <label
            key={s}
            className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted has-checked:border-[var(--vitrine-a)] has-checked:bg-[color-mix(in_oklch,var(--vitrine-a)_8%,transparent)] has-checked:font-medium pointer-coarse:py-3"
          >
            <input
              type="radio"
              name="status"
              value={s}
              checked={status === s}
              onChange={() => setStatus(s)}
              required
              className="size-4 accent-[var(--vitrine-a)]"
            />
            {ROTULO_PRESENCA[s]}
          </label>
        ))}
      </fieldset>
      {status === "vou" && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Quem vai com você?</legend>
          <p className="text-xs text-muted-foreground">
            {limite === 0 && linhas.length === 0
              ? "A turma não permite acompanhantes."
              : acima
                ? `A turma agora permite até ${limite}. Você mantém quem já estava na lista, mas não pode adicionar.`
                : `Até ${limite}, sem contar você. O nome vai para a lista de entrada do evento; só você e a comissão veem.`}
          </p>
          {linhas.length > 0 && (
            <ul className="flex flex-col gap-2">
              {linhas.map((l, i) => (
                <li key={l.chave} data-acompanhante className="flex flex-wrap items-end gap-2 rounded-lg border p-2">
                  <div className="flex min-w-0 flex-1 basis-40 flex-col gap-1">
                    <Label htmlFor={`acompanhante-nome-${l.chave}`} className="text-xs">
                      Nome do acompanhante {i + 1}
                    </Label>
                    <Input
                      id={`acompanhante-nome-${l.chave}`}
                      name="acompanhante-nome"
                      value={l.nome}
                      onChange={(e) => mudar(l.chave, { nome: e.target.value })}
                      maxLength={MAX_NOME_ACOMPANHANTE}
                      required
                      autoComplete="off"
                      className="h-10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`acompanhante-tipo-${l.chave}`} className="text-xs">
                      Adulto ou criança
                    </Label>
                    <select
                      id={`acompanhante-tipo-${l.chave}`}
                      name="acompanhante-tipo"
                      value={l.tipo}
                      onChange={(e) => mudar(l.chave, { tipo: e.target.value as Acompanhante["tipo"] })}
                      className="h-10 rounded-lg border bg-background px-2 text-sm"
                    >
                      {TIPOS_ACOMPANHANTE.map((t) => (
                        <option key={t} value={t}>
                          {ROTULO_ACOMPANHANTE[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10"
                    aria-label={`Remover o acompanhante ${i + 1}${l.nome ? `, ${l.nome}` : ""}`}
                    onClick={() => setLinhas((atual) => atual.filter((x) => x.chave !== l.chave))}
                  >
                    <X aria-hidden /> Remover
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {linhas.length < vagas && !acima && (
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={adicionar}>
              <UserPlus aria-hidden /> Adicionar acompanhante
            </Button>
          )}
          <p role="status" className="text-xs text-muted-foreground">
            {linhas.length === 0
              ? "Você vai sem acompanhantes."
              : `${linhas.length} ${linhas.length === 1 ? "acompanhante" : "acompanhantes"} na lista.`}
          </p>
        </fieldset>
      )}
      {status !== null && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="observacao">Observação (opcional)</Label>
          <Input
            id="observacao"
            name="observacao"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            maxLength={255}
            placeholder="Ex.: minha mãe e meu irmão; uma pessoa vegetariana"
            className="h-10"
          />
        </div>
      )}
    </>
  );
}