import type { Metadata } from "next";
import { regenerarConvite } from "@/actions/admin";
import { LogIn, RefreshCw, Share2, UserPlus } from "lucide-react";
import { BotaoConvite } from "@/components/features/botao-convite";
import { BotaoCopiar } from "@/components/features/botao-copiar";
import { FormDialog } from "@/components/features/form-dialog";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { exigirAdmin } from "@/lib/dal";
import { pool } from "@/lib/db";

export const metadata: Metadata = { title: "Código de convite" };

export default async function ConviteAdminPage() {
  const admin = await exigirAdmin();
  const { rows } = await pool.query(
    "select codigo_convite from turmas where id = $1",
    [admin.turmaId],
  );
  const codigo: string = rows[0].codigo_convite;

  const passos = [
    { icone: Share2, titulo: "Compartilhe o código", texto: "Envie no grupo da turma ou por mensagem." },
    { icone: LogIn, titulo: "A pessoa entra", texto: "Ela faz login e digita o código em “Entrar em uma turma”." },
    { icone: UserPlus, titulo: "Vira participante", texto: "Você pode promover quem quiser a administrador em Membros." },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl 2xl:max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Código de convite
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
        Quem tiver este código entra na turma como participante. Compartilhe
        apenas com a turma.
      </p>

      <Card className="vitrine-fundo-hero mt-6">
        <CardHeader>
          <CardDescription>Código atual de {admin.turmaNome}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p
            aria-label={`Código de convite: ${codigo}`}
            className="flex flex-wrap gap-2"
          >
            {[...codigo].map((letra, i) => (
              <span
                key={i}
                aria-hidden
                className="vitrine-texto-gradiente flex h-14 w-11 items-center justify-center rounded-xl border bg-background/80 font-mono text-3xl font-semibold sm:h-16 sm:w-13 sm:text-4xl"
              >
                {letra}
              </span>
            ))}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <BotaoCopiar texto={codigo} rotulo="Copiar código" />
            <BotaoConvite nomeTurma={admin.turmaNome} codigo={codigo} />
          </div>
        </CardContent>
      </Card>

      <ol data-grupo className="mt-6 grid gap-4 md:grid-cols-3">
        {passos.map(({ icone: Icone, titulo, texto }, i) => (
          <li key={titulo} className="rounded-xl border bg-card p-4">
            <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/50 text-[var(--vitrine-a)]">
              <Icone className="size-5" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-medium">
              {i + 1}. {titulo}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
          </li>
        ))}
      </ol>

      <Card className="mt-6 border border-dashed bg-transparent ring-0">
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium">Gerar um novo código</p>
            <p className="text-sm text-muted-foreground">
              O código anterior deixa de funcionar. Quem já entrou continua na turma.
            </p>
          </div>
          <FormDialog
            rotulo="Gerar novo código"
            icone={<RefreshCw aria-hidden />}
            titulo="Gerar um novo código"
            descricao="O código anterior deixa de funcionar. Quem já entrou continua na turma."
            acao={regenerarConvite}
            rotuloSubmit="Gerar novo código"
            rotuloPendente="Gerando…"
          />
        </CardContent>
      </Card>
    </div>
  );
}
