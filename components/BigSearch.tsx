"use client";

import { useEffect, useRef, useState } from "react";
import { CityDropdown } from "./Header";
import { SearchIcon } from "./icons";

export default function BigSearch() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-2xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center rounded-full border border-line bg-white py-2.5 pl-8 pr-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.18)]"
      >
        <span className="flex-1 text-left">
          <span className="block text-[13px] font-semibold">Where</span>
          <span className="block text-sm text-muted">Search cities to explore</span>
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rausch text-white transition hover:bg-rausch-dark">
          <SearchIcon className="h-4.5 w-4.5" />
        </span>
      </button>
      {open && (
        // CityDropdown offsets itself by top-14, which lands it just below the pill
        <div className="absolute left-0 right-0 top-2">
          <div className="relative mx-auto w-[26rem]">
            <CityDropdown onPick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
