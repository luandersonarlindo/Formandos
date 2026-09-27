"use client";

import { usePathname } from "next/navigation";
import { Archive } from "lucide-react";

// Caminhos que continuam funcionando com a turma arquivada: é de onde o admin
// desarquiva ou exclui.
const CAMINHOS_LIVRES = ["/admin/turma"];

// Em turma arquivada, mostra a faixa de aviso e desativa todos os campos e
// botões de envio da página (`<fieldset disabled>`). É só a parte visível: quem
// impede a alteração de verdade são as Server Actions (exigirMembroEditavel).
// Envolve o AnimarPagina por fora, sem elemento entre ele e a página: a animação
// depende de mexer nos filhos diretos da página.
export function ConteudoTurma({
  arquivadaEm,
  children,
}: {
  arquivadaEm: string | null;
  children: React.ReactNode;
}) {
  const caminho = usePathname();
  if (!arquivadaEm) return <>{children}</>;

  const livre = CAMINHOS_LIVRES.includes(caminho);
  const data = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(arquivadaEm));

  return (
    <>
      <div
        role="status"
        className="mx-auto mb-6 flex w-full max-w-4xl items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm 2xl:max-w-6xl"
      >
        <Archive className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
        <p className="text-pretty">
          <strong className="font-medium">Turma arquivada em {data}.</strong> Todo o registro continua
          disponível, mas nada pode ser alterado.
        </p>
      </div>
      {livre ? (
        children
      ) : (
        <fieldset disabled className="m-0 min-w-0 border-0 p-0">
          {children}
        </fieldset>
      )}
    </>
  );
}
