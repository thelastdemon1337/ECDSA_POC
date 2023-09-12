import React, { useEffect, useState } from 'react'
import "./Navbar.css"
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
const URID = process.env.REACT_APP_NGROK_BACKEND_URI

const config = {
  headers: {
    "ngrok-skip-browser-warning": true
  }
}

const Navbar = ({metamaskConnected,showMetaMaskBtn,showMetaMaskBtnConn}) => {
  const [metaMaskConn,setMetaMaskConn] = useState(false)
  const navigate = useNavigate()

      const btnhandler = async () => {
        try {
          // Check if MetaMask is present
          if (window.ethereum) {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            setMetaMaskConn(true);
            showMetaMaskBtnConn = true
            alert("MetaMask Connected");
          } else {
            alert("Install MetaMask extension!!");
          }
        } catch (error) {
          alert("Error connecting to MetaMask: " + error.message);
        }
      };

      const handleLogout = async () => {
      await axios.get(
          `${URID}/api/auth/logout`, config
        ).then(() => {
          console.log("Logged out!")
          navigate('/')
        })
      }

  return (
    <div className="navbar__container">
      <div className='logout__container'>
        { metaMaskConn ? null :<button className='metamask__btn' onClick={btnhandler}>Connect Metamask</button>}
        <button className='logout__btn' onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  )
}

export default Navbar
