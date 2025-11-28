import { useEffect, useCallback } from 'react'
import { wsService } from '@/services/websocket'

interface WebSocketEvents {
  'new_alert': (data: any) => void
  'hotspot_detected': (data: any) => void
  'recommendation_generated': (data: any) => void
  'emission_update': (data: any) => void
  'data_processed': (data: any) => void
}

export function useWebSocket() {
  useEffect(() => {
    // Connect on mount
    wsService.connect()

    // Cleanup on unmount
    return () => {
      wsService.disconnect()
    }
  }, [])

  const subscribe = useCallback(<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ) => {
    wsService.on(event, callback)
    
    // Return unsubscribe function
    return () => {
      wsService.off(event, callback)
    }
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    wsService.emit(event, data)
  }, [])

  return {
    subscribe,
    emit,
    isConnected: wsService.isConnected(),
  }
}
