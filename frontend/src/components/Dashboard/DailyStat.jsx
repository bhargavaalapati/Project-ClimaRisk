import React from 'react';

const DailyStat = ({ date, temp, wind, precip }) => {
  // We add '|| 0' as a safety check. 
  // If temp, wind, or precip is missing, it will use 0 instead of crashing.
  const tempDisplay = (temp || 0).toFixed(1);
  const windDisplay = (wind || 0).toFixed(1);
  const precipDisplay = (precip || 0).toFixed(1);

  return (
    <div className="bg-gray-700 p-3 rounded-md flex justify-between items-center animate-fade-in">
      {/* Date */}
      <div className="font-bold text-gray-200">
        {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
      
      {/* Stats */}
      <div className="text-right text-sm">
        <p>Max Temp: <span className="font-semibold text-red-400">{tempDisplay}°C</span></p>
        <p>Max Wind: <span className="font-semibold text-blue-400">{windDisplay} m/s</span></p>
        <p>Precipitation: <span className="font-semibold text-green-400">{precipDisplay} mm</span></p>
      </div>
    </div>
  );
};

export default DailyStat;