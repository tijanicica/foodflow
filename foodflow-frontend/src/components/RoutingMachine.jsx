// FAJL: src/components/RoutingMachine.jsx

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";

const RoutingMachine = ({ waypoints }) => {
  const map = useMap();
  // Koristimo useRef da sačuvamo instancu kontrole između renderovanja
  const routingControlRef = useRef(null);

  // Ovaj useEffect kreira i uništava kontrolu
  useEffect(() => {
    if (!map) return;

    // Kreiramo instancu i odmah je čuvamo u ref
    routingControlRef.current = L.Routing.control({
      waypoints: [], // Uvek počinje prazna
      lineOptions: {
        styles: [{ color: "black", opacity: 0.8, weight: 4, dashArray: "10, 10" }],
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      createMarker: () => null,
    });

    // Dodajemo kontrolu na mapu
    routingControlRef.current.addTo(map);

    // Cleanup funkcija se poziva kada se komponenta uništi
    return () => {
      // Pristupamo kontroli preko `routingControlRef.current`
      if (map && routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map]); // Zavisnost je samo 'map', izvršava se jednom

  // Ovaj useEffect samo ažurira tačke na postojećoj kontroli
  useEffect(() => {
    if (routingControlRef.current) {
      if (waypoints && waypoints.length > 0) {
        routingControlRef.current.setWaypoints(
          waypoints.map((wp) => L.latLng(wp[0], wp[1]))
        );
      } else {
        routingControlRef.current.setWaypoints([]); // Očisti rutu ako nema tačaka
      }
    }
  }, [waypoints]); // Zavisnost su 'waypoints'

  return null;
};

export default RoutingMachine;