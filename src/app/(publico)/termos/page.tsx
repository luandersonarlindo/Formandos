import type { Metadata } from "next";
import Link from "next/link";
import { LinkVoltar } from "@/components/features/link-voltar";
import { DPO, EMPRESA } from "@/lib/empresa";

// Os ids batem com os das seções abaixo.
const SUMARIO: [string, string][] = [
  ["o-servico", "1. O serviço"],
  ["quem-pode-usar", "2. Quem pode usar"],
  ["conta-e-acesso", "3. Conta e acesso"],
  ["conteudo-da-turma", "4. Conteúdo da turma"],
  ["privacidade-e-dados", "5. Privacidade e dados"],
  ["disponibilidade-e-responsabilidade", "6. Disponibilidade e responsabilidade"],
  ["se-o-formandos-for-encerrado", "7. Se o Formandos for encerrado"],
  ["mudancas-e-contato", "8. Mudanças e contato"],
];

export const metadata: Metadata = { title: "Termos de Uso" };

// Termos de Uso. Públicos de propósito: aceitos no cadastro (checkbox) e
// legíveis sem login. Detalhe jurídico em docs/auditoria-direitos/legislacao.md.
export default function TermosPage() {
  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-3xl px-4 py-10 outline-none">
      <LinkVoltar href="/">Início</LinkVoltar>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">Termos de Uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">Versão 1.1 — 12/11/2026. Mudou nesta versão: a seção 2, “Quem pode usar”.</p>

      {/* Sumário: no celular, chegar em "Seus direitos" exigia rolar a página
          toda. O texto segue inteiro e visível (é texto legal e se imprime). */}
      <nav aria-label="Nesta página" className="mt-6 rounded-lg border p-4 text-sm print:hidden">
        <p className="font-medium">Nesta página</p>
        <ol className="mt-2 grid gap-x-6 gap-y-1 text-muted-foreground sm:grid-cols-2">
          {SUMARIO.map(([id, titulo]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="inline-flex py-0.5 underline-offset-4 hover:text-foreground hover:underline pointer-coarse:min-h-11 pointer-coarse:items-center"
              >
                {titulo}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-8 flex flex-col gap-8 text-[15px] leading-relaxed">
        <section id="o-servico" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">1. O serviço</h2>
          <p className="mt-1 text-muted-foreground">
            O {EMPRESA.nomeFantasia}, de {EMPRESA.razaoSocial}, organiza
            formaturas por turma: enquetes, dúvidas, tarefas, avisos, presença e
            fornecedores. Uso gratuito entre formandos.
          </p>
        </section>
        <section id="quem-pode-usar" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">2. Quem pode usar</h2>
          <p className="mt-1 text-muted-foreground">
            A conta é para quem tem 18 anos ou mais. Em turmas de crianças e
            adolescentes, quem cria conta, vota e confirma presença é o pai, a
            mãe ou o responsável. Conta de menor de 18 anos é excluída quando
            identificada. A comissão não deve escrever dados de crianças (nome
            completo, foto, saúde) em avisos, dúvidas e observações além do
            necessário para organizar o evento.
          </p>
        </section>
        <section id="conta-e-acesso" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">3. Conta e acesso</h2>
          <p className="mt-1 text-muted-foreground">
            Conta pessoal e intransferível, com email confirmado. Papéis:
            participante vota e envia dúvidas; administrador gerencia a turma;
            master administra a plataforma. É proibido operar conta alheia,
            adivinhar códigos de convite por força bruta ou raspar dados do
            serviço (rate limit e bloqueios aplicam-se).
          </p>
        </section>
        <section id="conteudo-da-turma" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">4. Conteúdo da turma</h2>
          <p className="mt-1 text-muted-foreground">
            O autor pode editar/apagar a própria dúvida; o administrador modera
            (responde, destaca, apaga). Remoção de membro apaga o rastro dele na
            turma. Conteúdo ilícito é removido mediante denúncia ao DPO, sem
            prejuízo de ordem judicial (Marco Civil, art. 19).
          </p>
        </section>
        <section id="privacidade-e-dados" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">5. Privacidade e dados</h2>
          <p className="mt-1 text-muted-foreground">
            O tratamento de dados segue a{" "}
            <Link href="/privacidade" className="underline underline-offset-4 hover:text-foreground">
              Política de Privacidade
            </Link>
            . Excluir a conta apaga seus dados e não pode ser desfeito.
          </p>
        </section>
        <section id="disponibilidade-e-responsabilidade" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">6. Disponibilidade e responsabilidade</h2>
          <p className="mt-1 text-muted-foreground">
            Serviço prestado como está, sem garantia de disponibilidade
            ininterrupta. Em nenhuma hipótese respondemos por lucros cessantes;
            nossa responsabilidade limita-se ao necessário para corrigir falhas
            do serviço.
          </p>
        </section>
        <section id="se-o-formandos-for-encerrado" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">7. Se o Formandos for encerrado</h2>
          <p className="mt-1 text-muted-foreground">
            Avisamos todos os usuários com 60 dias de antecedência: por email,
            a todos com conta, mesmo a quem desligou os emails da turma, e numa
            faixa no topo de todas as telas do site. Nesse prazo, não se cria
            turma nova, mas tudo continua funcionando: cada pessoa baixa os
            próprios dados em Minha conta e o registro da turma. No fim do prazo, todos os
            dados são apagados, e as cópias de segurança somem em até 30 dias.
            Quem mantém o site é {EMPRESA.responsavel}. Se outra pessoa assumir,
            todos são avisados por email antes, com o nome de quem assume.
          </p>
        </section>
        <section id="mudancas-e-contato" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">8. Mudanças e contato</h2>
          <p className="mt-1 text-muted-foreground">
            Estes termos podem mudar com aviso na plataforma. Dúvidas: {DPO.email}.
            Foro: domicílio do usuário, nos termos do CDC.
          </p>
        </section>
      </div>
    </main>
  );
}
