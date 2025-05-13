import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const Map = () => {
  const position = [27.880906,77.385873]; // Example coordinates (latitude, longitude)

  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
            Hindu Rashtra Sevak Sangh
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
