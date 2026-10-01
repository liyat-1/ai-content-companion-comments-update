/** Directful AI sparkle mark — refined four-point star. */
export function Sparkle({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 1.5c.6 5.4 3.6 8.4 10.5 10.5-6.9 2.1-9.9 5.1-10.5 10.5C11.4 17.1 8.4 14.1 1.5 12 8.4 9.9 11.4 6.9 12 1.5Z" fill="currentColor" />
    </svg>
  );
}
