import { Slider } from "@/components/ui/slider"
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import Box from '@mui/material/Box';
import SliderMUI from '@mui/material/Slider'; 
=======
>>>>>>> e1a44b0 (starting dashboard for map)
=======
>>>>>>> f4230e7 (starting dashboard for map)
=======
import Box from '@mui/material/Box';
import SliderMUI from '@mui/material/Slider'; 
>>>>>>> 97e0067 (might mess up everything)
=======
>>>>>>> e1a44b0 (starting dashboard for map)

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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 97e0067 (might mess up everything)

function valuetext(value: number) {
  return `${value}`;
}

export function DiscreteSliderSteps() {
  return (
    <Box sx={{ width: 300 }}>
      <SliderMUI
        aria-label="Small steps"
        defaultValue={0}
        getAriaValueText={valuetext}
        step={10000}
        marks
        min={0}
        max={100000}
        valueLabelDisplay="auto"
      />
    </Box>
  );
<<<<<<< HEAD
}
=======
>>>>>>> e1a44b0 (starting dashboard for map)
=======
>>>>>>> f4230e7 (starting dashboard for map)
=======
}
>>>>>>> 97e0067 (might mess up everything)
=======
>>>>>>> e1a44b0 (starting dashboard for map)
