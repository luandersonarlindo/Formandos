// Estado devolvido pelas Server Actions usadas com useActionState.
// `valor` (texto único) e `valores` (vários campos) devolvem o que foi digitado
// para não perder o conteúdo quando há erro.
// `id` é o registro que acabou de ser criado: o cliente usa para rolar até ele e
//-focus (a página ainda não o tem no DOM quando a action responde).
export type EstadoForm = {
  erro?: string;
  ok?: string;
  valor?: string;
  valores?: Record<string, string>;
  id?: string;
};
