export async function onRequest(context) {
  const url = new URL(context.request.url);
  const target = new URL("/radio/speak" + url.search, "https://cc2cd2de.km-records.pages.dev");
  const response = await fetch(target, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body
  });
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(response.body, {
    status: response.status,
    headers
  });
}
