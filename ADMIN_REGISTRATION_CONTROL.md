# Complete Admin Price Control

## ✅ What Admin Controls

**ALL 13 levels are controlled by admin**, including:

### **Level 1 (Registration Cost)**
- This IS the registration cost
- Set via `updateLevelPrices()` array position [0]
- Users pay this to register

### **Levels 2-13 (Upgrade Costs)**
- All upgrade prices
- Set via `updateLevelPrices()` array positions [1-12]
- Users pay these to upgrade

---

## 💰 Setting All Prices (Including Registration)

### **Single Function Controls Everything:**

```javascript
// updateLevelPrices() sets ALL 13 prices
await matrix.updateLevelPrices([
    ethers.parseEther("0.0133"),  // Level 1 = REGISTRATION COST
    ethers.parseEther("0.0200"),  // Level 2
    ethers.parseEther("0.0400"),  // Level 3
    ethers.parseEther("0.0800"),  // Level 4
    ethers.parseEther("0.1600"),  // Level 5
    ethers.parseEther("0.3200"),  // Level 6
    ethers.parseEther("0.6400"),  // Level 7
    ethers.parseEther("1.2800"),  // Level 8
    ethers.parseEther("2.5600"),  // Level 9
    ethers.parseEther("5.1200"),  // Level 10
    ethers.parseEther("10.2400"), // Level 11
    ethers.parseEther("20.4800"), // Level 12
    ethers.parseEther("40.9600")  // Level 13
]);
```

---

## 📊 Price Structure

| Level | Type | USDT Value | BNB @ $600 | Admin Sets |
|-------|------|------------|------------|------------|
| **1** | **Registration** | **8** | **0.0133** | ✅ Yes |
| 2 | Upgrade | 12 | 0.0200 | ✅ Yes |
| 3 | Upgrade | 24 | 0.0400 | ✅ Yes |
| 4 | Upgrade | 48 | 0.0800 | ✅ Yes |
| 5 | Upgrade | 96 | 0.1600 | ✅ Yes |
| 6 | Upgrade | 192 | 0.3200 | ✅ Yes |
| 7 | Upgrade | 384 | 0.6400 | ✅ Yes |
| 8 | Upgrade | 768 | 1.2800 | ✅ Yes |
| 9 | Upgrade | 1,536 | 2.5600 | ✅ Yes |
| 10 | Upgrade | 3,072 | 5.1200 | ✅ Yes |
| 11 | Upgrade | 6,144 | 10.2400 | ✅ Yes |
| 12 | Upgrade | 12,288 | 20.4800 | ✅ Yes |
| 13 | Upgrade | 24,576 | 40.9600 | ✅ Yes |

**Admin controls 100% of pricing!**

---

## 🎯 How Registration Works

### **User Registration Process:**

```javascript
// 1. Get Level 1 price
const [prices, fees] = await matrix.getLevels();
const registrationPrice = prices[0]; // Level 1 price

// 2. Calculate total cost (price + 5% fee)
const adminFee = (registrationPrice * fees[0]) / 100n;
const totalCost = registrationPrice + adminFee;

// 3. User pays total cost
await matrix.register(sponsorId, userAddress, { value: totalCost });
```

### **What User Pays:**

```
Registration Cost = Level 1 Price + 5% Admin Fee

Example (Level 1 = 0.0133 BNB):
├─ Level 1 Price: 0.0133 BNB (8 USDT)
├─ Admin Fee (5%): 0.000665 BNB (0.4 USDT)
└─ Total: 0.013965 BNB (8.4 USDT)
```

---

## 🔧 Updating Registration Cost

### **Method 1: Update All Prices (Recommended)**

```javascript
// Update all 13 prices including registration
const usdtValues = [8, 12, 24, 48, ...]; // Change first value to change registration cost
const bnbPrice = 600;

const prices = usdtValues.map(usdt => 
    ethers.parseEther((usdt / bnbPrice).toFixed(18))
);

await matrix.updateLevelPrices(prices);
```

### **Method 2: Update Only Registration Cost**

```javascript
// Get current prices
const [currentPrices] = await matrix.getLevels();

// Change only Level 1 (registration)
currentPrices[0] = ethers.parseEther("0.0160"); // New registration cost

// Update all prices (must provide all 13)
await matrix.updateLevelPrices(currentPrices);
```

---

## 💡 Strategic Pricing

### **Registration Cost Strategies:**

**Low Registration ($5-10 USDT):**
- ✅ Easy entry
- ✅ More registrations
- ✅ Faster growth
- ❌ Lower initial revenue

**Medium Registration ($10-20 USDT):**
- ✅ Balanced approach
- ✅ Quality users
- ✅ Sustainable growth
- ✅ Good revenue

**High Registration ($20+ USDT):**
- ✅ Serious users only
- ✅ Higher revenue per user
- ❌ Slower growth
- ❌ Higher barrier

**Current: 8 USDT (Low-Medium)**
- Good balance for growth
- Accessible to most users
- Can be adjusted anytime

---

## 📋 Example Scenarios

### **Scenario 1: Lower Registration to Boost Growth**

```javascript
// Current: 8 USDT (0.0133 BNB @ $600)
// New: 5 USDT (0.0083 BNB @ $600)

const newPrices = [
    ethers.parseEther("0.0083"),  // Level 1: 5 USDT
    ethers.parseEther("0.0200"),  // Level 2: 12 USDT (unchanged)
    // ... rest unchanged
];

await matrix.updateLevelPrices(newPrices);
```

**Impact:**
- Registration cost: 8.4 → 5.25 USDT (-37%)
- More accessible
- Faster user acquisition

### **Scenario 2: Increase Registration for Premium Positioning**

```javascript
// Current: 8 USDT
// New: 15 USDT (0.025 BNB @ $600)

const newPrices = [
    ethers.parseEther("0.0250"),  // Level 1: 15 USDT
    ethers.parseEther("0.0300"),  // Level 2: 18 USDT (adjusted)
    // ... rest adjusted proportionally
];

await matrix.updateLevelPrices(newPrices);
```

**Impact:**
- Registration cost: 8.4 → 15.75 USDT (+87%)
- Premium positioning
- Higher quality users

---

## ✅ Summary

**Admin has COMPLETE control over:**

1. ✅ **Registration cost** (Level 1 price)
2. ✅ **All 13 upgrade costs** (Levels 2-13)
3. ✅ **Can update anytime**
4. ✅ **No restrictions**
5. ✅ **Single function** (`updateLevelPrices`)

**Registration cost = Level 1 price in the levelPrice array!**

---

## 🚀 Quick Reference

```javascript
// Get current registration cost
const [prices] = await matrix.getLevels();
const registrationCost = prices[0];

// Update registration cost
const newPrices = [...prices]; // Copy current
newPrices[0] = ethers.parseEther("0.0100"); // New registration
await matrix.updateLevelPrices(newPrices);

// Verify
const [updated] = await matrix.getLevels();
console.log("New registration:", ethers.formatEther(updated[0]), "BNB");
```

**Admin controls everything - including registration!** 🎯
