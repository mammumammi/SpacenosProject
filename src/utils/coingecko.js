import axios from "axios";

const COINGECKO_baseUrl = 'https://api.coingecko.com/api/v3/';

export async function fetchTokenPrice(){
    try {
        const url = `${COINGECKO_baseUrl}/coins/markets?vs_currency=usd&ids=bitcoin&names=Bitcoin&symbols=btc&category=layer-1&price_change_percentage=1h`;
        const response = await axios.get(url,{
            headers:{
                "x-cg-demo-api-key": `${import.meta.env._COINGECKO_API_KEY}`
            }
        })
    }
}