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

// ✅ Layout with Navbar + Footer
function MainLayout({ children }) {
  return (
    <Layout>
      <Toaster richColors theme="dark" position="top-right" />
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <Navbar />
      </Header>
      <Content style={{ padding: '24px' }}>{children}</Content>
      <Footer style={{ textAlign: 'center' }}>
        ClimaRisk ©{new Date().getFullYear()} - A NASA Space Apps Project
      </Footer>
    </Layout>
  );
}

// ✅ Minimal layout (no Navbar/Footer)
function MinimalLayout({ children }) {
  return (
    <Layout>
      <Content style={{ padding: '24px', textAlign: 'center' }}>{children}</Content>
    </Layout>
  );
}

function App() {
  return (
    <Routes>
      <Route
        index
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path="dashboard"
        element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        }
      />
      <Route
        path="about"
        element={
          <MainLayout>
            <AboutPage />
          </MainLayout>
        }
      />
      <Route
        path="*"
        element={
          <MinimalLayout>
            <NotFoundPage />
          </MinimalLayout>
        }
      />
    </Routes>
  );
}

export default App;
