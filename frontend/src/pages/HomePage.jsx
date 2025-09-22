import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom'; // <-- Import useNavigate

const { Title, Text } = Typography;

// LocationFinder component remains the same...
function LocationFinder({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

function HomePage() {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const navigate = useNavigate(); // <-- Initialize the navigate function

  const handleAnalyzeClick = () => {
    if (selectedPosition) {
      // UPDATE THIS: Instead of an alert, navigate to the dashboard page
      // We pass the coordinates as URL search parameters
      navigate(`/dashboard?lat=${selectedPosition.lat.toFixed(4)}&lon=${selectedPosition.lng.toFixed(4)}`);
    }
  };

  // The rest of the component's return statement remains the same...
  return (
    <Card>
      <Title level={4}>Select a Location</Title>
      <Text type="secondary">Click anywhere on the map to drop a pin and analyze the climate risk.</Text>
      <div style={{ height: '60vh', marginTop: '24px', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationFinder onLocationSelect={setSelectedPosition} />
          {selectedPosition && (
            <Marker position={selectedPosition}>
              <Popup>
                <div>
                  <p>Lat: {selectedPosition.lat.toFixed(4)}</p>
                  <p>Lon: {selectedPosition.lng.toFixed(4)}</p>
                  <Button type="primary" size="small" onClick={handleAnalyzeClick} style={{ marginTop: '8px' }}>
                    Analyze Risk
                  </Button>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </Card>
  );
}

export default HomePage;