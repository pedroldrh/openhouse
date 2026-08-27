"use client";

import { HeartIcon, ShareIcon } from "@/components/icons";
import { usePins } from "@/lib/pins";

export default function DetailActions({ houseId, title }: { houseId: string; title: string }) {
  const { isPinned, togglePin, ready } = usePins();
  const pinned = ready && isPinned(houseId);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
      }
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={share}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium underline hover:bg-fog"
      >
        <ShareIcon className="h-4 w-4" /> Share
      </button>
      <button
        onClick={() => togglePin(houseId)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium underline hover:bg-fog"
      >
        <HeartIcon filled={pinned} className="h-4.5 w-4.5" /> {pinned ? "Pinned" : "Pin"}
      </button>
    </div>
  );
}
