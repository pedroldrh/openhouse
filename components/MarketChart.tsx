"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MarketPoint } from "@/lib/market";
import { fmtCompact } from "@/lib/finance";

// Chart palette — validated for CVD separation (dataviz six checks):
// history #222 solid · model #2563EB dashed · your call #FF385C dashed
const INK = "#222222";
const MODEL = "#2563EB";
const CALL = "#FF385C";
const GRID = "#ebebeb";
const MUTED = "#717171";

const W = 720;
const H = 300;
const PAD = { top: 18, right: 108, bottom: 28, left: 46 };
const CLAMP = 0.2; // your call limited to ±20% over 12 months

interface LockedCall {
  pct: number;
  lockedAt: string; // ISO date
}

export default function MarketChart({
  cityId,
  cityName,
  series,
  modelPct,
}: {
  cityId: string;
  cityName: string;
  series: MarketPoint[];
  modelPct: number;
}) {
  const [callPct, setCallPct] = useState(modelPct);
  const [locked, setLocked] = useState<LockedCall | null>(null);
  const [hover, setHover] = useState<number | null>(null); // index into series
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem("oh-calls") ?? "{}");
      if (all[cityId]) {
        setLocked(all[cityId]);
        setCallPct(all[cityId].pct);
      }
    } catch {}
  }, [cityId]);

  const last = series[series.length - 1];
  const firstYear = series[0].year;
  const lastYear = last.year;
  const forecastYear = lastYear + 1;

  const { xOf, yOf, valueOfY, gridLines } = useMemo(() => {
    const values = series.map((p) => p.value);
    const yMin = Math.min(...values) * 0.85;
    const yMax = Math.max(...values, last.value * (1 + CLAMP)) * 1.05;
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    // History gets 88% of the width; the 12-month forecast zone gets the rest
    const xOf = (year: number) =>
      year <= lastYear
        ? PAD.left + ((year - firstYear) / (lastYear - firstYear)) * plotW * 0.88
        : PAD.left + plotW;
    const yOf = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;
    const valueOfY = (y: number) => yMin + (1 - (y - PAD.top) / plotH) * (yMax - yMin);
    const step = (yMax - yMin) / 4;
    const gridLines = [0, 1, 2, 3, 4].map((i) => yMin + i * step);
    return { xOf, yOf, valueOfY, gridLines };
  }, [series, last.value, firstYear, lastYear]);

  const historyPath = series.map((p, i) => `${i ? "L" : "M"}${xOf(p.year).toFixed(1)} ${yOf(p.value).toFixed(1)}`).join(" ");
  const callValue = last.value * (1 + callPct);
  const modelValue = last.value * (1 + modelPct);

  // pointer helpers -------------------------------------------------
  const toSvg = (e: React.PointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  };

  const onMove = (e: React.PointerEvent) => {
    const { x, y } = toSvg(e);
    if (dragging) {
      const pct = valueOfY(Math.max(PAD.top, Math.min(H - PAD.bottom, y))) / last.value - 1;
      setCallPct(Math.max(-CLAMP, Math.min(CLAMP, pct)));
      return;
    }
    if (x >= PAD.left && x <= xOf(lastYear)) {
      const yearFloat = firstYear + ((x - PAD.left) / (xOf(lastYear) - PAD.left)) * (lastYear - firstYear);
      setHover(Math.max(0, Math.min(series.length - 1, Math.round(yearFloat - firstYear))));
    } else setHover(null);
  };

  const saveLock = (next: LockedCall | null) => {
    try {
      const all = JSON.parse(localStorage.getItem("oh-calls") ?? "{}");
      if (next) all[cityId] = next;
      else delete all[cityId];
      localStorage.setItem("oh-calls", JSON.stringify(all));
    } catch {}
    setLocked(next);
  };

  const pctLabel = (p: number) => `${p >= 0 ? "+" : ""}${(p * 100).toFixed(1)}%`;
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
          Model, next 12 mo
        </span>
        <span className="flex items-center gap-2">
          <svg width="22" height="4"><line x1="0" y1="2" x2="22" y2="2" stroke={CALL} strokeWidth="2.5" strokeDasharray="2 3" /></svg>
          Your call — drag it
        </span>
      </div>

      <div className="relative mt-3">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none select-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onPointerUp={() => setDragging(false)}
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

          {/* model forecast */}
          <line
            x1={xOf(lastYear)} y1={yOf(last.value)}
            x2={xOf(forecastYear)} y2={yOf(modelValue)}
            stroke={MODEL} strokeWidth="2" strokeDasharray="5 3"
          />
          <text x={xOf(forecastYear) + 8} y={yOf(modelValue) + 4} fontSize="12" fontWeight="600" fill={MODEL}>
            Model {pctLabel(modelPct)}
          </text>

          {/* your call */}
          <line
            x1={xOf(lastYear)} y1={yOf(last.value)}
            x2={xOf(forecastYear)} y2={yOf(callValue)}
            stroke={CALL} strokeWidth="2" strokeDasharray="2 3"
          />
          <text
            x={xOf(forecastYear) + 8}
            y={yOf(callValue) + (Math.abs(yOf(callValue) - yOf(modelValue)) < 16 ? (yOf(callValue) >= yOf(modelValue) ? 18 : -12) : 4)}
            fontSize="12" fontWeight="600" fill={CALL}
          >
            You {pctLabel(callPct)}
          </text>
          {/* drag handle (24px hit target) */}
          <g
            transform={`translate(${xOf(forecastYear)}, ${yOf(callValue)})`}
            style={{ cursor: locked ? "default" : "ns-resize" }}
            onPointerDown={(e) => {
              if (locked) return;
              (e.target as Element).setPointerCapture?.(e.pointerId);
              setDragging(true);
            }}
          >
            <circle r="14" fill="transparent" />
            <circle r="7" fill="#fff" stroke={CALL} strokeWidth="2.5" />
            {!locked && (
              <>
                <path d="M-3 -10.5 L0 -14.5 L3 -10.5" fill="none" stroke={CALL} strokeWidth="1.8" strokeLinecap="round" />
                <path d="M-3 10.5 L0 14.5 L3 10.5" fill="none" stroke={CALL} strokeWidth="1.8" strokeLinecap="round" />
              </>
            )}
          </g>

          {/* hover crosshair */}
          {hovered && !dragging && (
            <g pointerEvents="none">
              <line x1={xOf(hovered.year)} x2={xOf(hovered.year)} y1={PAD.top} y2={H - PAD.bottom} stroke={MUTED} strokeWidth="1" strokeDasharray="2 2" />
              <circle cx={xOf(hovered.year)} cy={yOf(hovered.value)} r="4" fill={INK} stroke="#fff" strokeWidth="1.5" />
            </g>
          )}
        </svg>

        {/* tooltip */}
        {hovered && !dragging && (
          <div
            className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-md"
            style={{ left: `${(xOf(hovered.year) / W) * 100}%` }}
          >
            <p className="font-semibold">{hovered.year}</p>
            <p>{fmtCompact(hovered.value)} median</p>
            {hoveredPrev && (
              <p className="text-muted">{pctLabel(hovered.value / hoveredPrev.value - 1)} vs {hoveredPrev.year}</p>
            )}
          </div>
        )}
      </div>

      {/* lock in */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-fog px-5 py-4">
        {locked ? (
          <p className="text-sm">
            <span className="font-semibold">Your call: {pctLabel(locked.pct)} by Aug {forecastYear}</span>
            <span className="text-muted">
              {" "}· locked {new Date(locked.lockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ·
              model says {pctLabel(modelPct)} — come back and see who was right.
            </span>
          </p>
        ) : (
          <p className="text-sm">
            <span className="font-semibold">Where is {cityName} headed?</span>
            <span className="text-muted"> Drag the pink handle to make your 12-month call, then lock it in.</span>
          </p>
        )}
        {locked ? (
          <button
            onClick={() => saveLock(null)}
            className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium hover:border-ink"
          >
            Change my call
          </button>
        ) : (
          <button
            onClick={() => saveLock({ pct: callPct, lockedAt: new Date().toISOString() })}
            className="btn-rausch rounded-lg px-4 py-2 text-sm font-semibold text-white"
          >
            Lock in {pctLabel(callPct)}
          </button>
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
