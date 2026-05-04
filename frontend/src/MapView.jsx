import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

const MapView = ({ onRegionSelect }) => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch("/india_states.json")
      .then(res => res.json())
      .then(data => setGeoData(data));
  }, []);

  const onEachState = (feature, layer) => {
    layer.on({
      click: () => {
        const state = feature.properties.ST_NM;
        console.log("Clicked:", state);
        onRegionSelect(state);
      }
    });

    layer.bindTooltip(feature.properties.ST_NM);
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
