const axios = require("axios");
require('dotenv').config()
// var fetchUrl = require("fetch").fetchUrl;
const { Network, Alchemy } = require("alchemy-sdk");
// const fetch = require('node-fetch')


// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
    apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
};
const alchemy = new Alchemy(settings);

const query = new URLSearchParams({
    // offset: '',
    pageSize: '25',
    // contract: '',
    auth_key: process.env.UNMARSHAL_KEY
}).toString();

const getUserNfts = async (userAddress, getChain) => {
    let allNFTContractsIDs = {
        "contract": "",
        "tokenId": "",
        "balance": 0,
        "floorPrice": 0,
    }
    let returnData = []
    let nextpage = true;
    let options = {
        pageKey: "",
    }
    while (nextpage) {
        const nfts = await alchemy.nft.getNftsForOwner(userAddress, options)

        for (var i = 0; i < nfts.ownedNfts.length; i++) {
            try {
                allNFTContractsIDs.contract = nfts.ownedNfts[i].contract.address;
                allNFTContractsIDs.tokenId = nfts.ownedNfts[i].tokenId;
                allNFTContractsIDs.balance = nfts.ownedNfts[i].balance;
                allNFTContractsIDs.floorPrice = nfts.ownedNfts[i].contract.openSea.floorPrice;
                console.log(allNFTContractsIDs)
                returnData.push(allNFTContractsIDs)
            } catch (e) { continue }

            allNFTContractsIDs = {
                "contract": "",
                "tokenId": "",
                "balance": 0,
                "floorPrice": 0,
            }
        }
        options.pageKey = nfts.pageKey;
        if (nfts.pageKey == undefined) {
            nextpage = false;
        }
    }
    console.log("dataLength: ", returnData.length)


}


const getAllNftTransations = async (userAddress, getChain) => {
    if (userAddress.length < 18) {
        console.log("userAddressLength: ", userAddress)
        userAddress = await alchemy.core.resolveName(userAddress);
        console.log("userAddressLength: ", userAddress)

    }
    let nftDataobj = {
        buyQty: 0,
        sellqty: 0
    }
    let returnData = []
    let nextpage = true;
    console.log("one", userAddress);
    let continuation = ''
    const options = {
        headers: {
            Authorization: process.env.NFT_PORT_KEY
        },

    };
    while (nextpage) {
        // console.log(continuation);

        let URL = `https://api.nftport.xyz/v0/transactions/accounts/${userAddress}?chain=ethereum&page_size=50&type=all&continuation=${continuation}`
        const resp = await axios.get(
            URL, options
        );
        // console.log(resp.data)

        if (resp.data.continuation == undefined) {
            nextpage = false;
        } else {
            continuation = resp.data.continuation;
        }
        for (let i = 0; i < resp.data.transactions.length; i++) {
            returnData.push(resp.data.transactions[i])

        }
    }
    for (let i = 0; i < returnData.length; i++) {
        if (returnData[i].type == 'sale') {
            if (returnData[i].buyer_address.toLowerCase() == userAddress.toLowerCase()) {
                nftDataobj.buyQty++;
            } else {
                nftDataobj.sellqty++;
            }
        }
    }

    console.log("tx length: ", nftDataobj)

}
// const GetDetailNFTtransactions = async () => {
//     const options = {
//         method: 'GET',
//         headers: {
//             accept: 'application/json',
//             Authorization: 'd070c4b4-c972-4b32-9ee8-96439e6cdf72'
//         }
//     };

//     fetch('https://api.nftport.xyz/v0/transactions/accounts/0xf5663d0eee3620c4a88e28e392aac72d077a8c4d?chain=ethereum&page_size=50&type=all', options)
//         .then(response => response.json())
//         .then(response => console.log(response))
//         .catch(err => console.error(err));
// }

const getRugOrprofit = async (arrayOftxns) => {

}

const getNFTPriceWithId = async (contractAddress, getChain, getId) => {
    let priceReq = await axios.get(`https://api.rarify.tech/data/tokens/ethereum:BC4CA0EdA7647A8aB7C2061c2E118A18a936f13D:22d2/insights/365d`, { headers: { "Authorization": `Bearer ${process.env.RARIFY_API_KEY}` } })
    console.log(priceReq.data.included[1].attributes)
}

//getUserNfts("lazypoet.eth", "ethereum")

getAllNftTransations("lazypoet.eth", "ethereum")

// getNFTPriceWithId("", "", "")

// GetDetailNFTtransactions()