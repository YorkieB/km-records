// Autonomous AI Radio Presenter Engine for KM Radio UK
// Pulls live UK news headlines and real-time weather from the web,
// reads live Green Room listener chat messages & community discussions,
// generates authentic British commercial radio presenter scripts,
// and synthesizes broadcast-quality audio via ElevenLabs TTS API.

const VOICE_MAP = {
  breakfast: "004KTmksPwLFhbYi3ENc", // Callum & Rhys (Zak Welsh)
  days: "7HStkwG7dv8Mlka4MdTL",      // Sarah Quinn (Eleven v4)
  drive: "bDTlr4ICxntY9qVWyL0o",     // Owen Hart (Edmund)
  evenings: "aD6riP1btT197c6dACmy",  // Nia Brooks (Rachel M - Pro British Radio Presenter, lively & full of personality)
  late: "howQSp4vukBSqM6XL2q5",      // Tom Hale (Rob Charles)
  early: "V0cljQmo7wpx8LTdbqfJ"      // Maya Cole (Vicky Cowan)
};

const SHOW_NAMES = {
  breakfast: "Callum & Rhys",
  days: "Sarah Quinn",
  drive: "Owen Hart",
  evenings: "Nia Brooks",
  late: "Tom Hale",
  early: "Maya Cole"
};

const FALLBACK_LINKS = {
  breakfast: "/audio/presenters/callum_rhys_link_01.mp3",
  days: "/audio/presenters/sarah_quinn_link_01.mp3",
  drive: "/audio/presenters/owen_hart_link_01.mp3",
  evenings: "/audio/presenters/nia_brooks_link_01.mp3",
  late: "/audio/presenters/tom_hale_link_01.mp3",
  early: "/audio/presenters/maya_cole_link_01.mp3"
};

// In-memory link cache to serve instantaneous audio without regenerating identical links
const LINK_CACHE = new Map();

let lastPresenterPostTime = 0;
let lastPostedShow = "";

async function getLiveIntel(origin) {
  let headline = "music fans tuning in across the country";
  let weatherPhrase = "mild conditions across London and the UK";
  let chatShoutout = null;
  let forumTopic = null;

  // 1. Fetch live Green Room chat messages & listener shoutouts
  try {
    const chatUrl = new URL("/api/chat", origin);
    const chatRes = await fetch(chatUrl, { headers: { "User-Agent": "KMRadioDJ/2.0" } });
    if (chatRes.ok) {
      const cData = await chatRes.json();
      // Prioritize explicit live @ mentions from Green Room
      if (cData && cData.pendingMention && cData.pendingMention.author) {
        let cleanText = (cData.pendingMention.text || "").replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim();
        if (cleanText.length > 180) cleanText = cleanText.slice(0, 175) + "...";
        chatShoutout = {
          author: cData.pendingMention.author,
          text: cleanText,
          isMention: true
        };
      } else if (cData && Array.isArray(cData.messages) && cData.messages.length > 0) {
        // Find recent fan messages (not bot or presenter)
        const fanMessages = cData.messages.filter(m => (!m.badge || m.badge === "FAN") && m.text && m.author);
        if (fanMessages.length > 0) {
          const latest = fanMessages[fanMessages.length - 1];
          let cleanText = latest.text.replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim();
          if (cleanText.length > 180) cleanText = cleanText.slice(0, 175) + "...";
          chatShoutout = {
            author: latest.author,
            text: cleanText,
            isMention: false
          };
        }
      }
    }
  } catch (_) {}

  // 2. Fetch live community forum discussions
  try {
    const forumUrl = new URL("/api/forum", origin);
    const forumRes = await fetch(forumUrl, { headers: { "User-Agent": "KMRadioDJ/2.0" } });
    if (forumRes.ok) {
      const fData = await forumRes.json();
      if (fData && Array.isArray(fData.topics) && fData.topics.length > 0) {
        const top = fData.topics[0];
        forumTopic = {
          title: top.title,
          author: top.author
        };
      }
    }
  } catch (_) {}

  // 3. Fetch live BBC UK News RSS
  try {
    const newsRes = await fetch("https://feeds.bbci.co.uk/news/uk/rss.xml", {
      headers: { "User-Agent": "KMRadioBot/2.0" }
    });
    if (newsRes.ok) {
      const xml = await newsRes.text();
      const matches = [...xml.matchAll(/<item>[\s\S]*?<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/g)];
      if (matches && matches.length > 0) {
        const cleanTitle = matches[0][1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim();
        if (cleanTitle && cleanTitle.length < 80) {
          headline = cleanTitle;
        }
      }
    }
  } catch (_) {}

  // 4. Fetch live London & UK weather from Open-Meteo
  try {
    const weatherRes = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,weather_code",
      { headers: { "User-Agent": "KMRadioBot/2.0" } }
    );
    if (weatherRes.ok) {
      const wData = await weatherRes.json();
      const temp = Math.round(wData?.current?.temperature_2m ?? 9);
      const code = wData?.current?.weather_code ?? 3;
      if (code === 0) weatherPhrase = `clear skies in London, sitting at ${temp} degrees`;
      else if (code >= 1 && code <= 3) weatherPhrase = `dry and overcast in London, around ${temp} degrees`;
      else if (code >= 51 && code <= 67) weatherPhrase = `light rain over London, sitting at ${temp} degrees`;
      else weatherPhrase = `about ${temp} degrees in London and the UK`;
    }
  } catch (_) {}

  return { headline, weatherPhrase, chatShoutout, forumTopic };
}

