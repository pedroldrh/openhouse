export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-fog">
      <div className="mx-auto grid gap-10 px-6 py-12 sm:grid-cols-3 md:px-10 xl:px-20">
        <div>
          <p className="text-sm font-semibold">Explore</p>
          <ul className="mt-3 space-y-2.5 text-sm text-ink/80">
            <li>New York City</li>
            <li>Miami</li>
            <li>San Diego</li>
            <li>Austin</li>
            <li>Chicago</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">How it works</p>
          <ul className="mt-3 space-y-2.5 text-sm text-ink/80">
            <li>Pick a city, browse real-style homes</li>
            <li>All-in monthly cost, not sticker price</li>
            <li>Off-market homes with estimated values</li>
            <li>Pin homes to compare across cities</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">The fine print</p>
          <p className="mt-3 text-sm leading-6 text-ink/80">
            OpenHouse is a window-shopping toy, not a brokerage. Prices, taxes, and estimates are
            illustrative — for exploration, not financial advice.
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto px-6 py-5 text-sm text-muted md:px-10 xl:px-20">
          © 2026 OpenHouse · Window-shop the country
        </p>
      </div>
    </footer>
  );
}
