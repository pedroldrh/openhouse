import Link from "next/link";
import type { House } from "@/lib/data";
import { sameMoneyElsewhere } from "@/lib/data";
import { cityOf, fmtCompact, fmtMoney } from "@/lib/finance";

export default function SameMoneyStrip({ house }: { house: House }) {
  const elsewhere = sameMoneyElsewhere(house).slice(0, 6);
  if (elsewhere.length === 0) return null;

  return (
    <section className="mt-6 rounded-2xl bg-fog p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[17px] font-semibold">
          {fmtCompact(house.price)} somewhere else buys…
        </h2>
        <span className="hidden text-sm text-muted sm:block">
          Same budget, different city — the whole point of this site
        </span>
      </div>
      <div className="scrollbar-hide mt-4 flex gap-4 overflow-x-auto pb-1">
        {elsewhere.map((h) => {
          const c = cityOf(h);
          return (
            <Link key={h.id} href={`/house/${h.id}`} className="group w-52 flex-shrink-0">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={h.photos[0]}
                  alt={h.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-2 text-sm font-semibold leading-5">
                {c.name}, {c.state}
              </p>
              <p className="text-sm leading-5 text-muted">
                {h.beds} bd · {h.baths} ba · {h.sqft.toLocaleString()} sqft
              </p>
              <p className="text-sm leading-5">
                <span className="font-semibold">
                  {h.price >= 2_000_000 ? fmtCompact(h.price) : fmtMoney(h.price)}
                </span>
                {!h.forSale && <span className="text-muted"> est.</span>}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
