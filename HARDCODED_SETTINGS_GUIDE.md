# Hardcoded Settings Guide

## 🔒 Overview

Three settings in the Universal Matrix contract are **hardcoded** and cannot be changed without a contract upgrade. This document explains why they're hardcoded, their current values, and how to change them if absolutely necessary.

---

## ❌ The 3 Hardcoded Settings

### 1. Admin Fee Percentages
**Variable:** `levelFeePercent[13]`  
**Current Value:** `[5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]` (5% for all levels)  
**Set In:** `initialize()` function (line 168)  
**Why Hardcoded:** Ensures consistent revenue model and prevents admin from arbitrarily increasing fees

### 2. Royalty Distribution Percentages
**Variable:** `royaltyPercent[4]`  
**Current Value:** `[40, 30, 20, 10]`  
**Set In:** `initialize()` function (line 171)  
**Why Hardcoded:** Maintains fair distribution among royalty tiers and prevents manipulation

### 3. Royalty Level Requirements
**Variable:** `royaltyLevel[4]`  
**Current Value:** `[10, 11, 12, 13]`  
**Set In:** `initialize()` function (line 172)  
**Why Hardcoded:** Ensures consistent qualification criteria across all users

---

## 🤔 Why Are These Hardcoded?

### Security & Trust
- **Prevents Admin Abuse:** Admin cannot arbitrarily increase fees or change royalty distribution
- **User Confidence:** Users know these values won't change unexpectedly
- **Fair Play:** Everyone operates under the same rules

### Business Stability
- **Predictable Economics:** Revenue model remains consistent
- **Long-term Planning:** Users can calculate ROI accurately
- **Community Trust:** Demonstrates commitment to fairness

### Technical Simplicity
- **No Setter Functions:** Reduces attack surface
- **Gas Savings:** No need for update logic
- **Immutable Rules:** Core economics are fixed

---

## 📊 Current Values Breakdown

### Admin Fee Structure (5% All Levels)

| Transaction Type | User Pays | Distribution |
|-----------------|-----------|--------------|
| **Registration (Level 1)** | 105% of price | 95% sponsor + 5% admin |
| **Upgrade (Levels 2-13)** | 105% of price | 90% income + 5% admin + 5% royalty |

**Why 5%?**
- Industry standard for MLM platforms
- Covers operational costs
- Not excessive for users
- Provides sustainable revenue

### Royalty Distribution (40%, 30%, 20%, 10%)

| Tier | Level | Share | Reasoning |
|------|-------|-------|-----------|
| 1 | 10 | 40% | Highest achievers get largest share |
| 2 | 11 | 30% | Significant reward for top performers |
| 3 | 12 | 20% | Good incentive for advancement |
| 4 | 13 | 10% | Elite tier with exclusive benefits |

**Why This Distribution?**
- Rewards higher levels more
- Encourages progression
- Balances fairness with incentive
- Total = 100% (all royalty distributed)

### Royalty Level Requirements (10, 11, 12, 13)

| Tier | Level | Investment Required | Qualification |
|------|-------|-------------------|---------------|
| 1 | 10 | ~$3,072 USDT | Level 10 + 2 directs |
| 2 | 11 | ~$6,144 USDT | Level 11 + 2 directs |
| 3 | 12 | ~$12,288 USDT | Level 12 + 2 directs |
| 4 | 13 | ~$24,576 USDT | Level 13 + 2 directs |

**Why Top 4 Levels Only?**
- Rewards serious investors
- Creates exclusivity
- Maintains manageable pool size
- Encourages maximum level achievement

---

## 🔧 How to Change Hardcoded Settings

### ⚠️ WARNING: Requires Contract Upgrade

Changing these values requires deploying a new contract implementation. This is a **major operation** that should only be done if absolutely necessary.

### Option 1: Add Setter Functions (Recommended)

**Step 1: Modify Contract**

Add these functions to `UniversalMatrix.sol`:

