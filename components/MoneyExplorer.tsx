"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fmtCompact, fmtMoney } from "@/lib/finance";
import { usePins } from "@/lib/pins";

export interface HouseLite {
  id: string;
  city: string;
  cityName: string;
  state: string;
  price: number;
  incomeNeeded: number;
  beds: number;
  baths: number;
  sqft: number;
  neighborhood: string;
  photo: string;
  forSale: boolean;
}

const CHIPS = [80_000, 120_000, 200_000, 400_000, 1_000_000];

export default function MoneyExplorer({
  houses,
  cityOrder,
}: {
  houses: HouseLite[];
  cityOrder: { id: string; name: string; state: string }[];
}) {
  const [salary, setSalary] = useState(120_000);
  const [touched, setTouched] = useState(false);
  const { numbers, ready } = usePins();
  const prefilled = useRef(false);

  // Prefill from saved "your numbers" once, unless the user already typed
  useEffect(() => {
    if (ready && numbers && !touched && !prefilled.current) {
      prefilled.current = true;
      setSalary(numbers.income);
    }
  }, [ready, numbers, touched]);

  const monthlyBudget = (salary * 0.28) / 12;

  const picks = cityOrder.map((c) => {
    const inCity = houses.filter((h) => h.city === c.id);
    const qualifying = inCity.filter((h) => h.incomeNeeded <= salary);
    if (qualifying.length) {
      const best = qualifying.reduce((a, b) => (b.price > a.price ? b : a));
      return { city: c, house: best, inBudget: true };
    }
    const cheapest = inCity.reduce((a, b) => (b.incomeNeeded < a.incomeNeeded ? b : a));
    return { city: c, house: cheapest, inBudget: false };
  });

  const inBudget = picks.filter((p) => p.inBudget);
  let contrast: string | null = null;
  if (inBudget.length >= 2) {
    const most = inBudget.reduce((a, b) => (b.house.sqft > a.house.sqft ? b : a));
    const least = inBudget.reduce((a, b) => (b.house.sqft < a.house.sqft ? b : a));
    const ratio = most.house.sqft / Math.max(least.house.sqft, 1);
    if (ratio >= 2) {
      contrast = `That salary buys ${ratio.toFixed(0)}× more house in ${most.city.name} than in ${least.city.name}.`;
    }
  }

  return (
    <section className="py-12 text-center md:py-16">
      <h1 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight md:text-[44px] md:leading-[1.15]">
        How far does your money go?
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-base text-muted md:text-lg">
        Enter a household income. See the best real home it buys in {cityOrder.length} US cities —
        taxes, insurance, and all.
      </p>

      {/* salary input */}
      <div className="mx-auto mt-8 flex max-w-md items-center rounded-full border border-line bg-white py-2 pl-7 pr-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
        <span className="text-xl font-semibold text-muted">$</span>
        <input
          type="number"
          value={salary || ""}
          min={0}
          step={10000}
          onChange={(e) => {
            setTouched(true);
            setSalary(Number(e.target.value) || 0);
          }}
          aria-label="Household income per year"
          className="w-full bg-transparent px-2 py-2.5 text-left text-xl font-semibold outline-none"
          placeholder="120,000"
        />
        <span className="shrink-0 rounded-full bg-fog px-4 py-2.5 text-sm font-medium text-muted">
          / year
        </span>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setTouched(true);
              setSalary(c);
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
        That&apos;s a <span className="font-semibold text-ink">{fmtMoney(monthlyBudget)}/mo</span>{" "}
        housing budget (28% rule) · 20% down · 6.4% mortgage · real taxes &amp; insurance per home
      </p>

      {/* per-city results */}
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 text-left md:grid-cols-4">
        {picks.map(({ city, house, inBudget: ok }) => (
          <Link key={city.id} href={`/house/${house.id}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-fog">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={house.photo}
                alt={house.neighborhood}
                className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
                  ok ? "" : "opacity-90 grayscale"
                }`}
              />
              <span
                className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                  ok ? "bg-white" : "bg-ink/80 text-white"
                }`}
              >
                {ok ? "In budget" : `Needs ${fmtCompact(house.incomeNeeded)}/yr`}
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
