
const hre = require("hardhat");
const { ethers } = require("hardhat")
async function main() {
    const verify = async (_adrs, _args) => {
        await hre.run("verify:verify", {
            address: _adrs,
            constructorArguments: [_args],
        });
    }
    const mumbaiForwarder = "0x69015912AA33720b842dCD6aC059Ed623F28d9f7"
    const Contract = await ethers.getContractFactory('trutsREKT')
    const contract = await Contract.deploy("trutsNFT", "TREKT", mumbaiForwarder)
    await contract.deployed()
    console.log('NFT Contract deployed to:', contract.address)
    await contract.deployed();
    await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: ["trutsREKT", "TREKT", mumbaiForwarder],
    });
}
main()