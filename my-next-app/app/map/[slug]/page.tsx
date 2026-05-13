'use client'
import { useRouter } from 'next/navigation'
import { useState, useContext, createContext, useMemo, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { useItinerary, ActivityFull } from '@/Context/ItineraryContext'
import { ThemeToggle } from '@/components/Button/ThemeToggle'

// ── Wikipedia image helper (browser-side, no API key needed) ─────────────────

async function fetchWikiImage(query: string): Promise<string> {
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1&origin=*`
    )
    const title = (await searchRes.json())?.query?.search?.[0]?.title
    if (!title) return ''
    const imgRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800&origin=*`
    )
    const pages: Record<string, any> = (await imgRes.json())?.query?.pages ?? {}
    for (const page of Object.values(pages)) {
      if (page?.thumbnail?.source) return page.thumbnail.source as string
    }
  } catch {}
  return ''
}

// ── Photo hook — three-layer fallback ────────────────────────────────────────
// Layer 1: backend-provided Wikipedia URL (shown immediately)
// Layer 2: browser-side Wikipedia fetch (covers old session data with empty image_url)
// Layer 3: Google Places upgrade (highest quality, replaces if found)
// onError: if Places URL breaks, drops back to the Wikipedia URL

function usePlacePhoto(
  name: string,
  destination: string,
  backendUrl: string
): [string, () => void] {
  const [wikiUrl, setWikiUrl] = useState(backendUrl)
  const [placesUrl, setPlacesUrl] = useState('')
  const places = useMapsLibrary('places')

  // Sync backend URL changes (e.g. activity changes)
  useEffect(() => { setWikiUrl(backendUrl); setPlacesUrl('') }, [backendUrl])

  // Layer 2: if backend gave nothing, fetch Wikipedia from the browser
  useEffect(() => {
    if (backendUrl || !name) return
    let cancelled = false
    fetchWikiImage(`${name} ${destination}`.trim()).then(url => {
      if (!cancelled && url) setWikiUrl(url)
    })
    return () => { cancelled = true }
  }, [backendUrl, name, destination])

  // Layer 3: try to upgrade to a Google Places photo
  useEffect(() => {
    if (!places || !name) return
    let cancelled = false
    const svc = new places.PlacesService(document.createElement('div'))
    svc.findPlaceFromQuery(
      { query: destination ? `${name} ${destination}` : name, fields: ['photos'] },
      (results, status) => {
        if (!cancelled && status === places.PlacesServiceStatus.OK && results?.[0]?.photos?.[0]) {
          setPlacesUrl(results[0].photos[0].getUrl({ maxWidth: 800 }))
        }
      }
    )
    return () => { cancelled = true }
  }, [places, name, destination])

  // If Places URL breaks on load, clear it so wikiUrl shows instead
  const onError = () => setPlacesUrl('')

  return [placesUrl || wikiUrl, onError]
}

// ── Panel open/close context ────────────────────────────────────────────────

const PanelContext = createContext<{
  enable: boolean
  setEnable: (v: boolean) => void
}>({ enable: true, setEnable: () => {} })

// ── Buttons ──────────────────────────────────────────────────────────────────

function CloseButton() {
  const [hovered, setHovered] = useState(false)
  const { setEnable } = useContext(PanelContext)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setEnable(false)}
      className="cursor-pointer"
    >
      <Image alt="close" src={hovered ? '/close-active.svg' : '/close.svg'} width={25} height={25} />
    </button>
  )
}

function OpenButton() {
  const [hovered, setHovered] = useState(false)
  const { setEnable } = useContext(PanelContext)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setEnable(true)}
      className="cursor-pointer"
    >
      <Image
        alt="menu"
        src={hovered ? '/menu-active.svg' : '/menu.svg'}
        width={20}
        height={20}
        className="bg-white rounded-3xl px-2 py-2 w-fit h-fit"
      />
    </button>
  )
}

function BackToFormButton() {
  const [hovered, setHovered] = useState(false)
  const router = useRouter()
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer"
      onClick={() => router.push('/')}
    >
      <Image
        alt="back"
        src={hovered ? '/arrow-right.svg' : '/arrow-right.svg'}
        width={25}
        height={25}
        className="rotate-180 bg-black rounded-3xl px-2 py-2 w-fit h-fit"
      />
    </button>
  )
}

// ── Activity card ─────────────────────────────────────────────────────────────

interface ActivityCardProps {
  activity: ActivityFull
  isActive: boolean
  cardRef: (el: HTMLElement | null) => void
  onClick: () => void
  onRemove: () => void
}

