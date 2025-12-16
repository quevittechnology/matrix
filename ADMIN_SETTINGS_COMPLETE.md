# Complete Admin Settings Guide

## 🎯 Overview

This guide covers **ALL** admin-configurable settings in the Universal Matrix contract. As the contract owner, you have complete control over these 10 key variables that govern the entire system.

---

## 📊 All Admin Settings Summary

| Setting | Variable Name | Default Value | Contract Function | Impact |
|---------|--------------|---------------|-------------------|--------|
| **Level Prices** | `levelPrice[13]` | Not set (must configure) | `updateLevelPrices()` | User registration & upgrade costs |
| **Admin Fee %** | `levelFeePercent[13]` | 5% (all levels) | ❌ Not configurable | Admin revenue per transaction |
| **Sponsor Commission %** | `sponsorCommissionPercent` | 5% | `setSponsorCommission()` | Direct sponsor earnings |
| **Sponsor Min Level** | `sponsorMinLevel` | 4 | `setSponsorMinLevel()` | Qualification for commission |
| **Sponsor Fallback** | `sponsorFallback` | ROOT_USER | `setSponsorFallback()` | Unqualified commission destination |
| **Royalty Percentages** | `royaltyPercent[4]` | [40, 30, 20, 10] | ❌ Not configurable | Tier distribution shares |
| **Royalty Levels** | `royaltyLevel[4]` | [10, 11, 12, 13] | ❌ Not configurable | Level requirements per tier |
| **Fee Receiver** | `feeReceiver` | Set at deployment | `setFeeReceiver()` | Admin fee destination |
| **Royalty Vault** | `royaltyVault` | Set at deployment | `setRoyaltyVault()` | Royalty pool contract |
| **Contract Paused** | `paused` | false | `setPaused()` | Emergency stop |

---

## 1️⃣ Level Prices Configuration

### **Variable:** `levelPrice[13]`

**Description:** BNB prices for all 13 levels (in wei)

**Default:** Not set - **MUST be configured after deployment**

**Target USDT Values:**
```javascript
Level 1:  8 USDT
Level 2:  12 USDT
Level 3:  24 USDT
Level 4:  48 USDT
Level 5:  96 USDT
Level 6:  192 USDT
Level 7:  384 USDT
Level 8:  768 USDT
Level 9:  1,536 USDT
Level 10: 3,072 USDT
Level 11: 6,144 USDT
Level 12: 12,288 USDT
Level 13: 24,576 USDT
```

### **How to Update:**

```javascript
// Function signature
function updateLevelPrices(uint256[13] memory _newPrices) external onlyOwner

// Example: Set prices for BNB = $600
const prices = [
    ethers.parseEther("0.0133"),  // Level 1: 8 USDT
    ethers.parseEther("0.0200"),  // Level 2: 12 USDT
    ethers.parseEther("0.0400"),  // Level 3: 24 USDT
    ethers.parseEther("0.0800"),  // Level 4: 48 USDT
    ethers.parseEther("0.1600"),  // Level 5: 96 USDT
    ethers.parseEther("0.3200"),  // Level 6: 192 USDT
    ethers.parseEther("0.6400"),  // Level 7: 384 USDT
    ethers.parseEther("1.2800"),  // Level 8: 768 USDT
    ethers.parseEther("2.5600"),  // Level 9: 1,536 USDT
    ethers.parseEther("5.1200"),  // Level 10: 3,072 USDT
    ethers.parseEther("10.2400"), // Level 11: 6,144 USDT
    ethers.parseEther("20.4800"), // Level 12: 12,288 USDT
    ethers.parseEther("40.9600")  // Level 13: 24,576 USDT
];

await matrix.updateLevelPrices(prices);
```

### **Using Script:**
```bash
npx hardhat run scripts/setPrices.js --network bscMainnet
```

### **When to Update:**
- BNB price changes >10%
- Market volatility requires adjustment
- Strategic pricing decisions

---

## 2️⃣ Sponsor Commission Percentage

### **Variable:** `sponsorCommissionPercent`

**Description:** Percentage of level income paid to direct sponsor

**Default:** 5%

**Range:** 0-100%

**How it Works:**
- When user earns level income, their direct sponsor gets X%
- Only if sponsor is at minimum level (default: Level 4+)
- If sponsor unqualified, uses fallback setting

### **How to Update:**

