// OpenHouse live-data pipeline.
//
// For each city: run the Apify Zillow Search Scraper across three price bands
// (realistic / dream / absurd) plus a recently-sold sweep (our "off-market"
// inventory), pick the best candidates, enrich them with the Zillow Detail
// Scraper (year built, description, HOA, pool, price history, real tax rate
// and insurance quote), normalize to the app's House shape, and write
// data/live-houses.json.
//
// Usage: node scripts/fetch-live-data.mjs [cityId ...]
// Cost: roughly $1–2 of Apify credits for a full 5-city refresh.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOKEN = readFileSync(join(ROOT, ".env.local"), "utf8")
  .match(/^APIFY_TOKEN=(.+)$/m)?.[1]
  ?.trim();
if (!TOKEN) throw new Error("APIFY_TOKEN missing from .env.local");

const API = "https://api.apify.com/v2";
const SEARCH_ACTOR = "maxcopell~zillow-scraper";
const DETAIL_ACTOR = "maxcopell~zillow-detail-scraper";

const CITIES = [
  { id: "nyc", median: 785000, ppsf: 730, bounds: { west: -74.03, east: -73.75, south: 40.6, north: 40.88 } },
  { id: "miami", median: 615000, ppsf: 425, bounds: { west: -80.35, east: -80.11, south: 25.68, north: 25.9 } },
  { id: "san-diego", median: 1005000, ppsf: 715, bounds: { west: -117.28, east: -116.95, south: 32.63, north: 33.03 } },
  { id: "austin", median: 545000, ppsf: 305, bounds: { west: -97.9, east: -97.6, south: 30.15, north: 30.45 } },
  { id: "chicago", median: 362000, ppsf: 240, bounds: { west: -87.85, east: -87.55, south: 41.75, north: 42.05 } },
];

// How many homes we keep per city
const KEEP = { realistic: 4, dream: 3, absurd: 2, sold: 4 };

const searchUrl = (bounds, filterState) =>
  "https://www.zillow.com/homes/for_sale/?searchQueryState=" +
  encodeURIComponent(
    JSON.stringify({
      pagination: {},
      isMapVisible: true,
      mapBounds: bounds,
      filterState: { sort: { value: "globalrelevanceex" }, ...filterState },
      isListVisible: true,
    })
  );

const cityUrls = (c) => [
  { tier: "realistic", url: searchUrl(c.bounds, { price: { min: Math.round(c.median * 0.45), max: Math.round(c.median * 1.7) } }) },
  { tier: "dream", url: searchUrl(c.bounds, { price: { min: Math.round(c.median * 2.2), max: Math.round(c.median * 6) } }) },
  { tier: "absurd", url: searchUrl(c.bounds, { price: { min: Math.round(c.median * 7) } }) },
  {
    tier: "sold",
    url: searchUrl(c.bounds, {
      price: { min: Math.round(c.median * 0.45) },
      isRecentlySold: { value: true },
      isForSaleByAgent: { value: false },
      isForSaleByOwner: { value: false },
      isNewConstruction: { value: false },
      isComingSoon: { value: false },
      isAuction: { value: false },
      isForSaleForeclosure: { value: false },
    }),
  },
];

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}${path.includes("?") ? "&" : "?"}token=${TOKEN}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function startRun(actor, input) {
  // Free plan caps concurrent actor memory at 16GB — retry while other runs drain.
  for (let attempt = 0; ; attempt++) {
    try {
      const { data } = await api(`/acts/${actor}/runs`, { method: "POST", body: JSON.stringify(input) });
      return data;
    } catch (err) {
      if (!String(err).includes("actor-memory-limit-exceeded") || attempt >= 20) throw err;
      console.log("  memory limit hit, waiting 30s for running actors to finish…");
      await new Promise((r) => setTimeout(r, 30000));
    }
  }
}

async function waitForRuns(runs, label) {
  const done = {};
  while (Object.keys(done).length < runs.length) {
    await new Promise((r) => setTimeout(r, 15000));
    for (const run of runs) {
      if (done[run.id]) continue;
      const { data } = await api(`/actor-runs/${run.id}`);
      if (["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"].includes(data.status)) {
        done[run.id] = data;
        console.log(`  [${label}] run ${run.id} → ${data.status}`);
      }
    }
  }
  return runs.map((r) => done[r.id]);
}

const datasetItems = async (datasetId) =>
  api(`/datasets/${datasetId}/items?clean=true&limit=500`).catch(() => []);

// ── normalization ──────────────────────────────────────────────────

const tierFor = (price, median) =>
  price >= median * 6.5 ? "absurd" : price >= median * 2 ? "dream" : "realistic";

