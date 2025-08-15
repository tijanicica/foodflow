// FAJL: src/components/RoutingMachine.jsx

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";

const RoutingMachine = ({ waypoints }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  // Prvi useEffect: Kreira kontrolu samo jednom kada se mapa pojavi
  useEffect(() => {
    if (!map) return;

    // Kreiramo instancu, ali je NE dodajemo odmah na mapu
    const instance = L.Routing.control({
      waypoints: [], // Uvek počinje prazna
      
      // Sve tvoje opcije
      lineOptions: {
        styles: [{ color: "black", opacity: 0.8, weight: 4, dashArray: "10, 10" }],
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      createMarker: () => null,
    });
    
    // Čuvamo instancu u ref-u da bi je drugi useEffect mogao koristiti
    routingControlRef.current = instance;

    // Cleanup funkcija koja se poziva samo kada se komponenta uništi
    return () => {
      if (map && routingControlRef.current) {
        // Pre uklanjanja, očisti tačke da izbegneš greške
        routingControlRef.current.setWaypoints([]);
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map]);


  // Drugi useEffect: Ažurira tačke i dodaje/uklanja kontrolu sa mape
  useEffect(() => {
    if (!routingControlRef.current) return; // Ako kontrola ne postoji, ne radi ništa

    if (waypoints && waypoints.length > 0) {
      // Ako imamo tačke, dodaj kontrolu na mapu (ako već nije) i postavi tačke
      routingControlRef.current.addTo(map);
      routingControlRef.current.setWaypoints(
        waypoints.map(wp => L.latLng(wp[0], wp[1]))
      );
    } else {
      // Ako nemamo tačke (prazan niz), ukloni kontrolu sa mape
      if (map && routingControlRef.current) {
          // Ovaj deo je ključan - fizički uklanja liniju sa mape
          routingControlRef.current.setWaypoints([]);
      }
    }
  }, [waypoints, map]); // Zavisnosti su 'waypoints' i 'map'

  return null;
};

export default RoutingMachine;