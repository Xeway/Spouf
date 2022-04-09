<template>
  <div v-if="!account && !network" class="connect-wallet">
    <button @click="connectWallet">Connect wallet</button>
  </div>
  <div class="app" v-if="account">
    <div v-if="account && network">
      <p>Connected with your wallet : {{ account }}</p>
      <p>Network : {{ network }}</p>
      <button @click="disconnect">Disconnect</button>
      <div>
        <button @click="isFormGoal = true; isShowStats = false">Define a goal</button>
        <button @click="isShowStats = true; isFormGoal = false; showStats()">Show stats</button>
      </div>
      <div v-if="isFormGoal && !isShowStats" class="define-goal">
        <button @click="isFormGoal = false">Leave</button>
        <form class="defineGoalForm" @submit.prevent="defineGoal($event)">
          <label for="goalsName">Goal's name</label>
          <input id="goalsName" type="text" placeholder="Get a Six Pack 💪" name="goalName" required v-model="formGoal.name">

          <label for="deadline">Deadline</label>
          <input id="deadline" type="datetime-local" :min="
            new Date().getFullYear() + '-' +
            ((new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '-' +
            (new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate()) + 'T' +
            (new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours()) + ':' +
            (new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes())
          " name="deadline" required v-model="formGoal.deadline">

          <label for="amountWillingToLose">Amount willing to lose (in USDC)</label>
          <input id="amountWillingToLose" type="text" inputmode="decimal" autocomplete="off" autocorrect="off" pattern="^[0-9]*[.,]?[0-9]*$" minlength="1" maxlength="79" placeholder="0.0" min="0.0" step="0.00000001" v-model="formGoal.amount">

          <input type="submit" value="Validate">
        </form>
      </div>
      <div v-if="isShowStats && !isFormGoal">
        <button @click="isShowStats = false">Leave</button>
        <a :href="bcExplorers.bcExpLink" id="etherscan-link">See it on {{ bcExplorers.bcExpName }}</a>
      </div>
      <div v-if="!isFormGoal && !isShowStats" class="goalsList">
        <ul class="goals" v-for="(goal, index) in goals" :key="goal">
          <li>
            Name: {{ goal.goal }}
            Deadline: {{ new Date(goal.deadline * 1000).toString().slice(0, 21) }}
            Pledge: {{ parseAmount(goal.amount.toString()) }}
            <button @click="deleteGoal(index)">Delete</button>
          </li>
        </ul>
      </div>
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
  contractAddresses,
  USDCAddress,
  USDCAddresses,
  LINKAddress,
  LINKAddresses,
  setContractAddress,

  contractABI,
  ERC20ABI,

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
let USDC = null;
let LINK = null;

let ethereum = null;

export default {
  data() {
    return {
      account: null,
      network: null,
      goals: [],
      isMetaMask: false,
      isFormGoal: false,
      isShowStats: false,
      formGoal: {
        name: "",
        deadline: "",
        amount: 0
      },
      bcExplorers: {
        bcExpName: "",
        bcExpLink: ""
      }
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
      USDC = new ethers.Contract(USDCAddress, ERC20ABI, signer);
      LINK = new ethers.Contract(LINKAddress, ERC20ABI, signer);

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
        this.showStats();
      });

      ethereum.on("chainChanged", (chainId) => {
        this.changeNetwork(chainId);
      });

      ethereum.on("connect", (info) => {
        this.showGoals();
        this.showStats();
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

          switch (event.target.value) {
            case "Ethereum":
              this.network = "Ethereum";
              setContractAddress(contractAddresses.ethereum, USDCAddresses.ethereum, LINKAddresses.ethereum);
              break;
            case "Kovan":
              this.network = "Kovan";
              setContractAddress(contractAddresses.kovan, USDCAddresses.kovan, LINKAddresses.kovan);
              break;
            case "Matic":
              this.network = "Matic";
              setContractAddress(contractAddresses.matic, USDCAddresses.matic, LINKAddresses.matic);
              break;
            case "Mumbai":
              this.network = "Mumbai";
              setContractAddress(contractAddresses.mumbai, USDCAddresses.mumbai, LINKAddresses.mumbai);
              break;
            default:
              this.network = false;
              setContractAddress("0x", "0x", "0x");
              return;
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
            setContractAddress(contractAddresses.ethereum, USDCAddresses.ethereum, LINKAddresses.ethereum);
            break;
          case "0x42": case 42: case "0x2a":
            this.network = "Kovan";
            setContractAddress(contractAddresses.kovan, USDCAddresses.kovan, LINKAddresses.kovan);
            break;
          case "0x89": case 89: case 137:
            this.network = "Matic";
            setContractAddress(contractAddresses.matic, USDCAddresses.matic, LINKAddresses.matic);
            break;
          case "0x13881": case 80001:
            this.network = "Mumbai";
            setContractAddress(contractAddresses.mumbai, USDCAddresses.mumbai, LINKAddresses.mumbai);
            break;
          default:
            this.network = false;
            setContractAddress("0x", "0x", "0x");
            return;
        }
      }

      await this.getContract(ethereum);
      await this.showGoals();
      await this.showStats();
    },
    showGoals: async function() {
      await this.getContract(ethereum);
      const goals = await contract.getGoal();
      this.goals = goals;

      contract.on("UpdateGoals", (updatedGoals) => {
        this.goals = updatedGoals;
      });
    },
    defineGoal: async function(event) {
      await this.getContract(ethereum);

      // the decimals are different according to the different ERC20 of different networks
      const USDCAmount = ethers.utils.parseUnits(this.formGoal.amount.toString(), await USDC.decimals());

      USDC.approve(contractAddress, USDCAmount).then(
        LINK.approve(contractAddress, ethers.utils.parseEther("0.2")).then(
          await contract.setGoal(
            this.formGoal.name,
            Math.floor(new Date(this.formGoal.deadline).getTime() / 1000),
            USDCAmount,
            { gasLimit: 300000 }
          )
        )
      );
    },
    deleteGoal: async function(index) {
      if (index < this.goals.length) {
        await this.getContract(ethereum);

        await contract.deleteGoal(index, false);
      } else {
        console.log("Failed (index out of bound).");
      }
    },
    showStats: async function() {
      await this.getContract(ethereum);

      let name;
      let link;
      if (this.network === "Ethereum") {
        name = "Etherscan";
        link = `https://etherscan.io/address/${this.account}?toaddress=${contractAddresses.ethereum}`;
      } else if (this.network === "Kovan") {
        name = "Etherscan";
        link = `https://kovan.etherscan.io/address/${this.account}?toaddress=${contractAddresses.kovan}`;
      } else if (this.network === "Matic") {
        name = "PolygonScan";
        link = `https://polygonscan.io/address/${this.account}?toaddress=${contractAddresses.matic}`;
      } else if (this.network === "Mumbai") {
        name = "PolygonScan";
        link = `https://mumbai.polygonscan.io/address/${this.account}?toaddress=${contractAddresses.mumbai}`;
      }

      this.bcExplorers.bcExpName = name;
      this.bcExplorers.bcExpLink = link;
    },
    parseAmount: function(amount) {
      this.getContract(ethereum);

      // we cannot use asynchronous code so we're obligated to use that crap technique
      if (USDCAddress === USDCAddresses.mumbai) {
        return ethers.utils.formatUnits(amount, 18);
      } else {
        return ethers.utils.formatUnits(amount, 6);
      }
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
