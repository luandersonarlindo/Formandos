// Estado devolvido pelas Server Actions usadas com useActionState.
// `valor` devolve o texto digitado para não perdê-lo quando há erro.
export type EstadoForm = { erro?: string; ok?: string; valor?: string };
