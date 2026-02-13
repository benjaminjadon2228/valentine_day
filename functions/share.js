export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.SHARE_KV) {
    return new Response(JSON.stringify({ error: "SHARE_KV binding missing" }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  await env.SHARE_KV.put(id, JSON.stringify(payload), {
    expirationTtl: 60 * 60 * 24 * 14
  });

  return new Response(JSON.stringify({ id }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}
