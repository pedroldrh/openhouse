import { CITIES, type City, type House } from "./data";

export const DEFAULT_RATE = 6.4; // 30-yr fixed, %
export const DEFAULT_DOWN_PCT = 20;

export function cityOf(house: House): City {
  return CITIES.find((c) => c.id === house.city)!;
}

/** Monthly principal + interest for a 30-year fixed loan. */
export function monthlyPI(principal: number, ratePct = DEFAULT_RATE, years = 30): number {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function taxAnnual(house: House): number {
  const rate = house.taxRateOverride ?? cityOf(house).taxRate;
  return house.price * rate;
}

/** Real quote when the pipeline has one; otherwise scale the city base by value. */
export function insuranceAnnual(house: House): number {
  if (house.insuranceAnnualOverride) return house.insuranceAnnualOverride;
  const city = cityOf(house);
  return Math.round(city.insuranceBase * (house.price / city.medianPrice));
}

export const PMI_ANNUAL_RATE = 0.0075; // ~0.75%/yr of the loan while under 20% down

/** Monthly PMI owed on a loan when the down payment is below 20%. */
export function monthlyPMI(loan: number, downPct: number): number {
  return downPct < 20 && loan > 0 ? (loan * PMI_ANNUAL_RATE) / 12 : 0;
}

export interface MonthlyBreakdown {
  pi: number;
  tax: number;
  insurance: number;
  pmi: number;
  hoa: number;
  total: number;
  downPayment: number;
}

export function monthlyBreakdown(
  house: House,
  downPct = DEFAULT_DOWN_PCT,
  ratePct = DEFAULT_RATE
): MonthlyBreakdown {
  const downPayment = house.price * (downPct / 100);
  const loan = house.price - downPayment;
  const pi = monthlyPI(loan, ratePct);
  const tax = taxAnnual(house) / 12;
  const insurance = insuranceAnnual(house) / 12;
  const pmi = monthlyPMI(loan, downPct);
  const hoa = house.hoaMonthly;
  return { pi, tax, insurance, pmi, hoa, total: pi + tax + insurance + pmi + hoa, downPayment };
}

/** Rule-of-thumb: housing should be ≤28% of gross income. */
export function incomeNeeded(house: House, downPct = DEFAULT_DOWN_PCT, ratePct = DEFAULT_RATE): number {
  return (monthlyBreakdown(house, downPct, ratePct).total * 12) / 0.28;
}

export type Affordability = "reach" | "stretch" | "someday";

export function affordability(
  house: House,
  income: number,
  savings: number
): Affordability {
  const needed = incomeNeeded(house);
  const down10 = house.price * 0.1;
  if (income >= needed && savings >= down10 * 2) return "reach";
  if (income >= needed * 0.75 && savings >= down10) return "stretch";
  return "someday";
}

export function rentalYield(house: House): number {
  return ((house.rentEstimate * 12) / house.price) * 100;
}

export function fmtMoney(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function fmtCompact(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return "$" + (m >= 10 ? Math.round(m) : Math.round(m * 10) / 10) + "M";
  }
  if (n >= 1_000) return "$" + Math.round(n / 1_000) + "K";
  return "$" + Math.round(n);
}

export function fmtPct(n: number, digits = 2): string {
  return n.toFixed(digits) + "%";
}
