'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatDate } from '@/lib/utils/dateUtils';
import { MEDICATION_CATEGORIES } from '@/lib/constants/medicationCategories';
import MedicationCard from '@/components/medications/MedicationCard';
import MedicationForm from '@/components/medications/MedicationForm';
import Modal from '@/components/ui/Modal';
import type { Medication, CreateMedicationRequest } from '@/types/medications';

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showEnded, setShowEnded] = useState(false);

  const today = formatDate(new Date());

  // 데이터 로드
  const fetchMedications = useCallback(async () => {
    try {
      const res = await fetch('/api/medications');
      if (res.ok) {
        const data = await res.json();
        setMedications(data.medications || []);
      }
      setError(null);
    } catch {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // 현재 복용 중 / 복용 종료 분리
  const { activeMeds, endedMeds } = useMemo(() => {
    const active: Medication[] = [];
    const ended: Medication[] = [];

    medications.forEach((med) => {
      if (!med.end_date || med.end_date >= today) {
        active.push(med);
      } else {
        ended.push(med);
      }
    });

    // 종료된 약물은 종료일 기준 내림차순
    ended.sort((a, b) => (b.end_date || '').localeCompare(a.end_date || ''));

    return { activeMeds: active, endedMeds: ended };
  }, [medications, today]);

  // 약물 저장
  const handleSave = async (data: CreateMedicationRequest) => {
    setIsSaving(true);
    try {
      if (editingMed) {
        // 수정
        const res = await fetch(`/api/medications/${editingMed.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const { medication } = await res.json();
          setMedications((prev) =>
            prev.map((m) => (m.id === medication.id ? medication : m))
          );
          closeModal();
        } else {
          const { error } = await res.json();
          setError(error || '수정에 실패했습니다.');
        }
      } else {
        // 생성
        const res = await fetch('/api/medications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const { medication } = await res.json();
          setMedications((prev) => [medication, ...prev]);
          closeModal();
        } else {
          const { error } = await res.json();
          setError(error || '저장에 실패했습니다.');
        }
      }
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 약물 삭제
  const handleDelete = async () => {
    if (!editingMed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/medications/${editingMed.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMedications((prev) => prev.filter((m) => m.id !== editingMed.id));
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

  // 복용 종료
  const handleEndMedication = async (med: Medication) => {
    try {
      const res = await fetch(`/api/medications/${med.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ end_date: today }),
      });

      if (res.ok) {
        const { medication } = await res.json();
        setMedications((prev) =>
          prev.map((m) => (m.id === medication.id ? medication : m))
        );
      }
    } catch {
      setError('처리에 실패했습니다.');
    }
  };

  const openAddModal = () => {
    setEditingMed(null);
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingMed(med);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMed(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">약물 관리</h1>
        <button
          onClick={openAddModal}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            닫기
          </button>
        </div>
      )}

      {/* 현재 복용 중 */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          현재 복용 중
          <span className="text-sm font-normal text-gray-500">
            ({activeMeds.length}개)
          </span>
        </h2>
        {activeMeds.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow-sm">
            현재 복용 중인 약물이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {activeMeds.map((med) => (
              <MedicationCard
                key={med.id}
                medication={med}
                onEdit={() => openEditModal(med)}
                onEnd={() => handleEndMedication(med)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 복용 종료 */}
      {endedMeds.length > 0 && (
        <section>
          <button
            onClick={() => setShowEnded(!showEnded)}
            className="mb-3 flex w-full items-center justify-between text-left"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              복용 종료
              <span className="text-sm font-normal text-gray-500">
                ({endedMeds.length}개)
              </span>
            </h2>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${
                showEnded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showEnded && (
            <div className="space-y-2">
              {endedMeds.map((med) => (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  onEdit={() => openEditModal(med)}
                  onEnd={() => {}}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 약물 추가/수정 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingMed ? '약물 수정' : '약물 추가'}
        size="lg"
      >
        <MedicationForm
          initialData={editingMed || undefined}
          onSubmit={handleSave}
          onCancel={closeModal}
          onDelete={editingMed ? handleDelete : undefined}
          isLoading={isSaving}
          isDeleting={isDeleting}
        />
      </Modal>
    </div>
  );
}
