// Vercel serverless function: MiroFish Swarm — runs all 8 agents via Claude API
// Requires ANTHROPIC_API_KEY environment variable set in Vercel

const AGENTS = [
  {
    name: 'OPEC Minister',
    role: 'Supply Policy',
    prompt: `You are the OPEC Minister agent in an oil trading swarm. You focus on OPEC+ supply policy, production cuts, compliance, spare capacity, and Saudi/Gulf producer behavior. You think about market balance from the producer side.`,
  },
  {
    name: 'Macro Hedge Fund PM',
    role: 'Cross-Asset',
    prompt: `You are a Macro Hedge Fund PM agent in an oil trading swarm. You analyze oil through the lens of cross-asset correlations: DXY, rates, equities risk-on/risk-off, positioning, gamma exposure, and flow dynamics. You think about what drives institutional money flows into and out of oil.`,
  },
  {
    name: 'Geopol Intel Analyst',
    role: 'Geopolitical Risk',
    prompt: `You are a Geopolitical Intelligence Analyst agent in an oil trading swarm. You assess military posturing, shipping disruption risk, sanctions impact, Hormuz chokepoint vulnerability, and escalation/de-escalation probabilities. You think about tail risks and black swans.`,
  },
  {
    name: 'CTA Trend Follower',
    role: 'Systematic',
    prompt: `You are a CTA/Trend Follower agent in an oil trading swarm. You focus purely on price action, momentum signals, breakout levels, moving averages, and systematic trend signals. You are agnostic to fundamentals — you only trade what the chart says. You are skeptical of narratives.`,
  },
  {
    name: 'Oil Options Trader',
    role: 'Volatility',
    prompt: `You are an Oil Options Trader agent in an oil trading swarm. You focus on implied volatility, IV rank, skew, term structure of vol, gamma positioning, and whether options are cheap or expensive relative to the uncertainty environment. You think about convexity and asymmetric payoffs.`,
  },
  {
    name: 'Physical Oil Trader',
    role: 'Physical Flows',
    prompt: `You are a Physical Oil Trader agent in an oil trading swarm. You focus on physical market fundamentals: Cushing storage, refinery utilization, crude quality differentials, export/import flows, physical premiums/discounts, and actual barrel movements. You are skeptical of financial market narratives.`,
  },
  {
    name: 'Chinese Demand Planner',
    role: 'Demand Side',
    prompt: `You are a Chinese Demand Planner agent in an oil trading swarm. You assess demand-side dynamics: Chinese refinery margins, strategic reserve buying, PMI/industrial activity, teapot refinery utilization, and Asian demand trends. You represent the bearish counterweight to supply-side bulls.`,
  },
  {
    name: 'Tanker Operator',
    role: 'Shipping / Logistics',
    prompt: `You are a Tanker/Shipping Operator agent in an oil trading swarm. You focus on tanker rates, shipping route disruptions, war risk premiums, vessel rerouting (Cape vs Suez vs Hormuz), port congestion, and logistics bottlenecks. You see supply chain stress before it shows in prices.`,
  },
];

const SYSTEM_PROMPT = `You are an agent in the MiroFish oil trading swarm. You will receive a structured world state with real market data. Use ONLY the provided state plus your domain expertise. Do NOT invent specific data not present in the state.

Return ONLY valid JSON with exactly this schema — no markdown, no prose, no explanation outside the JSON:
{
  "agent_name": "your name",
  "direction": "bullish" | "bearish" | "neutral",
  "confidence": float between 0 and 1,
  "horizon": "intraday" | "1d" | "1w" | "1m",
  "top_drivers": ["driver 1", "driver 2", "driver 3"],
  "probabilities": {
    "bullish_breakout": float,
    "rangebound": float,
    "sharp_reversal": float
  },
  "recommended_expression": "long_futures" | "short_futures" | "buy_calls" | "buy_puts" | "buy_straddle" | "calendar_spread" | "no_trade",
  "uncertainties": ["uncertainty 1", "uncertainty 2"]
}

The three probabilities must sum to 1.0. Be honest about uncertainty. Distinguish facts from inferences.`;

