// Situação financeira de uma pessoa na turma (ADR-0005), sem acesso ao banco.
//
// Os lançamentos não apontam para uma parcela: o total pago é aplicado às
// parcelas em ordem de vencimento. Assim R$ 200 cobrem duas parcelas de
// R$ 100, R$ 50 deixam metade de uma, e ninguém escolhe "qual parcela" ao
// lançar. Só lançamentos confirmados entram aqui.
//
// Contas em centavos (inteiros) para não acumular erro de ponto flutuante.
// Datas como texto "AAAA-MM-DD": compara direto, sem fuso.

export type Parcela = { numero: number; valor: number; vencimento: string };
export type TipoLancamento = "pagamento" | "devolucao" | "ajuste";
export type Lancamento = { tipo: TipoLancamento; valor: number };

export type EstadoParcela = "paga" | "parcial" | "vencida" | "a_vencer";
export type EstadoGeral = "sem_plano" | "quitado" | "atrasado" | "em_dia" | "adiantado";

export type ParcelaCalculada = Parcela & {
  estado: EstadoParcela;
  // Quanto do pago foi aplicado nesta parcela e quanto falta nela.
  coberto: number;
  falta: number;
  // Venceu (antes de hoje) e não está paga por inteiro.
  emAtraso: boolean;
};

export type Situacao = {
  estado: EstadoGeral;
  totalPlano: number;
  pago: number;
  falta: number;
  parcelas: ParcelaCalculada[];
  proxima: { numero: number; vencimento: string; falta: number } | null;
};

const centavos = (v: number) => Math.round(v * 100);
const reais = (c: number) => c / 100;

export function calcularSituacao(
  parcelas: Parcela[],
  lancamentos: Lancamento[],
  hoje: string,
): Situacao {
  const ordenadas = [...parcelas].sort(
    (a, b) => a.vencimento.localeCompare(b.vencimento) || a.numero - b.numero,
  );
  const pagoC = lancamentos.reduce(
    (soma, l) => soma + (l.tipo === "devolucao" ? -centavos(l.valor) : centavos(l.valor)),
    0,
  );
  const totalC = ordenadas.reduce((soma, p) => soma + centavos(p.valor), 0);

  let restante = Math.max(0, pagoC);
  const calculadas: ParcelaCalculada[] = ordenadas.map((p) => {
    const valorC = centavos(p.valor);
    const cobertoC = Math.min(valorC, restante);
    restante -= cobertoC;
    const faltaC = valorC - cobertoC;
    const venceu = p.vencimento < hoje;
    const estado: EstadoParcela =
      faltaC === 0 ? "paga" : cobertoC > 0 ? "parcial" : venceu ? "vencida" : "a_vencer";
    return {
      ...p,
      estado,
      coberto: reais(cobertoC),
      falta: reais(faltaC),
      emAtraso: venceu && faltaC > 0,
    };
  });

  const aberta = calculadas.find((p) => p.falta > 0);
  const proxima = aberta
    ? { numero: aberta.numero, vencimento: aberta.vencimento, falta: aberta.falta }
    : null;

  // Devido até hoje: parcelas que vencem hoje ou antes.
  const devidoC = ordenadas
    .filter((p) => p.vencimento <= hoje)
    .reduce((soma, p) => soma + centavos(p.valor), 0);

  let estado: EstadoGeral;
  if (ordenadas.length === 0) estado = "sem_plano";
  else if (pagoC >= totalC) estado = "quitado";
  else if (calculadas.some((p) => p.emAtraso)) estado = "atrasado";
  else if (pagoC > devidoC) estado = "adiantado";
  else estado = "em_dia";

  return {
    estado,
    totalPlano: reais(totalC),
    pago: reais(pagoC),
    falta: reais(Math.max(0, totalC - pagoC)),
    parcelas: calculadas,
    proxima,
  };
}

export const ROTULO_ESTADO: Record<EstadoGeral, string> = {
  sem_plano: "Sem plano de parcelas",
  quitado: "Quitado",
  atrasado: "Em atraso",
  em_dia: "Em dia",
  adiantado: "Adiantado",
};

export const ROTULO_PARCELA: Record<EstadoParcela, string> = {
  paga: "Paga",
  parcial: "Paga em parte",
  vencida: "Vencida",
  a_vencer: "A vencer",
};

// Plano de N parcelas mensais a partir de uma data. Sem pular mês curto: a
// partir de 31/01, a segunda vence em 28/02 (ou 29/02) e a terceira em 31/03.
export function gerarPlano(quantidade: number, valor: number, primeira: string): Parcela[] {
  const [ano, mes, dia] = primeira.split("-").map(Number);
  const parcelas: Parcela[] = [];
  for (let i = 0; i < quantidade; i++) {
    const m0 = mes - 1 + i;
    const a = ano + Math.floor(m0 / 12);
    const m = (m0 % 12) + 1;
    const ultimoDia = new Date(Date.UTC(a, m, 0)).getUTCDate();
    const d = Math.min(dia, ultimoDia);
    const vencimento = `${a}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    parcelas.push({ numero: i + 1, valor, vencimento });
  }
  return parcelas;
}

export const MAX_PARCELAS = 60;

// Data de "hoje" no fuso de Brasília, como "AAAA-MM-DD".
export function hojeBrasil(agora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

// "2026-12-10" → "10/12/2026", sem passar por Date.
export function dataBr(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}
