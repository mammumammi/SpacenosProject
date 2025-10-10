import CoinGecko from "./components/CoinGecko";
import WhaleTracker from "./components/WhaleTracker";
import { FaChartLine, FaShip } from 'react-icons/fa'; // Icons for the dashboard

function App() {
  // Clean up duplicate import
  // The useEffect for Firestore test is removed as it's not part of the display.

  return (
    <div className="min-h-screen bg-black text-gray-200 p-4 sm:p-8 font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-green-400">
          Crypto-Intelligence Dashboard
        </h1>
        <p className="text-lg text-gray-300 mt-2">Market Insights & Whale Movements</p>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Whale Tracker Card */}
        <DashboardCard className=''
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
  <section className="bg-black bg-opacity-90 rounded-xl shadow-lg border border-gray-700 h-[100vh] flex flex-col">
    <header className="flex items-center p-4 border-b border-gray-700 flex-shrink-0">
      {icon && <span className="text-2xl mr-3 text-green-400">{icon}</span>}
      <h2 className="text-2xl font-bold text-gray-200">{title}</h2>
    </header>
    <div className="p-4 flex-1 overflow-hidden">
      {children}
    </div>
  </section>
);

export default App;