'use client'
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'

type ActivityKey = string // `${dayIndex}-${activityIndex}`

export interface ActivityFull {
  globalIndex: number
  dayIndex: number
  activityIndex: number
  name: string
  description: string
  estimated_cost: number
  lat: number
  lng: number
  image_url: string
}

export interface ActiveActivity {
  globalIndex: number
  lat: number
  lng: number
}

interface ItineraryContextType {
  activities: ActivityFull[]
  removeActivity: (dayIndex: number, activityIndex: number) => void
  activeActivity: ActiveActivity | null
  setActiveActivity: (a: ActiveActivity | null) => void
  days: any[]
}

const ItineraryContext = createContext<ItineraryContextType>({
  activities: [],
  removeActivity: () => {},
  activeActivity: null,
  setActiveActivity: () => {},
  days: [],
})

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState<any[]>([])
  const [removedKeys, setRemovedKeys] = useState<Set<ActivityKey>>(new Set())
  const [activeActivity, setActiveActivity] = useState<ActiveActivity | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = sessionStorage.getItem('itineraryData')
    if (raw) {
      try {
        const data = JSON.parse(raw)
        setDays(data.days ?? [])
      } catch {
        setDays([])
      }
    }
  }, [])

  const activities = useMemo<ActivityFull[]>(() => {
    const result: ActivityFull[] = []
    days.forEach((day, dayIdx) => {
      ;(day.activities ?? []).forEach((activity: any, actIdx: number) => {
        const key: ActivityKey = `${dayIdx}-${actIdx}`
        if (!removedKeys.has(key)) {
          result.push({
            globalIndex: result.length + 1,
            dayIndex: dayIdx,
            activityIndex: actIdx,
            name: activity.name ?? '',
            description: activity.description ?? '',
            estimated_cost: activity.estimated_cost ?? 0,
            lat: activity.lat ?? 0,
            lng: activity.lng ?? 0,
            image_url: activity.image_url ?? '',
          })
        }
      })
    })
    return result
  }, [days, removedKeys])

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const key: ActivityKey = `${dayIndex}-${activityIndex}`
    setRemovedKeys(prev => new Set(prev).add(key))
    setActiveActivity(null)
  }

  return (
    <ItineraryContext value={{ activities, removeActivity, activeActivity, setActiveActivity, days }}>
      {children}
    </ItineraryContext>
  )
}

export function useItinerary() {
  return useContext(ItineraryContext)
}
