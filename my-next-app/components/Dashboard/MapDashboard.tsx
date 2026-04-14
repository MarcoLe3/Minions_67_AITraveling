'use client'

import Image from "next/image"
import {DiscreteSliderSteps} from "@/components/Slider/slider.tsx"
import {useState} from 'react'
import BasicButtons from "@/components/Button/BasicButton.tsx"
import RadioGroup from "@/components/Radio/RadioGroup.tsx"
import usePost from "@/hooks/usePost.ts"

interface MapDashboardProps {
    menuImage: string;
    settingImage: string;
}

function SettingDashboard() {
  const [budget, setBudget] = useState(1)
  const [days, setDays] = useState(1)  // add this
  const { sendDataToServer, loading, error } = usePost('http://localhost:8000/generate-itinerary')
  const [result, setResult] = useState<{itinerary: string, success: boolean, error: string | null} | null>(null)

  const handleApply = async () => {
    if(!days) return;
    const data = await sendDataToServer({
      origin: "San Francisco",       // placeholder
      destination: "San Jose",       // placeholder
      budget,
      days 
    })
    setResult(data)
  }

  return (
    <div className="p-4 w-[400px] bg-white flex justify-center flex-col">
      <p>Budget</p>
      <DiscreteSliderSteps value={budget} onChange={setBudget} /> 
      <p>Duration of Trip</p>
      <input
        id="daysInput"
        type="number"
        required
        min="1"
        value={days}
        onChange={(e) => setDays(Number(e.target.valueAsNumber))}
        placeholder="Number of Days"
        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      <RadioGroup />
      <BasicButtons onClick={handleApply} />
      {loading && <p>Generating...</p>}
      {error && <p>Something went wrong.</p>}
      {result && <pre>{result.itinerary}</pre>}
    </div>
  )
}

export function MainDashboard(props: MapDashboardProps){
    const [openMenuDashboard,setOpenMenuDashboard] = useState(false);
    const [openSettingDashboard,setOpenSettingDashboard] = useState(false);
    
    const handleMenuDashboard = () => {
        setOpenMenuDashboard(status => !status)
    }

    const handleSettingDashboard = () => {
        setOpenSettingDashboard(status => !status)
    }

    return (
        <div
            className="flex fixed z-10"
        >
            <section
                className="h-screen w-auto p-4 flex flex-col items-center gap-8 bg-teal-50"
            >
                <button
                    onClick={handleMenuDashboard}
                    className="cursor-pointer hover:bg-gray-200 rounded-4xl p-1"
                >
                    <Image
                        src={`${props.menuImage}`}
                        alt="Place Image"
                        width={50}
                        height={50}
                    />
                </button>
                <button
                    className="flex flex-col cursor-pointer items-center font-medium"
                    onClick={handleSettingDashboard}
                >
                    <Image
                        src={`${props.settingImage}`}
                        alt="user setting"
                        width={50}
                        height={50}
                        className="cursor-pointer hover:bg-gray-200 rounded-4xl p-1"
                    />
                    <p>User Setting</p>
                </button>
            </section>
            {openSettingDashboard && <SettingDashboard/>}
        </div>

    )
}