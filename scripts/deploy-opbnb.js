const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n🚀 Starting opBNB Deployment...\n");

    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    console.log("📋 Deployment Details:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId.toString());
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Configuration
    const config = {
        feeReceiver: process.env.FEE_RECEIVER || deployer.address,
        owner: process.env.OWNER_ADDRESS || deployer.address,
    };

    console.log("⚙️  Configuration:");
    console.log("Fee Receiver:", config.feeReceiver);
    console.log("Owner:", config.owner);
    console.log();

    // Step 1: Deploy RoyaltyVault
    console.log("📦 Step 1/3: Deploying RoyaltyVault...");
    const RoyaltyVault = await ethers.getContractFactory("RoyaltyVault");
    const royaltyVault = await RoyaltyVault.deploy(config.owner);
    await royaltyVault.waitForDeployment();
    const royaltyVaultAddress = await royaltyVault.getAddress();
    console.log("✅ RoyaltyVault deployed to:", royaltyVaultAddress);
    console.log();

    // Step 2: Deploy UniversalMatrix (Upgradeable Proxy)
    console.log("📦 Step 2/3: Deploying UniversalMatrix (UUPS Proxy)...");
    const UniversalMatrix = await ethers.getContractFactory("UniversalMatrix");
    const matrix = await upgrades.deployProxy(
        UniversalMatrix,
        [config.feeReceiver, royaltyVaultAddress, config.owner],
        {
            initializer: "initialize",
            kind: "uups"
        }
    );
    await matrix.waitForDeployment();
    const matrixAddress = await matrix.getAddress();
    console.log("✅ UniversalMatrix Proxy deployed to:", matrixAddress);

    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(matrixAddress);
    console.log("📝 Implementation address:", implementationAddress);
    console.log();

    // Step 3: Configure RoyaltyVault
    console.log("⚙️  Step 3/3: Configuring RoyaltyVault...");
    const tx = await royaltyVault.setUniversalMatrix(matrixAddress);
    await tx.wait();
    console.log("✅ RoyaltyVault configured with UniversalMatrix address");
    console.log();

    // Set initial level prices (IMPORTANT!)
    console.log("💰 Setting initial level prices...");
    const prices = [
        ethers.parseEther("0.01"),  // Level 1 - $5 (assuming 1 BNB = $500)
        ethers.parseEther("0.02"),  // Level 2 - $10
        ethers.parseEther("0.04"),  // Level 3 - $20
        ethers.parseEther("0.08"),  // Level 4 - $40
        ethers.parseEther("0.16"),  // Level 5 - $80
        ethers.parseEther("0.32"),  // Level 6 - $160
        ethers.parseEther("0.64"),  // Level 7 - $320
        ethers.parseEther("1.28"),  // Level 8 - $640
        ethers.parseEther("2.56"),  // Level 9 - $1,280
        ethers.parseEther("5.12"),  // Level 10 - $2,560
        ethers.parseEther("10.24"), // Level 11 - $5,120
        ethers.parseEther("20.48"), // Level 12 - $10,240
        ethers.parseEther("40.96")  // Level 13 - $20,480
    ];

    const priceTx = await matrix.updateLevelPrices(prices);
    await priceTx.wait();
    console.log("✅ Level prices set successfully");
    console.log();

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId.toString(),
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            RoyaltyVault: royaltyVaultAddress,
            UniversalMatrix: {
                proxy: matrixAddress,
                implementation: implementationAddress
            }
        },
        configuration: {
            feeReceiver: config.feeReceiver,
            owner: config.owner,
            defaultRefer: "17534",
            sponsorCommissionPercent: "5",
            sponsorMinLevel: "4",
            levelPrices: prices.map(p => ethers.formatEther(p))
        }
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    const filename = `${network.name}-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

    // Also save as latest
    const latestPath = path.join(deploymentsDir, `${network.name}-latest.json`);
    fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();
    console.log("📝 Contract Addresses:");
    console.log("   RoyaltyVault:", royaltyVaultAddress);
    console.log("   UniversalMatrix (Proxy):", matrixAddress);
    console.log("   UniversalMatrix (Implementation):", implementationAddress);
    console.log();
    console.log("💾 Deployment info saved to:", filename);
    console.log();
    console.log("🔍 Verify contracts on explorer:");
    if (network.chainId === 5611n) {
        console.log("   Testnet Explorer: https://testnet.opbnbscan.com");
        console.log("   RoyaltyVault:", `https://testnet.opbnbscan.com/address/${royaltyVaultAddress}`);
        console.log("   UniversalMatrix:", `https://testnet.opbnbscan.com/address/${matrixAddress}`);
    } else if (network.chainId === 204n) {
        console.log("   Mainnet Explorer: https://opbnbscan.com");
        console.log("   RoyaltyVault:", `https://opbnbscan.com/address/${royaltyVaultAddress}`);
        console.log("   UniversalMatrix:", `https://opbnbscan.com/address/${matrixAddress}`);
    }
    console.log();
    console.log("⚠️  IMPORTANT NEXT STEPS:");
    console.log("   1. Verify contracts on block explorer");
    console.log("   2. Test registration with a small amount");
    console.log("   3. Verify all admin functions work");
    console.log("   4. Set up monitoring for contract events");
    console.log("   5. Keep private keys secure!");
    console.log();
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
