import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Kpi, PageHeader } from "@/components/AppShell";
import { api, formatUAH } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Box Office Analytics — CinemaHub" },
      { name: "description", content: "Gross revenue, tickets sold and hall occupancy at CinemaHub." },
      { property: "og:title", content: "Box Office Analytics — CinemaHub" },
      { property: "og:description", content: "Gross revenue, tickets sold and hall occupancy." },
    ],
  }),
  component: AnalyticsPage,
});

const HIGHLIGHT_ABOVE = 300;

function AnalyticsPage() {
  const { data } = useQuery({ queryKey: ["analytics"], queryFn: api.getRevenueAnalytics });
  const movies = data?.Movies ?? [];
  const halls = (data?.Halls ?? []).map((h) => ({ ...h, Pct: Math.round((h.Booked / h.Capacity) * 100) }));
  const gross = movies.reduce((a, r) => a + r.TotalRevenue, 0);
  const sold = movies.reduce((a, r) => a + r.SoldTickets, 0);
  const cap = halls.reduce((a, h) => a + h.Capacity, 0);
  const booked = halls.reduce((a, h) => a + h.Booked, 0);

  return (
    <>
      <PageHeader title="Box Office Analytics" subtitle="Revenue grouped by movie and hall occupancy" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Kpi label="Gross Revenue" value={formatUAH(gross)} accent="cyan" />
        <Kpi label="Tickets Sold" value={sold.toLocaleString("uk-UA")} accent="violet" />
        <Kpi label="Occupancy Rate" value={`${cap ? Math.round((booked / cap) * 100) : 0}%`} accent="emerald" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="glass overflow-hidden animate-rise">
          <h2 className="border-b px-5 py-4 font-semibold">Revenue by movie</h2>
          <Table>
            <TableHeader><TableRow><TableHead>Movie</TableHead><TableHead className="text-right">Tickets</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
            <TableBody>
              {movies.map((r) => {
                const hot = r.TotalRevenue > HIGHLIGHT_ABOVE;
                return (
                  <TableRow key={r.Title} className={hot ? "bg-neon-emerald/5" : "opacity-60"}>
                    <TableCell className="font-medium">
                      {r.Title} {hot && <Badge className="ml-2 bg-neon-emerald/15 text-neon-emerald hover:bg-neon-emerald/15">&gt; 300 ₴</Badge>}
                    </TableCell>
                    <TableCell className="text-right font-mono">{r.SoldTickets.toLocaleString("uk-UA")}</TableCell>
                    <TableCell className={`text-right font-mono ${hot ? "text-neon-emerald" : ""}`}>{formatUAH(r.TotalRevenue)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
        <section className="glass p-5 animate-rise">
          <h2 className="mb-4 font-semibold">Hall occupancy</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={halls} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="var(--border)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis type="category" dataKey="HallName" width={130} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: "var(--accent)" }}
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }}
                  formatter={(v: number, _n, p) => [`${v}% (${p.payload.Booked}/${p.payload.Capacity})`, "Booked"]}
                />
                <Bar dataKey="Pct" radius={[0, 6, 6, 0]}>
                  {halls.map((h) => (
                    <Cell key={h.HallName} fill={h.Pct >= 80 ? "var(--neon-emerald)" : h.Pct >= 50 ? "var(--neon-cyan)" : "var(--neon-violet)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  );
}
