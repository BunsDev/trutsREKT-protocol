
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
    //const polygonForwarder = "0xf0511f123164602042ab2bCF02111fA5D3Fe97CD"
    const Contract = await ethers.getContractFactory('trutsPlatformNFT')
    const contract = await Contract.deploy("Truts Platform", "TRUTS", mumbaiForwarder)
    await contract.deployed()
    console.log('NFT Contract deployed to:', contract.address)
    await contract.deployed();
    await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: ["Truts Platform", "TRUTS", mumbaiForwarder],
    });
}
main()