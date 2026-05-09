export default function handler(req, res) {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Missing shop parameter');

  // Trả về giao diện HTML thay vì redirect để tránh bị vòng lặp (loop)
  res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
      <h1 style="color: #008060;">Cài đặt App Proxy Thành Công! 🎉</h1>
      <p>Hệ thống kết nối ngầm đã được thiết lập. App này không có giao diện quản lý.</p>
      <p>Anh có thể <b>tắt trang này</b> và ra ngoài web test bình thường nhé!</p>
    </div>
  `);
}
