import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Um jeito só de voltar um nível, nas sub-rotas. Alvo de 44px no toque.
export function LinkVoltar({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "-ml-1 inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-destaque transition-colors hover:underline underline-offset-4 pointer-coarse:min-h-11",
        className,
      )}
    >
      <ArrowLeft className="size-4" aria-hidden />
      {children}
    </Link>
  );
}
