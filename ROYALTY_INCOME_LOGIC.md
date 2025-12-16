# Royalty Income Logic - Complete Guide

## 🎯 Overview

The royalty system is a **global profit-sharing pool** where qualified users share in the platform's success. It's designed to reward top performers who reach higher levels and build strong teams.

---

## 💰 Royalty Pool Structure

### **4 Tiers Based on Levels**

| Tier | Level Required | Pool Share | Description |
|------|---------------|------------|-------------|
| **Tier 0** | Level 10 | 40% | Highest tier |
| **Tier 1** | Level 11 | 30% | Second tier |
| **Tier 2** | Level 12 | 20% | Third tier |
| **Tier 3** | Level 13 | 10% | Top tier |

### **Pool Distribution**
```
Total Royalty Pool = 5% of all upgrades

Tier 0 (Level 10): 40% of pool
Tier 1 (Level 11): 30% of pool
Tier 2 (Level 12): 20% of pool
Tier 3 (Level 13): 10% of pool
```

---

## 📊 How Royalty is Collected

### **Source: User Upgrades**

Every time a user upgrades, **5% goes to the royalty pool**:

```solidity
// When user upgrades
uint256 royaltyAmt = (totalAmount * ROYALTY_PERCENT) / 100;  // 5%
_distributeRoyalty(royaltyAmt);
```

### **Distribution to Tiers**

```solidity
function _distributeRoyalty(uint256 royaltyAmt) private {
    uint256 curDay = getCurRoyaltyDay();
    
    // Tier 0 (Level 10): 40%
    royalty[curDay][0] += (royaltyAmt * 40) / 100;
    
    // Tier 1 (Level 11): 30%
    royalty[curDay][1] += (royaltyAmt * 30) / 100;
    
    // Tier 2 (Level 12): 20%
    royalty[curDay][2] += (royaltyAmt * 20) / 100;
    
    // Tier 3 (Level 13): 10%
    royalty[curDay][3] += (royaltyAmt * 10) / 100;
}
```

### **Example:**
```
User upgrades to Level 5 for 0.16 BNB
Royalty collected: 0.16 × 5% = 0.008 BNB

Distribution:
- Tier 0: 0.008 × 40% = 0.0032 BNB
- Tier 1: 0.008 × 30% = 0.0024 BNB
- Tier 2: 0.008 × 20% = 0.0016 BNB
- Tier 3: 0.008 × 10% = 0.0008 BNB
```

---

## ✅ Qualification Requirements

### **To Join Royalty Pool:**

1. **Reach Required Level**
   - Tier 0: Level 10
   - Tier 1: Level 11
   - Tier 2: Level 12
   - Tier 3: Level 13

2. **Have 2 Direct Referrals**
   - Must have exactly 2 direct team members
   - Checked at qualification time

3. **Not Reached ROI Cap**
   - Royalty income < 150% of total deposits
   - Cap applies to royalty income only

4. **Not Already Active in Tier**
   - Can only be in one tier at a time
   - Moving to higher tier removes from lower tier

### **Qualification Check:**

```solidity
function _checkRoyaltyQualification(uint256 _ref) private {
    for (uint256 i = 0; i < 4; i++) {  // Check all 4 tiers
        
        // Check ROI capacity
        bool hasRoyaltyCapacity = userInfo[_ref].royaltyIncome < 
            (userInfo[_ref].totalDeposit * 150) / 100;
        
        if (
            userInfo[_ref].level > lastLevel[_ref] &&        // Level increased
            userInfo[_ref].level == royaltyLevel[i] &&       // Matches tier level
            userInfo[_ref].directTeam == 2 &&                // Has 2 directs
            hasRoyaltyCapacity &&                            // Under ROI cap
            !royaltyActive[_ref][i]                          // Not already active
        ) {
            // Add to pending users for this tier
            pendingRoyaltyUsers[i][royaltyUsersIndex[i]].push(_ref);
            break;
        }
    }
}
```

---

## ⏰ Distribution Timeline

### **24-Hour Cycle**

The royalty system operates on a **24-hour cycle**:

```
Day 0: Royalty accumulates
Day 1: Users can claim Day 0 royalty
Day 2: Users can claim Day 1 royalty
...and so on
```

### **Royalty Day Calculation:**

```solidity
function getCurRoyaltyDay() public view returns (uint256) {
    return (block.timestamp - startTime) / 24 hours;
}
```

