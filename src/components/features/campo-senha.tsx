"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

// Campo de senha com botão de mostrar e ocultar.
export function CampoSenha({
  id,
  name,
  autoComplete,
  minLength,
}: {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
}) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={mostrar ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        className="h-10 pr-10"
        required
      />
      <button
        type="button"
        onClick={() => setMostrar(!mostrar)}
        aria-label={mostrar ? "Ocultar a senha" : "Mostrar a senha"}
        aria-pressed={mostrar}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {mostrar ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
