import type {
  BookTicketsRequest,
  BookTicketsResponse,
  ExecutiveDashboardDto,
  MovieDto,
  MovieSessionDto,
  PromoResultDto,
  RevenueAnalyticsDto,
  RevenueReportDto,
  TicketItemDto,
} from "@/lib/types";

/**
 * CinemaHub API client (fetch). Flip USE_MOCK to false to call the real
 * ASP.NET Core Web API at API_BASE. Mock tables mirror CinemaHub_DB.
 */
export const API_BASE = "http://localhost:5000/api";
const USE_MOCK = true;

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { "Content-Type": "application/json" }, ...init });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}
const delay = <T,>(v: T, ms = 300) => new Promise<T>((r) => setTimeout(() => r(structuredClone(v)), ms));

export const ANIMATION_GENRE = "Анімація та Сімейні";

// --- Seat layout shared by UI and mock ---
export const SEAT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
export const SEATS_PER_ROW = 12;
export const VIP_ROWS = ["G", "H"];
export const VIP_SEAT_MULTIPLIER = 1.5;
export const seatPrice = (base: number, seat: string) =>
  VIP_ROWS.includes(seat.split("-")[0] ?? "") ? Math.round(base * VIP_SEAT_MULTIPLIER) : base;

const allSeats = SEAT_ROWS.flatMap((r) => Array.from({ length: SEATS_PER_ROW }, (_, i) => `${r}-${i + 1}`));
const pickTaken = (seed: number, ratio: number) =>
  allSeats.filter((_, i) => ((i * 7919 + seed * 104729) % 100) / 100 < ratio);

// --- Mock tables ---
const movies: MovieDto[] = [
  { MovieID: 1, Title: "Dune 2", GenreName: "Фантастика", DurationMin: 166, AgeRating: "12+", Featured: true, Tagline: "Long live the fighters." },
  { MovieID: 2, Title: "Deadpool & Wolverine", GenreName: "Бойовик", DurationMin: 128, AgeRating: "18+", Featured: true, Tagline: "Come together." },
  { MovieID: 3, Title: "Kung Fu Panda 4", GenreName: ANIMATION_GENRE, DurationMin: 94, AgeRating: "0+", Featured: false, Tagline: "" },
  { MovieID: 4, Title: "Inside Out 2", GenreName: ANIMATION_GENRE, DurationMin: 96, AgeRating: "0+", Featured: false, Tagline: "" },
  { MovieID: 5, Title: "Oppenheimer", GenreName: "Драма", DurationMin: 180, AgeRating: "16+", Featured: false, Tagline: "" },
  { MovieID: 6, Title: "Alien: Romulus", GenreName: "Жахи", DurationMin: 119, AgeRating: "18+", Featured: false, Tagline: "" },
];

const today = new Date();
const at = (d: number, h: number, m = 0) => {
  const x = new Date(today);
  x.setDate(x.getDate() + d);
  x.setHours(h, m, 0, 0);
  return x.toISOString();
};
const halls = {
  imax: { HallName: "IMAX Aurora", IsVIP: true },
  vip: { HallName: "VIP Lounge Eclipse", IsVIP: true },
  h1: { HallName: "Hall 1 · Orbit", IsVIP: false },
  h2: { HallName: "Hall 2 · Nova", IsVIP: false },
  h3: { HallName: "Hall 3 · Lumen", IsVIP: false },
};
const raw: [number, number, keyof typeof halls, string, number][] = [
  [101, 1, "imax", at(0, 19, 30), 380],
  [102, 3, "h2", at(0, 11, 0), 160],
  [103, 2, "h1", at(0, 21, 15), 240],
  [104, 4, "h3", at(0, 14, 30), 180],
  [105, 5, "vip", at(0, 20, 0), 520],
  [106, 6, "h1", at(1, 22, 45), 220],
  [107, 3, "h2", at(1, 12, 15), 170],
  [108, 2, "imax", at(1, 18, 30), 340],
  [109, 4, "h3", at(2, 16, 0), 150],
  [110, 1, "vip", at(2, 19, 0), 480],
];
let sessions: MovieSessionDto[] = raw.map(([id, mid, h, start, price], i) => {
  const m = movies.find((x) => x.MovieID === mid)!;
  const taken = pickTaken(id, [0.85, 0.5, 0.9, 0.7, 0.95, 0.35, 0.8, 0.6, 0.25, 0.75][i] ?? 0.5);
  return {
    SessionID: id, MovieID: mid, Title: m.Title, GenreName: m.GenreName, AgeRating: m.AgeRating, DurationMin: m.DurationMin,
    ...halls[h], Capacity: allSeats.length, SoldSeats: taken.length, TakenSeats: taken, StartTime: start, TicketPrice: price,
  };
});

