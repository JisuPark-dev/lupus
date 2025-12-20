'use client';

import { useState, useEffect } from 'react';
import {
  MEDICATION_CATEGORIES,
  MEDICATION_CATEGORY_OPTIONS,
  FREQUENCY_OPTIONS,
} from '@/lib/constants/medicationCategories';
import { formatDate } from '@/lib/utils/dateUtils';
import type { Medication, MedicationCategory, CreateMedicationRequest } from '@/types/medications';
import Button from '@/components/ui/Button';

interface MedicationFormProps {
  initialData?: Medication;
  onSubmit: (data: CreateMedicationRequest) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export default function MedicationForm({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  isLoading = false,
  isDeleting = false,
}: MedicationFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<MedicationCategory>(
    initialData?.category || 'other'
  );
  const [dose, setDose] = useState(initialData?.dose || '');
  const [frequency, setFrequency] = useState(initialData?.frequency || '');
  const [startDate, setStartDate] = useState(
    initialData?.start_date || formatDate(new Date())
  );
  const [endDate, setEndDate] = useState(initialData?.end_date || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category || !startDate) {
      return;
    }

    onSubmit({
      name: name.trim(),
      category,
      dose: dose.trim() || undefined,
      frequency: frequency.trim() || undefined,
      start_date: startDate,
      end_date: endDate || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 약물명 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          약물명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 프레드니솔론"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      {/* 카테고리 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          약물 분류 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MEDICATION_CATEGORY_OPTIONS.map((option) => {
            const meta = MEDICATION_CATEGORIES[option.value];
            const isSelected = category === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                className={`rounded-lg border-2 p-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'border-current bg-opacity-10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  borderColor: isSelected ? meta.color : undefined,
                  backgroundColor: isSelected ? `${meta.color}15` : undefined,
                  color: isSelected ? meta.color : undefined,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 복용량 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">복용량</label>
        <input
          type="text"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          placeholder="예: 5mg"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 복용 빈도 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">복용 빈도</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">선택하세요</option>
          {FREQUENCY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* 시작일 / 종료일 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            시작일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">종료일</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 메모 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">메모</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="약물에 대한 메모"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onCancel}
          disabled={isLoading || isDeleting}
        >
          취소
        </Button>
        {onDelete && initialData && (
          <Button
            type="button"
            variant="danger"
            onClick={onDelete}
            disabled={isLoading || isDeleting}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        )}
        <Button type="submit" fullWidth disabled={isLoading || isDeleting}>
          {isLoading ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
