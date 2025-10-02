import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, LayersControl } from 'react-leaflet';
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
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const [locationName, setLocationName] = useState(null);
  const [fullAddress, setFullAddress] = useState(null);

  // ✅ fetch place name + full address
  const fetchPlaceName = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const data = await res.json();

    // Pick shortName
    const shortName =
      data.city || data.locality || data.principalSubdivision || `Lat: ${lat}, Lon: ${lon}`;

    // Build full address but filter out duplicates of shortName
    const parts = [data.locality, data.city, data.principalSubdivision, data.countryName]
      .filter(Boolean)
      .filter((item, idx, arr) => arr.indexOf(item) === idx) // remove dupes
      .filter((item) => item !== shortName); // avoid repeating shortName

    const full = parts.join(", ");

    setLocationName(shortName);
    setFullAddress(full);
  } catch {
    setLocationName(null);
    setFullAddress(null);
  }
};

  const handleAnalyzeClick = () => {
    if (selectedPosition) {
      navigate(
        `/dashboard?lat=${selectedPosition.lat.toFixed(4)}&lon=${selectedPosition.lng.toFixed(4)}`
      );
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
        fetchPlaceName(newPosition.lat, newPosition.lng); // ✅ fetch address
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
            worldCopyJump={false}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
          >
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Street Map">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="NASA Blue Marble">
                <TileLayer
                  url="https://map1.vis.earthdata.nasa.gov/wmts-webmerc/BlueMarble_NextGeneration/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg"
                  attribution='&copy; NASA Worldview'
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={true}
            />

            <LocationFinder
              onLocationSelect={(pos) => {
                setSelectedPosition(pos);
                fetchPlaceName(pos.lat, pos.lng); // ✅ fetch address on click
              }}
            />

            {selectedPosition && (
              <Marker position={selectedPosition}>
                <Popup>
                  <div>
                    <p><strong>{locationName || "Unknown Location"}</strong></p>
                    {fullAddress && (
                      <p style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.6)" }}>
                        {fullAddress}
                      </p>
                    )}
                    <p style={{ fontSize: "0.75rem", color: "#999" }}>
                      Lat: {selectedPosition.lat.toFixed(4)}, Lon: {selectedPosition.lng.toFixed(4)}
                    </p>
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
