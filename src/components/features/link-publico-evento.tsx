"use client";

import { Globe, Link2Off, RefreshCw } from "lucide-react";
import type { EstadoForm } from "@/actions/tipos";
import { ligarPaginaPublica } from "@/actions/evento";
import { BotaoCopiar } from "@/components/features/botao-copiar";
import { AcaoForm, AcaoSeparador, MenuAcoes } from "@/components/features/menu-acoes";
import { Button } from "@/components/ui/button";

type Acao = (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;

// Link público do evento (ADR-0008): a comissão cria, copia, troca e desliga.
// Componente de cliente porque o "Copiar link" monta o endereço no clique.
// Quem tem o link vê só o evento e a programação, sem login, e não entra na
// turma (é outro código, não o de convite). Trocar e desligar são raros e
// quebram o link que já circula: ficam no "⋯" (plano de UX, Fase 3).
export function LinkPublicoEvento({
  token,
  trocar,
  desligar,
}: {
  token: string | null;
  trocar: Acao;
  desligar: Acao;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground text-pretty">
        Página sem login, só com data, horário, local, traje e programação. Não mostra ninguém da turma e não dá
        entrada nela.
      </p>
      {token ? (
        <>
          <p className="rounded-md bg-muted px-2 py-1 font-mono text-xs break-all" data-link-publico>
            /evento/{token}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <BotaoCopiar
              variante="outline"
              rotulo="Copiar link"
              montarTexto={() => `${window.location.origin}/evento/${token}`}
            />
            <Button asChild variant="ghost">
              <a href={`/evento/${token}`} target="_blank" rel="noopener noreferrer">
                <Globe aria-hidden /> Ver como a família vê
                <span className="sr-only">(abre em outra aba)</span>
              </a>
            </Button>
            <MenuAcoes nome="link público do evento">
              <AcaoForm acao={trocar} campos={{}} icone={<RefreshCw aria-hidden />}>
                Gerar outro link
              </AcaoForm>
              <AcaoSeparador />
              <AcaoForm acao={desligar} campos={{}} icone={<Link2Off aria-hidden />} destrutiva>
                Desligar
              </AcaoForm>
            </MenuAcoes>
          </div>
          <p className="text-xs text-muted-foreground">Gerar outro link faz o atual parar de funcionar.</p>
        </>
      ) : (
        <form action={ligarPaginaPublica}>
          <Button type="submit" variant="outline">
            <Globe aria-hidden /> Criar link para família e convidados
          </Button>
        </form>
      )}
    </div>
  );
}
