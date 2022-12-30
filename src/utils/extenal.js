import Web3 from "web3";
import { ethers } from "ethers";
import { toast } from "react-toastify";
// export type ExternalProvider = {
//     isMetaMask?: boolean;
//     isStatus?: boolean;
//     host?: string;
//     path?: string;
//     sendAsync?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
//     send?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
//     request?: (request: { method: string, params?: Array<any> }) => Promise<any>
// }