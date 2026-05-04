import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import geoData from "./assets/india_states_small.json";
import { useState } from "react";

const getColor = (intensity) => {
  return intensity > 0.75 ? "#ff0000" :
         intensity > 0.5 ? "#ff8800" :
         intensity > 0.25 ? "#ffd700" :
         "#00ff88";
};

export default function MapView({ onRegionSelect }) {
  const [selectedState, setSelectedState] = useState(null);

  // 🔥 Fake heatmap values (replace later with real backend)
  const fakeHeatData = {
    "Andhra Pradesh": 0.7,
    "Telangana": 0.4,
    "Tamil Nadu": 0.8,
    "Karnataka": 0.3,
    "Maharashtra": 0.6
  };

  const onEachFeature = (feature, layer) => {
    const state = feature.properties.NAME_1;

    const intensity = fakeHeatData[state] || 0.2;

    layer.setStyle({
      fillColor: getColor(intensity),
      fillOpacity: 0.6,
      color: "white",
      weight: 1
    });

    layer.on({
      click: () => {
        setSelectedState(state);
        onRegionSelect(state);
      },
      mouseover: (e) => {
        e.target.setStyle({
          weight: 3,
          color: "#00ffff"
        });
      },
      mouseout: (e) => {
        e.target.setStyle({
          weight: 1,
          color: "white"
        });
      }
    });

    layer.bindPopup(`<b>${state}</b><br>Fake News Index: ${Math.round(intensity*100)}%`);
  };

  return (
    <MapContainer
      center={[20.5, 78.9]}
      zoom={5}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <GeoJSON data={geoData} onEachFeature={onEachFeature} />
    </MapContainer>
  );
}
