// Vercel serverless function: fetch CFTC Commitments of Traders data
// Uses the free CFTC public API — no key needed

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=14400');

  try {
    // CFTC Disaggregated Futures-Only for WTI Crude (contract code 067651)
    // Socrata open data API — free, no key needed
    const url = 'https://publicreporting.cftc.gov/resource/72hh-3qpy.json?$where=cftc_contract_market_code=%27067651%27&$order=report_date_as_yyyy_mm_dd DESC&$limit=20';

    const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!r.ok) throw new Error('CFTC API returned ' + r.status);
    const data = await r.json();

    if (!data || data.length === 0) throw new Error('No CFTC data');

    const reports = data.map(d => ({
      date: d.report_date_as_yyyy_mm_dd,
      // Money Manager (managed money = hedge funds)
      mm_long: parseInt(d.m_money_positions_long_all || 0),
      mm_short: parseInt(d.m_money_positions_short_all || 0),
      mm_net: parseInt(d.m_money_positions_long_all || 0) - parseInt(d.m_money_positions_short_all || 0),
      mm_spread: parseInt(d.m_money_positions_spread_all || 0),
      // Producer/Merchant
      prod_long: parseInt(d.prod_merc_positions_long_all || 0),
      prod_short: parseInt(d.prod_merc_positions_short_all || 0),
      prod_net: parseInt(d.prod_merc_positions_long_all || 0) - parseInt(d.prod_merc_positions_short_all || 0),
      // Swap Dealer
      swap_long: parseInt(d.swap_positions_long_all || 0),
      swap_short: parseInt(d.swap_positions_short_all || 0),
      swap_net: parseInt(d.swap_positions_long_all || 0) - parseInt(d.swap_positions_short_all || 0),
      // Open Interest
      open_interest: parseInt(d.open_interest_all || 0),
      // Change
      change_oi: parseInt(d.change_in_open_interest_all || 0),
    }));

    // Compute percentile rank for managed money net position
    const mmNets = reports.map(r => r.mm_net).sort((a, b) => a - b);
    const latest = reports[0];
    const rank = mmNets.indexOf(latest.mm_net);
    const percentile = Math.round((rank / (mmNets.length - 1)) * 100);

    // Compute week-over-week changes
    const prev = reports.length > 1 ? reports[1] : null;
    const mmNetChange = prev ? latest.mm_net - prev.mm_net : 0;
    const oiChange = prev ? latest.open_interest - prev.open_interest : 0;

    // Short squeeze risk (ratio of short to long — higher = more squeeze potential)
    const shortLongRatio = latest.mm_long > 0 ? latest.mm_short / latest.mm_long : 0;
    const squeezeRisk = Math.min(shortLongRatio, 1);

    res.status(200).json({
      timestamp: new Date().toISOString(),
      latest: {
        date: latest.date,
        managed_money: {
          long: latest.mm_long,
          short: latest.mm_short,
          net: latest.mm_net,
          spread: latest.mm_spread,
          net_change_1w: mmNetChange,
          percentile: percentile,
        },
        producer_merchant: {
          long: latest.prod_long,
          short: latest.prod_short,
          net: latest.prod_net,
        },
        swap_dealer: {
          long: latest.swap_long,
          short: latest.swap_short,
          net: latest.swap_net,
        },
        open_interest: latest.open_interest,
        oi_change_1w: oiChange,
        short_squeeze_risk: Math.round(squeezeRisk * 100) / 100,
      },
      history: reports.slice(0, 10),
    });
  } catch (e) {
    res.status(200).json({ error: e.message });
  }
}
