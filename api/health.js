export default function handler(req, res) {
  return res.status(200).json({
    ok: true,
    searchClientId: Boolean(process.env.NAVER_SEARCH_CLIENT_ID),
    searchClientSecret: Boolean(process.env.NAVER_SEARCH_CLIENT_SECRET)
  });
}
