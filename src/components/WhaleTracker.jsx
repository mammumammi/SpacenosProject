/*{
ETHERSCAN_API_KEY=VZFDUWB3YGQ1YCDKTCU1D6DDSS
BSCSCAN_API_KEY=ZM8ACMJB67C2IXKKBF8URFUNSY
SNOWSCAN_API_KEY=ATJQERBKV1CI3GVKNSE3Q7RGEJ
ARBISCAN_API_KEY=B6SVGA7K3YBJEQ69AFKJF4YHVX
OPTIMISM_API_KEY=66N5FRNV1ZD4I87S7MAHCJVXFJ

ETHERSCAN_API_URL=https://api.etherscan.io/api
BSCSCAN_API_KEY=https://api.bscscan.com/api
SNOWSCAN_API_KEY=https://api.snowscan.xyz/api
ARBISCAN_API_KEY=https://api.arbiscan.io/api
OPTIMISM_API_KEY=https://api-optimistic.etherscan.io/api
}*/

import axios from "axios";
import { useEffect, useState } from "react";


const WhaleTracker = () => {
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [summaries, setSummaries] = useState([]);

const fetchWhaleEvents = async () => {
    setLoading(true);
    setError(null);
    try {
        const walletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
        const threshold = 1000;
        const native = false; //native = true,then it is Eth,else its ERC20

        const chains = [
          {name:"ETH",url:'https://api.etherscan.io/v2/api?chainid=1'},
            {name:"BNB",url:'https://api.etherscan.io/v2/api?chainid=56'},
            {name:"Arbitrum One",url:'https://api.etherscan.io/v2/api?chainid=42161'}
        ]

        const params = {
            module: "account",
            action: native ? "txlist" : "tokentx",
            address: walletAddress,
            page:1,
            offset:100,
            order:"desc",
            apikey: import.meta.env.VITE_ETHERSCAN_API_KEY,
        };

        let newEvent =[];
        for (let chain of chains){
            const response = await axios.get(chain.url,{params});
            const result = response.data.result;
            const filtered = result.map((tx) => {
                if (native){
                    return {
                        hash: tx.hash,
                        from: tx.from,
                        to: tx.to,
                        value: Number(tx.value)/1e18,
                        time: new Date(tx.timeStamp* 1000).toLocaleString(),
                        chain:chain.name
                    };
                }
                else {
                    const decimals = Number(tx.TokenDecimal || 18);
                    return{
                        hash:tx.hash,
                        from: tx.from,
                        to: tx.to,
                        tokenSymbol: tx.tokenSymbol,
                        amount: Number (tx.value)/10**decimals,
                        time:new Date(tx.timeStamp*1000).toLocaleString(),
                        chain:chain.name
                    };
                }
            }).filter((tx) => (native ? tx.value>=threshold : tx.amount >= threshold));
            newEvent = newEvent.concat(filtered)
            
        }
        setEvents(newEvent);


        
    }
    catch(err){
        console.log("Error happend when fetching data from etherscan:",err);
        setError(err.message);
    }
    finally{
        setLoading(false);
    }
};

  const getAiSummary = async () => {
    // Get AI summaries from server
const { data } = await axios.post("http://localhost:3001/summarize", { transactions: events });
setSummaries(data.summaries);

  }
  


useEffect( ()=>{
    fetchWhaleEvents();
    const interval = setInterval(fetchWhaleEvents,60_000);
    return () => clearInterval(interval);
},[]);
useEffect(() => {
    if (events.length > 0) {
        const fetchSummary = async () => {
            try {
                const { data } = await axios.post("http://localhost:3001/summarize", { transactions: events });
                setSummaries(data.summaries);
            } catch (err) {
                console.error("Failed to fetch AI summaries:", err);
            }
        };
        fetchSummary();
    }
}, [events]); 
if (loading) return <div>Loading please wait</div>;
if (error) return <div>Some error has occured,please try again</div>
return (
    <div className="flex flex-col p-4">
    <h1 className="text-2xl font-bold mb-4">Whale Wallet Events</h1>
    
    {/* Use a container for responsive scrolling on small screens */}
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* Added a complete header row for all columns */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chain</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tx</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Mapped over the events array just ONCE */}
          {events.map((tx, index) => (
            <tr key={tx.hash}>
              <td className="px-6 py-4 whitespace-nowrap">{tx.chain}</td>
              <td className="px-6 py-4 whitespace-nowrap">{tx.token}</td>
              <td className="px-6 py-4 whitespace-nowrap">{tx.amount || tx.value}</td>
              <td className="px-6 py-4 whitespace-nowrap">{tx.from}</td>
              <td className="px-6 py-4 whitespace-nowrap">{tx.to}</td>
              <td className="px-6 py-4 whitespace-nowrap">{tx.time}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {/* FIX: Corrected URL and added visible text for the link */}
                <a 
                  href={`https://etherscan.io/tx/${tx.hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-900"
                >
                  {/* Displaying a shortened hash is common practice */}
                  {`${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`}
                </a>
              </td>
              {/* Added the summary cell into this single table */}
              <td className="px-6 py-4 whitespace-nowrap">{summaries[index] || "Loading..."}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)
}

export default WhaleTracker;