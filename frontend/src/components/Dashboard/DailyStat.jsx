import React from 'react';

const DailyStat = ({ date, temp, wind, precip }) => {
  return (
    <div className="bg-gray-700 p-3 rounded-md flex justify-between items-center animate-fade-in">
      {/* Date */}
      <div className="font-bold text-gray-200">
        {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
      
      {/* Stats */}
      <div className="text-right text-sm">
        <p>Max Temp: <span className="font-semibold text-red-400">{temp.toFixed(1)}°C</span></p>
        <p>Max Wind: <span className="font-semibold text-blue-400">{wind.toFixed(1)} m/s</span></p>
        <p>Precipitation: <span className="font-semibold text-green-400">{precip.toFixed(1)} mm</span></p>
      </div>
    </div>
  );
};

export default DailyStat;