```javascript
// Function signature
function setSponsorCommission(uint256 _percent) external onlyOwner

// Example: Set to 7%
await matrix.setSponsorCommission(7);

// Example: Disable sponsor commission
await matrix.setSponsorCommission(0);
```

### **Impact Examples:**

| Commission % | User Earns | Sponsor Gets | User Keeps |
|-------------|-----------|--------------|------------|
| 0% | 0.16 BNB | 0 BNB | 0.16 BNB |
| 5% (default) | 0.16 BNB | 0.008 BNB | 0.152 BNB |
| 10% | 0.16 BNB | 0.016 BNB | 0.144 BNB |

---

## 3️⃣ Sponsor Minimum Level

### **Variable:** `sponsorMinLevel`

**Description:** Minimum level required to receive sponsor commission

**Default:** 4 (Level 4)

**Range:** 1-13

**How it Works:**
- Sponsor must be at this level or higher to receive commission
- If below this level, commission goes to fallback destination
- Encourages sponsors to upgrade

### **How to Update:**

```javascript
// Function signature
function setSponsorMinLevel(uint256 _level) external onlyOwner

// Example: Set to Level 5
await matrix.setSponsorMinLevel(5);

// Example: Allow all levels (Level 1+)
await matrix.setSponsorMinLevel(1);
```

### **Strategic Options:**

| Min Level | Effect |
|-----------|--------|
| 1 | All sponsors earn commission (high rewards) |
| 4 (default) | Balanced - sponsors must invest ~$200 |
| 5 | Higher barrier - sponsors must invest ~$400 |
| 10 | Very high barrier - only top earners |

---

## 4️⃣ Sponsor Fallback Destination

### **Variable:** `sponsorFallback`

**Description:** Where unqualified sponsor commissions go

**Default:** `ROOT_USER` (0)

**Options:**
- `0` = `ROOT_USER` - Send to root user (ID: 17534)
- `1` = `ADMIN` - Send to fee receiver address
- `2` = `ROYALTY_POOL` - Add to royalty distribution

### **How to Update:**

```javascript
// Function signature
function setSponsorFallback(SponsorFallback _fallback) external onlyOwner

// Example: Send to admin
await matrix.setSponsorFallback(1); // ADMIN

// Example: Send to royalty pool
await matrix.setSponsorFallback(2); // ROYALTY_POOL

// Example: Send to root user (default)
await matrix.setSponsorFallback(0); // ROOT_USER
```

### **Comparison:**

| Fallback | Pros | Cons |
|----------|------|------|
| **ROOT_USER** | Rewards root user, encourages early adoption | Root user gets very rich |
| **ADMIN** | Admin revenue increases | May seem unfair to users |
| **ROYALTY_POOL** | Benefits top performers | More complex distribution |

---

## 5️⃣ Fee Receiver Address

### **Variable:** `feeReceiver`

**Description:** Address that receives all admin fees (5% per transaction)

**Default:** Set during deployment

**How it Works:**
- All admin fees (5% of every registration/upgrade) sent here
- Can be changed anytime
- Should be secure wallet or multi-sig

### **How to Update:**

```javascript
// Function signature
function setFeeReceiver(address _feeReceiver) external onlyOwner

// Example: Change to new address
await matrix.setFeeReceiver("0x742d35Cc6634C0532925a3b844Bc9e7b8F3A");
```

### **Security Recommendations:**
- ✅ Use multi-sig wallet (Gnosis Safe)
- ✅ Use hardware wallet
- ✅ Verify address multiple times before updating
- ❌ Don't use exchange addresses
- ❌ Don't use hot wallets for large amounts

---

## 6️⃣ Royalty Vault Address

### **Variable:** `royaltyVault`

**Description:** Contract address that holds and distributes royalty pool

**Default:** Set during deployment

**How it Works:**
- 5% of all upgrades sent to this contract
- Distributed among Level 10-13 users
- Must implement `IRoyaltyVault` interface

### **How to Update:**

```javascript
// Function signature
function setRoyaltyVault(address _newVault) external onlyOwner

// Example: Upgrade to new vault
await matrix.setRoyaltyVault("0x9B2c4D7E...");
```

### **When to Update:**
- Upgrading vault contract
- Fixing bugs in vault
- Changing distribution logic

---

## 7️⃣ Contract Pause Status

### **Variable:** `paused`

**Description:** Emergency stop for all registrations and upgrades

**Default:** `false` (active)

