"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  // Rotas "raiz" (ex.: /admin) só ficam ativas quando a URL é exatamente igual.
  exato?: boolean;
  children: React.ReactNode;
};

export function NavLink({ href, exato = false, children }: NavLinkProps) {
  const pathname = usePathname();
  const ativo = exato
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        ativo && "bg-muted text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
