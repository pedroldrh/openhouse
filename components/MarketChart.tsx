"use client";

import { useMemo, useRef, useState } from "react";
import type { MarketPoint } from "@/lib/market";
import { fmtCompact } from "@/lib/finance";

// Palette validated for CVD separation (dataviz six checks):
// history #222 solid · 12-month estimate #2563EB dashed
const INK = "#222222";
const MODEL = "#2563EB";
const GRID = "#ebebeb";
const MUTED = "#717171";

const W = 720;
const H = 300;
const PAD = { top: 18, right: 108, bottom: 28, left: 46 };

export default function MarketChart({
  series,
  modelPct,
}: {
  series: MarketPoint[];
  modelPct: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const last = series[series.length - 1];
  const first = series[0];
  const firstYear = first.year;
  const lastYear = last.year;
  const forecastYear = lastYear + 1;
  const forecastValue = last.value * (1 + modelPct);

  const { xOf, yOf, gridLines } = useMemo(() => {
    const values = series.map((p) => p.value);
    const yMin = Math.min(...values) * 0.85;
    const yMax = Math.max(...values, forecastValue) * 1.08;
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    // History gets 88% of the width; the 12-month estimate gets the rest
    const xOf = (year: number) =>
      year <= lastYear
        ? PAD.left + ((year - firstYear) / (lastYear - firstYear)) * plotW * 0.88
        : PAD.left + plotW;
    const yOf = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;
    const step = (yMax - yMin) / 4;
    const gridLines = [0, 1, 2, 3, 4].map((i) => yMin + i * step);
    return { xOf, yOf, gridLines };
  }, [series, forecastValue, firstYear, lastYear]);

  const historyPath = series
    .map((p, i) => `${i ? "L" : "M"}${xOf(p.year).toFixed(1)} ${yOf(p.value).toFixed(1)}`)
    .join(" ");

  const onMove = (e: React.PointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    if (x >= PAD.left && x <= xOf(lastYear)) {
      const yearFloat =
        firstYear + ((x - PAD.left) / (xOf(lastYear) - PAD.left)) * (lastYear - firstYear);
      setHover(Math.max(0, Math.min(series.length - 1, Math.round(yearFloat - firstYear))));
    } else setHover(null);
  };

  const pctLabel = (p: number) => `${p >= 0 ? "+" : ""}${(p * 100).toFixed(1)}%`;
  const totalGrowth = last.value / first.value - 1;
  const hovered = hover != null ? series[hover] : null;
  const hoveredPrev = hover != null && hover > 0 ? series[hover - 1] : null;

  return (
    <div>
      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
        <span className="flex items-center gap-2">
          <svg width="22" height="4"><line x1="0" y1="2" x2="22" y2="2" stroke={INK} strokeWidth="2.5" /></svg>
          Median home value
        </span>
        <span className="flex items-center gap-2">
          <svg width="22" height="4"><line x1="0" y1="2" x2="22" y2="2" stroke={MODEL} strokeWidth="2.5" strokeDasharray="5 3" /></svg>
          Next 12 months (est.)
        </span>
        <span className="ml-auto hidden text-sm sm:block">
          <span className="font-semibold text-ink">{pctLabel(totalGrowth)}</span> since {firstYear}
        </span>
      </div>

      <div className="relative mt-3">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full select-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {/* grid + y labels */}
          {gridLines.map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={W - PAD.right} y1={yOf(v)} y2={yOf(v)} stroke={GRID} strokeWidth="1" />
              <text x={PAD.left - 8} y={yOf(v) + 4} textAnchor="end" fontSize="11" fill={MUTED}>
                {fmtCompact(v)}
              </text>
            </g>
          ))}
          {/* x labels */}
          {[2000, 2005, 2010, 2015, 2020, 2025].map((yr) => (
            <text key={yr} x={xOf(yr)} y={H - 8} textAnchor="middle" fontSize="11" fill={MUTED}>
              {yr}
            </text>
          ))}
          <text x={xOf(forecastYear)} y={H - 8} textAnchor="middle" fontSize="11" fill={MUTED} fontWeight="600">
            {forecastYear}
          </text>

          {/* forecast zone divider */}
          <line x1={xOf(lastYear)} x2={xOf(lastYear)} y1={PAD.top} y2={H - PAD.bottom} stroke={GRID} strokeWidth="1" strokeDasharray="3 3" />

          {/* history */}
          <path d={historyPath} fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" />

          {/* 12-month estimate */}
          <line
            x1={xOf(lastYear)} y1={yOf(last.value)}
            x2={xOf(forecastYear)} y2={yOf(forecastValue)}
            stroke={MODEL} strokeWidth="2" strokeDasharray="5 3"
          />
          <circle cx={xOf(forecastYear)} cy={yOf(forecastValue)} r="3.5" fill={MODEL} />
          <text x={xOf(forecastYear) + 8} y={yOf(forecastValue) + 4} fontSize="12" fontWeight="600" fill={MODEL}>
            {pctLabel(modelPct)} est.
          </text>

          {/* hover crosshair */}
          {hovered && (
            <g pointerEvents="none">
              <line x1={xOf(hovered.year)} x2={xOf(hovered.year)} y1={PAD.top} y2={H - PAD.bottom} stroke={MUTED} strokeWidth="1" strokeDasharray="2 2" />
              <circle cx={xOf(hovered.year)} cy={yOf(hovered.value)} r="4" fill={INK} stroke="#fff" strokeWidth="1.5" />
            </g>
          )}
        </svg>

        {/* tooltip */}
        {hovered && (
          <div
            className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-md"
            style={{ left: `${(xOf(hovered.year) / W) * 100}%` }}
          >
            <p className="font-semibold">{hovered.year}</p>
            <p>{fmtCompact(hovered.value)} median</p>
            {hoveredPrev && (
              <p className="text-muted">
                {pctLabel(hovered.value / hoveredPrev.value - 1)} vs {hoveredPrev.year}
              </p>
            )}
          </div>
        )}
      </div>

      {/* accessible table view */}
      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-muted underline">View as table</summary>
        <table className="mt-2 text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="pr-6 font-medium">Year</th>
              <th className="font-medium">Median value</th>
            </tr>
          </thead>
          <tbody>
            {series.map((p) => (
              <tr key={p.year}>
                <td className="pr-6">{p.year}</td>
                <td>{fmtCompact(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
