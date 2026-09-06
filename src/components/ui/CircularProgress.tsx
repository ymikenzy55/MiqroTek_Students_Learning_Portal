"use client";

interface CircularProgressProps {
  percentage: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function CircularProgress({
  percentage,
  size = 140,
  strokeWidth = 12,
  label,
  sublabel,
}: CircularProgressProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-40"
        />
        {/* Animated Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="var(--accent)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text display */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
          {Math.round(clampedPercentage)}%
        </span>
        {label && <span className="text-xs font-semibold text-[var(--muted)]">{label}</span>}
        {sublabel && <span className="text-[10px] text-[var(--muted)]">{sublabel}</span>}
      </div>
    </div>
  );
}
