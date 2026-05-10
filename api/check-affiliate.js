import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Chỉ hỗ trợ phương thức POST' });
  }

  // --- BẢO MẬT: XÁC THỰC CHỮ KÝ TỪ SHOPIFY APP PROXY ---
  const query = req.query;
  const signature = query.signature;
  const shopifyApiSecret = process.env.SHOPIFY_API_SECRET;

  if (shopifyApiSecret && signature) {
    // Clone query để xóa signature trước khi băm
    const queryWithoutSignature = { ...query };
    delete queryWithoutSignature.signature;

    // Sắp xếp params và nối lại thành chuỗi
    const input = Object.keys(queryWithoutSignature)
      .sort()
      .map(key => `${key}=${queryWithoutSignature[key]}`)
      .join('');

    // Băm SHA-256 HMAC
    const hash = crypto
      .createHmac('sha256', shopifyApiSecret)
      .update(input)
      .digest('hex');

    if (hash !== signature) {
      console.error('[Security] Invalid signature detected.');
      return res.status(401).json({ error: 'Unauthorized: Sai chữ ký bảo mật' });
    }
  } else if (!shopifyApiSecret) {
     // Log nhắc nhở nếu quên cài biến môi trường (vẫn cho qua để test tạm nếu cần)
     console.warn('[Security] Cảnh báo: Chưa cài đặt SHOPIFY_API_SECRET. API đang mở Public!');
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Thiếu thông tin email' });
  }

  const shopifyToken = process.env.SHOPIFY_ADMIN_TOKEN;
  const shopifyDomain = process.env.SHOPIFY_DOMAIN || 'evox-dev.myshopify.com';

  if (!shopifyToken) {
    return res.status(500).json({ error: 'Chưa cấu hình Token Shopify Admin' });
  }

  try {
    // Gọi GraphQL API của Shopify để lấy danh sách email từ Metaobject type: "affiliate_email"
    const query = `
      {
        metaobjects(type: "affiliate_email", first: 250) {
          edges {
            node {
              fields {
                key
                value
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${shopifyDomain}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': shopifyToken
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error("Shopify GraphQL Errors:", data.errors);
      return res.status(500).json({ error: 'Lỗi khi gọi Shopify API' });
    }

    // Trích xuất danh sách email từ kết quả trả về
    let metaobjectEmails = [];
    const edges = data.data?.metaobjects?.edges || [];
    
    edges.forEach(edge => {
      const fields = edge.node.fields;
      // Giả sử có một trường (field) tên là "email" trong metaobject
      const emailField = fields.find(f => f.key === 'email');
      if (emailField && emailField.value) {
        metaobjectEmails.push(emailField.value.toLowerCase().trim());
      }
    });

    // Kiểm tra xem email khách nhập có nằm trong danh sách kéo từ Metaobject về không
    const isAffiliate = metaobjectEmails.includes(email.toLowerCase().trim());

    return res.status(200).json({
      ok: true,
      email: email,
      isAffiliate: isAffiliate,
      source: 'metaobject'
    });

  } catch (error) {
    console.error("Lỗi:", error);
    return res.status(500).json({ error: 'Lỗi server nội bộ' });
  }
}
