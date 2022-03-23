// create-proxy.js should be called once, to deploy the proxy contract

async function main() {

    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();

    console.log("Deploying proxy contract with account: ", deployer.address);
    console.log("Account balance: ", accountBalance.toString());

    const proxyContractFactory = await hre.ethers.getContractFactory("Spouf");
    const proxyContract = await upgrades.deployProxy(proxyContractFactory);

    await proxyContract.deployed();

    console.log("Proxy's address: ", proxyContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });