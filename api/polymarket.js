// Vercel serverless function: proxy Polymarket Gamma API
// Fetches oil price contracts + geopolitical contracts

const EVENTS = [
  'will-crude-oil-cl-hit-by-end-of-march',
  'cl-hit-jun-2026',
  'strait-of-hormuz-traffic-returns-to-normal-by-april-30',
  'us-escorts-commercial-ship-through-hormuz-by-march-31',
  'will-the-kharg-island-oil-terminal-be-hit-by-march-31',
  'how-many-ships-transit-the-strait-of-hormuz-this-week-mar-17-23',
  'what-will-iran-strike-by-march-31',
  'what-will-the-usisrael-target-in-iran-by-march-31',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');

  try {
    const results = {};

    await Promise.allSettled(
      EVENTS.map(async (slug) => {
        try {
          const r = await fetch(`https://gamma-api.polymarket.com/events?slug=${slug}`, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(6000),
          });
          if (!r.ok) return;
          const data = await r.json();
          if (data && data[0]) {
            results[slug] = {
              title: data[0].title,
              markets: (data[0].markets || []).map(m => ({
                question: m.question,
                outcomePrices: m.outcomePrices,
                volume: m.volume,
                conditionId: m.conditionId,
              })),
            };
          }
        } catch (e) { /* skip failed fetches */ }
      })
    );

    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
