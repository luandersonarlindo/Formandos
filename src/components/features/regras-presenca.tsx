"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { salvarLimiteAcompanhantes, salvarPrazoPresenca } from "@/actions/presenca";
import { FormAcao } from "@/components/features/form-acao";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TETO_ACOMPANHANTES } from "@/lib/presenca-regras";

// "Regras da presença" (P-15 do plano de UX): o limite de acompanhantes e o
// prazo num diálogo só, com duas seções e dois botões de salvar. Eram dois
// cards cheios entre o número de pessoas e a lista. Cada seção continua com a
// sua action (validação e histórico próprios), por isso dois formulários.
export function RegrasPresenca({
  maxAcompanhantes,
  prazoLocal,
}: {
  maxAcompanhantes: number;
  /** Prazo atual no formato do datetime-local, ou "" sem prazo. */
  prazoLocal: string;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <SlidersHorizontal aria-hidden /> Regras da presença
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Regras da presença</DialogTitle>
          <DialogDescription>Valem para toda a turma. Cada parte salva separada.</DialogDescription>
        </DialogHeader>
        <FormAcao acao={salvarLimiteAcompanhantes} rotulo="Salvar limite" rotuloPendente="Salvando…" rodapeDireita>
          <FieldSet className="gap-2">
            <FieldLegend variant="label">Acompanhantes por pessoa</FieldLegend>
            <Label htmlFor="maxAcompanhantes" className="sr-only">
              Acompanhantes por pessoa
            </Label>
            <Input
              id="maxAcompanhantes"
              name="maxAcompanhantes"
              type="number"
              inputMode="numeric"
              min={0}
              max={TETO_ACOMPANHANTES}
              defaultValue={maxAcompanhantes}
              className="h-10 sm:w-32"
            />
            <FieldDescription>
              De 0 (sem acompanhantes) a {TETO_ACOMPANHANTES}. Baixar o limite não corta ninguém: quem já tinha mais
              mantém a lista e só pode remover nomes.
            </FieldDescription>
          </FieldSet>
        </FormAcao>
        <div className="border-t" />
        <FormAcao acao={salvarPrazoPresenca} rotulo="Salvar prazo" rotuloPendente="Salvando…" rodapeDireita>
          <FieldSet className="gap-2">
            <FieldLegend variant="label">Prazo para confirmar presença</FieldLegend>
            <Label htmlFor="prazo-presenca" className="sr-only">
              Responder até
            </Label>
            <Input id="prazo-presenca" name="prazo" type="datetime-local" defaultValue={prazoLocal} className="h-10" />
            <FieldDescription>
              Depois do prazo, ninguém responde nem muda a resposta. Deixe em branco para não ter prazo.
            </FieldDescription>
          </FieldSet>
        </FormAcao>
      </DialogContent>
    </Dialog>
  );
}
