# Admin Price Management Guide

## 🎯 Overview

As admin, you have full control over all 13 level prices. Prices are set in **BNB** and can be updated anytime to maintain USDT-equivalent values.

---

## 💰 Setting Level Prices

### **Initial Setup (After Deployment)**

Level prices are NOT set during deployment. You MUST set them manually after deploying.

**Step 1: Update environment variable**
```bash
# In .env file
MATRIX_ADDRESS=0xYourDeployedContractAddress
```

**Step 2: Run price setter script**
```bash
npx hardhat run scripts/setPrices.js --network bscTestnet
```

This will:
1. Calculate BNB amounts from USDT values
2. Call `updateLevelPrices()` function
3. Verify prices were set correctly

---

## 📊 Current Price Structure

### **USDT Equivalent Values**

| Level | USDT Value | BNB @ $600 | BNB @ $500 | BNB @ $700 |
|-------|------------|------------|------------|------------|
| 1 | 8 | 0.0133 | 0.0160 | 0.0114 |
| 2 | 12 | 0.0200 | 0.0240 | 0.0171 |
| 3 | 24 | 0.0400 | 0.0480 | 0.0343 |
| 4 | 48 | 0.0800 | 0.0960 | 0.0686 |
| 5 | 96 | 0.1600 | 0.1920 | 0.1371 |
| 6 | 192 | 0.3200 | 0.3840 | 0.2743 |
| 7 | 384 | 0.6400 | 0.7680 | 0.5486 |
| 8 | 768 | 1.2800 | 1.5360 | 1.0971 |
| 9 | 1,536 | 2.5600 | 3.0720 | 2.1943 |
| 10 | 3,072 | 5.1200 | 6.1440 | 4.3886 |
| 11 | 6,144 | 10.2400 | 12.2880 | 8.7771 |
| 12 | 12,288 | 20.4800 | 24.5760 | 17.5543 |
| 13 | 24,576 | 40.9600 | 49.1520 | 35.1086 |

---

## 🔧 Updating Prices

### **When to Update:**

1. **BNB price changes significantly** (>10%)
2. **Market volatility** requires adjustment
3. **Strategic pricing** decisions
4. **Competitive positioning**

### **How to Update:**

**Method 1: Using Script (Recommended)**

```javascript
// Edit scripts/setPrices.js
const BNB_PRICE_USD = 650; // Update current price
const usdtValues = [8, 12, 24, ...]; // Keep same or adjust

// Run script
npx hardhat run scripts/setPrices.js --network bscMainnet
```

**Method 2: Direct Contract Call**

```javascript
const prices = [
    ethers.parseEther("0.0123"), // Level 1
    ethers.parseEther("0.0185"), // Level 2
    // ... all 13 levels
];

await matrix.updateLevelPrices(prices);
```

**Method 3: Via Block Explorer**

1. Go to contract on BscScan
2. Connect wallet (owner)
3. Write Contract → `updateLevelPrices`
4. Enter array of 13 prices in wei
5. Execute transaction

---

## 📋 Price Calculation Formula

### **BNB Amount = USDT Value / BNB Price**

**Example:**
```
Level 5 = 96 USDT
BNB Price = $600
BNB Amount = 96 / 600 = 0.16 BNB
In Wei = 0.16 × 10^18 = 160000000000000000
```

### **JavaScript Helper:**

```javascript
function calculatePrice(usdtValue, bnbPriceUSD) {
    const bnbAmount = usdtValue / bnbPriceUSD;
    return ethers.parseEther(bnbAmount.toFixed(18));
}

// Usage
const level5Price = calculatePrice(96, 600);
// Returns: 160000000000000000 (0.16 BNB in wei)
```

---

## ⚠️ Important Considerations

### **1. Impact on Users**

**Price Increase:**
- Existing users: NOT affected (already paid)
- New users: Pay new higher prices
- May slow growth

**Price Decrease:**
- Existing users: NOT refunded
- New users: Pay new lower prices
- May accelerate growth

### **2. Timing**

**Best Time to Update:**
- During low activity periods
- After announcement to community
- Not during major promotions

**Avoid:**
- Mid-upgrade for users
- During high traffic
- Without prior notice

### **3. Communication**

**Always announce price changes:**
```
📢 PRICE UPDATE NOTICE

Effective: [Date/Time]
Reason: BNB price adjustment

New Prices:
Level 1: X BNB (was Y BNB)
...

All existing users unaffected.
```

---

## 🎯 Recommended Strategy

### **Stable USDT Equivalent**

**Goal:** Maintain consistent USDT value regardless of BNB price

**Process:**
1. Monitor BNB price daily
2. If change >10%, calculate new prices
3. Announce to community (24h notice)
4. Update prices
5. Verify and communicate

### **Example Workflow:**

```bash
# 1. Check current BNB price
curl "https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT"

# 2. Calculate new prices
node scripts/calculatePrices.js --bnb-price 650

# 3. Review output
# Level 1: 0.0123 BNB (~8 USDT)
# ...

# 4. Update if needed
npx hardhat run scripts/setPrices.js --network bscMainnet

# 5. Verify
npx hardhat run scripts/verifyPrices.js --network bscMainnet
```

---

## 📊 Price History Tracking

### **Keep Records:**

```json
{
  "priceUpdates": [
    {
      "date": "2025-01-15",
      "bnbPrice": 600,
      "level1": "0.0133",
      "reason": "Initial deployment"
    },
    {
      "date": "2025-02-01",
      "bnbPrice": 650,
      "level1": "0.0123",
      "reason": "BNB price increase adjustment"
    }
  ]
}
```

---

## ✅ Verification Checklist

After updating prices:

- [ ] All 13 prices set correctly
- [ ] Prices match intended USDT values
- [ ] Transaction confirmed on blockchain
- [ ] Verified via `getLevels()` function
- [ ] Community announcement sent
- [ ] Price history updated
- [ ] Test registration/upgrade works

---

## 🔐 Security Notes

1. **Only owner can update prices**
2. **Use multi-sig wallet** for mainnet
3. **Test on testnet first**
4. **Double-check all values** before executing
5. **Keep backup of old prices**

---

## 📞 Emergency Price Rollback

If prices set incorrectly:

```javascript
// Immediately call updateLevelPrices with correct values
const correctPrices = [...]; // Previous correct prices
await matrix.updateLevelPrices(correctPrices);
```

**No waiting period - can update anytime!**

---

**Admin has full control over pricing to maintain market competitiveness!** 🚀
