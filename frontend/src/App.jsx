import React from 'react';
import { Layout } from 'antd';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Toaster richColors theme="dark" position="top-right" />
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <Navbar />
      </Header>
      <Content style={{ padding: '24px' }}>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="about" element={<AboutPage />} />
           <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        ClimaRisk ©{new Date().getFullYear()} - A NASA Space Apps Project
      </Footer>
    </Layout>
  );
}

export default App;