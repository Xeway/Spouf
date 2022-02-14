<template>
  <div class="connect-wallet" v-if="account === ''">
      <button v-if="metamaskInstalled && account === ''" @click="connectWallet">Connect your wallet</button>
      <p id="install-metamask" v-else>You don't have the MetaMask's extension : <a href="https://metamask.io/download/" id="metamask-link">Click here to install it</a></p>
  </div>
  <div v-else>
    <p>Connected with your wallet : {{ account }}</p>
  </div>
</template>

<script>

// import { ethers } from "ethers";
// import abi from "../../smart_contract/artifacts/contracts/Spouf.sol/Spouf.json";

// const contractAddress = "0x0f13CFfe14D9f790Bd81aff6b8D5Daf180Ad413f";
// const contractABI = abi.abi;

export default {
  data() {
    return {
      metamaskInstalled: false,
      account: ""
    }
  },
  methods: {
    checkIfConnected: async function() {
      try {
        const { ethereum } = window;

        if (!ethereum) {
          this.metamaskInstalled = false;
          return;
        } else {
          this.metamaskInstalled = true;
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length > 0) {
          this.account = accounts[0];
        } else {
          this.account = "";
        }
      } catch (e) {
        console.log(e);
      }
    },
    connectWallet: async function() {
      try {
        const { ethereum } = window;

        if (!ethereum) {
          this.metamaskInstalled = false;
          return;
        } else {
          this.metamaskInstalled = true;
        }

        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        this.account = accounts[0];
      } catch (e) {
        console.log(e);
      }
    }
  },
  beforeCreate() {
    document.body.className = "yellow-bg";
  },
  mounted() {
    this.checkIfConnected();
  },
  name: "App"
}

</script>

<style lang="scss" scoped>

</style>
