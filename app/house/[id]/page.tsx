import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HouseCard from "@/components/HouseCard";
import OwnItCard from "@/components/OwnItCard";
import { HOUSES, getHouse, housesIn, sameMoneyElsewhere } from "@/lib/data";
import { cityOf, fmtCompact, fmtMoney, insuranceAnnual, taxAnnual } from "@/lib/finance";
import DetailActions from "./DetailActions";

export function generateStaticParams() {
  return HOUSES.map((h) => ({ id: h.id }));
}

export default async function HousePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const house = getHouse(id);
  if (!house) notFound();
  const city = cityOf(house);
  const elsewhere = sameMoneyElsewhere(house).slice(0, 4);
  const nearby = housesIn(house.city).filter((h) => h.id !== house.id).slice(0, 4);

  const first = house.priceHistory[0];
  const growth = first ? ((house.price - first.price) / first.price) * 100 : 0;

  return (
    <div>
      <Header cityName={`${city.name}, ${city.state}`} />
      <main className="mx-auto max-w-6xl px-6 pt-7 md:px-10">
        {/* title row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-[26px]">{house.title}</h1>
            <p className="mt-1 text-[15px] text-muted">
              {house.neighborhood}, {city.name}, {city.state}
              {!house.forSale && <span className="font-medium text-ink"> · Off-market</span>}
              {house.forSale && house.daysOnMarket != null && (
                <span> · {house.daysOnMarket} days on market</span>
              )}
            </p>
          </div>
          <DetailActions houseId={house.id} title={house.title} />
        </div>

        {/* photo mosaic */}
        <div className="mt-5 grid h-[26rem] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">
          {/* eslint-disable @next/next/no-img-element */}
          <img src={house.photos[0]} alt={house.title} className="col-span-2 row-span-2 h-full w-full object-cover" />
          <img src={house.photos[1]} alt="" className="col-span-2 h-full w-full object-cover" />
          <img src={house.photos[2]} alt="" className="h-full w-full object-cover" />
          <img src={house.photos[3]} alt="" className="h-full w-full object-cover" />
          {/* eslint-enable @next/next/no-img-element */}
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_24rem]">
          <div>
            <p className="text-lg font-medium">
              {house.beds} bedrooms · {house.baths} baths · {house.sqft.toLocaleString()} sqft
              {house.lotSqft ? ` · ${house.lotSqft.toLocaleString()} sqft lot` : ""}
            </p>
            <p className="mt-1 text-[15px] text-muted">
              Built {house.yearBuilt} · {house.parking}
              {house.pool ? " · Pool" : ""} · ${Math.round(house.price / house.sqft)}/sqft
              <span className="text-ink"> (city median ${city.pricePerSqft})</span>
            </p>

            <div className="mt-6 border-t border-line pt-6">
              <p className="text-[15px] leading-7">{house.description}</p>
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <h2 className="text-lg font-semibold">What this place offers</h2>
              <ul className="mt-4 grid grid-cols-1 gap-y-3 text-[15px] sm:grid-cols-2">
                {house.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <h2 className="text-lg font-semibold">The numbers</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="Property tax" value={`${fmtCompact(taxAnnual(house))}/yr`} />
                <Stat label="Insurance est." value={`${fmtCompact(insuranceAnnual(house))}/yr`} />
                <Stat label="Walk Score" value={String(house.walkScore)} />
                <Stat label="Risk" value={house.risk} />
              </div>
              {house.priceHistory.length > 1 && (
                <div className="mt-5 rounded-xl border border-line p-5">
                  <p className="text-sm font-semibold">Price history</p>
                  <div className="mt-3 space-y-2">
                    {house.priceHistory.map((p, i) => (
                      <div key={p.year} className="flex justify-between text-[15px]">
                        <span className="text-muted">
                          {p.year}
                          {i === house.priceHistory.length - 1 ? (house.forSale ? " (asking)" : " (estimate)") : ""}
                        </span>
                        <span className="font-medium">{fmtMoney(p.price)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 border-t border-line pt-3 text-sm text-muted">
                    {growth >= 0 ? "Up" : "Down"} {Math.abs(growth).toFixed(0)}% since {first.year}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <OwnItCard house={house} />
          </div>
        </div>

        {/* same money elsewhere */}
        {elsewhere.length > 0 && (
          <section className="mt-14 border-t border-line pt-10">
            <h2 className="text-[22px] font-semibold">
              What {fmtCompact(house.price)} buys somewhere else
            </h2>
            <p className="mt-1 text-muted">Same budget, different city. This is the fun part.</p>
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {elsewhere.map((h) => (
                <HouseCard key={h.id} house={h} showCity />
              ))}
            </div>
          </section>
        )}

        {/* more in city */}
        <section className="mt-14 border-t border-line pt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[22px] font-semibold">More homes in {city.name}</h2>
            <Link href={`/city/${city.id}`} className="text-sm font-medium underline">
              Show all
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map((h) => (
              <HouseCard key={h.id} house={h} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-[15px] font-semibold leading-5">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
