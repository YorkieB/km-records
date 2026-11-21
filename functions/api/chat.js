// Cloudflare Pages Function: /api/chat
// In-memory edge store with KV binding support (context.env.COMMUNITY_KV)

const SHOWS = [
  { start: 6, end: 10, id: "breakfast", title: "Breakfast", presenter: "Callum & Rhys" },
  { start: 10, end: 15, id: "days", title: "Days", presenter: "Sarah Quinn" },
  { start: 15, end: 19, id: "drive", title: "Drive", presenter: "Owen Hart" },
  { start: 19, end: 23, id: "evenings", title: "Evenings", presenter: "Nia Brooks" },
  { start: 23, end: 27, id: "late", title: "Late", presenter: "Tom Hale" },
  { start: 3, end: 6, id: "early", title: "Early", presenter: "Maya Cole" }
];

function getActiveShow(date = new Date()) {
  const hour = parseInt(date.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false }), 10);
  const adjusted = hour < 3 ? hour + 24 : hour;
  const match = SHOWS.find(s => adjusted >= s.start && adjusted < s.end);
  return match || { id: "drive", title: "Drive", presenter: "Owen Hart" };
}

let pendingMention = null;

let inMemoryMessages = [
  {
    id: "msg_1",
    author: "Sarah [Moderator]",
    avatar: "🎧",
    badge: "MOD",
    text: "Welcome to the KM Green Room! The 24/7 stream is live from London. Drop your thoughts & shoutouts below!",
    timestamp: Date.now() - 3600000 * 2,
    reactions: { "❤️": 12, "👏": 8 }
  },
  {
    id: "msg_2",
    author: "HendrixFan77",
    avatar: "🎸",
    badge: "FAN",
    text: "Kayleigh's solo on 'Thunder Queen' gave me absolute chills! Pure rock lineage.",
    timestamp: Date.now() - 3600000 * 1.5,
    reactions: { "🔥": 15, "🎸": 9 }
  },
  {
    id: "msg_3",
    author: "CaliGirl_Sam",
    avatar: "✨",
    badge: "FAN",
    text: "The sound quality on this stream is amazing. Love that the radio plays non-stop in the background.",
    timestamp: Date.now() - 3600000 * 1,
    reactions: { "❤️": 7 }
  },
  {
    id: "msg_4",
    author: "Owen [Drive Presenter]",
    avatar: "📻",
    badge: "PRESENTER",
    text: "Owen here from the Drive show! What's everyone's favourite track from Leah's new desktop collection?",
    timestamp: Date.now() - 1800000,
    reactions: { "📻": 6, "❤️": 10 }
  },
  {
    id: "msg_5",
    author: "AcousticDrifter",
    avatar: "🌾",
    badge: "FAN",
    text: "'Bubblegum in the Rain' and 'Gravel and Goodbye' are on repeat for me. Leah's storytelling is unmatched.",
    timestamp: Date.now() - 600000,
    reactions: { "🌾": 5, "❤️": 11 }
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
      const storedMention = await env.COMMUNITY_KV.get("km_pending_mention", { type: "json" });
      if (storedMention && (Date.now() - storedMention.timestamp < 300000)) {
        pendingMention = storedMention;
      }
    } catch (e) {
      console.error("KV read error", e);
    }
  }

  // Ensure timestamps are realistic (Cloudflare Workers evaluates top-level Date.now() at 0 during module load)
  const now = Date.now();
  inMemoryMessages = inMemoryMessages.map((m, idx) => {
    if (!m.timestamp || m.timestamp < 1000000000000) {
      m.timestamp = now - (inMemoryMessages.length - idx) * 900000;
    }
    return m;
  });

  if (request.method === "GET") {
    return new Response(JSON.stringify({
      messages: inMemoryMessages.slice(-60),
      pendingMention: pendingMention && (Date.now() - pendingMention.timestamp < 300000) ? pendingMention : null
    }), {
      headers: corsHeaders
    });
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();

      // Handle message reactions
      if (body.action === "react") {
        const msgId = sanitize(body.messageId || "");
        const emoji = sanitize(body.emoji || "❤️").slice(0, 10);
        const msg = inMemoryMessages.find(m => m.id === msgId);
        if (msg) {
          if (!msg.reactions) msg.reactions = {};
          msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
          if (env && env.COMMUNITY_KV) {
            try {
              await env.COMMUNITY_KV.put("km_chat_messages", JSON.stringify(inMemoryMessages));
            } catch (e) {
              console.error("KV write error", e);
            }
          }
          return new Response(JSON.stringify({ success: true, messageId: msgId, reactions: msg.reactions }), {
            headers: corsHeaders
          });
        }
        return new Response(JSON.stringify({ error: "Message not found" }), {
          status: 404,
          headers: corsHeaders
        });
      }

      // Handle AI Host Daisy response
      if (body.action === "ai_reply") {
        const prompt = sanitize(body.prompt || "").slice(0, 300);
        const userAuthor = sanitize(body.author || "Friend").slice(0, 30);
        const currentSong = sanitize(body.song || "").slice(0, 80);

        let aiText = "";
        if (env && env.AI) {
          try {
            const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
              messages: [
                {
                  role: "system",
                  content: "You are Daisy, a charismatic, warm, genuine music enthusiast and Green Room AI host at KM Records in London. You love Kayleigh Merez's searing British rock guitar solos and Leah Carter's heartwarming acoustic country songs. Write a concise, natural response (1-2 sentences). Be conversational and occasionally ask an engaging follow-up question to keep the conversation flowing. Never sound like a generic robotic assistant."
                },
                {
                  role: "user",
                  content: `${userAuthor} says in chat: "${prompt}" (Current song playing: ${currentSong})`
                }
              ],
              max_tokens: 120
            });
            if (aiRes && (aiRes.response || aiRes.text)) {
              aiText = (aiRes.response || aiRes.text).trim();
            }
          } catch (aiErr) {
            console.error("Workers AI generation error", aiErr);
          }
        }

        if (!aiText) {
          // Contextual fallback response
          const fallbacks = [
            `I love that thought, ${userAuthor}! What's your favourite moment in the track?`,
            `Kayleigh and Leah have such a magical dynamic. Are you more drawn to the rock overdrive or the acoustic ballads?`,
            `That guitar tone never fails to give me chills! Have you tried playing any of Kayleigh's riffs yourself?`,
            `The energy in the Green Room today is wonderful. What track would you spin next if you had the radio deck?`
          ];
          aiText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }

        const daisyMsg = {
          id: "msg_daisy_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
          author: "Daisy",
          avatar: "🌼",
          badge: "HOST",
          text: aiText,
          timestamp: Date.now(),
          reactions: { "❤️": 2, "✨": 1 }
        };

        inMemoryMessages.push(daisyMsg);
        if (inMemoryMessages.length > 100) inMemoryMessages = inMemoryMessages.slice(-100);
        if (env && env.COMMUNITY_KV) {
          try {
            await env.COMMUNITY_KV.put("km_chat_messages", JSON.stringify(inMemoryMessages));
          } catch (e) {}
        }

        return new Response(JSON.stringify({ success: true, message: daisyMsg }), {
          headers: corsHeaders
        });
      }

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
        timestamp: Date.now(),
        reactions: {}
      };

      inMemoryMessages.push(newMsg);

      // Check if message is addressed to the on-air presenter or requests a radio shoutout
      if (badge !== "PRESENTER" && badge !== "HOST") {
        const lowerText = text.toLowerCase();
        const currentShow = getActiveShow();
        const presenterFirstName = currentShow.presenter.split(" ")[0].toLowerCase();
        const isPresenterMention = lowerText.includes(presenterFirstName) ||
                                  lowerText.includes("owen") ||
                                  lowerText.includes("sarah") ||
                                  lowerText.includes("callum") ||
                                  lowerText.includes("rhys") ||
                                  lowerText.includes("nia") ||
                                  lowerText.includes("tom") ||
                                  lowerText.includes("maya") ||
                                  lowerText.includes("dj") ||
                                  lowerText.includes("presenter") ||
                                  lowerText.includes("shoutout") ||
                                  lowerText.includes("radio") ||
                                  lowerText.includes("on air") ||
                                  lowerText.includes("play");

        if (isPresenterMention) {
          pendingMention = {
            id: newMsg.id,
            author,
            text,
            timestamp: Date.now()
          };
          const presenterReplies = [
            `Got your @mention, ${author}! 📻 I've marked this down to read out live on air right now on our next link. Listen out!`,
            `Hey ${author}! 🎙️ Noted your mention—reading your shoutout live on KM Radio on our very next link!`,
            `Brilliant to hear from you, ${author}! 📻 Reading this out live across the UK on the next sweep.`
          ];
          const presMsg = {
            id: "msg_pres_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
            author: `${currentShow.presenter} [${currentShow.title} Presenter]`,
            avatar: "📻",
            badge: "PRESENTER",
            text: presenterReplies[Math.floor(Math.random() * presenterReplies.length)],
            timestamp: Date.now() + 800,
            reactions: { "📻": 2, "❤️": 1 }
          };
          inMemoryMessages.push(presMsg);
        }
      }

      if (inMemoryMessages.length > 100) {
        inMemoryMessages = inMemoryMessages.slice(-100);
      }

      if (env && env.COMMUNITY_KV) {
        try {
          await env.COMMUNITY_KV.put("km_chat_messages", JSON.stringify(inMemoryMessages));
          if (pendingMention) {
            await env.COMMUNITY_KV.put("km_pending_mention", JSON.stringify(pendingMention));
          }
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