**How it Works:**
- When `true`: No registrations or upgrades allowed
- When `false`: Normal operation
- Royalty claims still work when paused

### **How to Update:**

```javascript
// Function signature
function setPaused(bool _paused) external onlyOwner

// Example: Pause contract (emergency)
await matrix.setPaused(true);

// Example: Resume contract
await matrix.setPaused(false);
```

### **When to Pause:**
- 🚨 Security vulnerability discovered
- 🚨 Critical bug found
- 🚨 Suspicious activity detected
- 🚨 Major upgrade needed

---

## 8️⃣ Admin Fee Percentages (NOT CONFIGURABLE)

### **Variable:** `levelFeePercent[13]`

**Description:** Admin fee percentage for each level

**Value:** `[5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]` (all 5%)

**Status:** ⚠️ **HARDCODED - Cannot be changed**

**How it Works:**
- Set in `initialize()` function
- Cannot be updated after deployment
- Would require contract upgrade to change

### **Fee Breakdown:**

| Transaction Type | User Pays | Admin Gets | Distribution |
|-----------------|-----------|------------|--------------|
| **Registration (Level 1)** | 105% of level price | 5% | 95% to sponsor, 5% admin |
| **Upgrade (Levels 2-13)** | 105% of level price | 5% | 90% income, 5% admin, 5% royalty |

---

## 9️⃣ Royalty Percentages (NOT CONFIGURABLE)

### **Variable:** `royaltyPercent[4]`

**Description:** Distribution percentages for 4 royalty tiers

**Value:** `[40, 30, 20, 10]`

**Status:** ⚠️ **HARDCODED - Cannot be changed**

**How it Works:**
- Tier 1 (Level 10): Gets 40% of royalty pool
- Tier 2 (Level 11): Gets 30% of royalty pool
- Tier 3 (Level 12): Gets 20% of royalty pool
- Tier 4 (Level 13): Gets 10% of royalty pool

### **Distribution Example:**

If royalty pool = 10 BNB:
- Tier 1 users share: 4 BNB (40%)
- Tier 2 users share: 3 BNB (30%)
- Tier 3 users share: 2 BNB (20%)
- Tier 4 users share: 1 BNB (10%)

---

## 🔟 Royalty Level Requirements (NOT CONFIGURABLE)

### **Variable:** `royaltyLevel[4]`

**Description:** Level requirements for each royalty tier

**Value:** `[10, 11, 12, 13]`

**Status:** ⚠️ **HARDCODED - Cannot be changed**

**Requirements:**
- Tier 1: Must be Level 10 + 2 direct referrals
- Tier 2: Must be Level 11 + 2 direct referrals
- Tier 3: Must be Level 12 + 2 direct referrals
- Tier 4: Must be Level 13 + 2 direct referrals

---

## 🔧 Quick Reference: Admin Functions

### **All Available Functions:**

```solidity
// ✅ Configurable Settings
setPaused(bool _paused)
setSponsorCommission(uint256 _percent)
setSponsorMinLevel(uint256 _level)
setSponsorFallback(SponsorFallback _fallback)
setFeeReceiver(address _feeReceiver)
setRoyaltyVault(address _newVault)
updateLevelPrices(uint256[13] memory _newPrices)
emergencyWithdraw()

// ❌ Not Configurable (Hardcoded)
levelFeePercent[13] = [5,5,5,5,5,5,5,5,5,5,5,5,5]
royaltyPercent[4] = [40, 30, 20, 10]
royaltyLevel[4] = [10, 11, 12, 13]
```

---

## 📋 Complete Setup Checklist

After deploying contract, configure in this order:

### **Step 1: Set Level Prices** ⭐ CRITICAL
```bash
npx hardhat run scripts/setPrices.js --network bscMainnet
```

### **Step 2: Verify Fee Receiver**
```javascript
const feeReceiver = await matrix.feeReceiver();
console.log("Fee Receiver:", feeReceiver);
// If wrong, update: await matrix.setFeeReceiver(correctAddress);
```

### **Step 3: Verify Royalty Vault**
```javascript
const vault = await matrix.royaltyVault();
console.log("Royalty Vault:", vault);
// If wrong, update: await matrix.setRoyaltyVault(correctAddress);
```

### **Step 4: Configure Sponsor Commission (Optional)**
```javascript
// Default is 5%, Level 4+ - adjust if needed
await matrix.setSponsorCommission(5); // 5%
await matrix.setSponsorMinLevel(4);   // Level 4
await matrix.setSponsorFallback(0);   // ROOT_USER
```

