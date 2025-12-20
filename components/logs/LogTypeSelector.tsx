'use client';

import { LOG_TYPES, LOG_CATEGORIES } from '@/lib/constants/logTypes';
import type { LogType } from '@/types/logs';

interface LogTypeSelectorProps {
  onSelect: (type: LogType) => void;
  onClose: () => void;
}

export default function LogTypeSelector({ onSelect, onClose }: LogTypeSelectorProps) {
  return (
    <div className="space-y-6">
      {Object.entries(LOG_CATEGORIES).map(([categoryKey, category]) => (
        <div key={categoryKey}>
          <h3 className="mb-3 text-sm font-medium text-gray-500">
            {category.name}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {category.types.map((type) => {
              const meta = LOG_TYPES[type];
              return (
                <button
                  key={type}
                  onClick={() => onSelect(type)}
                  className="flex items-center gap-2 rounded-xl border-2 border-transparent bg-gray-50 p-3 text-left transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm"
                  style={{ borderColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = meta.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {meta.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={onClose}
        className="mt-4 w-full rounded-lg bg-gray-100 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200"
      >
        취소
      </button>
    </div>
  );
}
