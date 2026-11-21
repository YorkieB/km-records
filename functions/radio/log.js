import { TOTAL_SEGMENTS, SEGMENT_DURATION, CYCLE_DURATION, TRACK_SEGMENTS, SHOWS, getShowAt, formatUKTime, formatUKDate, formatDuration } from "./_segments.js";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const format = url.searchParams.get("format") || "json";
  const limit = Math.min(200, Math.max(10, parseInt(url.searchParams.get("limit") || "60", 10)));
  const filterType = url.searchParams.get("filter") || "all"; // all, songs, idents, djs

  const nowSec = Math.floor(Date.now() / 1000);

  // Determine current cycle and sequence matching /radio/live.js
  const seq = Math.floor(nowSec / SEGMENT_DURATION);
  const currentSeg = (seq % TOTAL_SEGMENTS) + 1;
  const currentCycle = Math.floor(seq / TOTAL_SEGMENTS);

  // Find index of track currently on air
  let currentTrackIdx = TRACK_SEGMENTS.findIndex(t => currentSeg >= t.start && currentSeg <= t.end);
  if (currentTrackIdx === -1) currentTrackIdx = 0;

  // We build a timeline of past and upcoming songs based on physical segments
  const pastCount = Math.floor(limit * 0.6);
  const futureCount = limit - pastCount;
  const startGlobalIdx = currentCycle * TRACK_SEGMENTS.length + currentTrackIdx - pastCount;
  const endGlobalIdx = currentCycle * TRACK_SEGMENTS.length + currentTrackIdx + futureCount;

  const events = [];

  for (let gIdx = startGlobalIdx; gIdx <= endGlobalIdx; gIdx++) {
    const cycle = Math.floor(gIdx / TRACK_SEGMENTS.length);
    const tIdx = ((gIdx % TRACK_SEGMENTS.length) + TRACK_SEGMENTS.length) % TRACK_SEGMENTS.length;
    const song = TRACK_SEGMENTS[tIdx];

    const songSegStart = cycle * TOTAL_SEGMENTS + (song.start - 1);
    const songSegEnd = cycle * TOTAL_SEGMENTS + song.end;

    const songStartSec = Math.floor(songSegStart * SEGMENT_DURATION);
    const songFinishSec = Math.floor(songSegEnd * SEGMENT_DURATION);
    const songDurSec = songFinishSec - songStartSec;

    const show = getShowAt(songStartSec);
    const d = new Date(songStartSec * 1000);
    const minute = parseInt(d.toLocaleTimeString("en-GB", { timeZone: "Europe/London", minute: "2-digit" }), 10);
    const weekdayStr = d.toLocaleDateString("en-GB", { timeZone: "Europe/London", weekday: "long" });
    const isWeekend = weekdayStr === "Saturday" || weekdayStr === "Sunday";

    // Check if an Imaging Element (Ident / DJ link) occurs at this song boundary
    // 1. Top of the Hour Ident
    if (minute >= 58 || minute <= 1) {
      const dur = 18;
      const identStartSec = songStartSec;
      const identFinishSec = identStartSec + dur;
      events.push({
        id: `ident_${gIdx}_toh_start`,
        timestamp: identStartSec,
        time: formatUKTime(identStartSec),
        date: formatUKDate(identStartSec),
        type: "IDENT_START",
        category: "Station Ident",
        title: "Nationwide Top of the Hour Ident (London to Penzance)",
        artist: "KM Radio Station Imaging",
        duration: "18s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
      events.push({
        id: `ident_${gIdx}_toh_end`,
        timestamp: identFinishSec,
        time: formatUKTime(identFinishSec),
        date: formatUKDate(identFinishSec),
        type: "IDENT_FINISH",
        category: "Station Ident",
        title: "Nationwide Top of the Hour Ident (London to Penzance)",
        artist: "KM Radio Station Imaging",
        duration: "18s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
    }
    // 2. Bottom of the Hour Variety Promise Ident
    else if (minute >= 28 && minute <= 31) {
      const dur = 12;
      const identStartSec = songStartSec;
      const identFinishSec = identStartSec + dur;
      events.push({
        id: `ident_${gIdx}_var_start`,
        timestamp: identStartSec,
        time: formatUKTime(identStartSec),
        date: formatUKDate(identStartSec),
        type: "IDENT_START",
        category: "Station Ident",
        title: "Non-Stop Variety Promise Ident",
        artist: "KM Radio Station Imaging",
        duration: "12s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
      events.push({
        id: `ident_${gIdx}_var_end`,
        timestamp: identFinishSec,
        time: formatUKTime(identFinishSec),
        date: formatUKDate(identFinishSec),
        type: "IDENT_FINISH",
        category: "Station Ident",
        title: "Non-Stop Variety Promise Ident",
        artist: "KM Radio Station Imaging",
        duration: "12s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
    }
    // 3. Weekend Feel-Good Ident
    else if (isWeekend && (tIdx % 4 === 1)) {
      const dur = 10;
      const identStartSec = songStartSec;
      const identFinishSec = identStartSec + dur;
      events.push({
        id: `ident_${gIdx}_wknd_start`,
        timestamp: identStartSec,
        time: formatUKTime(identStartSec),
        date: formatUKDate(identStartSec),
        type: "IDENT_START",
        category: "Station Ident",
        title: "Weekend Feel-Good Station Ident",
        artist: "KM Radio Station Imaging",
        duration: "10s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
      events.push({
        id: `ident_${gIdx}_wknd_end`,
        timestamp: identFinishSec,
        time: formatUKTime(identFinishSec),
        date: formatUKDate(identFinishSec),
        type: "IDENT_FINISH",
        category: "Station Ident",
        title: "Weekend Feel-Good Station Ident",
        artist: "KM Radio Station Imaging",
        duration: "10s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
    }
    // 4. Deterministic Randomizer for Commercial Sweeps (1, 2, or 3 songs, Outro vs Intro)
    // Using 32-bit Murmur-style integer hash of global song sequence
    let h = ((gIdx ^ 0x5bf03635) >>> 0);
    h = Math.imul((h >>> 16) ^ h, 0x45d9f3b) >>> 0;
    h = Math.imul((h >>> 16) ^ h, 0x45d9f3b) >>> 0;
    const isPresenterSlot = ((h % 100) < 45); // ~45% of transitions (1 to 3 songs)
    const isOutro = (((h >>> 8) % 2) === 0);

    if (isPresenterSlot) {
      const dur = 14;
      const timingLabel = isOutro ? "Song Outro" : "Intro Ramp";
      let linkTitle = `${show.presenter} On-Air Dry Link (${timingLabel} into ${song.title})`;
      if (show.id === "breakfast") linkTitle = `Callum & Rhys Breakfast Link (${timingLabel} into ${song.title})`;
      else if (show.id === "days") linkTitle = `Sarah Quinn Daytime Link (${timingLabel} into ${song.title})`;
      else if (show.id === "drive") linkTitle = `Owen Hart Drivetime Link (${timingLabel} into ${song.title})`;
      else if (show.id === "evenings") linkTitle = `Nia Brooks Evenings Rock Link (${timingLabel} into ${song.title})`;
      else if (show.id === "late") linkTitle = `Tom Hale Late Show Unwind (${timingLabel} into ${song.title})`;
      else if (show.id === "early") linkTitle = `Maya Cole Early Dawn Companion (${timingLabel} into ${song.title})`;

      const djStartSec = isOutro ? Math.max(0, songStartSec - 8) : songStartSec;
      const djFinishSec = djStartSec + dur;

      events.push({
        id: `dj_${gIdx}_start`,
        timestamp: djStartSec,
        time: formatUKTime(djStartSec),
        date: formatUKDate(djStartSec),
        type: "DJ_START",
        category: "Presenter Link",
        title: linkTitle,
        artist: show.presenter,
        duration: "14s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
      events.push({
        id: `dj_${gIdx}_end`,
        timestamp: djFinishSec,
        time: formatUKTime(djFinishSec),
        date: formatUKDate(djFinishSec),
        type: "DJ_FINISH",
        category: "Presenter Link",
        title: linkTitle,
        artist: show.presenter,
        duration: "14s",
        durationSec: dur,
        show: show.title,
        presenter: show.presenter
      });
    }

    // Now the Song Transmission Event
    events.push({
      id: `song_${gIdx}_start`,
      timestamp: songStartSec,
      time: formatUKTime(songStartSec),
      date: formatUKDate(songStartSec),
      type: "SONG_START",
      category: "Music",
      title: song.title,
      artist: song.artist,
      duration: formatDuration(songDurSec),
      durationSec: songDurSec,
      vibe: song.vibe,
      show: show.title,
      presenter: show.presenter,
      segmentRange: `s${String(song.start).padStart(4, "0")}.ts - s${String(song.end).padStart(4, "0")}.ts`
    });

    events.push({
      id: `song_${gIdx}_finish`,
      timestamp: songFinishSec,
      time: formatUKTime(songFinishSec),
      date: formatUKDate(songFinishSec),
      type: "SONG_FINISH",
      category: "Music",
      title: song.title,
      artist: song.artist,
      duration: formatDuration(songDurSec),
      durationSec: songDurSec,
      vibe: song.vibe,
      show: show.title,
      presenter: show.presenter,
      segmentRange: `s${String(song.start).padStart(4, "0")}.ts - s${String(song.end).padStart(4, "0")}.ts`
    });
  }

  // Sort events chronologically
  events.sort((a, b) => a.timestamp - b.timestamp);

  // Annotate live status
  events.forEach(e => {
    if (e.timestamp + e.durationSec <= nowSec) {
      e.status = "COMPLETED";
    } else if (e.timestamp <= nowSec && nowSec < e.timestamp + e.durationSec) {
      e.status = "ON AIR";
    } else {
      e.status = "UPCOMING";
    }
  });

  // Apply category filter if requested
  let filtered = events;
  if (filterType === "songs") {
    filtered = events.filter(e => e.type.startsWith("SONG"));
  } else if (filterType === "djs") {
    filtered = events.filter(e => e.type.startsWith("DJ"));
  } else if (filterType === "idents") {
    filtered = events.filter(e => e.type.startsWith("IDENT") || e.category === "Station Ident");
  }

  // Return CSV export if requested
  if (format === "csv") {
    const csvHeader = "Timestamp (UK),Date,Event Type,Category,Item Title,Artist / Presenter,Show,Duration,Status,Segments\n";
    const csvRows = filtered.map(e => {
      const escape = s => `"${(s || "").toString().replace(/"/g, '""')}"`;
      return [
        escape(e.time),
        escape(e.date),
        escape(e.type),
        escape(e.category),
        escape(e.title),
        escape(e.artist),
        escape(e.show),
        escape(e.duration),
        escape(e.status),
        escape(e.segmentRange || "")
      ].join(",");
    }).join("\n");

    const todayDate = new Date().toISOString().slice(0, 10);
    return new Response(csvHeader + csvRows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="km_radio_transmission_log_${todayDate}.csv"`,
        "Cache-Control": "public, max-age=5, must-revalidate",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  // Return JSON format
  const currentShow = getShowAt(nowSec);
  const responseData = {
    station: "KM Radio UK",
    url: "https://www.kmrecords.uk",
    generatedAt: new Date(nowSec * 1000).toISOString(),
    currentClock: formatUKTime(nowSec),
    currentDate: formatUKDate(nowSec),
    currentSegment: currentSeg,
    totalSegments: TOTAL_SEGMENTS,
    currentShow: {
      title: currentShow.title,
      presenter: currentShow.presenter
    },
    totalEvents: filtered.length,
    events: filtered
  };

  return new Response(JSON.stringify(responseData, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
