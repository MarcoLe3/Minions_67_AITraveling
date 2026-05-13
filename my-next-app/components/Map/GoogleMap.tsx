'use client'
import { APIProvider, Map, AdvancedMarker, useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
import {useRef, useEffect} from "react"
import MapRenderDirections from "@/components/Map/MapLines"

//TODO: Pan to user
function MapUserPanTo(){
    const map = useMap();
    useEffect(()=>{
        
        if (!map || !navigator.geolocation) return;
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

    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('itineraryData') : null
    const result = raw ? JSON.parse(raw) : null
    const days = result.days 
    const defaultCenter = days?.[0]?.origin_lat ? { lat: days[0].origin_lat, lng: days[0].origin_lng } : { lat: 37.7749, lng: -122.4194 };

    return (
        <APIProvider apiKey={apiKey as string}>
            <div style={{height:'100vh', width:'100%'}}>
                <Map
                    defaultCenter={defaultCenter}
                    defaultZoom={11}
                    mapId={mapId}
                    disableDefaultUI={true}
                >
                     <MapUserPanTo /> 
                     {days.map((day: any, index: number) => (
                         <MapRenderDirections
                            key={index}
                            index={index+1}
                            originLocation={day.origin}
                            originLat={day.origin_lat}
                            originLng={day.origin_lng}
                            destinationLocation={day.destination}
                            destinationLat={day.destination_lat}
                            destinationLng={day.destination_lng}
                        />
                    ))}
                </Map>
            </div>
        </APIProvider>
    );
}
