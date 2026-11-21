// Autonomous AI Radio Presenter Engine for KM Radio UK
// Pulls live UK news headlines and real-time weather from the web,
// generates authentic British commercial radio presenter scripts,
// and synthesizes broadcast-quality audio via ElevenLabs TTS API.

const VOICE_MAP = {
  breakfast: "004KTmksPwLFhbYi3ENc", // Callum & Rhys (Zak Welsh)
  days: "7HStkwG7dv8Mlka4MdTL",      // Sarah Quinn (Eleven v4)
  drive: "bDTlr4ICxntY9qVWyL0o",     // Owen Hart (Edmund)
  evenings: "ZF6FPAbjXT4488VcRRnw",  // Nia Brooks (Amelia)
  late: "howQSp4vukBSqM6XL2q5",      // Tom Hale (Rob Charles)
  early: "V0cljQmo7wpx8LTdbqfJ"      // Maya Cole (Vicky Cowan)
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

async function getLiveIntel() {
  let headline = "music fans tuning in across the country";
  let weatherPhrase = "mild conditions across London and the UK";

  // 1. Fetch live BBC UK News RSS
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

  // 2. Fetch live London & UK weather from Open-Meteo
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

  return { headline, weatherPhrase };
}

function buildPresenterScript(showId, clockStr, nextTrack, intel) {
  const { headline, weatherPhrase } = intel;

  switch (showId) {
    case "breakfast":
      return `Good morning UK! Callum and Rhys with you on Breakfast. It's ${clockStr}, ${weatherPhrase}. Top story this morning: ${headline}. Let's keep the energy high, heading into ${nextTrack} right here on KM Radio.`;
    case "days":
      return `It's ${clockStr} in the UK, Sarah Quinn keeping your workday moving on KM Radio. ${weatherPhrase}. In the news today: ${headline}. Coming up next, ${nextTrack}.`;
    case "drive":
      return `It's ${clockStr} on Drivetime across the UK, Owen Hart here. London sitting at ${weatherPhrase}. In the headlines right now: ${headline}. Turning the volume up for ${nextTrack} on KM Radio.`;
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

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const showId = url.searchParams.get("show") || "drive";
  const nextTrack = url.searchParams.get("next") || "Cherry Red";

  const voiceId = VOICE_MAP[showId] || VOICE_MAP.drive;

  const now = new Date();
  const clockStr = now.toLocaleTimeString("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit"
  });

  const hour = now.getUTCHours();
  const cacheKey = `${showId}_${hour}_${nextTrack.replace(/[^a-zA-Z0-9]/g, "_")}`;

  // Check cache (15-minute validity)
  const cached = LINK_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 900000) {
    return new Response(cached.audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=600",
        "Access-Control-Allow-Origin": "*",
        "X-Radio-Source": "cache"
      }
    });
  }

  // Gather live real-time intelligence from the web
  const intel = await getLiveIntel();
  const script = buildPresenterScript(showId, clockStr, nextTrack, intel);

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
