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
    return res.status(503).json({
      error: 'NAVER_SEARCH_CLIENT_ID 또는 NAVER_SEARCH_CLIENT_SECRET 환경변수가 없습니다.'
    });
  }

  try {
    const endpoint = new URL('https://openapi.naver.com/v1/search/local.json');
    endpoint.searchParams.set('query', query);
    endpoint.searchParams.set('display', '10');
    endpoint.searchParams.set('start', '1');
    endpoint.searchParams.set('sort', 'random');

    const response = await fetch(endpoint, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    });
    const body = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.send(body);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
