<template>
  <h1>SPOUF</h1>
  <h3>A blockchain-based app that aims to stop procrastinating by loosing money 🤪💸</h3>
  <p><span>{{ globalBalance }}</span> USDC deposited!</p>
</template>

<script>
// @ is an alias to /src

import {
  ethers,

  contractAddresses,
  USDCAddresses,

  contractABI,
  ERC20ABI,

  infuraId,
  alchemyId
} from "@/contracts.js";

export default {
  data() {
    return {
      globalBalance: 0
    }
  },
  beforeCreate() {
    document.body.className = "darkblue-bg";
  },
  async mounted() {
    // for the Kovan network and the Mumbai network, in production this code will be deleted because we don't want fake ethers among global balance
    const providerKovan = ethers.getDefaultProvider("kovan", {
      infura: infuraId
    });
    const spoufContractKovan = new ethers.Contract(contractAddresses.kovan, contractABI, providerKovan);
    const USDCKovan = new ethers.Contract(USDCAddresses.kovan, ERC20ABI, providerKovan);
    const globalBalanceKovan = parseInt(ethers.utils.formatUnits(parseInt(await spoufContractKovan.showGlobalBalance()).toString(), await USDCKovan.decimals()));

    spoufContractKovan.on("UpdateGlobalBalance", async(globalBalance) => {
      this.globalBalance = this.globalBalance + (parseInt(ethers.utils.formatUnits(globalBalance, await USDCKovan.decimals())) - globalBalanceKovan);
    });

    // Mumbai network is not supported by Infura (for the free plan), see : https://github.com/ethers-io/ethers.js/discussions/2008
    const providerMumbai = new ethers.providers.AlchemyProvider("maticmum", alchemyId);
    const spoufContractMumbai = new ethers.Contract(contractAddresses.mumbai, contractABI, providerMumbai);
    const USDCMumbai = new ethers.Contract(USDCAddresses.mumbai, ERC20ABI, providerMumbai);
    const globalBalanceMumbai = parseInt(ethers.utils.formatUnits(parseInt(await spoufContractMumbai.showGlobalBalance()).toString(), await USDCMumbai.decimals()));

    spoufContractMumbai.on("UpdateGlobalBalance", async(globalBalance) => {
      this.globalBalance = this.globalBalance + (parseInt(ethers.utils.formatUnits(globalBalance, await USDCMumbai.decimals())) - globalBalanceMumbai);
    });
    //

    // since the contract's are not deployed yet on Matic and Ethereum, the following code will be present when the project will be fully finished
    /* const providerMatic = new ethers.providers.AlchemyProvider("matic", {
      infura: infuraId
    });
    const spoufContractMatic = new ethers.Contract(contractAddresses.matic, contractABI, providerMatic);
    const USDCMatic = new ethers.Contract(USDCAddresses.matic, ERC20ABI, providerMatic);
    const globalBalanceMatic = parseInt(ethers.utils.formatUnits(parseInt(await spoufContractMatic.showGlobalBalance()).toString(), await USDCMatic.decimals()));

    spoufContractMatic.on("UpdateGlobalBalance", async(globalBalance) => {
      this.globalBalance = this.globalBalance + (parseInt(ethers.utils.formatUnits(globalBalance, await USDCMatic.decimals())) - globalBalanceMatic);
    });

    const providerEthereum = ethers.getDefaultProvider("homestead", {
      infura: infuraId
    });
    const spoufContractEthereum = new ethers.Contract(contractAddresses.ethereum, contractABI, providerEthereum);
    const USDCEthereum = new ethers.Contract(USDCAddresses.ethereum, ERC20ABI, providerEthereum);
    const globalBalanceEthereum = parseInt(ethers.utils.formatUnits(parseInt(await spoufContractEthereum.showGlobalBalance()).toString(), await USDCEthereum.decimals()));

    spoufContractEthereum.on("UpdateGlobalBalance", async(globalBalance) => {
      this.globalBalance = this.globalBalance + (parseInt(ethers.utils.formatUnits(globalBalance, await USDCEthereum.decimals())) - globalBalanceEthereum);
    });
    */

    this.globalBalance = globalBalanceKovan + globalBalanceMumbai;
  },
  name: 'Home'
}

</script>

<style lang="scss" scoped>

h1 {
  font-family: 'ThunderBlack', sans-serif;
  font-size: 8rem;
  color: $red;
  text-shadow:
  0 15*1px 0 $yellow,
  0 15*2px 0 $bright_blue
  ;
  animation: shadowMove 1.3s infinite;
}

h3 {
  font-size: 2em;
  color: $yellow;
  // animation: move 1.3s infinite;
}

/*
@keyframes move {
  50% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(0px);
  }
}
*/

@keyframes shadowMove {
  25% {
    text-shadow:
    0 15*2px 0 $yellow,
    0 15*3px 0 $bright_blue
    ;
  }
  50% {
    text-shadow:
    0 15*2px 0 $yellow,
    0 15*4px 0 $bright_blue
    ;
  }
  100% {
    text-shadow:
    0 15*1px 0 $yellow,
    0 15*2px 0 $bright_blue
    ;
  }
}
</style>
