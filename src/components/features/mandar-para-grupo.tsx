"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCopiar } from "@/hooks/use-copiar";
import {
  linkWhatsApp,
  textoAviso,
  textoDecisao,
  textoEvento,
  textoVotacao,
  type DadosDecisao,
  type DadosEvento,
  type DadosVotacao,
} from "@/lib/texto-whatsapp";

// "Mandar para o grupo" (ADR-0004): texto pronto para a comissão colar no
// grupo da turma. O diálogo mostra a prévia numa caixa editável (a comissão
// pode acrescentar uma linha antes de mandar; nada é salvo), com "Copiar texto"
// e "Abrir no WhatsApp". Os dados chegam do servidor e o texto é montado aqui,
// ao abrir, porque precisa do endereço do site (window.location.origin).

type Conteudo =
  | { tipo: "aviso"; dados: { titulo: string; conteudo: string } }
  | { tipo: "votacao"; dados: DadosVotacao }
  | { tipo: "decisao"; dados: DadosDecisao }
  | { tipo: "evento"; dados: DadosEvento };

function montar(c: Conteudo, origem: string) {
  switch (c.tipo) {
    case "aviso":
      return textoAviso(c.dados, origem);
    case "votacao":
      return textoVotacao(c.dados, origem);
    case "decisao":
      return textoDecisao(c.dados, origem);
    case "evento":
      return textoEvento(c.dados, origem);
  }
}

export function MandarParaGrupo({ conteudo }: { conteudo: Conteudo }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const { estado, copiar } = useCopiar();

  function abrir(valor: boolean) {
    // Remonta a cada abertura: os dados podem ter mudado (votos, prazo) e o
    // texto editado da vez anterior não deve voltar.
    if (valor) setTexto(montar(conteudo, window.location.origin));
    setAberto(valor);
  }

  return (
    <Dialog open={aberto} onOpenChange={abrir}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="shrink-0">
          <Share2 aria-hidden /> Mandar para o grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mandar para o grupo da turma</DialogTitle>
          <DialogDescription>
            Confira e, se quiser, mude o texto antes de mandar. O que você mudar aqui não fica salvo no site.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="texto-grupo" className="text-xs">
            Texto da mensagem
          </Label>
          <Textarea
            id="texto-grupo"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            // Tamanho fixo: com field-sizing-content (padrão do Textarea), o link
            // longo e sem espaço alargava a caixa e cortava o texto no celular.
            rows={9}
            className="max-h-[50vh] w-full min-w-0 text-sm [field-sizing:fixed] wrap-anywhere"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={() => copiar(texto)} disabled={!texto.trim()}>
            {estado === "copiado" ? <Check aria-hidden /> : <Copy aria-hidden />}
            {estado === "copiado" ? "Copiado!" : "Copiar texto"}
          </Button>
          <Button asChild variant="outline">
            <a href={linkWhatsApp(texto)} target="_blank" rel="noopener noreferrer">
              <Share2 aria-hidden /> Abrir no WhatsApp
              <span className="sr-only">(abre em outra aba)</span>
            </a>
          </Button>
        </div>
        <span role="status" className="sr-only">
          {estado === "copiado" ? "Texto copiado." : estado === "erro" ? "Não foi possível copiar." : ""}
        </span>
        {estado === "erro" && (
          <p className="text-sm text-destructive" aria-hidden>
            Não foi possível copiar. Selecione o texto na caixa e copie à mão.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
