import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, Search, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { api, maskPhone } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Tickets & Customers — CinemaHub" },
      { name: "description", content: "Search tickets by customer and date with GDPR-masked phone numbers." },
      { property: "og:title", content: "Tickets & Customers — CinemaHub" },
      { property: "og:description", content: "Ticket search with GDPR-masked customer data." },
    ],
  }),
  component: TicketsPage,
});

function TicketsPage() {
  const [q, setQ] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();
  const { data = [], isFetching } = useQuery({
    queryKey: ["tickets", q, range?.from?.toDateString(), range?.to?.toDateString()],
    queryFn: () => api.searchTickets({ client: q, from: range?.from ? new Date(range.from) : undefined, to: range?.to }),
    placeholderData: (p) => p,
  });

  return (
    <>
      <PageHeader title="Tickets & Customers" subtitle="Data access layer with GDPR-safe output" />
      <div className="glass mb-6 flex flex-wrap items-center gap-3 p-4 animate-rise">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search customer name…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start">
              <CalendarIcon />
              {range?.from ? `${format(range.from, "dd.MM.yyyy")}${range.to ? ` – ${format(range.to, "dd.MM.yyyy")}` : ""}` : "Purchase date range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
        {range && <Button variant="ghost" size="sm" onClick={() => setRange(undefined)}>Clear dates</Button>}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-neon-emerald"><ShieldCheck className="size-4" />Phones masked (GDPR)</span>
      </div>
      <section className={`glass overflow-hidden animate-rise transition-opacity ${isFetching ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead><TableHead>Movie & Session</TableHead><TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead><TableHead>Seat</TableHead><TableHead>Purchased</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((t) => (
                <TableRow key={t.TicketID}>
                  <TableCell className="font-mono text-muted-foreground">#{t.TicketID}</TableCell>
                  <TableCell>
                    <p className="font-medium">{t.MovieTitle}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(t.SessionStart), "dd.MM HH:mm")}</p>
                  </TableCell>
                  <TableCell>{t.CustomerName}</TableCell>
                  <TableCell className="font-mono text-sm">{maskPhone(t.CustomerPhone)}</TableCell>
                  <TableCell className="font-mono">{t.SeatNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(t.PurchaseDate), "dd.MM.yyyy")}</TableCell>
                  <TableCell>
                    {t.IsPaid ? <Badge className="bg-neon-emerald/15 text-neon-emerald hover:bg-neon-emerald/15">Paid</Badge> : <Badge variant="destructive">Unpaid</Badge>}
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No tickets found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}
