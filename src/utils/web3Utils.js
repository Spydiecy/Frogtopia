import Web3 from 'web3';

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      return accounts[0];
    } catch (error) {
      console.error("User denied account access");
      return null;
    }
  } else if (window.web3) {
    const web3 = new Web3(window.web3.currentProvider);
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
  } else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
  }
};

export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};