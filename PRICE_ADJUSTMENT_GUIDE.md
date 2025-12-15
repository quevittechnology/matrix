# Price Adjustment Calculator & Guide

## 💱 BNB/USDT Price Calculator

### Automatic Price Calculator Script

```javascript
// scripts/calculatePrices.js
const ethers = require("ethers");

/**
 * Calculate level prices in BNB based on current BNB/USDT rate
 * @param {number} bnbPriceUSD - Current BNB price in USD
 * @returns {Array} Array of 13 level prices in wei
 */
function calculateLevelPrices(bnbPriceUSD) {
    // Target USDT values for each level
    const usdtValues = [4, 6, 12, 24, 48, 96, 192, 384, 768, 1536, 3072, 6144, 12288];
    
    // Convert to BNB
    const bnbPrices = usdtValues.map(usdt => {
        const bnbAmount = usdt / bnbPriceUSD;
        return ethers.parseEther(bnbAmount.toFixed(18));
    });
    
    return bnbPrices;
}

/**
 * Display prices in human-readable format
 */
function displayPrices(bnbPriceUSD) {
    const prices = calculateLevelPrices(bnbPriceUSD);
    const usdtValues = [4, 6, 12, 24, 48, 96, 192, 384, 768, 1536, 3072, 6144, 12288];
    
    console.log(`\n📊 Level Prices at BNB = $${bnbPriceUSD}\n`);
    console.log("Level | USDT | BNB (formatted) | Wei");
    console.log("------|------|-----------------|----");
    
    for (let i = 0; i < 13; i++) {
        const bnbFormatted = ethers.formatEther(prices[i]);
        console.log(
            `${(i + 1).toString().padStart(2)} | ` +
            `$${usdtValues[i].toString().padStart(5)} | ` +
            `${bnbFormatted.padStart(15)} | ` +
            `${prices[i].toString()}`
        );
    }
    
    return prices;
}

/**
 * Generate update transaction data
 */
async function generateUpdateTx(bnbPriceUSD, contractAddress) {
    const prices = calculateLevelPrices(bnbPriceUSD);
    
    const UniversalMatrix = await ethers.getContractFactory("UniversalMatrix");
    const matrix = UniversalMatrix.attach(contractAddress);
    
    // Generate transaction
    const tx = await matrix.updateLevelPrices.populateTransaction(prices);
    
    console.log("\n🔧 Transaction Data:");
    console.log("To:", tx.to);
    console.log("Data:", tx.data);
    
    return tx;
}

// Example usage
const currentBnbPrice = 600; // Update this with current market price
displayPrices(currentBnbPrice);

module.exports = { calculateLevelPrices, displayPrices, generateUpdateTx };
```

---

## 📈 Price Adjustment Examples

### Example 1: BNB Price Increases

**Scenario:** BNB goes from $600 to $700

```
OLD PRICES (BNB = $600):
Level 1:  4 USDT = 0.006666 BNB
Level 5: 48 USDT = 0.080000 BNB
Level 13: 12288 USDT = 20.480000 BNB

NEW PRICES (BNB = $700):
Level 1:  4 USDT = 0.005714 BNB ⬇️
Level 5: 48 USDT = 0.068571 BNB ⬇️
Level 13: 12288 USDT = 17.554286 BNB ⬇️

IMPACT:
✅ Users pay LESS BNB (same USDT value)
✅ Maintains USDT-equivalent pricing
✅ Fair for new users
```

### Example 2: BNB Price Decreases

**Scenario:** BNB goes from $600 to $500

```
OLD PRICES (BNB = $600):
Level 1:  4 USDT = 0.006666 BNB
Level 5: 48 USDT = 0.080000 BNB
Level 13: 12288 USDT = 20.480000 BNB

NEW PRICES (BNB = $500):
Level 1:  4 USDT = 0.008000 BNB ⬆️
Level 5: 48 USDT = 0.096000 BNB ⬆️
Level 13: 12288 USDT = 24.576000 BNB ⬆️

IMPACT:
⚠️ Users pay MORE BNB (same USDT value)
✅ Maintains USDT-equivalent pricing
✅ Protects existing users' earnings
```

