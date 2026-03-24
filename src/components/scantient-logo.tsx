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
  const iconSize = height;

  const icon = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={iconOnly ? className : undefined}
      aria-label={iconOnly ? "Scantient" : undefined}
    >
      <defs>
        <linearGradient id="scantient-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      <rect width="40" height="40" rx="10" fill="url(#scantient-grad)" fillOpacity="0.1" />

      <path
        d="M26 12C26 10.8954 25.1046 10 24 10H14C12.8954 10 12 10.8954 12 12V18C12 19.1046 12.8954 20 14 20H26C27.1046 20 28 20.8954 28 22V28C28 29.1046 27.1046 30 26 30H16C14.8954 30 14 29.1046 14 28"
        stroke="url(#scantient-grad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="20" cy="20" r="2.5" fill="white" />
    </svg>
  );

  if (iconOnly) {
    return icon;
  }

  // Full logo: icon + wordmark
  const textScale = height / 36;
  const wordmarkFontSize = Math.round(22 * textScale);
  const taglineFontSize = Math.round(9 * textScale);
  const gap = Math.round(10 * textScale);
  const totalWidth = iconSize + gap + Math.round(120 * textScale);

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Scantient — Security Intelligence"
    >
      <g>{icon}</g>
      <text
        x={iconSize + gap}
        y={Math.round(height * 0.62)}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="700"
        fontSize={wordmarkFontSize}
        fill="#1E293B"
        letterSpacing="-0.5"
      >
        Scantient
      </text>
      <text
        x={iconSize + gap + 1}
        y={height - 2}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="500"
        fontSize={taglineFontSize}
        fill="#64748B"
        letterSpacing="2"
      >
        SECURITY INTELLIGENCE
      </text>
    </svg>
  );
}
