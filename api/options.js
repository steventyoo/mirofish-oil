// Vercel serverless function: fetch CL (WTI Crude Oil) options chain
// Uses Yahoo Finance options endpoint — free, no API key needed

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');

  try {
    // Fetch options data for CL=F (WTI crude front month)
    const url = 'https://query1.finance.yahoo.com/v7/finance/options/CL=F';
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error('Yahoo options API returned ' + r.status);
    const data = await r.json();

    const result = data?.optionChain?.result?.[0];
    if (!result) throw new Error('No options data');

    const quote = result.quote || {};
    const expirations = result.expirationDates || [];
    const options = result.options?.[0] || {};
    const calls = options.calls || [];
    const puts = options.puts || [];

    // Current price for reference
    const spotPrice = quote.regularMarketPrice || 0;

    // Process calls — focus on near-the-money and OTM
    const processedCalls = calls
      .filter(c => c.strike && c.lastPrice !== undefined)
      .map(c => ({
        strike: c.strike,
        lastPrice: c.lastPrice || 0,
        bid: c.bid || 0,
        ask: c.ask || 0,
        volume: c.volume || 0,
        openInterest: c.openInterest || 0,
        impliedVolatility: c.impliedVolatility || 0,
        inTheMoney: c.inTheMoney || false,
        percentChange: c.percentChange || 0,
        expiration: c.expiration,
      }))
      .sort((a, b) => a.strike - b.strike);

    // Process puts
    const processedPuts = puts
      .filter(p => p.strike && p.lastPrice !== undefined)
      .map(p => ({
        strike: p.strike,
        lastPrice: p.lastPrice || 0,
        bid: p.bid || 0,
        ask: p.ask || 0,
        volume: p.volume || 0,
        openInterest: p.openInterest || 0,
        impliedVolatility: p.impliedVolatility || 0,
        inTheMoney: p.inTheMoney || false,
        percentChange: p.percentChange || 0,
        expiration: p.expiration,
      }))
      .sort((a, b) => a.strike - b.strike);

    // Compute summary stats
    const otmCalls = processedCalls.filter(c => !c.inTheMoney && c.volume > 0);
    const otmPuts = processedPuts.filter(p => !p.inTheMoney && p.volume > 0);

    const avgCallIV = otmCalls.length > 0
      ? otmCalls.reduce((s, c) => s + c.impliedVolatility, 0) / otmCalls.length
      : 0;
    const avgPutIV = otmPuts.length > 0
      ? otmPuts.reduce((s, p) => s + p.impliedVolatility, 0) / otmPuts.length
      : 0;

    // Put-call skew
    const skew = avgPutIV > 0 ? (avgPutIV - avgCallIV) / avgPutIV : 0;

    // Total volumes
    const totalCallVol = processedCalls.reduce((s, c) => s + c.volume, 0);
    const totalPutVol = processedPuts.reduce((s, p) => s + p.volume, 0);
    const putCallRatio = totalCallVol > 0 ? totalPutVol / totalCallVol : 0;

    // Total open interest
    const totalCallOI = processedCalls.reduce((s, c) => s + c.openInterest, 0);
    const totalPutOI = processedPuts.reduce((s, p) => s + p.openInterest, 0);

    // Expiration date
    const expDate = options.expirationDate
      ? new Date(options.expirationDate * 1000).toISOString().split('T')[0]
      : 'Unknown';

    res.status(200).json({
      symbol: 'CL=F',
      spotPrice,
      expiration: expDate,
      availableExpirations: expirations.map(e => new Date(e * 1000).toISOString().split('T')[0]),
      summary: {
        avgCallIV: Math.round(avgCallIV * 10000) / 100,
        avgPutIV: Math.round(avgPutIV * 10000) / 100,
        skew: Math.round(skew * 1000) / 10,
        putCallRatio: Math.round(putCallRatio * 100) / 100,
        totalCallVolume: totalCallVol,
        totalPutVolume: totalPutVol,
        totalCallOI: totalCallOI,
        totalPutOI: totalPutOI,
      },
      calls: processedCalls,
      puts: processedPuts,
    });
  } catch (e) {
    res.status(200).json({
      symbol: 'CL=F',
      error: e.message,
      calls: [],
      puts: [],
      summary: null,
    });
  }
}
