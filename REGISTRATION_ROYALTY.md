# Registration Royalty Feature

## 🎯 Feature Overview

Added **configurable royalty on registration** to complement the existing upgrade royalty system. Admin can now set a percentage (0-100%) of registration fees that go to the royalty pool.

**Date Added:** December 16, 2025  
**Status:** ✅ Implemented and Tested  
**Default:** 5% royalty on registration

---

## 💰 How It Works

### **Registration Fee Distribution**

**Before (Old System):**
```
Registration Fee: 0.01 BNB + 5% admin fee = 0.0105 BNB total

Distribution:
- Sponsor: 0.01 BNB (100% of base fee)
- Admin: 0.0005 BNB (5% admin fee)
- Royalty: 0 BNB (no royalty on registration)
```

**After (New System with 5% Royalty):**
```
Registration Fee: 0.01 BNB + 5% admin fee = 0.0105 BNB total

Distribution:
- Royalty: 0.0005 BNB (5% of base fee)
- Sponsor: 0.0095 BNB (95% of base fee, remainder after royalty)
- Admin: 0.0005 BNB (5% admin fee, unchanged)
```

### **Key Changes:**

1. **Royalty First:** Royalty is calculated and deducted from base fee
2. **Sponsor Gets Remainder:** Sponsor receives base fee minus royalty
3. **Admin Fee Unchanged:** Admin fee remains separate (5%)
4. **Configurable:** Admin can adjust royalty percentage (0-100%)

---

## 🔧 Configuration

### **Default Settings**

```solidity
registrationRoyaltyPercent = 5; // 5% royalty on registration
```

### **Admin Function**

```solidity
function setRegistrationRoyalty(uint256 _percent) external onlyOwner {
    require(_percent <= 100, "Invalid percentage");
    registrationRoyaltyPercent = _percent;
    emit RegistrationRoyaltyUpdated(_percent);
}
```

### **Usage Examples**

```javascript
// View current setting
const royaltyPercent = await matrix.registrationRoyaltyPercent();
console.log("Registration Royalty:", royaltyPercent.toString() + "%");

// Set to 5% (default)
await matrix.setRegistrationRoyalty(5);

// Set to 10% (higher royalty)
await matrix.setRegistrationRoyalty(10);

// Set to 0% (no royalty on registration)
await matrix.setRegistrationRoyalty(0);

// Set to 3% (lower royalty)
await matrix.setRegistrationRoyalty(3);
```

---

## 📊 Impact Analysis

### **Royalty Pool Growth**

**Old System:**
```
100 registrations × 0 BNB royalty = 0 BNB to royalty pool
Only upgrades contribute to royalty
```

**New System (5% royalty):**
```
100 registrations × 0.0005 BNB royalty = 0.05 BNB to royalty pool
Both registrations AND upgrades contribute!
```

### **Sponsor Income**

**Old System:**
```
Sponsor receives: 0.01 BNB per referral (100%)
10 referrals = 0.1 BNB
```

**New System (5% royalty):**
```
Sponsor receives: 0.0095 BNB per referral (95%)
10 referrals = 0.095 BNB (-5%)
```

**Trade-off:** Sponsors earn slightly less, but royalty pool grows faster, benefiting all qualified users.

---

## 💡 Benefits

### **For Platform**

1. **Faster Royalty Growth** - Pool accumulates from day 1
2. **More Sustainable** - Continuous royalty funding
3. **Flexible Configuration** - Adjust based on platform needs
4. **Balanced Incentives** - Rewards both recruitment and team building

### **For Users**

1. **Bigger Royalty Pool** - More funds to distribute
2. **Earlier Payouts** - Pool grows from registrations
3. **Fair System** - Everyone contributes to pool
4. **Configurable** - Admin can adjust if needed

---

## 🎯 Configuration Scenarios

### **Scenario 1: No Registration Royalty (0%)**
```javascript
await matrix.setRegistrationRoyalty(0);

// Distribution per registration:
// - Sponsor: 0.01 BNB (100%)
// - Royalty: 0 BNB (0%)
// - Admin: 0.0005 BNB (5%)
```

**Use Case:** Maximize sponsor incentives during launch phase

### **Scenario 2: Low Registration Royalty (3%)**
```javascript
await matrix.setRegistrationRoyalty(3);

// Distribution per registration:
// - Sponsor: 0.0097 BNB (97%)
// - Royalty: 0.0003 BNB (3%)
// - Admin: 0.0005 BNB (5%)
```

**Use Case:** Balanced approach, good sponsor incentives

### **Scenario 3: Default Registration Royalty (5%)**
```javascript
await matrix.setRegistrationRoyalty(5);

// Distribution per registration:
// - Sponsor: 0.0095 BNB (95%)
// - Royalty: 0.0005 BNB (5%)
// - Admin: 0.0005 BNB (5%)
```

**Use Case:** Recommended default, balanced system

### **Scenario 4: High Registration Royalty (10%)**
```javascript
await matrix.setRegistrationRoyalty(10);

// Distribution per registration:
// - Sponsor: 0.009 BNB (90%)
// - Royalty: 0.001 BNB (10%)
// - Admin: 0.0005 BNB (5%)
```

