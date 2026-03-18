// Vercel serverless function: defense, energy, drone stock fundamentals
// Combines live prices (Yahoo v8 chart) with quarterly fundamentals (static, updated manually)
// Fundamentals only change quarterly — prices update live

// Static fundamentals from latest earnings reports (Q4 2025 / Q1 2026)
// Updated manually after each earnings season
const FUNDAMENTALS = {
  // ═══ DEFENSE CONTRACTORS ═══
  RTX:  { name: 'RTX Corporation', sector: 'defense', marketCap: 156e9, pe: 37.2, forwardPE: 22.1, ps: 2.2, evEbitda: 19.8, revenue: 71.3e9, ebitda: 10.2e9, profitMargin: 0.059, roe: 0.074, revenueGrowth: 0.078, dividendYield: 0.023, beta: 0.75, fiftyTwoWeekHigh: 213, fiftyTwoWeekLow: 101, note: 'Patriot missiles, Pratt engines' },
  LMT:  { name: 'Lockheed Martin', sector: 'defense', marketCap: 131e9, pe: 20.8, forwardPE: 18.5, ps: 1.85, evEbitda: 15.2, revenue: 71.0e9, ebitda: 10.8e9, profitMargin: 0.089, roe: 0.68, revenueGrowth: 0.055, dividendYield: 0.024, beta: 0.44, fiftyTwoWeekHigh: 618, fiftyTwoWeekLow: 410, note: 'F-35, THAAD, Javelin' },
  NOC:  { name: 'Northrop Grumman', sector: 'defense', marketCap: 74e9, pe: 18.5, forwardPE: 16.8, ps: 1.88, evEbitda: 14.1, revenue: 39.3e9, ebitda: 5.8e9, profitMargin: 0.103, roe: 0.28, revenueGrowth: 0.045, dividendYield: 0.016, beta: 0.48, fiftyTwoWeekHigh: 555, fiftyTwoWeekLow: 410, note: 'B-21 Raider, Global Hawk' },
  GD:   { name: 'General Dynamics', sector: 'defense', marketCap: 78e9, pe: 21.5, forwardPE: 18.2, ps: 1.72, evEbitda: 15.5, revenue: 45.6e9, ebitda: 6.2e9, profitMargin: 0.081, roe: 0.22, revenueGrowth: 0.073, dividendYield: 0.020, beta: 0.55, fiftyTwoWeekHigh: 315, fiftyTwoWeekLow: 250, note: 'Virginia-class subs, Abrams' },
  BA:   { name: 'Boeing', sector: 'defense', marketCap: 138e9, pe: null, forwardPE: 35.2, ps: 1.72, evEbitda: null, revenue: 77.8e9, ebitda: -0.5e9, profitMargin: -0.032, roe: null, revenueGrowth: 0.10, dividendYield: null, beta: 1.52, fiftyTwoWeekHigh: 196, fiftyTwoWeekLow: 128, note: 'F/A-18, P-8, KC-46, 737 MAX issues' },
  LHX:  { name: 'L3Harris Technologies', sector: 'defense', marketCap: 41e9, pe: 28.5, forwardPE: 16.8, ps: 2.02, evEbitda: 14.8, revenue: 21.1e9, ebitda: 3.8e9, profitMargin: 0.063, roe: 0.076, revenueGrowth: 0.098, dividendYield: 0.022, beta: 0.58, fiftyTwoWeekHigh: 260, fiftyTwoWeekLow: 195, note: 'Comms, EW, ISR systems' },
  HII:  { name: 'Huntington Ingalls', sector: 'defense', marketCap: 10e9, pe: 17.8, forwardPE: 14.5, ps: 0.85, evEbitda: 11.2, revenue: 11.5e9, ebitda: 1.1e9, profitMargin: 0.048, roe: 0.24, revenueGrowth: 0.063, dividendYield: 0.022, beta: 0.60, fiftyTwoWeekHigh: 305, fiftyTwoWeekLow: 195, note: 'Aircraft carriers, destroyers' },

  // ═══ DRONE & DRONE SENSOR STOCKS ═══
  AVAV: { name: 'AeroVironment', sector: 'drone', marketCap: 7.5e9, pe: 62.5, forwardPE: 42.0, ps: 9.5, evEbitda: 45.0, revenue: 0.75e9, ebitda: 0.12e9, profitMargin: 0.078, roe: 0.12, revenueGrowth: 0.25, dividendYield: null, beta: 0.85, fiftyTwoWeekHigh: 230, fiftyTwoWeekLow: 120, note: 'Switchblade, Puma — top US drone maker' },
  KTOS: { name: 'Kratos Defense', sector: 'drone', marketCap: 5.2e9, pe: 125, forwardPE: 55.0, ps: 4.8, evEbitda: 60.0, revenue: 1.1e9, ebitda: 0.08e9, profitMargin: 0.02, roe: 0.03, revenueGrowth: 0.15, dividendYield: null, beta: 1.15, fiftyTwoWeekHigh: 38, fiftyTwoWeekLow: 15, note: 'Valkyrie autonomous drone, target drones' },
  RKLB: { name: 'Rocket Lab USA', sector: 'drone', marketCap: 12e9, pe: null, forwardPE: null, ps: 25.0, evEbitda: null, revenue: 0.45e9, ebitda: -0.05e9, profitMargin: -0.12, roe: null, revenueGrowth: 0.55, dividendYield: null, beta: 1.85, fiftyTwoWeekHigh: 32, fiftyTwoWeekLow: 4, note: 'Satellite launch, space ISR' },
  IRDM: { name: 'Iridium Communications', sector: 'drone', marketCap: 4.0e9, pe: 15.5, forwardPE: 14.0, ps: 5.2, evEbitda: 8.5, revenue: 0.8e9, ebitda: 0.5e9, profitMargin: 0.30, roe: 0.18, revenueGrowth: 0.06, dividendYield: 0.015, beta: 0.52, fiftyTwoWeekHigh: 38, fiftyTwoWeekLow: 22, note: 'Satellite comms for drones/military' },
  FLIR: { name: 'Teledyne FLIR (TDY)', sector: 'drone', marketCap: 21e9, pe: 25.0, forwardPE: 22.0, ps: 3.5, evEbitda: 18.0, revenue: 5.7e9, ebitda: 1.3e9, profitMargin: 0.12, roe: 0.10, revenueGrowth: 0.04, dividendYield: 0.003, beta: 0.85, fiftyTwoWeekHigh: 490, fiftyTwoWeekLow: 370, note: 'FLIR sensors, marine instruments, Black Hornet' },
  PLTR: { name: 'Palantir Technologies', sector: 'drone', marketCap: 230e9, pe: 175, forwardPE: 120, ps: 35.0, evEbitda: 150, revenue: 2.9e9, ebitda: 0.55e9, profitMargin: 0.18, roe: 0.12, revenueGrowth: 0.27, dividendYield: null, beta: 2.10, fiftyTwoWeekHigh: 125, fiftyTwoWeekLow: 22, note: 'AI/ML for military targeting, ISR fusion' },
  AXON: { name: 'Axon Enterprise', sector: 'drone', marketCap: 55e9, pe: 110, forwardPE: 75, ps: 26.0, evEbitda: 85, revenue: 2.1e9, ebitda: 0.45e9, profitMargin: 0.15, roe: 0.15, revenueGrowth: 0.32, dividendYield: null, beta: 1.20, fiftyTwoWeekHigh: 700, fiftyTwoWeekLow: 250, note: 'Drone-as-first-responder, Dedrone C-UAS' },
  LDOS: { name: 'Leidos Holdings', sector: 'drone', marketCap: 20e9, pe: 20.0, forwardPE: 16.5, ps: 1.26, evEbitda: 12.5, revenue: 16.1e9, ebitda: 1.9e9, profitMargin: 0.07, roe: 0.30, revenueGrowth: 0.06, dividendYield: 0.011, beta: 0.72, fiftyTwoWeekHigh: 178, fiftyTwoWeekLow: 120, note: 'Drone C2 systems, DoD IT' },

  // ═══ ENERGY MAJORS ═══
  XOM:  { name: 'Exxon Mobil', sector: 'energy', marketCap: 465e9, pe: 14.2, forwardPE: 13.5, ps: 1.30, evEbitda: 6.5, revenue: 340e9, ebitda: 62e9, profitMargin: 0.098, roe: 0.18, revenueGrowth: -0.02, dividendYield: 0.034, beta: 0.80, fiftyTwoWeekHigh: 126, fiftyTwoWeekLow: 95, note: 'Largest US oil major' },
  CVX:  { name: 'Chevron', sector: 'energy', marketCap: 280e9, pe: 15.5, forwardPE: 13.8, ps: 1.38, evEbitda: 6.8, revenue: 196e9, ebitda: 45e9, profitMargin: 0.098, roe: 0.13, revenueGrowth: -0.04, dividendYield: 0.042, beta: 0.85, fiftyTwoWeekHigh: 167, fiftyTwoWeekLow: 135, note: 'Integrated major, Permian + Guyana' },
  COP:  { name: 'ConocoPhillips', sector: 'energy', marketCap: 135e9, pe: 12.8, forwardPE: 11.5, ps: 2.35, evEbitda: 5.5, revenue: 58e9, ebitda: 26e9, profitMargin: 0.18, roe: 0.22, revenueGrowth: 0.05, dividendYield: 0.032, beta: 0.95, fiftyTwoWeekHigh: 130, fiftyTwoWeekLow: 92, note: 'Pure-play E&P, low-cost Permian' },
  OXY:  { name: 'Occidental Petroleum', sector: 'energy', marketCap: 48e9, pe: 14.0, forwardPE: 12.5, ps: 1.80, evEbitda: 5.8, revenue: 27e9, ebitda: 10e9, profitMargin: 0.11, roe: 0.14, revenueGrowth: -0.03, dividendYield: 0.016, beta: 1.45, fiftyTwoWeekHigh: 71, fiftyTwoWeekLow: 44, note: 'Buffett-backed, Permian Basin' },
  SLB:  { name: 'Schlumberger', sector: 'energy', marketCap: 56e9, pe: 13.5, forwardPE: 12.0, ps: 1.55, evEbitda: 8.0, revenue: 36e9, ebitda: 8.5e9, profitMargin: 0.12, roe: 0.21, revenueGrowth: 0.03, dividendYield: 0.026, beta: 1.35, fiftyTwoWeekHigh: 55, fiftyTwoWeekLow: 37, note: 'Largest oilfield services' },
  HAL:  { name: 'Halliburton', sector: 'energy', marketCap: 24e9, pe: 10.5, forwardPE: 9.5, ps: 1.05, evEbitda: 6.5, revenue: 23e9, ebitda: 4.8e9, profitMargin: 0.10, roe: 0.28, revenueGrowth: -0.02, dividendYield: 0.024, beta: 1.50, fiftyTwoWeekHigh: 40, fiftyTwoWeekLow: 24, note: 'Oilfield services, fracking' },

  // ═══ OIL ETFs ═══
  USO:  { name: 'US Oil Fund', sector: 'etf', marketCap: 2.5e9, pe: null, forwardPE: null, ps: null, evEbitda: null, revenue: null, ebitda: null, profitMargin: null, roe: null, revenueGrowth: null, dividendYield: null, beta: 1.0, fiftyTwoWeekHigh: 85, fiftyTwoWeekLow: 62, note: '1x WTI crude futures' },
  SCO:  { name: 'ProShares UltraShort Oil', sector: 'etf', marketCap: 0.13e9, pe: null, forwardPE: null, ps: null, evEbitda: null, revenue: null, ebitda: null, profitMargin: null, roe: null, revenueGrowth: null, dividendYield: null, beta: -1.89, fiftyTwoWeekHigh: 24.5, fiftyTwoWeekLow: 7.9, note: '-2x WTI — INVERSE, YTD -57%' },
  UCO:  { name: 'ProShares Ultra Oil', sector: 'etf', marketCap: 0.8e9, pe: null, forwardPE: null, ps: null, evEbitda: null, revenue: null, ebitda: null, profitMargin: null, roe: null, revenueGrowth: null, dividendYield: null, beta: 2.0, fiftyTwoWeekHigh: 42, fiftyTwoWeekLow: 22, note: '2x WTI crude futures' },
};

