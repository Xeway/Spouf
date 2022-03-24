<template>
  <div v-if="!account && !network" class="connect-wallet">
    <button @click="connectWallet">Connect wallet</button>
  </div>
  <div class="app" v-if="account">
    <div v-if="account && network">
      <p>Connected with your wallet : {{ account }}</p>
      <p>Network : {{ network }}</p>
      <button @click="disconnect">Disconnect</button>
      <div class="goals"></div>
    </div>
    <select name="networks" @change="changeNetwork($event)" id="networks" v-if="isMetaMask">
      <option value="Ethereum" :selected="network === 'Ethereum'">Ethereum</option>
      <option value="Matic" :selected="network === 'Matic'">Matic</option>
      <option value="Kovan" :selected="network === 'Kovan'">Kovan</option>
      <option value="Mumbai" :selected="network === 'Mumbai'">Mumbai</option>
    </select>
  </div>
  <div v-if="account && !network">Invalid network</div>
</template>

<script>

import {
  ethers,

  Web3Modal,
  WalletConnectProvider,
  Fortmatic,
  WalletLink,

  contractAddress,
  setContractAddress,
  contractAddresses,
  contractABI,

  infuraId
} from "@/contracts.js";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: infuraId
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
      infuraId: infuraId,
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
      isMetaMask: false
    }
  },
  methods: {
    connectWallet: async function() {
      if (!this.account && !this.network) {
        const { provider } = await this.connectContract();

        const accounts = await provider.listAccounts();
        this.account = accounts[0];

        const { chainId } = await provider.getNetwork();

        await this.changeNetwork(chainId);

        await this.subscribeProvider();

        await this.showGoals();

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
        this.showGoals();
      });

      ethereum.on("chainChanged", (chainId) => {
        this.changeNetwork(chainId);
      });

      ethereum.on("connect", (info) => {
        this.showGoals();
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
      this.isMetaMask = false;
    },
    changeNetwork: async function(event) {
      if (event.target && ethereum.isMetaMask) {
        let chainId;
        let chainName;
        let rpcUrl;

        switch (event.target.value) {
          case "Kovan":
            chainId = "0x2a";
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

          if (event.target.value === "Ethereum" || event.target.value === "Matic" || event.target.value === "Kovan" || event.target.value === "Mumbai") {
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

      // if the user change network directly from his wallet app
      if (!event.target) {
        switch (event) {
          case "0x1": case 1:
            this.network = "Ethereum";
            setContractAddress(contractAddresses.ethereum);
            break;
          case "0x42": case 42: case "0x2a":
            this.network = "Kovan";
            setContractAddress(contractAddresses.kovan);
            break;
          case "0x89": case 89: case 137:
            this.network = "Matic";
            setContractAddress(contractAddresses.matic);
            break;
          case "0x13881": case 80001:
            this.network = "Mumbai";
            setContractAddress(contractAddresses.mumbai);
            break;
          default:
            this.network = false;
            setContractAddress("0x");
            return;
        }
      }

      await this.getContract(ethereum);
      await this.showGoals();
    },
    showGoals: async function() {
      await this.getContract(ethereum);
      const balance = ethers.utils.formatEther(await contract.getGoal());
      this.balance = balance;

      contract.on("UpdateBalance", (updatedBalance) => {
        this.balance = ethers.utils.formatEther(updatedBalance);
      });
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
