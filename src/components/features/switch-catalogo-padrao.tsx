"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { alternarCatalogoPadrao } from "@/actions/catalogos";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const inicial: EstadoForm = {};

// Ligar ou desligar o catálogo padrão na turma (P do plano de UX, Fase 3). Era
// um diálogo com um NativeSelect de sim/não — três passos para um booleano.
// Agora o Switch envia na hora a mesma action (alternarCatalogoPadrao, campo
// `usar`). Sem JS o Switch não funciona, então até a página hidratar aparece
// um botão de envio comum.
export function SwitchCatalogoPadrao({ ligado }: { ligado: boolean }) {
  const [estado, acao, pendente] = useActionState(alternarCatalogoPadrao, inicial);
  const [hidratado, setHidratado] = useState(false);
  const [marcado, setMarcado] = useState(ligado);
  const form = useRef<HTMLFormElement>(null);
  const usar = useRef<HTMLInputElement>(null);

  useEffect(() => setHidratado(true), []);
  // O servidor manda o valor de verdade a cada render; ele vence o otimista.
  useEffect(() => setMarcado(ligado), [ligado]);
  useEffect(() => {
    if (estado.ok) toast.success(estado.ok);
    if (estado.erro) {
      toast.error(estado.erro);
      setMarcado(ligado);
    }
    // ligado não entra: só reage à resposta da action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  // O Switch fica FORA do <form>: dentro de um form, o Radix cria um checkbox
  // oculto que reenvia um evento a cada mudança de `checked`, e a resposta da
  // action (que muda `ligado`) disparava um segundo envio, desfazendo o
  // primeiro. O form só guarda o campo e o botão para quem está sem JS.
  return (
    <div className="flex items-center gap-3">
      <form ref={form} action={acao} className="contents">
        <input ref={usar} type="hidden" name="usar" value={ligado ? "nao" : "sim"} />
        {!hidratado && (
          <Button id="usar-catalogo-padrao" type="submit" size="sm" variant="outline">
            {ligado ? "Desligar" : "Ligar"}
          </Button>
        )}
      </form>
      <Label htmlFor="usar-catalogo-padrao" className="text-sm font-normal text-muted-foreground">
        {marcado ? "Ligado" : "Desligado"}
      </Label>
      {hidratado && (
        <Switch
          id="usar-catalogo-padrao"
          checked={marcado}
          disabled={pendente}
          aria-label="Oferecer o catálogo padrão à turma"
          className="pointer-coarse:scale-125"
          onCheckedChange={(v) => {
            setMarcado(v);
            if (usar.current) usar.current.value = v ? "sim" : "nao";
            form.current?.requestSubmit();
          }}
        />
      )}
    </div>
  );
}
