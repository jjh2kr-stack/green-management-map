
export default async function handler(req, res) {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "query required" });

  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(200).json({ items: [], note: "NAVER_SEARCH_CLIENT_ID / NAVER_SEARCH_CLIENT_SECRET not set" });
  }

  try {
    const url = "https://openapi.naver.com/v1/search/local.json?display=5&query=" + encodeURIComponent(query);
    const r = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret
      }
    });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
