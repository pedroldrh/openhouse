"use client";

import { CATEGORIES } from "@/lib/data";
import { CATEGORY_ICONS } from "./icons";

export default function CategoryBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="scrollbar-hide flex gap-8 overflow-x-auto pt-1">
      {CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.icon];
        const selected = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-3 pt-1 transition ${
              selected
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:border-line hover:text-ink"
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs font-medium">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
