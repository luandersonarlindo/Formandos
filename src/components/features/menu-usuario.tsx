"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronsUpDown, LogOut, Palette, ShieldCheck, UserRound } from "lucide-react";
import { ItensTema, useTema } from "@/components/features/alternador-tema";
import { AvatarUsuario } from "@/components/features/avatar-usuario";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

// Menu da pessoa, no rodapé da sidebar: conta, tema, gestão da plataforma
// (master) e sair. Antes, "Minha conta" e "Gestão da plataforma" eram links
// soltos que sumiam com a sidebar recolhida, e o tema ocupava o cabeçalho de
// todas as telas.
export function MenuUsuario({
  usuario,
  master,
  extras = [],
}: {
  usuario: { nome: string; email: string; imagem?: string | null };
  master: boolean;
  /** Links a mais no topo do menu (ex.: "Voltar para a turma" na área master). */
  extras?: { href: string; rotulo: string }[];
}) {
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();
  const { tema, escolher } = useTema();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" tooltip={isMobile ? undefined : usuario.nome} aria-label={`Conta de ${usuario.nome}: menu`}>
          <AvatarUsuario nome={usuario.nome} imagem={usuario.imagem} className="size-8" />
          <span className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="truncate text-sm font-medium">{usuario.nome}</span>
            <span className="truncate text-xs text-muted-foreground">{usuario.email}</span>
          </span>
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" aria-hidden />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" className="min-w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-medium">{usuario.nome}</span>
          <span className="block truncate text-xs text-muted-foreground">{usuario.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {extras.map((e) => (
          <DropdownMenuItem key={e.href} asChild>
            <Link href={e.href} onClick={() => setOpenMobile(false)}>
              {e.rotulo}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild>
          <Link href="/conta" onClick={() => setOpenMobile(false)}>
            <UserRound aria-hidden />
            Minha conta
          </Link>
        </DropdownMenuItem>
        {master && (
          <DropdownMenuItem asChild>
            <Link href="/master" onClick={() => setOpenMobile(false)}>
              <ShieldCheck aria-hidden />
              Gestão da plataforma
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette aria-hidden />
            Tema
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-40">
            <ItensTema tema={tema} escolher={escolher} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={saindo}
          onSelect={(e) => {
            e.preventDefault();
            void sair();
          }}
        >
          <LogOut aria-hidden />
          {saindo ? "Saindo…" : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
