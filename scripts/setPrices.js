// Script to set level prices after deployment
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("Setting Universal Matrix Level Prices...\n");

    // Get contract address (update this after deployment)
    const MATRIX_ADDRESS = process.env.MATRIX_ADDRESS || "YOUR_DEPLOYED_CONTRACT_ADDRESS";

    // Get contract instance
    const UniversalMatrix = await ethers.getContractFactory("UniversalMatrix");
    const matrix = await UniversalMatrix.attach(MATRIX_ADDRESS);

    // Define level prices in BNB (wei)
    // These are example values - adjust based on current BNB/USDT rate
    const BNB_PRICE_USD = 600; // Current BNB price in USD

    // USDT equivalent values for each level
    const usdtValues = [8, 12, 24, 48, 96, 192, 384, 768, 1536, 3072, 6144, 12288, 24576];

    // Calculate BNB amounts
    const levelPrices = usdtValues.map(usdt => {
        const bnbAmount = usdt / BNB_PRICE_USD;
        return ethers.parseEther(bnbAmount.toFixed(18));
    });

    console.log("Level Prices (BNB @ $" + BNB_PRICE_USD + "):");
    console.log("=====================================");
    for (let i = 0; i < levelPrices.length; i++) {
        const bnb = ethers.formatEther(levelPrices[i]);
        console.log(`Level ${i + 1}: ${bnb} BNB (~${usdtValues[i]} USDT)`);
    }
    console.log("\n");

    // Update level prices
    console.log("Updating level prices on contract...");
    const tx = await matrix.updateLevelPrices(levelPrices);
    console.log("Transaction hash:", tx.hash);

    console.log("Waiting for confirmation...");
    await tx.wait();

    console.log("✅ Level prices updated successfully!\n");

    // Verify prices
    console.log("Verifying updated prices...");
    const [prices, fees] = await matrix.getLevels();

    console.log("\nVerified Prices:");
    console.log("================");
    for (let i = 0; i < prices.length; i++) {
        const bnb = ethers.formatEther(prices[i]);
        const fee = fees[i];
        const total = Number(bnb) * (1 + Number(fee) / 100);
        console.log(`Level ${i + 1}: ${bnb} BNB + ${fee}% fee = ${total.toFixed(6)} BNB total`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
