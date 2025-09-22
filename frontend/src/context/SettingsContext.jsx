import React, { useState } from 'react';
import { SettingsContext } from './settings';

export const SettingsProvider = ({ children }) => {
  const [threshold, setThreshold] = useState(95); // Default to 95th percentile

  const value = { threshold, setThreshold };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};