---

## 🎯 When to Adjust Prices

### Adjustment Triggers

**Immediate Adjustment (Within 24 hours):**
- BNB price changes > 20%
- Example: $600 → $750 or $600 → $480

**Planned Adjustment (Within 1 week):**
- BNB price changes 10-20%
- Example: $600 → $660 or $600 → $540

**Monitor Only (No action):**
- BNB price changes < 10%
- Example: $600 → $650 or $600 → $550

### Decision Matrix

| BNB Change | Action | Timeline | Announcement |
|------------|--------|----------|--------------|
| > 30% | 🔴 Urgent | 24 hours | Immediate |
| 20-30% | 🟠 High Priority | 48 hours | 24h advance |
| 10-20% | 🟡 Medium | 1 week | 48h advance |
| 5-10% | 🟢 Low | 2 weeks | 1 week advance |
| < 5% | ⚪ Monitor | No change | N/A |

---

## 📋 Price Update Procedure

### Step-by-Step Process

```
STEP 1: Monitor BNB Price
├─ Check CoinGecko/CoinMarketCap
├─ Calculate percentage change
└─ Determine if adjustment needed

STEP 2: Calculate New Prices
├─ Use calculator script
├─ Verify USDT equivalents
└─ Review impact on users

STEP 3: Community Announcement
├─ Announce on social media
├─ Explain reason for change
├─ Provide 24-48 hour notice
└─ Show old vs new prices

STEP 4: Prepare Transaction
├─ Generate price array
├─ Test on testnet (if possible)
├─ Prepare multi-sig transaction
└─ Get required signatures

STEP 5: Execute Update
├─ Call updateLevelPrices()
├─ Verify transaction success
├─ Check new prices on contract
└─ Monitor for issues

STEP 6: Post-Update
├─ Announce completion
├─ Update documentation
├─ Monitor user feedback
└─ Track new registrations
```

---

## 🔧 Implementation Examples

### Using Hardhat Script

```javascript
// scripts/updatePrices.js
const { ethers } = require("hardhat");
const { calculateLevelPrices } = require("./calculatePrices");

async function main() {
    // Get current BNB price (update manually or use oracle)
    const currentBnbPrice = 650; // USD
    
    // Calculate new prices
    const newPrices = calculateLevelPrices(currentBnbPrice);
    
    // Get contract
    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY;
    const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);
    
    // Display current prices
    console.log("\n📊 Current Prices:");
    const [currentPrices] = await matrix.getLevels();
    for (let i = 0; i < 13; i++) {
        console.log(`Level ${i + 1}: ${ethers.formatEther(currentPrices[i])} BNB`);
    }
    
    // Display new prices
    console.log("\n📊 New Prices (BNB = $" + currentBnbPrice + "):");
    for (let i = 0; i < 13; i++) {
        console.log(`Level ${i + 1}: ${ethers.formatEther(newPrices[i])} BNB`);
    }
    
    // Confirm update
    console.log("\n⚠️  Ready to update prices. Continue? (Ctrl+C to cancel)");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Update prices
    console.log("\n🔄 Updating prices...");
    const tx = await matrix.updateLevelPrices(newPrices);
    await tx.wait();
    
    console.log("✅ Prices updated!");
    console.log("Transaction:", tx.hash);
    
    // Verify
    const [updatedPrices] = await matrix.getLevels();
    console.log("\n✅ Verified New Prices:");
    for (let i = 0; i < 13; i++) {
        console.log(`Level ${i + 1}: ${ethers.formatEther(updatedPrices[i])} BNB`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

**Run:**
```bash
npx hardhat run scripts/updatePrices.js --network bsc
```

---

## 📊 Price Comparison Table

### Common BNB Prices

| BNB Price | Level 1 | Level 5 | Level 10 | Level 13 |
|-----------|---------|---------|----------|----------|
| $400 | 0.0100 | 0.1200 | 3.8400 | 30.7200 |
| $500 | 0.0080 | 0.0960 | 3.0720 | 24.5760 |
| **$600** | **0.0067** | **0.0800** | **2.5600** | **20.4800** |
| $700 | 0.0057 | 0.0686 | 2.1943 | 17.5543 |
| $800 | 0.0050 | 0.0600 | 1.9200 | 15.3600 |

---

## 🎯 Best Practices

### 1. Gradual Changes Only

**DO:**
✅ Adjust when BNB changes 10%+
✅ Update in single transaction
✅ Announce in advance

**DON'T:**
❌ Adjust for small fluctuations (<5%)
❌ Make multiple adjustments per week
❌ Surprise users with changes

### 2. Communication Template

```markdown
📢 PRICE ADJUSTMENT ANNOUNCEMENT

