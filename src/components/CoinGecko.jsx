import axios from "axios";
import { useEffect, useState } from "react";

const CoinGecko = () => {
  // --- NO LOGIC OR API CHANGES WERE MADE HERE ---
  const [coinData, setCoinData] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3/';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets/`, {
          params: {
            vs_currency: "usd",
            ids: "bitcoin,ethereum,solana,binancecoin,rootstock,flow,polygon,avalanche-2,alchemy-pay",
            price_change_percentage: "1h,24h,7d"
          },
          headers: {
            "x-cg-demo-api-key": import.meta.env.VITE_COINGECKO_API_KEY
          }
        });
        setCoinData(response.data);
      } catch (err) {
        console.error("Error getting CoinGecko data:", err);
        setError("Failed to load market data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const getAiPriceSummary = async () => {
      if (coinData.length === 0) return;
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const { data } = await axios.post("http://localhost:3001/priceSummarize", { tokenDetails: coinData });
        setSummaries(data.summaries);
      } catch (err) {
        console.error("Error getting AI summary:", err);
        setSummaryError("Could not generate AI summary.");
      } finally {
        setSummaryLoading(false);
      }
    };
    getAiPriceSummary();
  }, [coinData]);
  // --- END OF UNCHANGED LOGIC ---

  // --- STYLING CHANGES START HERE ---
  if (loading) return <div className="text-center py-8 text-gray-400">Loading Market Data...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm">
          <thead className="text-xs text-gray-400 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Coin</th>
              <th className="px-4 py-2 text-left">Price (USD)</th>
              <th className="px-4 py-2 text-left">1h %</th>
              <th className="px-4 py-2 text-left">24h %</th>
              <th className="px-4 py-2 text-left">7d %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {coinData.map((coin) => (
              <tr key={coin.id} className="hover:bg-gray-700/50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <img src={coin.image} className="h-6 w-6 mr-3 rounded-full" alt={`${coin.name} logo`} />
                    <div>
                      <div className="font-medium text-gray-100">{coin.name}</div>
                      <div className="text-xs text-gray-400 uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-100">${coin.current_price?.toLocaleString()}</td>
                <td className={`px-4 py-3 whitespace-nowrap font-medium ${coin.price_change_percentage_1h_in_currency >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.price_change_percentage_1h_in_currency?.toFixed(2)}%
                </td>
                <td className={`px-4 py-3 whitespace-nowrap font-medium ${coin.price_change_percentage_24h_in_currency >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.price_change_percentage_24h_in_currency?.toFixed(2)}%
                </td>
                <td className={`px-4 py-3 whitespace-nowrap font-medium ${coin.price_change_percentage_7d_in_currency >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Market Summary Section */}
      <div>
        <h3 className="text-xl font-bold mb-3 text-gray-200">AI Market Summary</h3>
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3 text-gray-300">
          {summaryLoading && <p>Generating AI market insights...</p>}
          {summaryError && <p className="text-red-400">{summaryError}</p>}
          {!summaryLoading && !summaryError && summaries.length > 0 ? (
            summaries.map((summary, index) => (
              <p key={index}>{summary}</p>
            ))
          ) : (
            !summaryLoading && <p className="text-gray-500">No summary available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinGecko;