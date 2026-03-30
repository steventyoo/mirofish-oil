// Vercel serverless function: fetch live prices from Yahoo Finance
// Returns all tickers in one batch call

const TICKERS = [
  // Commodities
  'CL=F', 'BZ=F', 'TTF=F', 'GC=F', 'RB=F', 'HO=F',
  // Macro
  'DX-Y.NYB', '^GSPC', '^VIX', '^TNX',
  // Defense stocks
  'RTX', 'LMT', 'NOC', 'GD', 'BA', 'LHX', 'HII',
  // Energy stocks
  'XOM', 'CVX', 'COP', 'OXY', 'SLB', 'HAL',
  // Oil ETFs
  'USO', 'SCO', 'UCO',
  // Shipping / Tankers / Fertilizer
  'FRO', 'FLNG', 'CF',
  // Additional defense & energy
  'BAH', 'HON', 'EQNR', 'EGY',
];

async function fetchQuote(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const data = await r.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    const price = result.meta.regularMarketPrice;
    const prev = result.meta.chartPreviousClose;
    if (!price || !prev) return null;
    const change = price - prev;
    const changePct = (change / prev) * 100;
    return {
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePct: Math.round(changePct * 100) / 100,
      currency: result.meta.currency || 'USD',
    };
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    const results = {};
    await Promise.allSettled(
      TICKERS.map(async (sym) => {
        const quote = await fetchQuote(sym);
        if (quote) results[sym] = quote;
      })
    );

    // Synthesize Dubai crude estimate from Brent
    // Dubai normally trades at Brent -$1 to -$3.
    // During Hormuz disruption, Dubai premium can flip to Brent +$5 to +$20
    // because it's the physical Gulf benchmark and supply is directly threatened.
    // We estimate based on current Brent-WTI spread as a proxy for Gulf stress.
    if (results['BZ=F'] && results['CL=F']) {
      const brent = results['BZ=F'].price;
      const wti = results['CL=F'].price;
      const brentWtiSpread = brent - wti;
      // In normal markets (spread <$5): Dubai = Brent - $1.50
      // In stressed markets (spread >$5): Dubai premium increases
      // Spread >$8 = significant Gulf stress, Dubai approaches or exceeds Brent
      let dubaiDiff;
      if (brentWtiSpread > 10) dubaiDiff = 2.0;  // Extreme stress: Dubai > Brent
      else if (brentWtiSpread > 8) dubaiDiff = 0.5;
      else if (brentWtiSpread > 5) dubaiDiff = -0.5;
      else dubaiDiff = -1.50;  // Normal
      const dubaiPrice = Math.round((brent + dubaiDiff) * 100) / 100;
      const dubaiPrev = Math.round((brent - results['BZ=F'].change + dubaiDiff) * 100) / 100;
      results['DUBAI'] = {
        price: dubaiPrice,
        change: Math.round((dubaiPrice - dubaiPrev) * 100) / 100,
        changePct: results['BZ=F'].changePct, // Tracks Brent %
        currency: 'USD',
        synthetic: true,
        note: 'Estimated from Brent + Gulf stress differential',
        brentDiff: dubaiDiff,
      };
    }

    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
