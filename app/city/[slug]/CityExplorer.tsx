"use client";

import { useState } from "react";
import CategoryBar from "@/components/CategoryBar";
import HouseCard from "@/components/HouseCard";
import { TIERS, type House, type Tier } from "@/lib/data";

export default function CityExplorer({ houses }: { houses: House[] }) {
  const [tier, setTier] = useState<Tier>("realistic");
  const [category, setCategory] = useState("all");

  const tierBlurb = TIERS.find((t) => t.id === tier)!.blurb;
  const filtered = houses.filter(
    (h) => h.tier === tier && (category === "all" || h.categories.includes(category))
  );

  return (
    <div>
      {/* tier tabs */}
      <div className="flex justify-center">
        <div className="flex rounded-full border border-line p-1">
          {TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTier(t.id)}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${
                tier === t.id ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-muted">{tierBlurb}</p>

      <div className="mt-6 border-b border-line">
        <CategoryBar active={category} onChange={setCategory} />
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted">
          No {tier} homes in this category here — try another lane.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((h) => (
            <HouseCard key={h.id} house={h} />
          ))}
        </div>
      )}
    </div>
  );
}
