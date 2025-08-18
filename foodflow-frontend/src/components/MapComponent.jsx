// FAJL: src/components/MapComponent.jsx

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { Home, Store, MapPin } from 'lucide-react'; // Uklonili smo Car i Bike jer ih getDriverIconComponent ne koristi
import RoutingMachine from './RoutingMachine';

// Pomoćne funkcije (ostaju nepromenjene)
const getDriverIconComponent = (vehicleType) => {
    // Ova funkcija je pojednostavljena jer Car i Bike nisu bili importovani u vašem kodu.
    // Ako ih imate, slobodno ih vratite.
    return MapPin;
};

const pulseKeyframes = `@keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(161, 122, 75, 0.7); } 70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(161, 122, 75, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(161, 122, 75, 0); } }`;

const createStyledIcon = (Icon, bgColor, applyPulse = false) => {
    const iconHtml = renderToStaticMarkup(
        <div style={{ backgroundColor: bgColor, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', ...(applyPulse && { animation: 'pulse 1.5s infinite' }) }}>
            <Icon size={20} color="white" />
        </div>
    );
    return L.divIcon({ html: `<style>${pulseKeyframes}</style>${iconHtml}`, className: 'custom-styled-icon', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] });
};

// === NOVE, USKLAĐENE BOJE IKONICA ===
const assignedRestaurantIcon = createStyledIcon(Store, '#166534'); // Tamnija zelena za bolji kontrast
const assignedHomeIcon = createStyledIcon(Home, '#166534');
const offerRestaurantIcon = createStyledIcon(Store, '#1E40AF'); // Tamnija plava
const offerHomeIcon = createStyledIcon(Home, '#1E40AF');

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
export const MapComponent = ({ 
    driverLocation, 
    assignedDeliveries = [], 
    newOffers = [], 
    activeRouteId = null, 
    vehicleType = null,
    routeTarget = 'ALL'
}) => {
    
    const DriverIconComponent = getDriverIconComponent(vehicleType);
    // Vozačeva ikonica sada koristi našu glavnu brend boju
    const driverIcon = createStyledIcon(DriverIconComponent, '#A17A4B', true);

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

    const routeWaypoints = useMemo(() => {
        const points = [];
        if (activeRouteId && driverLocation?.lat) {
            const activeDelivery = assignedDeliveries.find(d => d.id === activeRouteId);
            if (activeDelivery) {
                points.push([driverLocation.lat, driverLocation.lng]);
                if ((routeTarget === 'RESTAURANT' || routeTarget === 'ALL') && activeDelivery.restaurantCoordinates?.lat) {
                    points.push([activeDelivery.restaurantCoordinates.lat, activeDelivery.restaurantCoordinates.lng]);
                }
                if ((routeTarget === 'CUSTOMER' || routeTarget === 'ALL') && activeDelivery.deliveryCoordinates?.lat) {
                    points.push([activeDelivery.deliveryCoordinates.lat, activeDelivery.deliveryCoordinates.lng]);
                }
            }
        }
        return points;
    }, [activeRouteId, driverLocation, assignedDeliveries, routeTarget]);

    const center = allPoints.length > 0 ? allPoints[0] : [44.7866, 20.4489];
    
    // === NOVI, ELEGANTNIJI STIL ZA LEGENDU ===
    const legendStyle = { position: 'absolute', bottom: '15px', right: '15px', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px 15px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', zIndex: 1000, fontFamily: "'Inter', sans-serif", fontSize: '12px', lineHeight: '1.8' };
    const itemStyle = { display: 'flex', alignItems: 'center' };
    const colorBox = (color) => ({ width: '14px', height: '14px', backgroundColor: color, borderRadius: '50%', marginRight: '10px', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' });
    const sectionTitleStyle = { fontWeight: '600', marginBottom: '5px', marginTop: '8px', borderTop: '1px solid #F0EBE3', paddingTop: '8px' };

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            {/* === BRENDIRANA MAPA - CARTO VOYAGER === */}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {routeWaypoints.length > 1 && (
                <RoutingMachine key={JSON.stringify(routeWaypoints)} waypoints={routeWaypoints} />
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
                    {offer.order.restaurantCoordinates?.lat && <Marker position={[offer.order.restaurantCoordinates.lat, offer.order.restaurantCoordinates.lng]} icon={offerRestaurantIcon}><Popup><b>New Offer - Pickup:</b> {offer.order.restaurantName}<br/>{offer.order.restaurantAddress}</Popup></Marker>}
                    {offer.order.deliveryCoordinates?.lat && <Marker position={[offer.order.deliveryCoordinates.lat, offer.order.deliveryCoordinates.lng]} icon={offerHomeIcon}><Popup><b>New Offer - Drop-off:</b> {offer.order.deliveryAddress}</Popup></Marker>}
                </React.Fragment>
            ))}
            
            {/* === REDIZAJNIRANA LEGENDA === */}
            {routeWaypoints.length < 2 && (
                <div style={legendStyle}>
                    <div style={itemStyle}><div style={colorBox('#A17A4B')}></div> You (Your Location)</div>
                    
                    <div style={sectionTitleStyle}>Assigned</div>
                    <div style={itemStyle}><div style={colorBox('#166534')}></div> Pickup / Drop-off</div>

                    <div style={sectionTitleStyle}>New Offers</div>
                    <div style={itemStyle}><div style={colorBox('#1E40AF')}></div> Pickup / Drop-off</div>
                </div>
            )}
        </MapContainer>
    );
};