import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useSpring, animated } from '@react-spring/web';
import Navbar from '../components/Navbar';
import CROAKTokenABI from '../contracts/CROAKTokenABI.json';
import { FaWallet} from 'react-icons/fa';

function CROAKMinting() {
  const [balance, setBalance] = useState('0');
  const [status, setStatus] = useState('');

  const croakTokenAddress = '0x74689f77e03D8213DF5037b681F05b80bAAe3504';

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        const croakToken = new web3.eth.Contract(CROAKTokenABI, croakTokenAddress);
        const balance = await croakToken.methods.balanceOf(accounts[0]).call();
        setBalance(web3.utils.fromWei(balance, 'ether'));
      }
    }
  };

  const mintCROAK = async () => {
    if (!window.ethereum) {
      setStatus('Please install MetaMask!');
      return;
    }

    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const croakToken = new web3.eth.Contract(CROAKTokenABI, croakTokenAddress);

    try {
      const accounts = await web3.eth.getAccounts();
      await croakToken.methods.mint().send({ from: accounts[0] });
      setStatus('CROAK minted successfully!');
      loadBalance();
    } catch (error) {
      setStatus('Error minting CROAK: ' + error.message);
    }
  };

  return (
    <animated.div style={fadeIn} className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto mt-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-yellow-300">CROAK Token Minting</h1>
        <p className="text-xl mb-12">Power up your Frogtopia adventure with CROAK tokens!</p>
      </section>

      {/* Minting Section */}
      <section className="container mx-auto mt-16 px-4">
        <div className="max-w-md mx-auto bg-green-700 bg-opacity-50 p-8 rounded-lg shadow-xl">
          <div className="flex items-center justify-center mb-8">
            <FaWallet className="text-5xl text-yellow-300 mb-4" />
          </div>
          <h2 className="text-3xl font-semibold mb-4 text-yellow-300 text-center">Your Balance</h2>
          <p className="text-center text-4xl font-bold mb-8">{balance} CROAK</p>
          
          <button
            onClick={mintCROAK}
            className="w-full bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
          >
            Mint 100 CROAK
          </button>
          
          {status && (
            <p className="mt-4 text-center text-yellow-300">{status}</p>
          )}
        </div>
      </section>

    </animated.div>
  );
}

export default CROAKMinting;