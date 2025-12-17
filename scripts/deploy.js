const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Starting Universal Matrix deployment (Non-Upgradeable)...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB\n");

    // ====================================================================
    // CONFIGURATION FROM .ENV FILE
    // ====================================================================
    const FEE_RECEIVER = process.env.FEE_RECEIVER || deployer.address;
    const OWNER = process.env.OWNER || deployer.address;
    const ROOT_USER_ADDRESS = process.env.ROOT_USER_ADDRESS || deployer.address;

    console.log("📋 Deployment Configuration:");
    console.log("  Fee Receiver:", FEE_RECEIVER);
    console.log("  Owner:", OWNER);
    console.log("  Root User:", ROOT_USER_ADDRESS);
    console.log("");

    // Validate addresses
    if (!ethers.isAddress(FEE_RECEIVER)) throw new Error("Invalid FEE_RECEIVER address");
    if (!ethers.isAddress(OWNER)) throw new Error("Invalid OWNER address");
    if (!ethers.isAddress(ROOT_USER_ADDRESS)) throw new Error("Invalid ROOT_USER_ADDRESS");

    // ====================================================================
    // DEPLOY ROYALTY VAULT
    // ====================================================================
    console.log("📦 Deploying RoyaltyVault...");
    const RoyaltyVault = await ethers.getContractFactory("RoyaltyVault");
    const royaltyVault = await RoyaltyVault.deploy(deployer.address);
    await royaltyVault.waitForDeployment();
    const royaltyVaultAddress = await royaltyVault.getAddress();
    console.log("✅ RoyaltyVault deployed to:", royaltyVaultAddress, "\n");

    // ====================================================================
    // DEPLOY UNIVERSAL MATRIX
    // ====================================================================
    console.log("📦 Deploying UniversalMatrix (Non-Upgradeable)...");
    const UniversalMatrix = await ethers.getContractFactory("UniversalMatrix");

    const universalMatrix = await UniversalMatrix.deploy(
        FEE_RECEIVER,
        royaltyVaultAddress,
        OWNER
    );

    await universalMatrix.waitForDeployment();
    const matrixAddress = await universalMatrix.getAddress();
    console.log("✅ UniversalMatrix deployed to:", matrixAddress, "\n");

    // ====================================================================
    // CONFIGURE ROYALTY VAULT
    // ====================================================================
    console.log("🔧 Configuring RoyaltyVault...");
    const setMatrixTx = await royaltyVault.setUniversalMatrix(matrixAddress);
    await setMatrixTx.wait();
    console.log("✅ RoyaltyVault configured\n");

    // ====================================================================
    // SET INITIAL LEVEL PRICES
    // ====================================================================
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

    // ====================================================================
    // REGISTER ROOT USER (ID: 73928)
    // ====================================================================
    console.log("👤 Registering root user...");
    console.log("  Root User Wallet:", ROOT_USER_ADDRESS);

    // Register root user with ID 73928
    // Note: Root user is already initialized in constructor with matrix node
    // This registers their wallet address to the system
    const registrationFee = levelPrices[0]; // Level 1 price
    const registerTx = await universalMatrix.register(
        73928, // referrerId (self-referral for root)
        73928, // parentId (self-parent for root)
        { value: registrationFee }
    );
    await registerTx.wait();

    // Verify root user registration
    const rootUserId = await universalMatrix.id(ROOT_USER_ADDRESS);
    console.log("✅ Root user registered with ID:", rootUserId.toString());
    console.log("");

    // ====================================================================
    // CONFIGURE ROOT USER ADDRESS (IF DIFFERENT FROM DEPLOYER)
    // ====================================================================
    if (ROOT_USER_ADDRESS !== deployer.address && OWNER === deployer.address) {
        console.log("🔧 Setting root user address in contract...");
        const setRootTx = await universalMatrix.setRootUserAddress(ROOT_USER_ADDRESS);
        await setRootTx.wait();
        console.log("✅ Root user address configured\n");
    }

    // ====================================================================
    // DEPLOYMENT SUMMARY
    // ====================================================================
    console.log("=".repeat(70));
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(70));
    console.log("RoyaltyVault:       ", royaltyVaultAddress);
    console.log("UniversalMatrix:    ", matrixAddress);
    console.log("Fee Receiver:       ", FEE_RECEIVER);
    console.log("Owner:              ", OWNER);
    console.log("Root User (ID 73928):", ROOT_USER_ADDRESS);
    console.log("=".repeat(70));

    console.log("\n💾 Save these addresses to your .env file:");
    console.log(`ROYALTY_VAULT_ADDRESS=${royaltyVaultAddress}`);
    console.log(`UNIVERSAL_MATRIX_ADDRESS=${matrixAddress}`);

    console.log("\n📝 ALL DEFAULT VALUES SET:");
    console.log("✅ Max Level: 13");
    console.log("✅ ROI Cap: 150%");
    console.log("✅ Income Layers: 13");
    console.log("✅ Direct Required: 2");
    console.log("✅ Royalty Dist Time: 24 hours");
    console.log("✅ Sponsor Min Level: 4");
    console.log("✅ Perpetual Royalty Min Refs: 15");
    console.log("✅ Root User Registered: Yes");

    console.log("\n📝 Next Steps:");
    console.log("1. ✅ All default values are set");
    console.log("2. 🔐 Transfer ownership to DAO multisig (see MULTISIG_OWNER_SETUP.md)");
    console.log("3. ⚙️  Adjust parameters via DAO governance if needed");
    console.log("4. 🧪 Test registration and upgrade functions");
    console.log("5. 🔍 Verify contracts on block explorer");

    // Verification instructions
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("\n🔍 To verify contracts, run:");
        console.log(`npx hardhat verify --network ${network.name} ${royaltyVaultAddress} "${deployer.address}"`);
        console.log(`npx hardhat verify --network ${network.name} ${matrixAddress} "${FEE_RECEIVER}" "${royaltyVaultAddress}" "${OWNER}"`);
    }

    console.log("\n🎯 DAO Governance:");
    console.log("After transferring ownership to multisig, the DAO can:");
    console.log("  - Change root user address: setRootUserAddress()");
    console.log("  - Adjust ROI cap: setRoiCap()");
    console.log("  - Modify income layers: setIncomeLayers()");
    console.log("  - Update all system parameters via multisig votes");

    console.log("\n✨ Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
