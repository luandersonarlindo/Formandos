import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SCRIPT_TEMA } from "@/lib/tema";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Formandos", template: "%s · Formandos" },
  description: "Gestão administrativa de formaturas e eventos.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning neste elemento, e não no <body>: o script de
    // baixo roda antes da hidratação e põe aqui o .dark e o data-tema, que o
    // render do servidor não tem. O React reclama de atributo divergente e o
    // valor correto é justamente o que o script escreveu. Vale só para os
    // atributos deste elemento, não para os filhos.
    //
    // No <body> a mesma marca é para extensões do navegador (ex.: ColorZilla),
    // que põem atributos ali antes de o React hidratar.
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {/* Primeira coisa do <body>, e por isso executada antes de o navegador
            pintar qualquer conteúdo abaixo. Aplica o modo de cor guardado e marca
            o modo de movimento. Sem este script, quem escolheu "escuro" veria a
            página clara e depois escura. A string vem de lib/tema.ts, que também
            tem a lógica testada. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md focus:ring-2 focus:ring-ring"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
