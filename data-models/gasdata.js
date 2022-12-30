

const axios = require("axios");
require('dotenv').config()


//All gas used for Ethereum transactions
//creating a fucntion to check for all chains
let allChains = ["ethereum", "bsc", "matic", "celo", "arbitrum", "avalanche", "xinfin", "cronos", "velas", "zilliqa", "fantom", "fuse"]

const calculateGasForAddress = async (address, chain) => {

    const query = new URLSearchParams({
        fromBlock: '0',
        toBlock: '99999999',
        auth_key: process.env.UNMARSHAL_KEY
    }).toString();
    let totalFeesInWie = 0;
    let highestGasUsed = 0;
    try {
        const respMain = await axios.get(`https://api.unmarshal.com/v2/${chain}/address/${address}/transactions?${query}`)
        const data = await respMain.data;
        console.log(data.total_pages);
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

    console.log("fees in wie", totalFeesInWie)
    let feesInETH = totalFeesInWie / Math.pow(10, 18);
    console.log("total fees in Gwei", totalFeesInWie / Math.pow(10, 10))
    console.log("highest gas used in Gwei", highestGasUsed / Math.pow(10, 10))
    return feesInETH;

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
        const resp = await axios.get(
            `https://api.unmarshal.com/v1/${allChains[i]}/address/${address}/transactions/count?${query}`,
        );
        console.log(`${allChains[i]}`, resp.data.total_transaction_count)
        obj.chain = allChains[i]
        obj.txnCount = resp.data.total_transaction_count
        returnData.push(obj)
        obj = {
            chain: "",
            txnCount: 0,
        }
    }

    return returnData;
}
//gas spend in past year

//calculateGasForAddress("0x5568416Fc7E9D575277c78a4f8272e873839f001", 'ethereum')
//totalEVMChainsInteracted("0x7D1c8E35fa16Ee32f11a882B3E634cCbaE07b790")