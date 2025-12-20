'use client';

import { useState } from 'react';

interface MultiSelectFieldProps {
  id: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  otherValue?: string;
  onOtherChange?: (value: string) => void;
}

export default function MultiSelectField({
  id,
  label,
  value,
  onChange,
  options,
  otherValue = '',
  onOtherChange,
}: MultiSelectFieldProps) {
  const [showOtherInput, setShowOtherInput] = useState(value.includes('기타'));

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      const newValue = value.filter((v) => v !== option);
      onChange(newValue);
      if (option === '기타') setShowOtherInput(false);
    } else {
      onChange([...value, option]);
      if (option === '기타') setShowOtherInput(true);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {showOtherInput && onOtherChange && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="직접 입력"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}
    </div>
  );
}
