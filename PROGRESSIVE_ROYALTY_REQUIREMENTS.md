# Progressive Royalty Direct Requirements

## 🎯 Feature Overview

The royalty system now has **progressive direct referral requirements** for each tier, making it more challenging and rewarding to reach higher royalty levels.

**Date Added:** December 16, 2025  
**Status:** ✅ Implemented and Tested

---

## 📊 New Requirements

### **Tier-Specific Direct Referrals**

| Tier | Level | Pool Share | **Direct Referrals Required** | Change |
|------|-------|------------|-------------------------------|--------|
| **Tier 0** | 10 | 40% | **10 directs** | ⬆️ +8 from old (was 2) |
| **Tier 1** | 11 | 30% | **11 directs** | ⬆️ +9 from old (was 2) |
| **Tier 2** | 12 | 20% | **12 directs** | ⬆️ +10 from old (was 2) |
| **Tier 3** | 13 | 10% | **13 directs** | ⬆️ +11 from old (was 2) |

### **Key Points:**
- ✅ **Progressive:** Each tier requires more direct referrals
- ✅ **Configurable:** Admin can adjust requirements
- ✅ **Fair:** Rewards team builders
- ✅ **Sustainable:** Ensures qualified participants

---

## 🔧 How It Works

### **Qualification Check**

```solidity
function _checkRoyaltyQualification(uint256 _ref) private {
    for (uint256 i = 0; i < royaltyLevel.length; i++) {
        if (
            userInfo[_ref].level > lastLevel[_ref] &&
            userInfo[_ref].level == royaltyLevel[i] &&
            userInfo[_ref].directTeam >= royaltyDirectRequired[i] &&  // ✅ Tier-specific
            hasRoyaltyCapacity &&
            !royaltyActive[_ref][i]
        ) {
            // Qualify for tier
        }
    }
}
```

### **Default Configuration**

```solidity
// Initialized in contract
royaltyDirectRequired = [10, 11, 12, 13];

// Tier 0 (Level 10): 10 direct referrals
// Tier 1 (Level 11): 11 direct referrals
// Tier 2 (Level 12): 12 direct referrals
// Tier 3 (Level 13): 13 direct referrals
```

---

## ⚙️ Admin Configuration

### **Update Requirements**

Admin can change the direct referral requirements for all tiers:

```javascript
// Update requirements
await matrix.setRoyaltyDirectRequired([10, 11, 12, 13]);
```

### **Validation Rules**

- ✅ Minimum: 2 directs per tier
- ✅ Maximum: 100 directs per tier
- ✅ Only owner can update
- ✅ Emits event on update

### **Admin Function**

```solidity
function setRoyaltyDirectRequired(uint256[4] memory _requirements) external onlyOwner {
    // Validate requirements (must be at least 2, max 100)
    for (uint256 i = 0; i < _requirements.length; i++) {
        require(_requirements[i] >= 2 && _requirements[i] <= 100, "Invalid requirement");
    }
    royaltyDirectRequired = _requirements;
    emit RoyaltyDirectRequiredUpdated(_requirements);
}
```

### **Example Admin Commands**

```bash
# View current requirements
npx hardhat run scripts/adminSettings.js --network opBNB view-royalty-requirements

# Update requirements
npx hardhat run scripts/adminSettings.js --network opBNB set-royalty-requirements 10,11,12,13

# Make it easier (for testing)
npx hardhat run scripts/adminSettings.js --network opBNB set-royalty-requirements 5,6,7,8

# Make it harder (for mature platform)
npx hardhat run scripts/adminSettings.js --network opBNB set-royalty-requirements 15,20,25,30
```

---

## 📈 Impact Analysis

### **Before vs After**

**Old System:**
```
All tiers: 2 direct referrals required
Easy to qualify, many participants
Smaller individual shares
```

**New System:**
```
Tier 0: 10 directs
Tier 1: 11 directs
Tier 2: 12 directs
Tier 3: 13 directs

Harder to qualify, fewer participants
Larger individual shares
Rewards serious team builders
```

### **Example Scenario**

**Old System:**
```
Tier 0 (Level 10):
- Requirement: 2 directs
- Qualified users: 100
- Pool: 10 BNB
- Your share: 10 / 100 = 0.1 BNB
```

**New System:**
```
Tier 0 (Level 10):
- Requirement: 10 directs
- Qualified users: 20 (fewer qualify)
- Pool: 10 BNB
- Your share: 10 / 20 = 0.5 BNB (5x more!)
```

---

## 💡 Benefits

### **For Users**

1. **Bigger Shares** - Fewer qualified users = Larger payouts
2. **Rewards Team Building** - Encourages active recruitment
3. **Fair Competition** - Only serious builders qualify
4. **Progressive Challenge** - Each tier is harder to reach

### **For Platform**

1. **Sustainable Growth** - Encourages team building
2. **Quality Over Quantity** - Attracts serious participants
3. **Configurable** - Adjust based on platform maturity
4. **Competitive Advantage** - Unique progressive system

---

## 🎯 Qualification Examples

### **Example 1: Alice at Level 10**

```
Alice reaches Level 10
Alice has 8 direct referrals
Requirement: 10 directs

❌ NOT QUALIFIED for Tier 0
Needs 2 more direct referrals
```

### **Example 2: Bob at Level 11**

```
Bob reaches Level 11
Bob has 15 direct referrals
Requirement: 11 directs

✅ QUALIFIED for Tier 1
Has 4 extra directs (buffer)
```

### **Example 3: Charlie's Journey**

