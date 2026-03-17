// Vercel serverless function: fetch NASA FIRMS fire hotspot data
// Returns fires in Middle East region (lat 20-38, lon 35-65)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');

  try {
    // FIRMS API: area format is south,west,north,east
    const url = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/DEMO_KEY/VIIRS_SNPP_NRT/20,35,38,65/1';
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) {
      res.status(200).json([]);
      return;
    }
    const csv = await r.text();
    if (csv.includes('Invalid') || !csv.includes('latitude')) {
      res.status(200).json([]);
      return;
    }

    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const latIdx = headers.indexOf('latitude');
    const lonIdx = headers.indexOf('longitude');
    const brightIdx = headers.indexOf('bright_ti4');
    const confIdx = headers.indexOf('confidence');
    const dtIdx = headers.indexOf('acq_date');
    const tmIdx = headers.indexOf('acq_time');

    const fires = [];
    for (let i = 1; i < lines.length && fires.length < 500; i++) {
      const cols = lines[i].split(',');
      const lat = parseFloat(cols[latIdx]);
      const lon = parseFloat(cols[lonIdx]);
      if (isNaN(lat) || isNaN(lon)) continue;
      fires.push({
        lat, lon,
        brightness: parseFloat(cols[brightIdx]) || 330,
        confidence: cols[confIdx] || 'nominal',
        datetime: `${cols[dtIdx] || ''} ${cols[tmIdx] || ''}`.trim(),
      });
    }

    res.status(200).json(fires);
  } catch (e) {
    res.status(200).json([]);
  }
}
