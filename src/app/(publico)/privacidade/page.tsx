import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DPO, EMPRESA } from "@/lib/empresa";

export const metadata: Metadata = { title: "Política de Privacidade" };

// Política de Privacidade (LGPD). Texto curto e em PT direto: o detalhamento
// jurídico fica em docs/legislacao.md. Pública de propósito: o titular lê
// antes de criar a conta.
export default function PrivacidadePage() {
  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-3xl px-4 py-10 outline-none">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground pointer-coarse:py-2.5"
      >
        <ArrowLeft className="size-4" aria-hidden /> Início
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Versão 1.0 — 10/10/2026</p>

      <div className="mt-6 flex flex-col gap-5 text-[15px] leading-relaxed">
        <section>
          <h2 className="font-semibold">Quem trata seus dados</h2>
          <p className="mt-1 text-muted-foreground">
            {EMPRESA.razaoSocial} ({EMPRESA.nomeFantasia}), responsável {EMPRESA.responsavel}.
            Encarregado (DPO): {DPO.nome} — {DPO.email}.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">O que coletamos e para quê</h2>
          <p className="mt-1 text-muted-foreground">
            Nome, email e o conteúdo da sua formatura (turmas, votos, presenças,
            dúvidas, tarefas, fornecedores). Finalidade única: organizar a
            formatura da sua turma. Base legal: seu consentimento no cadastro e o
            legítimo interesse na operação das turmas. Não coletamos dado
            sensível e não vendemos nem alugamos seus dados.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Com quem compartilhamos</h2>
          <p className="mt-1 text-muted-foreground">
            Só operadores técnicos: hospedagem, banco de dados, login (Google,
            se você escolher) e envio de emails. Nada além do necessário para o
            app funcionar.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Seus direitos (LGPD, art. 18)</h2>
          <p className="mt-1 text-muted-foreground">
            Confirmar, acessar, corrigir, anonimizar, bloquear, eliminar, levar
            seus dados (portabilidade) e revogar o consentimento. Como exercer:
            na página <Link href="/conta" className="underline underline-offset-4 hover:text-foreground">Minha conta</Link> (corrigir
            nome, baixar seus dados em JSON, excluir a conta) ou pelo email do
            DPO acima. Excluir a conta revoga o consentimento e apaga seus dados.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Por quanto tempo guardamos</h2>
          <p className="mt-1 text-muted-foreground">
            Enquanto a conta existir. Conta excluída = dados apagados, sem
            recuperação. Registros de auditoria seguem retenção própria
            (6 meses a 5 anos, conforme o tipo).
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Segurança</h2>
          <p className="mt-1 text-muted-foreground">
            Senha com hash (nunca texto puro), email confirmado obrigatório,
            acesso por papéis (participante, administrador, master) e validação
            de toda entrada. Incidentes seguem a Política de Segurança
            (`docs/PSI.md`), com comunicação à ANPD e aos titulares quando a lei
            exigir.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">Fale conosco e reclame</h2>
          <p className="mt-1 text-muted-foreground">
            Dúvidas ou pedidos: {DPO.email}. Você também pode reclamar à ANPD
            (Autoridade Nacional de Proteção de Dados).
          </p>
        </section>
      </div>
    </main>
  );
}
