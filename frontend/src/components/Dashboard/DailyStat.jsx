import React from 'react';

// Update the component to accept a 'threshold' prop
const DailyStat = ({ date, temp, wind, precip, threshold }) => {
  // Compare the daily temp to the historical threshold
  const isVeryHot = temp > threshold;

  // Dynamically change the color based on the comparison
  const tempColorClass = isVeryHot ? 'text-red-500 font-bold animate-pulse' : 'text-red-400';

  return (
    <div className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
      <div className="font-bold text-gray-200">
        {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
      <div className="text-right text-sm">
        <p>Max Temp: <span className={tempColorClass}>{temp.toFixed(1)}°C</span></p>
        <p>Max Wind: <span className="font-semibold text-blue-400">{wind.toFixed(1)} m/s</span></p>
        <p>Precipitation: <span className="font-semibold text-green-400">{precip.toFixed(1)} mm</span></p>
      </div>
    </div>
  );
};

export default DailyStat;