import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

// Fix for Leaflet marker icons
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapProps {
  lat: number;
  lng: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
  markerLabel?: string;
}

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export function Map({
  lat,
  lng,
  onLocationSelect,
  interactive = false,
  markerLabel = "Selected Location",
}: MapProps) {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current) {
      // Recenter map when location changes
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
  }, [lat, lng]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        ref={mapRef}
        center={[lat, lng]}
        zoom={13}
        className="w-full h-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        {interactive && onLocationSelect && (
          <MapClickHandler onLocationSelect={onLocationSelect} />
        )}
        <Marker position={[lat, lng]} icon={defaultIcon}>
          <Popup>{markerLabel}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
