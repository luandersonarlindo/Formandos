import { cn } from "@/lib/utils";

// Foto da conta (Google) ou, sem foto, um círculo com a inicial do nome.
export function AvatarUsuario({
  nome,
  imagem,
  className,
}: {
  nome: string;
  imagem?: string | null;
  className?: string;
}) {
  if (imagem) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imagem}
        alt=""
        referrerPolicy="no-referrer"
        className={cn("size-9 shrink-0 rounded-full", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--vitrine-a),var(--vitrine-b))] text-sm font-semibold text-white",
        className,
      )}
    >
      {(nome.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}
