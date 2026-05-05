import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function MapView({ onRegionSelect }) {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // Fetches from the public folder
    fetch("/india_states.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Error loading map data:", err));
  }, []);

  const onEachFeature = (feature, layer) => {
    const stateName = feature.properties.NAME_1;

    layer.setStyle({
      fillColor: "#00c8ff",
      fillOpacity: 0.15,
      color: "rgba(255,255,255,0.3)",
      weight: 1
    });

    layer.on({
      click: () => {
        if (onRegionSelect) onRegionSelect(stateName);
      },
      mouseover: (e) => {
        e.target.setStyle({ weight: 2, fillColor: "#0062ff", fillOpacity: 0.5 });
      },
      mouseout: (e) => {
        e.target.setStyle({ weight: 1, fillColor: "#00c8ff", fillOpacity: 0.15 });
      }
    });

    layer.bindPopup(`<b>${stateName}</b><br>Click to analyze this region`);
  };

  if (!geoData) {
    return (
      <div className="loader-wrap">
        <div className="loader-ring" />
      </div>
    );
  }

  return (
    <div className="map-wrapper" style={{ height: "450px", width: "100%", zIndex: 0 }}>
      {/* Set a dark CartoDB basemap to match your global styles */}
      <MapContainer center={[22.9734, 78.6569]} zoom={4} style={{ height: "100%", width: "100%", backgroundColor: "#0a1220" }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />
        <GeoJSON data={geoData} onEachFeature={onEachFeature} />
      </MapContainer>
    </div>
  );
}
