export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 64 64" className={compact ? "h-9 w-9" : "h-12 w-12"} aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#0b1b33" />
        <path d="M12 40h40" stroke="#f4b942" strokeWidth="3" strokeLinecap="round" />
        <path d="M16 44h32" stroke="#2f7de1" strokeWidth="2" strokeLinecap="round" />
        <rect x="18" y="16" width="28" height="20" rx="6" fill="#1d4f9c" />
        <rect x="22" y="20" width="8" height="7" rx="1.5" fill="#d9ebff" />
        <rect x="34" y="20" width="8" height="7" rx="1.5" fill="#d9ebff" />
        <circle cx="24" cy="40" r="4" fill="#f4b942" />
        <circle cx="40" cy="40" r="4" fill="#f4b942" />
      </svg>
      <div>
        <p className="font-display text-lg font-extrabold tracking-tight text-white">RailReserve</p>
        {!compact && (
          <p className="text-xs text-sky-200/80">Smart Online Train Reservation System</p>
        )}
      </div>
    </div>
  );
}
