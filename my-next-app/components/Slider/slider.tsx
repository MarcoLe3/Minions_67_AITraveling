import { Slider } from "@/components/ui/slider"
import Box from '@mui/material/Box';
import SliderMUI from '@mui/material/Slider'; 

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

function valuetext(value: number) {
  return `${value}`;
}

interface DiscreteSliderStepsProps {
    value: number
    onChange: (value: number) => void
}

export function DiscreteSliderSteps({ value, onChange }: DiscreteSliderStepsProps) {
  return (
    <Box sx={{ width: 300 }}>
      <SliderMUI
        aria-label="Small steps"
        defaultValue={0}
        value={value}
        onChange={(_, v) => onChange(v as number)}
        getAriaValueText={valuetext}
        step={10000}
        marks
        min={0}
        max={100000}
        valueLabelDisplay="auto"
        valueLabelFormat={valuetext}
      />
    </Box>
  );
}