import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function MapView() {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch("/india_states.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  if (!geoData) return <p>Loading map...</p>;

  return (
    <MapContainer center={[22.9734, 78.6569]} zoom={5} style={{ height: "400px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <GeoJSON data={geoData} />
    </MapContainer>
  );
}