const revenueBase: RevenueReportDto[] = [
  { Title: "Dune 2", SoldTickets: 1842, TotalRevenue: 699960 },
  { Title: "Deadpool & Wolverine", SoldTickets: 1510, TotalRevenue: 362400 },
  { Title: "Oppenheimer", SoldTickets: 412, TotalRevenue: 214240 },
  { Title: "Kung Fu Panda 4", SoldTickets: 980, TotalRevenue: 156800 },
  { Title: "Inside Out 2", SoldTickets: 870, TotalRevenue: 156600 },
  { Title: "Alien: Romulus", SoldTickets: 540, TotalRevenue: 118800 },
  { Title: "Short Film Night", SoldTickets: 2, TotalRevenue: 240 },
];

const matrices: ExecutiveDashboardDto = {
  HallsRevenue: [
    { HallName: "IMAX Aurora", IsVIP: true, SoldTickets: 3047, TotalRevenue: 1109660 },
    { HallName: "VIP Lounge Eclipse", IsVIP: true, SoldTickets: 710, TotalRevenue: 357280 },
    { HallName: "Hall 1 · Orbit", IsVIP: false, SoldTickets: 2050, TotalRevenue: 481200 },
    { HallName: "Hall 2 · Nova", IsVIP: false, SoldTickets: 1740, TotalRevenue: 286000 },
    { HallName: "Hall 3 · Lumen", IsVIP: false, SoldTickets: 872, TotalRevenue: 156900 },
  ],
  GenresRevenue: [
    { GenreName: "Фантастика", MoviesCount: 1, TicketsCount: 1842, GrossRevenue: 699960 },
    { GenreName: "Бойовик", MoviesCount: 1, TicketsCount: 1510, GrossRevenue: 362400 },
    { GenreName: ANIMATION_GENRE, MoviesCount: 2, TicketsCount: 1850, GrossRevenue: 313400 },
    { GenreName: "Драма", MoviesCount: 1, TicketsCount: 412, GrossRevenue: 214240 },
    { GenreName: "Жахи", MoviesCount: 1, TicketsCount: 540, GrossRevenue: 118800 },
  ],
  TopBarItems: [
    { Rank: 1, ItemName: "Попкорн карамельний XL", Category: "Popcorn", SoldQuantity: 4210, GrossRevenue: 589400 },
    { Rank: 2, ItemName: "Coca-Cola 0.75L", Category: "Drinks", SoldQuantity: 5120, GrossRevenue: 409600 },
    { Rank: 3, ItemName: "Начос із сирним соусом", Category: "Snacks", SoldQuantity: 2380, GrossRevenue: 285600 },
    { Rank: 4, ItemName: "Попкорн солоний L", Category: "Popcorn", SoldQuantity: 2950, GrossRevenue: 265500 },
    { Rank: 5, ItemName: "Лимонад манго 0.5L", Category: "Drinks", SoldQuantity: 1870, GrossRevenue: 149600 },
  ],
};

const names = ["Олена Коваленко", "Андрій Шевченко", "Марія Бондаренко", "Дмитро Мельник", "Ірина Ткаченко", "Сергій Кравченко", "Наталія Олійник", "Тарас Лисенко", "Юлія Савченко", "Олег Руденко"];
let nextTicketId = 60000;
const tickets: TicketItemDto[] = names.map((n, i) => {
  const s = sessions[i % sessions.length]!;
  const p = new Date(today);
  p.setDate(p.getDate() - (i % 6));
  return {
    TicketID: 50231 + i * 7, MovieTitle: s.Title, SessionStart: s.StartTime, CustomerName: n,
    CustomerPhone: `+38${["097", "067", "050", "063", "093"][i % 5]}${String(1000000 + i * 734521).slice(-7)}`,
    SeatNumber: s.TakenSeats[i] ?? "A-1", PurchaseDate: p.toISOString(), IsPaid: i % 4 !== 2,
  };
});

// --- Helpers ---
export const maskPhone = (p: string) => (p.length > 9 ? p.slice(0, 6) + "******" + p.slice(-3) : p);
export const formatUAH = (v: number) => `${Math.round(v).toLocaleString("uk-UA")} ₴`;

