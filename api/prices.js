// Vercel serverless function: fetch live prices from Yahoo Finance
// Returns all tickers in one batch call

const TICKERS = ['CL=F', 'BZ=F', 'TTF=F', 'DX-Y.NYB', '^GSPC', '^VIX', '^TNX', 'GC=F', 'RB=F', 'HO=F'];

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
    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
