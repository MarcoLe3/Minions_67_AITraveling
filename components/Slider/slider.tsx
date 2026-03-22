import { Slider } from "@/components/ui/slider"

export function SliderRange(low: number, high: number) {
    
    return (
        <Slider
            defaultValue={[low, high]}
            max={100}
            step={5}
            className="mx-auto w-full max-w-xs"
        />
    )
}
