interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  let colorClass = "text-red-500";
  if (value >= 80) colorClass = "text-green-500";
  else if (value >= 60) colorClass = "text-yellow-500";

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 transition-transform duration-500"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-muted fill-none"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`fill-none stroke-current ${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tighter">{value}</span>
        {label && <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{label}</span>}
      </div>
    </div>
  );
}
