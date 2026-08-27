"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getHouse } from "@/lib/data";
import {
  cityOf,
  fmtCompact,
  fmtMoney,
  incomeNeeded,
  insuranceAnnual,
  monthlyBreakdown,
  rentalYield,
  taxAnnual,
} from "@/lib/finance";
import { usePins } from "@/lib/pins";

export default function ComparePage() {
  const { pins, togglePin, ready } = usePins();
  const houses = ready ? pins.map(getHouse).filter((h) => h !== undefined) : [];

  return (
    <div>
      <Header />
      <main className="mx-auto px-6 pt-10 md:px-10 xl:px-20">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Pinned homes</h1>
        <p className="mt-1 text-muted">
          Side by side, across cities — where the money actually goes.
        </p>

        {ready && houses.length === 0 && (
          <div className="mt-16 pb-16 text-center">
            <p className="text-lg font-medium">Nothing pinned yet</p>
            <p className="mt-1 text-muted">
              Tap the heart on any home to line it up here against other cities.
            </p>
            <Link
              href="/"
              className="btn-rausch mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white"
            >
              Start exploring
            </Link>
          </div>
        )}

        {houses.length > 0 && (
          <div className="scrollbar-hide mt-8 overflow-x-auto pb-8">
            <table className="w-full min-w-[52rem] border-separate border-spacing-0 text-[15px]">
              <thead>
                <tr>
                  <th className="w-44 min-w-44" />
                  {houses.map((h) => (
                    <th key={h.id} className="min-w-56 pb-4 pr-6 text-left align-top font-normal">
                      <Link href={`/house/${h.id}`} className="group block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={h.photos[0]}
                          alt={h.title}
                          className="aspect-[4/3] w-full rounded-xl object-cover"
                        />
                        <p className="mt-2.5 font-semibold leading-5 group-hover:underline">
                          {h.title}
                        </p>
                        <p className="text-sm text-muted">
                          {h.neighborhood}, {cityOf(h).name}
                        </p>
                      </Link>
                      <button
                        onClick={() => togglePin(h.id)}
                        className="mt-1.5 text-sm text-muted underline"
                      >
                        Unpin
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="Price" values={houses.map((h) => `${fmtMoney(h.price)}${h.forSale ? "" : " est."}`)} strong />
                <Row label="All-in monthly" values={houses.map((h) => fmtMoney(monthlyBreakdown(h).total) + "/mo")} strong />
                <Row label="Income needed" values={houses.map((h) => fmtCompact(incomeNeeded(h)) + "/yr")} />
                <Row label="Down payment (20%)" values={houses.map((h) => fmtCompact(h.price * 0.2))} />
                <Row label="$ per sqft" values={houses.map((h) => "$" + Math.round(h.price / h.sqft))} />
                <Row label="Beds · baths · sqft" values={houses.map((h) => `${h.beds} bd · ${h.baths} ba · ${h.sqft.toLocaleString()}`)} />
                <Row label="Property tax / yr" values={houses.map((h) => fmtCompact(taxAnnual(h)))} />
                <Row label="Insurance / yr" values={houses.map((h) => fmtCompact(insuranceAnnual(h)))} />
                <Row label="HOA / mo" values={houses.map((h) => (h.hoaMonthly ? fmtMoney(h.hoaMonthly) : "—"))} />
                <Row label="Would rent for" values={houses.map((h) => `${fmtMoney(h.rentEstimate)}/mo · ${rentalYield(h).toFixed(1)}%`)} />
                <Row label="Walk Score" values={houses.map((h) => (h.walkScore != null ? String(h.walkScore) : "—"))} />
                <Row label="Pool" values={houses.map((h) => (h.pool ? "Yes" : "No"))} />
                <Row label="Risk" values={houses.map((h) => h.risk ?? "—")} />
                <Row label="Status" values={houses.map((h) => (h.forSale ? "For sale" : "Off-market"))} />
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Row({ label, values, strong }: { label: string; values: string[]; strong?: boolean }) {
  return (
    <tr>
      <td className="border-t border-line py-3.5 pr-4 text-sm text-muted">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`border-t border-line py-3.5 pr-6 ${strong ? "font-semibold" : ""}`}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}
