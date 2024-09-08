import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaLock } from 'react-icons/fa';
import { useSpring, animated } from '@react-spring/web';
import Navbar from '../components/Navbar';
import Web3 from 'web3';
import FrogtopiaNFTABI from '../contracts/FrogtopiaNFTABI.json';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const NFTCard = ({ id, name, image, price, attributes, onMint, mintCount, isOwned }) => (
  <div className="relative bg-green-800 bg-opacity-50 p-4 rounded-lg shadow-xl transform hover:scale-105 transition duration-300">
    {isOwned && (
      <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-2">
        <FaLock className="text-green-800" />
      </div>
    )}
    <img src={`${IPFS_GATEWAY}${image}`} alt={name} className="w-full h-48 object-cover rounded-lg mb-4" />
    <h3 className="text-xl font-semibold mb-2 text-yellow-300">{name}</h3>
    <p className="text-gray-200">Price: {price} ETH</p>
    <p className="text-gray-200">Minted: {mintCount}/250</p>
    <div className="mb-2">
      {attributes.map((attr, index) => (
        <span key={index} className="inline-block bg-green-600 rounded-full px-2 py-1 text-xs font-semibold text-white mr-1 mb-1">
          {attr.trait_type}: {attr.value}
        </span>
      ))}
    </div>
    <button 
      onClick={() => onMint(id)}
      className={`mt-4 w-full font-bold py-2 px-4 rounded-full text-sm transition duration-300 ${
        isOwned 
          ? 'bg-gray-500 text-white cursor-not-allowed' 
          : 'bg-yellow-300 hover:bg-yellow-400 text-green-800'
      }`}
      disabled={isOwned}
    >
      {isOwned ? 'Owned' : 'Mint NFT'}
    </button>
  </div>
);

function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [balance, setBalance] = useState('0');
  const [status, setStatus] = useState('');
  const [nfts, setNfts] = useState([]);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const frogtopiaNFTAddress = '0x8d22300374Dc06a3b7019f2B31D46DE3F293c101'; // Replace with your actual contract address

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  useEffect(() => {
    loadNFTData();
    loadBalance();
  }, []);

  const loadNFTData = async () => {
    setLoading(true);
    setError(null);
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        console.log("Connected account:", account);

        const frogtopiaNFT = new web3.eth.Contract(FrogtopiaNFTABI, frogtopiaNFTAddress);
        console.log("FrogtopiaNFT contract initialized");
        
        const nftTypes = [
          { id: 1, tokenURI: "ipfs://QmZbV6Nrf8Yx6q7JRe5tFAZYqXYF3dxZWKAoQVEQdKH8HA" },
          { id: 2, tokenURI: "ipfs://QmQKsQHJnv6Vb6iheuLwNUFQ15BpvLJdc9B19pmEk4g39G" },
          { id: 3, tokenURI: "ipfs://QmPUWScBTCkZ4c1vQ31oKhM2aTYu8584gdPi9t43oAttTR" },
          { id: 4, tokenURI: "ipfs://QmfLugkUhRAt31zzLsEU3uWSHz433QULZPHKuhj6kEhWNz" },
        ];

        console.log("Fetching NFT metadata and minted status...");
        const nftData = await Promise.all(nftTypes.map(async (nft) => {
          try {
            const response = await fetch(`${IPFS_GATEWAY}${nft.tokenURI.replace('ipfs://', '')}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const metadata = await response.json();
            
            // Get the mint count for this NFT type
            const mintCount = await frogtopiaNFT.methods.getMintCount(nft.id).call();
            
            return {
              ...nft,
              ...metadata,
              image: metadata.image.replace('ipfs://', ''),
              mintCount: mintCount
            };
          } catch (error) {
            console.error(`Error fetching metadata for NFT ${nft.id}:`, error);
            return null;
          }
        }));

        const validNFTs = nftData.filter(nft => nft !== null);
        console.log("Valid NFTs:", validNFTs);
        setNfts(validNFTs);

        // Fetch owned NFTs
        const balance = await frogtopiaNFT.methods.balanceOf(account).call();
        const ownedTokens = [];
        for (let i = 0; i < balance; i++) {
          const tokenId = await frogtopiaNFT.methods.tokenOfOwnerByIndex(account, i).call();
          const tokenURI = await frogtopiaNFT.methods.tokenURI(tokenId).call();
          ownedTokens.push(tokenURI);
        }
        setOwnedNFTs(ownedTokens);
        console.log("Owned NFTs:", ownedTokens);

      } catch (error) {
        console.error("Error loading NFT data:", error);
        setError('Error loading NFT data. Please try again.');
      }
    } else {
      setError('Please install MetaMask to use this feature.');
    }
    setLoading(false);
  };

  const loadBalance = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        const balance = await web3.eth.getBalance(accounts[0]);
        setBalance(web3.utils.fromWei(balance, 'ether'));
      }
    }
  };

  const mintNFT = async (frogType) => {
    if (!window.ethereum) {
      setStatus('Please install MetaMask!');
      return;
    }

    const web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();

      const frogtopiaNFT = new web3.eth.Contract(FrogtopiaNFTABI, frogtopiaNFTAddress);

      setStatus('Minting NFT...');
      const receipt = await frogtopiaNFT.methods.mintNFT(frogType).send({ 
        from: accounts[0],
        value: web3.utils.toWei('0.01', 'ether'),
        gas: 300000,
      });

      console.log('Mint receipt:', receipt);
      setStatus('NFT minted successfully!');
      loadBalance();
      loadNFTData(); // Reload NFT data to update minted status
    } catch (error) {
      console.error('Error minting NFT:', error);
      setStatus('Error minting NFT: ' + error.message);
    }
  };

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isOwned = ownedNFTs.includes(nft.tokenURI);
    
    switch(filter) {
      case 'expensive':
        return matchesSearch && nft.id > 2;
      case 'not-owned':
        return matchesSearch && !isOwned;
      default:
        return matchesSearch;
    }
  });

  return (
    <animated.div style={fadeIn} className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
      <Navbar />
      
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-yellow-300">Frogtopia Marketplace</h1>
        
        <p className="text-2xl font-semibold text-center text-yellow-300 mb-8">Your ETH Balance: {parseFloat(balance).toFixed(4)} ETH</p>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search NFTs"
              className="bg-green-700 text-white rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div className="flex items-center">
            <FaFilter className="mr-2 text-yellow-300" />
            <select
              className="bg-green-700 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All NFTs</option>
              <option value="expensive">Expensive NFTs</option>
              <option value="not-owned">Not Owned NFTs</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <p className="text-center text-xl">Loading NFTs...</p>
        ) : error ? (
          <p className="text-center text-xl text-red-500">{error}</p>
        ) : filteredNFTs.length === 0 ? (
          <p className="text-center text-xl">No NFTs found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredNFTs.map(nft => (
              <NFTCard 
                key={nft.id} 
                {...nft} 
                price="0.01"
                onMint={() => mintNFT(nft.id)}
                isOwned={ownedNFTs.includes(nft.tokenURI)}
                mintCount={nft.mintCount}
              />
            ))}
          </div>
        )}

        {status && (
          <p className="mt-8 text-center text-yellow-300 text-xl">{status}</p>
        )}
      </div>
    </animated.div>
  );
}

export default Marketplace;