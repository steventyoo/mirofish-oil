// Vercel serverless function: fetch 12 months of WTI daily prices from Yahoo Finance
// Returns array of {date, close, volume} objects

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  try {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=1y';
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
    const closes = result.indicators?.quote?.[0]?.close || [];
    const volumes = result.indicators?.quote?.[0]?.volume || [];

    const history = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] == null) continue;
      history.push({
        date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
        close: Math.round(closes[i] * 100) / 100,
        volume: volumes[i] || 0,
      });
    }

    res.status(200).json(history);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
