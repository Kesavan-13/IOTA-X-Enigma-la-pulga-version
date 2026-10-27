import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg: string) => addToast('success', msg), [addToast]);
  const error = useCallback((msg: string) => addToast('error', msg), [addToast]);
  const info = useCallback((msg: string) => addToast('info', msg), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-lg border p-3.5 shadow-lg backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'border-teal-500/30 bg-teal-950/80 text-teal-200'
                : toast.type === 'error'
                ? 'border-red-500/30 bg-red-950/80 text-red-200'
                : 'border-border bg-card/90 text-foreground'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />}
            {toast.type === 'info' && <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />}
            <p className="text-[12.5px] leading-snug flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground -mr-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg: string) => console.log('[Success]', msg),
      error: (msg: string) => console.error('[Error]', msg),
      info: (msg: string) => console.log('[Info]', msg),
    };
  }
  return context;
}
