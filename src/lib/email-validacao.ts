// Validação de email no cadastro: bloqueia provedores temporários
// (descartáveis) e aponta erros de digitação nos domínios mais comuns.
//
// Puro de propósito (sem `server-only`, sem dependência de Node): o mesmo
// módulo roda no formulário (resposta imediata) e no hook de criação do
// Better Auth (`auth.ts`), que barra quem pula o cliente.
//
// Duas listas, dois papéis: a curta (`DOMINIOS_DESCARTAVEIS`) vai no cliente
// (bundle pequeno, resposta imediata); a completa (pacote
// `disposable-domains`, 130 mil+ domínios) roda só no servidor, no hook.
// O servidor é superconjunto do cliente: tudo que o cliente barra, o
// servidor também barra.
//
// Sem "fuzzy matching" (Levenshtein) de propósito: `mail.com` é um provedor
// real a 1 edição de `gmail.com`, então distância bloquearia gente legítima.
// Só entra no mapa o erro com causa conhecida (letra trocada, transposição,
// TLD errado).

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function extrairDominio(email: string): string | null {
  const normalizado = normalizarEmail(email);
  const arroba = normalizado.lastIndexOf("@");
  if (arroba <= 0 || arroba === normalizado.length - 1) return null;
  const dominio = normalizado.slice(arroba + 1);
  if (dominio.includes(" ") || !dominio.includes(".")) return null;
  return dominio;
}

// Provedores de email temporário. A checagem cobre subdomínios
// (`alguem@mail.yopmail.com` cai no `yopmail.com`).
const DOMINIOS_DESCARTAVEIS = new Set([
  "mailinator.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "10minutemail.com",
  "10minutemail.net",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "sharklasers.com",
  "throwawaymail.com",
  "trashmail.com",
  "trash-mail.com",
  "maildrop.cc",
  "mailnesia.com",
  "getnada.com",
  "mohmal.com",
  "emailondeck.com",
  "fakeinbox.com",
  "dispostable.com",
  "mintemail.com",
  "mytrashmail.com",
  "mt2015.com",
  "no-spam.ws",
  "spamgourmet.com",
  "maileater.com",
  "meltmail.com",
  "pookmail.com",
  "spambog.com",
  "deadaddress.com",
  "e4ward.com",
  "owlymail.com",
]);

// Checagem genérica contra qualquer conjunto (lista curta do cliente ou
// lista completa do pacote no servidor). Cobre subdomínios:
// `alguem@mail.yopmail.com` cai no `yopmail.com`.
export function ehDescartavelEmLista(email: string, dominios: ReadonlySet<string>): boolean {
  const dominio = extrairDominio(email);
  if (!dominio) return false;
  const partes = dominio.split(".");
  for (let i = 0; i <= partes.length - 2; i++) {
    if (dominios.has(partes.slice(i).join("."))) return true;
  }
  return false;
}

export function ehDescartavel(email: string): boolean {
  return ehDescartavelEmLista(email, DOMINIOS_DESCARTAVEIS);
}

// Erro de digitação → domínio certo. Só erro atestado (tecla vizinha,
// letra trocada, TLD errado), nunca palpite por distância.
const CORRECOES_DOMINIO: Record<string, string> = {
  // Gmail
  "gmal.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmaiil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.comm": "gmail.com",
  "gnail.com": "gmail.com",
  // Hotmail
  "hotmal.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotamil.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotnail.com": "hotmail.com",
  "homtail.com": "hotmail.com",
  // Outlook / Live
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "outloook.com": "outlook.com",
  "outluk.com": "outlook.com",
  "live.con": "live.com",
  // Yahoo
  "yaho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yaoo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  // iCloud
  "icloud.con": "icloud.com",
  "iclound.com": "icloud.com",
  "iclod.com": "icloud.com",
  // UOL / BOL / Proton
  "uol.con.br": "uol.com.br",
  "uo.com.br": "uol.com.br",
  "uol.cm.br": "uol.com.br",
  "bol.con.br": "bol.com.br",
  "bol.cm.br": "bol.com.br",
  "protonamil.com": "protonmail.com",
  "protonmail.con": "protonmail.com",
};

export function sugerirDominio(dominio: string): string | null {
  return CORRECOES_DOMINIO[dominio.trim().toLowerCase()] ?? null;
}

export type ResultadoEmail =
  | { ok: true; email: string }
  | { ok: false; erro: string };

// Regra do cadastro (não do login: no login o erro genérico "email ou senha
// incorretos" continua valendo para não revelar quem tem conta).
export function validarEmailCadastro(email: string): ResultadoEmail {
  const normalizado = normalizarEmail(email);
  const dominio = extrairDominio(normalizado);
  if (!dominio) return { ok: false, erro: "Digite um email válido." };
  if (ehDescartavel(normalizado)) {
    return {
      ok: false,
      erro: "Esse provedor de email temporário não é aceito. Use seu email pessoal.",
    };
  }
  const sugestao = sugerirDominio(dominio);
  if (sugestao) {
    const usuario = normalizado.slice(0, normalizado.lastIndexOf("@"));
    return {
      ok: false,
      erro: `Verifique o domínio: você quis dizer ${usuario}@${sugestao}?`,
    };
  }
  return { ok: true, email: normalizado };
}
