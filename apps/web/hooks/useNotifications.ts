import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { getActivityFeed } from '../lib/api'
import { Notification } from '../components/Notifications'
import { ActivityItem } from '../types/api'
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'kitabu_notifications_read_state'

interface ReadState {
  readIds: string[]
  lastClearedTimestamp: number
}

export function useNotifications() {
  const { isConnected } = useAccount()
  const [readState, setReadState] = useState<ReadState>(() => {
    if (typeof window === 'undefined') return { readIds: [], lastClearedTimestamp: 0 }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : { readIds: [], lastClearedTimestamp: 0 }
    } catch {
      return { readIds: [], lastClearedTimestamp: 0 }
    }
  })

  // Persist read state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readState))
    }
  }, [readState])

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getActivityFeed(50, 0), // Fetch last 50 items
    enabled: isConnected, // Only fetch if wallet is connected
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000,
  })

  // Transform ActivityItem to Notification
  const notifications: Notification[] = (activities || [])
    .filter(item => item.timestamp > readState.lastClearedTimestamp) // Filter out cleared notifications
    .map((item: ActivityItem) => {
      let type: Notification['type'] = 'info'
      if (item.status === 'completed') type = 'success'
      if (item.status === 'failed') type = 'error'
      if (item.status === 'pending') type = 'warning'

      return {
        id: item.id,
        title: getTitle(item),
        message: item.description,
        type,
        timestamp: new Date(item.timestamp),
        read: readState.readIds.includes(item.id)
      }
    })
    // Sort by newest first
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const markAsRead = useCallback((id: string) => {
    setReadState(prev => {
      if (prev.readIds.includes(id)) return prev
      return { ...prev, readIds: [...prev.readIds, id] }
    })
  }, [])

  const clearAll = useCallback(() => {
    setReadState(prev => ({
      ...prev,
      lastClearedTimestamp: Date.now(),
      readIds: [] // Optional: reset read IDs since we are filtering by timestamp now
    }))
  }, [])

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    clearAll,
    isConnected
  }
}

function getTitle(item: ActivityItem): string {
  switch (item.type) {
    case 'payment':
      return `Payment ${capitalize(item.status)}`
    case 'yield':
      return `Yield Update`
    case 'invoice':
      return `Invoice ${capitalize(item.status)}`
    case 'system':
      return 'System Alert'
    default:
      return 'Notification'
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
