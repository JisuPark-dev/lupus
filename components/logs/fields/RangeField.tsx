'use client';

interface RangeFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function RangeField({
  id,
  label,
  value,
  onChange,
  min = 1,
  max = 10,
}: RangeFieldProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  // 값에 따른 색상
  const getColor = () => {
    if (value <= 3) return '#10B981'; // 녹색 (좋음)
    if (value <= 6) return '#F59E0B'; // 주황 (보통)
    return '#EF4444'; // 빨강 (나쁨)
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span
          className="rounded-full px-2.5 py-0.5 text-sm font-semibold text-white"
          style={{ backgroundColor: getColor() }}
        >
          {value}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
          style={{
            background: `linear-gradient(to right, ${getColor()} 0%, ${getColor()} ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`,
          }}
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}
