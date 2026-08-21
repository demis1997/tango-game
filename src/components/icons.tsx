export function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      aria-hidden
      focusable="false"
    >
      <circle cx="16" cy="16" r="8" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="16" y1="26" x2="16" y2="30" />
        <line x1="2" y1="16" x2="6" y2="16" />
        <line x1="26" y1="16" x2="30" y2="16" />
        <line x1="6.2" y1="6.2" x2="9.1" y2="9.1" />
        <line x1="22.9" y1="22.9" x2="25.8" y2="25.8" />
        <line x1="6.2" y1="25.8" x2="9.1" y2="22.9" />
        <line x1="22.9" y1="9.1" x2="25.8" y2="6.2" />
      </g>
    </svg>
  )
}

export function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M22.5 3.2a12.8 12.8 0 1 0 6.3 22.4 11 11 0 1 1-6.3-22.4z"
      />
    </svg>
  )
}
