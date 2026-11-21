import type { Metadata } from "next";
import Link from "next/link";
import { LinkVoltar } from "@/components/features/link-voltar";
import { DPO, EMPRESA } from "@/lib/empresa";

// Os ids batem com os das seções abaixo.
const SUMARIO: [string, string][] = [
  ["quem-trata-seus-dados", "Quem trata seus dados"],
  ["o-que-coletamos-e-para-que", "O que coletamos e para quê"],
  ["menores-de-18-anos", "Menores de 18 anos"],
  ["com-quem-compartilhamos", "Com quem compartilhamos"],
  ["emails-da-turma", "Emails da turma"],
  ["convites-por-email", "Convites por email"],
  ["seus-direitos", "Seus direitos (LGPD, art. 18)"],
  ["por-quanto-tempo-guardamos", "Por quanto tempo guardamos"],
  ["seguranca", "Segurança"],
  ["fale-conosco-e-reclame", "Fale conosco e reclame"],
];

export const metadata: Metadata = { title: "Política de Privacidade" };

// Política de Privacidade (LGPD). Texto curto e em PT direto: o detalhamento
// jurídico fica em docs/auditoria-direitos/legislacao.md. Pública de propósito: o titular lê
// antes de criar a conta.
export default function PrivacidadePage() {
  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-3xl px-4 py-10 outline-none">
      <LinkVoltar href="/">Início</LinkVoltar>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Versão 1.1 — 12/11/2026</p>

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
        <section id="quem-trata-seus-dados" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">Quem trata seus dados</h2>
          <p className="mt-1 text-muted-foreground">
            {EMPRESA.razaoSocial} ({EMPRESA.nomeFantasia}), responsável {EMPRESA.responsavel}.
            Encarregado (DPO): {DPO.nome} — {DPO.email}.
          </p>
        </section>
        <section id="o-que-coletamos-e-para-que" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">O que coletamos e para quê</h2>
          <p className="mt-1 text-muted-foreground">
            Nome, email e o conteúdo da sua formatura (turmas, votos, presenças,
            dúvidas, tarefas, fornecedores). Finalidade única: organizar a
            formatura da sua turma. Base legal: seu consentimento no cadastro e o
            legítimo interesse na operação das turmas. Não coletamos dado
            sensível e não vendemos nem alugamos seus dados.
          </p>
          <p className="mt-2 text-muted-foreground">
            Voto: a comissão da turma vê em qual opção você votou, menos nas
            perguntas marcadas como voto secreto. Nessas, nenhuma tela e
            nenhuma planilha mostra a sua escolha. O voto continua ligado à sua
            conta no banco de dados, para você poder trocar de voto e para
            valer um voto por pessoa.
          </p>
          <p className="mt-2 text-muted-foreground">
            Acompanhantes: para a lista de entrada do evento, guardamos o nome
            dos acompanhantes que você informar e se cada um é adulto ou
            criança. Só você e a comissão veem. Os nomes são apagados junto com
            a sua resposta de presença.
          </p>
        </section>
        <section id="menores-de-18-anos" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">Menores de 18 anos</h2>
          <p className="mt-1 text-muted-foreground">
            O {EMPRESA.nomeFantasia} é para quem tem 18 anos ou mais. Não
            coletamos dados de menores de propósito. Se soubermos de uma conta de
            menor, ela é excluída. O responsável pode pedir a exclusão pelo
            email do DPO acima.
          </p>
        </section>
        <section id="com-quem-compartilhamos" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">Com quem compartilhamos</h2>
          <p className="mt-1 text-muted-foreground">
            Só operadores técnicos: hospedagem, banco de dados, login (Google,
            se você escolher) e envio de emails. Nada além do necessário para o
            app funcionar.
          </p>
        </section>
        <section id="emails-da-turma" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">Emails da turma</h2>
          <p className="mt-1 text-muted-foreground">
            Mandamos email só quando a comissão fixa uma decisão, quando muda a data,
            o horário ou o local da festa, e dois dias antes de uma votação fechar,
            de uma parcela sua vencer ou de a lista de presença fechar. Você desliga quando quiser em Minha conta.
            Chegam sempre os emails da conta (confirmação e senha) e os avisos de
            exclusão da turma, porque são sobre os seus dados.
          </p>
        </section>
        <section id="convites-por-email" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">Convites por email</h2>
          <p className="mt-1 text-muted-foreground">
            A comissão pode colar uma lista de emails para convidar a turma. Quem
            recebe o convite não ganha conta nem entra na turma sem tocar no link. O
            endereço de quem não entrou é apagado em 90 dias, ou antes, se a comissão
            tirar da lista.
          </p>
        </section>
        <section id="seus-direitos" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">Seus direitos (LGPD, art. 18)</h2>
          <p className="mt-1 text-muted-foreground">
            Confirmar, acessar, corrigir, anonimizar, bloquear, eliminar, levar
            seus dados (portabilidade) e revogar o consentimento. Como exercer:
            na página <Link href="/conta" className="underline underline-offset-4 hover:text-foreground">Minha conta</Link> (corrigir
            nome, baixar seus dados em JSON, excluir a conta) ou pelo email do
            DPO acima. Excluir a conta revoga o consentimento e apaga seus dados.
          </p>
        </section>
        <section id="por-quanto-tempo-guardamos" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">Por quanto tempo guardamos</h2>
          <p className="mt-1 text-muted-foreground">
            Enquanto a conta existir. Conta excluída = dados apagados, sem
            recuperação. Registros de auditoria seguem retenção própria
            (6 meses a 5 anos, conforme o tipo).
          </p>
          <p className="mt-2 text-muted-foreground">
            Turma: ao arquivar, a comissão escolhe em quantos dias tudo será
            excluído (de 30 a 180). Todos os membros recebem um email nessa hora e
            outro 7 dias antes. Quando a turma é excluída, apagamos tudo dela,
            inclusive o histórico. Guardamos só o nome da turma e a data da
            exclusão, por 5 anos.
          </p>
          <p className="mt-2 text-muted-foreground">
            Cópias de segurança do banco são apagadas em até 30 dias. Dado
            excluído some das cópias nesse prazo.
          </p>
        </section>
        <section id="seguranca" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">Segurança</h2>
          <p className="mt-1 text-muted-foreground">
            Senha com hash (nunca texto puro), email confirmado obrigatório,
            acesso por papéis (participante, administrador, master) e validação
            de toda entrada. Incidentes seguem a nossa Política de Segurança da
            Informação, com comunicação à ANPD e aos titulares quando a lei
            exigir.
          </p>
        </section>
        <section id="fale-conosco-e-reclame" className="scroll-mt-6">
          <h2 className="text-lg font-semibold">Fale conosco e reclame</h2>
          <p className="mt-1 text-muted-foreground">
            Dúvidas ou pedidos: {DPO.email}. Você também pode reclamar à ANPD
            (Autoridade Nacional de Proteção de Dados).
          </p>
        </section>
      </div>
    </main>
  );
}
