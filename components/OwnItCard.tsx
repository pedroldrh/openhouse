"use client";

import { useState } from "react";
import type { House } from "@/lib/data";
import {
  DEFAULT_RATE,
  affordability,
  fmtMoney,
  incomeNeeded,
  monthlyBreakdown,
  rentalYield,
} from "@/lib/finance";
import { usePins } from "@/lib/pins";

export default function OwnItCard({ house }: { house: House }) {
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const { isPinned, togglePin, numbers, ready } = usePins();

  const m = monthlyBreakdown(house, downPct, rate);
  const income = incomeNeeded(house, downPct, rate);
  const afford = ready && numbers ? affordability(house, numbers.income, numbers.savings) : null;

  const row = (label: string, value: number) => (
    <div className="flex items-center justify-between py-1.5 text-[15px]">
      <span className="text-muted underline decoration-dotted underline-offset-2">{label}</span>
      <span>{fmtMoney(value)}</span>
    </div>
  );

  return (
    <div className="rounded-xl border border-line p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
      <p className="text-[22px]">
        <span className="font-semibold">{fmtMoney(house.price)}</span>
        <span className="text-base text-muted">{house.forSale ? "" : " estimated value"}</span>
      </p>
      {!house.forSale && (
        <p className="mt-1 text-sm text-muted">
          Not currently for sale — this is what it would likely go for.
        </p>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Down payment</span>
          <span>
            {downPct}% · {fmtMoney(m.downPayment)}
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={50}
          step={5}
          value={downPct}
          onChange={(e) => setDownPct(Number(e.target.value))}
          className="mt-3 w-full"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <label htmlFor="rate" className="text-sm font-medium">
          Mortgage rate (30-yr)
        </label>
        <div className="flex items-center rounded-lg border border-line px-3 py-1.5">
          <input
            id="rate"
            type="number"
            min={2}
            max={12}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value) || DEFAULT_RATE)}
            className="w-14 text-right text-sm outline-none"
          />
          <span className="ml-1 text-sm text-muted">%</span>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        {row("Mortgage (principal + interest)", m.pi)}
        {row("Property tax", m.tax)}
        {row("Home insurance", m.insurance)}
        {m.pmi > 0 && row("Mortgage insurance (PMI, under 20% down)", m.pmi)}
        {house.hoaMonthly > 0 && row("HOA / maintenance", m.hoa)}
        <div className="mt-2 flex items-center justify-between border-t border-line pt-3.5 text-[17px] font-semibold">
          <span>All-in monthly</span>
          <span>{fmtMoney(m.total)}/mo</span>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-fog px-4 py-3.5 text-sm">
        <p>
          You&apos;d need about <span className="font-semibold">{fmtMoney(income)}/yr</span> in
          household income
          <span className="text-muted"> (28% rule)</span>
          {" "}plus <span className="font-semibold">{fmtMoney(m.downPayment)}</span> in cash.
        </p>
        {afford && (
          <p className="mt-1.5 font-medium">
            {afford === "reach" && "✅ In reach on your numbers."}
            {afford === "stretch" && "🔶 A stretch on your numbers — close, though."}
            {afford === "someday" && "🔭 A someday home on your numbers. That's what dreams are for."}
          </p>
        )}
      </div>

      <button
        onClick={() => togglePin(house.id)}
        className={`mt-5 w-full rounded-xl py-3.5 text-base font-semibold text-white transition ${
          ready && isPinned(house.id) ? "bg-ink" : "btn-rausch"
        }`}
      >
        {ready && isPinned(house.id) ? "Pinned — view compare" : "Pin to compare"}
      </button>

      <p className="mt-4 text-center text-sm text-muted">
        Would rent for ~{fmtMoney(house.rentEstimate)}/mo · {rentalYield(house).toFixed(1)}% gross
        yield
      </p>
    </div>
  );
}