function generateConversationalReply(text, author, presenterFirstName) {
  const lower = (text || "").toLowerCase();
  
  // Strip out @mentions and names from the start
  let stripped = text.replace(/@[a-zA-Z0-9_]+/g, "").trim();

  // 1. Inquiries about guitars, gear, tone, instruments
  if (lower.includes("guitar") || lower.includes("tone") || lower.includes("solo") || lower.includes("riff") || lower.includes("amp") || lower.includes("pedal") || lower.includes("telecaster") || lower.includes("les paul")) {
    return `You're asking about the guitar tone there, ${author}! Honestly, having spent time listening to Kayleigh track those guitars in the studio, it is all vintage valve crunch with zero digital trickery. That tone punches right through the room!`;
  }
  
  // 2. Questions about favorite songs, recommendations or lyrics
  if (lower.includes("favourite") || lower.includes("favorite") || lower.includes("recommend") || lower.includes("best track") || lower.includes("album")) {
    return `That is a proper debate, ${author}! If you're asking me, Thunder Queen is pure unadulterated rock adrenaline, but Leah's storytelling on Bubblegum in the Rain hits you right in the chest. You really can't go wrong either way!`;
  }

  // 3. Questions asking how the presenter is doing or studio vibes
  if (lower.includes("how are you") || lower.includes("how's it going") || lower.includes("having a good") || lower.includes("hows it going")) {
    return `I am having an absolute blast here in the studio, ${author}! The coffee is piping hot, the playlist is stacked with proper guitar anthems, and having everyone buzzing in the Green Room makes the whole show!`;
  }

  // 4. Praise for the show, station, or music
  if (lower.includes("love") || lower.includes("great") || lower.includes("amazing") || lower.includes("banger") || lower.includes("tune") || lower.includes("proper") || lower.includes("brilliant") || lower.includes("fire")) {
    return `Really appreciate that, ${author}! We put so much graft into keeping the music 100 percent real British indie-rock, no fluff, just proper songs played with heart. So glad you're cranking it up with us!`;
  }

  // 5. General question with ?
  if (lower.includes("?")) {
    return `That's a cracking question from ${author} in the lounge! There is so much going on behind the scenes at KM Records right now, and hearing from you lot makes the whole live broadcast feel like one massive living room session!`;
  }

  // 6. Natural conversational fallback with personality
  return `Really loved seeing that post come through from ${author}! That is exactly what this station is all about—connecting everyone across the country through great independent rock and acoustic music. Keep the thoughts coming in the chat!`;
}

function buildPresenterScript(showId, clockStr, nextTrack, intel) {
  const { headline, weatherPhrase, chatShoutout, forumTopic } = intel;

  // 1. Live Green Room Listener Shoutout (deep, conversational on-air reply & waffle!)
  if (chatShoutout && chatShoutout.author) {
    const { author, text, isMention } = chatShoutout;
    const presenterFirstName = (SHOW_NAMES[showId] || "Nia").split(" ")[0];
    const replyWaffle = generateConversationalReply(text, author, presenterFirstName);

    switch (showId) {
      case "breakfast":
        return `Good morning UK! Callum and Rhys with you on Breakfast at ${clockStr}. Checking straight into the Green Room chat—${author} dropped a note saying: "${text}". ${replyWaffle} That's how we kick off the morning! Heading straight into ${nextTrack} on KM Radio.`;
      case "days":
        return `Sarah Quinn keeping you company on KM Days. It's ${clockStr} across the country. Just glancing at our live chat—${author} posted: "${text}". ${replyWaffle} Always brilliant to hear from you. Let's keep the workday moving, coming up next is ${nextTrack} on KM Radio.`;
      case "drive":
        return `It's ${clockStr} on KM Drive across the UK, Owen Hart here. Catching up on the Green Room chat—${author} says: "${text}". ${replyWaffle} Big respect to you for tuning in! Let's get the volume right back up, here is ${nextTrack} on KM Radio.`;
      case "evenings":
        return `Nia Brooks here, taking you through the evening on KM Radio, ${clockStr} in the UK. Just saw an absolute gem in the Green Room from ${author}, who writes: "${text}". ${replyWaffle} Love having you on board tonight! Straight into ${nextTrack} on KM Radio.`;
      case "late":
        return `Past midnight across the UK, Tom Hale on the Late Show. Nice to see ${author} active in the lounge, saying: "${text}". ${replyWaffle} Settle in, night owls. Here is ${nextTrack} on KM Radio.`;
      case "early":
        return `Early hours on KM Radio, Maya Cole with you. Early shoutout to ${author} in our chat who posted: "${text}". ${replyWaffle} Starting your day right with ${nextTrack} on KM Radio.`;
    }
  }

  // 2. Standard News & Weather with Green Room chat invite
  switch (showId) {
    case "breakfast":
      return `Good morning UK! Callum and Rhys with you on Breakfast. It's ${clockStr}, ${weatherPhrase}. Top story this morning: ${headline}. Head into the Green Room at kmrecords.uk to drop your shoutouts! Here's ${nextTrack} on KM Radio.`;
    case "days":
      return `It's ${clockStr} in the UK, Sarah Quinn keeping your workday moving on KM Radio. ${weatherPhrase}. In the news today: ${headline}. Say hello in the Green Room! Coming up next, ${nextTrack}.`;
    case "drive":
      return `It's ${clockStr} on Drivetime across the UK, Owen Hart here. London sitting at ${weatherPhrase}. In the headlines right now: ${headline}. Drop your shoutout in the Green Room! Turning the volume up for ${nextTrack} on KM Radio.`;
    case "evenings":
      return `Nia Brooks taking you through the evening on KM Radio. It's ${clockStr} in the UK, ${weatherPhrase}. In the news this evening: ${headline}. Diving straight into ${nextTrack}.`;
    case "late":
      return `Past midnight across the UK, Tom Hale with you on the Late Show. ${weatherPhrase}. Catching up on the stories: ${headline}. Unwinding now with ${nextTrack} on KM Radio.`;
    case "early":
      return `Early hours on KM Radio, Maya Cole keeping you company across the country. It's ${clockStr}, ${weatherPhrase}. Overnight headlines: ${headline}. More great music coming up with ${nextTrack}.`;
    default:
      return `Broadcasting live across the UK on KM Radio. It's ${clockStr}, ${weatherPhrase}. Up next, ${nextTrack}.`;
  }
}

