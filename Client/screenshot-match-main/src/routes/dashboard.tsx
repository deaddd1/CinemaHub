import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { api, formatUAH } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — CinemaHub" },
      { name: "description", content: "Revenue matrices by hall, genre and bar items with Excel export." },
      { property: "og:title", content: "Executive Dashboard — CinemaHub" },
      { property: "og:description", content: "Revenue matrices by hall, genre and bar items." },
    ],
  }),
  component: DashboardPage,
});

function Matrix({ label, title, children, className = "" }: { label: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`glass overflow-hidden animate-rise ${className}`}>
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <span className="grid size-7 place-items-center rounded-md bg-gradient-neon font-mono text-xs font-bold text-primary-foreground">{label}</span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function DashboardPage() {
  const { data } = useQuery({ queryKey: ["matrices"], queryFn: api.getMatrices });
  const [busy, setBusy] = useState(false);

  const exportXlsx = async () => {
    setBusy(true);
    const id = toast.loading("Exporting Excel...");
    try {
      await api.exportExcel();
      toast.success("Excel file downloaded", { id });
    } catch (e) {
      toast.error(`Export failed: ${(e as Error).message}`, { id });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Executive Multi-Matrix"
        subtitle="Halls, genres and concessions at a glance"
        actions={
          <Button disabled={busy} onClick={exportXlsx}>
            {busy ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />} Download Excel (.xlsx)
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <Matrix label="A" title="Revenue by Cinema Hall">
          <Table>
            <TableHeader><TableRow><TableHead>Hall</TableHead><TableHead>Class</TableHead><TableHead className="text-right">Tickets</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
            <TableBody>
              {data?.HallsRevenue.map((h) => (
                <TableRow key={h.HallName}>
                  <TableCell className="font-medium">{h.HallName}</TableCell>
                  <TableCell>{h.IsVIP ? <Badge className="bg-neon-amber/15 text-neon-amber hover:bg-neon-amber/15">VIP</Badge> : <Badge variant="secondary">Standard</Badge>}</TableCell>
                  <TableCell className="text-right font-mono">{h.SoldTickets.toLocaleString("uk-UA")}</TableCell>
                  <TableCell className="text-right font-mono text-neon-cyan">{formatUAH(h.TotalRevenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Matrix>
        <Matrix label="B" title="Performance by Genre">
          <Table>
            <TableHeader><TableRow><TableHead>Genre</TableHead><TableHead className="text-right">Movies</TableHead><TableHead className="text-right">Tickets</TableHead><TableHead className="text-right">Gross</TableHead></TableRow></TableHeader>
            <TableBody>
              {data?.GenresRevenue.map((g) => (
                <TableRow key={g.GenreName}>
                  <TableCell className="font-medium">{g.GenreName}</TableCell>
                  <TableCell className="text-right font-mono">{g.MoviesCount}</TableCell>
                  <TableCell className="text-right font-mono">{g.TicketsCount.toLocaleString("uk-UA")}</TableCell>
                  <TableCell className="text-right font-mono text-neon-violet">{formatUAH(g.GrossRevenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Matrix>
        <Matrix label="C" title="Top-5 Cinema Bar Items" className="xl:col-span-2">
          <Table>
            <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Sold</TableHead><TableHead className="text-right">Gross</TableHead></TableRow></TableHeader>
            <TableBody>
              {data?.TopBarItems.map((b) => (
                <TableRow key={b.Rank}>
                  <TableCell>
                    <span className={`grid size-8 place-items-center rounded-full font-mono text-sm font-semibold ${b.Rank === 1 ? "bg-gradient-neon text-primary-foreground shadow-neon" : "bg-muted"}`}>#{b.Rank}</span>
                  </TableCell>
                  <TableCell className="font-medium">{b.ItemName}</TableCell>
                  <TableCell><Badge variant="outline">{b.Category}</Badge></TableCell>
                  <TableCell className="text-right font-mono">{b.SoldQuantity.toLocaleString("uk-UA")}</TableCell>
                  <TableCell className="text-right font-mono text-neon-emerald">{formatUAH(b.GrossRevenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Matrix>
      </div>
    </>
  );
}
