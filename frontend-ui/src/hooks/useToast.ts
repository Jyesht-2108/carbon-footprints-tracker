import { useState, useCallback } from 'react'
import { ToastType } from '@/components/notifications/ToastNotification'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'> | Toast) => {
    const newToast: Toast = {
      id: 'id' in toast ? toast.id : `toast-${Date.now()}-${Math.random()}`,
      type: toast.type,
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 5000
    }
    
    setToasts((prev) => [...prev, newToast])
    
    return newToast.id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((title: string, message: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration })
  }, [addToast])

  const error = useCallback((title: string, message: string, duration?: number) => {
    return addToast({ type: 'error', title, message, duration })
  }, [addToast])

  const warning = useCallback((title: string, message: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration })
  }, [addToast])

  const info = useCallback((title: string, message: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
