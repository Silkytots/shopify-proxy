export default async function handler(req, res) {
  // Allow requests from any origin (needed for browser-based apps)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Shopify-Access-Token");

  // Handle preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  const { shop, path, token } = req.query;

  if (!shop || !path || !token) {
    return res.status(400).json({ error: "Missing shop, path, or token" });
  }

  try {
    const url = `https://${shop}/admin/api/2024-01${path}`;
    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
