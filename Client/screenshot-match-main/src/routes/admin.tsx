import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Moon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { ANIMATION_GENRE, api, formatUAH } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Actions & Promo — CinemaHub" },
      { name: "description", content: "Apply animation discounts and evening surcharges to session prices." },
      { property: "og:title", content: "Admin Actions & Promo — CinemaHub" },
      { property: "og:description", content: "Animation discounts and evening surcharges." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const { data: sessions = [] } = useQuery({ queryKey: ["sessions", false], queryFn: () => api.getSessions() });
  const [busy, setBusy] = useState<"anim" | "eve" | null>(null);
  const [changed, setChanged] = useState<Record<number, number>>({}); // SessionID -> previous price

  const run = async (kind: "anim" | "eve") => {
    setBusy(kind);
    try {
      const res = kind === "anim" ? await api.applyAnimationDiscount() : await api.applyEveningSurcharge();
      setChanged(Object.fromEntries(res.map((r) => [r.SessionID, r.OldPrice])));
      await qc.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(kind === "anim" ? "Promo applied: 20% animation discount saved" : "Evening surcharge applied: +15% saved", {
        description: `${res.length} sessions updated`,
      });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const animCount = sessions.filter((s) => s.GenreName === ANIMATION_GENRE).length;
  const eveCount = sessions.filter((s) => new Date(s.StartTime).getHours() >= 18).length;

  return (
    <>
      <PageHeader title="Admin Actions & Promo" subtitle="Bulk price updates — the table below refreshes live" />
      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <div className="glass glass-hover relative overflow-hidden p-6 animate-rise">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-neon-violet opacity-25 blur-3xl" />
          <Sparkles className="size-6 text-neon-violet" />
          <h2 className="mt-3 text-xl font-semibold">Animation Discount −20%</h2>
          <p className="mt-1 text-sm text-muted-foreground">All “{ANIMATION_GENRE}” sessions ({animCount}).</p>
          <Button className="mt-5" disabled={!!busy} onClick={() => run("anim")}>
            {busy === "anim" && <Loader2 className="animate-spin" />} Apply 20% Animation Discount
          </Button>
        </div>
        <div className="glass glass-hover relative overflow-hidden p-6 animate-rise">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-neon-amber opacity-20 blur-3xl" />
          <Moon className="size-6 text-neon-amber" />
          <h2 className="mt-3 text-xl font-semibold">Evening Sessions Surcharge +15%</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sessions starting from 18:00 ({eveCount}).</p>
          <Button variant="outline" className="mt-5" disabled={!!busy} onClick={() => run("eve")}>
            {busy === "eve" && <Loader2 className="animate-spin" />} Apply +15% Surcharge
          </Button>
        </div>
      </div>
      <section className="glass overflow-hidden animate-rise">
        <h2 className="border-b px-5 py-4 font-semibold">All sessions</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Movie</TableHead><TableHead>Genre</TableHead><TableHead>Hall</TableHead><TableHead>Start</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
            <TableBody>
              {sessions.map((s) => {
                const prev = changed[s.SessionID];
                return (
                  <TableRow key={s.SessionID} className={prev !== undefined ? "bg-neon-cyan/5" : ""}>
                    <TableCell className="font-mono text-muted-foreground">{s.SessionID}</TableCell>
                    <TableCell className="font-medium">{s.Title}</TableCell>
                    <TableCell className="text-muted-foreground">{s.GenreName}</TableCell>
                    <TableCell>{s.HallName} {s.IsVIP && <Badge className="ml-1 bg-neon-amber/15 text-neon-amber hover:bg-neon-amber/15">VIP</Badge>}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(s.StartTime), "dd.MM HH:mm")}</TableCell>
                    <TableCell className="text-right font-mono">
                      {prev !== undefined && <span className="mr-2 text-muted-foreground line-through">{formatUAH(prev)}</span>}
                      <span className={prev === undefined ? "" : prev > s.TicketPrice ? "font-semibold text-neon-emerald" : "font-semibold text-neon-amber"}>{formatUAH(s.TicketPrice)}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}
