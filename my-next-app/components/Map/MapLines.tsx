'use client';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useActiveDay } from '@/Context/ActiveDayContext';

interface RouteComponentProp {
  index: number;
  originLocation: string;
  originLat?: number;
  originLng?: number;
  destinationLocation: string;
  destinationLat?: number;
  destinationLng?: number;
}

const renderedLocations = new Set<string>()

export default function MapRenderDirections({originLocation, destinationLocation, index, originLat, originLng, destinationLat, destinationLng}: RouteComponentProp){
  const [route, setRoute] = useState<google.maps.DirectionsResult[]>([]);
  const [travelingMode, setTravelingMode] = useState("DRIVING");
  const directionRenderer = useRef(null)
  const directionService = useRef(null)
  const { activeDay, setActiveDay } = useActiveDay()

  const map = useMap();
  const routeLib = useMapsLibrary("routes");

  useEffect(()=>{
    if (!routeLib || !map) return;
    if (!directionRenderer.current){
      directionRenderer.current = new routeLib.DirectionsRenderer({
        map,
        suppressMarkers: true});
    } 
    if (!directionService.current) {
      directionService.current = new routeLib.DirectionsService();
    }

    /* return ()=>{
      directionRenderer.current = null;
      directionService.current = null;
    } */
  },[routeLib, map, directionRenderer, directionService])

  useEffect(()=> {
    if (!routeLib || !directionRenderer.current || !directionService.current ) {
      return;
    }

    const renderRoute = async()=> {
      try{
        const origin = (originLat !== undefined && originLng !== undefined) 
          ? { lat: originLat, lng: originLng } 
          : originLocation;
          
        const destination = (destinationLat !== undefined && destinationLng !== undefined) 
          ? { lat: destinationLat, lng: destinationLng } 
          : destinationLocation;

        const routeInformation = await directionService.current.route({
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode[travelingMode],
          provideRouteAlternatives: false
        })

        directionRenderer.current.setDirections(routeInformation)

        setTimeout(() => {
        const startLocation = routeInformation.routes[0].legs[0].start_location
        const endLocation = routeInformation.routes[0].legs[0].end_location
        const startKey = `${startLocation.lat().toFixed(3)},${startLocation.lng().toFixed(3)}`
        const endKey = `${endLocation.lat().toFixed(3)},${endLocation.lng().toFixed(3)}`

        if (!renderedLocations.has(startKey)) {
          renderedLocations.add(startKey)
          const startMarker = new google.maps.Marker({
            position: startLocation,
            map,
            label: { text: `${index}`, color: 'white', fontWeight: 'bold' }
          })
          startMarker.addListener('click', () => {
            setActiveDay(index)
          })
        }

        if (!renderedLocations.has(endKey)) {
          renderedLocations.add(endKey)
          const endMarker = new google.maps.Marker({
            position: endLocation,
            map,
            label: { text: `${index}`, color: 'white', fontWeight: 'bold' }
          })
          endMarker.addListener('click', () => {
              setActiveDay(index)
          })
        }
        }, index * 30) 

        directionRenderer.current.setOptions({
          polylineOptions: {
          strokeColor: activeDay === index ? '#FF0000' : '#4285F4',
          strokeWeight: activeDay === index ? 6 : 4,
          }
        })

        setRoute((prevRoute: google.maps.DirectionsResult[]) => [...prevRoute,routeInformation])
      } catch (error) {
        console.error("unavaliable routeInfromation", error)
      }
    }

    renderRoute()

  },[routeLib,destinationLocation,originLocation,directionRenderer.current,directionService.current, activeDay])

  return (
    <div>

    </div>
  )
}