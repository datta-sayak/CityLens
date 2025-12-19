"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: "/marker-icon.png",
    iconRetinaUrl: "/marker-icon-2x.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Component to recenter map when issues change or user location is found
function Recenter({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);
    return null;
}

export default function IssuesMap({ issues, center = [51.505, -0.09] }) {
    // Leaflet requires window, so we must ensure this only renders on client
    // Next.js 'use client' handles this but dynamic import is often safer for Leaflet to avoid SSR errors
    // However, with "use client" and checking for window if needed inside effects usually works. 
    // But react-leaflet components generally need to be dynamically imported with ssr: false in the parent.
    // I will create this file, and in the parent I will import it dynamically.

    return (
        <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full rounded-xl z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {issues.map((issue) => (
                issue.location && (
                    <Marker
                        key={issue.id}
                        position={[issue.location.lat, issue.location.lng]}
                    // icon={icon} // We need to fix icons, but let's see if default works or if we need the fix.
                    >
                        <Popup>
                            <div className="font-semibold">{issue.title}</div>
                            <div className="text-xs text-muted-foreground">{issue.status}</div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
}