function pickPhotos(detail) {
  // Batch runs expose listingPhotos (plain URLs); some shapes use
  // photos/originalPhotos with responsive mixedSources instead.
  const plain = (detail.listingPhotos ?? [])
    .map((p) => p?.url?.replace("uncropped_scaled_within_1536_1152", "cc_ft_768"))
    .filter(Boolean);
  if (plain.length) return plain.slice(0, 5);
  const out = [];
  for (const p of detail.photos ?? detail.originalPhotos ?? detail.responsivePhotos ?? []) {
    const jpeg = p?.mixedSources?.jpeg ?? [];
    const best = jpeg.filter((j) => j.width >= 768).sort((a, b) => a.width - b.width)[0] ?? jpeg.at(-1);
    if (best?.url) out.push(best.url);
    if (out.length >= 5) break;
  }
  return out;
}

function historyFrom(detail, price, forSale) {
  const events = (detail.priceHistory ?? [])
    .filter((e) => e.price && /sold|listed/i.test(e.event ?? ""))
    .map((e) => ({ year: Number((e.date ?? "").slice(0, 4)), price: e.price }))
    .filter((e) => e.year > 1990);
  const byYear = new Map();
  for (const e of events.reverse()) byYear.set(e.year, e.price); // oldest→newest, keep last per year
  const hist = [...byYear.entries()].map(([year, p]) => ({ year, price: p })).sort((a, b) => a.year - b.year);
  const nowYear = new Date().getFullYear();
  if (!hist.length || hist.at(-1).year < nowYear) hist.push({ year: nowYear, price });
  else hist[hist.length - 1] = { year: nowYear, price };
  return hist.slice(-4);
}

function trimDescription(text) {
  const t = (text ?? "").trim();
  if (t.length <= 400) return t;
  const cut = t.slice(0, 400);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > 200) return cut.slice(0, sentence + 1);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

function featuresFrom(detail) {
  const rf = detail.resoFacts ?? {};
  const glance = Object.fromEntries((rf.atAGlanceFacts ?? []).map((f) => [f.factLabel, f.factValue]));
  const out = [];
  if (rf.hasPrivatePool || rf.poolFeatures?.length) out.push("Private pool");
  if (glance.Heating && glance.Heating !== "None") out.push(`Heating: ${glance.Heating}`);
  if (glance.Cooling && glance.Cooling !== "None") out.push(`Cooling: ${glance.Cooling}`);
  if (glance.Parking && glance.Parking !== "None") out.push(glance.Parking);
  if (glance.Outdoor) out.push(`Outdoor: ${glance.Outdoor}`);
  if (rf.hasGarage) out.push("Garage");
  if ((detail.schools ?? []).length) {
    const top = Math.max(...detail.schools.map((s) => s.rating ?? 0));
    if (top >= 7) out.push(`Top school rating ${top}/10 nearby`);
  }
  if (rf.hoaFee) out.push(`HOA ${rf.hoaFee}`);
  return [...new Set(out)].slice(0, 8);
}

function normalize(cityInfo, card, detail) {
  const { id: cityId, median, ppsf } = cityInfo;
  const forSale = (card.statusType ?? detail.homeStatus) === "FOR_SALE";
  const zestimate = detail.zestimate ?? card.zestimate;
  const price = forSale ? (card.unformattedPrice ?? detail.price) : (zestimate ?? detail.lastSoldPrice ?? card.unformattedPrice);
  if (!price) return null;
  const sqft = detail.livingArea ?? card.area;
  if (!sqft) return null;
  const photos = pickPhotos(detail);
  if (photos.length < 4) return null;
  const rf = detail.resoFacts ?? {};
  const glance = Object.fromEntries((rf.atAGlanceFacts ?? []).map((f) => [f.factLabel, f.factValue]));

  const categories = [];
  if (rf.hasPrivatePool || rf.poolFeatures?.length) categories.push("pools");
  if (!forSale) categories.push("offmarket");
  if ((detail.yearBuilt ?? 0) >= 2020) categories.push("new");
  if ((detail.yearBuilt ?? 3000) <= 1945) categories.push("classic");
  if (["CONDO", "APARTMENT", "TOWNHOUSE"].includes(card.homeType)) categories.push("city");
  if (sqft >= 5000 || price >= median * 6.5) categories.push("mansions");
  if (price / sqft < ppsf * 0.95) categories.push("value");
  const lotRaw = detail.lotAreaValue ?? detail.lotSize;
  // Unit casing varies; any "lot" under 500 is certainly acres, not sqft
  const isAcres = /acre/i.test(detail.lotAreaUnit ?? "") || (lotRaw > 0 && lotRaw < 500);
  const lot = lotRaw ? Math.round(isAcres ? lotRaw * 43560 : lotRaw) : undefined;
  if ((lot ?? 0) >= 6000 && card.homeType === "SINGLE_FAMILY") categories.push("backyard");

  return {
    id: `${cityId}-${card.zpid ?? detail.zpid}`,
    city: cityId,
    tier: tierFor(price, median),
    title: card.addressStreet ?? detail.streetAddress ?? card.address,
    neighborhood: detail.neighborhoodRegion?.name ?? card.addressCity ?? "",
    price,
    forSale,
    beds: card.beds ?? detail.bedrooms ?? 0,
    baths: card.baths ?? detail.bathrooms ?? 0,
    sqft,
    lotSqft: lot || undefined,
    yearBuilt: detail.yearBuilt ?? 0,
    hoaMonthly: detail.monthlyHoaFee ?? 0,
    pool: Boolean(rf.hasPrivatePool || rf.poolFeatures?.length),
    parking: glance.Parking ?? "—",
    categories: [...new Set(categories)],
    photos,
    priceHistory: historyFrom(detail, price, forSale),
    rentEstimate: detail.rentZestimate ?? card.rentZestimate ?? Math.round(price * 0.005),
    description: trimDescription(detail.description),
    features: featuresFrom(detail),
    daysOnMarket: card.daysOnZillow > 0 ? card.daysOnZillow : undefined,
    taxRateOverride: detail.propertyTaxRate ? detail.propertyTaxRate / 100 : undefined,
    insuranceAnnualOverride: detail.annualHomeownersInsurance || undefined,
    zillowUrl: card.detailUrl ?? detail.url,
  };
}

