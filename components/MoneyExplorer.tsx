"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fmtCompact, fmtMoney, monthlyPI } from "@/lib/finance";
import { usePins } from "@/lib/pins";

export interface HouseLite {
  id: string;
  city: string;
  cityName: string;
  state: string;
  price: number;
  fixedMonthly: number; // tax + insurance + HOA per month
  beds: number;
  baths: number;
  sqft: number;
  neighborhood: string;
  photo: string;
  forSale: boolean;
}

const INCOME_CHIPS = [80_000, 120_000, 200_000, 400_000, 1_000_000];
const MIN_DOWN_PCT = 0.05; // lender minimum

interface Verdict {
  ok: boolean;
  needIncome: number;
  cashShort: number; // how much more savings the 5% minimum requires
}

function evaluate(h: HouseLite, income: number, savings: number): Verdict {
  const minDown = h.price * MIN_DOWN_PCT;
  const down = Math.min(savings, h.price); // put everything you have toward it
  const loan = Math.max(h.price - down, 0);
  const monthly = monthlyPI(loan) + h.fixedMonthly;
  const needIncome = (monthly * 12) / 0.28;
  return {
    ok: savings >= minDown && income >= needIncome,
    needIncome,
    cashShort: Math.max(minDown - savings, 0),
  };
}

export default function MoneyExplorer({
  houses,
  cityOrder,
}: {
  houses: HouseLite[];
  cityOrder: { id: string; name: string; state: string }[];
}) {
  const [salary, setSalary] = useState(120_000);
  const [savings, setSavings] = useState(60_000);
  const [touched, setTouched] = useState(false);
  const { numbers, ready } = usePins();
  const prefilled = useRef(false);

  // Prefill from saved "your numbers" once, unless the user already typed
  useEffect(() => {
    if (ready && numbers && !touched && !prefilled.current) {
      prefilled.current = true;
      setSalary(numbers.income);
      if (numbers.savings > 0) setSavings(numbers.savings);
    }
  }, [ready, numbers, touched]);

  const monthlyBudget = (salary * 0.28) / 12;

  const picks = cityOrder.map((c) => {
    const inCity = houses.filter((h) => h.city === c.id);
    const qualifying = inCity.filter((h) => evaluate(h, salary, savings).ok);
    if (qualifying.length) {
      const best = qualifying.reduce((a, b) => (b.price > a.price ? b : a));
      return { city: c, house: best, verdict: evaluate(best, salary, savings) };
    }
    // most attainable miss: the cheapest home, with what's missing spelled out
    const cheapest = inCity.reduce((a, b) => (b.price < a.price ? b : a));
    return { city: c, house: cheapest, verdict: evaluate(cheapest, salary, savings) };
  });

  const inBudget = picks.filter((p) => p.verdict.ok);
  let contrast: string | null = null;
  if (inBudget.length >= 2) {
    const most = inBudget.reduce((a, b) => (b.house.sqft > a.house.sqft ? b : a));
    const least = inBudget.reduce((a, b) => (b.house.sqft < a.house.sqft ? b : a));
    const ratio = most.house.sqft / Math.max(least.house.sqft, 1);
    if (ratio >= 2) {
      contrast = `That money buys ${ratio.toFixed(0)}× more house in ${most.city.name} than in ${least.city.name}.`;
    }
  }

  const field = (
    label: string,
    value: number,
    onChange: (n: number) => void,
    placeholder: string
  ) => (
    <label className="flex flex-1 items-center gap-2 px-6 py-2 text-left">
      <span className="flex-1">
        <span className="block text-[13px] font-semibold">{label}</span>
        <span className="flex items-center">
          <span className="text-lg font-semibold text-muted">$</span>
          <input
            type="number"
            value={value || ""}
            min={0}
            step={10000}
            onChange={(e) => {
              setTouched(true);
              onChange(Number(e.target.value) || 0);
            }}
            className="w-full bg-transparent px-1.5 py-0.5 text-lg font-semibold outline-none"
            placeholder={placeholder}
          />
        </span>
      </span>
    </label>
  );

  return (
    <section className="py-12 text-center md:py-16">
      <h1 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight md:text-[44px] md:leading-[1.15]">
        How far does your money go?
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-base text-muted md:text-lg">
        Income and savings in — the best real home they buy in {cityOrder.length} US cities out.
        Taxes, insurance, and the down payment you can actually make.
      </p>

      {/* income + savings pill */}
      <div className="mx-auto mt-8 flex max-w-2xl flex-col items-stretch divide-y divide-line rounded-3xl border border-line bg-white py-1 shadow-[0_8px_28px_rgba(0,0,0,0.12)] sm:flex-row sm:divide-x sm:divide-y-0 sm:rounded-full">
      {field("Household income / yr", salary, setSalary, "120,000")}
      {field("Saved for a down payment", savings, setSavings, "60,000")}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {INCOME_CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setTouched(true);
              setSalary(c);
              setSavings(Math.round(c * 0.5));
            }}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              salary === c ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
            }`}
          >
            {fmtCompact(c)}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        {fmtMoney(monthlyBudget)}/mo housing budget (28% rule) · your{" "}
        <span className="font-semibold text-ink">{fmtCompact(savings)}</span> goes toward the down
        payment (5% lender minimum) · 6.4% mortgage · real taxes &amp; insurance per home
      </p>

      {/* per-city results */}
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 text-left md:grid-cols-4">
        {picks.map(({ city, house, verdict }) => (
          <Link key={city.id} href={`/house/${house.id}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-fog">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={house.photo}
                alt={house.neighborhood}
                className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
                  verdict.ok ? "" : "opacity-90 grayscale"
                }`}
              />
              <span
                className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                  verdict.ok ? "bg-white" : "bg-ink/80 text-white"
                }`}
              >
                {verdict.ok
                  ? "In budget"
                  : verdict.cashShort > 0
                    ? `Needs ${fmtCompact(verdict.cashShort)} more saved`
                    : `Needs ${fmtCompact(verdict.needIncome)}/yr`}
              </span>
            </div>
            <p className="mt-2.5 text-[15px] font-semibold leading-5">
              {city.name}, {city.state}
            </p>
            <p className="text-sm leading-5 text-muted">
              {house.beds} bd · {house.baths} ba · {house.sqft.toLocaleString()} sqft ·{" "}
              {house.neighborhood}
            </p>
            <p className="mt-0.5 text-[15px] leading-5">
              <span className="font-semibold">
                {house.price >= 2_000_000 ? fmtCompact(house.price) : fmtMoney(house.price)}
              </span>
              {!house.forSale && <span className="text-muted"> est.</span>}
            </p>
          </Link>
        ))}
      </div>

      {contrast && (
        <p className="mx-auto mt-8 max-w-xl rounded-2xl bg-fog px-6 py-4 text-[15px] font-medium">
          {contrast}
        </p>
      )}
    </section>
  );
}
