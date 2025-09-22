import React, { useState } from 'react';
import { Menu, Button, Modal, Slider, Typography } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useSettings } from '../../context/settings';

const { Text, Paragraph } = Typography;

const items = [
  { label: <Link to="/">Home</Link>, key: 'home', icon: <HomeOutlined /> },
  { label: <Link to="/about">About</Link>, key: 'about', icon: <InfoCircleOutlined /> },
];

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { threshold, setThreshold } = useSettings();
  const location = useLocation(); // Get the current location/route

  // Only show the settings button if the user is on the dashboard page
  const showSettingsButton = location.pathname.startsWith('/dashboard');

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
        🚀 ClimaRisk
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          items={items}
          style={{ borderBottom: 'none', backgroundColor: 'transparent' }}
          selectable={false}
        />
        
        {/* Conditionally render the button based on the current route */}
        {showSettingsButton && (
          <Button 
            type="text" 
            icon={<SettingOutlined />} 
            onClick={() => setIsModalOpen(true)} 
            style={{color: 'white', marginLeft: '16px'}} 
          />
        )}
      </div>
      
      <Modal title="Settings" open={isModalOpen} onOk={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Text strong>"Very Hot" Threshold</Text>
        <Paragraph type="secondary">Adjust the percentile used to define "very hot" conditions.</Paragraph>
        <Slider
          min={75}
          max={99}
          onChange={setThreshold} // Cleaned up: no console.log
          value={threshold}
          marks={{ 75: '75th', 90: '90th', 95: '95th', 99: '99th' }}
        />
      </Modal>
    </div>
  );
}

export default Navbar;