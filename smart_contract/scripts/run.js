// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("ethers");
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [owner, randomPerson] = await hre.ethers.getSigners();

  // We get the contract to deploy
  const spoufContractFactory = await hre.ethers.getContractFactory("Spouf");
  const spoufContract = await spoufContractFactory.deploy(); // You can pass arguments in the `deploy` method, it will be passed in the constructor of the contract

  await spoufContract.deployed();

  console.log("Contract's address:", spoufContract.address);
  console.log("Contract's owner :", owner.address);

  let sendMoney;
  let withdrawMoney;
  let showBalance;
  let randomPersonBalance;

  sendMoney = await spoufContract.sendMoney({
    value: ethers.utils.parseEther("0.5")
  });
  await sendMoney;

  sendMoney = await spoufContract.sendMoney({
    value: ethers.utils.parseEther("0.6")
  });
  await sendMoney;

  sendMoney = await spoufContract.connect(randomPerson).sendMoney({
    value: ethers.utils.parseEther("0.6")
  });
  await sendMoney;

  showBalance = await spoufContract.showBalance();
  console.log("Owner's (in contract) balance :", hre.ethers.utils.formatEther(showBalance) + " Ξ");

  showBalance = await spoufContract.connect(randomPerson).showBalance();
  console.log("randomPerson's (in contract) balance :", hre.ethers.utils.formatEther(showBalance) + " Ξ");

  randomPersonBalance = await hre.ethers.provider.getBalance(randomPerson.address);
  console.log("randomPerson's (own account) balance :", hre.ethers.utils.formatEther(randomPersonBalance) + " Ξ");

  withdrawMoney = await spoufContract.connect(randomPerson).withdrawMoney(ethers.utils.parseEther("0.1"));
  await withdrawMoney;

  showBalance = await spoufContract.connect(randomPerson).showBalance();
  console.log("randomPerson's (in contract) balance :", hre.ethers.utils.formatEther(showBalance) + " Ξ");
  
  randomPersonBalance = await hre.ethers.provider.getBalance(randomPerson.address);
  console.log("randomPerson's (own account) balance :", hre.ethers.utils.formatEther(randomPersonBalance) + " Ξ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
