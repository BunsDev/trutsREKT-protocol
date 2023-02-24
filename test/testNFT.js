const { ethers } = require("hardhat");
require("dotenv").config();
const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);
const signer = web3.eth.accounts.privateKeyToAccount(
    process.env.SIGNER_PKEY
);
describe("lyncrent", () => {
    let owner;
    let org;
    let admin;
    let addr1;
    let addr2;
    let addr3;
    let creator;
    let LyncMarketfactory;
    let LyncMarketplace;
    let LyncNFT721;
    let LyncNFT1155;
    let token721;
    let trutsAirdrop;
    let nftAirdrop;

    beforeEach(async () => {
        [owner, org, admin, addr1, addr2, addr3, creator] =
            await ethers.getSigners();


        // LyncNFT721 = await ethers.getContractFactory("trutsREKT");
        // token721 = await LyncNFT721.connect(owner).deploy("TrutsNFT", "TNFT", owner.address, 0);

        // await token721.deployed();
        // console.log("token721 address", token721.address)


        trutsAirdrop = await ethers.getContractFactory("trutsAirdopNFT");
        nftAirdrop = await trutsAirdrop.connect(owner).deploy("Truts-platform", "TRUTS");

        await nftAirdrop.deployed();
        console.log("nftAirdrop address", nftAirdrop.address)
    });

    // describe("Testing for token721 nft contract", () => {
    //     it("Create and check if the minting works with Signatires", async () => {
    //         // const signer = web3.eth.accounts.privateKeyToAccount(
    //         //     process.env.SIGNER_PKEY
    //         // );
    //         // const signer = ethers.getSigner(addr1)
    //         let message = `0x000000000000000000000000${addr1.address.substring(2)}`;
    //         const hash = ethers.utils.hashMessage(message)
    //         let { signature } = signer.sign(message);
    //         console.log("sign", signature)
    //         console.log("hash", hash)
    //         await token721.connect(owner).setPublicSaleActive(true)
    //         await token721.connect(addr2).mintNewNFT(signature, 2)

    //     });
    // });

    describe("Testing for token721 Airdrop nft contract", () => {
        it("Create and check if the airdrop works for multiple address", async () => {
            let tokenURI1 = "https://gateway.lighthouse.storage/ipfs/Qmb9S7psTWWM1rqzuFeY5QKBYQvU7JzAJoSvtfXtvxjNDB/1.json"
            let tokenURI2 = "https://gateway.lighthouse.storage/ipfs/Qmb9S7psTWWM1rqzuFeY5QKBYQvU7JzAJoSvtfXtvxjNDB/2.json"
            let tokenURI3 = "https://gateway.lighthouse.storage/ipfs/Qmb9S7psTWWM1rqzuFeY5QKBYQvU7JzAJoSvtfXtvxjNDB/3.json"
            await nftAirdrop.connect(owner).setPublicSaleActive(true)
            // await nftAirdrop.connect(owner).mintforAddress(addr2.address, tokenURI1)
            await nftAirdrop.connect(owner).mintForMultipleAddress([addr2.address, addr1.address, addr3.address], [tokenURI1, tokenURI2, tokenURI3]);

            console.log(await nftAirdrop.connect(addr2).tokenURI(1))
        });
    });




});