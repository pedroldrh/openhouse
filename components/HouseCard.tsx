"use client";

import Link from "next/link";
import { useState } from "react";
import type { House } from "@/lib/data";
import {
  affordability,
  cityOf,
  fmtCompact,
  fmtMoney,
  monthlyBreakdown,
  type Affordability,
} from "@/lib/finance";
import { usePins } from "@/lib/pins";
import { ChevronLeft, ChevronRight, HeartIcon } from "./icons";

const AFFORD_LABEL: Record<Affordability, { dot: string; text: string }> = {
  reach: { dot: "bg-emerald-500", text: "In reach" },
  stretch: { dot: "bg-amber-500", text: "A stretch" },
  someday: { dot: "bg-zinc-400", text: "Someday" },
};

export default function HouseCard({ house, showCity = false }: { house: House; showCity?: boolean }) {
  const [idx, setIdx] = useState(0);
  const { isPinned, togglePin, numbers, ready } = usePins();
  const city = cityOf(house);
  const monthly = monthlyBreakdown(house);
  const greatValue = house.price / house.sqft < city.pricePerSqft * 0.95;
  const afford = ready && numbers ? affordability(house, numbers.income, numbers.savings) : null;

  const go = (e: React.MouseEvent, d: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + d + house.photos.length) % house.photos.length);
  };

  return (
    <Link href={`/house/${house.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-fog">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {house.photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={house.title}
              loading="lazy"
              className="h-full w-full flex-shrink-0 object-cover"
            />
          ))}
        </div>

        {/* badge */}
        {(!house.forSale || greatValue) && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm">
            {!house.forSale ? "Off-market" : "Great value"}
          </span>
        )}

        {/* heart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            togglePin(house.id);
          }}
          aria-label="Pin to compare"
          className="absolute right-3 top-3 transition-transform hover:scale-110 active:scale-90"
        >
          <HeartIcon filled={ready && isPinned(house.id)} className="h-6 w-6" />
        </button>

        {/* carousel controls */}
        {house.photos.length > 1 && (
          <>
            <button
              onClick={(e) => go(e, -1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm transition hover:scale-105 hover:bg-white group-hover:opacity-100"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => go(e, 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm transition hover:scale-105 hover:bg-white group-hover:opacity-100"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {house.photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/60"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px] font-medium leading-5">
            {house.neighborhood}
            {showCity ? `, ${city.name}` : ""}
          </p>
          {afford && (
            <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted">
              <span className={`h-2 w-2 rounded-full ${AFFORD_LABEL[afford].dot}`} />
              {AFFORD_LABEL[afford].text}
            </span>
          )}
        </div>
        <p className="text-[15px] leading-5 text-muted">{house.title}</p>
        <p className="text-[15px] leading-5 text-muted">
          {house.beds} bd · {house.baths} ba · {house.sqft.toLocaleString()} sqft
          {house.pool ? " · Pool" : ""}
        </p>
        <p className="mt-1.5 text-[15px] leading-5">
          <span className="font-semibold">
            {house.price >= 2_000_000 ? fmtCompact(house.price) : fmtMoney(house.price)}
          </span>
          {!house.forSale && <span className="text-muted"> est.</span>}
          <span className="text-muted">
            {" "}
            · {monthly.total >= 10000 ? fmtCompact(monthly.total) : fmtMoney(monthly.total)}/mo
            all-in
          </span>
        </p>
      </div>
    </Link>
  );
}
