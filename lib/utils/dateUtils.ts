// 날짜를 YYYY-MM-DD 형식으로 변환
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// YYYY-MM-DD 문자열을 Date로 변환
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// 해당 월의 첫 번째 날
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

// 해당 월의 마지막 날
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

// 해당 월의 일 수
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// 해당 월의 달력 데이터 생성 (이전/다음 달 포함)
export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = getFirstDayOfMonth(year, month);
  const lastDay = getLastDayOfMonth(year, month);

  const days: Date[] = [];

  // 이전 달의 날짜들 (첫 주 채우기)
  const firstDayOfWeek = firstDay.getDay(); // 0 = 일요일
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    days.push(prevDate);
  }

  // 현재 달의 날짜들
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // 다음 달의 날짜들 (마지막 주 채우기)
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
  }

  return days;
}

// 오늘 날짜인지 확인
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

// 같은 달인지 확인
export function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

// 같은 날인지 확인
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// 월 이름 (한국어)
export const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

// 요일 이름 (한국어)
export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// 날짜 범위 내에 있는지 확인
export function isDateInRange(date: Date, startDate: string, endDate?: string | null): boolean {
  const dateStr = formatDate(date);
  if (dateStr < startDate) return false;
  if (endDate && dateStr > endDate) return false;
  return true;
}

// 두 날짜 사이의 일수 계산
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 기간을 읽기 쉬운 형태로 변환
export function formatDuration(days: number): string {
  if (days < 7) return `${days}일`;
  if (days < 30) return `${Math.floor(days / 7)}주`;
  if (days < 365) return `${Math.floor(days / 30)}개월`;
  return `${Math.floor(days / 365)}년`;
}
