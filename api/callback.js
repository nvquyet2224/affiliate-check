export default function handler(req, res) {
  const shop = req.query.shop;
  const client_id = "6edfe504ad7c29a0e2e1642b7adff90f";
  
  if (!shop) return res.status(400).send('Missing shop parameter');

  // App đã cài xong (lách luật không cần đổi token), trả user về lại trang admin của app
  res.redirect(`https://${shop}/admin/apps/${client_id}`);
}
