import { AuthProvider, CHAIN } from '@arcana/auth'
import { ethers } from 'ethers'


window.onload = async () => {
    try {
        await auth.init()

        const arcanaProvider = await auth.loginWithSocial('google')
        const provider = new ethers.providers.Web3Provider(arcanaProvider)

        await provider.getBlockNumber()
        // 14983200
    } catch (e) {
        // log error
    }
}
interface ChainConfig {
    chainId: CHAIN
    rpcUrl?: string
}

const auth = new AuthProvider(`${appAddress}`, {
    position: 'left',
    theme: 'light',
    alwaysVisible: false,
    network: 'mainnet', // network can be testnet or mainnet - defaults to testnet
    chainConfig: {
        chainId: CHAIN.POLYGON_MAINNET,
        rpcUrl: '',
    },
})

await auth.init()