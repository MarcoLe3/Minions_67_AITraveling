'use client'
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Image from 'next/image'
import BasicButton from '@/components/Button/BasicButton.tsx'
import { usePostContext } from '@/Context/PostProvider'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlaceResult {
  name: string
  lat: number
  lng: number
}

// ── Date picker (unchanged) ───────────────────────────────────────────────────

export function DatePickerWithRange({ name }: { name: string }) {
  const [date, setDate] = useState<DateRange | undefined>(undefined)
  return (
    <Field className="mx-auto w-60">
      <input type="hidden" name={`${name}_from`} value={date?.from?.toISOString() || ''} />
      <input type="hidden" name={`${name}_to`} value={date?.to?.toISOString() || ''} />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" id="date-picker-range" className="justify-start px-2.5 font-semibold">
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <span>{format(date.from, 'LLL dd, y')} – {format(date.to, 'LLL dd, y')}</span>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}

// ── Plain text input (used for Budget) ───────────────────────────────────────

function PlainInput({ id, label, name, image }: { id: string; label: string; name: string; image: string }) {
  return (
    <Box>
      <TextField
        id={id}
        name={name}
        label={label}
        InputLabelProps={{ className: '!text-xl !font-normal' }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Image alt="icon" width={20} height={20} src={image} />
              </InputAdornment>
            ),
          },
        }}
        variant="standard"
      />
    </Box>
  )
}

// ── City autocomplete input ───────────────────────────────────────────────────

function PlaceAutocompleteInput({
  label,
  image,
  onPlaceSelect,
}: {
  label: string
  image: string
  onPlaceSelect: (place: PlaceResult) => void
}) {
  const [value, setValue] = useState('')
  const [inputEl, setInputEl] = useState<HTMLInputElement | null>(null)
  const places = useMapsLibrary('places')
  // Keep callback ref stable so the Places effect doesn't re-run on parent re-renders
  const onSelectRef = useRef(onPlaceSelect)
  useEffect(() => { onSelectRef.current = onPlaceSelect }, [onPlaceSelect])

  useEffect(() => {
    if (!places || !inputEl) return

    const autocomplete = new places.Autocomplete(inputEl, {
      types: ['(cities)'],
      fields: ['geometry', 'name'],
    })

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry?.location) return
      const name = place.name ?? ''
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      setValue(name)
      onSelectRef.current({ name, lat, lng })
    })

    return () => google.maps.event.removeListener(listener)
  }, [places, inputEl])

  return (
    <Box>
      <TextField
        label={label}
        value={value}
        onChange={e => setValue(e.target.value)}
        inputRef={setInputEl}
        InputLabelProps={{ className: '!text-xl !font-normal' }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Image alt="icon" width={20} height={20} src={image} />
              </InputAdornment>
            ),
          },
        }}
        variant="standard"
      />
    </Box>
  )
}

// ── Form body (must be inside APIProvider to use useMapsLibrary) ──────────────

function FormBody() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const { sendDataToServer, loading } = usePostContext()

  const [origin, setOrigin] = useState<PlaceResult | null>(null)
  const [destination, setDestination] = useState<PlaceResult | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!origin || !destination) {
      alert('Please select both origin and destination from the autocomplete suggestions.')
      return
    }

    const data = new FormData(formRef.current!)
    const payload = Object.fromEntries(data.entries())

    const fromStr = payload['date-range_from'] as string
    const toStr = payload['date-range_to'] as string
    if (!fromStr || !toStr) {
      alert('Please select a date range.')
      return
    }

    const from = new Date(fromStr)
    const to = new Date(toStr)
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      alert('Invalid dates selected.')
      return
    }

    const diffTime = Math.abs(to.getTime() - from.getTime())
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    const requestData = {
      paths: [[
        { name: origin.name, lat: origin.lat, lng: origin.lng },
        { name: destination.name, lat: destination.lat, lng: destination.lng },
      ]],
      budget: Number(payload.budget) || 1000,
      days: Math.floor(days),
    }

    console.log('Sending to server:', requestData)
    const result = await sendDataToServer(requestData)

    if (result?.success) {
      router.push('/map/demoMap')
    } else {
      console.error('Search failed:', result?.error)
      alert(`Search failed: ${result?.error || 'Unknown error'}`)
    }
  }

  return (
    <form
      noValidate
      autoComplete="off"
      className="z-10 flex flex-col items-end w-auto gap-4 bg-white p-4 rounded-lg"
      ref={formRef}
      onSubmit={handleSubmit}
    >
      <section className="flex gap-4 items-end">
        <PlaceAutocompleteInput
          label="Leaving from"
          image="/destination.svg"
          onPlaceSelect={setOrigin}
        />
        <PlaceAutocompleteInput
          label="Going to"
          image="/destination.svg"
          onPlaceSelect={setDestination}
        />
        <PlainInput name="budget" id="budget" label="Budget" image="/money.svg" />
        <DatePickerWithRange name="date-range" />
      </section>
      <BasicButton type="submit" text={loading ? 'Searching...' : 'Search'} />
    </form>
  )
}

// ── Default export — wraps in APIProvider so Places library is available ──────

export default function DestinationForm() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API
  return (
    <APIProvider apiKey={apiKey as string}>
      <FormBody />
    </APIProvider>
  )
}
