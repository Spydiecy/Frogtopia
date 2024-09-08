import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaWallet, FaBars, FaTimes } from 'react-icons/fa';
import { connectWallet, shortenAddress } from '../utils/web3Utils';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const checkWalletConnection = async () => {
      const address = await connectWallet();
      if (address) {
        setWalletAddress(address);
      }
    };
    checkWalletConnection();
  }, []);

  const handleConnectWallet = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
    }
  };

  return (
    <nav className="bg-green-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/home" className="text-2xl font-bold text-yellow-300">Frogtopia</Link>
        
        {/* Mobile menu button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/marketplace" className="text-white hover:text-yellow-300 transition duration-300">Marketplace</Link>
          <Link to="/game" className="text-white hover:text-yellow-300 transition duration-300">Game World</Link>
          <Link to="/minting" className="text-white hover:text-yellow-300 transition duration-300">Minting</Link>
          <Link to="/profile" className="text-white hover:text-yellow-300 transition duration-300">Profile</Link>
          <button 
            onClick={handleConnectWallet}
            className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold py-2 px-4 rounded-full transition duration-300 flex items-center"
          >
            <FaWallet className="mr-2" />
            {walletAddress ? shortenAddress(walletAddress) : 'Connect Wallet'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <Link to="/marketplace" className="block py-2 text-white hover:text-yellow-300 transition duration-300">Marketplace</Link>
          <Link to="/game" className="block py-2 text-white hover:text-yellow-300 transition duration-300">Game World</Link>
          <Link to="/profile" className="block py-2 text-white hover:text-yellow-300 transition duration-300">Profile</Link>
          <button 
            onClick={handleConnectWallet}
            className="mt-2 w-full bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold py-2 px-4 rounded-full transition duration-300 flex items-center justify-center"
          >
            <FaWallet className="mr-2" />
            {walletAddress ? shortenAddress(walletAddress) : 'Connect Wallet'}
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;