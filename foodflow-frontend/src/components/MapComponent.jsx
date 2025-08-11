// FAJL: src/components/MapComponent.jsx

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ISPRAVKA ZA IKONICE: Rješava problem sa default ikonicama u Leafletu i Vite/Reactu
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Komponenta za automatsko centriranje mape
const FitBoundsToMarkers = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
};

// Funkcija za kreiranje custom, obojenih ikonica
const createColoredIcon = (color) => {
    return new L.DivIcon({
        className: 'custom-div-icon', // Važno za CSS, ali inline stilovi rade posao
        html: `<div style="background-color:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.6);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

// Definicija ikonica
const driverIcon = createColoredIcon('#FFD700');          // Žuta (Vi)
const assignedRestaurantIcon = createColoredIcon('#8A643B'); // Smeđa (Restoran - prihvaćeno)
const assignedDeliveryIcon = createColoredIcon('#2F855A');   // Zelena (Kupac - prihvaćeno)
const offerRestaurantIcon = createColoredIcon('#D2B48C');    // Svijetlo smeđa (Restoran - ponuda)
const offerDeliveryIcon = createColoredIcon('#90EE90');      // Svijetlo zelena (Kupac - ponuda)


export const MapComponent = ({ driverLocation, assignedDeliveries, newOffers }) => {
    // Skupljamo sve koordinate u jednu listu da bismo automatski centrirali mapu
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

    // Ako nema točaka, centriramo na default lokaciju (npr. Beograd)
    const center = allPoints.length > 0 ? allPoints[0] : [44.7866, 20.4489];

    // Stilovi za legendu
    const legendStyle = {
        position: 'absolute', bottom: '10px', right: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px',
        borderRadius: '5px', boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
        zIndex: 401, // Mora biti veći od zIndex-a tile-ova mape
        fontSize: '12px', lineHeight: '1.4'
    };
    const itemStyle = { display: 'flex', alignItems: 'center', marginBottom: '4px' };
    const colorBox = (color) => ({ width: '16px', height: '16px', backgroundColor: color, borderRadius: '50%', marginRight: '8px', border: '2px solid white', boxShadow: '0 0 2px gray' });

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Marker za vozača */}
            {driverLocation?.lat && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                    <Popup>Your Location</Popup>
                </Marker>
            )}

            {/* Markeri za PRIHVAĆENE dostave */}
            {assignedDeliveries.map(delivery => (
                <React.Fragment key={`assigned-${delivery.id}`}>
                    {delivery.restaurantCoordinates?.lat && <Marker position={[delivery.restaurantCoordinates.lat, delivery.restaurantCoordinates.lng]} icon={assignedRestaurantIcon}><Popup><b>Pickup:</b> {delivery.restaurantName}</Popup></Marker>}
                    {delivery.deliveryCoordinates?.lat && <Marker position={[delivery.deliveryCoordinates.lat, delivery.deliveryCoordinates.lng]} icon={assignedDeliveryIcon}><Popup><b>Deliver to:</b> {delivery.deliveryAddress}</Popup></Marker>}
                </React.Fragment>
            ))}

            {/* Markeri za NOVE PONUDE */}
            {newOffers.map(offer => (
                <React.Fragment key={`offer-${offer.id}`}>
                    {offer.order.restaurantCoordinates?.lat && <Marker position={[offer.order.restaurantCoordinates.lat, offer.order.restaurantCoordinates.lng]} icon={offerRestaurantIcon}><Popup><b>New Offer Pickup:</b> {offer.order.restaurantName}</Popup></Marker>}
                    {offer.order.deliveryCoordinates?.lat && <Marker position={[offer.order.deliveryCoordinates.lat, offer.order.deliveryCoordinates.lng]} icon={offerDeliveryIcon}><Popup><b>New Offer Drop-off:</b> {offer.order.deliveryAddress}</Popup></Marker>}
                </React.Fragment>
            ))}

            <FitBoundsToMarkers bounds={allPoints} />
            
            {/* Legenda se renderira kao direktno dijete MapContainer-a */}
            <div style={legendStyle}>
                <div style={itemStyle}><div style={colorBox('#FFD700')}></div> You</div>
                <div style={{marginTop: '8px', marginBottom: '4px', fontWeight: 'bold'}}>Assigned:</div>
                <div style={itemStyle}><div style={colorBox('#8A643B')}></div> Pickup (Restaurant)</div>
                <div style={itemStyle}><div style={colorBox('#2F855A')}></div> Drop-off (Customer)</div>
                <div style={{marginTop: '8px', marginBottom: '4px', fontWeight: 'bold'}}>New Offers:</div>
                <div style={itemStyle}><div style={colorBox('#D2B48C')}></div> Pickup (Restaurant)</div>
                <div style={itemStyle}><div style={colorBox('#90EE90')}></div> Drop-off (Customer)</div>
            </div>
        </MapContainer>
    );
};