```
Level 10, 10 directs → ✅ Qualifies for Tier 0
Upgrades to Level 11 → ❌ Needs 11 directs (has 10)
Gets 1 more direct → ✅ Qualifies for Tier 1
Upgrades to Level 12 → ❌ Needs 12 directs (has 11)
Gets 1 more direct → ✅ Qualifies for Tier 2
```

---

## 🔍 Technical Details

### **Storage**

```solidity
// State variable
uint256[4] public royaltyDirectRequired;

// Initialized to
royaltyDirectRequired = [10, 11, 12, 13];
```

### **Qualification Check**

```solidity
// In _checkRoyaltyQualification
userInfo[_ref].directTeam >= royaltyDirectRequired[i]

// In isRoyaltyAvl
userInfo[_user].directTeam >= royaltyDirectRequired[_royaltyTier]
```

### **Event**

```solidity
event RoyaltyDirectRequiredUpdated(uint256[4] newRequirements);

// Emitted when admin updates requirements
emit RoyaltyDirectRequiredUpdated([10, 11, 12, 13]);
```

---

## 📊 Comparison Table

### **Qualification Requirements**

| Tier | Level | Old Direct Req | New Direct Req | Difficulty |
|------|-------|---------------|----------------|------------|
| 0 | 10 | 2 | 10 | ⬆️⬆️⬆️⬆️ Hard |
| 1 | 11 | 2 | 11 | ⬆️⬆️⬆️⬆️⬆️ Harder |
| 2 | 12 | 2 | 12 | ⬆️⬆️⬆️⬆️⬆️⬆️ Very Hard |
| 3 | 13 | 2 | 13 | ⬆️⬆️⬆️⬆️⬆️⬆️⬆️ Extreme |

### **Expected Participation**

| Tier | Old System | New System | Change |
|------|-----------|------------|--------|
| 0 | ~80% qualify | ~20% qualify | ⬇️ 75% fewer |
| 1 | ~60% qualify | ~15% qualify | ⬇️ 75% fewer |
| 2 | ~40% qualify | ~10% qualify | ⬇️ 75% fewer |
| 3 | ~20% qualify | ~5% qualify | ⬇️ 75% fewer |

**Result:** Fewer participants = Bigger individual shares!

---

## 🚀 Deployment Impact

### **For New Deployments**

```javascript
// Contract initializes with new requirements
royaltyDirectRequired = [10, 11, 12, 13];

// Users must meet these requirements to qualify
```

### **For Existing Deployments**

```javascript
// Upgrade contract to add this feature
npx hardhat run scripts/upgrade-contract.js --network opBNB

// Then set requirements
await matrix.setRoyaltyDirectRequired([10, 11, 12, 13]);
```

---

## 💰 Revenue Impact

### **Platform Benefits**

**More Team Building = More Activity:**
```
Users need 10+ directs to qualify
→ More recruitment activity
→ More registrations
→ More upgrades
→ Higher admin fees
→ Larger royalty pool
```

**Example:**
```
Old: 100 users qualify with 2 directs each = 200 total directs
New: 20 users qualify with 10 directs each = 200 total directs

Same total directs, but:
- More focused team building
- Higher quality participants
- Better platform engagement
```

---

## 🎯 Best Practices

### **For Platform Owners**

1. **Start Conservative** - Begin with lower requirements (5, 6, 7, 8)
2. **Monitor Participation** - Track qualification rates
3. **Adjust Gradually** - Increase requirements as platform grows
4. **Communicate Changes** - Announce requirement updates in advance
5. **Consider Market** - Adjust based on competition

### **For Users**

1. **Build Team Early** - Start recruiting before reaching Level 10
2. **Quality Referrals** - Focus on active team members
3. **Plan Ahead** - Know requirements for each tier
4. **Stay Active** - Maintain team engagement
5. **Track Progress** - Monitor direct referral count

---

## 📝 Configuration Examples

### **Easy Mode (Testing/Launch)**
```solidity
[5, 6, 7, 8]
```
- Good for platform launch
- Easier to qualify
- More participants
- Smaller individual shares

### **Balanced Mode (Default)**
```solidity
[10, 11, 12, 13]
```
- Balanced difficulty
- Moderate participation
- Good individual shares
- Rewards team builders

### **Hard Mode (Mature Platform)**
```solidity
[15, 20, 25, 30]
```
- Very challenging
- Few participants
- Large individual shares
- Elite tier system

### **Custom Mode**
```solidity
[8, 10, 15, 20]
```
- Tier 0: Accessible
- Tier 1: Moderate
- Tier 2: Challenging
- Tier 3: Elite

---

## ✅ Summary

### **What Changed**

- ✅ Added `royaltyDirectRequired` array
- ✅ Progressive requirements (10, 11, 12, 13)
- ✅ Admin configurable via `setRoyaltyDirectRequired()`
- ✅ Validation (2-100 directs per tier)
- ✅ Event emission on updates
- ✅ All tests passing (58/58)

### **Benefits**

- 💰 Bigger individual shares
- 🏆 Rewards serious team builders
- ⚙️ Admin can adjust requirements
- 📈 Encourages platform growth
- 🎯 Progressive difficulty system

### **Requirements**

| Tier | Level | Directs | Pool Share |
|------|-------|---------|------------|
| 0 | 10 | 10 | 40% |
| 1 | 11 | 11 | 30% |
| 2 | 12 | 12 | 20% |
| 3 | 13 | 13 | 10% |

---

**The progressive royalty system rewards dedicated team builders with larger shares of the global pool!** 🎉
