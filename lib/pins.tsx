"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface YourNumbers {
  income: number;
  savings: number;
}

interface PinsState {
  pins: string[];
  togglePin: (id: string) => void;
  isPinned: (id: string) => boolean;
  numbers: YourNumbers | null;
  setNumbers: (n: YourNumbers | null) => void;
  ready: boolean;
}

const Ctx = createContext<PinsState | null>(null);

export function PinsProvider({ children }: { children: ReactNode }) {
  const [pins, setPins] = useState<string[]>([]);
  const [numbers, setNumbersState] = useState<YourNumbers | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem("oh-pins");
      if (p) setPins(JSON.parse(p));
      const n = localStorage.getItem("oh-numbers");
      if (n) setNumbersState(JSON.parse(n));
    } catch {}
    setReady(true);
  }, []);

  const togglePin = (id: string) => {
    setPins((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("oh-pins", JSON.stringify(next));
      return next;
    });
  };

  const setNumbers = (n: YourNumbers | null) => {
    setNumbersState(n);
    if (n) localStorage.setItem("oh-numbers", JSON.stringify(n));
    else localStorage.removeItem("oh-numbers");
  };

  return (
    <Ctx.Provider
      value={{ pins, togglePin, isPinned: (id) => pins.includes(id), numbers, setNumbers, ready }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePins(): PinsState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePins must be used inside PinsProvider");
  return ctx;
}
