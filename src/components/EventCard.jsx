// src/components/EventCard.jsx
import { FaArrowRight, FaChartLine, FaShip, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';

const EventCard = ({ event }) => {
  const { type, timestamp, title, details, analysis } = event;

  const severityStyles = {
    High: {
      icon: <FaExclamationTriangle className="text-red-400" />,
      borderColor: 'border-red-500',
      labelColor: 'bg-red-500/20 text-red-300',
    },
    Medium: {
      icon: <FaInfoCircle className="text-yellow-400" />,
      borderColor: 'border-yellow-500',
      labelColor: 'bg-yellow-500/20 text-yellow-300',
    },
    Low: {
      icon: <FaCheckCircle className="text-green-400" />,
      borderColor: 'border-green-500',
      labelColor: 'bg-green-500/20 text-green-300',
    },
    Default: {
      icon: <FaInfoCircle className="text-gray-400" />,
      borderColor: 'border-gray-700',
      labelColor: 'bg-gray-500/20 text-gray-300',
    }
  };

  const style = severityStyles[analysis.severity] || severityStyles.Default;

  // Function to format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg border-l-4 ${style.borderColor} p-5 flex flex-col sm:flex-row gap-5 transition-all duration-300 hover:shadow-blue-500/20 hover:bg-gray-700/50`}>
      <div className="text-4xl pt-1 text-gray-500">{type === 'price' ? <FaChartLine /> : <FaShip />}</div>
      
      <div className="flex-grow">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-100">{title}</h3>
            <p className="text-sm text-gray-400">{timeAgo(timestamp)}</p>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${style.labelColor}`}>{analysis.severity}</span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">{analysis.alertType}</span>
          </div>
        </header>

        <p className="text-gray-300 mb-4">{analysis.summary}</p>

        <footer className="bg-gray-900/50 p-3 rounded-md text-sm">
          {type === 'price' && (
            <div className="flex justify-around items-center text-center">
              <div>
                <span className="text-xs text-gray-400">Price</span>
                <p className="font-semibold text-green-400">${details.current_price?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">24h %</span>
                <p className={`font-semibold ${details.price_change_percentage_24h_in_currency >= 0 ? 'text-green-500' : 'text-red-500'}`}>{details.price_change_percentage_24h_in_currency?.toFixed(2)}%</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Volume</span>
                <p className="font-semibold text-gray-300">${details.total_volume?.toLocaleString()}</p>
              </div>
            </div>
          )}
          {type === 'transaction' && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center font-mono text-gray-400 mb-2 sm:mb-0">
                <span>{`${details.from.slice(0, 6)}...`}</span>
                <FaArrowRight className="mx-2 text-blue-400" />
                <span>{`${details.to.slice(0, 6)}...`}</span>
              </div>
              <div className="flex items-center gap-4">
                 <p className="font-semibold text-green-400">{details.amount?.toFixed(2)} {details.tokenSymbol}</p>
                 <a href={`https://etherscan.io/tx/${details.hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <FaExternalLinkAlt /> View
                 </a>
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default EventCard;