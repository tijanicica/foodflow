import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

// Ova komponenta sada prihvata niz tačaka (waypoints)
const RoutingMachine = ({ waypoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !waypoints || waypoints.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
      
      // Opcije za izgled linije
      lineOptions: {
        styles: [{ color: "black", opacity: 0.8, weight: 4, dashArray: "10, 10" }],
        addWaypoints: false, // Ne dozvoljavaj dodavanje novih tačaka
      },
      
      // === KLJUČNE IZMENE ZA SAKRIVANJE ===
      show: false,                 // Sakrij kompletan panel sa instrukcijama
      addWaypoints: false,         // Onemogući dodavanje novih tačaka
      routeWhileDragging: false,   // Ne preračunavaj rutu dok se prevlači
      createMarker: () => null,    // Ne kreiraj podrazumevane A i B markere
      
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, waypoints]);

  return null;
};

export default RoutingMachine;