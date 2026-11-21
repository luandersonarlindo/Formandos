import { Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

// Dentro de um botão, o rótulo no gerúndio ("Salvando…") já diz o que está
// acontecendo: o spinner vai com aria-hidden. Solto na página, passe
// aria-label e role="status".
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      aria-hidden={props["aria-label"] ? undefined : true}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
