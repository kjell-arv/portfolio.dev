import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const SaveStatusContext = createContext(null)

const TOAST_MS = 4000

/**
 * Wrap the app (inside Router) and call `useSaveStatus()` to show a short bottom toast after saves.
 * @param {'success' | 'error'} variant
 */
export function SaveStatusProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timeoutRef = useRef(null)

  const showSaveStatus = useCallback((message, variant = 'success') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToast({ message: String(message || '').trim() || (variant === 'error' ? 'Something went wrong.' : 'Saved.'), variant })
    timeoutRef.current = setTimeout(() => {
      setToast(null)
      timeoutRef.current = null
    }, TOAST_MS)
  }, [])

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    []
  )

  return (
    <SaveStatusContext.Provider value={showSaveStatus}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-[200] flex w-[min(100%,22rem)] -translate-x-1/2 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:bottom-8"
        >
          <div
            className={`pointer-events-auto w-full rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-md transition ${
              toast.variant === 'success'
                ? 'border-emerald-200/90 bg-emerald-50/95 text-emerald-950'
                : 'border-red-200/90 bg-red-50/95 text-red-950'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </SaveStatusContext.Provider>
  )
}

export function useSaveStatus() {
  const ctx = useContext(SaveStatusContext)
  if (!ctx) {
    throw new Error('useSaveStatus must be used within SaveStatusProvider')
  }
  return ctx
}
