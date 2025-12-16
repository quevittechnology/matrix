const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔗 Oracle Configuration Script\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Get deployed contract address from latest deployment
    const fs = require("fs");
    const path = require("path");

    const network = await ethers.provider.getNetwork();
    const deploymentFile = path.join(__dirname, "..", "deployments", `${network.name}-latest.json`);

    let matrixAddress;
    if (fs.existsSync(deploymentFile)) {
        const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
        matrixAddress = deployment.contracts.UniversalMatrix.proxy;
        console.log("📍 Found deployed contract:", matrixAddress);
    } else {
        console.log("⚠️  No deployment found. Please enter contract address:");
        matrixAddress = process.env.MATRIX_ADDRESS;
        if (!matrixAddress) {
            throw new Error("Please set MATRIX_ADDRESS in .env or deploy first");
        }
    }

    const matrix = await ethers.getContractAt("UniversalMatrix", matrixAddress);
    const [admin] = await ethers.getSigners();

    console.log("Admin:", admin.address);
    console.log();

    // Chainlink BNB/USD Price Feed Addresses
    const PRICE_FEEDS = {
        // opBNB Testnet (Chain ID: 5611)
        "opbnb-testnet": "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7", // Example - verify on Chainlink
        // opBNB Mainnet (Chain ID: 204)
        "opbnb": "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE" // Example - verify on Chainlink
    };

    const priceFeedAddress = PRICE_FEEDS[network.name] || process.env.PRICE_FEED_ADDRESS;

    if (!priceFeedAddress) {
        console.log("❌ No price feed address found for network:", network.name);
        console.log("Please set PRICE_FEED_ADDRESS in .env or update PRICE_FEEDS in this script");
        process.exit(1);
    }

    console.log("🔗 Configuring Oracle...\n");

    // Step 1: Set Price Feed
    console.log("1️⃣  Setting Chainlink price feed...");
    console.log("   Address:", priceFeedAddress);
    let tx = await matrix.setPriceFeed(priceFeedAddress);
    await tx.wait();
    console.log("   ✅ Price feed set!\n");

    // Step 2: Set USD Target Prices (in cents)
    console.log("2️⃣  Setting USD target prices...");
    const usdPrices = [
        1000,   // Level 1:  $10.00
        2000,   // Level 2:  $20.00
        3000,   // Level 3:  $30.00
        5000,   // Level 4:  $50.00
        8000,   // Level 5:  $80.00
        13000,  // Level 6:  $130.00
        21000,  // Level 7:  $210.00
        34000,  // Level 8:  $340.00
        55000,  // Level 9:  $550.00
        89000,  // Level 10: $890.00
        144000, // Level 11: $1,440.00
        233000, // Level 12: $2,330.00
        377000  // Level 13: $3,770.00
    ];

    console.log("   Level 1:  $10   → Level 7:  $210   → Level 13: $3,770");
    tx = await matrix.setLevelPricesUSD(usdPrices);
    await tx.wait();
    console.log("   ✅ USD prices set!\n");

    // Step 3: Set Price Validity Period (7 days)
    console.log("3️⃣  Setting price validity period...");
    const validityPeriod = 7 * 24 * 60 * 60; // 7 days in seconds
    tx = await matrix.setPriceValidityPeriod(validityPeriod);
    await tx.wait();
    console.log("   Validity: 7 days (604,800 seconds)");
    console.log("   ✅ Validity period set!\n");

    // Step 4: Fetch Initial Price from Oracle
    console.log("4️⃣  Fetching initial BNB price from oracle...");
    try {
        tx = await matrix.forceUpdateBNBPrice();
        await tx.wait();

        const cachedPrice = await matrix.cachedBNBPrice();
        const bnbPrice = Number(cachedPrice) / 1e8;

        console.log("   BNB/USD Price:", bnbPrice.toFixed(2), "USD");
        console.log("   ✅ Initial price cached!\n");
    } catch (error) {
        console.log("   ⚠️  Could not fetch price:", error.message);
        console.log("   (You can update manually later with forceUpdateBNBPrice)\n");
    }

    // Step 5: Enable Oracle
    console.log("5️⃣  Enabling USD-stable pricing...");
    tx = await matrix.setUseOracle(true);
    await tx.wait();
    console.log("   ✅ Oracle enabled!\n");

    // Verification
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Oracle Configuration Complete!\n");

    const oracleEnabled = await matrix.useOracle();
    const currentPrice = await matrix.cachedBNBPrice();
    const lastUpdate = await matrix.lastPriceUpdate();
    const validity = await matrix.priceValidityPeriod();

    console.log("📊 Current Configuration:");
    console.log("   Oracle Status:", oracleEnabled ? "✅ ENABLED" : "❌ DISABLED");
    console.log("   BNB Price:", (Number(currentPrice) / 1e8).toFixed(2), "USD");
    console.log("   Last Update:", new Date(Number(lastUpdate) * 1000).toLocaleString());
    console.log("   Validity Period:", Number(validity) / 86400, "days");
    console.log();

    console.log("💡 Next Steps:");
    console.log("   1. Test registration to verify dynamic pricing");
    console.log("   2. Price will auto-refresh every 7 days");
    console.log("   3. Admin can force update anytime: forceUpdateBNBPrice()");
    console.log("   4. Can disable oracle anytime: setUseOracle(false)");
    console.log();
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Configuration failed:");
        console.error(error);
        process.exit(1);
    });
