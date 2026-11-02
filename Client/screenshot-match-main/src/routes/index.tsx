import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { CalendarIcon, Clock, Film, Ticket, Timer } from "lucide-react";
import { api, formatUAH } from "@/services/api";
import type { MovieSessionDto } from "@/lib/types";
import heroImg from "@/assets/hero-desert.jpg";
import { Poster } from "@/components/Poster";
import { SeatPicker } from "@/components/SeatPicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CinemaHub — Now Showing & Booking" },
      { name: "description", content: "See what's on at CinemaHub and book your seats in seconds." },
      { property: "og:title", content: "CinemaHub — Now Showing & Booking" },
      { property: "og:description", content: "See what's on and book your seats in seconds." },
    ],
  }),
  component: ShowcasePage,
});

function ShowcasePage() {
  const [genre, setGenre] = useState("all");
  const [date, setDate] = useState<Date | undefined>();
  const [vipOnly, setVipOnly] = useState(false);
  const [picked, setPicked] = useState<MovieSessionDto | null>(null);

  const { data: movies = [] } = useQuery({ queryKey: ["movies"], queryFn: api.getMovies });
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", vipOnly],
    queryFn: () => api.getSessions(vipOnly ? { isVip: true } : {}),
  });

  const genres = [...new Set(movies.map((m) => m.GenreName))];
  const featured = movies.filter((m) => m.Featured);
  const list = (sessions ?? []).filter(
    (s) => (genre === "all" || s.GenreName === genre) && (!date || isSameDay(new Date(s.StartTime), date)),
  );
  const firstSessionOf = (id: number) => (sessions ?? []).find((s) => s.MovieID === id);

  return (
    <>
      <section className="relative -mx-4 -mt-6 mb-8 overflow-hidden md:-mx-10 md:-mt-10">
        <img src={heroImg} alt="Desert planet at dusk" width={1920} height={800} className="h-[420px] w-full object-cover md:h-[480px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-8 md:px-10 md:pb-10">
          <Badge className="mb-3 bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/15"><Film className="size-3" /> Featured this week</Badge>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
            {featured.map((m, i) => {
              const s = firstSessionOf(m.MovieID);
              return (
                <div key={m.MovieID} className={`animate-rise ${i > 0 ? "lg:border-l lg:pl-6" : ""}`} style={{ animationDelay: `${i * 120}ms` }}>
                  <h2 className={`${i === 0 ? "text-5xl md:text-6xl" : "text-3xl"} font-bold tracking-tight`}>{m.Title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{m.GenreName} · {m.DurationMin} min · {m.AgeRating} — {m.Tagline}</p>
                  {s && (
                    <Button className="mt-4" size={i === 0 ? "lg" : "default"} variant={i === 0 ? "default" : "outline"} onClick={() => setPicked(s)}>
                      <Ticket /> Book {format(new Date(s.StartTime), "dd.MM HH:mm")}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="glass mb-6 flex flex-wrap items-center gap-3 p-4 animate-rise">
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genres</SelectItem>
            {genres.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[190px] justify-start">
              <CalendarIcon /> {date ? format(date, "dd.MM.yyyy") : "Any date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2">
          <Switch id="vip" checked={vipOnly} onCheckedChange={setVipOnly} />
          <Label htmlFor="vip" className="text-sm">VIP halls only</Label>
        </div>
        {(genre !== "all" || date || vipOnly) && (
          <Button variant="ghost" size="sm" onClick={() => { setGenre("all"); setDate(undefined); setVipOnly(false); }}>Reset</Button>
        )}
        <span className="ml-auto text-sm text-muted-foreground">{list.length} sessions</span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        {list.map((s, i) => {
          const occ = Math.round((s.SoldSeats / s.Capacity) * 100);
          return (
            <article key={s.SessionID} className="glass glass-hover flex overflow-hidden animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
              <Poster movieId={s.MovieID} title={s.Title} className="w-32 shrink-0" />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{s.Title}</h3>
                  <Badge variant={s.AgeRating === "18+" ? "destructive" : "secondary"} className="font-mono">{s.AgeRating}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-neon-violet">{s.GenreName}</p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Clock className="size-3.5" />{format(new Date(s.StartTime), "dd.MM · HH:mm")}</p>
                  <p className="flex items-center gap-1.5"><Timer className="size-3.5" />{s.DurationMin} min</p>
                  <p className="flex items-center gap-1.5">
                    {s.HallName}
                    {s.IsVIP && <Badge className="h-4 bg-neon-amber/15 px-1.5 text-[10px] text-neon-amber hover:bg-neon-amber/15">VIP</Badge>}
                  </p>
                </div>
                <Progress value={occ} className="mt-3 h-1" />
                <p className="mt-1 text-[10px] text-muted-foreground">{s.Capacity - s.SoldSeats} seats left</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="font-mono text-lg font-semibold text-neon-cyan">{formatUAH(s.TicketPrice)}</span>
                  <Button size="sm" disabled={s.SoldSeats >= s.Capacity} onClick={() => setPicked(s)}>Choose seats</Button>
                </div>
              </div>
            </article>
          );
        })}
        {!isLoading && list.length === 0 && <p className="text-muted-foreground">No sessions match these filters.</p>}
      </div>
      <SeatPicker session={picked} onClose={() => setPicked(null)} />
    </>
  );
}