async function fetchPrice(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const data = await r.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    const price = result.meta.regularMarketPrice;
    const prev = result.meta.chartPreviousClose;
    if (!price) return null;
    return {
      price: Math.round(price * 100) / 100,
      change: prev ? Math.round((price - prev) * 100) / 100 : 0,
      changePct: prev ? Math.round(((price - prev) / prev) * 10000) / 100 : 0,
    };
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  try {
    const allSymbols = Object.keys(FUNDAMENTALS);
    const results = { defense: [], drone: [], energy: [], etfs: [] };

    // Fetch live prices in parallel
    const priceFetches = await Promise.allSettled(
      allSymbols.map(sym => fetchPrice(sym === 'FLIR' ? 'TDY' : sym))
    );

    allSymbols.forEach((sym, i) => {
      const fund = FUNDAMENTALS[sym];
      const livePrice = priceFetches[i].status === 'fulfilled' ? priceFetches[i].value : null;

      const entry = {
        symbol: sym === 'FLIR' ? 'TDY' : sym,
        ...fund,
        // Override with live price if available
        price: livePrice?.price || 0,
        change: livePrice?.change || 0,
        changePct: livePrice?.changePct || 0,
      };

      if (fund.sector === 'defense') results.defense.push(entry);
      else if (fund.sector === 'drone') results.drone.push(entry);
      else if (fund.sector === 'energy') results.energy.push(entry);
      else results.etfs.push(entry);
    });

    // Sort by market cap
    results.defense.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    results.drone.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    results.energy.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: e.message, defense: [], drone: [], energy: [], etfs: [] });
  }
}
