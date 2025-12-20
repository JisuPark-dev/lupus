'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/lib/utils/dateUtils';
import Calendar from '@/components/calendar/Calendar';
import LogTypeSelector from '@/components/logs/LogTypeSelector';
import LogForm from '@/components/logs/LogForm';
import LogList from '@/components/logs/LogList';
import LogDetail from '@/components/logs/LogDetail';
import MedicationSummary from '@/components/medications/MedicationSummary';
import Modal from '@/components/ui/Modal';
import type { HealthLog, LogType, LogData } from '@/types/logs';
import type { Medication } from '@/types/medications';
import type { UserHospital } from '@/types/hospitals';

type ModalMode = 'none' | 'select-type' | 'add' | 'view' | 'edit';

export default function HomePage() {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [hospitals, setHospitals] = useState<UserHospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [selectedLog, setSelectedLog] = useState<HealthLog | null>(null);
  const [selectedLogType, setSelectedLogType] = useState<LogType | null>(null);

  const [modalMode, setModalMode] = useState<ModalMode>('none');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 데이터 로드
  const fetchData = useCallback(async () => {
    try {
      const [logsRes, medsRes, hospitalsRes] = await Promise.all([
        fetch('/api/health-logs'),
        fetch('/api/medications'),
        fetch('/api/user-hospitals'),
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }

      if (medsRes.ok) {
        const medsData = await medsRes.json();
        setMedications(medsData.medications || []);
      }

      if (hospitalsRes.ok) {
        const hospitalsData = await hospitalsRes.json();
        setHospitals(hospitalsData.hospitals || []);
      }

      setError(null);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 선택된 날짜의 기록들
  const logsForSelectedDate = logs.filter((log) => log.log_date === selectedDate);

  // 날짜 클릭
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  // 기록 타입 선택
  const handleTypeSelect = (type: LogType) => {
    setSelectedLogType(type);
    setModalMode('add');
  };

  // 기록 저장
  const handleSaveLog = async (data: LogData, notes: string) => {
    if (!selectedLogType && !selectedLog) return;

    setIsSaving(true);
    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/health-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            log_date: selectedDate,
            log_type: selectedLogType,
            data,
            notes,
          }),
        });

        if (res.ok) {
          const { log } = await res.json();
          setLogs((prev) => [log, ...prev]);
          closeModal();
        } else {
          const { error } = await res.json();
          setError(error || '저장에 실패했습니다.');
        }
      } else if (modalMode === 'edit' && selectedLog) {
        const res = await fetch(`/api/health-logs/${selectedLog.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, notes }),
        });

        if (res.ok) {
          const { log } = await res.json();
          setLogs((prev) => prev.map((l) => (l.id === log.id ? log : l)));
          closeModal();
        } else {
          const { error } = await res.json();
          setError(error || '수정에 실패했습니다.');
        }
      }
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 기록 삭제
  const handleDeleteLog = async () => {
    if (!selectedLog) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/health-logs/${selectedLog.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setLogs((prev) => prev.filter((l) => l.id !== selectedLog.id));
        closeModal();
      } else {
        const { error } = await res.json();
        setError(error || '삭제에 실패했습니다.');
      }
    } catch {
      setError('삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 기록 클릭
  const handleLogClick = (log: HealthLog) => {
    setSelectedLog(log);
    setModalMode('view');
  };

  // 수정 모드로 전환
  const handleEditLog = () => {
    if (selectedLog) {
      setSelectedLogType(selectedLog.log_type);
      setModalMode('edit');
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setModalMode('none');
    setSelectedLog(null);
    setSelectedLogType(null);
  };

  // 모달 제목
  const getModalTitle = () => {
    switch (modalMode) {
      case 'select-type':
        return '기록 추가';
      case 'add':
        return '새 기록';
      case 'view':
        return '기록 상세';
      case 'edit':
        return '기록 수정';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-red-600">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-800 underline"
          >
            닫기
          </button>
        </div>
      )}

      {/* PC: 2열 레이아웃 (달력 왼쪽, 기록 오른쪽), 모바일: 1열 */}
      <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-120px)]">
        {/* 왼쪽: 달력 */}
        <div className="flex-1 min-w-0 lg:overflow-y-auto">
          <Calendar
            logs={logs}
            medications={medications}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </div>

        {/* 오른쪽: 선택된 날짜 기록 + 약물 */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0 space-y-4 lg:overflow-y-auto lg:pb-4">
          {/* 선택된 날짜 헤더 */}
          <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
            <div>
              <p className="text-xs font-medium text-gray-400">선택된 날짜</p>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedDate.replace(/-/g, '. ')}
              </h2>
            </div>
            <button
              onClick={() => setModalMode('select-type')}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* 기록 목록 */}
          <div>
            <h3 className="mb-2 px-1 text-sm font-semibold text-gray-500">
              기록 ({logsForSelectedDate.length})
            </h3>
            <LogList logs={logsForSelectedDate} onLogClick={handleLogClick} />
          </div>

          {/* 약물 요약 */}
          <MedicationSummary
            medications={medications}
            selectedDate={selectedDate}
          />
        </div>
      </div>

      {/* 모달 */}
      <Modal
        isOpen={modalMode !== 'none'}
        onClose={closeModal}
        title={getModalTitle()}
        size="lg"
      >
        {modalMode === 'select-type' && (
          <LogTypeSelector
            onSelect={handleTypeSelect}
            onClose={closeModal}
          />
        )}

        {modalMode === 'add' && selectedLogType && (
          <LogForm
            logType={selectedLogType}
            onSubmit={handleSaveLog}
            onCancel={closeModal}
            isLoading={isSaving}
            hospitals={hospitals}
            selectedDate={selectedDate}
          />
        )}

        {modalMode === 'view' && selectedLog && (
          <LogDetail
            log={selectedLog}
            onEdit={handleEditLog}
            onDelete={handleDeleteLog}
            onClose={closeModal}
            isDeleting={isDeleting}
          />
        )}

        {modalMode === 'edit' && selectedLog && selectedLogType && (
          <LogForm
            logType={selectedLogType}
            initialData={selectedLog.data}
            initialNotes={selectedLog.notes || ''}
            onSubmit={handleSaveLog}
            onCancel={() => setModalMode('view')}
            isLoading={isSaving}
          />
        )}
      </Modal>
    </div>
  );
}