Dear Community,

We will be adjusting level prices in 48 hours to maintain 
USDT-equivalent values.

REASON: BNB price changed from $600 to $700 (+16.7%)

CHANGES:
- Level 1: 0.00667 → 0.00571 BNB (4 USDT)
- Level 5: 0.08000 → 0.06857 BNB (48 USDT)
- Level 13: 20.4800 → 17.5543 BNB (12,288 USDT)

IMPACT:
✅ USDT values remain the same
✅ New users pay less BNB
✅ Existing earnings unaffected

EFFECTIVE: [Date & Time]

Questions? Contact support.
```

### 3. Testing Checklist

Before updating on mainnet:

- [ ] Calculate prices correctly
- [ ] Verify USDT equivalents
- [ ] Test on testnet (if available)
- [ ] Get multi-sig approvals
- [ ] Announce to community
- [ ] Wait announcement period
- [ ] Execute transaction
- [ ] Verify on blockchain
- [ ] Monitor for issues
- [ ] Update documentation

---

## 🔍 Monitoring After Update

### Immediate Checks (0-1 hour)

```javascript
// Verify prices updated
const [prices] = await matrix.getLevels();
console.log("Level 1:", ethers.formatEther(prices[0]));

// Check for new registrations
const totalUsers = await matrix.totalUsers();
console.log("Total users:", totalUsers);

// Monitor events
matrix.on("Registered", (user, userId, referrer) => {
    console.log("New registration:", user);
});
```

### Short-term Monitoring (1-7 days)

- Registration rate changes
- User feedback
- Support tickets
- Community sentiment
- Transaction volume

### Long-term Tracking (7+ days)

- Growth trends
- Revenue impact
- User retention
- Market conditions
- Next adjustment timing

---

## 📈 Historical Price Tracking

### Recommended Log Format

```json
{
  "priceUpdates": [
    {
      "date": "2025-01-15",
      "bnbPrice": 600,
      "reason": "Initial deployment",
      "txHash": "0x...",
      "prices": [0.00667, 0.01, ...]
    },
    {
      "date": "2025-02-01",
      "bnbPrice": 700,
      "reason": "BNB +16.7% in 2 weeks",
      "txHash": "0x...",
      "prices": [0.00571, 0.00857, ...]
    }
  ]
}
```

---

## ⚠️ Important Warnings

### What NOT to Do

❌ **Don't adjust too frequently**
- Minimum 1 week between adjustments
- Users need stability

❌ **Don't change USDT equivalents**
- Always maintain: Level 1 = 4 USDT, etc.
- Only adjust BNB amounts

❌ **Don't surprise users**
- Always announce 24-48 hours in advance
- Explain reasoning clearly

❌ **Don't adjust for minor changes**
- Ignore fluctuations < 10%
- Wait for significant moves

---

## ✅ Summary

### Key Points

1. **Monitor BNB price** regularly
2. **Adjust when needed** (>10% change)
3. **Maintain USDT equivalents** always
4. **Announce in advance** (24-48 hours)
5. **Use calculator script** for accuracy
6. **Test before mainnet** if possible
7. **Verify after update** immediately
8. **Track changes** for records

### Quick Reference

```javascript
// Calculate prices
const prices = calculateLevelPrices(currentBnbPrice);

// Update contract
await matrix.updateLevelPrices(prices);

// Verify
const [newPrices] = await matrix.getLevels();
```

**Keep USDT values stable, adjust BNB amounts as needed!** 💱
