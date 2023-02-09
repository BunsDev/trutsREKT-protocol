require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-etherscan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      gasLimit: 205000
    },
    goreli: {
      gasLimit: 205000,
      url: process.env.ALCHEMY_GORELI_URL,
      accounts: [`0x${process.env.ACCOUNT_KEY}`],
    },
    rinkeby: {
      gasLimit: 205000,
      url: process.env.ALCHEMY_RINKEBY_URL,
      accounts: [process.env.ACCOUNT_KEY],
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_URL,
      accounts: [process.env.ACCOUNT_KEY],
    },
    polygon: {
      url: process.env.POLYGON_MAINNET_URL,
      accounts: [process.env.POLYGON_MAINNET],
    },
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43113,
      accounts: [`0x${process.env.AVALANCHE_TEST_PRIVATE_KEY}`]
      //accounts: {mnemonic: process.env.MNEMONIC},
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [`0x${process.env.AVALANCHE_TEST_PRIVATE_KEY}`]
    },
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [`0x${process.env.AVALANCHE_TEST_PRIVATE_KEY}`]
    }
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API
    //apiKey: process.env.AVALANCHE_TEST_API
  },
};