### **Example Timeline:**
```
Contract deployed: Jan 1, 00:00 UTC (Day 0)
Jan 1, 00:00 - Jan 2, 00:00: Day 0 accumulation
Jan 2, 00:00 onwards: Can claim Day 0 royalty
Jan 2, 00:00 - Jan 3, 00:00: Day 1 accumulation
Jan 3, 00:00 onwards: Can claim Day 1 royalty
```

---

## 💸 How to Claim Royalty

### **Claiming Process:**

1. **User calls `claimRoyalty(tierNumber)`**
2. **System checks eligibility**
3. **Calculates share**
4. **Transfers payment**
5. **Updates records**

### **Claim Function:**

```solidity
function claimRoyalty(uint256 _royaltyTier) external {
    require(!paused, "Contract paused");
    require(_royaltyTier < 4, "Invalid tier");
    
    uint256 userId = id[msg.sender];
    require(userId != 0, "Not registered");
    require(isRoyaltyAvl(userId, _royaltyTier), "Not eligible");
    
    // Check ROI cap
    if (userInfo[userId].royaltyIncome < 
        (userInfo[userId].totalDeposit * 150) / 100) {
        
        // Calculate share
        uint256 toDist = royalty[getCurRoyaltyDay() - 1][_royaltyTier] /
                        royaltyUsers[_royaltyTier];
        
        if (toDist > 0) {
            // Pay user
            payable(userInfo[userId].account).transfer(toDist);
            userInfo[userId].royaltyIncome += toDist;
            userInfo[userId].totalIncome += toDist;
            
            // Mark as claimed
            royaltyTaken[getCurRoyaltyDay()][userId] = true;
        }
    }
    
    // Remove if ROI cap reached
    if (userInfo[userId].royaltyIncome >= 
        (userInfo[userId].totalDeposit * 150) / 100) {
        royaltyUsers[_royaltyTier] -= 1;
        royaltyActive[userId][_royaltyTier] = false;
    }
}
```

---

## 🧮 Share Calculation

### **Equal Distribution Among Qualified Users**

```
Your Share = Total Pool for Tier / Number of Qualified Users
```

### **Example:**

**Tier 0 (Level 10):**
```
Total pool for day: 1 BNB
Qualified users: 50
Your share: 1 BNB / 50 = 0.02 BNB
```

**Tier 3 (Level 13):**
```
Total pool for day: 0.5 BNB
Qualified users: 10
Your share: 0.5 BNB / 10 = 0.05 BNB
```

### **Key Point:**
- **More users = Smaller individual share**
- **Fewer users = Larger individual share**
- **Higher tiers often have fewer users = Bigger shares**

---

## 🔄 Moving Between Tiers

### **Automatic Tier Upgrade**

When you reach a higher level, you're **automatically moved** to the higher tier:

```solidity
// Remove from lower tiers when moving up
if (_royaltyTier > 0) {
    for (uint256 j = 0; j < 4; j++) {
        if (royaltyActive[users[i]][j] && j != _royaltyTier) {
            royaltyUsers[j] -= 1;              // Remove from old tier
            royaltyActive[users[i]][j] = false;
        }
    }
}
```

### **Example:**
```
You're in Tier 0 (Level 10)
You upgrade to Level 11
→ Automatically moved to Tier 1
→ Removed from Tier 0
→ Now earning from Tier 1 pool (30% instead of 40%)
```

**Note:** Higher tiers get smaller pool % but often have fewer users!

---

## 🔒 ROI Cap (150%)

### **Sustainability Feature**

To prevent infinite payouts and ensure sustainability:

```
Maximum Royalty Income = 150% of Total Deposits
```

### **How It Works:**

```solidity
// Check before paying
if (userInfo[userId].royaltyIncome < 
    (userInfo[userId].totalDeposit * 150) / 100) {
    // Pay royalty
} else {
    // ROI cap reached, remove from pool
    royaltyActive[userId][_royaltyTier] = false;
}
```

### **Example:**

```
Total deposits: 10 BNB
ROI cap: 10 × 150% = 15 BNB

Royalty income so far: 14 BNB → ✅ Can still claim
Royalty income so far: 15 BNB → ❌ Cap reached, removed from pool
```

### **Important:**
- Cap applies to **royalty income only**
- Level income and referral income have **no cap**
- Once removed, you can re-qualify by making new deposits

---

## 📅 Pending Users System

### **Two-Step Process:**

1. **Qualification** → Added to pending list
2. **Daily Move** → Moved to active pool

### **Why Pending?**

Prevents users from qualifying and claiming immediately. Ensures fair distribution.

