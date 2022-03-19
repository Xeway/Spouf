require('dotenv').config();
require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_API_URL_RINKEBY,
      accounts: [process.env.PRIVATE_ACCOUNT_KEY]
    },
    kovan: {
      url: process.env.ALCHEMY_API_URL_KOVAN,
      accounts: [process.env.PRIVATE_ACCOUNT_KEY]
    },
    mumbai: {
      url: process.env.ALCHEMY_API_URL_MUMBAI,
      accounts: [process.env.PRIVATE_ACCOUNT_KEY]
    }
  }
};
