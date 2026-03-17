// Vercel serverless function: fetch EIA petroleum inventory data
// Requires EIA_API_KEY environment variable (free from eia.gov/opendata)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  const apiKey = process.env.EIA_API_KEY || 'DEMO_KEY';

  try {
    // Fetch multiple series in parallel
    const [crudeRes, gasolineRes, distillateRes, cushingRes, utilRes, productionRes] = await Promise.allSettled([
      // Crude oil ending stocks (weekly)
      fetch(`https://api.eia.gov/v2/petroleum/stoc/wstk/data?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[product][]=EPC0&facets[process][]=SAE&facets[duoarea][]=NUS-Z00&length=10&sort[0][column]=period&sort[0][direction]=desc`, { signal: AbortSignal.timeout(10000) }),
      // Gasoline ending stocks
      fetch(`https://api.eia.gov/v2/petroleum/stoc/wstk/data?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[product][]=EPM0&facets[process][]=SAE&facets[duoarea][]=NUS-Z00&length=10&sort[0][column]=period&sort[0][direction]=desc`, { signal: AbortSignal.timeout(10000) }),
      // Distillate ending stocks
      fetch(`https://api.eia.gov/v2/petroleum/stoc/wstk/data?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[product][]=EPD0&facets[process][]=SAE&facets[duoarea][]=NUS-Z00&length=10&sort[0][column]=period&sort[0][direction]=desc`, { signal: AbortSignal.timeout(10000) }),
      // Cushing OK crude stocks
      fetch(`https://api.eia.gov/v2/petroleum/stoc/wstk/data?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[product][]=EPC0&facets[process][]=SAE&facets[duoarea][]=SOP-Z00&length=10&sort[0][column]=period&sort[0][direction]=desc`, { signal: AbortSignal.timeout(10000) }),
      // Refinery utilization
      fetch(`https://api.eia.gov/v2/petroleum/pnp/wiup/data?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[duoarea][]=NUS-Z00&length=10&sort[0][column]=period&sort[0][direction]=desc`, { signal: AbortSignal.timeout(10000) }),
      // US crude production
      fetch(`https://api.eia.gov/v2/petroleum/crd/crpdn/data?api_key=${apiKey}&frequency=monthly&data[0]=value&facets[duoarea][]=NUS-Z00&length=6&sort[0][column]=period&sort[0][direction]=desc`, { signal: AbortSignal.timeout(10000) }),
    ]);

    async function extractSeries(promiseResult) {
      if (promiseResult.status !== 'fulfilled') return [];
      try {
        const r = promiseResult.value;
        if (!r.ok) return [];
        const data = await r.json();
        return (data?.response?.data || []).map(d => ({
          period: d.period,
          value: parseFloat(d.value),
          units: d['value-units'] || d.units || 'MBBL',
        }));
      } catch (e) { return []; }
    }

    const crude = await extractSeries(crudeRes);
    const gasoline = await extractSeries(gasolineRes);
    const distillate = await extractSeries(distillateRes);
    const cushing = await extractSeries(cushingRes);
    const utilization = await extractSeries(utilRes);
    const production = await extractSeries(productionRes);

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
    });
  } catch (e) {
    res.status(200).json({ error: e.message });
  }
}
