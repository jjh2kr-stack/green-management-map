const strip = (value = '') => String(value).replace(/<[^>]*>/g, '').trim();

function makeVariants(query) {
  const q = query.replace(/\s+/g, ' ').trim();
  const variants = [q];
  if (!/^서울(?:특별시)?\s/.test(q)) variants.push(`서울 ${q}`);
  if (q.endsWith('역')) variants.push(`${q} 지하철역`);
  if (q.endsWith('공원')) variants.push(`${q} 서울`);
  return [...new Set(variants)].slice(0, 4);
}

async function requestLocal(query, clientId, clientSecret) {
  const endpoint = new URL('https://openapi.naver.com/v1/search/local.json');
  endpoint.searchParams.set('query', query);
  endpoint.searchParams.set('display', '5');
  endpoint.searchParams.set('start', '1');
  endpoint.searchParams.set('sort', 'random');

  const response = await fetch(endpoint, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.errorMessage || data.error || `NAVER ${response.status}`);
  return Array.isArray(data.items) ? data.items : [];
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'GET only' });
  }

  const query = String(req.query?.query || '').trim();
  if (!query) return res.status(400).json({ error: '검색어가 없습니다.' });

  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(503).json({ error: 'Vercel 검색 API 환경변수가 없습니다.' });
  }

  try {
    const variants = makeVariants(query);
    const settled = await Promise.allSettled(
      variants.map(v => requestLocal(v, clientId, clientSecret))
    );

    const seen = new Set();
    const items = [];
    for (const result of settled) {
      if (result.status !== 'fulfilled') continue;
      for (const item of result.value) {
        const key = `${strip(item.title)}|${item.mapx}|${item.mapy}`;
        if (seen.has(key)) continue;
        seen.add(key);
        items.push(item);
      }
    }

    return res.status(200).json({ query, variants, items: items.slice(0, 15) });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
