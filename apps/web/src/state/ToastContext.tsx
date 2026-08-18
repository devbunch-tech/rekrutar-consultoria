import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { color } from '@rekrutar/tokens';
import { useIsMobile } from '../hooks/useIsMobile';

const ToastContext = createContext<(msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const isMobile = useIsMobile();

  const showToast = useCallback((text: string) => {
    setMsg(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {msg && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: isMobile ? '88px' : '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: color.navy,
            color: '#fff',
            padding: '14px 22px',
            borderRadius: '10px',
            fontSize: 14,
            fontWeight: 600,
            animation: 'rkToast .3s ease',
            maxWidth: '90vw',
            textAlign: 'center',
          }}
        >
          {msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = (): ((msg: string) => void) => useContext(ToastContext);
