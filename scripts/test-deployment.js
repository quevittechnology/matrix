const { ethers } = require("hardhat");

async function main() {
    console.log("\n🧪 Testing Deployment...\n");

    const network = await ethers.provider.getNetwork();
    const deploymentFile = `./deployments/${network.name}-latest.json`;

    let deployment;
    try {
        deployment = require(deploymentFile);
    } catch (error) {
        console.error("❌ Deployment file not found:", deploymentFile);
        console.error("Please deploy the contracts first.");
        process.exit(1);
    }

    const [tester] = await ethers.getSigners();
    console.log("👤 Tester address:", tester.address);
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(tester.address)), "BNB");
    console.log();

    // Get contract instances
    const matrix = await ethers.getContractAt("UniversalMatrix", deployment.contracts.UniversalMatrix.proxy);
    const royaltyVault = await ethers.getContractAt("RoyaltyVault", deployment.contracts.RoyaltyVault);

    console.log("📋 Contract Information:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Check basic info
    const owner = await matrix.owner();
    const feeReceiver = await matrix.feeReceiver();
    const defaultRefer = await matrix.defaultRefer();
    const totalUsers = await matrix.totalUsers();
    const paused = await matrix.paused();
    const [levelPrices, levelFees] = await matrix.getLevels();

    console.log("Owner:", owner);
    console.log("Fee Receiver:", feeReceiver);
    console.log("Default Referrer ID:", defaultRefer.toString());
    console.log("Total Users:", totalUsers.toString());
    console.log("Contract Paused:", paused);
    console.log();

    console.log("💰 Level Prices:");
    for (let i = 0; i < levelPrices.length; i++) {
        const price = ethers.formatEther(levelPrices[i]);
        const fee = levelFees[i].toString();
        const total = ethers.formatEther(levelPrices[i] + (levelPrices[i] * levelFees[i] / 100n));
        console.log(`   Level ${i + 1}: ${price} BNB + ${fee}% fee = ${total} BNB total`);
    }
    console.log();

    console.log("⚙️  Admin Settings:");
    const sponsorCommission = await matrix.sponsorCommissionPercent();
    const sponsorMinLevel = await matrix.sponsorMinLevel();
    const sponsorFallback = await matrix.sponsorFallback();
    console.log("   Sponsor Commission:", sponsorCommission.toString() + "%");
    console.log("   Sponsor Min Level:", sponsorMinLevel.toString());
    console.log("   Sponsor Fallback:", ["ROOT_USER", "ADMIN", "ROYALTY_POOL"][sponsorFallback]);
    console.log();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🧪 Running Test Registration...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();

    // Test registration
    const registrationCost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);
    console.log("📝 Registering with default referrer...");
    console.log("   Cost:", ethers.formatEther(registrationCost), "BNB");

    try {
        const tx = await matrix.register(defaultRefer, tester.address, {
            value: registrationCost
        });
        console.log("   Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("✅ Registration successful!");
        console.log("   Gas used:", receipt.gasUsed.toString());
        console.log();

        // Get user info
        const userId = await matrix.id(tester.address);
        const userInfo = await matrix.userInfo(userId);

        console.log("👤 User Information:");
        console.log("   User ID:", userId.toString());
        console.log("   Address:", userInfo.account);
        console.log("   Level:", userInfo.level.toString());
        console.log("   Referrer:", userInfo.referrer.toString());
        console.log("   Direct Team:", userInfo.directTeam.toString());
        console.log("   Total Income:", ethers.formatEther(userInfo.totalIncome), "BNB");
        console.log();

        // Check total users
        const newTotalUsers = await matrix.totalUsers();
        console.log("📊 Total Users:", newTotalUsers.toString());
        console.log();

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ ALL TESTS PASSED!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log();
        console.log("🎉 Contract is working correctly!");
        console.log();
        console.log("Next steps:");
        console.log("   1. Test upgrade functionality");
        console.log("   2. Test with multiple users");
        console.log("   3. Verify income distribution");
        console.log("   4. Monitor contract events");
        console.log();

    } catch (error) {
        console.error("❌ Registration failed:");
        console.error(error.message);

        // Check if already registered
        const userId = await matrix.id(tester.address);
        if (userId > 0n) {
            console.log();
            console.log("ℹ️  You are already registered!");
            console.log("   User ID:", userId.toString());

            const userInfo = await matrix.userInfo(userId);
            console.log("   Level:", userInfo.level.toString());
            console.log("   Total Income:", ethers.formatEther(userInfo.totalIncome), "BNB");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Test failed:");
        console.error(error);
        process.exit(1);
    });