async function callClaude(agent, worldState) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('No API key');

  const userMessage = `${agent.prompt}

Here is the current world state:

${JSON.stringify(worldState, null, 2)}

Analyze this state from your role as ${agent.name} (${agent.role}). Return your structured JSON assessment.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || '';

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  return JSON.parse(jsonMatch[0]);
}

async function buildWorldState() {
  const baseUrl = `https://${process.env.VERCEL_URL || 'mirofish-oil.vercel.app'}`;
  // Fetch live data from our own API endpoints — all in parallel
  const [pricesRes, polyRes, optionsRes, cftcRes, eiaRes] = await Promise.allSettled([
    fetch(`${baseUrl}/api/prices`).then(r => r.json()),
    fetch(`${baseUrl}/api/polymarket`).then(r => r.json()),
    fetch(`${baseUrl}/api/options`).then(r => r.json()),
    fetch(`${baseUrl}/api/cftc`).then(r => r.json()),
    fetch(`${baseUrl}/api/eia`).then(r => r.json()),
  ]);

  const prices = pricesRes.status === 'fulfilled' ? pricesRes.value : {};
  const polymarket = polyRes.status === 'fulfilled' ? polyRes.value : {};
  const options = optionsRes.status === 'fulfilled' ? optionsRes.value : {};
  const cftc = cftcRes.status === 'fulfilled' ? cftcRes.value : {};
  const eia = eiaRes.status === 'fulfilled' ? eiaRes.value : {};

  const wti = prices['CL=F'] || { price: 0, change: 0, changePct: 0 };
  const brent = prices['BZ=F'] || { price: 0, change: 0, changePct: 0 };
  const vix = prices['^VIX'] || { price: 0 };
  const dxy = prices['DX-Y.NYB'] || { price: 0 };
  const spx = prices['^GSPC'] || { price: 0 };
  const tnx = prices['^TNX'] || { price: 0 };
  const gold = prices['GC=F'] || { price: 0 };

  // Extract Polymarket probabilities
  const oilEvent = polymarket['will-crude-oil-cl-hit-by-end-of-march'] || {};
  const hormuzEvent = polymarket['strait-of-hormuz-traffic-returns-to-normal-by-april-30'] || {};
  const khargEvent = polymarket['will-the-kharg-island-oil-terminal-be-hit-by-march-31'] || {};
  const escortEvent = polymarket['us-escorts-commercial-ship-through-hormuz-by-march-31'] || {};

  function getPolyProb(event) {
    if (!event.markets || !event.markets[0]) return null;
    const prices = JSON.parse(event.markets[0].outcomePrices || '["0","0"]');
    return parseFloat(prices[0]);
  }

  // Build price target probabilities from Polymarket
  const priceTargets = {};
  if (oilEvent.markets) {
    oilEvent.markets.forEach(m => {
      const match = m.question.match(/\$(\d+)/);
      if (match && m.question.includes('HIGH')) {
        const p = JSON.parse(m.outcomePrices || '["0","0"]');
        priceTargets['above_' + match[1]] = parseFloat(p[0]);
      }
    });
  }

  return {
    timestamp: new Date().toISOString(),
    prices: {
      wti: { price: wti.price, change_pct: wti.changePct },
      brent: { price: brent.price, change_pct: brent.changePct },
      brent_wti_spread: brent.price - wti.price,
    },
    macro: {
      vix: vix.price,
      dxy: dxy.price,
      spx: spx.price,
      us10y: tnx.price,
      gold: gold.price,
    },
    prediction_markets: {
      hormuz_normalizes_by_april: getPolyProb(hormuzEvent),
      kharg_island_hit: getPolyProb(khargEvent),
      us_escort_hormuz: getPolyProb(escortEvent),
      oil_price_targets: priceTargets,
    },
    geopolitical: {
      hormuz_risk_score: 0.68,
      shipping_incidents_7d: 4,
      region: 'Active conflict — US/Israel strikes on Iran, Iranian retaliation across Middle East',
    },
    positioning: cftc.latest ? {
      managed_money_net: cftc.latest.managed_money.net,
      managed_money_long: cftc.latest.managed_money.long,
      managed_money_short: cftc.latest.managed_money.short,
      managed_money_percentile: cftc.latest.managed_money.percentile,
      managed_money_net_change_1w: cftc.latest.managed_money.net_change_1w,
      short_squeeze_risk: cftc.latest.short_squeeze_risk,
      open_interest: cftc.latest.open_interest,
      oi_change_1w: cftc.latest.oi_change_1w,
      cot_date: cftc.latest.date,
    } : {
      managed_money_percentile: 'unknown',
      short_squeeze_risk: 'unknown',
      note: 'CFTC data unavailable',
    },
    volatility: options.summary ? {
      avg_call_iv: options.summary.avgCallIV,
      avg_put_iv: options.summary.avgPutIV,
      put_call_ratio: options.summary.putCallRatio,
      skew_pct: options.summary.skew,
      total_call_volume: options.summary.totalCallVolume,
      total_put_volume: options.summary.totalPutVolume,
      total_call_oi: options.summary.totalCallOI,
      total_put_oi: options.summary.totalPutOI,
      spot_price: options.spotPrice,
      expiration: options.expiration,
    } : {
      note: 'Options data unavailable — assess vol qualitatively',
    },
    inventories: eia.crude_stocks ? {
      crude_change_mbbl: eia.crude_stocks.change ? eia.crude_stocks.change.change : null,
      gasoline_change_mbbl: eia.gasoline_stocks && eia.gasoline_stocks.change ? eia.gasoline_stocks.change.change : null,
      distillate_change_mbbl: eia.distillate_stocks && eia.distillate_stocks.change ? eia.distillate_stocks.change.change : null,
      crude_total_mbbl: eia.crude_stocks.latest ? eia.crude_stocks.latest.value : null,
      eia_period: eia.crude_stocks.change ? eia.crude_stocks.change.period : null,
    } : {
      note: 'EIA data unavailable',
    },
    curve: {
      state: 'backwardation',
      brent_wti_spread: brent.price - wti.price,
      note: 'Front-back spread tightening, physical tightness signals',
    },
  };
}

