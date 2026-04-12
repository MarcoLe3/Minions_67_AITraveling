import Map from "@/components/Map/GoogleMap"
import {MainDashboard} from "@/components/Dashboard/MapDashboard";

export default function Home() {
  return (
    <div className="flex">
      <MainDashboard
        menuImage = {`/menu.svg`}
        settingImage = {`/setting.svg`}
      />
      <Map/>
    </div>
  );
}
