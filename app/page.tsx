import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HouseCard from "@/components/HouseCard";
import MoneyExplorer, { type HouseLite } from "@/components/MoneyExplorer";
import { CITIES, HOUSES, cityHero, getCity, housesIn } from "@/lib/data";
import { fmtCompact, insuranceAnnual, taxAnnual } from "@/lib/finance";
import { ChevronRight } from "@/components/icons";

export default function Home() {
  // Compact per-house payload for the client-side money explorer
  const lite: HouseLite[] = HOUSES.map((h) => {
    const c = getCity(h.city)!;
    return {
      id: h.id,
      city: h.city,
      cityName: c.name,
      state: c.state,
      price: h.price,
      // tax + insurance + HOA: the monthly costs that don't depend on the loan
      fixedMonthly: Math.round(taxAnnual(h) / 12 + insuranceAnnual(h) / 12 + h.hoaMonthly),
      beds: h.beds,
      baths: h.baths,
      sqft: h.sqft,
      neighborhood: h.neighborhood,
      photo: h.photos[0],
      forSale: h.forSale,
    };
  });

  return (
    <div>
      <Header />

      <main className="mx-auto px-6 md:px-10 xl:px-20">
        <MoneyExplorer
          houses={lite}
          cityOrder={CITIES.map((c) => ({ id: c.id, name: c.name, state: c.state }))}
        />

        {/* city tiles — browsing as depth, not the front door */}
        <section className="mt-6 border-t border-line pt-10">
          <h2 className="text-[22px] font-semibold">Or explore a city</h2>
          <div className="scrollbar-hide mt-4 flex gap-4 overflow-x-auto pb-2">
            {CITIES.map((c) => (
              <Link key={c.id} href={`/city/${c.id}`} className="group w-44 flex-shrink-0 md:w-52">
                <div className="aspect-square overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cityHero(c)}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2.5 text-[15px] font-medium">
                  {c.name}, {c.state}
                </p>
                <p className="text-sm text-muted">
                  Median {fmtCompact(c.medianPrice)} · ${c.pricePerSqft}/sqft
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* per-city rows */}
        {CITIES.map((c) => (
          <section key={c.id} className="mt-12">
            <Link href={`/city/${c.id}`} className="group flex items-center gap-1">
              <h2 className="text-[22px] font-semibold">Homes in {c.name}</h2>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <div className="scrollbar-hide mt-4 flex gap-5 overflow-x-auto pb-2">
              {housesIn(c.id)
                .slice(0, 8)
                .map((h) => (
                  <div key={h.id} className="w-64 flex-shrink-0 md:w-72">
                    <HouseCard house={h} />
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}
