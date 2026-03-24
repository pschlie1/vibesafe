interface ScantientLogoProps {
  /** Show only the icon (no wordmark/tagline) */
  iconOnly?: boolean;
  /** Height in px — width scales proportionally. Default: 36 */
  height?: number;
  /** Override icon fill color. Defaults to brand blue #0066FF */
  className?: string;
}

/**
 * Scantient brand logo.
 * - Default: icon + "Scantient" wordmark + "Security Intelligence" tagline
 * - iconOnly=true: square icon mark only (use in tight spaces)
 */
export function ScantientLogo({ iconOnly = false, height = 36, className = "" }: ScantientLogoProps) {
  if (iconOnly) {
    // Icon only — preserves 100x100 viewBox aspect ratio
    const w = height;
    return (
      <svg
        width={w}
        height={height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Scantient"
      >
        <path d="M45 0C30 0 20 12 20 28V52C20 68 30 80 45 80H55C70 80 80 68 80 52V28C80 12 70 0 55 0H45Z" fill="#0066FF" />
        <path d="M40 20H60V30H45C42.2 30 40 32.2 40 35V45C40 47.8 42.2 50 45 50H60V60H40C34.5 60 30 55.5 30 50V30C30 24.5 34.5 20 40 20Z" fill="white" />
        <path d="M60 20C65.5 20 70 24.5 70 30V50C70 55.5 65.5 60 60 60H55V50H60C62.8 50 65 47.8 65 45V35C65 32.2 62.8 30 60 30H55V20H60Z" fill="white" fillOpacity="0.8" />
        <circle cx="50" cy="40" r="4" fill="#00C2FF" />
      </svg>
    );
  }

  // Full logo — 500×120 viewBox, scaled by height
  const aspectRatio = 500 / 120;
  const w = Math.round(height * aspectRatio);

  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 500 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Scantient — Security Intelligence"
    >
      <g>
        <path d="M45 20C30 20 20 32 20 48V72C20 88 30 100 45 100H55C70 100 80 88 80 72V48C80 32 70 20 55 20H45Z" fill="#0066FF" />
        <path d="M40 40H60V50H45C42.2 50 40 52.2 40 55V65C40 67.8 42.2 70 45 70H60V80H40C34.5 80 30 75.5 30 70V50C30 44.5 34.5 40 40 40Z" fill="white" />
        <path d="M60 40C65.5 40 70 44.5 70 50V70C70 75.5 65.5 80 60 80H55V70H60C62.8 70 65 67.8 65 65V55C65 52.2 62.8 50 60 50H55V40H60Z" fill="white" fillOpacity="0.8" />
        <circle cx="50" cy="60" r="4" fill="#00C2FF" />
      </g>
      <text x="100" y="78" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="52" fill="#1E293B" letterSpacing="-2">Scantient</text>
      <text x="102" y="98" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="14" fill="#64748B" letterSpacing="4">Security Intelligence</text>
    </svg>
  );
}
