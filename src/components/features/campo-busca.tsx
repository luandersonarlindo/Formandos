import Link from "next/link";
import { Search, X } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

type CampoBuscaProps = {
  /** Rota que recebe ?busca= (a própria página). */
  acao: string;
  valor?: string;
  placeholder: string;
  /** Rótulo para leitor de tela: "Buscar membro por nome ou email". */
  rotulo: string;
  /** Outros parâmetros que a busca precisa manter (ex.: filtro atual). */
  manter?: Record<string, string | undefined>;
  className?: string;
};

// Busca de lista com estado na URL. Envia no Enter (form GET, funciona sem
// JS), com "limpar" embutido no campo em vez de um botão a mais na linha.
export function CampoBusca({ acao, valor, placeholder, rotulo, manter, className }: CampoBuscaProps) {
  const limpar = new URLSearchParams(
    Object.entries(manter ?? {}).filter((par): par is [string, string] => !!par[1]),
  ).toString();
  return (
    <form action={acao} role="search" className={className}>
      {Object.entries(manter ?? {}).map(([nome, v]) =>
        v ? <input key={nome} type="hidden" name={nome} value={v} /> : null,
      )}
      <InputGroup className="h-10 pointer-coarse:h-11">
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          name="busca"
          defaultValue={valor}
          maxLength={100}
          placeholder={placeholder}
          aria-label={rotulo}
          autoComplete="off"
          enterKeyHint="search"
        />
        {valor ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton asChild size="icon-sm" className="pointer-coarse:size-10" aria-label="Limpar busca" title="Limpar busca">
              <Link href={limpar ? `${acao}?${limpar}` : acao}>
                <X aria-hidden />
              </Link>
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
        <button type="submit" className="sr-only">
          Buscar
        </button>
      </InputGroup>
    </form>
  );
}
