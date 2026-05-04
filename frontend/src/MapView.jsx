import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

const getColor = (v) => {
  if (v > 0.75) return "#ff0000";
  if (v > 0.5) return "#ff8800";
  if (v > 0.3) return "#ffd700";
  return "#00ff88";
};

const MapView = ({ onRegionSelect }) => {
  const [geoData, setGeoData] = useState(null);
  const [heatData, setHeatData] = useState({});

  // Load map
  useEffect(() => {
    fetch("/india_states.json")
      .then(res => res.json())
      .then(data => setGeoData(data));
  }, []);

  // Load real heatmap data from backend
  useEffect(() => {
    fetch("https://ai-powered-fake-news-detector-production.up.railway.app/geo-heatmap")
      .then(res => res.json())
      .then(data => setHeatData(data));
  }, []);

  const onEachState = (feature, layer) => {
    const state = feature.properties.NAME_1; // ✅ FIXED

    const intensity = heatData[state] || 0.1;

    layer.setStyle({
      fillColor: getColor(intensity),
      fillOpacity: 0.6,
      color: "white",
      weight: 1
    });

    layer.on({
      click: () => {
        console.log("Clicked:", state);
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

    layer.bindTooltip(`${state} (${Math.round(intensity * 100)}%)`);
  };

  if (!geoData) return <p>Loading map...</p>;

  return (
    <MapContainer
      center={[22.9734, 78.6569]}
      zoom={5}
      style={{ height: "400px", borderRadius: "12px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <GeoJSON data={geoData} onEachFeature={onEachState} />
    </MapContainer>
  );
};

export default MapView;