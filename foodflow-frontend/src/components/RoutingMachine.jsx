// FAJL: src/components/RoutingMachine.jsx

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";

const RoutingMachine = ({ waypoints }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    // 1. Proveravamo da li kontrola već postoji. Ako postoji, ne radimo ništa.
    // Ovo sprečava duplo kreiranje u Strict Mode-u.
    if (routingControlRef.current) {
      return;
    }
    
    // 2. Ako ne postoji, kreiramo novu instancu
    routingControlRef.current = L.Routing.control({
      waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
      lineOptions: {
        styles: [{ color: "black", opacity: 0.8, weight: 4, dashArray: "10, 10" }],
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      createMarker: () => null,
    }).addTo(map);

    // Ova cleanup funkcija se poziva samo kada se komponenta STVARNO uništi
    return () => {
      if (map && routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        // 3. KLJUČNA IZMENA: Eksplicitno postavljamo ref na null
        // Ovo govori React-u da je kontrola definitivno uništena.
        routingControlRef.current = null;
      }
    };
  }, [map]); // Zavisnost je samo `map`, ovo je ispravno

  // Ovaj useEffect služi samo za ažuriranje postojećih tačaka
  useEffect(() => {
    if (routingControlRef.current) {
      routingControlRef.current.setWaypoints(
        waypoints.map(wp => L.latLng(wp[0], wp[1]))
      );
    }
  }, [waypoints]);

  return null;
};

export default RoutingMachine;