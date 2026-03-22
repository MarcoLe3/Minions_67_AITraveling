<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 97e0067 (might mess up everything)
'use client'

import Image from "next/image"
import {DiscreteSliderSteps} from "@/components/Slider/slider.tsx"
import {useState} from 'react'
import BasicButtons from "@/components/Button/BasicButton.tsx"
import RadioGroup from "@/components/Radio/RadioGroup.tsx"

interface MapDashboardProps {
    menuImage: string;
    settingImage: string;
}

function SettingDashboard(){
    return (
        <div className="p-4 w-[400px] bg-white flex justify-center flex-col">
            <p>Budget</p>
            <DiscreteSliderSteps/>
            <RadioGroup/>
            <BasicButtons/>
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

<<<<<<< HEAD
=======
=======
>>>>>>> f4230e7 (starting dashboard for map)
=======
>>>>>>> e1a44b0 (starting dashboard for map)
import Image from "next/image"

export function MapDashboard(props:object){
    return (
        <section
            className="h-screen w-[300px]"
        >
            <Image
                src={`${props.image}`}
                alt="Place Image"
                width={300}
                height={300}
            />
            <h2>
                {props.heading}
            </h2>
            <p>
                {props.rating}
            </p>
        </section>
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> e1a44b0 (starting dashboard for map)
=======
>>>>>>> f4230e7 (starting dashboard for map)
=======
>>>>>>> 97e0067 (might mess up everything)
=======
>>>>>>> e1a44b0 (starting dashboard for map)
    )
}