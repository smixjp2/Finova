// Custom hook for real-time financial data synchronization
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export function useRealTimeData(userId: string) {
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  // Trigger real-time subscriptions for all tables
  useEffect(() => {
    const channels = [
      supabase
        .channel(`transactions:${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, () => {
          setIsUpdating(prev => !prev)
        })
        .subscribe(),
      
      supabase
        .channel(`savings:${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'savings', filter: `user_id=eq.${userId}` }, () => {
          setIsUpdating(prev => !prev)
        })
        .subscribe(),
      
      supabase
        .channel(`budgets:${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${userId}` }, () => {
          setIsUpdating(prev => !prev)
        })
        .subscribe(),

      supabase
        .channel(`investments:${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'investments', filter: `user_id=eq.${userId}` }, () => {
          setIsUpdating(prev => !prev)
        })
        .subscribe(),

      supabase
        .channel(`subscriptions:${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${userId}` }, () => {
          setIsUpdating(prev => !prev)
        })
        .subscribe(),
    ]

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel))
    }
  }, [userId])

  return { isUpdating }
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
