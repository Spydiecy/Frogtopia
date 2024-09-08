import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import Web3 from 'web3';
import Navbar from '../components/Navbar';
import GameWorldABI from '../contracts/GameWorldABI.json';
import CROAKTokenABI from '../contracts/CROAKTokenABI.json';
import FrogNFTABI from '../contracts/FrogtopiaNFTABI.json';
import { FaEthereum, FaFrog, FaMapMarkedAlt, FaScroll, FaBox } from 'react-icons/fa';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const GRID_SIZE = 20;

const GameWorld = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [gameContract, setGameContract] = useState(null);
  const [croakContract, setCroakContract] = useState(null);
  const [frogNFTContract, setFrogNFTContract] = useState(null);
  const [croakBalance, setCroakBalance] = useState('0');
  const [lands, setLands] = useState([]);
  const [ownedFrogs, setOwnedFrogs] = useState([]);
  const [quests, setQuests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [activeView, setActiveView] = useState('land');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ethBalance, setEthBalance] = useState('0');
  const [selectedFrog, setSelectedFrog] = useState(null);

  const gameWorldAddress = '0xFbe5b4cf7520DbCf0170210128e704B5c3F1aAEf';
  const croakTokenAddress = '0xa1eF679Ab1a6C41B4Ec7d9aB8Fc3293CE02592FA';
  const frogNFTAddress = '0x8d22300374Dc06a3b7019f2B31D46DE3F293c101';

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  useEffect(() => {
    initWeb3();
  }, []);

  const initWeb3 = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        
        const gameContractInstance = new web3Instance.eth.Contract(GameWorldABI, gameWorldAddress);
        const croakContractInstance = new web3Instance.eth.Contract(CROAKTokenABI, croakTokenAddress);
        const frogNFTContractInstance = new web3Instance.eth.Contract(FrogNFTABI, frogNFTAddress);
        
        setGameContract(gameContractInstance);
        setCroakContract(croakContractInstance);
        setFrogNFTContract(frogNFTContractInstance);

        await loadUserData(accounts[0], web3Instance, gameContractInstance, croakContractInstance, frogNFTContractInstance);
        
        setLoading(false);
      } catch (error) {
        console.error("Error initializing web3", error);
        setError("Failed to initialize Web3. Please make sure you're connected to the correct network.");
        setLoading(false);
      }
    } else {
      console.log('Please install MetaMask!');
      setError("MetaMask is not installed. Please install MetaMask to use this application.");
      setLoading(false);
    }
  };

  const loadUserData = async (account, web3, gameContract, croakContract, frogNFTContract) => {
    try {
      // Load ETH balance
      const ethBalanceWei = await web3.eth.getBalance(account);
      setEthBalance(web3.utils.fromWei(ethBalanceWei, 'ether'));

      // Load CROAK balance
      const croakBalanceWei = await croakContract.methods.balanceOf(account).call();
      setCroakBalance(web3.utils.fromWei(croakBalanceWei, 'ether'));

      // Load owned frogs
      const frogBalance = await frogNFTContract.methods.balanceOf(account).call();
      const ownedTokens = [];
      for (let i = 0; i < frogBalance; i++) {
        const tokenId = await frogNFTContract.methods.tokenOfOwnerByIndex(account, i).call();
        ownedTokens.push(tokenId);
      }

      const frogsData = await Promise.all(ownedTokens.map(async (tokenId) => {
        try {
          const tokenURI = await frogNFTContract.methods.tokenURI(tokenId).call();
          const response = await fetch(`${IPFS_GATEWAY}${tokenURI.replace('ipfs://', '')}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const metadata = await response.json();
          return {
            id: tokenId,
            ...metadata,
            image: metadata.image.replace('ipfs://', '')
          };
        } catch (error) {
          console.error(`Error fetching metadata for token ${tokenId}:`, error);
          return { id: tokenId, name: `Frog #${tokenId}`, image: 'placeholder-image-hash', attributes: [] };
        }
      }));

      setOwnedFrogs(frogsData);

      // Load lands
      const landCount = await gameContract.methods.balanceOf(account).call();
      const userLands = [];
      for (let i = 0; i < landCount; i++) {
        const tokenId = await gameContract.methods.tokenOfOwnerByIndex(account, i).call();
        const landData = await gameContract.methods.lands(tokenId).call();
        userLands.push({ tokenId, ...landData });
      }
      setLands(userLands);

      // Load quests
      const questCount = await gameContract.methods.questCount().call();
      const loadedQuests = [];
      for (let i = 1; i <= questCount; i++) {
        const quest = await gameContract.methods.quests(i).call();
        loadedQuests.push({ id: i, ...quest });
      }
      setQuests(loadedQuests);

      // Load inventory
      const itemCount = await gameContract.methods.itemCount().call();
      const loadedItems = [];
      for (let i = 1; i <= itemCount; i++) {
        const item = await gameContract.methods.items(i).call();
        const quantity = await gameContract.methods.inventory(account, i).call();
        if (quantity > 0) {
          loadedItems.push({ id: i, ...item, quantity });
        }
      }
      setInventory(loadedItems);

    } catch (error) {
      console.error("Error loading user data", error);
      setError(`Failed to load user data: ${error.message}`);
    }
  };

  const mintLand = async () => {
    try {
      await gameContract.methods.mintLand().send({ from: account });
      await loadUserData(account, web3, gameContract, croakContract, frogNFTContract);
    } catch (error) {
      console.error("Error minting land:", error);
      setError("Failed to mint land. Please try again.");
    }
  };

  const handleMoveFrog = async (frogId, newX, newY) => {
    try {
      await gameContract.methods.moveFrog(frogId, newX, newY).send({ from: account });
      await loadUserData(account, web3, gameContract, croakContract, frogNFTContract);
    } catch (error) {
      console.error("Error moving frog:", error);
      setError("Failed to move frog. Please try again.");
    }
  };

  const handleCompleteQuest = async (questId) => {
    if (!selectedFrog) return;
    try {
      await gameContract.methods.completeQuest(selectedFrog, questId).send({ from: account });
      await loadUserData(account, web3, gameContract, croakContract, frogNFTContract);
    } catch (error) {
      console.error("Error completing quest:", error);
      setError("Failed to complete quest. Please try again.");
    }
  };

  const handleUseItem = async (itemId) => {
    if (!selectedFrog) return;
    try {
      await gameContract.methods.useItem(selectedFrog, itemId).send({ from: account });
      await loadUserData(account, web3, gameContract, croakContract, frogNFTContract);
    } catch (error) {
      console.error("Error using item:", error);
      setError("Failed to use item. Please try again.");
    }
  };

  const renderLandGrid = () => {
    const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));

    lands.forEach(land => {
      const x = parseInt(land.x);
      const y = parseInt(land.y);
      grid[y][x] = land;
    });

    return (
      <div className="land-grid bg-green-900 p-2 rounded-lg overflow-auto" style={{maxHeight: '80vh'}}>
        {grid.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div key={`${x}-${y}`} className="w-12 h-12 border border-green-700 flex items-center justify-center">
                {cell ? (
                  <div className="w-10 h-10 bg-yellow-500 rounded-sm flex items-center justify-center text-xs">
                    {cell.tokenId}
                  </div>
                ) : (
                  <button onClick={mintLand} className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-sm text-xs">
                    Mint
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderFrogManagement = () => (
    <div className="frog-management">
      <h2 className="text-3xl font-semibold mb-6 text-yellow-300">Your Frogtopia Frogs</h2>
      {ownedFrogs.length === 0 ? (
        <div className="bg-green-700 bg-opacity-50 rounded-lg shadow-xl p-6">
          <p className="text-center text-xl">You don't own any Frogtopia Frogs yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ownedFrogs.map(frog => (
            <div key={frog.id} className="bg-green-800 bg-opacity-50 p-4 rounded-lg shadow-xl transition duration-300 ease-in-out transform hover:scale-105">
              <img src={`${IPFS_GATEWAY}${frog.image}`} alt={frog.name} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-yellow-300">{frog.name}</h3>
              <p className="text-gray-300 mb-2">Token ID: {frog.id}</p>
              <div className="mb-2">
                {frog.attributes && frog.attributes.map((attr, index) => (
                  <span key={index} className="inline-block bg-green-600 rounded-full px-2 py-1 text-xs font-semibold text-white mr-1 mb-1">
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuestLog = () => (
    <div className="quest-log">
      <h2 className="text-3xl font-semibold mb-6 text-yellow-300">Available Quests</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quests.map(quest => (
          <div key={quest.id} className="bg-green-800 bg-opacity-50 p-4 rounded-lg shadow-xl">
            <h3 className="text-xl font-semibold mb-2 text-yellow-300">{quest.name}</h3>
            <p>Reward: {web3.utils.fromWei(quest.rewardCroak, 'ether')} CROAK</p>
            <p>Experience: {quest.rewardExp}</p>
            <p>Required Level: {quest.requiredLevel}</p>
            <button 
              onClick={() => handleCompleteQuest(quest.id)}
              disabled={!selectedFrog}
              className="mt-4 bg-yellow-500 text-green-800 px-4 py-2 rounded disabled:opacity-50"
            >
              Complete Quest
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="inventory">
      <h2 className="text-3xl font-semibold mb-6 text-yellow-300">Your Inventory</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {inventory.map(item => (
          <div key={item.id} className="bg-green-800 bg-opacity-50 p-4 rounded-lg shadow-xl">
            <h3 className="text-xl font-semibold mb-2 text-yellow-300">{item.name}</h3>
            <p>Type: {item.itemType}</p>
            <p>Bonus: {item.bonus}</p>
            <p>Quantity: {item.quantity}</p>
            <button 
              onClick={() => handleUseItem(item.id)}
              disabled={!selectedFrog}
              className="mt-4 bg-yellow-500 text-green-800 px-4 py-2 rounded disabled:opacity-50"
            >
              Use Item
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-300"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
        <Navbar />
        <div className="container mx-auto py-16 px-4">
          <div className="bg-red-600 bg-opacity-75 text-white p-4 rounded-lg shadow-xl">
            <p className="text-center text-xl">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
      <Navbar />
      <animated.div style={fadeIn} className="container mx-auto py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-yellow-300">Frogtopia GameWorld</h1>
        
        <div className="mb-8 bg-green-700 bg-opacity-50 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Game Status</h2>
          <p className="text-lg mb-2">ETH Balance: {parseFloat(ethBalance).toFixed(2)} ETH</p>
          <p className="text-lg mb-2">CROAK Balance: {parseFloat(croakBalance).toFixed(2)} CROAK</p>
          <p className="text-lg mb-2">Owned Lands: {lands.length}</p>
          <p className="text-lg mb-2">Owned Frogs: {ownedFrogs.length}</p>
          <p className="text-lg">Inventory Items: {inventory.length}</p>
        </div>

        <div className="flex justify-center mb-8">
          <button onClick={() => setActiveView('land')} className={`mx-2 px-4 py-2 rounded transition-colors duration-300 flex items-center ${activeView === 'land' ? 'bg-yellow-500 text-green-800' : 'bg-green-800 text-yellow-500 hover:bg-green-700'}`}>
            <FaMapMarkedAlt className="mr-2" />
            Land
          </button>
          <button onClick={() => setActiveView('frog')} className={`mx-2 px-4 py-2 rounded transition-colors duration-300 flex items-center ${activeView === 'frog' ? 'bg-yellow-500 text-green-800' : 'bg-green-800 text-yellow-500 hover:bg-green-700'}`}>
            <FaFrog className="mr-2" />
            Frogs
          </button>
          <button onClick={() => setActiveView('quest')} className={`mx-2 px-4 py-2 rounded transition-colors duration-300 flex items-center ${activeView === 'quest' ? 'bg-yellow-500 text-green-800' : 'bg-green-800 text-yellow-500 hover:bg-green-700'}`}>
            <FaScroll className="mr-2" />
            Quests
          </button>
          <button onClick={() => setActiveView('inventory')} className={`mx-2 px-4 py-2 rounded transition-colors duration-300 flex items-center ${activeView === 'inventory' ? 'bg-yellow-500 text-green-800' : 'bg-green-800 text-yellow-500 hover:bg-green-700'}`}>
            <FaBox className="mr-2" />
            Inventory
          </button>
        </div>

        {activeView === 'land' && renderLandGrid()}
        {activeView === 'frog' && renderFrogManagement()}
        {activeView === 'quest' && renderQuestLog()}
        {activeView === 'inventory' && renderInventory()}
      </animated.div>
    </div>
  );
};

export default GameWorld;
