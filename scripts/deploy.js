const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting Universal Matrix deployment (Non-Upgradeable)...\n");

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

    // Configuration - UPDATE THESE FOR PRODUCTION
    const feeReceiver = deployer.address; // ⚠️ Change to actual fee receiver
    const owner = deployer.address; // ⚠️ Change to Gnosis Safe multisig for production!

    console.log("📋 Deployment Configuration:");
    console.log("  Fee Receiver:", feeReceiver);
    console.log("  Royalty Vault:", royaltyVaultAddress);
    console.log("  Owner:", owner);
    console.log("");

    // Deploy UniversalMatrix (Non-Upgradeable)
    console.log("📦 Deploying UniversalMatrix (Non-Upgradeable)...");
    const UniversalMatrix = await ethers.getContractFactory("UniversalMatrix");

    const universalMatrix = await UniversalMatrix.deploy(
        feeReceiver,
        royaltyVaultAddress,
        owner
    );

    await universalMatrix.waitForDeployment();
    const matrixAddress = await universalMatrix.getAddress();
    console.log("✅ UniversalMatrix deployed to:", matrixAddress, "\n");

    // Set UniversalMatrix address in RoyaltyVault
    console.log("🔧 Configuring RoyaltyVault...");
    const tx = await royaltyVault.setUniversalMatrix(matrixAddress);
    await tx.wait();
    console.log("✅ RoyaltyVault configured\n");

    // Set initial level prices
    console.log("💰 Setting initial level prices...");
    const levelPrices = [
        ethers.parseEther("0.01"),  // Level 1
        ethers.parseEther("0.02"),  // Level 2
        ethers.parseEther("0.03"),  // Level 3
        ethers.parseEther("0.05"),  // Level 4
        ethers.parseEther("0.08"),  // Level 5
        ethers.parseEther("0.13"),  // Level 6
        ethers.parseEther("0.21"),  // Level 7
        ethers.parseEther("0.34"),  // Level 8
        ethers.parseEther("0.55"),  // Level 9
        ethers.parseEther("0.89"),  // Level 10 (Royalty 1)
        ethers.parseEther("1.44"),  // Level 11 (Royalty 2)
        ethers.parseEther("2.33"),  // Level 12 (Royalty 3)
        ethers.parseEther("3.77")   // Level 13 (Royalty 4)
    ];

    const priceTx = await universalMatrix.updateLevelPrices(levelPrices);
    await priceTx.wait();
    console.log("✅ Level prices configured\n");

    // Display deployment summary
    console.log("=".repeat(70));
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(70));
    console.log("RoyaltyVault:       ", royaltyVaultAddress);
    console.log("UniversalMatrix:    ", matrixAddress);
    console.log("Fee Receiver:       ", feeReceiver);
    console.log("Owner:              ", owner);
    console.log("=".repeat(70));

    console.log("\n💾 Save these addresses:");
    console.log(`ROYALTY_VAULT_ADDRESS=${royaltyVaultAddress}`);
    console.log(`UNIVERSAL_MATRIX_ADDRESS=${matrixAddress}`);

    console.log("\n📝 Next Steps:");
    console.log("1. Test registration and upgrade functions");
    console.log("2. Configure additional settings (if needed)");
    console.log("3. For production: Transfer ownership to Gnosis Safe multisig");
    console.log("4. Verify contracts on block explorer");

    // Verification instructions
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("\n🔍 To verify contracts, run:");
        console.log(`npx hardhat verify --network ${network.name} ${royaltyVaultAddress} "${deployer.address}"`);
        console.log(`npx hardhat verify --network ${network.name} ${matrixAddress} "${feeReceiver}" "${royaltyVaultAddress}" "${owner}"`);
    }

    console.log("\n✨ Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
