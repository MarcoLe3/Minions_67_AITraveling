'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

const ActiveDayContext = createContext<{
  activeDay: number | null
  setActiveDay: (day: number | null) => void
}>({ activeDay: null, setActiveDay: () => {} })

export function ActiveDayProvider({ children }: { children: ReactNode }) {
  const [activeDay, setActiveDay] = useState<number | null>(null)
  return (
    <ActiveDayContext value={{ activeDay, setActiveDay }}>
      {children}
    </ActiveDayContext>
  )
}

export function useActiveDay() {
  return useContext(ActiveDayContext)
}