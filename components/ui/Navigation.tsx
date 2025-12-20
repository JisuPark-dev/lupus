'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '기록', icon: '📅' },
  { href: '/medications', label: '약물', icon: '💊' },
  { href: '/report', label: '보고서', icon: '📊' },
  { href: '/settings', label: '설정', icon: '⚙️' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/50 bg-white/90 backdrop-blur-xl safe-area-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[48px] min-w-[64px] flex-1 flex-col items-center justify-center rounded-xl py-1 transition-all active:scale-95 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 active:bg-gray-100'
              }`}
            >
              <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`mt-0.5 text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
