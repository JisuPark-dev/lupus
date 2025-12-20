'use client';

import { LOG_TYPES } from '@/lib/constants/logTypes';
import { LOG_FIELDS } from '@/lib/constants/logFields';
import type { HealthLog, FieldDefinition } from '@/types/logs';
import Button from '@/components/ui/Button';

interface LogDetailProps {
  log: HealthLog;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  isDeleting?: boolean;
}

export default function LogDetail({
  log,
  onEdit,
  onDelete,
  onClose,
  isDeleting = false,
}: LogDetailProps) {
  const meta = LOG_TYPES[log.log_type];
  const fields = LOG_FIELDS[log.log_type] || [];

  const formatValue = (field: FieldDefinition, value: unknown): string => {
    if (value === undefined || value === null || value === '') {
      return '-';
    }

    switch (field.type) {
      case 'range':
        return `${value}점`;
      case 'multiselect':
        if (Array.isArray(value)) {
          const otherValue = log.data[`${field.id}_other`];
          const items = value.map((v) =>
            v === '기타' && otherValue ? `기타(${otherValue})` : v
          );
          return items.join(', ') || '-';
        }
        return '-';
      case 'select':
        const selectOther = log.data[`${field.id}_other`];
        if (value === '기타' && selectOther) {
          return `기타(${selectOther})`;
        }
        return String(value);
      case 'number':
        return field.unit ? `${value} ${field.unit}` : String(value);
      default:
        return String(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div
        className="flex items-center gap-3 rounded-lg p-4"
        style={{ backgroundColor: `${meta.color}15` }}
      >
        <span className="text-4xl">{meta.emoji}</span>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: meta.color }}>
            {meta.name}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(log.created_at).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 필드 값들 */}
      <div className="space-y-4">
        {fields.map((field) => {
          const value = log.data[field.id];
          const displayValue = formatValue(field, value);

          // 빈 값은 스킵
          if (displayValue === '-') return null;

          return (
            <div key={field.id} className="border-b border-gray-100 pb-3">
              <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
              <dd className="mt-1 text-gray-900">{displayValue}</dd>
            </div>
          );
        })}

        {/* 특이사항 */}
        {log.notes && (
          <div className="border-b border-gray-100 pb-3">
            <dt className="text-sm font-medium text-gray-500">특이사항</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">{log.notes}</dd>
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4">
        <Button variant="secondary" fullWidth onClick={onClose}>
          닫기
        </Button>
        <Button variant="ghost" onClick={onEdit}>
          수정
        </Button>
        <Button variant="danger" onClick={onDelete} disabled={isDeleting}>
          {isDeleting ? '삭제 중...' : '삭제'}
        </Button>
      </div>
    </div>
  );
}
