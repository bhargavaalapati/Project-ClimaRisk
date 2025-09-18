// We'll import these later as they are built
import Navbar from './components/Layout/Navbar'
// import Dashboard from './components/Dashboard/Dashboard'

function App() {
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="bg-gray-800 p-4 shadow-md">
        <Navbar />
      </header>

      <main className="p-8">
        <h2 className="text-xl mb-4">Main Content Area</h2>
        <p>Your components like the Map and Dashboard will go here.</p>
        {/* <Dashboard /> */}
      </main>
    </div>
  )
}

export default App