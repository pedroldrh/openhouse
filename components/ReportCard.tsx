import type { City } from "@/lib/data";
import { fmtCompact, fmtPct } from "@/lib/finance";

export default function ReportCard({ city }: { city: City }) {
  const stats = [
    { label: "Median home", value: fmtCompact(city.medianPrice) },
    { label: "Price per sqft", value: `$${city.pricePerSqft}` },
    { label: "Property tax", value: fmtPct(city.taxRate * 100, 1) + "/yr" },
    { label: "Insurance (median home)", value: fmtCompact(city.insuranceBase) + "/yr" },
    { label: "10-yr appreciation", value: "+" + city.appreciation10y + "%" },
  ];
  return (
    <section className="rounded-2xl border border-line">
      <div className="grid grid-cols-2 divide-line sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-5">
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="border-t border-line px-6 py-3.5 text-sm text-muted">
        <span className="font-medium text-ink">The fine print:</span> {city.note}
      </p>
    </section>
  );
}
