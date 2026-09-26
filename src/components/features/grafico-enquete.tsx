"use client";

import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";
import type { OpcaoRelatorio } from "@/lib/relatorio";

const MARGEM_DIREITA = 80;

type TickProps = {
  x?: number;
  y?: number;
  payload?: { value: string };
  largura: number;
  altura: number;
};

// Rótulo da opção quebrado em até duas linhas, à esquerda das barras.
function TickOpcao({ x = 0, y = 0, payload, largura, altura }: TickProps) {
  return (
    <foreignObject
      x={x - largura + 4}
      y={y - altura / 2}
      width={largura - 8}
      height={altura}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          height: "100%",
          textAlign: "right",
          fontSize: 12,
          lineHeight: 1.25,
          overflowWrap: "anywhere",
          color: "var(--foreground)",
        }}
      >
        {payload?.value}
      </div>
    </foreignObject>
  );
}

type Dado = OpcaoRelatorio & { rotulo: string };

type FormaProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: Dado;
};

// Barra com 4px de arredondamento só na ponta (base reta) e o valor logo após
// a ponta. Desenha o rótulo mesmo quando a barra tem largura zero.
function BarraComRotulo({ x = 0, y = 0, width = 0, height = 0, payload }: FormaProps) {
  const r = Math.min(4, width, height / 2);
  return (
    <g>
      {width > 0 && (
        <path
          fill="var(--viz-serie-1)"
          d={`M${x},${y} H${x + width - r} A${r},${r} 0 0 1 ${x + width},${y + r} V${y + height - r} A${r},${r} 0 0 1 ${x + width - r},${y + height} H${x} Z`}
        />
      )}
      <text
        x={x + width + 6}
        y={y + height / 2}
        dominantBaseline="central"
        fontSize={12}
        fill="var(--foreground)"
      >
        {payload?.rotulo}
      </text>
    </g>
  );
}

function DicaBarra({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Dado }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="max-w-64 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{d.texto}</p>
      <p className="mt-1 text-muted-foreground">
        {d.votos} {d.votos === 1 ? "voto" : "votos"} ·{" "}
        {Math.round(d.percentual)}% de quem respondeu
      </p>
    </div>
  );
}

export function GraficoEnquete({ opcoes }: { opcoes: OpcaoRelatorio[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) =>
      setLargura(Math.floor(entrada.contentRect.width)),
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const estreito = largura < 480;
  const larguraEixo = estreito ? 140 : 200;
  const alturaLinha = estreito ? 56 : 44;
  const dados: Dado[] = opcoes.map((o) => ({
    ...o,
    rotulo: `${o.votos} · ${Math.round(o.percentual)}%`,
  }));
  const altura = dados.length * alturaLinha + 8;

  return (
    <div ref={ref} className="w-full" style={{ height: altura }} aria-hidden>
      {largura > 0 && (
        <BarChart
          width={largura}
          height={altura}
          data={dados}
          layout="vertical"
          margin={{ top: 4, right: MARGEM_DIREITA, bottom: 4, left: 0 }}
          accessibilityLayer={false}
        >
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis
            type="category"
            dataKey="texto"
            width={larguraEixo}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            interval={0}
            tick={({ x, y, payload }) => (
              <TickOpcao
                x={Number(x)}
                y={Number(y)}
                payload={payload}
                largura={larguraEixo}
                altura={alturaLinha}
              />
            )}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={<DicaBarra />}
          />
          <Bar
            dataKey="votos"
            barSize={20}
            isAnimationActive={false}
            shape={(props: unknown) => (
              <BarraComRotulo {...(props as FormaProps)} />
            )}
          />
        </BarChart>
      )}
    </div>
  );
}
