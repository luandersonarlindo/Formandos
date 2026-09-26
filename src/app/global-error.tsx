"use client";

// Último recurso: substitui o layout raiz, então define o próprio <html>.
// Não recebe os estilos globais, por isso usa estilos mínimos em linha.
export default function ErroGlobal({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <title>Erro · Formandos</title>
        <div role="alert">
          <h1>Algo deu errado</h1>
          <p>Não foi possível carregar o Formandos. Tente novamente.</p>
          {error.digest && <p style={{ fontSize: 12 }}>Código do erro: {error.digest}</p>}
          <button onClick={() => retry()} style={{ padding: "0.5rem 1rem" }}>
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
