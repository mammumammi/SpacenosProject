import React, { useEffect, useState } from "react";
import axios from "axios";

const WhaleTracker = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWhaleEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const walletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Example whale wallet
      const threshold = 1000; // Filter large transfers
      const native = false; // false = ERC20, true = ETH

      const url = "https://api.etherscan.io/v2/api?chainid=1";
      const params = {
        module: "account",
        action: native ? "txlist" : "tokentx",
        address: walletAddress,
        page: 1,
        offset: 100,
        sort: "desc",
        apikey: import.meta.env.VITE_ETHERSCAN_API_KEY,
      };

      const response = await axios.get(url, { params });
      console.log("Etherscan response:", response.data);

      if (!Array.isArray(response.data.result)) {
        throw new Error(response.data.message || "Unexpected Etherscan response");
      }

      const result = response.data.result;

      const filtered = result
        .map((tx) => {
          if (native) {
            return {
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: Number(tx.value) / 1e18,
              time: new Date(tx.timeStamp * 1000).toLocaleString(),
            };
          } else {
            const decimals = Number(tx.tokenDecimal || 18);
            return {
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              tokenSymbol: tx.tokenSymbol,
              amount: Number(tx.value) / 10 ** decimals,
              time: new Date(tx.timeStamp * 1000).toLocaleString(),
            };
          }
        })
        .filter((tx) => (native ? tx.value >= threshold : tx.amount >= threshold));

      setEvents(filtered);
    } catch (err) {
      console.error("Error fetching whale events:", err);
      setError(err.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhaleEvents();
    const interval = setInterval(fetchWhaleEvents, 60_000); // auto-refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="text-white text-center mt-6 text-lg">
        Loading whale events, please wait...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center mt-6 text-lg">
        Error: {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-900 rounded-2xl shadow-xl w-full max-w-5xl mx-auto mt-6">
      <h1 className="text-2xl font-semibold mb-4 text-white">
        🐋 Whale Wallet Events
      </h1>
      {events.length === 0 && (
        <div className="text-gray-400">No whale events found</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg">
          <thead>
            <tr className="text-gray-400 text-left border-b border-gray-700">
              <th className="py-2 px-4">Token</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">From</th>
              <th className="py-2 px-4">To</th>
              <th className="py-2 px-4">Time</th>
              <th className="py-2 px-4">Tx</th>
            </tr>
          </thead>
          <tbody>
            {events.map((tx) => (
              <tr
                key={tx.hash}
                className="border-b border-gray-700 hover:bg-gray-700 transition"
              >
                <td className="py-2 px-4 text-white">{tx.tokenSymbol || "ETH"}</td>
                <td className="py-2 px-4 text-white">{tx.amount || tx.value}</td>
                <td className="py-2 px-4 text-gray-300">{tx.from}</td>
                <td className="py-2 px-4 text-gray-300">{tx.to}</td>
                <td className="py-2 px-4 text-gray-400">{tx.time}</td>
                <td className="py-2 px-4">
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WhaleTracker;
