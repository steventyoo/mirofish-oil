// Vercel serverless function: fetch fundamentals for defense & energy stocks
// Returns price, market cap, P/E, P/S, revenue, EBITDA, margins, etc.

const DEFENSE = ['RTX', 'LMT', 'NOC', 'GD', 'BA', 'LHX', 'HII'];
const ENERGY = ['XOM', 'CVX', 'COP', 'OXY', 'SLB', 'HAL'];
const OIL_ETFS = ['USO', 'SCO', 'UCO'];

async function fetchFundamentals(symbol) {
  try {
    // Use Yahoo Finance quoteSummary for fundamentals
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=price,defaultKeyStatistics,financialData,summaryDetail`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'BlackAlpha/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const result = data?.quoteSummary?.result?.[0];
    if (!result) return null;

    const price = result.price || {};
    const stats = result.defaultKeyStatistics || {};
    const fin = result.financialData || {};
    const summary = result.summaryDetail || {};

    return {
      symbol,
      name: price.shortName || price.longName || symbol,
      price: price.regularMarketPrice?.raw || 0,
      change: price.regularMarketChange?.raw || 0,
      changePct: price.regularMarketChangePercent?.raw ? (price.regularMarketChangePercent.raw * 100) : 0,
      marketCap: price.marketCap?.raw || 0,
      marketCapFmt: price.marketCap?.fmt || '—',
      // Valuation
      pe: summary.trailingPE?.raw || stats.trailingPE?.raw || null,
      forwardPE: summary.forwardPE?.raw || stats.forwardPE?.raw || null,
      ps: stats.priceToSalesTrailing12Months?.raw || null,
      pb: stats.priceToBook?.raw || null,
      evEbitda: stats.enterpriseToEbitda?.raw || null,
      evRevenue: stats.enterpriseToRevenue?.raw || null,
      // Financials
      revenue: fin.totalRevenue?.raw || null,
      revenueFmt: fin.totalRevenue?.fmt || '—',
      ebitda: fin.ebitda?.raw || null,
      ebitdaFmt: fin.ebitda?.fmt || '—',
      grossMargin: fin.grossMargins?.raw || null,
      operatingMargin: fin.operatingMargins?.raw || null,
      profitMargin: fin.profitMargins?.raw || null,
      roe: fin.returnOnEquity?.raw || null,
      roa: fin.returnOnAssets?.raw || null,
      // Growth
      revenueGrowth: fin.revenueGrowth?.raw || null,
      earningsGrowth: fin.earningsGrowth?.raw || null,
      // Dividend
      dividendYield: summary.dividendYield?.raw || null,
      dividendRate: summary.dividendRate?.raw || null,
      payoutRatio: summary.payoutRatio?.raw || null,
      // Debt
      debtToEquity: fin.debtToEquity?.raw || null,
      currentRatio: fin.currentRatio?.raw || null,
      // Other
      beta: summary.beta?.raw || null,
      fiftyTwoWeekHigh: summary.fiftyTwoWeekHigh?.raw || null,
      fiftyTwoWeekLow: summary.fiftyTwoWeekLow?.raw || null,
      avgVolume: summary.averageVolume?.raw || null,
      avgVolumeFmt: summary.averageVolume?.fmt || '—',
    };
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  try {
    const allSymbols = [...DEFENSE, ...ENERGY, ...OIL_ETFS];
    const results = { defense: [], energy: [], etfs: [] };

    const fetched = await Promise.allSettled(
      allSymbols.map(sym => fetchFundamentals(sym))
    );

    fetched.forEach((r, i) => {
      if (r.status !== 'fulfilled' || !r.value) return;
      const sym = allSymbols[i];
      if (DEFENSE.includes(sym)) results.defense.push(r.value);
      else if (ENERGY.includes(sym)) results.energy.push(r.value);
      else results.etfs.push(r.value);
    });

    // Sort by market cap descending
    results.defense.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    results.energy.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: e.message, defense: [], energy: [], etfs: [] });
  }
}
