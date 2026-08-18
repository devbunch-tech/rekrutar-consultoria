import { useEffect } from 'react';
import { color, radius } from '@rekrutar/tokens';

interface Props {
  onClose: () => void;
  children: React.ReactNode;
  zIndex?: number;
  overlay?: string;
  maxHeight?: string;
}

/** Modal em bottom sheet — overlay escuro, cantos superiores 18px, fade-up. */
export function BottomSheet({
  onClose,
  children,
  zIndex = 100,
  overlay = 'rgba(14,42,56,0.6)',
  maxHeight = '88vh',
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = anterior;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        background: overlay,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          width: '100%',
          maxWidth: 640,
          maxHeight,
          overflowY: 'auto',
          borderRadius: radius.sheet,
          padding: 'clamp(20px, 4vw, 32px)',
          animation: 'rkFade .25s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Fechar"
    style={{
      width: 38,
      height: 38,
      background: color.chipGray,
      border: 'none',
      borderRadius: radius.control,
      cursor: 'pointer',
      fontSize: 15,
      color: color.label,
      flex: 'none',
    }}
  >
    ✕
  </button>
);
