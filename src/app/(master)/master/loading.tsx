import { Skeleton } from "@/components/ui/skeleton";

export default function Carregando() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-4xl flex-col gap-4 2xl:max-w-6xl"
    >
      <span className="sr-only">Carregando…</span>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="mt-4 h-10 w-full" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
