import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import Web3 from 'web3';
import Navbar from '../components/Navbar';
import FrogtopiaNFTABI from '../contracts/FrogtopiaNFTABI.json';
import CROAKTokenABI from '../contracts/CROAKTokenABI.json';
import { FaEthereum, FaFrog } from 'react-icons/fa';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const NFTCard = ({ id, name, image, attributes }) => (
  <div className="bg-green-800 bg-opacity-50 p-4 rounded-lg shadow-xl transition duration-300 ease-in-out transform hover:scale-105">
    <img src={`${IPFS_GATEWAY}${image}`} alt={name} className="w-full h-48 object-cover rounded-lg mb-4" />
    <h3 className="text-xl font-semibold mb-2 text-yellow-300">{name}</h3>
    <p className="text-gray-300 mb-2">Token ID: {id}</p>
    <div className="mb-2">
      {attributes && attributes.map((attr, index) => (
        <span key={index} className="inline-block bg-green-600 rounded-full px-2 py-1 text-xs font-semibold text-white mr-1 mb-1">
          {attr.trait_type}: {attr.value}
        </span>
      ))}
    </div>
  </div>
);

function Profile() {
  const [ethBalance, setEthBalance] = useState('0');
  const [croakBalance, setCroakBalance] = useState('0');
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const frogtopiaNFTAddress = '0x8d22300374Dc06a3b7019f2B31D46DE3F293c101'; // Replace with your actual contract address
  const croakTokenAddress = '0x74689f77e03D8213DF5037b681F05b80bAAe3504'; // Replace with your actual CROAK token address

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        console.log("Connected account:", account);

        // Load ETH balance
        const ethBalanceWei = await web3.eth.getBalance(account);
        setEthBalance(web3.utils.fromWei(ethBalanceWei, 'ether'));
        console.log("ETH Balance:", web3.utils.fromWei(ethBalanceWei, 'ether'));

        // Load CROAK balance
        const croakToken = new web3.eth.Contract(CROAKTokenABI, croakTokenAddress);
        const croakBalanceWei = await croakToken.methods.balanceOf(account).call();
        setCroakBalance(web3.utils.fromWei(croakBalanceWei, 'ether'));
        console.log("CROAK Balance:", web3.utils.fromWei(croakBalanceWei, 'ether'));

        // Load owned NFTs
        const frogtopiaNFT = new web3.eth.Contract(FrogtopiaNFTABI, frogtopiaNFTAddress);
        const nftBalance = await frogtopiaNFT.methods.balanceOf(account).call();
        console.log("NFT Balance:", nftBalance);

        const ownedTokens = [];
        for (let i = 0; i < nftBalance; i++) {
          try {
            const tokenId = await frogtopiaNFT.methods.tokenOfOwnerByIndex(account, i).call();
            ownedTokens.push(tokenId);
          } catch (error) {
            console.error(`Error fetching token at index ${i}:`, error);
          }
        }

        console.log("Owned tokens:", ownedTokens);

        const nftsData = await Promise.all(ownedTokens.map(async (tokenId) => {
          try {
            const tokenURI = await frogtopiaNFT.methods.tokenURI(tokenId).call();
            console.log(`Token URI for ${tokenId}:`, tokenURI);
            const response = await fetch(`${IPFS_GATEWAY}${tokenURI.replace('ipfs://', '')}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const metadata = await response.json();
            return {
              id: tokenId,
              ...metadata,
              image: metadata.image.replace('ipfs://', '')
            };
          } catch (error) {
            console.error(`Error fetching metadata for token ${tokenId}:`, error);
            // Return a placeholder object if metadata fetch fails
            return {
              id: tokenId,
              name: `Frogtopia NFT #${tokenId}`,
              image: 'placeholder-image-hash',
              attributes: []
            };
          }
        }));

        console.log("Fetched NFTs data:", nftsData);
        setOwnedNFTs(nftsData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load user data. Please try again.");
        setLoading(false);
      }
    } else {
      setError("Please install MetaMask to use this feature.");
      setLoading(false);
    }
  };

  return (
    <animated.div style={fadeIn} className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
      <Navbar />
      
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-yellow-300">Your Frogtopia Profile</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-300"></div>
          </div>
        ) : error ? (
          <div className="bg-red-600 bg-opacity-75 text-white p-4 rounded-lg shadow-xl">
            <p className="text-center text-xl">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-green-700 bg-opacity-50 rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Account Overview</h2>
                <p className="text-lg mb-2 break-words">Address: {window.ethereum.selectedAddress}</p>
                <div className="flex items-center mb-2">
                  <FaEthereum className="mr-2 text-yellow-300" />
                  <p className="text-lg">ETH Balance: {parseFloat(ethBalance).toFixed(4)} ETH</p>
                </div>
                <div className="flex items-center">
                  <FaFrog className="mr-2 text-yellow-300" />
                  <p className="text-lg">CROAK Balance: {parseFloat(croakBalance).toFixed(2)} CROAK</p>
                </div>
              </div>
              <div className="bg-green-700 bg-opacity-50 rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Frogtopia Stats</h2>
                <p className="text-lg mb-2">Total NFTs Owned: {ownedNFTs.length}</p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-semibold mb-6 text-yellow-300">Your Frogtopia NFTs</h2>
              {ownedNFTs.length === 0 ? (
                <div className="bg-green-700 bg-opacity-50 rounded-lg shadow-xl p-6">
                  <p className="text-center text-xl">You don't own any Frogtopia NFTs yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {ownedNFTs.map(nft => (
                    <NFTCard key={nft.id} {...nft} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </animated.div>
  );
}

export default Profile;