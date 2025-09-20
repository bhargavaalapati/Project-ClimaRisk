import React, { useState, useEffect } from 'react';
import { fetchRiskData } from '../../api/riskService';


function Dashboard() {
  const [riskData, setRiskData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchRiskData();
      setRiskData(data);
    };
    getData();
  }, []);

  if (!riskData) {
    return <div>Loading data...</div>;
  }


  return (
    <div>
      <h2 className="text-2xl">{riskData.query.location}</h2>
      <p>TODI Score: {riskData.riskAnalysis.todi.score}</p>
    </div>
  );
}

export default Dashboard;