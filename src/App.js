
import logo from './truts.svg';
import './App.css';
import { ethers } from 'ethers'
// require("dotenv").config();
import Web3 from 'web3';
import { gaslessTxn } from './biconomyTx'
import { useState, useEffect, useSigner } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useProvider, useAccount } from 'wagmi'
// in the browser
import * as fcl from "@onflow/fcl"
import { AppUtils } from "@onflow/fcl"

// let AccountProofData = {
//   // e.g. "Awesome App (v0.0)" - A human readable string to identify your application during signing
//   appIdentifier: "",

//   // e.g. "75f8587e5bd5f9dcc9909d0dae1f0ac5814458b2ae129620502cb936fde7120a" - minimum 32-byte random nonce as hex string
//   nonce: "",
// }

// let AccountProofDataResolver = () => Promise < AccountProofData | null >
// "discovery.wallet.method": "POP/RPC",
fcl.config({
  "flow.network": "testnet",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn",
  "app.detail.title": "Truts Platform",
  "app.detail.icon": "https://placekitten.com/g/200/200",
  // "fcl.accountProof.resolver": AccountProofDataResolver

})

const web3 = new Web3(Web3.givenProvider);


const signerOwn = web3.eth.accounts.privateKeyToAccount(
  "815e1a532d39242c9edc8fc7e90592fe9d07c10a7fd94f42f7b70531a7adebd9"
);

export default function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const { address, isConnecting, isDisconnected } = useAccount()
  const [mintedLink, setMintedLink] = useState('');
  const provider = useProvider()
  const [services, setServices] = useState([])

  useEffect(() => fcl.discovery.authn.subscribe(res => setServices(res.results)), [])



  const mintTransaction = async (address) => {
    console.log("function")
    try {
      const { ethereum } = window;
      if (ethereum) {
        const providerOne = new ethers.providers.Web3Provider(ethereum);
        console.log(provider)
        // console.log(address)

        // const signer = provider.getSigner();
        // let userAddress = await signer.getAddress()
        // console.log("userAddress: ", address)

        let message = `0x000000000000000000000000${address.substring(2)}`;
        let { signature } = signerOwn.sign(message);
        console.log("signerOwn: ", signerOwn.address)
        console.log("signature: ", signature)

        await gaslessTxn(address, signature, 2)
      }
    } catch (err) {
      console.log(err);
    }
  }

  const connectFlowWallet = async () => {
    console.log("Connect waller flow")
    fcl.authenticate()
    const currentUser = await fcl.currentUser.snapshot()
    console.log("The Current User", currentUser)
  }

  const disconnetWallet = () => {
    fcl.unauthenticate();
  }

  const signMessage = async () => {
    const MSG = Buffer.from("Please sign the message").toString("hex")
    try {
      console.log(await fcl.currentUser.signUserMessage(MSG))
      return await fcl.currentUser.signUserMessage(MSG)
    } catch (error) {
      console.log(error)
    }
  }



  // const checkConnectedWallet = async () => {
  //   const { ethereum } = window;

  //   const accounts = await ethereum.request({ method: 'eth_accounts' });
  //   console.log(accounts)
  //   if (accounts.length !== 0) {
  //     const account = accounts[0];

  //     let chainId = await ethereum.request({ method: 'eth_chainId' });
  //     console.log("The Chain Id is : " + chainId);

  //     // const chainIdPolygon = "0x89";
  //     // if (chainId !== chainIdPolygon) {
  //     //   console.log("Check if your metamask is connected to Ethereum Mainnet")
  //     //   alert("Please change your metamask to Polygon Mainnet");
  //     // }


  //     console.log('Authorized account found: ', account);
  //     return;
  //   } else {
  //     console.log('No authorised account found');
  //   }
  // };



  // const connectWallet = async () => {
  //   const { ethereum } = window;
  //   await window.ethereum.enable()
  //   if (!ethereum) {
  //     alert('Get Metamask..!');
  //     return;
  //   }
  //   const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

  //   console.log('Connected to: ', accounts[0]);
  //   setCurrentAccount(accounts[0]);

  // };

  // useEffect(() => {
  //   checkConnectedWallet()
  // }, [])

  // return (

  //   <div className="App">
  //     <header className="App-header">
  //       <ConnectButton />
  //       <img src={logo} className="App-logo" alt="logo" />
  //       <p>
  //         <a
  //           className="App-link"
  //           href="https://Truts.xyz"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           In truts we Trust
  //         </a>
  //       </p>

  //       {
  //         currentAccount ?

  //           <button onClick={connectWallet}>
  //             verify user
  //           </button>
  //           :
  //           <button onClick={() => { mintTransaction(address) }}>Mint</button>
  //       }
  //     </header>
  //   </div>

  // );

  return (

    <div className="App">
      <header className="App-header">
        <ConnectButton />
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <a
            className="App-link"
            href="https://Truts.xyz"
            target="_blank"
            rel="noopener noreferrer"
          >
            In truts we Trust
          </a>
        </p>

        {/* {
          currentAccount ?

            <button onClick={connectWallet}>
              verify user
            </button>
            :
            <button onClick={() => { mintTransaction(address) }}>Mint</button>
        } */}
        <button onClick={connectFlowWallet}>
          connect flow
        </button>
        <button onClick={disconnetWallet}>
          Disconnect flow
        </button>
        <button onClick={signMessage}>
          Sign flow
        </button>
      </header>
    </div>

  );
}