function computeConsensus(agentResults) {
  const valid = agentResults.filter(r => r && r.direction);
  if (valid.length === 0) return null;

  const bullishCount = valid.filter(r => r.direction === 'bullish').length;
  const bearishCount = valid.filter(r => r.direction === 'bearish').length;
  const neutralCount = valid.filter(r => r.direction === 'neutral').length;

  const avgConfidence = valid.reduce((s, r) => s + (r.confidence || 0), 0) / valid.length;

  // Compute disagreement score (standard deviation of bullish probabilities)
  const bullishProbs = valid.map(r => r.probabilities?.bullish_breakout || 0);
  const meanBullish = bullishProbs.reduce((s, p) => s + p, 0) / bullishProbs.length;
  const variance = bullishProbs.reduce((s, p) => s + (p - meanBullish) ** 2, 0) / bullishProbs.length;
  const disagreement = Math.sqrt(variance);

  // Vol expansion: average of agents who recommend vol-related trades
  const volTrades = valid.filter(r =>
    ['buy_calls', 'buy_puts', 'buy_straddle'].includes(r.recommended_expression)
  );

  // Collect all drivers
  const driverCounts = {};
  valid.forEach(r => {
    (r.top_drivers || []).forEach(d => {
      driverCounts[d] = (driverCounts[d] || 0) + 1;
    });
  });
  const topDrivers = Object.entries(driverCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([d]) => d);

  // Expression consensus
  const exprCounts = {};
  valid.forEach(r => {
    const e = r.recommended_expression || 'no_trade';
    exprCounts[e] = (exprCounts[e] || 0) + 1;
  });
  const topExpression = Object.entries(exprCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'no_trade';

  return {
    bullish_prob: Math.round((bullishCount / valid.length) * 100),
    bearish_prob: Math.round((bearishCount / valid.length) * 100),
    neutral_prob: Math.round((neutralCount / valid.length) * 100),
    avg_confidence: Math.round(avgConfidence * 100),
    disagreement_score: Math.round(disagreement * 100) / 100,
    vol_expansion_prob: Math.round((volTrades.length / valid.length) * 100),
    top_drivers: topDrivers,
    top_expression: topExpression,
    agent_count: valid.length,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(200).json({
      error: 'ANTHROPIC_API_KEY not set',
      agents: [],
      consensus: null,
      world_state: null,
    });
    return;
  }

  try {
    // Build world state from live data
    const worldState = await buildWorldState();

    // Run all 8 agents in parallel
    const results = await Promise.allSettled(
      AGENTS.map(agent => callClaude(agent, worldState))
    );

    const agentOutputs = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return {
        agent_name: AGENTS[i].name,
        direction: 'neutral',
        confidence: 0,
        error: r.reason?.message || 'Failed',
        top_drivers: [],
        probabilities: { bullish_breakout: 0.33, rangebound: 0.34, sharp_reversal: 0.33 },
        recommended_expression: 'no_trade',
        uncertainties: ['Agent call failed'],
      };
    });

    // Compute consensus
    const consensus = computeConsensus(agentOutputs);

    res.status(200).json({
      timestamp: new Date().toISOString(),
      world_state: worldState,
      agents: agentOutputs,
      consensus,
    });
  } catch (e) {
    res.status(500).json({ error: e.message, agents: [], consensus: null });
  }
}
