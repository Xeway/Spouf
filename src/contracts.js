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
    kovan: "0xFBf6b4a077366C73DcFA11e07b46Ba898D517AdF",
    mumbai: "0xF4fD16D9eBB4eed3838AE5ffe7F3787C3b4a6105",
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
