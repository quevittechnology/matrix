const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("\n🔄 Starting Contract Upgrade...\n");

    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    console.log("📋 Upgrade Details:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId.toString());
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Get the proxy address from deployment file
    const deploymentFile = `./deployments/${network.name}-latest.json`;
    let deployment;

    try {
        deployment = require(deploymentFile);
    } catch (error) {
        console.error("❌ Deployment file not found:", deploymentFile);
        console.error("Please deploy the contract first using: npx hardhat run scripts/deploy-opbnb.js --network <network>");
        process.exit(1);
    }

    const proxyAddress = deployment.contracts.UniversalMatrix.proxy;
    console.log("📍 Current Proxy Address:", proxyAddress);
    console.log();

    // Get current implementation
    const currentImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("📝 Current Implementation:", currentImplementation);
    console.log();

    // Prepare new implementation
    console.log("🔨 Preparing new implementation...");
    const UniversalMatrixV2 = await ethers.getContractFactory("UniversalMatrix");

    console.log("⚠️  IMPORTANT: Make sure your new contract:");
    console.log("   1. Has the same storage layout as the old contract");
    console.log("   2. Only adds NEW storage variables at the END");
    console.log("   3. Does NOT remove or reorder existing variables");
    console.log("   4. Includes the _authorizeUpgrade function");
    console.log();

    // Validate upgrade
    console.log("🔍 Validating upgrade compatibility...");
    try {
        await upgrades.validateUpgrade(proxyAddress, UniversalMatrixV2);
        console.log("✅ Upgrade validation passed!");
    } catch (error) {
        console.error("❌ Upgrade validation failed:");
        console.error(error.message);
        console.log();
        console.log("⚠️  This upgrade may not be safe. Please review the error above.");
        console.log("   Common issues:");
        console.log("   - Storage layout changed");
        console.log("   - Variables removed or reordered");
        console.log("   - Incompatible changes");
        process.exit(1);
    }
    console.log();

    // Perform upgrade
    console.log("🚀 Upgrading contract...");
    console.log("   This will deploy a new implementation and update the proxy");
    console.log();

    const upgraded = await upgrades.upgradeProxy(proxyAddress, UniversalMatrixV2);
    await upgraded.waitForDeployment();

    const newImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ UPGRADE SUCCESSFUL!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();
    console.log("📍 Proxy Address (unchanged):", proxyAddress);
    console.log("📝 Old Implementation:", currentImplementation);
    console.log("📝 New Implementation:", newImplementation);
    console.log();

    // Verify the upgrade
    console.log("🔍 Verifying upgrade...");
    const matrix = await ethers.getContractAt("UniversalMatrix", proxyAddress);

    const owner = await matrix.owner();
    const totalUsers = await matrix.totalUsers();
    const defaultRefer = await matrix.defaultRefer();

    console.log("✅ Contract is accessible:");
    console.log("   Owner:", owner);
    console.log("   Total Users:", totalUsers.toString());
    console.log("   Default Refer:", defaultRefer.toString());
    console.log();

    // Update deployment file
    deployment.contracts.UniversalMatrix.implementation = newImplementation;
    deployment.upgraded = {
        timestamp: new Date().toISOString(),
        oldImplementation: currentImplementation,
        newImplementation: newImplementation,
        upgrader: deployer.address
    };

    const fs = require("fs");
    const path = require("path");
    fs.writeFileSync(
        path.join(__dirname, "..", "deployments", `${network.name}-latest.json`),
        JSON.stringify(deployment, null, 2)
    );

    console.log("💾 Deployment file updated");
    console.log();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 UPGRADE COMPLETE!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();
    console.log("📝 Next Steps:");
    console.log("   1. Verify new implementation on block explorer");
    console.log("   2. Test all contract functions");
    console.log("   3. Monitor contract behavior");
    console.log("   4. Update frontend if needed");
    console.log();

    if (network.chainId === 5611n) {
        console.log("🔗 View on opBNB Testnet Explorer:");
        console.log("   Proxy:", `https://testnet.opbnbscan.com/address/${proxyAddress}`);
        console.log("   New Implementation:", `https://testnet.opbnbscan.com/address/${newImplementation}`);
    } else if (network.chainId === 204n) {
        console.log("🔗 View on opBNB Mainnet Explorer:");
        console.log("   Proxy:", `https://opbnbscan.com/address/${proxyAddress}`);
        console.log("   New Implementation:", `https://opbnbscan.com/address/${newImplementation}`);
    }
    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Upgrade failed:");
        console.error(error);
        process.exit(1);
    });
