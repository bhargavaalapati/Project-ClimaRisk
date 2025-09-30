import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Button, Card, Typography, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Search } = Input;

// Helper component to programmatically change the map's view
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Helper component to handle map clicks
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
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [isSearching, setIsSearching] = useState(false); // NEW: Loading state for search
  const navigate = useNavigate();

  const handleAnalyzeClick = () => {
    if (selectedPosition) {
      navigate(`/dashboard?lat=${selectedPosition.lat.toFixed(4)}&lon=${selectedPosition.lng.toFixed(4)}`);
    }
  };

 const handleSearch = async (value) => {
    if (!value.trim()) {
      toast.error("Please enter a location to search.");
      return;
    }
    setIsSearching(true);
    const loadingToastId = toast.loading('Searching for location...');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}`);
      const data = await response.json();
      toast.dismiss(loadingToastId);
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPosition = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setMapCenter([newPosition.lat, newPosition.lng]);
        setSelectedPosition(newPosition);
        setMapZoom(10);
        toast.success(`Location found: ${display_name}`);
      } else {
        toast.error("Location not found.");
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Could not connect to the location service.", error);
    } finally {
      setIsSearching(false);
    }
  };


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
        <Title level={4}>Select a Location</Title>
        <Text type="secondary">You can pin on the map manually or type a place here.</Text>
        <Search
          placeholder="e.g., London, UK"
          onSearch={handleSearch}
          enterButton="Search"
          size="large"
          loading={isSearching}
          style={{ marginTop: '16px' }}
        />
      </div>
        <div style={{ height: '60vh', borderRadius: '8px', overflow: 'hidden' }}>
          <MapContainer 
  center={mapCenter} 
  zoom={mapZoom} 
  style={{ height: '100%', width: '100%' }}
  worldCopyJump={false} // prevent jumping when panning
  maxBounds={[[-90, -180], [90, 180]]} // restrict to world bounds
  maxBoundsViscosity={1.0} // bounce back if user tries to drag outside
>
  <ChangeView center={mapCenter} zoom={mapZoom} />
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    noWrap={true} // 🔑 disable repeated world tiles
  />
  <LocationFinder onLocationSelect={setSelectedPosition} />
  {selectedPosition && (
    <Marker position={selectedPosition}>
      <Popup>
        <div>
          <p>Lat: {selectedPosition.lat.toFixed(4)}</p>
          <p>Lon: {selectedPosition.lng.toFixed(4)}</p>
          <Button 
            type="primary" 
            size="small" 
            onClick={handleAnalyzeClick} 
            style={{ marginTop: '8px' }}
          >
            Analyze Risk
          </Button>
        </div>
      </Popup>
    </Marker>
  )}
</MapContainer>
        </div>
      </Card>
    </motion.div>
  );
}

export default HomePage;