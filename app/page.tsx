import Link from "next/link";
import BigSearch from "@/components/BigSearch";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HouseCard from "@/components/HouseCard";
import { CITIES, cityHero, housesIn } from "@/lib/data";
import { fmtCompact } from "@/lib/finance";
import { ChevronRight } from "@/components/icons";

export default function Home() {
  return (
    <div>
      <Header />

      <main className="mx-auto px-6 md:px-10 xl:px-20">
        {/* hero search */}
        <section className="py-14 text-center md:py-20">
          <h1 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight md:text-[44px] md:leading-[1.15]">
            Window-shop homes across the country
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted md:text-lg">
            Pick a city. See what&apos;s out there, what it really costs per month, and what the
            same money buys somewhere else.
          </p>
          <div className="mt-8">
            <BigSearch />
          </div>
        </section>

        {/* city tiles */}
        <section>
          <h2 className="text-[22px] font-semibold">Explore a city</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {CITIES.map((c) => (
              <Link key={c.id} href={`/city/${c.id}`} className="group">
                <div className="aspect-square overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cityHero(c)}
                    alt={c.name}
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
                .slice(0, 6)
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