```solidity
// Step 1: User qualifies (on registration/upgrade)
pendingRoyaltyUsers[tier][index].push(userId);

// Step 2: Daily move (first claim of the day triggers this)
function movePendingRoyaltyUsers(uint256 _royaltyTier) public {
    uint256[] memory users = getPendingRoyaltyUsers(_royaltyTier);
    
    for (uint256 i = 0; i < users.length; i++) {
        // Activate user
        royaltyActive[users[i]][_royaltyTier] = true;
        royaltyUsers[_royaltyTier] += 1;
    }
    
    royaltyUsersIndex[_royaltyTier] += 1;  // Move to next batch
}
```

---

## 💡 Unclaimed Royalty Rollover

### **Automatic Rollover**

Unclaimed royalty from 2 days ago rolls over to yesterday:

```solidity
// Rollover unclaimed royalty
if (getCurRoyaltyDay() >= 2) {
    uint256 unclaimed = royalty[curDay - 2][tier] - royaltyDist[curDay - 2][tier];
    royalty[curDay - 1][tier] += unclaimed;
}
```

### **Example:**
```
Day 0: 10 BNB accumulated, 8 BNB claimed
Day 1: 12 BNB accumulated
Day 2: 2 BNB unclaimed from Day 0 rolls over to Day 1
       Day 1 now has: 12 + 2 = 14 BNB available
```

**Benefit:** No royalty is lost, increases future payouts!

---

## 📊 Complete Example

### **Scenario: Alice's Royalty Journey**

**Step 1: Qualification**
```
Alice reaches Level 10
Alice has 2 direct referrals
Alice's deposits: 5 BNB
Alice's royalty income: 0 BNB
ROI cap: 5 × 150% = 7.5 BNB

✅ Alice qualifies for Tier 0!
Added to pending users
```

**Step 2: Activation (Next Day)**
```
Someone claims royalty, triggering movePendingRoyaltyUsers()
Alice is moved from pending to active
royaltyActive[Alice][0] = true
royaltyUsers[0] += 1
```

**Step 3: Daily Accumulation**
```
Day 1: 100 users upgrade, generating 5 BNB royalty
Tier 0 gets: 5 × 40% = 2 BNB
Qualified users in Tier 0: 50
```

**Step 4: Claiming**
```
Day 2: Alice calls claimRoyalty(0)
Alice's share: 2 BNB / 50 = 0.04 BNB
Alice receives: 0.04 BNB
Alice's royalty income: 0.04 BNB
```

**Step 5: Continued Earnings**
```
Day 3: Pool = 3 BNB, Users = 50
Alice's share: 3 / 50 = 0.06 BNB
Alice's total royalty: 0.04 + 0.06 = 0.10 BNB

Day 4: Pool = 2.5 BNB, Users = 60
Alice's share: 2.5 / 60 = 0.0417 BNB
Alice's total royalty: 0.10 + 0.0417 = 0.1417 BNB

...continues until ROI cap (7.5 BNB) reached
```

**Step 6: Tier Upgrade**
```
Alice upgrades to Level 11
Automatically moved to Tier 1
Removed from Tier 0
Now earns from 30% pool instead of 40%
But Tier 1 has fewer users = potentially higher share!
```

---

## 🎯 Key Takeaways

### **How Royalty Works:**

1. ✅ **5% of all upgrades** go to royalty pool
2. ✅ **4 tiers** based on levels 10-13
3. ✅ **Pool split:** 40%, 30%, 20%, 10%
4. ✅ **Qualification:** Reach level + 2 direct referrals
5. ✅ **Distribution:** Equal share among qualified users
6. ✅ **Claiming:** Daily, manual claim required
7. ✅ **ROI Cap:** 150% of deposits (sustainable)
8. ✅ **Rollover:** Unclaimed funds roll forward

### **Benefits:**

- 💰 **Passive income** from global activity
- 📈 **Daily payouts** (if pool has funds)
- 🔄 **Automatic qualification** when you level up
- 🎁 **Bonus income** on top of level income
- 🔒 **Sustainable** with ROI cap

### **Requirements:**

- 🎯 Reach Level 10, 11, 12, or 13
- 👥 Have 2 direct referrals
- 💵 Stay under 150% ROI cap
- 🔔 Claim daily to receive

---

## 🚀 Maximizing Royalty Income

### **Tips:**

1. **Reach Higher Levels** - Unlock royalty tiers
2. **Build Team** - Get 2+ direct referrals
3. **Claim Daily** - Don't miss distributions
4. **Monitor Pool** - Check daily accumulation
5. **Upgrade Strategically** - Higher tiers may have fewer users
6. **Stay Active** - Keep deposits flowing to avoid cap

---

**The royalty system rewards top performers with a share of global success!** 🎉
