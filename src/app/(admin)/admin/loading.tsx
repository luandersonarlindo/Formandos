import { Skeleton } from "@/components/ui/skeleton";

export default function Carregando() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-3xl flex-col gap-4"
    >
      <span className="sr-only">Carregando…</span>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="mt-4 h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
