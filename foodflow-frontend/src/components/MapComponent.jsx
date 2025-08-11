// FAJL: src/components/MapComponent.jsx

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const MapBounds = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
};

const createColoredIcon = (color) => {
    return new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.6);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

const driverIcon = createColoredIcon('#FFFBEB');
const restaurantIcon = createColoredIcon('#8A643B');
const deliveryIcon = createColoredIcon('#2F855A');

export const MapComponent = ({ driverLocation, deliveries }) => {
    const bounds = [];
    if (driverLocation?.lat && driverLocation?.lng) {
        bounds.push([driverLocation.lat, driverLocation.lng]);
    }
    deliveries.forEach(d => {
        if (d.restaurantCoordinates?.lat) bounds.push([d.restaurantCoordinates.lat, d.restaurantCoordinates.lng]);
        if (d.deliveryCoordinates?.lat) bounds.push([d.deliveryCoordinates.lat, d.deliveryCoordinates.lng]);
    });

    const center = bounds.length > 0 ? bounds[0] : [44.7866, 20.4489];

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {driverLocation?.lat && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                    <Popup>Your Current Location</Popup>
                </Marker>
            )}

            {deliveries.map(delivery => (
                <React.Fragment key={`delivery-${delivery.id}`}>
                    {delivery.restaurantCoordinates?.lat && (
                        <Marker position={[delivery.restaurantCoordinates.lat, delivery.restaurantCoordinates.lng]} icon={restaurantIcon}>
                            <Popup><b>Pickup:</b> {delivery.restaurantName}</Popup>
                        </Marker>
                    )}
                    {delivery.deliveryCoordinates?.lat && (
                        <Marker position={[delivery.deliveryCoordinates.lat, delivery.deliveryCoordinates.lng]} icon={deliveryIcon}>
                            <Popup><b>Deliver to:</b> {delivery.deliveryAddress}</Popup>
                        </Marker>
                    )}
                </React.Fragment>
            ))}
            
            <MapBounds bounds={bounds} />
        </MapContainer>
    );
};