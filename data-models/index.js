const axios = require("axios");
require('dotenv').config()
const { Network, Alchemy } = require("alchemy-sdk");

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
    apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
};
const alchemy = new Alchemy(settings);

//All gas used for Ethereum transactions
//creating a fucntion to check for all chains
let allChains = ["ethereum", "bsc", "matic", "celo", "arbitrum", "avalanche", "xinfin", "cronos", "velas", "zilliqa", "fantom", "fuse"]


let returnObjTodisplay = {
    totalChainInteracted: 0,//
    totalNumberOftransaction: 0,
    gasSpentGwei: 0,//
    totalTokenHolding: 0,//
    totalNftHolding: 0,//
    numberOfProfitTokens: 0,//
    percentProfit: 0,//
    numberOfLossTokens: 0,//
    percentLoss: 0//
}
let rektObj = {
    gasSpentGwei: 0,//
    numberOfVerifiedToken: 0,
    verifiedValueToNonVerValue: 0,
    totalNumberOftransaction: 0, //
    NumberOfBuy: 0,
    NumberOfSell: 0,
    totalProfitUSD: 0,
    totalLossUSD: 0,

}
const calculateGasForAddress = async (address) => {

    const query = new URLSearchParams({
        fromBlock: '0',
        toBlock: '99999999',
        auth_key: process.env.UNMARSHAL_KEY
    }).toString();
    let totalFeesInWie = 0;
    let highestGasUsed = 0;
    let chain = 'ethereum';
    try {
        const respMain = await axios.get(`https://api.unmarshal.com/v2/${chain}/address/${address}/transactions?${query}`)
        const data = await respMain.data;
        // console.log(data.total_pages);
        for (let i = 1; i <= data.total_pages; i++) {
            try {
                const resp = await axios.get(
                    `https://api.unmarshal.com/v2/${chain}/address/${address}/transactions?page=${i}&pageSize=25&fromBlock=0&toBlock=99999999&auth_key=${process.env.UNMARSHAL_KEY}`
                );
                let txns = resp.data.transactions;
                for (let j = 0; j < txns.length; j++) {
                    totalFeesInWie += parseInt(txns[j].fee)
                    if (highestGasUsed < parseInt(txns[j].fee)) {
                        highestGasUsed = parseInt(txns[j].fee);
                    }
                    // console.log(txns[j].fee)
                }
            } catch (e) {
                console.log(e)
            }

        }
    } catch (e) { console.log(e) }

    // console.log("fees in wie", totalFeesInWie)
    let feesInGwei = totalFeesInWie / Math.pow(10, 18);
    // console.log("total fees in Gwei", totalFeesInWie / Math.pow(10, 10))
    let highestGasUsedGwei = highestGasUsed / Math.pow(10, 10)
    return feesInGwei, highestGasUsedGwei;

}


//total chains interacted from below mentioned chains
const totalEVMChainsInteracted = async (address) => {
    const query = new URLSearchParams({
        auth_key: process.env.UNMARSHAL_KEY
    }).toString();
    let returnData = [];
    let obj = {
        chain: "",
        txnCount: 0,
    }
    for (let i = 0; i < allChains.length; i++) {
        try {
            const resp = await axios.get(
                `https://api.unmarshal.com/v1/${allChains[i]}/address/${address}/transactions/count?${query}`,
            );
            // console.log(`${allChains[i]}`, resp.data.total_transaction_count)
            obj.chain = allChains[i]
            obj.txnCount = resp.data.total_transaction_count
            returnData.push(obj)
            obj = {
                chain: "",
                txnCount: 0,
            }
        } catch (e) {
            continue;
        }

    }
    let totalChainInteracted = 0;
    let totalNumberOftransaction = 0;
    for (let j = 0; j < returnData.length; j++) {
        if (returnData[j].txnCount > 0) {
            totalChainInteracted++;
            totalNumberOftransaction += returnData[j].txnCount;
        }
    }
    console.log("totalChainInteracted", totalChainInteracted)
    console.log("totalNumberOftransaction", totalNumberOftransaction)

    return { totalChainInteracted, totalNumberOftransaction }
}

