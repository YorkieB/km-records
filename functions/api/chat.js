// Cloudflare Pages Function: /api/chat
// In-memory edge store with KV binding support (context.env.COMMUNITY_KV)

let inMemoryMessages = [
  {
    id: "msg_1",
    author: "Sarah [Moderator]",
    avatar: "🎧",
    badge: "MOD",
    text: "Welcome to the KM Green Room! The 24/7 stream is live from London. Drop your thoughts & shoutouts below!",
    timestamp: Date.now() - 3600000 * 2
  },
  {
    id: "msg_2",
    author: "HendrixFan77",
    avatar: "🎸",
    badge: "FAN",
    text: "Kayleigh's solo on 'Thunder Queen' gave me absolute chills! Pure rock lineage.",
    timestamp: Date.now() - 3600000 * 1.5
  },
  {
    id: "msg_3",
    author: "CaliGirl_Sam",
    avatar: "✨",
    badge: "FAN",
    text: "The sound quality on this stream is amazing. Love that the radio plays non-stop in the background.",
    timestamp: Date.now() - 3600000 * 1
  },
  {
    id: "msg_4",
    author: "Owen [Drive Presenter]",
    avatar: "📻",
    badge: "PRESENTER",
    text: "Owen here from the Drive show! What's everyone's favourite track from Leah's new desktop collection?",
    timestamp: Date.now() - 1800000
  },
  {
    id: "msg_5",
    author: "AcousticDrifter",
    avatar: "🌾",
    badge: "FAN",
    text: "'Bubblegum in the Rain' and 'Gravel and Goodbye' are on repeat for me. Leah's storytelling is unmatched.",
    timestamp: Date.now() - 600000
  }
];

function sanitize(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim();
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use KV if bound
  if (env && env.COMMUNITY_KV) {
    try {
      const stored = await env.COMMUNITY_KV.get("km_chat_messages", { type: "json" });
      if (stored && Array.isArray(stored)) {
        inMemoryMessages = stored;
      }
    } catch (e) {
      console.error("KV read error", e);
    }
  }

  if (request.method === "GET") {
    return new Response(JSON.stringify({ messages: inMemoryMessages.slice(-60) }), {
      headers: corsHeaders
    });
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();
      const text = sanitize(body.text || "").slice(0, 300);
      const author = sanitize(body.author || "Fan").slice(0, 30);
      const avatar = sanitize(body.avatar || "🎸").slice(0, 10);
      const badge = sanitize(body.badge || "FAN").slice(0, 15);

      if (!text) {
        return new Response(JSON.stringify({ error: "Message text cannot be empty" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const newMsg = {
        id: "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        author: author || "KM Fan",
        avatar: avatar || "🎸",
        badge: badge || "FAN",
        text,
        timestamp: Date.now()
      };

      inMemoryMessages.push(newMsg);
      if (inMemoryMessages.length > 100) {
        inMemoryMessages = inMemoryMessages.slice(-100);
      }

      if (env && env.COMMUNITY_KV) {
        try {
          await env.COMMUNITY_KV.put("km_chat_messages", JSON.stringify(inMemoryMessages));
        } catch (e) {
          console.error("KV write error", e);
        }
      }

      return new Response(JSON.stringify({ success: true, message: newMsg }), {
        headers: corsHeaders
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: corsHeaders
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: corsHeaders
  });
}
