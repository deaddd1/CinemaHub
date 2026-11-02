import desert from "@/assets/hero-desert.jpg";
import alien from "@/assets/poster-alien.jpg";

const images: Record<number, string> = { 1: desert, 6: alien };
const gradients: Record<number, string> = {
  2: "from-destructive/70 via-neon-amber/40 to-background",
  3: "from-neon-emerald/60 via-neon-amber/30 to-background",
  4: "from-neon-violet/70 via-neon-cyan/40 to-background",
  5: "from-neon-amber/60 via-destructive/30 to-background",
};

export function Poster({ movieId, title, className = "" }: { movieId: number; title: string; className?: string }) {
  const img = images[movieId];
  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      {img ? (
        <img src={img} alt={title} loading="lazy" className="size-full object-cover" />
      ) : (
        <div className={`flex size-full items-end bg-gradient-to-br p-4 ${gradients[movieId] ?? "from-neon-cyan/50 to-background"}`}>
          <span className="text-2xl font-bold uppercase leading-none tracking-tight text-foreground/90">{title}</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
    </div>
  );
}
