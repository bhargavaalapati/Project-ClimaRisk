import React from 'react';

function Navbar() {
  return (
    <nav className="flex items-center justify-between w-full">
      <div className="text-xl font-bold text-cyan-400">
        {/* You can add a logo here later */}
        ClimaRisk
      </div>
      <div className="flex items-center space-x-4">
        <a href="#" className="text-gray-300 hover:text-white">About</a>
        <a href="#" className="text-gray-300 hover:text-white">Resources</a>
        <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">
          Share
        </button>
      </div>
    </nav>
  );
}

export default Navbar;