// ── main ───────────────────────────────────────────────────────────

const only = process.argv.slice(2);
const cities = only.length ? CITIES.filter((c) => only.includes(c.id)) : CITIES;

console.log("Phase 1: search runs for", cities.map((c) => c.id).join(", "));
const searchRuns = [];
for (const c of cities) {
  const run = await startRun(SEARCH_ACTOR, {
    searchUrls: cityUrls(c).map((u) => ({ url: u.url })),
    resultsLimit: 25,
    extractionMethod: "PAGINATION",
  });
  searchRuns.push({ ...run, cityId: c.id });
  console.log(`  started search run ${run.id} for ${c.id}`);
}
const searchDone = await waitForRuns(searchRuns, "search");

console.log("Phase 2: select candidates");
const selections = []; // { city, card }
for (let i = 0; i < cities.length; i++) {
  const c = cities[i];
  const run = searchDone[i];
  if (run.status !== "SUCCEEDED") {
    console.warn(`  ${c.id}: search run ${run.status}, skipping city`);
    continue;
  }
  const items = await datasetItems(run.defaultDatasetId);
  const seen = new Set();
  const clean = items.filter((it) => {
    if (!it.zpid || seen.has(it.zpid)) return false;
    seen.add(it.zpid);
    return it.unformattedPrice > 10000 && it.beds && it.area && (it.photoCount ?? 0) >= 5 && !it.isUndisclosedAddress;
  });
  const forSale = clean.filter((it) => it.statusType === "FOR_SALE");
  const sold = clean.filter((it) => it.statusType !== "FOR_SALE" && (it.zestimate || it.unformattedPrice));
  const byTier = (t) => forSale.filter((it) => tierFor(it.unformattedPrice, c.median) === t);
  const picks = [
    ...byTier("realistic").slice(0, KEEP.realistic),
    ...byTier("dream").slice(0, KEEP.dream),
    ...byTier("absurd").sort((a, b) => b.unformattedPrice - a.unformattedPrice).slice(0, KEEP.absurd),
    ...sold.slice(0, KEEP.sold),
  ];
  console.log(`  ${c.id}: ${items.length} scraped → ${picks.length} selected (${sold.slice(0, KEEP.sold).length} off-market)`);
  for (const card of picks) selections.push({ city: c, card });
}
if (!selections.length) throw new Error("No candidates selected — aborting before detail phase.");

console.log(`Phase 3: detail runs for ${selections.length} homes (sequential — free-plan memory cap)`);
const detailDone = [];
for (const c of cities) {
  const urls = selections.filter((s) => s.city.id === c.id).map((s) => ({ url: s.card.detailUrl }));
  if (!urls.length) continue;
  const run = await startRun(DETAIL_ACTOR, { startUrls: urls });
  console.log(`  started detail run ${run.id} for ${c.id} (${urls.length} homes)`);
  detailDone.push(...(await waitForRuns([run], "detail")));
}

console.log("Phase 4: normalize");
const detailsByZpid = new Map();
for (const run of detailDone) {
  if (run.status !== "SUCCEEDED") continue;
  for (const d of await datasetItems(run.defaultDatasetId)) {
    if (d.zpid) detailsByZpid.set(String(d.zpid), d);
  }
}
const houses = [];
for (const { city, card } of selections) {
  const detail = detailsByZpid.get(String(card.zpid));
  if (!detail) {
    console.warn(`  no detail for ${card.address} — skipped`);
    continue;
  }
  const h = normalize(city, card, detail);
  if (h) houses.push(h);
  else console.warn(`  normalize rejected ${card.address}`);
}

writeFileSync(join(ROOT, "data", "live-houses.json"), JSON.stringify(houses, null, 1));
console.log(`\nWrote ${houses.length} homes to data/live-houses.json`);
for (const c of cities) {
  const n = houses.filter((h) => h.city === c.id);
  console.log(`  ${c.id}: ${n.length} (${n.filter((h) => !h.forSale).length} off-market, tiers: ${["realistic", "dream", "absurd"].map((t) => n.filter((h) => h.tier === t).length).join("/")})`);
}