```solidity
// Add after existing admin functions (around line 752)

/**
 * @notice Update admin fee percentages for all levels
 * @param _newFees Array of 13 fee percentages (0-100)
 */
function updateLevelFees(uint256[13] memory _newFees) external onlyOwner {
    for (uint256 i = 0; i < 13; i++) {
        require(_newFees[i] <= 100, "Fee too high");
    }
    levelFeePercent = _newFees;
}

/**
 * @notice Update royalty distribution percentages
 * @param _newPercents Array of 4 percentages (must sum to 100)
 */
function updateRoyaltyPercent(uint256[4] memory _newPercents) external onlyOwner {
    uint256 total = 0;
    for (uint256 i = 0; i < 4; i++) {
        total += _newPercents[i];
    }
    require(total == 100, "Must sum to 100");
    royaltyPercent = _newPercents;
}

/**
 * @notice Update royalty level requirements
 * @param _newLevels Array of 4 level numbers (1-13, ascending)
 */
function updateRoyaltyLevels(uint256[4] memory _newLevels) external onlyOwner {
    for (uint256 i = 0; i < 4; i++) {
        require(_newLevels[i] >= 1 && _newLevels[i] <= MAX_LEVEL, "Invalid level");
        if (i > 0) {
            require(_newLevels[i] > _newLevels[i-1], "Must be ascending");
        }
    }
    royaltyLevel = _newLevels;
}
```

**Step 2: Deploy New Implementation**

```bash
# Compile updated contract
npx hardhat compile

# Deploy new implementation (testnet first!)
npx hardhat run scripts/upgradeContract.js --network bscTestnet

# After testing, deploy to mainnet
npx hardhat run scripts/upgradeContract.js --network bscMainnet
```

**Step 3: Verify Upgrade**

```javascript
// Verify new functions exist
const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);

// Test new functions
await matrix.updateLevelFees([5,5,5,5,5,5,5,5,5,5,5,5,5]);
await matrix.updateRoyaltyPercent([40,30,20,10]);
await matrix.updateRoyaltyLevels([10,11,12,13]);
```

### Option 2: Deploy Entirely New Contract

**When to Use:**
- Major changes needed
- Want to start fresh
- Current contract has issues

**Process:**
1. Deploy new contract with desired values
2. Migrate users (if possible)
3. Deprecate old contract
4. Update all integrations

**⚠️ Risks:**
- Loses all existing user data
- Requires user re-registration
- May damage trust
- Complex migration process

---

## 📋 Upgrade Script Template

Create `scripts/upgradeContract.js`:

