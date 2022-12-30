import logo from './logo.svg';
import './App.css';
import { ethers } from 'ethers'
// require("dotenv").config();
import Web3 from 'web3';
import { gaslessTxn } from './biconomyTx'
import { useState, useEffect } from 'react';
const web3 = new Web3(Web3.givenProvider);
const signerOwn = web3.eth.accounts.privateKeyToAccount(
  "815e1a532d39242c9edc8fc7e90592fe9d07c10a7fd94f42f7b70531a7adebd9"
);
export default function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [mintedLink, setMintedLink] = useState('');
  const mintTransaction = async () => {
    console.log("function")
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        let userAddress = await signer.getAddress()
        console.log("userAddress: ", userAddress)
        let message = `0x000000000000000000000000${userAddress.substring(2)}`;
        let { signature } = signerOwn.sign(message);
        console.log("signerOwn: ", signerOwn.address)
        console.log("signature: ", signature)
        await gaslessTxn(signature, 2)
      }
    } catch (err) {
      console.log(err);
    }
  }

  const checkConnectedWallet = async () => {
    const { ethereum } = window;

    const accounts = await ethereum.request({ method: 'eth_accounts' });
    console.log(accounts)
    if (accounts.length !== 0) {
      const account = accounts[0];

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("The Chain Id is : " + chainId);

      // const chainIdPolygon = "0x89";
      // if (chainId !== chainIdPolygon) {
      //   console.log("Check if your metamask is connected to Ethereum Mainnet")
      //   alert("Please change your metamask to Polygon Mainnet");
      // }


      console.log('Authorized account found: ', account);
      return;
    } else {
      console.log('No authorised account found');
    }
  };



  const connectWallet = async () => {
    const { ethereum } = window;
    await window.ethereum.enable()
    if (!ethereum) {
      alert('Get Metamask..!');
      return;
    }
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    console.log('Connected to: ', accounts[0]);
    setCurrentAccount(accounts[0]);

  };

  useEffect(() => {
    checkConnectedWallet()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        {
          currentAccount ?

            <button onClick={connectWallet}>
              verify user
            </button>
            :
            <button onClick={mintTransaction}>Mint</button>
        }
      </header>
    </div>
  );
}

