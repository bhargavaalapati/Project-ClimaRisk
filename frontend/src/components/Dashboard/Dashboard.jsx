import React, { useState, useEffect } from 'react';
import { fetchRiskData } from '../../api/riskService';
import KeyIndicators from './KeyIndicators';

function Dashboard() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchRiskData();
      setRiskData(data);
      setLoading(false);
    };
    getData();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading Real Climate Data...</div>;
  }

  if (!riskData) {
    return <div className="text-center p-8 text-red-500">Failed to load data.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-3xl font-bold mb-2 text-cyan-400">{riskData.location}</h2>
        <p>Successfully loaded daily summary data.</p>
      </div>
      <KeyIndicators data={riskData} />
    </div>
  );
}

export default Dashboard;