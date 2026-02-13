export async function onRequestGet(context) {
  const { params, env } = context;

  if (!env.SHARE_KV) {
    return new Response(JSON.stringify({ error: "SHARE_KV binding missing" }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }

  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "missing id" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const raw = await env.SHARE_KV.get(id);
  if (!raw) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "content-type": "application/json" }
    });
  }

  return new Response(raw, {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}
