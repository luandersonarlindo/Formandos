"use client";

import { useActionState, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { enviarDuvida } from "@/actions/duvidas";
import type { EstadoForm } from "@/actions/tipos";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const inicial: EstadoForm = {};
const LIMITE = 500;

// Caixa "Pergunte à comissão", no topo de /dúvidas. Fica aberta na página (e
// não num diálogo) porque perguntar é a ação de quem chega aqui; a lista vem
// logo abaixo, para a pessoa ver se a dúvida já existe e apoiar em vez de
// repetir. O sucesso vira toast (D-06); o erro fica junto do botão.
export function FormNovaDuvida() {
  const [estado, acao, pendente] = useActionState(enviarDuvida, inicial);
  // Campo controlado, e não com `defaultValue`: quando o envio dá certo o React
  // esvazia o campo sozinho, e limpeza programática não dispara `onChange`. Com
  // `defaultValue`, o contador ficava mostrando o tamanho do texto anterior.
  const [texto, setTexto] = useState("");

  // O servidor devolve `valor` quando rejeita o envio, para a pessoa não perder
  // o que escreveu. Quando aceita, não devolve nada e o campo é zerado.
  useEffect(() => {
    setTexto(estado.valor ?? "");
    if (estado.ok) toast.success(estado.ok);
  }, [estado]);

  return (
    <form action={acao} className="flex flex-col gap-2">
      <Label htmlFor="texto-duvida" className="text-base font-semibold">
        Pergunte à comissão
      </Label>
      <Textarea
        id="texto-duvida"
        name="conteudo"
        minLength={5}
        maxLength={LIMITE}
        rows={2}
        placeholder="Ex.: Qual é o prazo final para enviar as fotos do telão?"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        required
      />
      {estado.erro && (
        <p role="alert" className="text-sm text-destructive">
          {estado.erro}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pendente}>
          {pendente ? <Spinner /> : <Send aria-hidden />}
          {pendente ? "Enviando…" : "Enviar dúvida"}
        </Button>
        {/* O contador só aparece perto do limite: antes disso é ruído. */}
        {texto.length > LIMITE - 100 && (
          <span className="ml-auto text-xs text-muted-foreground tabular-nums" aria-hidden>
            {texto.length}/{LIMITE}
          </span>
        )}
      </div>
    </form>
  );
}
