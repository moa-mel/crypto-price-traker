import React, {useEffect, useState, useRef} from 'react'
import axios from 'axios'
import Coin from './Coin'
import "./App.css"
import { useScript } from "./hooks/useScript";
import jwt_deocde from "jwt-decode";

const App = () => {
  const [coins, setCoins] = useState([])
  const [search, setSearch] = useState('')
  const googlebuttonref = useRef();
  const [user, setuser] = useState(false);

  const onGoogleSignIn = (user) => {
    let userCred = user.credential;
    let payload = jwt_deocde(userCred);
    console.log(payload);
    setuser(payload);
  };

  useScript("https://accounts.google.com/gsi/client", () => {
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID, // here's your Google ID
      callback: onGoogleSignIn,
      auto_select: false,
    });

    window.google.accounts.id.renderButton(googlebuttonref.current, {
      size: "medium",
    });
  });

  /* if (isAndroid && isEmbeddedBrowser) {
  alert("Please open this link in your default browser for a better experience.");
}  */

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const url = window.location.href;
  
    // Detect iOS embedded browsers (LinkedIn, Instagram, Snapchat)
    const isIOS = userAgent.includes('Mobile') && (userAgent.includes('iPhone') || userAgent.includes('iPad'));
    const isAndroid = userAgent.includes('Android');

    const isEmbeddedBrowser =
      userAgent.includes('LinkedInApp') ||
      userAgent.includes('Instagram') ||
      userAgent.includes('Snapchat');
  
      if (isEmbeddedBrowser) {
        if (isIOS) {
          // Redirect to Safari for iOS
          window.location.href = 'x-safari-' + url;
        } else if (isAndroid) {
          // Redirect to Chrome for Android
          window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        }
      }
    }, []);

  useEffect(() => {
     axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false')
     .then(res => {
       setCoins(res.data)
       console.log(res.data)
     }).catch(error => console.log(error))
    }, [])

   

  const handleChange = e => {
    setSearch(e.target.value)
  }

 const filteredCoins = coins.filter(coin =>
  coin.name.toLowerCase().includes(search.toLocaleLowerCase())
  )

  return (
    <div className="coin-app">
    {!user && <div ref={googlebuttonref}></div>}
    {user && ( 
    <div className='coin-search'>
      <h1 className='coin-text'>coin track</h1>
      <div >
      <div className='coin-header'>
      <form>
      <input type="text" placeholder='Search' 
      className='coin-input' 
     onChange={handleChange} />
      </form>
      <img src={user.picture} alt="profile"  className='user-picture' />
      </div>
     </div>
     
        {filteredCoins?.map(coin =>{
          return (
            <Coin
            key={coin.id}
            name={coin.name}
            price={coin.current_price}
            symbol={coin.symbol}
            marketcap={coin.market_cap}
            volume={coin.total_volume}
            image={coin.image}
            priceChange={coin.price_change_percentage_24h}
            />
          )
        })}
        </div>
        )}
    </div>
  )
}

export default App