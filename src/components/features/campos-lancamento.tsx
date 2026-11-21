import { CamposLancamentoCliente } from "@/components/features/campos-lancamento-cliente";
import { ROTULO_FORMA, ROTULO_TIPO, type LancamentoDetalhe } from "@/lib/pagamentos";

// Campos de um lançamento (ADR-0005), usados em "Lançar" e "Editar" da
// tesouraria e no "Já paguei" do formando (`semTipo`). `prefixo` deixa os ids
// únicos quando há vários diálogos na tela. Esta casca fica no servidor só para
// passar os rótulos de lib/pagamentos (server-only) ao miolo de cliente.
export function CamposLancamento(props: {
  prefixo: string;
  hoje: string;
  inicial?: LancamentoDetalhe;
  /** "Já paguei" do formando: é sempre pagamento, sem escolher tipo. */
  semTipo?: boolean;
}) {
  return <CamposLancamentoCliente {...props} rotulosTipo={ROTULO_TIPO} rotulosForma={ROTULO_FORMA} />;
}
