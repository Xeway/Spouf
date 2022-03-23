// upgrade.js is used to deploy a new version of a contract on the Mumbai network

async function main() {

    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();

    console.log("Deploying contract with account: ", deployer.address);
    console.log("Account balance: ", accountBalance.toString());

    const spoufContractFactory = await hre.ethers.getContractFactory("Spouf");
    const spoufContract = await upgrades.upgradeProxy("0x945b3A7B77645F93F8798Af22784730c300dA12D", spoufContractFactory);

    await spoufContract.deployed();

    console.log("Smart contract's address: ", spoufContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });