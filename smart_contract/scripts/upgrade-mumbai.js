// upgrade.js is used to deploy a new version of a contract on the Mumbai network

async function main() {

    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();

    console.log("Deploying contract with account: ", deployer.address);
    console.log("Account balance: ", accountBalance.toString());

    const spoufContractFactory = await hre.ethers.getContractFactory("Spouf");
    const spoufContract = await upgrades.upgradeProxy("0xF4fD16D9eBB4eed3838AE5ffe7F3787C3b4a6105", spoufContractFactory);

    await spoufContract.deployed();

    console.log("Smart contract's address: ", spoufContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });