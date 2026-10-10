import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DPO, EMPRESA } from "@/lib/empresa";

export const metadata: Metadata = { title: "Termos de Uso" };

// Termos de Uso. Públicos de propósito: aceitos no cadastro (checkbox) e
// legíveis sem login. Detalhe jurídico em docs/legislacao.md.
export default function TermosPage() {
  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-3xl px-4 py-10 outline-none">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground pointer-coarse:py-2.5"
      >
        <ArrowLeft className="size-4" aria-hidden /> Início
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">Termos de Uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">Versão 1.0 — 10/10/2026</p>

      <div className="mt-6 flex flex-col gap-5 text-[15px] leading-relaxed">
        <section>
          <h2 className="font-semibold">1. O serviço</h2>
          <p className="mt-1 text-muted-foreground">
            O {EMPRESA.nomeFantasia}, de {EMPRESA.razaoSocial}, organiza
            formaturas por turma: enquetes, dúvidas, tarefas, avisos, presença e
            fornecedores. Uso gratuito entre formandos.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">2. Conta e acesso</h2>
          <p className="mt-1 text-muted-foreground">
            Conta pessoal e intransferível, com email confirmado. Papéis:
            participante vota e envia dúvidas; administrador gerencia a turma;
            master administra a plataforma. É proibido operar conta alheia,
            adivinhar códigos de convite por força bruta ou raspar dados do
            serviço (rate limit e bloqueios aplicam-se).
          </p>
        </section>
        <section>
          <h2 className="font-semibold">3. Conteúdo da turma</h2>
          <p className="mt-1 text-muted-foreground">
            O autor pode editar/apagar a própria dúvida; o administrador modera
            (responde, destaca, apaga). Remoção de membro apaga o rastro dele na
            turma. Conteúdo ilícito é removido mediante denúncia ao DPO, sem
            prejuízo de ordem judicial (Marco Civil, art. 19).
          </p>
        </section>
        <section>
          <h2 className="font-semibold">4. Privacidade e dados</h2>
          <p className="mt-1 text-muted-foreground">
            O tratamento de dados segue a{" "}
            <Link href="/privacidade" className="underline underline-offset-4 hover:text-foreground">
              Política de Privacidade
            </Link>
            . Excluir a conta apaga seus dados e não pode ser desfeito.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">5. Disponibilidade e responsabilidade</h2>
          <p className="mt-1 text-muted-foreground">
            Serviço prestado como está, sem garantia de disponibilidade
            ininterrupta. Em nenhuma hipótese respondemos por lucros cessantes;
            nossa responsabilidade limita-se ao necessário para corrigir falhas
            do serviço.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">6. Mudanças e contato</h2>
          <p className="mt-1 text-muted-foreground">
            Estes termos podem mudar com aviso na plataforma. Dúvidas: {DPO.email}.
            Foro: domicílio do usuário, nos termos do CDC.
          </p>
        </section>
      </div>
    </main>
  );
}
