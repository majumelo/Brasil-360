interface ScoreGaugeProps {
  value: number; // 0-100
  color: string;
}

export default function ScoreGauge({ value, color }: ScoreGaugeProps) {
  const r = 54;
  const cx = 64;
  const cy = 64;
  const circumference = Math.PI * r; // half circle
  const progress = (value / 100) * circumference;

  return (
    <svg viewBox="0 0 128 80" className="gauge-svg">
      {/* Background arc */}
      <path
        d={`M 10 64 A ${r} ${r} 0 0 1 118 64`}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Progress arc */}
      <path
        d={`M 10 64 A ${r} ${r} 0 0 1 118 64`}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      {/* Center text */}
      <text x={cx} y={cy - 4} textAnchor="middle" className="gauge-text-value" fill={color} fontSize="20" fontWeight="700">
        {value.toFixed(0)}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize="8">
        DO MÁXIMO
      </text>
    </svg>
  );
}
