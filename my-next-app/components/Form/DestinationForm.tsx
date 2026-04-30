'use client';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Image from "next/image"
import BasicButton from "@/components/Button/BasicButton.tsx"
import {usePost} from "@/hooks/usePost.ts"
import {
  useState,
  useRef
} from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon, Link } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DestinationIconInput {
    id: string;
    label: string;
    name: string;
    image: string;
}

interface DatePickerWithRangeProp {
  name: string;
}

export function DatePickerWithRange({name}: DatePickerWithRangeProp) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  })
  return (
    <Field 
      className="mx-auto w-60"
    >
      <input type="hidden" name={`${name}_from`} value={date?.from?.toISOString() || ''}/>
      <input type="hidden" name={`${name}_to`} value={date?.to?.toISOString() || ''}/>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-range"
            className="justify-start px-2.5 font-semibold"
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <div
                >
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </div>
              ) : (
                format(date.from, "LLL dd, y")
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
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}

function DestinationIconInput({id, label, name, image}: DestinationIconInput) {
  return (
    <Box>
      <TextField
        id={id}
        name={name}
        label={label}
        inputProps={{
          className: "",
        }}
        InputLabelProps={{
          className: "!text-xl !font-normal",
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Image
                  alt="travel icon"
                  width={20}
                  height={20}
                  src={image}
                />
              </InputAdornment>
            ),
          },
        }}
        variant="standard"
      />
    </Box>
  );
}

export default function DestinationForm(){
    const formRef = useRef<HTMLFormElement>(null);
    const {sendDataToServer,loading,error} = usePost(process.env.NEXT_PUBLIC_IP ?? 'http://localhost:8000/generate-itinerary')

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(formRef.current!)
      const payload = Object.fromEntries(data.entries())

      const from = new Date(payload['date-range_from'] as string)
      const to = new Date(payload['date-range_to'] as string)
      const days = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))

      sendDataToServer({
        paths: [[
          { name: payload.origin, lat: 37.7749, lng: 122.4194 },   // hardcoded SF
          { name: payload.destination, lat: 37.34, lng: 121.89 }, // hardcoded SJ
        ]],
        budget: Number(payload.budget),
        days,
      })
}

    return (
        <div
            className=""
        >
            <form 
                noValidate 
                autoComplete="off" 
                className="z-10 flex flex-col items-end w-auto gap-4 bg-white p-4 rounded-lg "
                ref={formRef}
                onSubmit={handleFormSubmit}
            >
                <section
                  className="flex gap-4 items-end"
                >
                  <DestinationIconInput
                      name="origin"
                      id="leaving-from"
                      label="Leaving from"
                      image="/destination.svg"
                  />
                  <DestinationIconInput
                      name="destination"
                      id="going-to"
                      label="Going to"
                      image="/destination.svg"
                  />
                  <DestinationIconInput
                      name="budget"
                      id="budget"
                      label="Budget"
                      image="/money.svg"
                  />
                  <DatePickerWithRange name="date-range"/>
                </section>
                <BasicButton type="submit" text="Search"/>
            </form>
        </div>
    )
}