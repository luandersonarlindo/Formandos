"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Como o formando vê a pergunta.
//
// Criar pergunta sem ver o resultado é cego: a pessoa escreve "Escolha uma
// opção" e descobre tarde que a lista ficou com 40 itens, ou que a opção
// exclusiva ficou acima da última opção de verdade. Aqui a enquete aparece
// montada como na tela de votação.
//
// Réplica do `EnqueteCard` (src/components/features/enquete-card.tsx), com os
// controles desligados: o campo `disabled` é o que impede a pessoa de
// responder dentro do preview. Manter as duas telas em paralelo é o custo
// aceitável de um preview fiel — se o `EnqueteCard` mudar, este precisa mudar
// junto.
export function PreviaEnquete({
  titulo,
  tipo,
  opcoes,
  categoria,
  posicao,
  total,
}: {
  titulo: string;
  tipo: "unica" | "multipla";
  opcoes: { id: string; texto: string }[];
  categoria: string;
  posicao: number;
  total: number;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
        >
          <Eye className="size-3.5" aria-hidden /> Ver como o formando vê
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Como o formando vê</DialogTitle>
          <DialogDescription>
            Prévia de como a pergunta aparece na votação, em {categoria} (pergunta{" "}
            {posicao} de {total}). Nada aqui é registrado: os controles estão
            desligados de propósito.
          </DialogDescription>
        </DialogHeader>
        {/* pointer-events-none evita que o clique passe pelo diálogo e atinja a
            página de trás. */}
        <div className="pointer-events-none select-none opacity-90" aria-hidden>
          <Card>
            <fieldset aria-labelledby={`previa-${titulo}`}>
              <CardHeader>
                <CardTitle id={`previa-${titulo}`} className="text-base">
                  {titulo}
                </CardTitle>
                <CardDescription>
                  {tipo === "unica" ? "Escolha uma opção." : "Você pode escolher várias opções."}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-4 flex flex-col gap-2">
                {opcoes.map((o) => (
                  <label
                    key={o.id}
                    className="flex cursor-default items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                  >
                    <input
                      type={tipo === "unica" ? "radio" : "checkbox"}
                      name={`previa-${titulo}`}
                      checked={false}
                      readOnly
                      disabled
                      className="size-4 accent-[var(--vitrine-a)]"
                    />
                    {o.texto}
                  </label>
                ))}
              </CardContent>
            </fieldset>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}