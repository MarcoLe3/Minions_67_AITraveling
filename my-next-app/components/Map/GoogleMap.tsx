'use client'
import { APIProvider, Map, AdvancedMarker, useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
import {useRef, useEffect} from "react"
import MapRenderDirections from "@/components/Map/MapLines"

//TODO: Pan to user
function MapUserPanTo(){
    const map = useMap();
    useEffect(()=>{
        
        if (!map || !navigator.geolocation) console.log("hi");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.panTo(userPosition);
                
            },
            (error)=>{
                console.log(error)
            },
            { enableHighAccuracy: true }
        );

    },[map, navigator.geolocation])
    return null;
}

export default function MainMap() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API
    const mapId = process.env.NEXT_PUBLIC_MAP_ID

    return (
        <APIProvider apiKey={apiKey as string}>
            <div style={{height:'100vh', width:'100%'}}>
                <Map
                    defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
                    defaultZoom={15}
                    mapId={mapId}
                    disableDefaultUI={true}
                >
                    {/* <MapUserPanTo /> */}
                    <MapRenderDirections
                        originLocation="San Francisco State University" 
                        destinationLocation="San Jose State University"
                    />
                </Map>
            </div>
        </APIProvider>
    );
}
