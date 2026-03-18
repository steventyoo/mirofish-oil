// Vercel serverless function: fetch EIA petroleum inventory data
// Requires EIA_API_KEY environment variable (free from eia.gov/opendata)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  const apiKey = process.env.EIA_API_KEY || 'DEMO_KEY';

  try {
    // Helper to build EIA URLs with proper encoding
    function eiaUrl(path, facets, freq, len) {
      let url = `https://api.eia.gov/v2/${path}?api_key=${apiKey}&frequency=${freq}&data%5B0%5D=value&length=${len}&sort%5B0%5D%5Bcolumn%5D=period&sort%5B0%5D%5Bdirection%5D=desc`;
      for (const [key, val] of Object.entries(facets)) {
        url += `&facets%5B${key}%5D%5B%5D=${val}`;
      }
      return url;
    }

    // Fetch multiple series in parallel
    const [crudeRes, gasolineRes, distillateRes, cushingRes, utilRes, productionRes, sprRes] = await Promise.allSettled([
      // Crude oil ending stocks (weekly)
      fetch(eiaUrl('petroleum/stoc/wstk/data', { product: 'EPC0', process: 'SAE', duoarea: 'NUS' }, 'weekly', 10), { signal: AbortSignal.timeout(10000) }),
      // Gasoline ending stocks
      fetch(eiaUrl('petroleum/stoc/wstk/data', { product: 'EPM0', process: 'SAE', duoarea: 'NUS' }, 'weekly', 10), { signal: AbortSignal.timeout(10000) }),
      // Distillate ending stocks
      fetch(eiaUrl('petroleum/stoc/wstk/data', { product: 'EPD0', process: 'SAE', duoarea: 'NUS' }, 'weekly', 10), { signal: AbortSignal.timeout(10000) }),
      // Cushing OK crude stocks
      fetch(eiaUrl('petroleum/stoc/wstk/data', { product: 'EPC0', process: 'SAE', duoarea: 'NUS' }, 'weekly', 10), { signal: AbortSignal.timeout(10000) }),
      // Refinery utilization
      fetch(eiaUrl('petroleum/pnp/wiup/data', { duoarea: 'NUS' }, 'weekly', 10), { signal: AbortSignal.timeout(10000) }),
      // US crude production
      fetch(eiaUrl('petroleum/crd/crpdn/data', { duoarea: 'NUS' }, 'monthly', 6), { signal: AbortSignal.timeout(10000) }),
      // Strategic Petroleum Reserve (SPR) stocks (weekly)
      fetch(eiaUrl('petroleum/stoc/wstk/data', { product: 'EPC0', process: 'SAX', duoarea: 'NUS' }, 'weekly', 52), { signal: AbortSignal.timeout(10000) }),
    ]);

    async function extractSeries(promiseResult, label) {
      if (promiseResult.status !== 'fulfilled') return { data: [], debug: label + ': promise rejected: ' + (promiseResult.reason || 'unknown') };
      try {
        const r = promiseResult.value;
        if (!r.ok) return { data: [], debug: label + ': HTTP ' + r.status };
        const data = await r.json();
        const items = (data?.response?.data || []).map(d => ({
          period: d.period,
          value: parseFloat(d.value),
          units: d['value-units'] || d.units || 'MBBL',
        }));
        return { data: items, debug: label + ': ' + items.length + ' rows' };
      } catch (e) { return { data: [], debug: label + ': parse error: ' + e.message }; }
    }

    const crudeResult = await extractSeries(crudeRes, 'crude');
    const gasolineResult = await extractSeries(gasolineRes, 'gasoline');
    const distillateResult = await extractSeries(distillateRes, 'distillate');
    const cushingResult = await extractSeries(cushingRes, 'cushing');
    const utilizationResult = await extractSeries(utilRes, 'utilization');
    const productionResult = await extractSeries(productionRes, 'production');
    const sprResult = await extractSeries(sprRes, 'spr');

    const crude = crudeResult.data;
    const gasoline = gasolineResult.data;
    const distillate = distillateResult.data;
    const cushing = cushingResult.data;
    const utilization = utilizationResult.data;
    const production = productionResult.data;
    const spr = sprResult.data;

    const _debug = [crudeResult, gasolineResult, distillateResult, cushingResult, utilizationResult, productionResult, sprResult].map(r => r.debug);

    // Compute week-over-week changes
    function weeklyChange(series) {
      if (series.length < 2) return null;
      return {
        current: series[0].value,
        previous: series[1].value,
        change: series[0].value - series[1].value,
        period: series[0].period,
        units: series[0].units,
      };
    }

    res.status(200).json({
      timestamp: new Date().toISOString(),
      crude_stocks: {
        latest: crude[0] || null,
        change: weeklyChange(crude),
        history: crude.slice(0, 8),
      },
      gasoline_stocks: {
        latest: gasoline[0] || null,
        change: weeklyChange(gasoline),
        history: gasoline.slice(0, 8),
      },
      distillate_stocks: {
        latest: distillate[0] || null,
        change: weeklyChange(distillate),
        history: distillate.slice(0, 8),
      },
      cushing_stocks: {
        latest: cushing[0] || null,
        change: weeklyChange(cushing),
        history: cushing.slice(0, 8),
      },
      refinery_utilization: {
        latest: utilization[0] || null,
        history: utilization.slice(0, 8),
      },
      production: {
        latest: production[0] || null,
        history: production.slice(0, 6),
      },
      spr: {
        latest: spr[0] || null,
        change: weeklyChange(spr),
        history: spr.slice(0, 52),
        peak: spr.length > 0 ? Math.max(...spr.map(s => s.value)) : null,
      },
      _debug,
      _apiKey: apiKey ? apiKey.substring(0, 8) + '...' : 'none',
    });
  } catch (e) {
    res.status(200).json({ error: e.message });
  }
}
