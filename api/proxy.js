export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { shop, path, client_id, client_secret } = req.query;

  if (!shop || !client_id || !client_secret) {
    return res.status(400).json({ error: "Missing shop, client_id, or client_secret" });
  }

  try {
    // Step 1: Get access token using client credentials grant
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id,
        client_secret,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return res.status(tokenRes.status).json({ error: `Token fetch failed: ${err}` });
    }

    const { access_token } = await tokenRes.json();

    // Step 2: If no path, just return the token (for testing)
    if (!path) return res.status(200).json({ access_token });

    // Step 3: Use token to call Shopify API
    const apiRes = await fetch(
      `https://${shop}/admin/api/2024-01${path}`,
      { headers: { "X-Shopify-Access-Token": access_token } }
    );

    // Forward the Link header so the client can paginate
    const linkHeader = apiRes.headers.get("link");
    if (linkHeader) res.setHeader("link", linkHeader);

    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
