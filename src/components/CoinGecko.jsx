import axios from "axios";
import { useEffect, useState } from "react";

const CoinGecko = () => {
    const [coinData, setCoinData] = useState([]);
    const [summaries, setSummaries] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Add the missing state variables for the summary section
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState(null);

    const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3/';
    
    // Fetch initial market data from CoinGecko
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
    
    // Fetch AI summary after the market data is loaded
    useEffect(() => {
        const getAiPriceSummary = async () => {
            if (coinData.length === 0) return;
            
            setSummaryLoading(true);
            setSummaryError(null);
            try {
                // 2. Use the correct HTTP protocol (http, not https for local dev)
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

    if (loading) return <div className="p-4 text-center">Loading Market Data...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Crypto Coin Price Tracker</h1>
            
            {/* 3. Use a proper HTML table to fix the alignment issues */}
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">1h %</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">24h %</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">7d %</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {coinData.map((coin) => (
                            <tr key={coin.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img src={coin.image} className="h-8 w-8 mr-3" alt={`${coin.name} logo`} />
                                        <div>
                                            <div className="font-medium text-gray-900">{coin.name}</div>
                                            <div className="text-sm text-gray-500 uppercase">{coin.symbol}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">${coin.current_price.toLocaleString()}</td>
                                <td className={`px-6 py-4 whitespace-nowrap font-medium ${coin.price_change_percentage_1h_in_currency >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {coin.price_change_percentage_1h_in_currency?.toFixed(2)}%
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap font-medium ${coin.price_change_percentage_24h_in_currency >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {coin.price_change_percentage_24h_in_currency?.toFixed(2)}%
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap font-medium ${coin.price_change_percentage_7d_in_currency >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* This is the summary section, which now works with the added states */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">AI Market Summary</h2>
                <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
                    {summaryLoading && <p>Generating AI summary...</p>}
                    {summaryError && <p className="text-red-500">{summaryError}</p>}
                    {!summaryLoading && !summaryError && summaries.map((summary, index) => (
                        <p key={index} className="text-gray-700 leading-relaxed">{summary}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoinGecko;