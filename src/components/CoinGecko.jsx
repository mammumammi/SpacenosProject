import axios from "axios";
import { useEffect, useState } from "react";

const CoinGecko = () => {
    const [coinData, setCoinData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const COINGECKO_baseUrl = 'https://api.coingecko.com/api/v3/';
    useEffect( ()=>{
        //function to fetch data from coingecko,using demo api key
        const fetchData = async () => {
            try {
                const response =  await axios.get(`${COINGECKO_baseUrl}/coins/markets/`,{
                    params:{
                        vs_currency: "usd",
                        ids:"bitcoin,ethereum,solana,binancecoin,rootstock,flow,polygon,avalanche-2,alchemy-pay",//Add the required cryptocurrencies
                        price_change_percentage:"1h,24h,7d"
                    },
                    headers:{
                        "x-cg-demo-api-key": import.meta.env._COINGECKO_API_KEY
                    }
                })
                setCoinData(response.data);
            }
            catch (err){
                console.log("error in getting coingecko data:",err);
                setError(err.message);
            }
            finally{
                setLoading(false);
            }

        }

        fetchData();
    },[])

    if (loading) return <div>Still Loading</div>
    if (error) return <div>Error occured</div>

    return(
        <div>
            <h1>
                Crypto Coin Price Tracker
            </h1>
            <div className="flex flex-row gap-x-3">
                <p>ChainName</p><p>Symbol</p><p>current Market Price</p><p>Total Volume</p><p>1h</p><p>24h</p><p>7d</p>
            </div>
            {coinData.map((coin) =>
            (
                <div className="flex flex-row space-x-14">
                    <p><img src={coin.image} className="object-contain h-[50px]" alt="" />coin.id</p>
                    <p>{coin.symbol}</p>
                    <p>{coin.current_price}</p>
                    <p>{coin.total_volume}</p>
                    <p>{coin.price_change_percentage_1h_in_currency?.toFixed(2)}%</p>
                    <p>{coin.price_change_percentage_24h_in_currency?.toFixed(2)}%</p>
                    <p>{coin.price_change_percentage_7d_in_currency?.toFixed(2)}%</p>

                </div>
            ))}
        </div>
    )

}

export default CoinGecko;