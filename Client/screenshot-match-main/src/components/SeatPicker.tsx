import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, formatUAH, seatPrice, SEAT_ROWS, SEATS_PER_ROW, VIP_ROWS } from "@/services/api";
import type { MovieSessionDto } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SeatPicker({ session, onClose }: { session: MovieSessionDto | null; onClose: () => void }) {
  return (
    <Dialog open={!!session} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-popover sm:max-w-2xl">
        {session && <PickerBody key={session.SessionID} session={session} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function PickerBody({ session, onClose }: { session: MovieSessionDto; onClose: () => void }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+380");
  const total = selected.reduce((a, s) => a + seatPrice(session.TicketPrice, s), 0);
  const phoneOk = /^\+380\d{9}$/.test(phone.replace(/\s/g, ""));
  const valid = selected.length > 0 && name.trim().length >= 2 && phoneOk;

  const book = useMutation({
    mutationFn: () => api.bookTickets({ SessionID: session.SessionID, Seats: selected, CustomerName: name.trim(), CustomerPhone: phone.replace(/\s/g, "") }),
    onSuccess: (r) => {
      toast.success(`Purchase confirmed: ${r.TicketIDs.length} ticket(s)`, { description: `Paid ${formatUAH(r.TotalPaid)} · seats ${selected.join(", ")}` });
      qc.invalidateQueries();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = (seat: string) =>
    setSelected((s) => (s.includes(seat) ? s.filter((x) => x !== seat) : s.length >= 10 ? s : [...s, seat]));

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">{session.Title}</DialogTitle>
        <DialogDescription>
          {session.HallName} · {format(new Date(session.StartTime), "dd.MM HH:mm")} · from {formatUAH(session.TicketPrice)}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-2">
        <div className="mx-auto mb-6 h-1.5 w-3/4 rounded-full bg-gradient-neon shadow-neon" />
        <p className="-mt-4 mb-4 text-center text-xs uppercase tracking-widest text-muted-foreground">Screen</p>
        <div className="space-y-1.5 overflow-x-auto">
          {SEAT_ROWS.map((row) => (
            <div key={row} className="flex items-center justify-center gap-1.5">
              <span className="w-4 font-mono text-xs text-muted-foreground">{row}</span>
              {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                const seat = `${row}-${i + 1}`;
                const taken = session.TakenSeats.includes(seat);
                const isSel = selected.includes(seat);
                const vip = VIP_ROWS.includes(row);
                return (
                  <button
                    key={seat}
                    type="button"
                    disabled={taken}
                    onClick={() => toggle(seat)}
                    aria-label={`Seat ${seat}${vip ? " VIP" : ""}${taken ? " taken" : ""}`}
                    className={cn(
                      "size-6 rounded-t-md rounded-b-sm border text-[9px] font-mono transition-all sm:size-7",
                      i === 5 && "mr-3",
                      taken && "cursor-not-allowed border-transparent bg-muted/60 opacity-40",
                      !taken && !isSel && (vip ? "border-neon-amber/60 bg-neon-amber/10 hover:bg-neon-amber/30" : "border-neon-cyan/40 bg-neon-cyan/5 hover:bg-neon-cyan/25"),
                      isSel && "scale-110 border-transparent bg-gradient-neon text-primary-foreground shadow-neon",
                    )}
                  >
                    {isSel ? i + 1 : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <Legend className="border-neon-cyan/40 bg-neon-cyan/5" label={`Standard ${formatUAH(session.TicketPrice)}`} />
          <Legend className="border-neon-amber/60 bg-neon-amber/10" label={`VIP ${formatUAH(seatPrice(session.TicketPrice, "G-1"))}`} />
          <Legend className="bg-gradient-neon" label="Selected" />
          <Legend className="bg-muted/60 opacity-40" label="Taken" />
        </div>
      </div>

      <form
        className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2"
        onSubmit={(e) => { e.preventDefault(); if (valid) book.mutate(); }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="cn">Name</Label>
          <Input id="cn" value={name} onChange={(e) => setName(e.target.value)} placeholder="Олена Коваленко" maxLength={80} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp">Phone</Label>
          <Input id="cp" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380971234567" maxLength={16} />
          {phone.length > 4 && !phoneOk && <p className="text-xs text-destructive">Format: +380XXXXXXXXX</p>}
        </div>
        <div className="flex items-center justify-between gap-3 sm:col-span-2">
          <div>
            <p className="text-sm text-muted-foreground">{selected.length} ticket(s){selected.length ? ` · ${selected.join(", ")}` : ""}</p>
            <p className="font-mono text-2xl font-semibold text-neon-cyan">{formatUAH(total)}</p>
          </div>
          <Button type="submit" size="lg" disabled={!valid || book.isPending}>
            {book.isPending && <Loader2 className="animate-spin" />} Confirm Purchase
          </Button>
        </div>
      </form>
    </>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-3.5 rounded-sm border", className)} />
      {label}
    </span>
  );
}
