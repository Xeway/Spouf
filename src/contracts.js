import { ethers } from "ethers";
import abi from "../smart_contract/artifacts/contracts/Spouf.sol/Spouf.json";

import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";
import WalletLink from "walletlink";

let contractAddress = "0x1cDA8369BF47F098536f976730f557f768b77e36";
function setContractAddress(address) {
    contractAddress = address;
}
const contractAddresses = {
    kovan: "0xB43a87daE649b947b1CAd104c126A1bfF3e432ea",
    mumbai: "0xd581f57328f33b84E8Ec05EBf9e0c77Ac8381aA8",
    matic: "",
    ethereum: ""
}
const contractABI = abi.abi;

const infuraId = "7f241e16d45245599aedb55e901250c2";
const alchemyId = "lEBhQbN6U0UwGrqvbqfXYfTVZrzatHmb";

export {
    ethers,

    Web3Modal,
    WalletConnectProvider,
    Fortmatic,
    WalletLink,

    contractAddress,
    setContractAddress,
    contractAddresses,
    contractABI,

    infuraId,
    alchemyId
}