**Use Case:** Mature platform, focus on royalty pool growth

---

## 📈 Royalty Pool Comparison

### **Example: 1000 Users Register**

**Old System (No Registration Royalty):**
```
Registrations contribute: 0 BNB
Only upgrades contribute to royalty
Pool grows slowly
```

**New System (5% Registration Royalty):**
```
Registrations contribute: 1000 × 0.0005 = 0.5 BNB
Plus upgrades contribute additional royalty
Pool grows faster from day 1!
```

**New System (10% Registration Royalty):**
```
Registrations contribute: 1000 × 0.001 = 1 BNB
Even faster pool growth
Bigger payouts for qualified users
```

---

## 🔄 Distribution Logic

### **Code Implementation**

```solidity
function register(uint256 _ref, address _newAcc) external payable {
    // ... validation ...
    
    if (user.referrer != defaultRefer) {
        // Calculate amounts
        uint256 royaltyAmount = (levelPrice[0] * registrationRoyaltyPercent) / 100;
        uint256 sponsorAmount = levelPrice[0] - royaltyAmount;
        
        // Pay sponsor (remainder after royalty)
        payable(userInfo[user.referrer].account).transfer(sponsorAmount);
        
        // Distribute royalty if configured
        if (royaltyAmount > 0) {
            _distributeRoyalty(royaltyAmount);
        }
    }
    
    // Send admin fee
    payable(feeReceiver).transfer(address(this).balance);
}
```

### **Royalty Distribution**

```solidity
function _distributeRoyalty(uint256 royaltyAmt) private {
    uint256 curDay = getCurRoyaltyDay();
    
    // Distribute to 4 tiers
    royalty[curDay][0] += (royaltyAmt * 40) / 100; // Tier 0: 40%
    royalty[curDay][1] += (royaltyAmt * 30) / 100; // Tier 1: 30%
    royalty[curDay][2] += (royaltyAmt * 20) / 100; // Tier 2: 20%
    royalty[curDay][3] += (royaltyAmt * 10) / 100; // Tier 3: 10%
}
```

---

## 📊 Example Calculations

### **Registration Fee: 0.01 BNB**

| Royalty % | Royalty Amount | Sponsor Amount | Admin Fee | Total |
|-----------|---------------|----------------|-----------|-------|
| 0% | 0 BNB | 0.01 BNB | 0.0005 BNB | 0.0105 BNB |
| 3% | 0.0003 BNB | 0.0097 BNB | 0.0005 BNB | 0.0105 BNB |
| 5% | 0.0005 BNB | 0.0095 BNB | 0.0005 BNB | 0.0105 BNB |
| 10% | 0.001 BNB | 0.009 BNB | 0.0005 BNB | 0.0105 BNB |
| 20% | 0.002 BNB | 0.008 BNB | 0.0005 BNB | 0.0105 BNB |

**Note:** Total paid by user remains constant (0.0105 BNB)

---

## 🎯 Recommended Settings

### **Launch Phase (0-1000 users)**
```javascript
await matrix.setRegistrationRoyalty(0); // or 3%
```
- Maximize sponsor incentives
- Encourage rapid growth
- Build initial user base

### **Growth Phase (1000-10000 users)**
```javascript
await matrix.setRegistrationRoyalty(5); // Default
```
- Balanced approach
- Good sponsor incentives
- Steady royalty pool growth

### **Mature Phase (10000+ users)**
```javascript
await matrix.setRegistrationRoyalty(7); // or 10%
```
- Focus on royalty pool
- Reward existing users
- Sustainable long-term model

---

## ✅ Summary

### **What Changed**

- ✅ Added `registrationRoyaltyPercent` state variable
- ✅ Initialized to 5% (default)
- ✅ Updated `register()` function to distribute royalty
- ✅ Added `setRegistrationRoyalty()` admin function
- ✅ Added `RegistrationRoyaltyUpdated` event
- ✅ All tests passing (58/58)

### **Key Features**

- 💰 Configurable 0-100% royalty on registration
- 🎯 Default 5% royalty
- ⚙️ Admin can adjust anytime
- 📊 Contributes to all 4 royalty tiers
- 🔔 Event emission on updates

### **Impact**

**Royalty Pool:**
- ⬆️ Grows faster (registrations + upgrades)
- ⬆️ Bigger payouts for qualified users
- ⬆️ More sustainable long-term

**Sponsors:**
- ⬇️ Slightly lower per-referral income
- ✅ Still strong incentives (95% vs 100%)
- ✅ Benefit from larger royalty pool if qualified

---

## 🚀 Deployment

### **New Deployments**

```javascript
// Contract initializes with 5% registration royalty
registrationRoyaltyPercent = 5;
```

### **Existing Deployments**

```javascript
// Upgrade contract
npx hardhat run scripts/upgrade-contract.js --network opBNB

// Set registration royalty
await matrix.setRegistrationRoyalty(5);
```

---

**Registration royalty creates a more balanced and sustainable income distribution system!** 🎉
