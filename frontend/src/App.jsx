import React from 'react';
import { Layout } from 'antd';
import { Route, Routes } from 'react-router-dom';

// Import all our components and pages
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* The Ant Design Header component */}
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        {/* We are now placing your Navbar component inside the header */}
        <Navbar />
      </Header>

      {/* The Ant Design Content component provides the padding/margin */}
      <Content style={{ padding: '24px' }}>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="about" element={<AboutPage />} />
        </Routes>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        ClimaRisk ©{new Date().getFullYear()} - A NASA Space Apps Project
      </Footer>
    </Layout>
  );
}

export default App;