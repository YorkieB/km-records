// Cloudflare Pages Function: /api/forum
// In-memory edge store with KV binding support (context.env.COMMUNITY_KV)

let inMemoryTopics = [
  {
    id: "topic_1",
    category: "kayleigh",
    categoryLabel: "🎸 Kayleigh Merez",
    title: "What is your favourite Kayleigh Merez guitar solo across the catalogue?",
    author: "HendrixFan77",
    avatar: "🎸",
    badge: "FAN",
    timestamp: Date.now() - 3600000 * 24,
    content: "Between 'Thunder Queen', 'Lola\\'s the Fire in the Wire', and the newly added instrumental 'Guitar Speaks', the guitar work is incredible. Which one has your favourite riff or outro solo?",
    likes: 18,
    replies: [
      {
        id: "rep_1_1",
        author: "Maya Cole",
        avatar: "📻",
        badge: "PRESENTER",
        timestamp: Date.now() - 3600000 * 18,
        content: "Guitar Speaks at 1:45 has to be one of the cleanest transition runs I've heard this year. Absolute precision.",
        likes: 12
      },
      {
        id: "rep_1_2",
        author: "Camden_Rocker",
        avatar: "⚡",
        badge: "FAN",
        timestamp: Date.now() - 3600000 * 12,
        content: "Thunder Queen outro solo has unmatched raw energy! And Cherry Red has such a gritty live energy to it too.",
        likes: 9
      }
    ]
  },
  {
    id: "topic_2",
    category: "leah",
    categoryLabel: "🌾 Leah Carter",
    title: "Leah's storytelling in 'Bubblegum in the Rain' & 'Pocket Full of Stars'",
    author: "AcousticDrifter",
    avatar: "🌾",
    badge: "FAN",
    timestamp: Date.now() - 3600000 * 16,
    content: "The imagery in Leah's new singles is so vivid. That mix of raw country melancholy with infectious hooks in 'Bubblegum in the Rain' is brilliant. What line stuck with you the most?",
    likes: 24,
    replies: [
      {
        id: "rep_2_1",
        author: "NashvilleSoul",
        avatar: "❤️",
        badge: "FAN",
        timestamp: Date.now() - 3600000 * 8,
        content: "The contrast between the bright title and the emotional weight in the bridge is classic Leah. She makes every line feel authentic.",
        likes: 14
      },
      {
        id: "rep_2_2",
        author: "CountryRoads",
        avatar: "✨",
        badge: "FAN",
        timestamp: Date.now() - 3600000 * 3,
        content: "Also don't sleep on 'Gravel and Goodbye'. That open road acoustic progression is stunning.",
        likes: 7
      }
    ]
  },
  {
    id: "topic_3",
    category: "radio",
    categoryLabel: "📻 KM Radio & Requests",
    title: "Presenter shoutouts & track requests for the live stream",
    author: "Calum Reed",
    avatar: "📻",
    badge: "PRESENTER",
    timestamp: Date.now() - 3600000 * 10,
    content: "Calum here hosting the Breakfast show! Tell us where in the world you're tuning in from, and let us know which track you want to hear spun next on KM Radio.",
    likes: 31,
    replies: [
      {
        id: "rep_3_1",
        author: "LondonRocker",
        avatar: "🔥",
        badge: "FAN",
        timestamp: Date.now() - 3600000 * 6,
        content: "Tuning in from Camden Town! Please play 'Cherry Red' by Kayleigh on the next hour rotation!",
        likes: 11
      },
      {
        id: "rep_3_2",
        author: "ManchesterAcoustic",
        avatar: "☕",
        badge: "FAN",
        timestamp: Date.now() - 3600000 * 2,
        content: "Listening in Manchester with my morning coffee. Would love to hear 'Whiskey on a Wednesday' and 'The Highway Don't Lie'.",
        likes: 8
      }
    ]
  },
  {
    id: "topic_4",
    category: "news",
    categoryLabel: "📢 News & Gigs",
    title: "Official: Full 39-track master catalogue now streaming live 24/7",
    author: "KM Records [Official]",
    avatar: "⭐",
    badge: "LABEL",
    timestamp: Date.now() - 3600000 * 30,
    content: "We have officially updated the KM Records continuous broadcast to 1,411 segments (over 2.3 hours of non-repeating master tracks). 24 master singles across Kayleigh Merez and Leah Carter are now fully playable on the site.",
    likes: 56,
    replies: [
      {
        id: "rep_4_1",
        author: "SuperFan99",
        avatar: "👏",
        badge: "VIP",
        timestamp: Date.now() - 3600000 * 20,
        content: "The audio quality is crystal clear and the site design looks world class. Thank you KM team!",
        likes: 19
      }
    ]
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
      const stored = await env.COMMUNITY_KV.get("km_forum_topics", { type: "json" });
      if (stored && Array.isArray(stored)) {
        inMemoryTopics = stored;
      }
    } catch (e) {
      console.error("KV read error", e);
    }
  }

  // GET: List topics or single topic
  if (request.method === "GET") {
    const topicId = url.searchParams.get("topicId");
    if (topicId) {
      const topic = inMemoryTopics.find(t => t.id === topicId);
      if (!topic) {
        return new Response(JSON.stringify({ error: "Topic not found" }), {
          status: 404,
          headers: corsHeaders
        });
      }
      return new Response(JSON.stringify({ topic }), { headers: corsHeaders });
    }

    const category = url.searchParams.get("category");
    let filtered = inMemoryTopics;
    if (category && category !== "all") {
      filtered = inMemoryTopics.filter(t => t.category === category);
    }

    const topicSummaries = filtered.map(t => ({
      id: t.id,
      category: t.category,
      categoryLabel: t.categoryLabel,
      title: t.title,
      author: t.author,
      avatar: t.avatar,
      badge: t.badge,
      timestamp: t.timestamp,
      snippet: t.content.slice(0, 140) + (t.content.length > 140 ? "..." : ""),
      replyCount: t.replies ? t.replies.length : 0,
      likes: t.likes || 0
    }));

    return new Response(JSON.stringify({ topics: topicSummaries }), {
      headers: corsHeaders
    });
  }

  // POST: Create topic, post reply, or like
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const action = body.action || "create_topic";

      if (action === "create_topic") {
        const title = sanitize(body.title || "").slice(0, 120);
        const content = sanitize(body.content || "").slice(0, 2000);
        const author = sanitize(body.author || "Fan").slice(0, 30);
        const avatar = sanitize(body.avatar || "🎸").slice(0, 10);
        const category = sanitize(body.category || "general").slice(0, 20);

        if (!title || !content) {
          return new Response(JSON.stringify({ error: "Title and content are required." }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const catLabels = {
          kayleigh: "🎸 Kayleigh Merez",
          leah: "🌾 Leah Carter",
          radio: "📻 KM Radio & Requests",
          news: "📢 News & Gigs",
          general: "💬 General Chat"
        };

        const newTopic = {
          id: "topic_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
          category,
          categoryLabel: catLabels[category] || "💬 General Chat",
          title,
          author: author || "KM Fan",
          avatar: avatar || "🎸",
          badge: "FAN",
          timestamp: Date.now(),
          content,
          likes: 1,
          replies: []
        };

        inMemoryTopics.unshift(newTopic);

        if (env && env.COMMUNITY_KV) {
          try {
            await env.COMMUNITY_KV.put("km_forum_topics", JSON.stringify(inMemoryTopics));
          } catch (e) {
            console.error("KV write error", e);
          }
        }

        return new Response(JSON.stringify({ success: true, topic: newTopic }), {
          headers: corsHeaders
        });
      }

      if (action === "post_reply") {
        const topicId = body.topicId;
        const content = sanitize(body.content || "").slice(0, 1000);
        const author = sanitize(body.author || "Fan").slice(0, 30);
        const avatar = sanitize(body.avatar || "🎸").slice(0, 10);

        if (!topicId || !content) {
          return new Response(JSON.stringify({ error: "Topic ID and content are required." }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const topic = inMemoryTopics.find(t => t.id === topicId);
        if (!topic) {
          return new Response(JSON.stringify({ error: "Topic not found" }), {
            status: 404,
            headers: corsHeaders
          });
        }

        const newReply = {
          id: "rep_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
          author: author || "KM Fan",
          avatar: avatar || "🎸",
          badge: "FAN",
          timestamp: Date.now(),
          content,
          likes: 0
        };

        if (!topic.replies) topic.replies = [];
        topic.replies.push(newReply);

        if (env && env.COMMUNITY_KV) {
          try {
            await env.COMMUNITY_KV.put("km_forum_topics", JSON.stringify(inMemoryTopics));
          } catch (e) {
            console.error("KV write error", e);
          }
        }

        return new Response(JSON.stringify({ success: true, reply: newReply }), {
          headers: corsHeaders
        });
      }

      if (action === "like_topic") {
        const topicId = body.topicId;
        const topic = inMemoryTopics.find(t => t.id === topicId);
        if (topic) {
          topic.likes = (topic.likes || 0) + 1;
          if (env && env.COMMUNITY_KV) {
            try {
              await env.COMMUNITY_KV.put("km_forum_topics", JSON.stringify(inMemoryTopics));
            } catch (e) {}
          }
          return new Response(JSON.stringify({ success: true, likes: topic.likes }), {
            headers: corsHeaders
          });
        }
      }

      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
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
