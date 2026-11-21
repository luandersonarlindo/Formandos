// Link de documento (ADR-0023): contrato ou orçamento no Drive, sem guardar
// arquivo. Mesma regra do link do mapa: só https://.

import { ehLinkHttps } from "./evento";

export const LINK_DOCUMENTO_MAX = 500;

export const AVISO_LINK_DOCUMENTO =
  "Confira se o arquivo no Drive está restrito a quem tem o link e se não tem dado pessoal de ninguém.";

// "" vira null; link inválido vira "invalido".
export function lerLinkDocumento(valor: unknown): string | null | "invalido" {
  const v = typeof valor === "string" ? valor.trim() : "";
  if (!v) return null;
  if (v.length > LINK_DOCUMENTO_MAX || !ehLinkHttps(v)) return "invalido";
  return v;
}

export const ERRO_LINK_DOCUMENTO = "O link do documento precisa começar com https:// e ter no máximo 500 caracteres.";
