import axios from "axios";
import { useEffect, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

const severityColors = {
  High: "bg-red-600 text-gray-200",
  Medium: "bg-yellow-500 text-black",
  Low: "bg-green-600 text-gray-200",
};

const WhaleTracker = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [structuredSummaries, setStructuredSummaries] = useState([]);

  useEffect(() => {
    const fetchWhaleEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const walletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
        const threshold = 1000;
        const native = false;

        const chains = [
          { name: "ETH", url: "https://api.etherscan.io/v2/api?chainid=1" },
          { name: "BNB", url: "https://api.etherscan.io/v2/api?chainid=56" },
          { name: "Arbitrum One", url: "https://api.etherscan.io/v2/api?chainid=42161" },
        ];

        const params = {
          module: "account",
          action: native ? "txlist" : "tokentx",
          address: walletAddress,
          page: 1,
          offset: 100,
          order: "desc",
          apikey: import.meta.env.VITE_ETHERSCAN_API_KEY,
        };

        let newEvent = [];
        for (let chain of chains) {
          const response = await axios.get(chain.url, { params });
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
                  chain: chain.name,
                };
              } else {
                const decimals = Number(tx.TokenDecimal || 18);
                return {
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  tokenSymbol: tx.tokenSymbol,
                  amount: Number(tx.value) / 10 ** decimals,
                  time: new Date(tx.timeStamp * 1000).toLocaleString(),
                  chain: chain.name,
                };
              }
            })
            .filter((tx) => (native ? tx.value >= threshold : tx.amount >= threshold));
          newEvent = newEvent.concat(filtered);
        }
        setEvents(newEvent);
      } catch (err) {
        console.log("Error fetching events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWhaleEvents();
    const interval = setInterval(fetchWhaleEvents, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const fetchSummary = async () => {
        try {
          const { data } = await axios.post("/summarize", {
            transactions: events,
          });
          setStructuredSummaries(data.summaries || []);
        } catch (err) {
          console.error("Failed to fetch AI summaries:", err);
        }
      };
      fetchSummary();
    }
  }, [events]);

  if (loading) return <div className="text-center py-8 text-gray-300">Loading Whale Events...</div>;
  if (error) return <div className="text-center py-8 text-red-400">Error: {error}</div>;

  return (
    <div className="grid overflow-y-auto h-full grid-cols-1 md:grid-cols-2 gap-6 hide-scrollbar">
      {events.map((tx, index) => {
        const analysis = structuredSummaries[index] || {};

        const summaryText = analysis.summary || "AI summary is being generated...";
        const alertTypeText = analysis.alertType || "Fetching...";
        const severityText = analysis.severity || "Fetching...";

        return (
          <div
            key={`${tx.hash}-${index}`}
            className="relative group rounded-lg p-5 shadow-md border border-gray-700 hover:shadow-lg transition"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-300">{tx.chain}</span>

              {analysis.severity ? (
                <span
                  className={`px-3 py-1 text-xs rounded-full font-bold ${
                    severityColors[analysis.severity] || "bg-gray-600 text-gray-200"
                  }`}
                >
                  {analysis.severity}
                </span>
              ) : (
                <span className="px-3 py-1 text-xs rounded-full bg-gray-600 text-gray-200">
                  Loading...
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-green-400 mb-2">
              {tx.tokenSymbol || "Native Token"} – {tx.amount?.toFixed(2) || tx.value?.toFixed(2)}
            </h3>

            <div className="p-3 bg-black rounded-md border border-gray-700 mt-2">
              <p className="text-sm text-gray-200">{summaryText}</p>
            </div>

            {analysis.summary && analysis.alertType && analysis.severity && (
              <div className="absolute inset-0 bg-black/90 text-gray-200 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center p-4 text-center transition-opacity duration-300 rounded-lg">
                <p className="text-sm font-semibold mb-2">{analysis.summary}</p>
                <p className="text-xs uppercase text-green-400 mb-1">Alert Type: {analysis.alertType}</p>
                <p className="text-xs italic">Severity: {analysis.severity}</p>
              </div>
            )}

            <p className="text-sm text-gray-300 mt-3">
              From:{" "}
              <span className="font-mono">{`${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`}</span>
            </p>
            <p className="text-sm text-gray-300 mb-2">
              To: <span className="font-mono">{`${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}</span>
            </p>

            <a
              href={`https://etherscan.io/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-green-400 hover:text-green-300 text-sm"
            >
              <FaExternalLinkAlt className="mr-1" /> View Transaction
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default WhaleTracker;
