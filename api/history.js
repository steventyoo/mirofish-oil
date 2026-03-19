// Vercel serverless function: fetch WTI daily prices from Yahoo Finance
// Supports multiple timeframes via ?range=1mo|3mo|6mo|1y|3y|5y|max
// Returns array of {date, close, volume, high, low, open} objects

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  try {
    const validRanges = ['1mo', '3mo', '6mo', '1y', '2y', '3y', '5y', 'max'];
    const range = validRanges.includes(req.query.range) ? req.query.range : '1y';
    const symbol = req.query.symbol === 'BZ=F' ? 'BZ=F' : 'CL=F';

    // Use daily for shorter ranges, weekly for longer
    const interval = ['3y', '5y', 'max'].includes(range) ? '1wk' : '1d';

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) {
      res.status(r.status).json({ error: `Yahoo Finance returned ${r.status}` });
      return;
    }
    const data = await r.json();
    const result = data?.chart?.result?.[0];
    if (!result) {
      res.status(502).json({ error: 'No chart data returned' });
      return;
    }

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const closes = quote.close || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const opens = quote.open || [];
    const volumes = quote.volume || [];

    const history = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] == null) continue;
      history.push({
        date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
        close: Math.round(closes[i] * 100) / 100,
        high: highs[i] ? Math.round(highs[i] * 100) / 100 : null,
        low: lows[i] ? Math.round(lows[i] * 100) / 100 : null,
        open: opens[i] ? Math.round(opens[i] * 100) / 100 : null,
        volume: volumes[i] || 0,
      });
    }

    res.status(200).json(history);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
