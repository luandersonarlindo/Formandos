import * as React from "react";
import { cn } from "@/lib/utils";

// <select> nativo com o mesmo visual do Input. Funciona em formulários com
// Server Actions sem JavaScript no cliente.
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-8 pointer-coarse:h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:text-sm dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
