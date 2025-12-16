const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("\n🔄 Starting Contract Verification...\n");

    const network = await ethers.provider.getNetwork();
    const deploymentFile = `./deployments/${network.name}-latest.json`;

    let deployment;
    try {
        deployment = require(deploymentFile);
    } catch (error) {
        console.error("❌ Deployment file not found:", deploymentFile);
        console.error("Please deploy the contracts first using: npx hardhat run scripts/deploy-opbnb.js --network <network>");
        process.exit(1);
    }

    console.log("📋 Verifying contracts on", network.name);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Verify RoyaltyVault
    console.log("🔍 Verifying RoyaltyVault...");
    try {
        await hre.run("verify:verify", {
            address: deployment.contracts.RoyaltyVault,
            constructorArguments: [deployment.configuration.owner],
        });
        console.log("✅ RoyaltyVault verified");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ RoyaltyVault already verified");
        } else {
            console.error("❌ RoyaltyVault verification failed:", error.message);
        }
    }
    console.log();

    // Verify UniversalMatrix Implementation
    console.log("🔍 Verifying UniversalMatrix Implementation...");
    try {
        await hre.run("verify:verify", {
            address: deployment.contracts.UniversalMatrix.implementation,
            constructorArguments: [],
        });
        console.log("✅ UniversalMatrix Implementation verified");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ UniversalMatrix Implementation already verified");
        } else {
            console.error("❌ UniversalMatrix Implementation verification failed:", error.message);
        }
    }
    console.log();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Verification complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    if (network.chainId === 5611n) {
        console.log("🔗 View on opBNB Testnet Explorer:");
        console.log("   RoyaltyVault:", `https://testnet.opbnbscan.com/address/${deployment.contracts.RoyaltyVault}`);
        console.log("   UniversalMatrix:", `https://testnet.opbnbscan.com/address/${deployment.contracts.UniversalMatrix.proxy}`);
    } else if (network.chainId === 204n) {
        console.log("🔗 View on opBNB Mainnet Explorer:");
        console.log("   RoyaltyVault:", `https://opbnbscan.com/address/${deployment.contracts.RoyaltyVault}`);
        console.log("   UniversalMatrix:", `https://opbnbscan.com/address/${deployment.contracts.UniversalMatrix.proxy}`);
    }
    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Verification failed:");
        console.error(error);
        process.exit(1);
    });
