// Vercel serverless function: fetch and parse Google News RSS
// Returns structured JSON array of headlines

const FEEDS = [
  'https://news.google.com/rss/search?q=oil+Hormuz+Iran+crude+strait+when:1d&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=oil+price+OPEC+energy+tanker+when:1d&hl=en-US&gl=US&ceid=US:en',
];

const KEYWORDS = [
  'iran', 'hormuz', 'tehran', 'irgc', 'persian gulf', 'middle east',
  'oil', 'crude', 'brent', 'opec', 'tanker', 'strait', 'nuclear',
  'gulf', 'saudi', 'petroleum', 'energy', 'lng', 'qatar', 'pipeline',
  'sanctions', 'military', 'war', 'conflict', 'missile', 'drone',
  'navy', 'hezbollah', 'houthi', 'red sea', 'shipping', 'barrel',
];

function stripHtml(s) {
  return (s || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function parseRss(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = stripHtml((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
    const link = ((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '').trim();
    const pubDate = ((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '').trim();
    const source = stripHtml((block.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || '');
    const desc = stripHtml((block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '').slice(0, 200);
    if (title) items.push({ title, link, pubDate, source: source || 'News', desc });
  }
  return items;
}

function isRelevant(item) {
  const text = ((item.title || '') + ' ' + (item.desc || '')).toLowerCase();
  return KEYWORDS.some(k => text.includes(k));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');

  try {
    let allItems = [];

    await Promise.allSettled(
      FEEDS.map(async (url) => {
        try {
          const r = await fetch(url, {
            headers: { 'User-Agent': 'MiroFish/1.0' },
            signal: AbortSignal.timeout(8000),
          });
          if (!r.ok) return;
          const xml = await r.text();
          allItems.push(...parseRss(xml));
        } catch (e) { /* skip */ }
      })
    );

    // Deduplicate
    const seen = new Set();
    const deduped = allItems.filter(item => {
      const key = item.title.slice(0, 50).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Tag relevance, sort
    deduped.forEach(item => { item.relevant = isRelevant(item); });
    const relevant = deduped.filter(i => i.relevant).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    const general = deduped.filter(i => !i.relevant).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    const combined = [...relevant.slice(0, 12), ...general.slice(0, Math.max(0, 15 - relevant.length))].slice(0, 15);

    res.status(200).json({ items: combined, count: combined.length });
  } catch (e) {
    res.status(500).json({ error: e.message, items: [] });
  }
}