async function postPresenterChatGreeting(origin, showId, presenterName) {
  const nowMs = Date.now();
  if (nowMs - lastPresenterPostTime < 900000 && lastPostedShow === showId) return; // once per 15 min per show
  lastPresenterPostTime = nowMs;
  lastPostedShow = showId;

  try {
    const postUrl = new URL("/api/chat", origin);
    const greetingText = `On air live right now across the UK! 📻 Reading out your shoutouts live on KM Radio—leave your thoughts here in the Green Room!`;
    await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: `${presenterName}`,
        avatar: "📻",
        badge: "PRESENTER",
        text: greetingText
      })
    });
  } catch (_) {}
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const showId = url.searchParams.get("show") || "drive";
  const nextTrack = url.searchParams.get("next") || "Cherry Red";

  const voiceId = VOICE_MAP[showId] || VOICE_MAP.drive;
  const presenterName = SHOW_NAMES[showId] || "Owen Hart";

  const now = new Date();
  const clockStr = now.toLocaleTimeString("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit"
  });

  const hour = now.getUTCHours();

  // Gather live real-time intelligence from the web & Green Room chat
  const intel = await getLiveIntel(url.origin);
  const script = buildPresenterScript(showId, clockStr, nextTrack, intel);

  // Background post: update Green Room chat with on-air host presence
  if (context.waitUntil) {
    context.waitUntil(postPresenterChatGreeting(url.origin, showId, presenterName));
  } else {
    postPresenterChatGreeting(url.origin, showId, presenterName).catch(() => {});
  }

  const shoutoutId = intel.chatShoutout ? intel.chatShoutout.author.replace(/[^a-zA-Z0-9]/g, "") : "std";
  const cacheKey = `${showId}_${hour}_${nextTrack.replace(/[^a-zA-Z0-9]/g, "_")}_${shoutoutId}`;

  // Check cache (15-minute validity)
  const cached = LINK_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 900000) {
    return new Response(cached.audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=600",
        "Access-Control-Allow-Origin": "*",
        "X-Radio-Source": "cache",
        "X-Radio-Script": encodeURIComponent(script)
      }
    });
  }

  const apiKey = context.env?.ELEVENLABS_API_KEY || "sk_d18092c688cc128b20fd0173bfa86a9a347eebbadb272fdd";

  try {
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.78,
          style: 0.25,
          use_speaker_boost: true
        }
      })
    });

    if (ttsRes.ok) {
      const audioBuffer = await ttsRes.arrayBuffer();
      // Cache this dynamic link
      LINK_CACHE.set(cacheKey, { audio: audioBuffer, timestamp: Date.now() });

      return new Response(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=600",
          "Access-Control-Allow-Origin": "*",
          "X-Radio-Source": "ai-live",
          "X-Radio-Script": encodeURIComponent(script)
        }
      });
    }
  } catch (_) {}

  // Graceful fallback to static pre-mastered link if ElevenLabs fails
  const fallbackUrl = new URL(FALLBACK_LINKS[showId] || FALLBACK_LINKS.drive, url.origin);
  const fallbackRes = await fetch(fallbackUrl);
  return new Response(fallbackRes.body, {
    status: fallbackRes.status,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
      "X-Radio-Source": "fallback"
    }
  });
}
