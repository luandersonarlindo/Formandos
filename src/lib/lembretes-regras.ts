// Regras dos emails da turma (ADR-0006), sem banco: o que entra na janela de
// lembrete e o que mudou no evento.

import { calcularSituacao, type Lancamento, type Parcela } from "./situacao-regras";

export const HORAS_JANELA_VOTACAO = 48;
export const DIAS_JANELA_PARCELA = 2;

// Votação com prazo nas próximas 48 horas (prazo já vencido não entra).
export function votacaoNaJanela(prazo: Date, agora: Date, horas = HORAS_JANELA_VOTACAO): boolean {
  const limite = agora.getTime() + horas * 60 * 60 * 1000;
  return prazo.getTime() > agora.getTime() && prazo.getTime() <= limite;
}

// Soma dias a uma data "AAAA-MM-DD", sem fuso.
export function somarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

// Parcelas da pessoa em aberto que vencem de hoje até daqui a 2 dias. Usa a
// mesma conta de "Minha situação": o pago cobre as parcelas em ordem.
export function parcelasParaLembrar(
  parcelas: (Parcela & { id: string })[],
  lancamentos: Lancamento[],
  hoje: string,
  dias = DIAS_JANELA_PARCELA,
): { id: string; numero: number; vencimento: string; falta: number }[] {
  const ate = somarDias(hoje, dias);
  const situacao = calcularSituacao(parcelas, lancamentos, hoje);
  return situacao.parcelas
    .filter((p) => p.falta > 0 && p.vencimento >= hoje && p.vencimento <= ate)
    .map((p) => ({
      id: parcelas.find((x) => x.numero === p.numero)!.id,
      numero: p.numero,
      vencimento: p.vencimento,
      falta: p.falta,
    }));
}

// Estado do evento que importa para quem vai à festa. Data e horário vêm como
// "AAAA-MM-DDTHH:mm" (horário de Brasília) ou vazio.
export type EstadoEvento = { inicio: string; local: string; endereco: string };

export type MudancaEvento = {
  campo: "data" | "horario" | "local" | "endereco";
  rotulo: string;
  antes: string;
  depois: string;
};

const ROTULO_CAMPO: Record<MudancaEvento["campo"], string> = {
  data: "data",
  horario: "horário",
  local: "local",
  endereco: "endereço",
};

const diaBr = (inicio: string) => {
  const [a, m, d] = inicio.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
};
const horaBr = (inicio: string) => inicio.slice(11, 16);
const ouNada = (v: string) => v.trim() || "não informado";

// O que mudou entre dois estados do evento. Preencher pela primeira vez
// (antes vazio) não é mudança: ninguém precisa de email para "antes não tinha".
export function mudancasEvento(antes: EstadoEvento, depois: EstadoEvento): MudancaEvento[] {
  const mudancas: MudancaEvento[] = [];
  if (antes.inicio && depois.inicio !== antes.inicio) {
    if (!depois.inicio) {
      mudancas.push({ campo: "data", rotulo: "data", antes: diaBr(antes.inicio), depois: "a definir" });
    } else {
      if (antes.inicio.slice(0, 10) !== depois.inicio.slice(0, 10)) {
        mudancas.push({ campo: "data", rotulo: "data", antes: diaBr(antes.inicio), depois: diaBr(depois.inicio) });
      }
      if (horaBr(antes.inicio) !== horaBr(depois.inicio)) {
        mudancas.push({ campo: "horario", rotulo: "horário", antes: horaBr(antes.inicio), depois: horaBr(depois.inicio) });
      }
    }
  }
  for (const campo of ["local", "endereco"] as const) {
    const a = antes[campo].trim();
    const d = depois[campo].trim();
    if (a && a !== d) {
      mudancas.push({ campo, rotulo: ROTULO_CAMPO[campo], antes: ouNada(a), depois: ouNada(d) });
    }
  }
  return mudancas;
}

// "horário", "data e local", "data, horário e local".
export function listarRotulos(mudancas: MudancaEvento[]): string {
  const r = mudancas.map((m) => m.rotulo);
  if (r.length <= 1) return r.join("");
  return `${r.slice(0, -1).join(", ")} e ${r.at(-1)}`;
}
