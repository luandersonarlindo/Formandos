// Formatação de datas sempre no fuso do Brasil, independente do servidor.
const FUSO = "America/Sao_Paulo";

export const formatarDataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: FUSO,
});

export const formatarDiaCurto = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: FUSO,
});

export const formatarHora = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: FUSO,
});

// Prazo vem como "AAAA-MM-DD"; mostra "DD/MM/AAAA" sem passar por Date.
export function formatarPrazo(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Data "AAAA-MM-DD" de hoje no fuso do Brasil (para marcar tarefas atrasadas).
export function hojeIso() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: FUSO }).format(new Date());
}

// "AAAA-MM-DDTHH:mm" no fuso do Brasil, pronto para <input type="datetime-local">.
export function paraDatetimeLocal(data: Date) {
  const partes = new Intl.DateTimeFormat("sv-SE", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
  return partes.replace(" ", "T");
}
