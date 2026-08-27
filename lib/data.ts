// Curated seed data + live data loader. Live listings come from the Apify
// Zillow pipeline (scripts/fetch-live-data.mjs → data/live-houses.json).
import liveHouses from "@/data/live-houses.json";

export type CityId =
  | "nyc"
  | "miami"
  | "san-diego"
  | "austin"
  | "chicago"
  | "charlotte"
  | "boston"
  | "charleston";
export type Tier = "realistic" | "dream" | "absurd";

export interface City {
  id: CityId;
  name: string;
  state: string;
  medianPrice: number;
  pricePerSqft: number;
  taxRate: number; // effective annual property tax
  insuranceBase: number; // annual $ for a median-priced home
  appreciation10y: number; // % change, 2016 → 2026
  note: string;
  hero: string;
}

export interface House {
  id: string;
  city: CityId;
  tier: Tier;
  title: string;
  neighborhood: string;
  price: number; // list price, or estimated value if off-market
  forSale: boolean;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft?: number;
  yearBuilt: number;
  hoaMonthly: number;
  pool: boolean;
  parking: string;
  categories: string[];
  photos: string[];
  priceHistory: { year: number; price: number }[];
  rentEstimate: number;
  walkScore?: number;
  risk?: string;
  description: string;
  features: string[];
  daysOnMarket?: number;
  /** Real per-house figures from live data; fall back to city-level estimates */
  taxRateOverride?: number;
  insuranceAnnualOverride?: number;
  zillowUrl?: string;
}

const img = (id: string, w = 1280) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

// Interior photo sets, mixed and matched across listings
const I1 = ["1522708323590-d24dbb6b0267", "1556911220-bff31c812dba", "1615874959474-d609969a20ed"];
const I2 = ["1600210492486-724fe5c67fb0", "1556912167-f556f1f39fdf", "1616594039964-ae9021a400a0"];
const I3 = ["1598928506311-c55ded91a20c", "1484154218962-a197022b5858", "1600585152220-90363fe7e115"];
const I4 = ["1616486338812-3dadae4b4ace", "1560448204-e02f11c3d0e2", "1615874959474-d609969a20ed"];
const I5 = ["1600121848594-d8644e57abab", "1600607687920-4e2a09cf159d", "1600585152220-90363fe7e115"];
const I6 = ["1493809842364-78817add7ffb", "1522708323590-d24dbb6b0267", "1556911220-bff31c812dba"];

const photos = (exterior: string, interiors: string[]) =>
  [exterior, ...interiors].map((id) => img(id));

export const CITIES: City[] = [
  {
    id: "nyc",
    name: "New York City",
    state: "NY",
    medianPrice: 785000,
    pricePerSqft: 730,
    taxRate: 0.009,
    insuranceBase: 1900,
    appreciation10y: 42,
    note: "Co-op boards, $1,000+ monthly maintenance fees, and a property tax system so quirky that brownstones often pay less than condos half their value.",
    hero: img("1514565131-fce0801e5785"),
  },
  {
    id: "miami",
    name: "Miami",
    state: "FL",
    medianPrice: 615000,
    pricePerSqft: 425,
    taxRate: 0.0102,
    insuranceBase: 8600,
    appreciation10y: 118,
    note: "No state income tax, but Florida's insurance crisis means coverage can cost more than property taxes — some coastal homes pay $15K+/yr to insure.",
    hero: img("1535498730771-e735b998cd64"),
  },
  {
    id: "san-diego",
    name: "San Diego",
    state: "CA",
    medianPrice: 1005000,
    pricePerSqft: 715,
    taxRate: 0.011,
    insuranceBase: 2400,
    appreciation10y: 84,
    note: "Prop 13 locks your tax at ~1.1% of the purchase price forever — longtime owners pay a fraction of what new buyers do on identical homes.",
    hero: img("1564013799919-ab600027ffc6"),
  },
  {
    id: "austin",
    name: "Austin",
    state: "TX",
    medianPrice: 545000,
    pricePerSqft: 305,
    taxRate: 0.019,
    insuranceBase: 2900,
    appreciation10y: 71,
    note: "No state income tax, but Texas makes it back with ~1.9% property taxes. Prices ran up 60% in the pandemic, then gave a chunk back — a rare buyer's market.",
    hero: img("1531218150217-54595bc2b934"),
  },
  {
    id: "chicago",
    name: "Chicago",
    state: "IL",
    medianPrice: 362000,
    pricePerSqft: 240,
    taxRate: 0.021,
    insuranceBase: 2300,
    appreciation10y: 38,
    note: "The big-city bargain: half the price per sqft of the coasts. The catch is ~2.1% property taxes — you rent your house back from Cook County.",
    hero: img("1477959858617-67f85cf4f1df"),
  },
  {
    id: "charlotte",
    name: "Charlotte",
    state: "NC",
    medianPrice: 420000,
    pricePerSqft: 230,
    taxRate: 0.008,
    insuranceBase: 2200,
    appreciation10y: 85,
    note: "The banking boomtown: coastal-refugee demand, ~0.8% property taxes, and new construction everywhere. Your money goes roughly twice as far as Boston.",
    hero: "",
  },
  {
    id: "boston",
    name: "Boston",
    state: "MA",
    medianPrice: 750000,
    pricePerSqft: 680,
    taxRate: 0.0105,
    insuranceBase: 2600,
    appreciation10y: 55,
    note: "Old housing stock, triple-deckers, and a residential exemption that knocks thousands off owner-occupied tax bills — but you're still paying NYC-adjacent prices for 1890s bones.",
    hero: img("1501979376754-2ff867a4f659"),
  },
  {
    id: "charleston",
    name: "Charleston",
    state: "SC",
    medianPrice: 550000,
    pricePerSqft: 310,
    taxRate: 0.0055,
    insuranceBase: 4500,
    appreciation10y: 95,
    note: "SC taxes primary homes at a 4% ratio — among the lowest effective rates in the country — then hurricane and flood insurance takes the savings right back.",
    hero: "",
  },
];

/** City hero image, falling back to the best scraped house photo. */
export function cityHero(city: City): string {
  if (city.hero) return city.hero;
  const homes = HOUSES.filter((h) => h.city === city.id);
  const pick = homes.find((h) => h.tier === "dream") ?? homes[0];
  return pick?.photos[0] ?? "";
}

