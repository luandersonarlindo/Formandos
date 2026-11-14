import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BotaoImprimir } from "@/components/features/botao-imprimir";
import { exigirAdmin } from "@/lib/dal";
import { formatarDataHora } from "@/lib/datas";
import { getResumoPresenca, listarPortaria } from "@/lib/presenca";

export const metadata: Metadata = { title: "Lista da portaria" };

// Lista de entrada do evento (ADR-0013): uma linha por pessoa que confirmou,
// com os acompanhantes pelo nome, em ordem alfabética. Feita para imprimir.
export default async function ListaPortariaPage() {
  const admin = await exigirAdmin();
  const [linhas, resumo] = await Promise.all([
    listarPortaria(admin.turmaId),
    getResumoPresenca(admin.turmaId),
  ]);
  const geradoEm = formatarDataHora.format(new Date());

  return (
    <div className="mx-auto w-full max-w-3xl print:max-w-none">
      <Link
        href="/admin/presenca"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground print:hidden"
      >
        <ArrowLeft className="size-4" aria-hidden /> Presença
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Lista da portaria · gerada em {geradoEm}</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{admin.turmaNome}</h1>
        </div>
        <BotaoImprimir rotulo="Imprimir ou salvar como PDF" />
      </div>
      <p className="mt-3 text-sm">
        <strong className="font-medium">
          {resumo.pessoas} {resumo.pessoas === 1 ? "pessoa" : "pessoas"}
        </strong>
        : {resumo.adultos} {resumo.adultos === 1 ? "adulto" : "adultos"} e {resumo.criancas}{" "}
        {resumo.criancas === 1 ? "criança" : "crianças"}.
        {resumo.semNome > 0 &&
          ` ${resumo.semNome} ${resumo.semNome === 1 ? "acompanhante ainda sem nome" : "acompanhantes ainda sem nome"}.`}
      </p>
      <p className="mt-1 text-sm text-muted-foreground print:hidden">
        Só entra quem respondeu “Vou”. Fora da lista: {resumo.talvez} em dúvida e {resumo.pendente} sem
        resposta.
      </p>

      {linhas.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Ninguém confirmou presença ainda.</p>
      ) : (
        <table className="mt-6 w-full border-collapse text-sm">
          <caption className="sr-only">Pessoas que confirmaram presença, em ordem alfabética</caption>
          <thead>
            <tr className="border-b text-left">
              <th scope="col" className="w-10 py-2 pr-2 font-medium tabular-nums">Nº</th>
              <th scope="col" className="py-2 pr-2 font-medium">Nome</th>
              <th scope="col" className="py-2 pr-2 font-medium">Tipo</th>
              <th scope="col" className="py-2 font-medium">Convidado de</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l, i) => (
              <tr key={i} className="border-b break-inside-avoid">
                <td className="py-2 pr-2 text-muted-foreground tabular-nums">{i + 1}</td>
                <td className="py-2 pr-2 wrap-break-word">{l.nome}</td>
                <td className="py-2 pr-2">{l.tipo}</td>
                <td className="py-2 wrap-break-word">{l.convidadoDe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
