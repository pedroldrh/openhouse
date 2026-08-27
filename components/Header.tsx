"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CITIES, cityHero } from "@/lib/data";
import { fmtCompact } from "@/lib/finance";
import { usePins } from "@/lib/pins";
import { GlobeIcon, LogoIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";

export default function Header({ cityName }: { cityName?: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [numbersOpen, setNumbersOpen] = useState(false);
  const { pins, numbers, ready } = usePins();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div ref={ref} className="mx-auto flex h-20 items-center justify-between px-6 md:px-10 xl:px-20">
          <Link href="/" className="flex items-center gap-1 text-rausch">
            <LogoIcon className="h-8 w-8" />
            <span className="hidden text-[22px] font-bold tracking-tight md:block">
              openhouse
            </span>
          </Link>

          {/* compact search pill */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="flex items-center rounded-full border border-line py-2 pl-6 pr-2 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-sm font-medium">{cityName ?? "Anywhere in the US"}</span>
              <span className="mx-4 h-6 w-px bg-line" />
              <span className="text-sm font-medium">Any tier</span>
              <span className="mx-4 h-6 w-px bg-line" />
              <span className="mr-3 text-sm text-muted">Explore homes</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rausch text-white">
                <SearchIcon className="h-3.5 w-3.5" />
              </span>
            </button>
            {searchOpen && <CityDropdown onPick={() => setSearchOpen(false)} />}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNumbersOpen(true)}
              className="hidden rounded-full px-4 py-2.5 text-sm font-medium hover:bg-fog lg:block"
            >
              {ready && numbers ? `Your numbers: ${fmtCompact(numbers.income)}/yr` : "Add your numbers"}
            </button>
            <button className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-fog lg:flex">
              <GlobeIcon className="h-4.5 w-4.5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-3 rounded-full border border-line py-1.5 pl-3.5 pr-2 transition-shadow hover:shadow-md"
              >
                <MenuIcon className="h-4 w-4" />
                <span className="relative text-muted">
                  <UserIcon className="h-7.5 w-7.5" />
                  {ready && pins.length > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rausch text-[10px] font-bold text-white">
                      {pins.length}
                    </span>
                  )}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-60 rounded-xl border border-line bg-white py-2 shadow-xl">
                  <Link
                    href="/compare"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium hover:bg-fog"
                  >
                    Pinned homes {ready && pins.length > 0 ? `(${pins.length})` : ""}
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setNumbersOpen(true);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-fog"
                  >
                    Your numbers
                  </button>
                  <div className="my-2 border-t border-line" />
                  <Link href="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-fog">
                    Explore cities
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {numbersOpen && <NumbersModal onClose={() => setNumbersOpen(false)} />}
    </>
  );
}

export function CityDropdown({ onPick }: { onPick: () => void }) {
  const router = useRouter();
  return (
    <div className="absolute left-1/2 top-14 z-50 w-[26rem] -translate-x-1/2 rounded-3xl border border-line bg-white p-4 shadow-xl">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Explore a city
      </p>
      {CITIES.map((c) => (
        <button
          key={c.id}
          onClick={() => {
            onPick();
            router.push(`/city/${c.id}`);
          }}
          className="flex w-full items-center gap-4 rounded-2xl px-2 py-2.5 text-left hover:bg-fog"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cityHero(c)} alt={c.name} className="h-12 w-12 rounded-lg object-cover" />
          <span>
            <span className="block text-sm font-medium">
              {c.name}, {c.state}
            </span>
            <span className="block text-sm text-muted">
              Median {fmtCompact(c.medianPrice)} · ${c.pricePerSqft}/sqft
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function NumbersModal({ onClose }: { onClose: () => void }) {
  const { numbers, setNumbers } = usePins();
  const [income, setIncome] = useState(numbers ? String(numbers.income) : "");
  const [savings, setSavings] = useState(numbers ? String(numbers.savings) : "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Your numbers</h2>
        <p className="mt-1 text-sm text-muted">
          Stored only in your browser. Every home will quietly show whether it&apos;s in reach,
          a stretch, or a someday.
        </p>
        <label className="mt-5 block text-sm font-medium">
          Household income (per year)
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="120000"
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-ink"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Savings for a down payment
          <input
            type="number"
            value={savings}
            onChange={(e) => setSavings(e.target.value)}
            placeholder="60000"
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-ink"
          />
        </label>
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => {
              setNumbers(null);
              onClose();
            }}
            className="text-sm font-medium underline"
          >
            Clear
          </button>
          <button
            onClick={() => {
              const i = Number(income);
              const s = Number(savings);
              if (i > 0) setNumbers({ income: i, savings: s > 0 ? s : 0 });
              onClose();
            }}
            className="btn-rausch rounded-xl px-6 py-3 text-sm font-semibold text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
