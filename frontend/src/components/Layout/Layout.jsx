import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import Navbar from './Navbar';

const { Header, Content } = AntLayout;

function Layout() {
  return (
    <AntLayout className="min-h-screen">
      <Header className="sticky top-0 z-50 bg-white shadow-sm px-0" style={{ lineHeight: 'normal', height: 'auto', padding: '12px 0' }}>
        <div className="container mx-auto px-4 max-w-7xl">
          <Navbar />
        </div>
      </Header>

      <Content className="bg-gray-50" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Outlet />
        </div>
      </Content>
    </AntLayout>
  );
}

export default Layout;