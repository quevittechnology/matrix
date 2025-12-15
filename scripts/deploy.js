const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Starting Universal Matrix deployment...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB\n");

    // Deploy RoyaltyVault
    console.log("📦 Deploying RoyaltyVault...");
    const RoyaltyVault = await ethers.getContractFactory("RoyaltyVault");
    const royaltyVault = await RoyaltyVault.deploy(deployer.address);
    await royaltyVault.waitForDeployment();
    const royaltyVaultAddress = await royaltyVault.getAddress();
    console.log("✅ RoyaltyVault deployed to:", royaltyVaultAddress, "\n");

    // Deploy UniversalMatrix (UUPS Proxy)
    console.log("📦 Deploying UniversalMatrix (Upgradeable)...");
    const UniversalMatrix = await ethers.getContractFactory("UniversalMatrix");

    const feeReceiver = deployer.address; // Change this to your fee receiver address
    const owner = deployer.address; // Change this to your owner address

    const universalMatrix = await upgrades.deployProxy(
        UniversalMatrix,
        [feeReceiver, royaltyVaultAddress, owner],
        {
            initializer: "initialize",
            kind: "uups",
        }
    );

    await universalMatrix.waitForDeployment();
    const proxyAddress = await universalMatrix.getAddress();
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

    console.log("✅ UniversalMatrix Proxy deployed to:", proxyAddress);
    console.log("✅ UniversalMatrix Implementation deployed to:", implementationAddress, "\n");

    // Set UniversalMatrix address in RoyaltyVault
    console.log("🔧 Configuring RoyaltyVault...");
    const tx = await royaltyVault.setUniversalMatrix(proxyAddress);
    await tx.wait();
    console.log("✅ RoyaltyVault configured\n");

    // Display deployment summary
    console.log("=".repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("RoyaltyVault:              ", royaltyVaultAddress);
    console.log("UniversalMatrix Proxy:     ", proxyAddress);
    console.log("UniversalMatrix Implementation:", implementationAddress);
    console.log("Fee Receiver:              ", feeReceiver);
    console.log("Owner:                     ", owner);
    console.log("=".repeat(60));

    console.log("\n💾 Save these addresses to your .env file:");
    console.log(`ROYALTY_VAULT_ADDRESS=${royaltyVaultAddress}`);
    console.log(`UNIVERSAL_MATRIX_PROXY=${proxyAddress}`);
    console.log(`UNIVERSAL_MATRIX_IMPLEMENTATION=${implementationAddress}`);

    console.log("\n✨ Deployment complete!");

    // Verification instructions
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("\n📝 To verify contracts on BSCScan, run:");
        console.log(`npx hardhat verify --network ${network.name} ${royaltyVaultAddress} "${deployer.address}"`);
        console.log(`npx hardhat verify --network ${network.name} ${implementationAddress}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
