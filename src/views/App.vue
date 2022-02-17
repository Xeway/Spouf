<template>
  <div v-if="!account && !network" class="connect-wallet">
    <button @click="connectWallet">Connect wallet</button>
  </div>
  <div class="app" v-if="account && network">
    <p>Connected with your wallet : {{ account }}</p>
    <p>Network : {{ network }}</p>
    <button @click="disconnect">Disconnect</button>
    <div class="userBalance"></div>
  </div>
  <div v-else-if="account && !network">Invalid network</div>
</template>

<script>

import { ethers } from "ethers";
import abi from "../../smart_contract/artifacts/contracts/Spouf.sol/Spouf.json";

import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";
import WalletLink from "walletlink";

const contractAddress = "0x0f13CFfe14D9f790Bd81aff6b8D5Daf180Ad413f";
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

export default {
  data() {
    return {
      account: null,
      network: null,
      web3Modal: new Web3Modal({
        network: "rinkeby",
        cacheProvider: true,
        theme: "dark",
        providerOptions
      }),
      instance: null,
      contract: null
    }
  },
  methods: {
    connectWallet: async function() {
      if (!this.account && !this.network) {
        const { instance, provider, spoufContract } = await this.connectContract();

        const accounts = await provider.listAccounts();
        this.account = accounts[0];

        const { name, chainId } = await provider.getNetwork();
        chainId === 1 ? this.network = "Ethereum" : this.network = name.charAt(0).toUpperCase() + name.substring(1);

        await this.subscribeProvider(instance);

        this.spoufContract = spoufContract;

        // if you want to have access to const instance, you can do provider.provider
      }
    },
    connectContract: async function() {
      const instance = await this.web3Modal.connect(); // const instance is like the "window.ethereum" for MetaMask

      const provider = new ethers.providers.Web3Provider(instance);

      const signer = provider.getSigner();
      const spoufContract = new ethers.Contract(contractAddress, contractABI, signer);

      this.instance = instance;

      return { instance, provider, spoufContract };
    },
    subscribeProvider: async function(provider) {
      if (provider.isFortmatic) return;

      provider.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
          return;
        }
        this.account = accounts[0];
      });

      provider.on("chainChanged", (chainId) => {
        switch (chainId) {
          case "0x1": case 1:
            this.network = "Ethereum";
            break;
          case "0x4": case 4:
            this.network = "Rinkeby";
            break;
          case "0x89": case 89: case 137:
            this.network = "Matic";
            break;
          default:
            this.network = false;
        }
      });

      provider.on("connect", (info) => {
        console.log(info);
      });

      // This event is not triggered when disconnected, see : https://github.com/MetaMask/metamask-extension/issues/10125
      provider.on("disconnect", () => {
        this.disconnect();
      });
    },
    disconnect: async function() {
      await this.web3Modal.clearCachedProvider();
      if (this.instance.isCoinbaseWallet || this.instance.isWalletConnect) await this.instance.close();
      if (this.instance.isFortmatic) await this.instance.fm.user.logout();
      this.account = null;
      this.network = null;
    }
  },
  beforeCreate() {
    document.body.className = "yellow-bg";
  },
  mounted() {
    if (this.web3Modal.cachedProvider) {
      this.connectWallet();
    }
  },
  name: "App"
}

</script>

<style lang="scss" scoped>

</style>
