// Estado devolvido pelas Server Actions usadas com useActionState.
// `valor` (texto único) e `valores` (vários campos) devolvem o que foi digitado
// para não perder o conteúdo quando há erro.
export type EstadoForm = {
  erro?: string;
  ok?: string;
  valor?: string;
  valores?: Record<string, string>;
};
