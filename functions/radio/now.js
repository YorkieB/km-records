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
  const currentSeg = (seq % TOTAL_SEGMENTS) + 1;
  const cycleNum = Math.floor(seq / TOTAL_SEGMENTS);

  let trackIdx = TRACK_SEGMENTS.findIndex(t => currentSeg >= t.start && currentSeg <= t.end);
  if (trackIdx === -1) trackIdx = 0;
  const currentSong = TRACK_SEGMENTS[trackIdx];
  const nextSong = TRACK_SEGMENTS[(trackIdx + 1) % TRACK_SEGMENTS.length];

  const segOffset = currentSeg - currentSong.start;
  const intoSec = Math.floor(segOffset * SEGMENT_DURATION + (nowSec % SEGMENT_DURATION));
  const totalTrackSec = Math.floor((currentSong.end - currentSong.start + 1) * SEGMENT_DURATION);
  const remainingSec = Math.max(0, totalTrackSec - intoSec);

  // --- CONTENT-AWARE IMAGING & PRESENTER SELECTION ENGINE ---
  // Elements trigger ONLY at clean song transitions (when the current song just started, intoSec < 6).
  // They NEVER fire mid-song or over playing vocals.
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
    // 4. Content-Aware Presenter Links (Every 3rd song in commercial sweep)
    else if (trackIdx % 3 === 0) {
      if (currentShow.id === "breakfast") {
        const link = (trackIdx % 6 === 0) 
          ? { src: "/audio/presenters/callum_rhys_link_01.mp3", title: "Callum & Rhys Breakfast Link (Into Thunder Queen)" }
          : { src: "/audio/presenters/callum_rhys_link_02.mp3", title: "Callum & Rhys Breakfast Link (School Run Check)" };
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: link.src, title: link.title, context: `Breakfast link with Callum & Rhys heading into ${currentSong.title}` };
      } else if (currentShow.id === "days") {
        const link = (currentSong.artist.includes("Kayleigh"))
          ? { src: "/audio/presenters/sarah_quinn_link_01.mp3", title: "Sarah Quinn Daytime Link (Into Kayleigh Merez)" }
          : { src: "/audio/presenters/sarah_quinn_link_02.mp3", title: "Sarah Quinn Daytime Link (Into Leah Carter Sunshine)" };
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: link.src, title: link.title, context: `Days link with Sarah Quinn heading into ${currentSong.title}` };
      } else if (currentShow.id === "drive") {
        const link = (currentSong.artist.includes("Kayleigh"))
          ? { src: "/audio/presenters/owen_hart_link_02.mp3", title: "Owen Hart Drivetime Link (Into Cherry Red)" }
          : { src: "/audio/presenters/owen_hart_link_01.mp3", title: "Owen Hart Drivetime Link (Rush Hour Highway Check)" };
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: link.src, title: link.title, context: `Drive link with Owen Hart heading into ${currentSong.title}` };
      } else if (currentShow.id === "evenings") {
        const link = (currentSong.vibe === "rock")
          ? { src: "/audio/presenters/nia_brooks_link_01.mp3", title: "Nia Brooks Evenings Rock Link (Guitar Craft)" }
          : { src: "/audio/presenters/nia_brooks_link_02.mp3", title: "Nia Brooks Evenings Link (Leah Carter Grit)" };
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: link.src, title: link.title, context: `Evenings link with Nia Brooks heading into ${currentSong.title}` };
      } else if (currentShow.id === "late") {
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: "/audio/presenters/tom_hale_link_01.mp3", title: "Tom Hale Late Show Link (Midnight Unwind)", context: `Late show link with Tom Hale heading into ${currentSong.title}` };
      } else if (currentShow.id === "early") {
        cue = { id: `${joinId}_pres`, kind: "presenter_link", src: "/audio/presenters/maya_cole_link_01.mp3", title: "Maya Cole Early Show Link (Dawn Shift Check)", context: `Early show link with Maya Cole heading into ${currentSong.title}` };
      }
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
      "Cache-Control": "public, max-age=2, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
