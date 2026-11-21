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

  // Station metadata only - Cues are strictly client-side fragment-triggered to prevent mid-song polling bleed
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
    talk: null
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
