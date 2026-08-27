import type { CityId } from "./data";

// Approximate market value of the median home per city, yearly 2000–2026,
// in $K — ZHVI-style shape, for exploration (not an official index).
export const MARKET_START_YEAR = 2000;

const SERIES_K: Record<CityId, number[]> = {
  nyc: [250, 275, 300, 330, 375, 430, 480, 500, 490, 450, 445, 440, 450, 475, 505, 545, 585, 615, 645, 660, 650, 700, 760, 735, 750, 770, 785],
  miami: [135, 145, 160, 185, 225, 280, 310, 300, 250, 185, 160, 150, 165, 190, 215, 240, 265, 290, 310, 330, 345, 420, 530, 560, 590, 605, 615],
  "san-diego": [230, 260, 300, 360, 430, 495, 500, 480, 420, 380, 375, 370, 395, 440, 470, 505, 540, 580, 610, 640, 675, 810, 900, 860, 930, 975, 1005],
  austin: [160, 168, 172, 175, 180, 186, 195, 205, 208, 200, 198, 200, 215, 235, 260, 285, 305, 325, 355, 390, 420, 565, 670, 590, 550, 545, 545],
  chicago: [155, 170, 185, 200, 220, 240, 255, 250, 230, 200, 175, 160, 162, 175, 190, 200, 212, 225, 235, 242, 250, 285, 300, 310, 330, 350, 362],
  charlotte: [130, 135, 140, 145, 152, 160, 170, 178, 175, 162, 152, 148, 152, 160, 172, 185, 200, 218, 238, 258, 285, 340, 395, 390, 405, 415, 420],
  boston: [230, 265, 300, 330, 360, 380, 375, 365, 340, 320, 315, 320, 345, 380, 420, 460, 500, 530, 565, 600, 640, 700, 730, 710, 725, 740, 750],
  charleston: [150, 158, 167, 178, 195, 225, 250, 245, 225, 205, 198, 200, 215, 230, 250, 275, 300, 320, 340, 360, 395, 440, 480, 505, 525, 540, 550],
};

export interface MarketPoint {
  year: number;
  value: number; // dollars
}

export function marketSeries(city: CityId): MarketPoint[] {
  return SERIES_K[city].map((v, i) => ({ year: MARKET_START_YEAR + i, value: v * 1000 }));
}

/**
 * OpenHouse model call for the next 12 months: momentum blended with the
 * 5-year trend, clamped to a sane band. Deliberately simple — it's the
 * benchmark the user bets against, not investment advice.
 */
export function modelForecastPct(city: CityId): number {
  const s = SERIES_K[city];
  const last = s[s.length - 1];
  const oneYr = last / s[s.length - 2] - 1;
  const fiveYr = Math.pow(last / s[s.length - 6], 1 / 5) - 1;
  const pct = 0.6 * oneYr + 0.4 * fiveYr;
  return Math.max(-0.08, Math.min(0.1, pct));
}