function repriceWhere(match: (s: MovieSessionDto) => boolean, factor: number): PromoResultDto[] {
  const out: PromoResultDto[] = [];
  sessions = sessions.map((s) => {
    if (!match(s)) return s;
    const NewPrice = Math.round(s.TicketPrice * factor);
    out.push({ SessionID: s.SessionID, Title: s.Title, StartTime: s.StartTime, OldPrice: s.TicketPrice, NewPrice });
    return { ...s, TicketPrice: NewPrice };
  });
  return out;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

// --- Endpoints ---
export const api = {
  /** GET /api/movies */
  getMovies: (): Promise<MovieDto[]> => (USE_MOCK ? delay(movies) : http("/movies")),

  /** GET /api/sessions?isVip=false */
  getSessions: (q: { isVip?: boolean | undefined } = {}): Promise<MovieSessionDto[]> =>
    USE_MOCK
      ? delay(sessions.filter((s) => q.isVip === undefined || s.IsVIP === q.isVip))
      : http(`/sessions${q.isVip === undefined ? "" : `?isVip=${q.isVip}`}`),

  /** POST /api/tickets/book */
  bookTickets: async (req: BookTicketsRequest): Promise<BookTicketsResponse> => {
    if (!USE_MOCK) return http("/tickets/book", { method: "POST", body: JSON.stringify(req) });
    const s = sessions.find((x) => x.SessionID === req.SessionID);
    if (!s) throw new Error("Session not found");
    if (req.Seats.some((seat) => s.TakenSeats.includes(seat))) throw new Error("Some seats were just taken");
    s.TakenSeats = [...s.TakenSeats, ...req.Seats];
    s.SoldSeats = s.TakenSeats.length;
    const ids = req.Seats.map((seat) => {
      const TicketID = nextTicketId++;
      tickets.unshift({
        TicketID, MovieTitle: s.Title, SessionStart: s.StartTime, CustomerName: req.CustomerName,
        CustomerPhone: req.CustomerPhone, SeatNumber: seat, PurchaseDate: new Date().toISOString(), IsPaid: true,
      });
      return TicketID;
    });
    return delay({ TicketIDs: ids, TotalPaid: req.Seats.reduce((a, seat) => a + seatPrice(s.TicketPrice, seat), 0) }, 700);
  },

  /** GET /api/analytics/revenue */
  getRevenueAnalytics: (): Promise<RevenueAnalyticsDto> => {
    if (!USE_MOCK) return http("/analytics/revenue");
    const byHall = new Map<string, { Capacity: number; Booked: number }>();
    for (const s of sessions) {
      const h = byHall.get(s.HallName) ?? { Capacity: 0, Booked: 0 };
      h.Capacity += s.Capacity;
      h.Booked += s.SoldSeats;
      byHall.set(s.HallName, h);
    }
    return delay({ Movies: revenueBase, Halls: [...byHall].map(([HallName, v]) => ({ HallName, ...v })) });
  },

  /** GET /api/dashboard/matrices */
  getMatrices: (): Promise<ExecutiveDashboardDto> => (USE_MOCK ? delay(matrices) : http("/dashboard/matrices")),

  /** GET /api/dashboard/export-excel (file download) */
  exportExcel: async (): Promise<void> => {
    const filename = `CinemaHub_Matrices_${new Date().toISOString().slice(0, 10)}.xlsx`;
    if (!USE_MOCK) {
      const res = await fetch(`${API_BASE}/dashboard/export-excel`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      return downloadBlob(await res.blob(), filename);
    }
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matrices.HallsRevenue), "Halls");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matrices.GenresRevenue), "Genres");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matrices.TopBarItems), "Bar Top-5");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
    await delay(null, 600);
    downloadBlob(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
  },

  /** POST /api/promo/animation-discount — UPDATE price * 0.8 for animation */
  applyAnimationDiscount: (): Promise<PromoResultDto[]> =>
    USE_MOCK ? delay(repriceWhere((s) => s.GenreName === ANIMATION_GENRE, 0.8), 600) : http("/promo/animation-discount", { method: "POST" }),

  /** POST /api/promo/evening-surcharge — +15% for sessions from 18:00 */
  applyEveningSurcharge: (): Promise<PromoResultDto[]> =>
    USE_MOCK ? delay(repriceWhere((s) => new Date(s.StartTime).getHours() >= 18, 1.15), 600) : http("/promo/evening-surcharge", { method: "POST" }),

  /** GET /api/tickets/search?client=...&from=...&to=... */
  searchTickets: (q: { client?: string; from?: Date | undefined; to?: Date | undefined } = {}): Promise<TicketItemDto[]> => {
    if (!USE_MOCK) {
      const p = new URLSearchParams();
      if (q.client) p.set("client", q.client);
      if (q.from) p.set("from", q.from.toISOString());
      if (q.to) p.set("to", q.to.toISOString());
      return http(`/tickets/search?${p}`);
    }
    const from = q.from ? new Date(new Date(q.from).setHours(0, 0, 0, 0)) : null;
    const to = q.to ? new Date(new Date(q.to).setHours(23, 59, 59, 999)) : null;
    return delay(
      tickets.filter((t) => {
        const d = new Date(t.PurchaseDate);
        return (!q.client || t.CustomerName.toLowerCase().includes(q.client.toLowerCase())) && (!from || d >= from) && (!to || d <= to);
      }),
      200,
    );
  },
};
