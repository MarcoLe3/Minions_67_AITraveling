'use client';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState, useMemo, useRef } from 'react';

interface RouteComponentProp {
  index: number;
  originLocation: string;
  destinationlocation:string;
}

export default function MapRenderDirections({originLocation, destinationLocation}: RouteComponentProp){
  const [route, setRoute] = useState<google.maps.DirectionsResult[]>([]);
  const [travelingMode, setTravelingMode] = useState("WALKING");
  const directionRenderer = useRef(null)
  const directionService = useRef(null)

  const map = useMap();
  const routeLib = useMapsLibrary("routes");

  useEffect(()=>{
    if (!routeLib || !map) return;
    if (!directionRenderer.current){
      directionRenderer.current = new routeLib.DirectionsRenderer({map});
    } 
    if (!directionService.current) {
      directionService.current = new routeLib.DirectionsService();
    }

    return ()=>{
      directionRenderer.current = null;
      directionService.current = null;
    }
  },[routeLib, map, directionRenderer, directionService])

  useEffect(()=> {
    if (!routeLib || !directionRenderer.current || !directionService.current ) {
      return;
    }

    const renderRoute = async()=> {
      try{
        const routeInformation = await directionService.current.route({
          origin: originLocation,
          destination: destinationLocation,
          travelMode: google.maps.TravelMode[travelingMode],
          provideRouteAlternatives: true
        })

        directionRenderer.current.setDirections(routeInformation)
        setRoute((prevRoute: google.maps.DirectionsResult[]) => [...prevRoute,routeInformation])
      } catch (error) {
        console.error("unavaliable routeInfromation", error)
      }
    }

    renderRoute()

  },[routeLib,destinationLocation,originLocation,directionRenderer.current,directionService.current])

  return (
    <div>

    </div>
  )
}