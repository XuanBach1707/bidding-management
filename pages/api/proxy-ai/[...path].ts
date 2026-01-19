import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const proxy = httpProxy.createProxyServer();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise<void>((resolve, reject) => {
    const target = 'http://26.112.109.171:43210/'; // Đường dẫn Server mới (Cloudflare Tunnel)


    // [FIX QUAN TRỌNG]
    // Log cho thấy URL bắt đầu bằng /api-proxy, nên ta phải replace đúng cái đó.
    // Thêm replace chằng chéo cả 2 trường hợp để chắc ăn 100%
    if (req.url) {
      req.url = req.url
          .replace(/^\/api-proxy/, '')      // Trường hợp 1 (Đang xảy ra)
          .replace(/^\/api\/proxy-ai/, ''); // Trường hợp 2 (Dự phòng)
    }

    proxy.web(req, res, {
      target: target,
      changeOrigin: true,
      proxyTimeout: 300000, 
      timeout: 300000,
    }, (err) => {
      console.error("❌ Proxy Error:", err);
      if (!res.headersSent) {
          res.status(500).json({ error: "Proxy Error", details: err.message });
      }
      reject(err);
    });
  });
}