export const CATEGORIES = [
  { id: "all", label: "All homes", icon: "home" },
  { id: "value", label: "Great value", icon: "tag" },
  { id: "offmarket", label: "Off-market", icon: "key" },
  { id: "pools", label: "Amazing pools", icon: "pool" },
  { id: "beachfront", label: "Beachfront", icon: "beach" },
  { id: "views", label: "Epic views", icon: "views" },
  { id: "mansions", label: "Mansions", icon: "mansion" },
  { id: "classic", label: "Classic charm", icon: "classic" },
  { id: "new", label: "New builds", icon: "sparkle" },
  { id: "backyard", label: "Big backyards", icon: "tree" },
  { id: "city", label: "City living", icon: "building" },
] as const;

export const TIERS: { id: Tier; label: string; blurb: string }[] = [
  { id: "realistic", label: "Realistic", blurb: "Around the city's median — homes real people buy" },
  { id: "dream", label: "Dream", blurb: "The stretch goal — top neighborhoods, serious space" },
  { id: "absurd", label: "Absurd", blurb: "Just for fun — the top 0.1% of the market" },
];

const SEED_HOUSES: House[] = [
  // ─── New York City ───────────────────────────────────────────────
  {
    id: "nyc-astoria-condo", city: "nyc", tier: "realistic",
    title: "Sunny corner condo near the N train", neighborhood: "Astoria, Queens",
    price: 675000, forSale: true, beds: 1, baths: 1, sqft: 720, yearBuilt: 2019,
    hoaMonthly: 610, pool: false, parking: "Street parking",
    categories: ["city", "new", "value"],
    photos: photos("1479839672679-a46483c0e7c8", I1),
    priceHistory: [{ year: 2019, price: 585000 }, { year: 2026, price: 675000 }],
    rentEstimate: 2950, walkScore: 94, risk: "Low",
    description: "Floor-to-ceiling windows on a quiet corner, 20 minutes to Midtown. New-development finishes without the Manhattan premium.",
    features: ["In-unit laundry", "Floor-to-ceiling windows", "Roof deck", "Pet friendly", "Storage unit"],
    daysOnMarket: 24,
  },
  {
    id: "nyc-uws-coop", city: "nyc", tier: "realistic",
    title: "Prewar co-op with park light", neighborhood: "Upper West Side, Manhattan",
    price: 899000, forSale: false, beds: 2, baths: 1, sqft: 950, yearBuilt: 1928,
    hoaMonthly: 1450, pool: false, parking: "None",
    categories: ["city", "classic", "offmarket"],
    photos: photos("1522708323590-d24dbb6b0267", I3),
    priceHistory: [{ year: 2015, price: 760000 }, { year: 2026, price: 899000 }],
    rentEstimate: 4300, walkScore: 99, risk: "Low",
    description: "Nine-foot ceilings, herringbone floors, and a co-op board that will interview you like the CIA. Two blocks from Central Park.",
    features: ["Prewar details", "Doorman building", "Herringbone floors", "Two blocks to Central Park"],
  },
  {
    id: "nyc-bushwick-condo", city: "nyc", tier: "realistic",
    title: "Loft-style condo off the L", neighborhood: "Bushwick, Brooklyn",
    price: 640000, forSale: true, beds: 1, baths: 1, sqft: 810, yearBuilt: 2021,
    hoaMonthly: 380, pool: false, parking: "Street parking",
    categories: ["city", "new", "value"],
    photos: photos("1502672260266-1c1ef2d93688", I6),
    priceHistory: [{ year: 2021, price: 615000 }, { year: 2026, price: 640000 }],
    rentEstimate: 3100, walkScore: 92, risk: "Low",
    description: "Eleven-foot ceilings and exposed concrete in new construction. Tax abatement runs through 2033, which is why the monthlies stay sane.",
    features: ["421-a tax abatement", "11-ft ceilings", "In-unit laundry", "Bike room", "Roof deck"],
    daysOnMarket: 41,
  },
  {
    id: "nyc-washington-heights", city: "nyc", tier: "realistic",
    title: "Top-floor 2-bed near the A express", neighborhood: "Washington Heights, Manhattan",
    price: 545000, forSale: false, beds: 2, baths: 1, sqft: 880, yearBuilt: 1931,
    hoaMonthly: 890, pool: false, parking: "None",
    categories: ["city", "value", "classic", "offmarket"],
    photos: photos("1600210492486-724fe5c67fb0", I4),
    priceHistory: [{ year: 2017, price: 430000 }, { year: 2026, price: 545000 }],
    rentEstimate: 2900, walkScore: 96, risk: "Low",
    description: "The last neighborhood in Manhattan where a 2-bed under $600K isn't a typo. Top floor, no upstairs neighbors, express train downstairs.",
    features: ["Top floor", "Prewar bones", "Elevator building", "Near Fort Tryon Park"],
  },
  {
    id: "nyc-brooklyn-heights-brownstone", city: "nyc", tier: "dream",
    title: "Parlor floors of a landmark brownstone", neighborhood: "Brooklyn Heights, Brooklyn",
    price: 3450000, forSale: true, beds: 4, baths: 2.5, sqft: 2600, lotSqft: 2000, yearBuilt: 1899,
    hoaMonthly: 0, pool: false, parking: "Street parking",
    categories: ["classic", "mansions"],
    photos: photos("1567496898669-ee935f5f647a", I5),
    priceHistory: [{ year: 2012, price: 1900000 }, { year: 2026, price: 3450000 }],
    rentEstimate: 11500, walkScore: 97, risk: "Low",
    description: "Original marble mantels, a garden out back, and the Promenade around the corner. The New York everyone imagines.",
    features: ["Original mantels", "Private garden", "Landmark block", "Wood-burning fireplace", "Cellar storage"],
    daysOnMarket: 66,
  },
  {
    id: "nyc-tribeca-loft", city: "nyc", tier: "dream",
    title: "Cast-iron loft with keyed elevator", neighborhood: "Tribeca, Manhattan",
    price: 4200000, forSale: false, beds: 3, baths: 3, sqft: 2450, yearBuilt: 1915,
    hoaMonthly: 2100, pool: false, parking: "Garage nearby",
    categories: ["city", "classic", "views", "offmarket"],
    photos: photos("1493809842364-78817add7ffb", I2),
    priceHistory: [{ year: 2013, price: 2700000 }, { year: 2026, price: 4200000 }],
    rentEstimate: 15500, walkScore: 99, risk: "Low",
    description: "A true factory conversion: 40-foot great room, cast-iron columns, keyed elevator opening into the unit. Not listed — but this is what it would fetch.",
    features: ["Keyed elevator", "Cast-iron columns", "40-ft great room", "Chef's kitchen", "Full-floor unit"],
  },
  {
    id: "nyc-west-village-duplex", city: "nyc", tier: "dream",
    title: "Duplex with a private garden", neighborhood: "West Village, Manhattan",
    price: 2450000, forSale: true, beds: 2, baths: 2, sqft: 1500, yearBuilt: 1900,
    hoaMonthly: 0, pool: false, parking: "None",
    categories: ["classic", "backyard"],
    photos: photos("1494526585095-c41746248156", I3),
    priceHistory: [{ year: 2016, price: 1850000 }, { year: 2026, price: 2450000 }],
    rentEstimate: 8900, walkScore: 100, risk: "Low",
    description: "Bottom two floors of an 1900 townhouse with your own garden — outdoor space in the most walkable zip code in America.",
    features: ["Private garden", "Duplex layout", "Wood-burning fireplace", "Townhouse block"],
    daysOnMarket: 12,
  },
  {
    id: "nyc-billionaires-row-ph", city: "nyc", tier: "absurd",
    title: "Penthouse above the park", neighborhood: "Billionaires' Row, Manhattan",
    price: 28500000, forSale: true, beds: 4, baths: 5.5, sqft: 4800, yearBuilt: 2015,
    hoaMonthly: 9800, pool: true, parking: "Valet garage",
    categories: ["city", "views", "mansions"],
    photos: photos("1522156373667-4c7234bbd804", I5),
    priceHistory: [{ year: 2016, price: 31000000 }, { year: 2026, price: 28500000 }],
    rentEstimate: 65000, walkScore: 98, risk: "Low",
    description: "1,000 feet up with Central Park as your front lawn. Fun fact: it's worth less than it sold for in 2016 — even billionaires catch falling knives.",
    features: ["Full park views", "Private elevator", "Building pool & spa", "Valet parking", "White-glove staff"],
    daysOnMarket: 210,
  },
  {
    id: "nyc-wv-mansion", city: "nyc", tier: "absurd",
    title: "Greek Revival mansion on a cobblestone block", neighborhood: "West Village, Manhattan",
    price: 38000000, forSale: false, beds: 6, baths: 7, sqft: 8200, lotSqft: 3000, yearBuilt: 1846,
    hoaMonthly: 0, pool: false, parking: "Private garage",
    categories: ["mansions", "classic", "backyard", "offmarket"],
    photos: photos("1598928506311-c55ded91a20c", I5),
    priceHistory: [{ year: 2005, price: 12000000 }, { year: 2026, price: 38000000 }],
    rentEstimate: 90000, walkScore: 100, risk: "Low",
    description: "An entire 25-foot-wide townhouse, garden, garage, and 180 years of history. Never listed — homes like this trade hands quietly.",
    features: ["25-ft width", "Private garage", "Garden + roof terrace", "Six wood-burning fireplaces", "Staff quarters"],
  },

  // ─── Miami ───────────────────────────────────────────────────────
  {
    id: "mia-little-havana", city: "miami", tier: "realistic",
    title: "Pastel bungalow with a mango tree", neighborhood: "Little Havana",
    price: 465000, forSale: true, beds: 3, baths: 2, sqft: 1240, lotSqft: 5000, yearBuilt: 1948,
    hoaMonthly: 0, pool: false, parking: "Driveway",
    categories: ["value", "classic"],
    photos: photos("1570129477492-45c003edd2be", I1),
    priceHistory: [{ year: 2019, price: 295000 }, { year: 2026, price: 465000 }],
    rentEstimate: 2750, walkScore: 78, risk: "Flood zone X (moderate)",
    description: "A 1948 bungalow ten minutes from Brickell, cafecito windows on the corner. Up 58% since 2019 — Miami's run in one listing.",
    features: ["Mango tree", "Terrazzo floors", "Fenced yard", "No HOA", "Impact windows"],
    daysOnMarket: 33,
  },
  {
    id: "mia-brickell-condo", city: "miami", tier: "realistic",
    title: "Glass tower 1-bed with bay views", neighborhood: "Brickell",
    price: 520000, forSale: true, beds: 1, baths: 1, sqft: 780, yearBuilt: 2018,
    hoaMonthly: 850, pool: true, parking: "1 garage space",
    categories: ["city", "views", "pools", "new"],
    photos: photos("1460317442991-0ec209397118", I4),
    priceHistory: [{ year: 2018, price: 410000 }, { year: 2026, price: 520000 }],
    rentEstimate: 2900, walkScore: 91, risk: "Flood zone AE (high)",
    description: "Resort-style amenity deck, bay views from the 30th floor. The $850 HOA is the real monthly rent you pay for the pool photos.",
    features: ["Bay views", "Pool deck + gym", "24h security", "Garage parking", "Balcony"],
    daysOnMarket: 55,
  },
  {
    id: "mia-north-beach-deco", city: "miami", tier: "realistic",
    title: "Art deco walk-up two blocks from sand", neighborhood: "North Beach",
    price: 445000, forSale: false, beds: 2, baths: 1, sqft: 900, yearBuilt: 1939,
    hoaMonthly: 420, pool: false, parking: "Street parking",
    categories: ["classic", "beachfront", "value", "offmarket"],
    photos: photos("1523217582562-09d0def993a6", I3),
    priceHistory: [{ year: 2016, price: 255000 }, { year: 2026, price: 445000 }],
    rentEstimate: 2600, walkScore: 88, risk: "Flood zone AE (high)",
    description: "Original 1939 deco curves, two blocks to the beach, and a fraction of South Beach prices. Not for sale — this is its estimated value.",
    features: ["Original deco details", "2 blocks to beach", "Corner unit", "Low-rise building"],
  },
  {
    id: "mia-kendall-house", city: "miami", tier: "realistic",
    title: "Family ranch with a real backyard", neighborhood: "Kendall",
    price: 610000, forSale: true, beds: 4, baths: 2, sqft: 1850, lotSqft: 7500, yearBuilt: 1979,
    hoaMonthly: 0, pool: false, parking: "2-car garage",
    categories: ["backyard", "value"],
    photos: photos("1568605114967-8130f3a36994", I2),
    priceHistory: [{ year: 2020, price: 420000 }, { year: 2026, price: 610000 }],
    rentEstimate: 3400, walkScore: 52, risk: "Flood zone X (moderate)",
    description: "The Miami family starter: 4 beds, a yard for the dog, decent schools. You'll drive everywhere, and you'll insure it for $9K a year.",
    features: ["2-car garage", "Fenced yard", "Updated kitchen", "No HOA", "Hurricane shutters"],
    daysOnMarket: 47,
  },
  {
    id: "mia-coconut-grove-villa", city: "miami", tier: "dream",
    title: "Walled villa under the banyans", neighborhood: "Coconut Grove",
    price: 3200000, forSale: true, beds: 5, baths: 4, sqft: 3900, lotSqft: 11000, yearBuilt: 2001,
    hoaMonthly: 0, pool: true, parking: "Gated 2-car garage",
    categories: ["pools", "mansions", "backyard"],
    photos: photos("1583608205776-bfd35f0d9f83", I5),
    priceHistory: [{ year: 2014, price: 1450000 }, { year: 2026, price: 3200000 }],
    rentEstimate: 14500, walkScore: 71, risk: "Flood zone X (moderate)",
    description: "Behind a coral wall in the Grove's banyan canopy: pool, summer kitchen, and a neighborhood that predates Miami itself.",
    features: ["Heated pool", "Summer kitchen", "Gated entry", "Guest suite", "Canopy street"],
    daysOnMarket: 58,
  },
  {
    id: "mia-miami-beach-deco", city: "miami", tier: "dream",
    title: "Restored deco corner home with pool", neighborhood: "Miami Beach",
    price: 2350000, forSale: false, beds: 4, baths: 3, sqft: 2600, lotSqft: 6000, yearBuilt: 1936,
    hoaMonthly: 0, pool: true, parking: "Driveway",
    categories: ["classic", "pools", "beachfront", "offmarket"],
    photos: photos("1512917774080-9991f1c4c750", I2),
    priceHistory: [{ year: 2012, price: 900000 }, { year: 2026, price: 2350000 }],
    rentEstimate: 11000, walkScore: 90, risk: "Flood zone AE (high)",
    description: "A 1936 deco house restored down to the porthole windows, saltwater pool in back. Owner isn't selling; the market says $2.35M anyway.",
    features: ["Saltwater pool", "Restored deco facade", "Impact glass", "Outdoor shower", "Bike to beach"],
  },
  {
    id: "mia-key-biscayne", city: "miami", tier: "dream",
    title: "Oceanfront 3-bed on Key Biscayne", neighborhood: "Key Biscayne",
    price: 1950000, forSale: true, beds: 3, baths: 2.5, sqft: 1900, yearBuilt: 2004,
    hoaMonthly: 1900, pool: true, parking: "2 garage spaces",
    categories: ["beachfront", "views", "pools"],
    photos: photos("1512915922686-57c11dde9b6b", I4),
    priceHistory: [{ year: 2015, price: 1150000 }, { year: 2026, price: 1950000 }],
    rentEstimate: 9500, walkScore: 65, risk: "Flood zone VE (severe)",
    description: "Wake up to the Atlantic. Island life 15 minutes from downtown — with an HOA and insurance bill that reflect the front-row seat.",
    features: ["Direct ocean views", "Beach access", "Resort pool", "Tennis courts", "Hurricane-rated glass"],
    daysOnMarket: 82,
  },
  {
    id: "mia-star-island", city: "miami", tier: "absurd",
    title: "Star Island compound with 100 ft of bay", neighborhood: "Star Island",
    price: 24000000, forSale: true, beds: 8, baths: 10, sqft: 12400, lotSqft: 40000, yearBuilt: 2019,
    hoaMonthly: 0, pool: true, parking: "Motor court + garage",
    categories: ["mansions", "pools", "beachfront", "views", "new"],
    photos: photos("1613490493576-7fde63acd811", I5),
    priceHistory: [{ year: 2012, price: 9500000 }, { year: 2026, price: 24000000 }],
    rentEstimate: 180000, walkScore: 40, risk: "Flood zone AE (high)",
    description: "Guard-gated island, 100 feet of bayfront, dock for the yacht you also can't afford. Your neighbors are whoever's famous this decade.",
    features: ["100-ft waterfront", "Private dock", "Infinity pool", "Home theater", "Guard-gated island", "Guest house"],
    daysOnMarket: 190,
  },
  {
    id: "mia-sunny-isles-ph", city: "miami", tier: "absurd",
    title: "Full-floor sky penthouse", neighborhood: "Sunny Isles Beach",
    price: 16500000, forSale: false, beds: 5, baths: 6.5, sqft: 7200, yearBuilt: 2021,
    hoaMonthly: 7400, pool: true, parking: "Private 4-car garage in sky",
    categories: ["views", "new", "city", "beachfront", "offmarket"],
    photos: photos("1522156373667-4c7234bbd804", I5),
    priceHistory: [{ year: 2021, price: 14000000 }, { year: 2026, price: 16500000 }],
    rentEstimate: 70000, walkScore: 77, risk: "Flood zone AE (high)",
    description: "An entire floor 600 feet over the Atlantic, with a car elevator to a private sky garage. Not listed. Estimated at $16.5M.",
    features: ["360° ocean views", "Private sky garage", "Car elevator", "Private pool on terrace", "Full-floor unit"],
  },

  // ─── San Diego ───────────────────────────────────────────────────
  {
    id: "sd-north-park", city: "san-diego", tier: "realistic",
    title: "Craftsman bungalow near 30th Street", neighborhood: "North Park",
    price: 895000, forSale: true, beds: 2, baths: 1, sqft: 1050, lotSqft: 4500, yearBuilt: 1925,
    hoaMonthly: 0, pool: false, parking: "Driveway + garage",
    categories: ["classic", "value"],
    photos: photos("1549517045-bc93de075e53", I1),
    priceHistory: [{ year: 2018, price: 615000 }, { year: 2026, price: 895000 }],
    rentEstimate: 3600, walkScore: 89, risk: "Low",
    description: "A 1925 craftsman on the best beer-and-tacos street in the city. Under $900K in San Diego now counts as a deal — welcome to California.",
    features: ["Original built-ins", "Front porch", "Detached garage", "Walk to 30th St", "ADU potential"],
    daysOnMarket: 21,
  },
  {
    id: "sd-clairemont", city: "san-diego", tier: "realistic",
    title: "Mid-century post-and-beam over a canyon", neighborhood: "Clairemont",
    price: 940000, forSale: false, beds: 3, baths: 2, sqft: 1400, lotSqft: 6800, yearBuilt: 1962,
    hoaMonthly: 0, pool: false, parking: "2-car garage",
    categories: ["backyard", "value", "offmarket"],
    photos: photos("1600607687939-ce8a6c25118c", I2),
    priceHistory: [{ year: 2016, price: 560000 }, { year: 2026, price: 940000 }],
    rentEstimate: 4100, walkScore: 61, risk: "Wildfire: moderate",
    description: "1962 post-and-beam with canyon views out the back glass. Not on the market — the owners bought in 2016 and pay taxes on that price, not this one.",
    features: ["Canyon views", "Post-and-beam ceilings", "Original terrazzo", "2-car garage"],
  },
  {
    id: "sd-downtown-condo", city: "san-diego", tier: "realistic",
    title: "East Village high-rise 1-bed", neighborhood: "Downtown",
    price: 585000, forSale: true, beds: 1, baths: 1, sqft: 740, yearBuilt: 2007,
    hoaMonthly: 720, pool: true, parking: "1 garage space",
    categories: ["city", "pools", "value"],
    photos: photos("1600607687920-4e2a09cf159d", I4),
    priceHistory: [{ year: 2019, price: 480000 }, { year: 2026, price: 585000 }],
    rentEstimate: 2700, walkScore: 95, risk: "Low",
    description: "Walk to Petco Park, pool on the roof. The HOA is steep but it buys you the whole amenity floor.",
    features: ["Rooftop pool", "Gym + sauna", "Balcony", "Walk to ballpark", "Garage space"],
    daysOnMarket: 39,
  },
  {
    id: "sd-chula-vista", city: "san-diego", tier: "realistic",
    title: "New-build townhome with solar", neighborhood: "Chula Vista",
    price: 720000, forSale: true, beds: 3, baths: 2.5, sqft: 1580, yearBuilt: 2023,
    hoaMonthly: 310, pool: false, parking: "2-car garage",
    categories: ["new", "value"],
    photos: photos("1600585154340-be6161a56a0c", I3),
    priceHistory: [{ year: 2023, price: 665000 }, { year: 2026, price: 720000 }],
    rentEstimate: 3500, walkScore: 55, risk: "Low",
    description: "2023 construction, paid-off solar, EV charger in the garage. The trade: a 25-minute drive to everything.",
    features: ["Owned solar", "EV charger", "Smart home wiring", "New everything", "Community park"],
    daysOnMarket: 18,
  },
  {
    id: "sd-la-jolla-view", city: "san-diego", tier: "dream",
    title: "Glass house over the cove", neighborhood: "La Jolla",
    price: 3900000, forSale: true, beds: 4, baths: 3.5, sqft: 3200, lotSqft: 8000, yearBuilt: 2016,
    hoaMonthly: 0, pool: true, parking: "3-car garage",
    categories: ["views", "pools", "mansions", "new"],
    photos: photos("1600047509807-ba8f99d2cdde", I5),
    priceHistory: [{ year: 2016, price: 2400000 }, { year: 2026, price: 3900000 }],
    rentEstimate: 15000, walkScore: 72, risk: "Wildfire: moderate",
    description: "Walls of glass aimed at the Pacific, infinity-edge pool, sea lions barking in the distance. This is the California poster.",
    features: ["Ocean views from every room", "Infinity pool", "Glass walls", "Outdoor kitchen", "3-car garage"],
    daysOnMarket: 74,
  },
  {
    id: "sd-encinitas", city: "san-diego", tier: "dream",
    title: "The surf shack that grew up", neighborhood: "Encinitas",
    price: 2450000, forSale: false, beds: 4, baths: 3, sqft: 2500, lotSqft: 9000, yearBuilt: 1988,
    hoaMonthly: 0, pool: false, parking: "2-car garage",
    categories: ["beachfront", "backyard", "offmarket"],
    photos: photos("1600585154526-990dced4db0d", I2),
    priceHistory: [{ year: 2010, price: 890000 }, { year: 2026, price: 2450000 }],
    rentEstimate: 9500, walkScore: 68, risk: "Low",
    description: "Ten-minute walk to Swami's with an avocado tree in the yard. Owner surfs every morning and will never, ever sell. Estimated anyway.",
    features: ["Walk to Swami's", "Avocado + citrus trees", "Outdoor shower", "Big lot", "Owned solar"],
  },
  {
    id: "sd-del-mar", city: "san-diego", tier: "dream",
    title: "Bluff-top cottage above the break", neighborhood: "Del Mar",
    price: 3200000, forSale: false, beds: 3, baths: 2, sqft: 1800, lotSqft: 5500, yearBuilt: 1972,
    hoaMonthly: 0, pool: false, parking: "Carport",
    categories: ["beachfront", "views", "classic", "offmarket"],
    photos: photos("1544984243-ec57ea16fe25", I3),
    priceHistory: [{ year: 2004, price: 1200000 }, { year: 2026, price: 3200000 }],
    rentEstimate: 12000, walkScore: 74, risk: "Coastal bluff erosion",
    description: "A 1972 cottage worth $3.2M entirely because of what's under it: a bluff lot over the Pacific. The house is almost irrelevant.",
    features: ["Bluff-top lot", "Whitewater views", "Walk to village", "Original beam ceilings"],
  },
  {
    id: "sd-la-jolla-oceanfront", city: "san-diego", tier: "absurd",
    title: "Oceanfront modern estate", neighborhood: "La Jolla",
    price: 19500000, forSale: true, beds: 6, baths: 8, sqft: 9800, lotSqft: 20000, yearBuilt: 2022,
    hoaMonthly: 0, pool: true, parking: "6-car subterranean garage",
    categories: ["mansions", "views", "pools", "new", "beachfront"],
    photos: photos("1613977257363-707ba9348227", I5),
    priceHistory: [{ year: 2010, price: 7800000 }, { year: 2026, price: 19500000 }],
    rentEstimate: 95000, walkScore: 58, risk: "Coastal bluff erosion",
    description: "Private stairs to the sand, a glass elevator, and a wellness level with a cold plunge. The Pacific is your infinity edge.",
    features: ["Private beach stairs", "Glass elevator", "Wellness level + cold plunge", "Infinity pool", "Smart-home everything"],
    daysOnMarket: 160,
  },
  {
    id: "sd-rancho-santa-fe", city: "san-diego", tier: "absurd",
    title: "Hacienda with its own orchards", neighborhood: "Rancho Santa Fe",
    price: 12500000, forSale: false, beds: 7, baths: 9, sqft: 11500, lotSqft: 130000, yearBuilt: 2005,
    hoaMonthly: 0, pool: true, parking: "Motor court, 5-car garage",
    categories: ["mansions", "backyard", "pools", "offmarket"],
    photos: photos("1580587771525-78b9dba3b914", I2),
    priceHistory: [{ year: 2011, price: 6900000 }, { year: 2026, price: 12500000 }],
    rentEstimate: 48000, walkScore: 8, risk: "Wildfire: high",
    description: "Three acres of citrus and olive trees, a pool pavilion, and total silence. Walk score of 8 — you don't walk anywhere, you own everywhere.",
    features: ["3-acre lot", "Citrus + olive orchards", "Pool pavilion", "Guest casita", "Equestrian rights"],
  },

  // ─── Austin ──────────────────────────────────────────────────────
  {
    id: "atx-east-side", city: "austin", tier: "realistic",
    title: "East Austin bungalow with porch swing", neighborhood: "Holly",
    price: 480000, forSale: true, beds: 2, baths: 1, sqft: 950, lotSqft: 5800, yearBuilt: 1946,
    hoaMonthly: 0, pool: false, parking: "Driveway",
    categories: ["classic", "value"],
    photos: photos("1494526585095-c41746248156", I1),
    priceHistory: [{ year: 2019, price: 390000 }, { year: 2022, price: 610000 }, { year: 2026, price: 480000 }],
    rentEstimate: 2300, walkScore: 82, risk: "Low",
    description: "Peaked at $610K in 2022, now $480K — the entire Austin story in one price history. Walk to Lady Bird Lake and half the city's food trucks.",
    features: ["Front porch", "Walk to Lady Bird Lake", "Original hardwoods", "Big pecan tree", "No HOA"],
    daysOnMarket: 52,
  },
  {
    id: "atx-mueller", city: "austin", tier: "realistic",
    title: "Mueller row home on a pocket park", neighborhood: "Mueller",
    price: 545000, forSale: true, beds: 3, baths: 2.5, sqft: 1650, yearBuilt: 2017,
    hoaMonthly: 95, pool: false, parking: "2-car garage",
    categories: ["new", "value"],
    photos: photos("1600585153490-76fb20a32601", I3),
    priceHistory: [{ year: 2017, price: 425000 }, { year: 2026, price: 545000 }],
    rentEstimate: 2700, walkScore: 74, risk: "Low",
    description: "Austin's planned-community darling: alley-loaded garage, pocket park out front, farmers market on Sundays.",
    features: ["Pocket park frontage", "Alley-loaded garage", "Community pools", "Solar-ready", "Walk to town center"],
    daysOnMarket: 35,
  },
  {
    id: "atx-soco-condo", city: "austin", tier: "realistic",
    title: "SoCo condo with a skyline deck", neighborhood: "South Congress",
    price: 430000, forSale: false, beds: 1, baths: 1, sqft: 690, yearBuilt: 2020,
    hoaMonthly: 410, pool: true, parking: "1 garage space",
    categories: ["city", "views", "pools", "value", "offmarket"],
    photos: photos("1600047509358-9dc75507daeb", I4),
    priceHistory: [{ year: 2020, price: 385000 }, { year: 2026, price: 430000 }],
    rentEstimate: 1950, walkScore: 90, risk: "Low",
    description: "Roof deck pointed straight at the Capitol, tacos downstairs. Not for sale — this is what it would go for.",
    features: ["Skyline roof deck", "Pool", "Walk to SoCo strip", "In-unit laundry"],
  },
  {
    id: "atx-round-rock", city: "austin", tier: "realistic",
    title: "Suburban 4-bed with a real yard", neighborhood: "Round Rock",
    price: 390000, forSale: true, beds: 4, baths: 2.5, sqft: 2300, lotSqft: 8200, yearBuilt: 2015,
    hoaMonthly: 40, pool: false, parking: "2-car garage",
    categories: ["backyard", "value", "new"],
    photos: photos("1605276374104-dee2a0ed3cd6", I2),
    priceHistory: [{ year: 2015, price: 260000 }, { year: 2022, price: 480000 }, { year: 2026, price: 390000 }],
    rentEstimate: 2450, walkScore: 34, risk: "Low",
    description: "2,300 sqft for $390K — this is why people leave the coasts. The catch: ~1.9% Texas property tax and a car for every errand.",
    features: ["Big fenced yard", "Open-plan kitchen", "Top-rated schools", "Community pool", "2-car garage"],
    daysOnMarket: 61,
  },
  {
    id: "atx-zilker", city: "austin", tier: "dream",
    title: "Zilker modern with a pool", neighborhood: "Zilker",
    price: 2100000, forSale: true, beds: 4, baths: 3.5, sqft: 3000, lotSqft: 8000, yearBuilt: 2019,
    hoaMonthly: 0, pool: true, parking: "2-car garage",
    categories: ["pools", "new", "backyard"],
    photos: photos("1600596542815-ffad4c1539a9", I5),
    priceHistory: [{ year: 2019, price: 1500000 }, { year: 2026, price: 2100000 }],
    rentEstimate: 7800, walkScore: 78, risk: "Low",
    description: "Walk to Barton Springs, swim in your own backyard first. Austin's most-wanted zip code, in the flesh.",
    features: ["Pool + tanning ledge", "Walk to Barton Springs", "Butterfly roof", "Outdoor living room", "EV charger"],
    daysOnMarket: 44,
  },
  {
    id: "atx-lake-austin", city: "austin", tier: "dream",
    title: "Lake Austin deck house", neighborhood: "Lake Austin",
    price: 2800000, forSale: false, beds: 4, baths: 4, sqft: 3600, lotSqft: 14000, yearBuilt: 1996,
    hoaMonthly: 0, pool: true, parking: "2-car garage + boat slip",
    categories: ["views", "pools", "backyard", "offmarket"],
    photos: photos("1600573472592-401b489a3cdc", I2),
    priceHistory: [{ year: 2009, price: 1100000 }, { year: 2026, price: 2800000 }],
    rentEstimate: 9800, walkScore: 20, risk: "Flood zone AE (high)",
    description: "Cantilevered decks over the water, private boat slip, cliff swallows for neighbors. Off-market, like most of the lake.",
    features: ["Private boat slip", "Two-story decks", "Lakeside pool", "Outdoor shower"],
  },
  {
    id: "atx-travis-heights", city: "austin", tier: "dream",
    title: "Travis Heights craftsman under the oaks", neighborhood: "Travis Heights",
    price: 1650000, forSale: true, beds: 4, baths: 3, sqft: 2700, lotSqft: 7000, yearBuilt: 1932,
    hoaMonthly: 0, pool: false, parking: "Detached garage",
    categories: ["classic", "backyard"],
    photos: photos("1570129477492-45c003edd2be", I3),
    priceHistory: [{ year: 2014, price: 780000 }, { year: 2026, price: 1650000 }],
    rentEstimate: 6200, walkScore: 85, risk: "Low",
    description: "A 1932 craftsman on one of the prettiest streets south of the river, live oaks arching over the block.",
    features: ["Wraparound porch", "Live oak canopy", "Original shiplap", "Studio over garage", "Walk to SoCo"],
    daysOnMarket: 29,
  },
  {
    id: "atx-westlake-estate", city: "austin", tier: "absurd",
    title: "Lakefront estate with a boathouse", neighborhood: "Westlake",
    price: 9800000, forSale: true, beds: 6, baths: 7, sqft: 9200, lotSqft: 65000, yearBuilt: 2014,
    hoaMonthly: 0, pool: true, parking: "Gated motor court",
    categories: ["mansions", "views", "pools", "backyard"],
    photos: photos("1512917774080-9991f1c4c750", I5),
    priceHistory: [{ year: 2014, price: 5200000 }, { year: 2026, price: 9800000 }],
    rentEstimate: 40000, walkScore: 12, risk: "Wildfire: moderate",
    description: "A 1.5-acre point lot on Lake Austin: two-slip boathouse, negative-edge pool, and a wine room bigger than most condos on this site.",
    features: ["Two-slip boathouse", "Negative-edge pool", "1,500-bottle wine room", "Sport court", "Guest wing"],
    daysOnMarket: 130,
  },
  {
    id: "atx-downtown-ph", city: "austin", tier: "absurd",
    title: "Glass penthouse over Sixth Street", neighborhood: "Downtown",
    price: 7200000, forSale: false, beds: 4, baths: 4.5, sqft: 5200, yearBuilt: 2022,
    hoaMonthly: 3900, pool: true, parking: "4 reserved spaces",
    categories: ["city", "views", "new", "offmarket"],
    photos: photos("1522156373667-4c7234bbd804", I5),
    priceHistory: [{ year: 2022, price: 6100000 }, { year: 2026, price: 7200000 }],
    rentEstimate: 32000, walkScore: 96, risk: "Low",
    description: "Top of the tallest tower in Texas, hill country sunsets through 12-foot glass. Estimated — penthouses like this trade off-market.",
    features: ["12-ft glass walls", "Private terrace + spa", "Hotel services", "4 parking spaces", "Hill country views"],
  },

  // ─── Chicago ─────────────────────────────────────────────────────
  {
    id: "chi-avondale", city: "chicago", tier: "realistic",
    title: "Brick two-flat — live up, rent down", neighborhood: "Avondale",
    price: 385000, forSale: true, beds: 3, baths: 2, sqft: 1700, lotSqft: 3100, yearBuilt: 1912,
    hoaMonthly: 0, pool: false, parking: "Alley garage",
    categories: ["classic", "value"],
    photos: photos("1449844908441-8829872d2607", I1),
    priceHistory: [{ year: 2015, price: 300000 }, { year: 2026, price: 385000 }],
    rentEstimate: 2400, walkScore: 84, risk: "Low",
    description: "The classic Chicago wealth-builder: a 1912 brick two-flat. Live in one unit, let the other one pay half your mortgage.",
    features: ["Two units", "Rental income potential", "Alley garage", "Full basement", "Near the Blue Line"],
    daysOnMarket: 44,
  },
  {
    id: "chi-pilsen-loft", city: "chicago", tier: "realistic",
    title: "Timber loft in a converted factory", neighborhood: "Pilsen",
    price: 310000, forSale: true, beds: 1, baths: 1, sqft: 900, yearBuilt: 1920,
    hoaMonthly: 290, pool: false, parking: "Deeded space",
    categories: ["city", "value", "classic"],
    photos: photos("1560185007-cde436f6a4d0", I4),
    priceHistory: [{ year: 2016, price: 215000 }, { year: 2026, price: 310000 }],
    rentEstimate: 1800, walkScore: 91, risk: "Low",
    description: "Exposed timber beams and 14-foot ceilings in a 1920 factory, surrounded by the best murals and taquerías in the city.",
    features: ["14-ft timber ceilings", "Exposed brick", "Deeded parking", "In-unit laundry"],
    daysOnMarket: 27,
  },
  {
    id: "chi-portage-park", city: "chicago", tier: "realistic",
    title: "Classic Chicago brick bungalow", neighborhood: "Portage Park",
    price: 342000, forSale: false, beds: 3, baths: 1.5, sqft: 1450, lotSqft: 3750, yearBuilt: 1926,
    hoaMonthly: 0, pool: false, parking: "2-car alley garage",
    categories: ["classic", "value", "backyard", "offmarket"],
    photos: photos("1600566753086-00f18fb6b3ea", I3),
    priceHistory: [{ year: 2015, price: 255000 }, { year: 2026, price: 342000 }],
    rentEstimate: 2200, walkScore: 72, risk: "Low",
    description: "One of the 80,000 bungalows that ring the city — face brick, stained glass, full basement. Not for sale; this is its estimated value.",
    features: ["Bungalow belt original", "Stained glass windows", "Full basement", "Fenced yard"],
  },
  {
    id: "chi-south-loop", city: "chicago", tier: "realistic",
    title: "South Loop 2-bed with balcony", neighborhood: "South Loop",
    price: 415000, forSale: true, beds: 2, baths: 2, sqft: 1200, yearBuilt: 2008,
    hoaMonthly: 640, pool: true, parking: "1 garage space",
    categories: ["city", "pools", "value"],
    photos: photos("1560185127-6ed189bf02f4", I2),
    priceHistory: [{ year: 2019, price: 390000 }, { year: 2026, price: 415000 }],
    rentEstimate: 2600, walkScore: 93, risk: "Low",
    description: "Lake in one direction, skyline in the other, Grant Park in between. $415K for what would be $1.4M in Manhattan.",
    features: ["Balcony", "Indoor pool + gym", "Doorman", "Garage space", "Walk to the lake"],
    daysOnMarket: 38,
  },
  {
    id: "chi-lincoln-park-greystone", city: "chicago", tier: "dream",
    title: "Lincoln Park greystone", neighborhood: "Lincoln Park",
    price: 2400000, forSale: true, beds: 5, baths: 4.5, sqft: 4200, lotSqft: 3000, yearBuilt: 1895,
    hoaMonthly: 0, pool: false, parking: "2-car garage",
    categories: ["classic", "mansions"],
    photos: photos("1616486338812-3dadae4b4ace", I5),
    priceHistory: [{ year: 2013, price: 1500000 }, { year: 2026, price: 2400000 }],
    rentEstimate: 9000, walkScore: 95, risk: "Low",
    description: "An 1895 greystone two blocks from the park: carved limestone, bay windows, and a gut renovation someone else already paid for.",
    features: ["Carved limestone facade", "Chef's kitchen", "Rooftop deck over garage", "Radiant-heat baths", "Wine cellar"],
    daysOnMarket: 71,
  },
  {
    id: "chi-gold-coast-coop", city: "chicago", tier: "dream",
    title: "Gold Coast co-op over the lake", neighborhood: "Gold Coast",
    price: 1350000, forSale: false, beds: 3, baths: 3, sqft: 2600, yearBuilt: 1927,
    hoaMonthly: 2350, pool: false, parking: "Valet garage",
    categories: ["classic", "city", "views", "offmarket"],
    photos: photos("1598928506311-c55ded91a20c", I5),
    priceHistory: [{ year: 2010, price: 1050000 }, { year: 2026, price: 1350000 }],
    rentEstimate: 6000, walkScore: 97, risk: "Low",
    description: "A 1927 co-op with lake views and a library. The $2,350 monthly assessment includes taxes — co-op math is its own adventure.",
    features: ["Lake Michigan views", "Library + formal dining", "Assessments include taxes", "Valet parking", "1927 detail throughout"],
  },
  {
    id: "chi-bucktown-new", city: "chicago", tier: "dream",
    title: "Bucktown new-build with roof deck", neighborhood: "Bucktown",
    price: 1750000, forSale: true, beds: 4, baths: 3.5, sqft: 3400, lotSqft: 3000, yearBuilt: 2024,
    hoaMonthly: 0, pool: false, parking: "2-car garage",
    categories: ["new", "views", "backyard"],
    photos: photos("1600566753190-17f0baa2a6c3", I2),
    priceHistory: [{ year: 2024, price: 1680000 }, { year: 2026, price: 1750000 }],
    rentEstimate: 7200, walkScore: 92, risk: "Low",
    description: "2024 construction with a skyline-view roof deck, steps from The 606 trail. New-build everything, zero HOA.",
    features: ["Skyline roof deck", "Steps to The 606", "Radiant basement floors", "Smart home", "2-car garage"],
    daysOnMarket: 15,
  },
  {
    id: "chi-astor-street", city: "chicago", tier: "absurd",
    title: "Astor Street mansion", neighborhood: "Gold Coast",
    price: 8000000, forSale: true, beds: 7, baths: 8, sqft: 10500, lotSqft: 4800, yearBuilt: 1891,
    hoaMonthly: 0, pool: false, parking: "Coach house garage",
    categories: ["mansions", "classic"],
    photos: photos("1512915922686-57c11dde9b6b", I5),
    priceHistory: [{ year: 2008, price: 6500000 }, { year: 2026, price: 8000000 }],
    rentEstimate: 30000, walkScore: 96, risk: "Low",
    description: "An 1891 landmark on Chicago's grandest block — ballroom, coach house, six fireplaces. $8M here buys what $40M buys in Manhattan.",
    features: ["Ballroom", "Coach house", "Six fireplaces", "Elevator", "Landmark district"],
    daysOnMarket: 240,
  },
  {
    id: "chi-streeterville-ph", city: "chicago", tier: "absurd",
    title: "Full-floor penthouse over the lake", neighborhood: "Streeterville",
    price: 6500000, forSale: false, beds: 5, baths: 5.5, sqft: 6800, yearBuilt: 2009,
    hoaMonthly: 5200, pool: true, parking: "3 garage spaces",
    categories: ["city", "views", "offmarket"],
    photos: photos("1560448204-e02f11c3d0e2", I5),
    priceHistory: [{ year: 2009, price: 5800000 }, { year: 2026, price: 6500000 }],
    rentEstimate: 27000, walkScore: 98, risk: "Low",
    description: "An entire floor with Lake Michigan filling every east window. Estimated value — full-floor units almost never list publicly.",
    features: ["360° lake + skyline views", "Private elevator landing", "Building pool + spa", "3 parking spaces"],
  },
];

// Live data from the Apify Zillow pipeline (scripts/fetch-live-data.mjs).
// When present it replaces the curated seed above; the seed stays as fallback.
const LIVE_HOUSES = liveHouses as unknown as House[];
export const HOUSES: House[] = LIVE_HOUSES.length > 0 ? LIVE_HOUSES : SEED_HOUSES;

export function getCity(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export function getHouse(id: string): House | undefined {
  return HOUSES.find((h) => h.id === id);
}

export function housesIn(city: CityId): House[] {
  return HOUSES.filter((h) => h.city === city);
}

/** Houses in other cities within ±15% of this one's price. */
export function sameMoneyElsewhere(house: House): House[] {
  return HOUSES.filter(
    (h) =>
      h.city !== house.city &&
      h.id !== house.id &&
      Math.abs(h.price - house.price) / house.price <= 0.15
  ).sort((a, b) => Math.abs(a.price - house.price) - Math.abs(b.price - house.price));
}
