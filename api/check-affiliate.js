export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Chỉ hỗ trợ phương thức POST' });
  }
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Thiếu thông tin email' });
  }

  // --- MÔ PHỎNG API UPROMOTE ---
  const mockAffiliates = ["vip@gmail.com", "test@evox.ch", "quyet@gmail.com"];
  const isAffiliate = mockAffiliates.includes(email.toLowerCase().trim());

  await new Promise(resolve => setTimeout(resolve, 800));

  return res.status(200).json({
    ok: true,
    email: email,
    isAffiliate: isAffiliate
  });
}
