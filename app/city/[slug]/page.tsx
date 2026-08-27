import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ReportCard from "@/components/ReportCard";
import MarketChart from "@/components/MarketChart";
import { CITIES, getCity, housesIn } from "@/lib/data";
import { marketSeries, modelForecastPct } from "@/lib/market";
import CityExplorer from "./CityExplorer";

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.id }));
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();
  const houses = housesIn(city.id);

  return (
    <div>
      <Header cityName={`${city.name}, ${city.state}`} />
      <main className="mx-auto px-6 pt-8 md:px-10 xl:px-20">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {city.name}, {city.state}
        </h1>
        <p className="mt-1 text-muted">
          {houses.length} homes to window-shop — listed and off-market
        </p>
        <div className="mt-6">
          <ReportCard city={city} />
        </div>

        <section className="mt-10 rounded-2xl border border-line p-6">
          <h2 className="text-lg font-semibold">The {city.name} market — and your call on it</h2>
          <p className="mt-1 text-sm text-muted">
            26 years of the median home&apos;s value (approximate, for exploration). The dashed
            lines are the next 12 months: the model&apos;s call, and yours.
          </p>
          <div className="mt-5">
            <MarketChart
              cityId={city.id}
              cityName={city.name}
              series={marketSeries(city.id)}
              modelPct={modelForecastPct(city.id)}
            />
          </div>
        </section>

        <div className="mt-10">
          <CityExplorer houses={houses} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
