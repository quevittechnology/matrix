const { ethers } = require("hardhat");

/**
 * Admin Settings Management Script
 * View and update all admin-configurable settings
 */

async function main() {
    console.log("\n🔧 ADMIN SETTINGS MANAGER\n");
    console.log("=".repeat(60));

    // Get contract
    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY;
    if (!PROXY_ADDRESS) {
        console.error("❌ UNIVERSAL_MATRIX_PROXY not set in .env");
        process.exit(1);
    }

    const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);
    const [signer] = await ethers.getSigners();

    console.log(`\n📍 Contract: ${PROXY_ADDRESS}`);
    console.log(`👤 Admin: ${signer.address}\n`);

    // ========================================
    // 1. LEVEL PRICES
    // ========================================
    console.log("\n1️⃣  LEVEL PRICES");
    console.log("-".repeat(60));

    const [prices, fees] = await matrix.getLevels();
    const usdtValues = [8, 12, 24, 48, 96, 192, 384, 768, 1536, 3072, 6144, 12288, 24576];

    console.log("\nLevel | USDT Target | BNB Price | Admin Fee %");
    console.log("-".repeat(60));
    for (let i = 0; i < 13; i++) {
        const bnbPrice = ethers.formatEther(prices[i]);
        console.log(
            `${(i + 1).toString().padStart(2)}    | ` +
            `$${usdtValues[i].toString().padStart(6)}     | ` +
            `${bnbPrice.padStart(12)} | ` +
            `${fees[i]}%`
        );
    }

    // ========================================
    // 2. SPONSOR COMMISSION SETTINGS
    // ========================================
    console.log("\n\n2️⃣  SPONSOR COMMISSION");
    console.log("-".repeat(60));

    const sponsorPercent = await matrix.sponsorCommissionPercent();
    const sponsorMinLevel = await matrix.sponsorMinLevel();
    const sponsorFallback = await matrix.sponsorFallback();

    const fallbackNames = ["ROOT_USER", "ADMIN", "ROYALTY_POOL"];

    console.log(`Commission Percentage: ${sponsorPercent}%`);
    console.log(`Minimum Level: ${sponsorMinLevel}`);
    console.log(`Fallback Destination: ${fallbackNames[sponsorFallback]}`);

    // ========================================
    // 3. FEE RECEIVER & ROYALTY VAULT
    // ========================================
    console.log("\n\n3️⃣  ADDRESSES");
    console.log("-".repeat(60));

    const feeReceiver = await matrix.feeReceiver();
    const royaltyVault = await matrix.royaltyVault();

    console.log(`Fee Receiver: ${feeReceiver}`);
    console.log(`Royalty Vault: ${royaltyVault}`);

    // ========================================
    // 4. CONTRACT STATUS
    // ========================================
    console.log("\n\n4️⃣  CONTRACT STATUS");
    console.log("-".repeat(60));

    const paused = await matrix.paused();
    const totalUsers = await matrix.totalUsers();
    const defaultRefer = await matrix.defaultRefer();
    const contractBalance = await ethers.provider.getBalance(PROXY_ADDRESS);

    console.log(`Status: ${paused ? "⏸️  PAUSED" : "✅ ACTIVE"}`);
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Default Referrer ID: ${defaultRefer}`);
    console.log(`Contract Balance: ${ethers.formatEther(contractBalance)} BNB`);

    // ========================================
    // 5. ROYALTY SYSTEM (HARDCODED)
    // ========================================
    console.log("\n\n5️⃣  ROYALTY SYSTEM (Hardcoded)");
    console.log("-".repeat(60));

    const tier1Users = await matrix.royaltyUsers(0);
    const tier2Users = await matrix.royaltyUsers(1);
    const tier3Users = await matrix.royaltyUsers(2);
    const tier4Users = await matrix.royaltyUsers(3);

    console.log("\nTier | Level | Share % | Active Users");
    console.log("-".repeat(60));
    console.log(`  1  |  10   |   40%   | ${tier1Users}`);
    console.log(`  2  |  11   |   30%   | ${tier2Users}`);
    console.log(`  3  |  12   |   20%   | ${tier3Users}`);
    console.log(`  4  |  13   |   10%   | ${tier4Users}`);

    // ========================================
    // 6. CONSTANTS (HARDCODED)
    // ========================================
    console.log("\n\n6️⃣  SYSTEM CONSTANTS (Hardcoded)");
    console.log("-".repeat(60));

    const maxLevel = await matrix.MAX_LEVEL();
    const roiCap = await matrix.ROI_CAP_PERCENT();
    const incomeLayers = await matrix.INCOME_LAYERS();
    const directRequired = await matrix.DIRECT_REQUIRED();
    const royaltyPercent = await matrix.ROYALTY_PERCENT();

    console.log(`Max Level: ${maxLevel}`);
    console.log(`ROI Cap: ${roiCap}%`);
    console.log(`Income Layers: ${incomeLayers}`);
    console.log(`Direct Referrals Required: ${directRequired}`);
    console.log(`Royalty Percentage: ${royaltyPercent}%`);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ All settings displayed!\n");
}

/**
 * Update Level Prices
 */
async function updatePrices(bnbPriceUSD) {
    console.log(`\n💰 Updating prices for BNB = $${bnbPriceUSD}\n`);

    const usdtValues = [8, 12, 24, 48, 96, 192, 384, 768, 1536, 3072, 6144, 12288, 24576];
    const prices = usdtValues.map(usdt => {
        const bnbAmount = usdt / bnbPriceUSD;
        return ethers.parseEther(bnbAmount.toFixed(18));
    });

    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY;
    const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);

    console.log("Sending transaction...");
    const tx = await matrix.updateLevelPrices(prices);
    await tx.wait();

    console.log(`✅ Prices updated! TX: ${tx.hash}\n`);
}

/**
 * Update Sponsor Commission
 */
async function updateSponsorCommission(percent) {
    console.log(`\n📊 Setting sponsor commission to ${percent}%\n`);

    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY;
    const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);

    const tx = await matrix.setSponsorCommission(percent);
    await tx.wait();

    console.log(`✅ Sponsor commission updated! TX: ${tx.hash}\n`);
}

/**
 * Update Sponsor Min Level
 */
async function updateSponsorMinLevel(level) {
    console.log(`\n📈 Setting sponsor minimum level to ${level}\n`);

    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY;
    const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);

    const tx = await matrix.setSponsorMinLevel(level);
    await tx.wait();

    console.log(`✅ Sponsor min level updated! TX: ${tx.hash}\n`);
}

/**
 * Update Sponsor Fallback
 */
async function updateSponsorFallback(fallback) {
    const fallbackNames = ["ROOT_USER", "ADMIN", "ROYALTY_POOL"];
    console.log(`\n🔄 Setting sponsor fallback to ${fallbackNames[fallback]}\n`);

    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY;
    const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);

    const tx = await matrix.setSponsorFallback(fallback);
    await tx.wait();

    console.log(`✅ Sponsor fallback updated! TX: ${tx.hash}\n`);
}

/**
 * Pause/Unpause Contract
 */
async function setPaused(paused) {
    console.log(`\n${paused ? "⏸️  Pausing" : "▶️  Resuming"} contract\n`);

    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY;
    const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);

    const tx = await matrix.setPaused(paused);
    await tx.wait();

    console.log(`✅ Contract ${paused ? "paused" : "resumed"}! TX: ${tx.hash}\n`);
}

/**
 * Update Fee Receiver
 */
async function updateFeeReceiver(newAddress) {
    console.log(`\n💼 Updating fee receiver to ${newAddress}\n`);

    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY;
    const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);

    const tx = await matrix.setFeeReceiver(newAddress);
    await tx.wait();

    console.log(`✅ Fee receiver updated! TX: ${tx.hash}\n`);
}

/**
 * Update Royalty Vault
 */
async function updateRoyaltyVault(newAddress) {
    console.log(`\n🏦 Updating royalty vault to ${newAddress}\n`);

    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY;
    const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);

    const tx = await matrix.setRoyaltyVault(newAddress);
    await tx.wait();

    console.log(`✅ Royalty vault updated! TX: ${tx.hash}\n`);
}

/**
 * Emergency Withdraw
 */
async function emergencyWithdraw() {
    console.log(`\n🚨 EMERGENCY WITHDRAW\n`);

    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY;
    const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);

    const balance = await ethers.provider.getBalance(PROXY_ADDRESS);
    console.log(`Contract balance: ${ethers.formatEther(balance)} BNB`);
    console.log(`\n⚠️  Are you sure? This will withdraw ALL funds to owner.`);
    console.log(`Waiting 5 seconds... (Ctrl+C to cancel)\n`);

    await new Promise(resolve => setTimeout(resolve, 5000));

    const tx = await matrix.emergencyWithdraw();
    await tx.wait();

    console.log(`✅ Emergency withdraw complete! TX: ${tx.hash}\n`);
}

// ========================================
// CLI INTERFACE
// ========================================

if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case "view":
            main()
                .then(() => process.exit(0))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
            break;

        case "update-prices":
            const bnbPrice = parseFloat(args[1]);
            if (!bnbPrice) {
                console.error("Usage: npx hardhat run scripts/adminSettings.js update-prices <BNB_PRICE>");
                process.exit(1);
            }
            updatePrices(bnbPrice)
                .then(() => process.exit(0))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
            break;

        case "set-commission":
            const percent = parseInt(args[1]);
            if (percent === undefined) {
                console.error("Usage: npx hardhat run scripts/adminSettings.js set-commission <PERCENT>");
                process.exit(1);
            }
            updateSponsorCommission(percent)
                .then(() => process.exit(0))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
            break;

        case "set-min-level":
            const level = parseInt(args[1]);
            if (!level) {
                console.error("Usage: npx hardhat run scripts/adminSettings.js set-min-level <LEVEL>");
                process.exit(1);
            }
            updateSponsorMinLevel(level)
                .then(() => process.exit(0))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
            break;

        case "set-fallback":
            const fallback = parseInt(args[1]);
            if (fallback === undefined || fallback < 0 || fallback > 2) {
                console.error("Usage: npx hardhat run scripts/adminSettings.js set-fallback <0|1|2>");
                console.error("  0 = ROOT_USER");
                console.error("  1 = ADMIN");
                console.error("  2 = ROYALTY_POOL");
                process.exit(1);
            }
            updateSponsorFallback(fallback)
                .then(() => process.exit(0))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
            break;

        case "pause":
            setPaused(true)
                .then(() => process.exit(0))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
            break;

        case "resume":
            setPaused(false)
                .then(() => process.exit(0))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
            break;

        case "set-fee-receiver":
            const feeAddr = args[1];
            if (!feeAddr) {
                console.error("Usage: npx hardhat run scripts/adminSettings.js set-fee-receiver <ADDRESS>");
                process.exit(1);
            }
            updateFeeReceiver(feeAddr)
                .then(() => process.exit(0))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
            break;

        case "set-royalty-vault":
            const vaultAddr = args[1];
            if (!vaultAddr) {
                console.error("Usage: npx hardhat run scripts/adminSettings.js set-royalty-vault <ADDRESS>");
                process.exit(1);
            }
            updateRoyaltyVault(vaultAddr)
                .then(() => process.exit(0))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
            break;

        case "emergency-withdraw":
            emergencyWithdraw()
                .then(() => process.exit(0))
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
            break;

        default:
            console.log("\n🔧 ADMIN SETTINGS MANAGER - USAGE\n");
            console.log("View all settings:");
            console.log("  npx hardhat run scripts/adminSettings.js view --network <NETWORK>\n");
            console.log("Update settings:");
            console.log("  npx hardhat run scripts/adminSettings.js update-prices <BNB_PRICE> --network <NETWORK>");
            console.log("  npx hardhat run scripts/adminSettings.js set-commission <PERCENT> --network <NETWORK>");
            console.log("  npx hardhat run scripts/adminSettings.js set-min-level <LEVEL> --network <NETWORK>");
            console.log("  npx hardhat run scripts/adminSettings.js set-fallback <0|1|2> --network <NETWORK>");
            console.log("  npx hardhat run scripts/adminSettings.js pause --network <NETWORK>");
            console.log("  npx hardhat run scripts/adminSettings.js resume --network <NETWORK>");
            console.log("  npx hardhat run scripts/adminSettings.js set-fee-receiver <ADDRESS> --network <NETWORK>");
            console.log("  npx hardhat run scripts/adminSettings.js set-royalty-vault <ADDRESS> --network <NETWORK>");
            console.log("  npx hardhat run scripts/adminSettings.js emergency-withdraw --network <NETWORK>\n");
            process.exit(0);
    }
}

module.exports = {
    main,
    updatePrices,
    updateSponsorCommission,
    updateSponsorMinLevel,
    updateSponsorFallback,
    setPaused,
    updateFeeReceiver,
    updateRoyaltyVault,
    emergencyWithdraw
};
