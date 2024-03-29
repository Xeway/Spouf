import { defineStore } from "pinia";

import { ethers } from "ethers";
import moment from "moment";
import abi from "../smart_contract/artifacts/contracts/Spouf.sol/Spouf.json";
import ERC20ABI from "../smart_contract/ERC20-ABIs.json";

import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";
import WalletLink from "walletlink";

const contractAddresses = {
    kovan: "0xB6d0A5157370c7e9F1BcA4Ab860fc1d3514cF701",
    mumbai: "0x60Ff3A096A4779d28fc25ac9b084591C5730E82b",
    matic: "",
    ethereum: ""
}
const USDCAddresses = {
    kovan: "0xb7a4F3E9097C08dA09517b5aB877F7a917224ede",
    mumbai: "0xe11a86849d99f524cac3e7a0ec1241828e332c62",
    matic: "",
    ethereum: ""
}
const LINKAddresses = {
    kovan: "0xa36085F69e2889c224210F603D836748e7dC0088",
    mumbai: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    matic: "",
    ethereum: ""
}

const contractABI = abi.abi;

const infuraId = "7f241e16d45245599aedb55e901250c2";
const alchemyId = "lEBhQbN6U0UwGrqvbqfXYfTVZrzatHmb";

const useContracts = defineStore("contracts", {
    state: () => ({
        contractAddress: "0xB6d0A5157370c7e9F1BcA4Ab860fc1d3514cF701",
        USDCAddress: "0xb7a4F3E9097C08dA09517b5aB877F7a917224ede",
        LINKAddress: "0xa36085F69e2889c224210F603D836748e7dC0088"
    }),
    actions: {
        setContractAddress(networkName) {
            this.contractAddress = contractAddresses[networkName];
            this.USDCAddress = USDCAddresses[networkName];
            this.LINKAddress = LINKAddresses[networkName];
        }
    }
});

export {
    ethers,
    moment,

    Web3Modal,
    WalletConnectProvider,
    Fortmatic,
    WalletLink,

    useContracts,
    contractAddresses,
    USDCAddresses,

    contractABI,
    ERC20ABI,

    infuraId,
    alchemyId
}
