interface ChapterSectionProps {
  children: React.ReactNode;
  chapter: string;
  subtitle?: string;
  description?: string;
}

export default function ChapterSection({
  children,
  chapter,
  subtitle,
  description,
}: ChapterSectionProps) {
  return (
    <section
      className="space-y-10"
      id={chapter.match(/^\/(\d{2})\s/)?.[1] ?? ""}
    >
      <div className="space-y-2 lg:-ml-20 xl:-ml-24">
        <div className="mono text-xs tracking-[0.2em] text-foreground/60 uppercase font-medium">
          {chapter}
        </div>
        <div className="h-px bg-foreground/20 lg:-mr-20 xl:-mr-24" />
      </div>
      <div className="space-y-4">
        {subtitle && (
          <h2 className="text-3xl font-bold tracking-tight">{subtitle}</h2>
        )}
        {description && (
          <p className="font-serif text-foreground/80 leading-relaxed text-base font-medium">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
