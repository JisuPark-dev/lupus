'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils/dateUtils';
import {
  exportLogsToCSV,
  exportMedicationsToCSV,
  downloadCSV,
} from '@/lib/utils/exportUtils';
import Modal from '@/components/ui/Modal';
import HospitalList from '@/components/settings/HospitalList';
import HospitalForm from '@/components/settings/HospitalForm';
import { usePushNotification } from '@/components/PushNotificationProvider';
import type { HealthLog } from '@/types/logs';
import type { Medication } from '@/types/medications';
import type { UserHospital } from '@/types/hospitals';

type HospitalModalMode = 'none' | 'add' | 'edit';

export default function SettingsPage() {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [hospitals, setHospitals] = useState<UserHospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRequestingPush, setIsRequestingPush] = useState(false);
  const [isSendingTestPush, setIsSendingTestPush] = useState(false);
  const router = useRouter();
  const { fcmToken, isSupported, requestPermission } = usePushNotification();

  // 병원 관련 상태
  const [hospitalModalMode, setHospitalModalMode] = useState<HospitalModalMode>('none');
  const [selectedHospital, setSelectedHospital] = useState<UserHospital | null>(null);
  const [isSavingHospital, setIsSavingHospital] = useState(false);
  const [isDeletingHospital, setIsDeletingHospital] = useState(false);

  const today = formatDate(new Date());

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, medsRes, hospitalsRes] = await Promise.all([
          fetch('/api/health-logs'),
          fetch('/api/medications'),
          fetch('/api/user-hospitals'),
        ]);

        if (logsRes.ok) {
          const data = await logsRes.json();
          setLogs(data.logs || []);
        }

        if (medsRes.ok) {
          const data = await medsRes.json();
          setMedications(data.medications || []);
        }

        if (hospitalsRes.ok) {
          const data = await hospitalsRes.json();
          setHospitals(data.hospitals || []);
        }
      } catch {
        // 에러 처리
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 병원 추가
  const handleAddHospital = () => {
    setSelectedHospital(null);
    setHospitalModalMode('add');
  };

  // 병원 수정 모달 열기
  const handleEditHospital = (hospital: UserHospital) => {
    setSelectedHospital(hospital);
    setHospitalModalMode('edit');
  };

  // 병원 저장 (추가/수정)
  const handleSaveHospital = async (data: {
    name: string;
    start_date: string;
    end_date: string | null;
    is_primary: boolean;
  }) => {
    setIsSavingHospital(true);
    try {
      if (hospitalModalMode === 'add') {
        const res = await fetch('/api/user-hospitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const { hospital } = await res.json();
          // is_primary가 true인 경우 기존 목록에서 다른 병원들의 is_primary를 false로 변경
          if (data.is_primary) {
            setHospitals((prev) =>
              [hospital, ...prev.map((h) => ({ ...h, is_primary: false }))]
            );
          } else {
            setHospitals((prev) => [hospital, ...prev]);
          }
          closeHospitalModal();
        }
      } else if (hospitalModalMode === 'edit' && selectedHospital) {
        const res = await fetch(`/api/user-hospitals/${selectedHospital.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const { hospital } = await res.json();
          // is_primary가 true인 경우 기존 목록에서 다른 병원들의 is_primary를 false로 변경
          setHospitals((prev) =>
            prev.map((h) => {
              if (h.id === hospital.id) return hospital;
              if (data.is_primary) return { ...h, is_primary: false };
              return h;
            })
          );
          closeHospitalModal();
        }
      }
    } catch {
      // 에러 처리
    } finally {
      setIsSavingHospital(false);
    }
  };

  // 병원 삭제
  const handleDeleteHospital = async (hospital: UserHospital) => {
    if (!confirm(`"${hospital.name}"을(를) 삭제하시겠습니까?`)) return;

    setIsDeletingHospital(true);
    try {
      const res = await fetch(`/api/user-hospitals/${hospital.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setHospitals((prev) => prev.filter((h) => h.id !== hospital.id));
      }
    } catch {
      // 에러 처리
    } finally {
      setIsDeletingHospital(false);
    }
  };

  // 병원 모달 닫기
  const closeHospitalModal = () => {
    setHospitalModalMode('none');
    setSelectedHospital(null);
  };

  // 통계 계산
  const stats = useMemo(() => {
    const totalLogs = logs.length;
    const uniqueDays = new Set(logs.map((l) => l.log_date)).size;
    const totalMeds = medications.length;
    const activeMeds = medications.filter(
      (m) => !m.end_date || m.end_date >= today
    ).length;
    const firstLogDate = logs.length > 0
      ? logs.reduce((min, l) => (l.log_date < min ? l.log_date : min), logs[0].log_date)
      : null;

    return { totalLogs, uniqueDays, totalMeds, activeMeds, firstLogDate };
  }, [logs, medications, today]);

  // 건강 기록 내보내기
  const handleExportLogs = () => {
    const csv = exportLogsToCSV(logs);
    if (csv) {
      downloadCSV(csv, `lupus-건강기록-${today}.csv`);
    }
  };

  // 약물 내보내기
  const handleExportMedications = () => {
    const csv = exportMedicationsToCSV(medications);
    if (csv) {
      downloadCSV(csv, `lupus-약물정보-${today}.csv`);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      setIsLoggingOut(false);
    }
  };

  // 푸시 알림 권한 요청 및 토큰 저장
  const handleRequestPushPermission = async () => {
    setIsRequestingPush(true);
    try {
      await requestPermission();
    } finally {
      setIsRequestingPush(false);
    }
  };

  // FCM 토큰이 생성되면 서버에 저장
  useEffect(() => {
    if (fcmToken) {
      fetch('/api/fcm-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: fcmToken }),
      }).catch(console.error);
    }
  }, [fcmToken]);

  // 서버를 통한 푸시 알림 테스트
  const handleTestPush = async () => {
    if (!fcmToken) {
      alert('먼저 알림 권한을 허용해주세요.');
      return;
    }

    setIsSendingTestPush(true);
    try {
      const res = await fetch('/api/push/test', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || '푸시 알림 전송에 실패했습니다.');
      }
    } catch {
      alert('푸시 알림 전송에 실패했습니다.');
    } finally {
      setIsSendingTestPush(false);
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
    <div className="space-y-6">
      {/* 헤더 */}
      <h1 className="text-xl font-bold text-gray-900">설정</h1>

      {/* 푸시 알림 */}
      {isSupported && (
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">푸시 알림</h2>
          <div className="space-y-3">
            {!fcmToken ? (
              <button
                onClick={handleRequestPushPermission}
                disabled={isRequestingPush}
                className="w-full rounded-lg bg-violet-600 py-3 font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
              >
                {isRequestingPush ? '권한 요청 중...' : '알림 권한 허용하기'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  알림이 활성화되었습니다
                </div>
                <button
                  onClick={handleTestPush}
                  disabled={isSendingTestPush}
                  className="w-full rounded-lg bg-violet-100 py-3 font-medium text-violet-700 transition-colors hover:bg-violet-200 disabled:opacity-50"
                >
                  {isSendingTestPush ? '전송 중...' : '테스트 알림 보내기 (Hello World)'}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 내 병원 */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">내 병원</h2>
          <button
            onClick={handleAddHospital}
            className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            추가
          </button>
        </div>
        <HospitalList
          hospitals={hospitals}
          onEdit={handleEditHospital}
          onDelete={handleDeleteHospital}
          isDeleting={isDeletingHospital}
        />
      </section>

      {/* 데이터 현황 */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">데이터 현황</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">총 기록 수</span>
            <span className="font-medium text-gray-900">{stats.totalLogs}건</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">기록한 날 수</span>
            <span className="font-medium text-gray-900">{stats.uniqueDays}일</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">등록 약물 수</span>
            <span className="font-medium text-gray-900">
              {stats.totalMeds}개 (복용 중 {stats.activeMeds}개)
            </span>
          </div>
          {stats.firstLogDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">첫 기록 날짜</span>
              <span className="font-medium text-gray-900">
                {stats.firstLogDate.replace(/-/g, '.')}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 데이터 내보내기 */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">데이터 내보내기</h2>
        <div className="space-y-3">
          <button
            onClick={handleExportLogs}
            disabled={logs.length === 0}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">건강 기록 (CSV)</p>
                <p className="text-sm text-gray-500">Excel에서 열 수 있는 형식</p>
              </div>
            </div>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <button
            onClick={handleExportMedications}
            disabled={medications.length === 0}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💊</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">약물 정보 (CSV)</p>
                <p className="text-sm text-gray-500">Excel에서 열 수 있는 형식</p>
              </div>
            </div>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </section>

      {/* 계정 */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">계정</h2>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full rounded-lg bg-gray-100 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
        >
          {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </section>

      {/* 앱 정보 */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">앱 정보</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">버전</span>
            <span className="text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">저장 방식</span>
            <span className="text-gray-900">Supabase (클라우드)</span>
          </div>
        </div>
      </section>

      {/* 안내 */}
      <p className="text-center text-sm text-gray-400">
        루푸스 건강 기록 앱 - Lupus Health Tracker
      </p>

      {/* 병원 추가/수정 모달 */}
      <Modal
        isOpen={hospitalModalMode !== 'none'}
        onClose={closeHospitalModal}
        title={hospitalModalMode === 'add' ? '병원 추가' : '병원 수정'}
      >
        <HospitalForm
          hospital={selectedHospital}
          onSubmit={handleSaveHospital}
          onCancel={closeHospitalModal}
          isLoading={isSavingHospital}
        />
      </Modal>
    </div>
  );
}
