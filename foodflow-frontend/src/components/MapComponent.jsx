// FAJL: src/components/MapComponent.jsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Rješavanje problema sa default ikonicama
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Komponenta za automatsko centriranje
const FitBoundsToMarkers = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
};

// --- STILIZIRANE IKONICE ---
// Dodajemo keyframes animaciju za pulsiranje
const pulseKeyframes = `@keyframes pulse {
    0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
    100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}`;

const createColoredIcon = (color, pulse = false) => {
    const animation = pulse ? 'animation: pulse 1.5s infinite;' : '';
    return new L.DivIcon({
        className: 'custom-div-icon',
        html: `
            <style>${pulseKeyframes}</style>
            <div style="
                background-color: ${color};
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.6);
                ${animation}
            "></div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
};

// Definicija ikonica
const driverIcon = createColoredIcon('#FFB300', true); // Jarka žuta sa pulsiranjem
const assignedRestaurantIcon = createColoredIcon('#8A643B');
const assignedDeliveryIcon = createColoredIcon('#2E7D32');
const offerRestaurantIcon = createColoredIcon('#D2B48C');
const offerDeliveryIcon = createColoredIcon('#9CCC65');

export const MapComponent = ({ driverLocation, assignedDeliveries, newOffers }) => {
    const allPoints = [];
    if (driverLocation?.lat) allPoints.push([driverLocation.lat, driverLocation.lng]);
    assignedDeliveries.forEach(d => {
        if (d.restaurantCoordinates?.lat) allPoints.push([d.restaurantCoordinates.lat, d.restaurantCoordinates.lng]);
        if (d.deliveryCoordinates?.lat) allPoints.push([d.deliveryCoordinates.lat, d.deliveryCoordinates.lng]);
    });
    newOffers.forEach(o => {
        if (o.order.restaurantCoordinates?.lat) allPoints.push([o.order.restaurantCoordinates.lat, o.order.restaurantCoordinates.lng]);
        if (o.order.deliveryCoordinates?.lat) allPoints.push([o.order.deliveryCoordinates.lat, o.order.deliveryCoordinates.lng]);
    });

    const center = allPoints.length > 0 ? allPoints[0] : [44.7866, 20.4489];

    // --- STILIZIRANA LEGENDA ---
    const legendStyle = {
        position: 'absolute', bottom: '20px', right: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '12px 15px',
        borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 1000, fontFamily: 'sans-serif', fontSize: '13px', lineHeight: '1.5'
    };
    const itemStyle = { display: 'flex', alignItems: 'center', marginBottom: '5px' };
    const colorBox = (color) => ({ width: '18px', height: '18px', backgroundColor: color, borderRadius: '50%', marginRight: '10px', border: '2px solid white', boxShadow: '0 0 3px gray' });

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {driverLocation?.lat && <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}><Popup><b>Your Location</b></Popup></Marker>}

            {assignedDeliveries.map(delivery => (
                <React.Fragment key={`assigned-${delivery.id}`}>
                    {delivery.restaurantCoordinates?.lat && <Marker position={[delivery.restaurantCoordinates.lat, delivery.restaurantCoordinates.lng]} icon={assignedRestaurantIcon}><Popup><b>Pickup:</b> {delivery.restaurantName}<br/>{delivery.restaurantAddress}</Popup></Marker>}
                    {delivery.deliveryCoordinates?.lat && <Marker position={[delivery.deliveryCoordinates.lat, delivery.deliveryCoordinates.lng]} icon={assignedDeliveryIcon}><Popup><b>Deliver to:</b> {delivery.deliveryAddress}</Popup></Marker>}
                </React.Fragment>
            ))}

            {newOffers.map(offer => (
                <React.Fragment key={`offer-${offer.id}`}>
                    {offer.order.restaurantCoordinates?.lat && <Marker position={[offer.order.restaurantCoordinates.lat, offer.order.restaurantCoordinates.lng]} icon={offerRestaurantIcon}><Popup><b>New Offer Pickup:</b> {offer.order.restaurantName}<br/>{offer.order.restaurantAddress}</Popup></Marker>}
                    {offer.order.deliveryCoordinates?.lat && <Marker position={[offer.order.deliveryCoordinates.lat, offer.order.deliveryCoordinates.lng]} icon={offerDeliveryIcon}><Popup><b>New Offer Drop-off:</b> {offer.order.deliveryAddress}</Popup></Marker>}
                </React.Fragment>
            ))}

            <FitBoundsToMarkers bounds={allPoints} />
            
            <div style={legendStyle}>
                <div style={itemStyle}><div style={colorBox('#FFB300')}></div> You (Current Location)</div>
                <div style={{marginTop: '10px', marginBottom: '5px', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '8px'}}>Assigned Deliveries:</div>
                <div style={itemStyle}><div style={colorBox('#8A643B')}></div> Pickup Location</div>
                <div style={itemStyle}><div style={colorBox('#2E7D32')}></div> Drop-off Location</div>
                <div style={{marginTop: '10px', marginBottom: '5px', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '8px'}}>New Opportunities:</div>
                <div style={itemStyle}><div style={colorBox('#D2B48C')}></div> Pickup Location</div>
                <div style={itemStyle}><div style={colorBox('#9CCC65')}></div> Drop-off Location</div>
            </div>
        </MapContainer>
    );
};