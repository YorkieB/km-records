export async function onRequest(context) {
  const CATALOGUE = [
    { title: "Thunder Queen", artist: "Kayleigh Merez" },
    { title: "The Highway Don't Lie", artist: "Leah Carter" },
    { title: "Wrong Kind of Right", artist: "Kayleigh Merez" },
    { title: "The Ranch", artist: "Leah Carter" },
    { title: "Lola's the Fire in the Wire", artist: "Kayleigh Merez" },
    { title: "Calluses on These Hands", artist: "Leah Carter" },
    { title: "No Encore", artist: "Kayleigh Merez" },
    { title: "Whiskey on a Wednesday", artist: "Leah Carter" },
    { title: "Call It What It Is", artist: "Kayleigh Merez" },
    { title: "Same Old Shadow", artist: "Leah Carter" },
    { title: "No Warm Up", artist: "Kayleigh Merez" },
    { title: "My Own Two Feet", artist: "Leah Carter" },
    { title: "Not Half", artist: "Kayleigh Merez" },
    { title: "The Last Good Year", artist: "Leah Carter" },
    { title: "Play It Twice", artist: "Kayleigh Merez" },
    { title: "Not That Girl", artist: "Leah Carter" },
    { title: "Same Old Road", artist: "Kayleigh Merez" },
    { title: "Never Say My Name", artist: "Leah Carter" },
    { title: "All the Way Home", artist: "Kayleigh Merez" },
    { title: "Let It Ring", artist: "Leah Carter" },
    { title: "Down the Front", artist: "Kayleigh Merez" },
    { title: "Come Back Louder", artist: "Leah Carter" },
    { title: "Play the Whole Thing", artist: "Kayleigh Merez" },
    { title: "We Already Know", artist: "Kayleigh Merez" }
  ];

  const SHOWS = [
    { start: 6, end: 10, id: "breakfast", title: "Breakfast", presenter: "Calum Reed" },
    { start: 10, end: 15, id: "days", title: "Days", presenter: "Sarah Quinn" },
    { start: 15, end: 19, id: "drive", title: "Drive", presenter: "Owen Hart" },
    { start: 19, end: 23, id: "evenings", title: "Evenings", presenter: "Nia Brooks" },
    { start: 23, end: 27, id: "late", title: "Late", presenter: "Tom Hale" },
    { start: 3, end: 6, id: "early", title: "Early", presenter: "Maya Cole" }
  ];

  const now = new Date();
  const londonDateStr = now.toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "long" });
  const weekdayStr = now.toLocaleDateString("en-GB", { timeZone: "Europe/London", weekday: "long" });
  const clockStr = now.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
  const parts = clockStr.split(":");
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);

  let currentShow = SHOWS.find(s => {
    if (s.start <= s.end) return hour >= s.start && hour < s.end;
    return hour >= s.start || hour < (s.end % 24);
  }) || SHOWS[0];

  const nowSec = Math.floor(now.getTime() / 1000);
  const songPeriod = 210;
  const songIdx = Math.floor(nowSec / songPeriod) % CATALOGUE.length;
  const currentSong = CATALOGUE[songIdx];
  const nextSong = CATALOGUE[(songIdx + 1) % CATALOGUE.length];
  const intoSec = nowSec % songPeriod;

  const data = {
    timezone: "Europe/London",
    hour,
    minute,
    clock: clockStr,
    weekday: weekdayStr,
    date: londonDateStr,
    id: currentShow.id,
    title: currentShow.title,
    presenter: currentShow.presenter,
    onAir: `KM Records — ${currentShow.title} with ${currentShow.presenter}`,
    live: {
      weather: {
        place: "London",
        weather: "clear, about 8 degrees"
      },
      catalogue: {
        title: currentSong.title,
        artist: currentSong.artist,
        into: intoSec,
        next: {
          title: nextSong.title,
          artist: nextSong.artist
        }
      }
    }
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=2, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
