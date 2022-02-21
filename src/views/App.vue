<template>
  <div v-if="!account && !network" class="connect-wallet">
    <button @click="connectWallet">Connect wallet</button>
  </div>
  <div class="app" v-if="account">
    <div v-if="account && network">
      <p>Connected with your wallet : {{ account }}</p>
      <p>Network : {{ network }}</p>
      <button @click="disconnect">Disconnect</button>
      <div class="userBalance">{{ balance }}</div>
      <form class="sendMoney" @submit.prevent="sendMoney($event)">
        <input type="number" name="amount" placeholder="0.0" min="0.0" step="0.000000001" required>
        <input type="submit" value="Send ethers">
      </form>
      <form class="withdrawMoney" @submit.prevent="withdrawMoney($event)">
        <input @input="$event.target.value > balance ? overWithdraw = true : overWithdraw = false" type="number" name="amount" placeholder="0.0" min="0.0" step="0.000000001" required>
        <p v-if="overWithdraw">You withdraw more ethers than you have</p>
        <input type="submit" value="Withdraw ethers" :disabled="overWithdraw">
      </form>
    </div>
    <select name="networks" @change="changeNetwork($event)" id="networks" v-if="isMetaMask">
      <option value="Ethereum">Ethereum</option>
      <option value="Matic">Matic</option>
      <option value="Rinkeby">Rinkeby</option>
      <option value="Mumbai">Mumbai</option>
    </select>
  </div>
  <div v-if="account && !network">Invalid network</div>
</template>

<script>

import { ethers } from "ethers";
import abi from "../../smart_contract/artifacts/contracts/Spouf.sol/Spouf.json";

import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";
import WalletLink from "walletlink";

let contractAddress = "0x1cDA8369BF47F098536f976730f557f768b77e36";
const contractABI = abi.abi;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "7f241e16d45245599aedb55e901250c2"
    }
  },
  fortmatic: {
    package: Fortmatic,
    options: {
      key: "pk_test_9FA3FCE7B8F71DDF"
    }
  },
  walletlink: {
    package: WalletLink,
    options: {
      appName: "spouf",
      infuraId: "7f241e16d45245599aedb55e901250c2",
      chainId: 1,
      appLogoUrl: null,
      darkMode: true
    }
  }
}

const web3Modal = new Web3Modal({
  cacheProvider: true,
  theme: "dark",
  providerOptions
});

let contract = null;

let ethereum = null;

export default {
  data() {
    return {
      account: null,
      network: null,
      balance: 0,
      overWithdraw: false,
      isMetaMask: false
    }
  },
  methods: {
    connectWallet: async function() {
      if (!this.account && !this.network) {
        const { provider } = await this.connectContract();

        const accounts = await provider.listAccounts();
        this.account = accounts[0];

        const { name, chainId } = await provider.getNetwork();

        if (chainId === 1) this.network = "Ethereum";
        if (chainId === 80001) this.network = "Mumbai";
        if (chainId !== 1 && chainId !== 80001) this.network = name.charAt(0).toUpperCase() + name.substring(1);

        await this.subscribeProvider();

        await this.showBalance();

        // if you want to have access to const instance, you can do provider.provider
      }
    },
    connectContract: async function() {
      const instance = await web3Modal.connect(); // const instance is like the "window.ethereum" for MetaMask
      // await web3Modal.connect() open a box to connect your wallet

      const { provider, spoufContract } = await this.getContract(instance);

      if (instance.isMetaMask) {
        this.isMetaMask = true;
      }

      return { instance, provider, spoufContract };
    },
    getContract: async function(instance) {
      const provider = new ethers.providers.Web3Provider(instance);

      const signer = provider.getSigner();
      const spoufContract = new ethers.Contract(contractAddress, contractABI, signer);

      contract = spoufContract;

      ethereum = instance;

      return { provider, signer, spoufContract };
    },
    subscribeProvider: async function() {
      if (ethereum.isFortmatic) return;

      ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
          return;
        }
        this.account = accounts[0];
        this.showBalance();
      });

      ethereum.on("chainChanged", (chainId) => {
        this.changeNetwork(chainId);
      });

      ethereum.on("connect", (info) => {
        this.showBalance();
      });

      // This event is not triggered when disconnected, see : https://github.com/MetaMask/metamask-extension/issues/10125
      ethereum.on("disconnect", () => {
        this.disconnect();
      });
    },
    disconnect: async function() {
      await web3Modal.clearCachedProvider();
      if (ethereum.isCoinbaseWallet || ethereum.isWalletConnect) await ethereum.close();
      if (ethereum.isFortmatic) await ethereum.fm.user.logout();
      this.account = null;
      this.network = null;
      this.overWithdraw = false;
      this.isMetaMask = false;
    },
    changeNetwork: async function(event) {
      if (event.target && ethereum.isMetaMask) {
        let chainId;
        let chainName;
        let rpcUrl;

        switch (event.target.value) {
          case "Rinkeby":
            chainId = "0x4";
            chainName = event.target.value;
            rpcUrl = "";
            break;
          case "Matic":
            chainId = "0x89";
            chainName = event.target.value;
            rpcUrl = "https://polygon-rpc.com";
            break;
          case "Mumbai":
            chainId = "0x13881";
            chainName = event.target.value;
            rpcUrl = "https://rpc-mumbai.maticvigil.com";
            break;
          default:
            chainId = "0x1";
            chainName = event.target.value;
            rpcUrl = "";
        }

        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainId }]
          });

          if (event.target.value === "Ethereum" || event.target.value === "Matic" || event.target.value === "Rinkeby" || event.target.value === "Mumbai") {
            this.network = event.target.value;
          }
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: chainId,
                    chainName: chainName,
                    rpcUrls: [rpcUrl]
                  }
                ]
              });
            } catch (addError) {
              console.log(addError);
            }
          }
        }
      }

      // if the user change network direclty from his wallet app
      if (!event.target) {
        switch (event) {
          case "0x1": case 1:
            this.network = "Ethereum";
            break;
          case "0x4": case 4:
            this.network = "Rinkeby";
            contractAddress = "0x1cDA8369BF47F098536f976730f557f768b77e36";
            break;
          case "0x89": case 89: case 137:
            this.network = "Matic";
            break;
          case "0x13881": case 80001:
            this.network = "Mumbai";
            contractAddress = "0xB43a87daE649b947b1CAd104c126A1bfF3e432ea";
            break;
          default:
            this.network = false;
            contractAddress = "0x";
            return;
        }
      }

      await this.getContract(ethereum);
      await this.showBalance();
    },
    showBalance: async function() {
      await this.getContract(ethereum);
      const balance = ethers.utils.formatEther(await contract.showBalance());
      this.balance = balance;

      contract.on("UpdateBalance", (updatedBalance) => {
        this.balance = ethers.utils.formatEther(updatedBalance);
      });
    },
    sendMoney: async function(event) {
      await contract.sendMoney({
        value: ethers.utils.parseEther(event.target[0].value),
        gasLimit: 300000
      });
    },
    withdrawMoney: async function(event) {
      await contract.withdrawMoney(ethers.utils.parseEther(event.target[0].value));
    }
  },
  beforeCreate() {
    document.body.className = "yellow-bg";
  },
  mounted() {
    if (web3Modal.cachedProvider) {
      this.connectWallet();
    }
  },
  name: "App"
}

</script>

<style lang="scss" scoped>

</style>
