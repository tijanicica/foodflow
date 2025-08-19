import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Komponenta za pretragu (ostaje ista)
const SearchField = ({ onLocationSelect }) => {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();
        const searchControl = new GeoSearchControl({
            provider,
            style: 'bar',
            showMarker: false,
            autoClose: true,
        });

        map.addControl(searchControl);

        const onResult = (e) => {
            onLocationSelect({ lat: e.location.y, lng: e.location.x });
        };
        
        map.on('geosearch/showlocation', onResult);

        return () => {
            map.removeControl(searchControl);
            map.off('geosearch/showlocation', onResult);
        };
    }, [map, onLocationSelect]);

    return null;
};


export const AddressSearchMap = ({ onLocationSelect, initialPosition }) => {
    // === ISPRAVKA 1: Podrazumevana pozicija je sada OBJEKAT ===
    const defaultPosition = { lat: 44.7866, lng: 20.4489 };
    const [position, setPosition] = useState(initialPosition || defaultPosition);
    const markerRef = useRef(null);

    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const newPos = marker.getLatLng(); // Vraća objekat {lat, lng}
                setPosition(newPos);
                onLocationSelect(newPos);
            }
        },
    }), [onLocationSelect]);

    useEffect(() => {
        // Ako dobijemo novu inicijalnu poziciju, ažuriramo stanje
        if (initialPosition) {
            setPosition(initialPosition);
        }
    }, [initialPosition]);
    
    // Komponenta koja pomera centar mape
    const RecenterAutomatically = ({ pos }) => {
        const map = useMap();
        useEffect(() => {
            // === ISPRAVKA 2: Proveravamo da li su koordinate validne pre poziva setView ===
            if (pos && typeof pos.lat === 'number' && typeof pos.lng === 'number') {
                map.setView([pos.lat, pos.lng]);
            }
        }, [pos]);
        return null;
    }

    // === ISPRAVKA 3: Konvertujemo objekat u niz za MapContainer i Marker ===
    const positionAsArray = useMemo(() => [position.lat, position.lng], [position]);

    return (
        <MapContainer center={positionAsArray} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
            />
            <SearchField onLocationSelect={(pos) => {
                setPosition(pos);
                onLocationSelect(pos);
            }} />
            <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={positionAsArray}
                ref={markerRef}
            />
            <RecenterAutomatically pos={position} />
        </MapContainer>
    );
};