function ActivityCard({ activity, isActive, cardRef, onClick, onRemove }: ActivityCardProps) {
  const [imgSrc, onImgError] = usePlacePhoto(activity.name, activity.destination, activity.image_url)

  return (
    <article
      ref={cardRef}
      onClick={onClick}
      className={`
        flex gap-3 w-full p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700
        transition-colors
        ${isActive
          ? 'bg-[#FFF3E0] dark:bg-orange-900/30 hover:bg-[#ffe8c4] dark:hover:bg-orange-900/40'
          : 'bg-white dark:bg-gray-900 hover:bg-[#f5f5f5] dark:hover:bg-gray-800'}
      `}
    >
      {/* Number badge */}
      <div
        className="shrink-0 flex items-center justify-center rounded-full text-white font-bold text-sm"
        style={{
          width: 30,
          height: 30,
          background: isActive ? '#E64A19' : '#FF7043',
          fontSize: 12,
          marginTop: 2,
        }}
      >
        {activity.globalIndex}
      </div>

      {/* Text content */}
      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
        <h4 className="text-sm font-semibold text-[#212121] dark:text-white truncate leading-tight">
          {activity.name}
        </h4>
        <p className="text-xs font-semibold text-[#FF7043]">
          ${activity.estimated_cost.toLocaleString()}
        </p>
        <p className="text-xs text-[#616161] dark:text-gray-400 leading-relaxed line-clamp-2">
          {activity.description}
        </p>
      </div>

      {/* Thumbnail + remove */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Remove activity"
        >
          <Image alt="remove" src="/close.svg" width={14} height={14} />
        </button>
        <div className="rounded-lg overflow-hidden bg-gray-100 w-[80px] h-[80px] shrink-0">
          {imgSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={activity.name}
              src={imgSrc}
              onError={onImgError}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </article>
  )
}

// ── Detail panel (shown when a card is active) ────────────────────────────────

function DetailPanel({ activity, onClose }: { activity: ActivityFull; onClose: () => void }) {
  const [imgSrc, onImgError] = usePlacePhoto(activity.name, activity.destination, activity.image_url)

  return (
    <aside
      className="absolute top-4 bg-white dark:bg-gray-900 rounded-2xl w-96 shadow-xl overflow-hidden flex flex-col transition-colors duration-300"
      style={{ left: 'calc(350px + 1.5rem)', maxHeight: '80vh' }}
    >
      <div className="relative w-full h-52 bg-gray-100">
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={activity.name}
            src={imgSrc}
            onError={onImgError}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer bg-white rounded-full p-1 shadow"
        >
          <Image alt="close" src="/close.svg" width={16} height={16} />
        </button>
        {/* Number badge overlay */}
        <div
          className="absolute bottom-3 left-3 flex items-center justify-center rounded-full text-white font-bold shadow"
          style={{ width: 32, height: 32, background: '#E64A19', fontSize: 13 }}
        >
          {activity.globalIndex}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 overflow-y-auto custom-scroll">
        <div>
          <h4 className="text-xl font-semibold text-[#212121] dark:text-white">{activity.name}</h4>
          <p className="text-sm font-semibold text-[#FF7043] mt-0.5">
            ${activity.estimated_cost.toLocaleString()}
          </p>
        </div>
        <p className="text-sm text-[#424242] dark:text-gray-400 leading-relaxed">{activity.description}</p>
      </div>
    </aside>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PanelPage() {
  const [enable, setEnable] = useState(true)
  const { activities, removeActivity, activeActivity, setActiveActivity } = useItinerary()

  const cardRefs = useRef<(HTMLElement | null)[]>([])

  // Scroll to card when map pin is clicked
  useEffect(() => {
    if (!activeActivity) return
    const idx = activities.findIndex(a => a.globalIndex === activeActivity.globalIndex)
    if (idx >= 0) {
      cardRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeActivity, activities])

  const totalCost = useMemo(
    () => activities.reduce((sum, a) => sum + (a.estimated_cost ?? 0), 0),
    [activities]
  )

  const activeActivityFull = activeActivity
    ? activities.find(a => a.globalIndex === activeActivity.globalIndex) ?? null
    : null

  const handleCardClick = (activity: ActivityFull) => {
    if (activeActivity?.globalIndex === activity.globalIndex) {
      setActiveActivity(null)
    } else {
      setActiveActivity({ globalIndex: activity.globalIndex, lat: activity.lat, lng: activity.lng })
    }
  }

  return (
    <PanelContext value={{ enable, setEnable }}>
      {/* theme toggle — always visible, top-right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {!enable && (
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          <BackToFormButton />
          <OpenButton />
        </div>
      )}

      {enable && (
        <>
          <div className="absolute top-4 left-4">
            <BackToFormButton />
          </div>

          <main
            className="absolute bg-white dark:bg-gray-900 rounded-2xl w-[350px] flex flex-col top-15 left-4 transition-colors duration-300"
            style={{ height: '80vh' }}
          >
            <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-[#212121] dark:text-white">Your Itinerary</h3>
              <CloseButton />
            </header>

            <div className="flex flex-col overflow-y-auto flex-1 custom-scroll">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 p-4 text-center">No activities yet.</p>
              ) : (
                activities.map((activity, idx) => (
                  <ActivityCard
                    key={`${activity.dayIndex}-${activity.activityIndex}`}
                    activity={activity}
                    isActive={activeActivity?.globalIndex === activity.globalIndex}
                    cardRef={el => { cardRefs.current[idx] = el }}
                    onClick={() => handleCardClick(activity)}
                    onRemove={() => removeActivity(activity.dayIndex, activity.activityIndex)}
                  />
                ))
              )}
            </div>

            <footer className="flex justify-end p-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-[#006064] dark:text-teal-400">
                Total: ${totalCost.toLocaleString()}
              </p>
            </footer>
          </main>
        </>
      )}

      {activeActivityFull && enable && (
        <DetailPanel
          activity={activeActivityFull}
          onClose={() => setActiveActivity(null)}
        />
      )}
    </PanelContext>
  )
}
