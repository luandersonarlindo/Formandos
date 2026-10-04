import type { Metadata } from "next";
import {
  Cabecalho,
  Catalogo,
  ChamadaFinal,
  ComoFunciona,
  Equipe,
  Hero,
  Ilustracao,
  Papeis,
  Recursos,
  Rodape,
} from "@/components/vitrine/secoes";
import { VitrineAnimada } from "@/components/vitrine/vitrine-animada";
import { getSessao } from "@/lib/dal";

export const metadata: Metadata = {
  title: { absolute: "Formandos · Gestão de formaturas e eventos" },
  description:
    "Enquetes, dúvidas, tarefas e fornecedores da sua turma num só lugar. Organize a formatura com participação de todos.",
};

// Vitrine do projeto. O conteúdo é todo renderizado no servidor; as animações
// (Anime.js) entram só no navegador, em VitrineAnimada.
export default async function Home() {
  const logado = Boolean(await getSessao());

  return (
    <VitrineAnimada>
      <Cabecalho logado={logado} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero logado={logado} />
        <Recursos />
        <ComoFunciona />
        <Catalogo />
        <Papeis />
        <Equipe />
        <Ilustracao />
        <ChamadaFinal logado={logado} />
      </main>
      <Rodape />
    </VitrineAnimada>
  );
}