const getUserNfts = async (userAddress) => {
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
                // console.log(allNFTContractsIDs)
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
    // console.log("dataLength: ", returnData.length)

    return returnData.length;
}

const getAllNftTransations = async (userAddress) => {
    if (userAddress.length < 18) {
        userAddress = await alchemy.core.resolveName(userAddress);
        // console.log("userAddressLength: ", userAddress)

    }
    let nftDataobj = {
        buyQty: 0,
        sellqty: 0
    }
    let returnData = []
    let nextpage = true;
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

    // console.log("tx length: ", nftDataobj)
    return nftDataobj;
}




const getCurrentTokenBalance = async (userAddress, getChain) => {
    const query = new URLSearchParams({
        verified: '',
        chainId: 'false',
        token: 'false',
        auth_key: process.env.UNMARSHAL_KEY
    }).toString();

    let returnData = []
    let allTokenDataobj = {
        verified: false,
        tokenValueUsd: 0,
        profitLossUSD: 0,
    }
    const resp = await axios.get(
        `https://api.unmarshal.com/v1/${getChain}/address/${userAddress}/assets?${query}`,
    );

    // const data = await resp.data;
    for (let i = 0; i < resp.data.length; i++) {
        try {
            allTokenDataobj.verified = resp.data[i].verified
            allTokenDataobj.tokenValueUsd = (resp.data[i].quote)


            let profitinUSD = await getProfitLossWithTokenAddress(userAddress, getChain, resp.data[i].contract_address)
            allTokenDataobj.profitLossUSD = (profitinUSD);
            console.log(allTokenDataobj)
            returnData.push(allTokenDataobj)
            allTokenDataobj = {
                verified: false,
                tokenValueUsd: 0,
                profitLossUSD: 0,
            }
        } catch (e) {
            continue;
        }

    }
    let totalTokenHolding = resp.data.length;
    let totalProfitUSD = 0;
    let numberOfProfitTokens = 0;
    let numberOfLossTokens = 0;
    let totalLossUSD = 0;
    let totalValueProfitToken = 0;
    let totalValueLossToken = 0;
    let numberOfVerifiedToken = 0;
    let valueOfVerified = 0
    let valueOfNonVerified = 0

    for (let i = 0; i < returnData.length; i++) {
        if (returnData[i].profitLossUSD <= 0) {
            totalLossUSD += (returnData[i].profitLossUSD);
            totalValueLossToken += (returnData[i].tokenValueUsd);
            numberOfLossTokens++
        } else {
            totalProfitUSD += (returnData[i].profitLossUSD);
            totalValueProfitToken += (returnData[i].tokenValueUsd);
            numberOfProfitTokens++;
        }
        if (returnData[i].verified == true) {
            numberOfVerifiedToken++;
            valueOfVerified += returnData[i].tokenValueUsd
        } else {
            valueOfNonVerified += returnData[i].tokenValueUsd
        }
    }
    let verifiedValueToNonVerValue = valueOfVerified / valueOfNonVerified

    console.log("loss", totalLossUSD)
    console.log("total loss ", totalValueLossToken)
    console.log("profit", totalProfitUSD)
    console.log("total Profit value", totalValueProfitToken)

    let percentLoss = (totalLossUSD / (totalLossUSD + totalValueLossToken)) * 100
    let percentProfit = (totalProfitUSD / (totalProfitUSD + totalValueProfitToken)) * 100
    return { totalTokenHolding, numberOfProfitTokens, percentProfit, numberOfLossTokens, percentLoss, numberOfVerifiedToken, verifiedValueToNonVerValue, totalProfitUSD, totalLossUSD }

}

const getProfitLossWithTokenAddress = async (userAddress, getChain, tokenAddress) => {
    const query = new URLSearchParams({
        contract: tokenAddress,
        auth_key: process.env.UNMARSHAL_KEY
    }).toString();
    try {
        const resp = await axios.get(
            `https://api.unmarshal.com/v2/${getChain}/address/${userAddress}/userData?${query}`
        );

        return resp.data.overall_profit_loss
    } catch (e) {
        console.log(e);
        return 0;
    }


}


