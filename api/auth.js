export default function handler(req, res) {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Missing shop parameter');
  
  const client_id = "6edfe504ad7c29a0e2e1642b7adff90f";
  const redirect_uri = "https://affiliate-check.vercel.app/api/callback";
  
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${client_id}&scope=&redirect_uri=${redirect_uri}`;
  res.redirect(authUrl);
}
