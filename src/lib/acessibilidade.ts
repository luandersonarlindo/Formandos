// Acessibilidade do local do evento (ADR-0024), sem banco. Cada item é
// sim, não ou não informado (null). Vazio nunca vira "não".

export const ITENS_ACESSIBILIDADE = [
  { campo: "rampa", rotulo: "Rampa ou entrada sem degrau" },
  { campo: "estacionamento", rotulo: "Estacionamento perto da entrada" },
  { campo: "banheiro", rotulo: "Banheiro adaptado" },
] as const;

export type CampoAcessibilidade = (typeof ITENS_ACESSIBILIDADE)[number]["campo"];

export type Acessibilidade = Record<CampoAcessibilidade, boolean | null> & { obs: string | null };

export const ACESSIBILIDADE_OBS_MAX = 200;

// Valor do <select>: "sim", "nao" ou "" (não informado).
export function lerResposta(valor: unknown): boolean | null {
  if (valor === "sim") return true;
  if (valor === "nao") return false;
  return null;
}

export const valorDoSelect = (v: boolean | null) => (v === true ? "sim" : v === false ? "nao" : "");

export function textoResposta(v: boolean | null): string {
  return v === true ? "sim" : v === false ? "não" : "não informado";
}

export function temAlgumaResposta(a: Acessibilidade): boolean {
  return ITENS_ACESSIBILIDADE.some((i) => a[i.campo] !== null) || !!a.obs;
}

export const SEM_RESPOSTA = "Acessibilidade do local: não informada. Pergunte à comissão.";

// Linhas em texto, para a tela e o leitor de tela.
export function linhasAcessibilidade(a: Acessibilidade): string[] {
  if (!temAlgumaResposta(a)) return [SEM_RESPOSTA];
  return ITENS_ACESSIBILIDADE.map((i) => `${i.rotulo}: ${textoResposta(a[i.campo])}`);
}

// Colunas do banco (acess_rampa etc.) já com os apelidos de SQL_ACESSIBILIDADE.
export const SQL_ACESSIBILIDADE = `acess_rampa as "acessRampa", acess_estacionamento as "acessEstacionamento",
            acess_banheiro as "acessBanheiro", acess_obs as "acessObs"`;

export function acessibilidadeDaLinha(r: {
  acessRampa: boolean | null;
  acessEstacionamento: boolean | null;
  acessBanheiro: boolean | null;
  acessObs: string | null;
}): Acessibilidade {
  return { rampa: r.acessRampa, estacionamento: r.acessEstacionamento, banheiro: r.acessBanheiro, obs: r.acessObs };
}