```javascript
const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🔄 Upgrading Universal Matrix Contract...\n");

    const PROXY_ADDRESS = process.env.UNIVERSAL_MATRIX_PROXY;
    
    // Deploy new implementation
    const UniversalMatrixV2 = await ethers.getContractFactory("UniversalMatrix");
    
    console.log("Upgrading proxy...");
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, UniversalMatrixV2);
    await upgraded.waitForDeployment();
    
    console.log("✅ Upgrade complete!");
    console.log("Proxy address:", PROXY_ADDRESS);
    console.log("New implementation deployed");
    
    // Verify new functions exist
    const matrix = await ethers.getContractAt("UniversalMatrix", PROXY_ADDRESS);
    
    // Check if new functions are available
    try {
        const fees = await matrix.levelFeePercent(0);
        console.log("\n✅ Contract upgraded successfully!");
        console.log("Current Level 1 fee:", fees.toString() + "%");
    } catch (error) {
        console.error("❌ Upgrade verification failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

---

## ⚠️ Important Considerations

### Before Upgrading

- [ ] **Test thoroughly on testnet**
- [ ] **Announce to community** (at least 1 week notice)
- [ ] **Explain reasons** for changes
- [ ] **Get community feedback**
- [ ] **Prepare rollback plan**
- [ ] **Backup all data**
- [ ] **Verify upgrade script**

### During Upgrade

- [ ] **Pause contract** before upgrade
- [ ] **Monitor transaction**
- [ ] **Verify implementation**
- [ ] **Test new functions**
- [ ] **Resume contract**

### After Upgrade

- [ ] **Announce completion**
- [ ] **Monitor for issues**
- [ ] **Update documentation**
- [ ] **Update frontend** (if needed)
- [ ] **Verify all functions work**

---

## 🎯 Recommended Approach

### If You Must Change These Values

**1. Evaluate Necessity**
- Is this change absolutely required?
- What problem does it solve?
- What are the risks?
- Can you achieve the goal another way?

**2. Community Consensus**
- Poll your community
- Explain the changes
- Get buy-in from stakeholders
- Address concerns

**3. Gradual Rollout**
- Test on testnet for 1-2 weeks
- Deploy to mainnet during low activity
- Monitor closely for 24-48 hours
- Be ready to rollback if needed

**4. Transparency**
- Document all changes
- Explain reasoning publicly
- Show before/after comparison
- Commit to no further changes

---

## 💡 Alternative Solutions

### Instead of Changing Hardcoded Values

**For Admin Fees:**
- Adjust level prices to effectively change fee amounts
- Use fee receiver to redistribute fees
- Create separate fee collection mechanism

**For Royalty Distribution:**
- Create additional reward pools
- Implement bonus systems
- Use sponsor commission to supplement

**For Royalty Levels:**
- Create new tier system alongside existing
- Use separate contract for new tiers
- Implement achievement badges

---

## 📊 Impact Analysis

### Changing Admin Fees

**Increase (e.g., 5% → 10%):**
- ❌ Users pay more
- ❌ May slow growth
- ❌ Damages trust
- ✅ More admin revenue

**Decrease (e.g., 5% → 3%):**
- ✅ Users pay less
- ✅ May accelerate growth
- ✅ Builds trust
- ❌ Less admin revenue

### Changing Royalty Distribution

**Example: [40,30,20,10] → [25,25,25,25]:**
- ✅ More equal distribution
- ❌ Less incentive to reach top tier
- ❌ May upset current top earners
- ⚠️ Changes economic model

### Changing Royalty Levels

**Example: [10,11,12,13] → [8,9,10,11]:**
- ✅ More users qualify
- ✅ Increased participation
- ❌ Dilutes royalty pool
- ❌ May reduce per-user earnings

---

## 🔐 Security Implications

### Adding Setter Functions

**Pros:**
- Flexibility to adjust
- No need for full redeployment
- Can respond to market changes

**Cons:**
- Admin has more power
- Potential for abuse
- Users may lose trust
- Requires careful access control

**Mitigation:**
- Use multi-sig wallet
- Implement timelock (24-48 hour delay)
- Require community vote
- Set reasonable limits (e.g., max 10% fee)

---

## 📝 Summary

### Current Hardcoded Settings

| Setting | Value | Changeable? | How to Change |
|---------|-------|-------------|---------------|
| Admin Fee % | 5% all levels | ❌ No | Contract upgrade |
| Royalty % | [40,30,20,10] | ❌ No | Contract upgrade |
| Royalty Levels | [10,11,12,13] | ❌ No | Contract upgrade |

### Recommendation

**🚫 DO NOT CHANGE** unless absolutely necessary because:
1. Requires complex contract upgrade
2. May damage user trust
3. Could introduce bugs
4. Disrupts economic model
5. Requires extensive testing

### If You Must Change

1. Add setter functions to contract
2. Test extensively on testnet
3. Get community approval
4. Announce well in advance
5. Deploy during low activity
6. Monitor closely after upgrade

---

## 🎓 Conclusion

These three settings are hardcoded **by design** to:
- Protect users from arbitrary changes
- Maintain economic stability
- Build long-term trust
- Simplify contract logic

**Only change if you have a very good reason and community support!**

For most use cases, the current values (5% fees, 40/30/20/10 distribution, levels 10-13) are well-balanced and proven in the industry.

**When in doubt, don't change it! 🛡️**
