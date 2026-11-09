"use client";

import { Globe, Link2Off, RefreshCw } from "lucide-react";
import { desligarPaginaPublica, ligarPaginaPublica, trocarLinkPublico } from "@/actions/evento";
import { BotaoCopiar } from "@/components/features/botao-copiar";
import { Button } from "@/components/ui/button";

// Link público do evento (ADR-0008): a comissão cria, copia, troca e desliga.
// Componente de cliente porque o "Copiar link" monta o endereço no clique.
// Quem tem o link vê só o evento e a programação, sem login, e não entra na
// turma (é outro código, não o de convite).
export function LinkPublicoEvento({ token }: { token: string | null }) {
  return (
    <div className="basis-full rounded-xl border border-dashed p-3">
      <p className="flex items-center gap-1.5 text-sm font-medium">
        <Globe className="size-4 text-[var(--vitrine-a)]" aria-hidden /> Link para a família e os convidados
      </p>
      <p className="mt-1 text-xs text-muted-foreground text-pretty">
        Página sem login, só com data, horário, local, traje e programação. Não mostra ninguém da turma e não dá
        entrada nela.
      </p>
      {token ? (
        <div className="mt-2 flex flex-col gap-2">
          <p className="rounded-md bg-muted px-2 py-1 font-mono text-xs break-all" data-link-publico>
            /evento/{token}
          </p>
          <div className="flex flex-wrap gap-2">
            <BotaoCopiar
              variante="outline"
              rotulo="Copiar link"
              montarTexto={() => `${window.location.origin}/evento/${token}`}
            />
            <a
              href={`/evento/${token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm hover:bg-muted"
            >
              <Globe className="size-3.5" aria-hidden /> Ver como a família vê
            </a>
            <form action={trocarLinkPublico}>
              <Button type="submit" size="sm" variant="outline">
                <RefreshCw aria-hidden /> Gerar outro link
              </Button>
            </form>
            <form action={desligarPaginaPublica}>
              <Button type="submit" size="sm" variant="ghost">
                <Link2Off aria-hidden /> Desligar
              </Button>
            </form>
          </div>
          <p className="text-xs text-muted-foreground">Gerar outro link faz o atual parar de funcionar.</p>
        </div>
      ) : (
        <form action={ligarPaginaPublica} className="mt-2">
          <Button type="submit" size="sm">
            <Globe aria-hidden /> Criar link para família e convidados
          </Button>
        </form>
      )}
    </div>
  );
}
