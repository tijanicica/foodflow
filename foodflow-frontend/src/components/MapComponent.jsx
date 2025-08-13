import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { Home, Store, MapPin, Car, Bike } from 'lucide-react'; 
import RoutingMachine from './RoutingMachine';

// Pomoćne funkcije (ostaju nepromenjene)
const getDriverIconComponent = (vehicleType) => {
    switch (vehicleType?.toUpperCase()) {
        case 'CAR': return Car;
        case 'MOTORCYCLE': return Bike;
        case 'BICYCLE': return Bike;
        default: return MapPin;
    }
};
const pulseKeyframes = `@keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 179, 0, 0.7); } 70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 179, 0, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 179, 0, 0); } }`;
const createStyledIcon = (Icon, bgColor, applyPulse = false) => {
    const iconHtml = renderToStaticMarkup(
        <div style={{ backgroundColor: bgColor, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', ...(applyPulse && { animation: 'pulse 1.5s infinite' }) }}>
            <Icon size={20} color="white" />
        </div>
    );
    return L.divIcon({ html: `<style>${pulseKeyframes}</style>${iconHtml}`, className: 'custom-styled-icon', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] });
};
const assignedRestaurantIcon = createStyledIcon(Store, '#2E7D32');
const assignedHomeIcon = createStyledIcon(Home, '#2E7D32');
const offerRestaurantIcon = createStyledIcon(Store, '#1D4ED8');
const offerHomeIcon = createStyledIcon(Home, '#1D4ED8');
const FitBoundsToMarkers = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
};


// --- GLAVNA MAP KOMPONENTA ---
export const MapComponent = ({ driverLocation, assignedDeliveries = [], newOffers = [], activeRouteId = null, vehicleType = null }) => {
    
    const DriverIconComponent = getDriverIconComponent(vehicleType);
    const driverIcon = createStyledIcon(DriverIconComponent, '#FFB300', true);

    const allPoints = useMemo(() => {
        const points = [];
        if (driverLocation?.lat) points.push([driverLocation.lat, driverLocation.lng]);
        assignedDeliveries.forEach(d => {
            if (d.restaurantCoordinates?.lat) points.push([d.restaurantCoordinates.lat, d.restaurantCoordinates.lng]);
            if (d.deliveryCoordinates?.lat) points.push([d.deliveryCoordinates.lat, d.deliveryCoordinates.lng]);
        });
        newOffers.forEach(o => {
            if (o.order.restaurantCoordinates?.lat) points.push([o.order.restaurantCoordinates.lat, o.order.restaurantCoordinates.lng]);
            if (o.order.deliveryCoordinates?.lat) points.push([o.order.deliveryCoordinates.lat, o.order.deliveryCoordinates.lng]);
        });
        return points;
    }, [driverLocation, assignedDeliveries, newOffers]);

    // --- useMemo SA DIJAGNOSTIKOM ---
    const routeWaypoints = useMemo(() => {
        console.log("--- Izračunavam Waypoints ---");
        console.log("Active Route ID:", activeRouteId);
        
        const points = [];
        if (activeRouteId && driverLocation?.lat) {
            const activeDelivery = assignedDeliveries.find(d => d.id === activeRouteId);
            
            console.log("Pronađena dostava:", activeDelivery);

            if (activeDelivery) {
                // Tačka 1: Vozač
                points.push([driverLocation.lat, driverLocation.lng]);
                
                // Tačka 2: Restoran (ako postoji)
                if (activeDelivery.restaurantCoordinates && activeDelivery.restaurantCoordinates.lat) {
                    points.push([activeDelivery.restaurantCoordinates.lat, activeDelivery.restaurantCoordinates.lng]);
                } else {
                    console.error("GREŠKA: Koordinate restorana nedostaju u objektu 'activeDelivery'!");
                }

                // Tačka 3: Kupac (ako postoji)
                if (activeDelivery.deliveryCoordinates && activeDelivery.deliveryCoordinates.lat) {
                    points.push([activeDelivery.deliveryCoordinates.lat, activeDelivery.deliveryCoordinates.lng]);
                } else {
                    console.error("GREŠKA: Koordinate kupca nedostaju u objektu 'activeDelivery'!");
                }
            }
        }
        
        console.log("Finalni Waypoints niz za rutu:", points);
        return points;
    }, [activeRouteId, driverLocation, assignedDeliveries]);

    const center = allPoints.length > 0 ? allPoints[0] : [44.7866, 20.4489];
    
    const legendStyle = { position: 'absolute', bottom: '20px', right: '20px', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '12px 15px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', zIndex: 1000, fontFamily: 'sans-serif', fontSize: '13px', lineHeight: '1.6' };
    const itemStyle = { display: 'flex', alignItems: 'center', marginBottom: '6px' };
    const colorBox = (color) => ({ width: '18px', height: '18px', backgroundColor: color, borderRadius: '50%', marginRight: '10px', border: '2px solid white', boxShadow: '0 0 5px rgba(0,0,0,0.3)' });
    const sectionTitleStyle = { marginTop: '10px', marginBottom: '5px', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '8px' };

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {/* --- KONAČNA IZMENA ZA ISCRTAVANJE --- */}
            {routeWaypoints.length > 1 && (
                <RoutingMachine
                    key={JSON.stringify(routeWaypoints)} // Ključ koji forsira ponovno kreiranje
                    waypoints={routeWaypoints}
                />
            )}

            <FitBoundsToMarkers bounds={allPoints} />

            {driverLocation?.lat && <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}><Popup><b>Your Location</b></Popup></Marker>}
            {assignedDeliveries.map(delivery => (
                <React.Fragment key={`assigned-${delivery.id}`}>
                    {delivery.restaurantCoordinates?.lat && <Marker position={[delivery.restaurantCoordinates.lat, delivery.restaurantCoordinates.lng]} icon={assignedRestaurantIcon}><Popup><b>Pickup:</b> {delivery.restaurantName}<br/>{delivery.restaurantAddress}</Popup></Marker>}
                    {delivery.deliveryCoordinates?.lat && <Marker position={[delivery.deliveryCoordinates.lat, delivery.deliveryCoordinates.lng]} icon={assignedHomeIcon}><Popup><b>Deliver to:</b> {delivery.deliveryAddress}</Popup></Marker>}
                </React.Fragment>
            ))}
            {newOffers.map(offer => (
                <React.Fragment key={`offer-${offer.id}`}>
                    {offer.order.restaurantCoordinates?.lat && <Marker position={[offer.order.restaurantCoordinates.lat, offer.order.restaurantCoordinates.lng]} icon={offerRestaurantIcon}><Popup><b>New Offer - Pickup:</b> {offer.order.restaurantName}<br/>{offer.order.address}</Popup></Marker>}
                    {offer.order.deliveryCoordinates?.lat && <Marker position={[offer.order.deliveryCoordinates.lat, offer.order.deliveryCoordinates.lng]} icon={offerHomeIcon}><Popup><b>New Offer - Drop-off:</b> {offer.order.deliveryAddress}</Popup></Marker>}
                </React.Fragment>
            ))}
            <div style={legendStyle}>
                 <div style={itemStyle}><div style={colorBox('#FFB300')}></div> You (Your Location)</div>
                <div style={sectionTitleStyle}>Assigned Deliveries</div>
                <div style={itemStyle}><div style={colorBox('#2E7D32')}></div> Pickup / Drop-off</div>
                <div style={sectionTitleStyle}>New Offers</div>
                <div style={itemStyle}><div style={colorBox('#1D4ED8')}></div> Pickup / Drop-off</div>
            </div>
        </MapContainer>
    );
};
