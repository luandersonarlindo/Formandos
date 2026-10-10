import { exigirSessao } from "@/lib/dal";
import { getMeusDados } from "@/lib/usuarios";

// Portabilidade LGPD (art. 18, II e V): baixa tudo que o app guarda da pessoa
// em JSON. Rota GET (download), não action: o navegador salva o arquivo.
export async function GET() {
  const { user } = await exigirSessao();
  const dados = await getMeusDados(user.id);
  return Response.json(dados, {
    headers: {
      "Content-Disposition": 'attachment; filename="meus-dados-formandos.json"',
    },
  });
}
