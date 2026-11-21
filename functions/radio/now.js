import { TOTAL_SEGMENTS, SEGMENT_DURATION, TRACK_SEGMENTS, SHOWS, getShowAt, formatUKTime, formatUKDate } from "./_segments.js";

export async function onRequest(context) {
  const now = new Date();
  const nowSec = now.getTime() / 1000;
  const londonDateStr = now.toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "long" });
  const weekdayStr = now.toLocaleDateString("en-GB", { timeZone: "Europe/London", weekday: "long" });
  const clockStr = now.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
  const parts = clockStr.split(":");
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  const isWeekend = weekdayStr === "Saturday" || weekdayStr === "Sunday";

  const currentShow = getShowAt(nowSec);

  // Exact physical segment calculation matching /radio/live.js
  const seq = Math.floor(nowSec / SEGMENT_DURATION);
  const cycleNum = Math.floor(seq / TOTAL_SEGMENTS);

  // Allow client player to pass its currently decoded fragment for sample-accurate sync
  const url = new URL(context.request.url);
  const reqSeg = parseInt(url.searchParams.get("seg") || "0", 10);
  const currentSeg = (reqSeg >= 1 && reqSeg <= TOTAL_SEGMENTS) 
    ? reqSeg 
    : ((seq % TOTAL_SEGMENTS) + 1);

  let trackIdx = TRACK_SEGMENTS.findIndex(t => currentSeg >= t.start && currentSeg <= t.end);
  if (trackIdx === -1) trackIdx = 0;
  const currentSong = TRACK_SEGMENTS[trackIdx];
  const nextSong = TRACK_SEGMENTS[(trackIdx + 1) % TRACK_SEGMENTS.length];

  const segOffset = currentSeg - currentSong.start;
  const intoSec = Math.floor(segOffset * SEGMENT_DURATION + (nowSec % SEGMENT_DURATION));
  const totalTrackSec = Math.floor((currentSong.end - currentSong.start + 1) * SEGMENT_DURATION);
  const remainingSec = Math.max(0, totalTrackSec - intoSec);

  // --- CONTENT-AWARE IMAGING & PRESENTER SELECTION ENGINE ---
  let cue = null;
  const joinId = `join_c${cycleNum}_t${trackIdx}`;

  if (intoSec < 6) {
    // 1. Top of the Hour (minutes 58, 59, 0, 1): Grand Nationwide Ident (London to Penzance)
    if (minute >= 58 || minute <= 1) {
      cue = {
        id: `${joinId}_toh`,
        kind: "ident",
        src: "/audio/imaging/heart/heart_ident_nationwide_toh.mp3",
        title: "Top of the Hour Nationwide Ident (London to Penzance)",
        context: "Scheduled: Nationwide Top of the Hour broadcast check"
      };
    }
    // 2. Bottom of the Hour (minutes 28 - 31): 30-Minute Variety Promise
    else if (minute >= 28 && minute <= 31) {
      cue = {
        id: `${joinId}_variety`,
        kind: "ident",
        src: "/audio/imaging/heart/heart_ident_nonstop_variety.mp3",
        title: "Non-Stop Variety Promise Ident",
        context: "Scheduled: Mid-hour music variety guarantee"
      };
    }
    // 3. Weekend Feel-Good (Every 4th transition on Saturday / Sunday)
    else if (isWeekend && (trackIdx % 4 === 1)) {
      cue = {
        id: `${joinId}_weekend`,
        kind: "ident",
        src: "/audio/imaging/heart/heart_ident_weekend_feelgood.mp3",
        title: "Weekend Feel-Good Ident",
        context: `Weekend programming: ${weekdayStr} uplifting rotation`
      };
    }
    // 4. Autonomous AI Presenter Links (Every 3rd song in commercial sweep)
    else if (trackIdx % 3 === 0) {
      const linkSrc = `/radio/speak?show=${currentShow.id}&next=${encodeURIComponent(currentSong.title)}&v=${Math.floor(nowSec / 900)}`;
      cue = {
        id: `${joinId}_pres`,
        kind: "presenter_link",
        src: linkSrc,
        title: `${currentShow.presenter} On-Air Dry Link (Live UK News & Weather)`,
        context: `Live AI Presenter: Real-time UK news and weather heading into ${currentSong.title}`
      };
    }
  }

  const data = {
    timezone: "Europe/London",
    hour,
    minute,
    clock: clockStr,
    weekday: weekdayStr,
    date: londonDateStr,
    isWeekend,
    id: currentShow.id,
    title: currentShow.title,
    presenter: currentShow.presenter,
    onAir: `KM Records — ${currentShow.title} with ${currentShow.presenter}`,
    segment: currentSeg,
    totalSegments: TOTAL_SEGMENTS,
    live: {
      weather: {
        place: "London & UK",
        weather: "clear, about 8 degrees"
      },
      catalogue: {
        title: currentSong.title,
        artist: currentSong.artist,
        vibe: currentSong.vibe,
        energy: currentSong.energy,
        story: currentSong.story,
        into: intoSec,
        remaining: remainingSec,
        next: {
          title: nextSong.title,
          artist: nextSong.artist,
          vibe: nextSong.vibe,
          energy: nextSong.energy,
          ramp: nextSong.ramp,
          story: nextSong.story
        }
      }
    },
    talk: cue
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
