import { ethers } from "ethers";
import abi from "../smart_contract/artifacts/contracts/Spouf.sol/Spouf.json";
import ERC20ABI from "../smart_contract/ERC20-ABIs.json";

import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";
import WalletLink from "walletlink";

let contractAddress = "0xf058C302b1230FF9DB41fDeBD60d6CBFa8499c41";
const contractAddresses = {
    kovan: "0xf058C302b1230FF9DB41fDeBD60d6CBFa8499c41",
    mumbai: "0x7B9c106755dd5c652068BAbaC7A09496D3295464",
    matic: "",
    ethereum: ""
}

let USDCAddress = "0xb7a4F3E9097C08dA09517b5aB877F7a917224ede";
const USDCAddresses = {
    kovan: "0xb7a4F3E9097C08dA09517b5aB877F7a917224ede",
    mumbai: "0xe11a86849d99f524cac3e7a0ec1241828e332c62",
    matic: "",
    ethereum: ""
}

function setContractAddress(spoufAddress, USDCContract) {
    contractAddress = spoufAddress;
    USDCAddress = USDCContract;
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
    contractAddresses,
    USDCAddress,
    USDCAddresses,
    setContractAddress,

    contractABI,
    ERC20ABI,

    infuraId,
    alchemyId
}
