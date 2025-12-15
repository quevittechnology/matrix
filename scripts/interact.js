const { ethers } = require("hardhat");

async function main() {
    // Load contract addresses from environment or hardcode them
    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY || "YOUR_PROXY_ADDRESS";

    const [signer] = await ethers.getSigners();
    console.log("🔗 Interacting with account:", signer.address);
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "BNB\n");

    // Get contract instance
    const UniversalMatrix = await ethers.getContractFactory("UniversalMatrix");
    const matrix = UniversalMatrix.attach(PROXY_ADDRESS);

    console.log("📊 Universal Matrix Contract:", PROXY_ADDRESS, "\n");

    // Display contract info
    await displayContractInfo(matrix);

    // Uncomment the function you want to execute:

    // await registerUser(matrix, signer);
    // await upgradeUser(matrix, signer);
    // await claimRoyalty(matrix, signer);
    // await viewUserInfo(matrix, signer.address);
    // await viewMatrixStructure(matrix, userId);
}

async function displayContractInfo(matrix) {
    console.log("=".repeat(60));
    console.log("📋 CONTRACT INFORMATION");
    console.log("=".repeat(60));

    const totalUsers = await matrix.totalUsers();
    const paused = await matrix.paused();
    const [prices, fees] = await matrix.getLevels();

    console.log("Total Users:     ", totalUsers.toString());
    console.log("Contract Paused: ", paused);
    console.log("\n💵 Level Prices (BNB):");

    for (let i = 0; i < prices.length; i++) {
        const price = ethers.formatEther(prices[i]);
        const fee = fees[i];
        const total = ethers.formatEther(prices[i] * BigInt(100 + Number(fee)) / 100n);
        console.log(`  Level ${i + 1}: ${price} BNB (+ ${fee}% fee = ${total} BNB total)`);
    }
    console.log("=".repeat(60) + "\n");
}

async function registerUser(matrix, signer) {
    console.log("📝 Registering new user...");

    const referrerId = 17534; // Default referrer or specify another
    const newUserAddress = signer.address;

    const [prices, fees] = await matrix.getLevels();
    const levelPrice = prices[0];
    const fee = fees[0];
    const totalCost = levelPrice * BigInt(100 + Number(fee)) / 100n;

    console.log("Referrer ID:", referrerId);
    console.log("New User:", newUserAddress);
    console.log("Cost:", ethers.formatEther(totalCost), "BNB");

    const tx = await matrix.register(referrerId, newUserAddress, {
        value: totalCost
    });

    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ User registered! Gas used:", receipt.gasUsed.toString());

    // Get user ID from event
    const event = receipt.logs.find(log => {
        try {
            return matrix.interface.parseLog(log).name === "Registered";
        } catch (e) {
            return false;
        }
    });

    if (event) {
        const parsed = matrix.interface.parseLog(event);
        console.log("🆔 New User ID:", parsed.args.userId.toString());
    }
}

async function upgradeUser(matrix, signer) {
    console.log("⬆️  Upgrading user...");

    const userId = await matrix.id(signer.address);
    if (userId === 0n) {
        console.log("❌ User not registered");
        return;
    }

    const user = await matrix.userInfo(userId);
    const currentLevel = user.level;
    const levelsToUpgrade = 1; // Change this to upgrade multiple levels

    console.log("Current Level:", currentLevel.toString());
    console.log("Upgrading by:", levelsToUpgrade, "level(s)");

    const [prices, fees] = await matrix.getLevels();
    let totalCost = 0n;

    for (let i = Number(currentLevel); i < Number(currentLevel) + levelsToUpgrade; i++) {
        const levelPrice = prices[i];
        const fee = fees[i];
        totalCost += levelPrice * BigInt(100 + Number(fee)) / 100n;
    }

    console.log("Total Cost:", ethers.formatEther(totalCost), "BNB");

    const tx = await matrix.upgrade(userId, levelsToUpgrade, {
        value: totalCost
    });

    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Upgrade successful! Gas used:", receipt.gasUsed.toString());
}

async function claimRoyalty(matrix, signer) {
    console.log("💎 Claiming royalty...");

    const userId = await matrix.id(signer.address);
    if (userId === 0n) {
        console.log("❌ User not registered");
        return;
    }

    const royaltyTier = 0; // 0-3 for levels 10-13

    const isEligible = await matrix.isRoyaltyAvl(userId, royaltyTier);
    if (!isEligible) {
        console.log("❌ Not eligible for royalty tier", royaltyTier);
        return;
    }

    const tx = await matrix.claimRoyalty(royaltyTier);
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Royalty claimed! Gas used:", receipt.gasUsed.toString());
}

async function viewUserInfo(matrix, userAddress) {
    console.log("👤 User Information");
    console.log("=".repeat(60));

    const userId = await matrix.id(userAddress);
    if (userId === 0n) {
        console.log("❌ User not registered");
        return;
    }

    const user = await matrix.userInfo(userId);
    const levelIncome = await matrix.getLevelIncome(userId);

    console.log("Address:           ", user.account);
    console.log("User ID:           ", user.id.toString());
    console.log("Referrer ID:       ", user.referrer.toString());
    console.log("Upline ID:         ", user.upline.toString());
    console.log("Level:             ", user.level.toString());
    console.log("Direct Team:       ", user.directTeam.toString());
    console.log("Total Matrix Team: ", user.totalMatrixTeam.toString());
    console.log("Total Deposit:     ", ethers.formatEther(user.totalDeposit), "BNB");
    console.log("Total Income:      ", ethers.formatEther(user.totalIncome), "BNB");
    console.log("Referral Income:   ", ethers.formatEther(user.referralIncome), "BNB");
    console.log("Level Income:      ", ethers.formatEther(user.levelIncome), "BNB");
    console.log("Royalty Income:    ", ethers.formatEther(user.royaltyIncome), "BNB");

    console.log("\n📊 Income by Level:");
    for (let i = 0; i < levelIncome.length; i++) {
        if (levelIncome[i] > 0n) {
            console.log(`  Level ${i + 1}: ${ethers.formatEther(levelIncome[i])} BNB`);
        }
    }
    console.log("=".repeat(60));
}

async function viewMatrixStructure(matrix, userId) {
    console.log("🌳 Matrix Structure for User ID:", userId);
    console.log("=".repeat(60));

    const directs = await matrix.getMatrixDirect(userId);
    console.log("Direct positions:");
    console.log("  Left:  ", directs[0].toString() || "Empty");
    console.log("  Right: ", directs[1].toString() || "Empty");

    // View first 3 layers
    for (let layer = 0; layer < 3; layer++) {
        const users = await matrix.getMatrixUsers(userId, layer, 0, 10);
        if (users.length > 0) {
            console.log(`\nLayer ${layer + 1} (${users.length} users):`);
            users.forEach((user, idx) => {
                console.log(`  ${idx + 1}. ID: ${user.id.toString()}, Level: ${user.level.toString()}`);
            });
        }
    }
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
