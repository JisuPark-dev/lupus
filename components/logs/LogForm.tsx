'use client';

import { useState, useEffect } from 'react';
import { LOG_FIELDS, NOTES_FIELD } from '@/lib/constants/logFields';
import { LOG_TYPES } from '@/lib/constants/logTypes';
import type { LogType, LogData, FieldDefinition } from '@/types/logs';
import type { UserHospital } from '@/types/hospitals';
import RangeField from './fields/RangeField';
import SelectField from './fields/SelectField';
import MultiSelectField from './fields/MultiSelectField';
import TextareaField from './fields/TextareaField';
import NumberField from './fields/NumberField';
import TextField from './fields/TextField';
import DateField from './fields/DateField';
import Button from '@/components/ui/Button';

interface LogFormProps {
  logType: LogType;
  initialData?: LogData;
  initialNotes?: string;
  onSubmit: (data: LogData, notes: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  hospitals?: UserHospital[];
  selectedDate?: string;
}

// 선택된 날짜에 활성화된 주 병원 찾기
const getActivePrimaryHospital = (
  hospitals: UserHospital[],
  date: string
): UserHospital | undefined => {
  return hospitals.find(
    (h) =>
      h.is_primary &&
      h.start_date <= date &&
      (!h.end_date || h.end_date >= date)
  );
};

// 현재 다니는 병원들 찾기 (end_date가 null인 병원)
const getActiveHospitals = (hospitals: UserHospital[]): UserHospital[] => {
  return hospitals.filter((h) => !h.end_date);
};

export default function LogForm({
  logType,
  initialData = {},
  initialNotes = '',
  onSubmit,
  onCancel,
  isLoading = false,
  hospitals = [],
  selectedDate = '',
}: LogFormProps) {
  const [formData, setFormData] = useState<LogData>(initialData);
  const [notes, setNotes] = useState(initialNotes);

  const fields = LOG_FIELDS[logType] || [];
  const typeMeta = LOG_TYPES[logType];

  // 초기값 설정
  useEffect(() => {
    const defaultData: LogData = {};
    fields.forEach((field) => {
      if (field.type === 'range') {
        defaultData[field.id] = initialData[field.id] ?? 5;
      } else if (field.type === 'multiselect') {
        defaultData[field.id] = initialData[field.id] ?? [];
      } else {
        defaultData[field.id] = initialData[field.id] ?? '';
      }
    });

    // 의료방문(visit) 타입일 때 기본값 설정
    if (logType === 'visit' && !initialData.visitType) {
      // 방문유형 기본값: "정기 외래"
      defaultData.visitType = '정기 외래';

      // 병원명 기본값: 선택된 날짜에 활성화된 주 병원
      if (!initialData.hospital && selectedDate && hospitals.length > 0) {
        const primaryHospital = getActivePrimaryHospital(hospitals, selectedDate);
        if (primaryHospital) {
          defaultData.hospital = primaryHospital.name;
        }
      }
    }

    setFormData(defaultData);
  }, [logType, hospitals, selectedDate]);

  const updateField = (fieldId: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const updateOtherField = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [`${fieldId}_other`]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, notes);
  };

  const renderField = (field: FieldDefinition) => {
    const value = formData[field.id];
    const otherValue = formData[`${field.id}_other`] as string | undefined;

    switch (field.type) {
      case 'range':
        return (
          <RangeField
            key={field.id}
            id={field.id}
            label={field.label}
            value={(value as number) ?? 5}
            onChange={(v) => updateField(field.id, v)}
            min={field.min}
            max={field.max}
          />
        );

      case 'select':
        return (
          <SelectField
            key={field.id}
            id={field.id}
            label={field.label}
            value={(value as string) ?? ''}
            onChange={(v) => updateField(field.id, v)}
            options={field.options || []}
            otherValue={otherValue}
            onOtherChange={(v) => updateOtherField(field.id, v)}
          />
        );

      case 'multiselect':
        return (
          <MultiSelectField
            key={field.id}
            id={field.id}
            label={field.label}
            value={(value as string[]) ?? []}
            onChange={(v) => updateField(field.id, v)}
            options={field.options || []}
            otherValue={otherValue}
            onOtherChange={(v) => updateOtherField(field.id, v)}
          />
        );

      case 'textarea':
        return (
          <TextareaField
            key={field.id}
            id={field.id}
            label={field.label}
            value={(value as string) ?? ''}
            onChange={(v) => updateField(field.id, v)}
            placeholder={field.placeholder}
          />
        );

      case 'number':
        return (
          <NumberField
            key={field.id}
            id={field.id}
            label={field.label}
            value={value === '' || value === undefined ? '' : (value as number)}
            onChange={(v) => updateField(field.id, v as number)}
            unit={field.unit}
            min={field.min}
            max={field.max}
          />
        );

      case 'text':
        // 의료방문의 병원명 필드일 때 현재 다니는 병원 버튼 추가
        if (logType === 'visit' && field.id === 'hospital') {
          const activeHospitals = getActiveHospitals(hospitals);
          return (
            <div key={field.id}>
              <TextField
                id={field.id}
                label={field.label}
                value={(value as string) ?? ''}
                onChange={(v) => updateField(field.id, v)}
                placeholder={field.placeholder}
              />
              {activeHospitals.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeHospitals.map((hospital) => (
                    <button
                      key={hospital.id}
                      type="button"
                      onClick={() => updateField('hospital', hospital.name)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors ${
                        value === hospital.name
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>🏥</span>
                      <span>{hospital.name}</span>
                      {hospital.is_primary && (
                        <span className="ml-0.5 text-xs opacity-70">주</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }
        return (
          <TextField
            key={field.id}
            id={field.id}
            label={field.label}
            value={(value as string) ?? ''}
            onChange={(v) => updateField(field.id, v)}
            placeholder={field.placeholder}
          />
        );

      case 'date':
        return (
          <DateField
            key={field.id}
            id={field.id}
            label={field.label}
            value={(value as string) ?? ''}
            onChange={(v) => updateField(field.id, v)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기록 타입 헤더 */}
      <div
        className="flex items-center gap-3 rounded-lg p-3"
        style={{ backgroundColor: `${typeMeta.color}15` }}
      >
        <span className="text-3xl">{typeMeta.emoji}</span>
        <span className="text-lg font-semibold" style={{ color: typeMeta.color }}>
          {typeMeta.name}
        </span>
      </div>

      {/* 필드들 */}
      <div className="space-y-5">
        {fields.map(renderField)}

        {/* 특이사항 필드 (공통) */}
        <TextareaField
          id={NOTES_FIELD.id}
          label={NOTES_FIELD.label}
          value={notes}
          onChange={setNotes}
          placeholder={NOTES_FIELD.placeholder}
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onCancel}
          disabled={isLoading}
        >
          취소
        </Button>
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
