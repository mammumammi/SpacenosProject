import CoinGecko from "./components/CoinGecko";
import WhaleTracker from "./components/WhaleTracker";
import { FaChartLine, FaShip } from 'react-icons/fa'; // Icons for the dashboard

function App() {
  // Clean up duplicate import
  // The useEffect for Firestore test is removed as it's not part of the display.

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Crypto-Intelligence Dashboard
        </h1>
        <p className="text-lg text-gray-400 mt-2">Market Insights & Whale Movements</p>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Whale Tracker Card */}
        <DashboardCard 
          title="Whale Tracker" 
          icon={<FaShip />}
        >
          <WhaleTracker />
        </DashboardCard>

        {/* CoinGecko Price Tracker Card */}
        <DashboardCard 
          title="Coin Market Prices" 
          icon={<FaChartLine />}
        >
          <CoinGecko />
        </DashboardCard>

      </main>
    </div>
  );
}

// A reusable Card component for consistent styling
const DashboardCard = ({ title, icon, children }) => (
  <section className="bg-gray-800 bg-opacity-50 rounded-xl shadow-lg border border-gray-700 h-full">
    <header className="flex items-center p-4 border-b border-gray-700">
      {icon && <span className="text-2xl mr-3 text-blue-400">{icon}</span>}
      <h2 className="text-2xl font-bold text-gray-50">{title}</h2>
    </header>
    <div className="p-4">
      {children}
    </div>
  </section>
);

export default App;