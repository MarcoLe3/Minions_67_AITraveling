import DestinationForm from "@/components/Form/DestinationForm.tsx"
import {merriweather} from "./layout.tsx"

export default function Home() {
  return (
    <main
      className=" flex justify-center h-[80vh] w-screen "
    > 
      <div
         className="flex flex-col items-center gap-2 justify-center h-[30vh] w-screen bg-blue-500"
      >
          <h1 className={`text-4xl text-white ${merriweather.className}`}>Travel Easy</h1>
          <DestinationForm/>
      </div>
    </main>
  )
}