const getREKTNft = async (userAddress) => {
    if (userAddress.length < 18) {
        userAddress = await alchemy.core.resolveName(userAddress);
        console.log("userAddressLength: ", userAddress)

    }

    let txObj = await totalEVMChainsInteracted(userAddress)
    returnObjTodisplay.totalChainInteracted = txObj.totalChainInteracted
    returnObjTodisplay.totalNumberOftransaction = txObj.totalNumberOftransaction
    returnObjTodisplay.gasSpentGwei = await calculateGasForAddress(userAddress)

    let tokenBalanceObj = await getCurrentTokenBalance(userAddress, "ethereum")
    returnObjTodisplay.totalTokenHolding = tokenBalanceObj.totalTokenHolding
    returnObjTodisplay.numberOfProfitTokens = tokenBalanceObj.numberOfProfitTokens
    returnObjTodisplay.percentProfit = tokenBalanceObj.percentProfit
    returnObjTodisplay.numberOfLossTokens = tokenBalanceObj.numberOfLossTokens
    returnObjTodisplay.percentLoss = tokenBalanceObj.percentLoss

    returnObjTodisplay.totalNftHolding = await getUserNfts(userAddress)
    console.log(returnObjTodisplay);


    let nftObj = await getAllNftTransations(userAddress)

    rektObj.NumberOfBuy = nftObj.buyQty
    rektObj.NumberOfSell = nftObj.sellqty
    rektObj.totalNumberOftransaction = returnObjTodisplay.totalNumberOftransaction;
    rektObj.gasSpentGwei = returnObjTodisplay.gasSpentGwei
    rektObj.numberOfVerifiedToken = tokenBalanceObj.numberOfVerifiedToken
    rektObj.verifiedValueToNonVerValue = tokenBalanceObj.verifiedValueToNonVerValue
    rektObj.totalLossUSD = tokenBalanceObj.totalLossUSD
    rektObj.totalProfitUSD = tokenBalanceObj.totalProfitUSD

    console.log(rektObj)

    let NumberToBeAssigned = 10;
    let Ether = Math.pow(10, 6)
    //conditionsForNFTs

    if (rektObj.totalNumberOftransaction > 500 && rektObj.NumberOfBuy > 100 && rektObj.NumberOfSell > 100 && rektObj.gasSpentGwei > Ether && rektObj.totalProfitUSD > 10000 && rektObj.totalLossUSD <= 0 && rektObj.numberOfVerifiedToken < 10) {
        //flipper
        NumberToBeAssigned = 0;
    } else if (rektObj.totalNumberOftransaction > 500 && rektObj.NumberOfBuy > 100 && rektObj.NumberOfSell < 100 && rektObj.gasSpentGwei > (Ether / 2) && rektObj.totalProfitUSD > 5000 && rektObj.totalLossUSD <= 0 && rektObj.numberOfVerifiedToken > 10) {
        //Degen
        NumberToBeAssigned = 1;

    } else if (rektObj.totalNumberOftransaction > 300 && rektObj.NumberOfBuy > 70 && rektObj.NumberOfSell < 50 && rektObj.gasSpentGwei < (Ether / 4) && rektObj.totalProfitUSD > 500 && rektObj.numberOfVerifiedToken > 5) {
        //hodler
        NumberToBeAssigned = 2;

    } else if (rektObj.totalNumberOftransaction > 50 && rektObj.totalProfitUSD < 100 && rektObj.totalLossUSD > 0 && rektObj.verifiedValueToNonVerValue < 0) {
        //shitcoinner
        NumberToBeAssigned = 3;

    } else if (rektObj.totalProfitUSD < rektObj.totalLossUSD && rektObj.totalLossUSD > 10000) {
        //rekt
        NumberToBeAssigned = 4;

    } else {
        //Paperhand
        NumberToBeAssigned = 5;

    }



    return { returnObjTodisplay, NumberToBeAssigned }
}



getREKTNft('lazypoet.eth')