### **Step 5: Test Registration**
```javascript
// Try registering a test user to verify all settings
```

---

## 🎯 Recommended Settings by Strategy

### **Conservative (Low Risk)**
```javascript
sponsorCommissionPercent: 3%
sponsorMinLevel: 5
sponsorFallback: ADMIN
```
- Lower commissions = more profit for users
- Higher level requirement = quality sponsors
- Admin fallback = predictable revenue

### **Balanced (Default)**
```javascript
sponsorCommissionPercent: 5%
sponsorMinLevel: 4
sponsorFallback: ROOT_USER
```
- Moderate commissions
- Reasonable level requirement
- Root user benefits

### **Aggressive (High Growth)**
```javascript
sponsorCommissionPercent: 10%
sponsorMinLevel: 1
sponsorFallback: ROYALTY_POOL
```
- High commissions = strong sponsor incentive
- Low barrier = anyone can earn
- Royalty pool = benefits top performers

---

## 🔐 Security Best Practices

### **Multi-Sig Wallet**
- Use Gnosis Safe for owner address
- Require 2-3 signatures for admin functions
- Keep backup signers

### **Price Updates**
- Always announce 24-48 hours in advance
- Test on testnet first
- Verify calculations multiple times
- Keep history of all price changes

### **Emergency Procedures**
```javascript
// If critical issue found:
await matrix.setPaused(true);  // Stop all activity
// Fix issue
// Test thoroughly
await matrix.setPaused(false); // Resume
```

### **Address Changes**
- Triple-check addresses before updating
- Use address checksums
- Test with small amount first
- Never use exchange addresses

---

## 📊 Monitoring Dashboard

### **Key Metrics to Track:**

```javascript
// Contract status
const paused = await matrix.paused();
const totalUsers = await matrix.totalUsers();

// Financial settings
const [prices, fees] = await matrix.getLevels();
const sponsorPercent = await matrix.sponsorCommissionPercent();
const sponsorMinLvl = await matrix.sponsorMinLevel();

// Addresses
const feeReceiver = await matrix.feeReceiver();
const royaltyVault = await matrix.royaltyVault();

// Royalty system
const tier1Users = await matrix.royaltyUsers(0);
const tier2Users = await matrix.royaltyUsers(1);
const tier3Users = await matrix.royaltyUsers(2);
const tier4Users = await matrix.royaltyUsers(3);
```

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't:**
- Update prices without announcement
- Change fee receiver to unverified address
- Pause contract without communication
- Set sponsor commission >20% (too high)
- Update settings during high traffic
- Forget to test on testnet first

✅ **Do:**
- Announce all changes in advance
- Verify addresses multiple times
- Test thoroughly before mainnet
- Keep detailed logs of all changes
- Use multi-sig for critical functions
- Monitor contract after changes

---

## 📞 Emergency Contacts

### **If Something Goes Wrong:**

1. **Pause Contract Immediately**
   ```javascript
   await matrix.setPaused(true);
   ```

2. **Emergency Withdraw** (if needed)
   ```javascript
   await matrix.emergencyWithdraw();
   ```

3. **Communicate with Users**
   - Post on social media
   - Update website
   - Send notifications

4. **Fix and Resume**
   - Identify issue
   - Deploy fix if needed
   - Test thoroughly
   - Resume operations

---

## 🚀 Summary

### **10 Admin Settings:**

| # | Setting | Configurable? | Function |
|---|---------|---------------|----------|
| 1 | Level Prices | ✅ Yes | `updateLevelPrices()` |
| 2 | Sponsor Commission % | ✅ Yes | `setSponsorCommission()` |
| 3 | Sponsor Min Level | ✅ Yes | `setSponsorMinLevel()` |
| 4 | Sponsor Fallback | ✅ Yes | `setSponsorFallback()` |
| 5 | Fee Receiver | ✅ Yes | `setFeeReceiver()` |
| 6 | Royalty Vault | ✅ Yes | `setRoyaltyVault()` |
| 7 | Contract Paused | ✅ Yes | `setPaused()` |
| 8 | Admin Fee % | ❌ No | Hardcoded: 5% |
| 9 | Royalty % | ❌ No | Hardcoded: [40,30,20,10] |
| 10 | Royalty Levels | ❌ No | Hardcoded: [10,11,12,13] |

**You have full control over the platform! 🎮**
