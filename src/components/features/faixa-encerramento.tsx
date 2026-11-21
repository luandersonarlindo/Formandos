import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { dataBr, dataEncerramento } from "@/lib/encerramento";

// Faixa do encerramento do site (ADR-0021), no topo de todas as telas,
// inclusive a vitrine. Só aparece com ENCERRAMENTO_EM definida.
export function FaixaEncerramento() {
  const data = dataEncerramento();
  if (!data) return null;
  return (
    <div
      role="status"
      className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-center text-sm text-pretty print:hidden"
    >
      <TriangleAlert className="mr-1.5 inline size-4 align-[-3px] text-amber-700 dark:text-amber-400" aria-hidden />
      <strong className="font-medium">O Formandos será encerrado em {dataBr(data)}.</strong> Até lá tudo continua
      funcionando. Baixe seus dados em{" "}
      <Link href="/conta" className="underline underline-offset-4">
        Minha conta
      </Link>{" "}
      e o{" "}
      <Link href="/registro" className="underline underline-offset-4">
        registro da turma
      </Link>
      .
    </div>
  );
}
