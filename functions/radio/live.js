export async function onRequest(context) {
  const TOTAL_SEGMENTS = 861;
  const SEGMENT_DURATION = 6.0;
  const WINDOW_SIZE = 22;

  const nowSec = Date.now() / 1000;
  const seq = Math.floor(nowSec / SEGMENT_DURATION);

  let manifest = "#EXTM3U\n";
  manifest += "#EXT-X-VERSION:3\n";
  manifest += "#EXT-X-TARGETDURATION:7\n";
  manifest += `#EXT-X-MEDIA-SEQUENCE:${seq}\n`;
  manifest += "#EXT-X-INDEPENDENT-SEGMENTS\n";

  for (let i = 0; i < WINDOW_SIZE; i++) {
    const sIndex = ((seq + i) % TOTAL_SEGMENTS) + 1;
    const padIndex = String(sIndex).padStart(4, "0");
    const dur = (i % 2 === 0) ? "5.991" : "6.014";
    manifest += `#EXTINF:${dur},\n/radio/s${padIndex}.ts\n`;
  }

  return new Response(manifest, {
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Cache-Control": "public, max-age=2, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
