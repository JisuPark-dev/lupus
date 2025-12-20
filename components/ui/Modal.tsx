'use client';

import { useEffect, useCallback, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // 스와이프 다운으로 닫기
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!modalRef.current) return;
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      modalRef.current.style.transform = `translateY(${diff}px)`;
      modalRef.current.style.transition = 'none';
    }
  };

  const handleTouchEnd = () => {
    if (!modalRef.current) return;
    const diff = currentY.current - startY.current;

    modalRef.current.style.transition = 'transform 0.3s ease-out';

    if (diff > 100) {
      modalRef.current.style.transform = 'translateY(100%)';
      setTimeout(onClose, 300);
    } else {
      modalRef.current.style.transform = 'translateY(0)';
    }

    startY.current = 0;
    currentY.current = 0;
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-2',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center pb-[calc(4rem+env(safe-area-inset-bottom,0px))] sm:items-center sm:pb-20 sm:pt-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} max-h-[calc(100vh-6rem-env(safe-area-inset-bottom,0px))] overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100vh-8rem)] sm:rounded-2xl animate-slide-up`}
      >
        {/* Drag Handle (모바일) */}
        <div
          className="flex justify-center py-2 sm:hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3 sm:py-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 active:bg-gray-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto overscroll-contain px-5 py-4 pb-6 sm:max-h-[calc(85vh-80px)] sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
