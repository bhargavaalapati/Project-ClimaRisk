import React from 'react'
import ReactDOM from 'react-dom/client'
import { SettingsProvider } from './context/SettingsContext';
import { BrowserRouter } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'; 
import App from './App.jsx'
import 'antd/dist/reset.css';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
)