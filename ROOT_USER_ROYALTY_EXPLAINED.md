# 👑 How Root User Receives Royalty

## Special Root User Privileges

The **root user (defaultRefer)** has **special status** in the royalty system!

---

## 🎁 Root User Benefits

### 1️⃣ NO ROI Cap
```solidity
// Line 626: Root user unlimited royalty income
if (userId == defaultRefer || userInfo[userId].royaltyIncome < ...)
```

**All users:** 150% ROI cap on royalty  
**Root user:** ✅ **UNLIMITED** - no cap!

### 2️⃣ Always Qualifies
```solidity
// Line 595-596: Root user always has capacity
bool hasRoyaltyCapacity = (_ref == defaultRefer) || // Root unlimited
    (userInfo[_ref].royaltyIncome < ...)
```

Root user **never gets removed** from royalty pool!

### 3️⃣ Auto-Credited (No Manual Claim Needed!)
```solidity
// Lines 565-586: Automatic payment to root user
if (royaltyActive[defaultRefer][i]) {
    // Calculate root's share
    rootShare = tierAmount / royaltyUsers[i];
    
    // Transfer immediately (no claim needed)
    (bool success, ) = payable(userInfo[defaultRefer].account).call{value: rootShare}("");
    if (success) {
        userInfo[defaultRefer].royaltyIncome += rootShare;
        userInfo[defaultRefer].totalIncome += rootShare;
        // ...tracked automatically
    }
}
```

**Other users:** Must call `claimRoyalty()` manually  
**Root user:** ✅ **Auto-credited** every distribution cycle!

---

## 📊 How It Works

### Step 1: Funds Accumulate
```
Users register → 5% to royalty pool
Users upgrade → 5% to royalty pool
```

### Step 2: Distribution (_distributeRoyalty)
Every distribution cycle (default: 24 hours):

```
Royalty Pool: 1 BNB total
├─ Tier 1 (40%): 0.4 BNB
│  ├─ Root user (if qualified): Auto-credited immediately ✅
│  └─ Others: Wait for manual claim
├─ Tier 2 (30%): 0.3 BNB
├─ Tier 3 (20%): 0.2 BNB
└─ Tier 4 (10%): 0.1 BNB
```

### Step 3: Root Gets Share Automatically

**If root user qualifies for a tier:**
```javascript
// Calculated automatically
rootShare = tierAmount / numberOfUsersInTier;

// Sent immediately (no claim needed)
userInfo[defaultRefer].royaltyIncome += rootShare;
userInfo[defaultRefer].totalIncome += rootShare;
```

**Others must claim:**
```javascript
// Users must call this function
await contract.claimRoyalty(tierNumber);
```

---

## 🎯 Root User Qualification

Root user qualifies the **same way** asothers, but with advantages:

### Normal User
- ✅ Reach specific level (10, 11, 12, or 13)
- ✅ Have required directs (10, 11, 12, or 13)
- ✅ ROI < 150% cap
- ❌ Must claim manually

### Root User
- ✅ Reach specific level (10, 11, 12, or 13)  
- ✅ Have required directs (10, 11, 12, or 13)
- ✅ **NO ROI cap** (unlimited!)
- ✅ **Auto-credited** (no manual claim!)

---

## 💡 Example Scenario

### Setup
```
Royalty Pool for Tier 1: 1 BNB
Qualified Users in Tier 1: 5 (including root)
Root user is one of the 5
```

### Distribution
```
Each user's share: 1 BNB / 5 = 0.2 BNB

Root User:
✅ 0.2 BNB sent automatically
✅ Income tracked immediately
✅ No claim needed
✅ No ROI cap check

Other 4 Users:
❌ Must call claimRoyalty(0) 
❌ Subject to 150% ROI cap
❌ Manual action required
```

---

## 🔍 Code References

### Auto-Credit Logic (Lines 565-586)
```solidity
if (royaltyActive[defaultRefer][i]) {
    uint256 rootShare = 0;
    
    // Calculate root's share of this tier
    if (royaltyUsers[i] > 0) {
        rootShare = tierAmount / royaltyUsers[i];
    }
    
    // Credit root user immediately (safe transfer)
    (bool success, ) = payable(userInfo[defaultRefer].account)
 ## Root User Special Privileges

The **root user has 4 special privileges:**

### 1. **Auto-Credited** ✅
**Normal users:** Must manually call `claimRoyalty()` function  
**Root user:** Automatically credited during every distribution cycle (every 24 hours)

```solidity
// Lines 565-589 in contract
// Root user gets share automatically sent to wallet
if (royaltyActive[defaultRefer][i]) {
    rootShare = tierAmount / royaltyUsers[i];
    // Transfer immediately - no claim needed!
    payable(userInfo[defaultRefer].account).transfer(rootShare);
}
```

### 2. **No ROI Cap** ✅
**Normal users:** 150% ROI cap (configurable)  
**Root user:** **UNLIMITED** royalty income!

```solidity
// Line 626 - Root user bypasses ROI cap
if (userId == defaultRefer || userInfo[userId].royaltyIncome < roiCapLimit)
```

### 3. **Never Removed** ✅
**Normal users:** Removed from pool when ROI cap reached  
**Root user:** **Never removed** - stays active forever!

```solidity
// Lines 656-664 - Root user never removed
if (userId != defaultRefer && ...) {  // NOT defaultRefer!
    // Remove normal user
}
```

### 4. **Perpetual Accumulation** ✅
**NEW FEATURE:** If auto-transfer fails, funds accumulate forever!

```solidity
// Lines 584-587 - Accumulate on failure
if (!success) {
    rootUserPendingRoyalty[i] += rootShare; // NEVER expires!
    royaltyDist[curDay][i] += rootShare;
}
```

**Root user can claim accumulated funds anytime:**
```javascript
await matrix.claimRootRoyalty(0); // Claim tier 0
const pending = await matrix.getRootPendingRoyalty(); // View all tiers
```

---    .call{value: rootShare}("");
        
    if (success) {
        userInfo[defaultRefer].royaltyIncome += rootShare;
        userInfo[defaultRefer].totalIncome += rootShare;
        // Track in income history
        incomeInfo[defaultRefer].push(
            Income(defaultRefer, 0, rootShare, block.timestamp, false)
        );
        dayIncome[defaultRefer][getUserCurDay(defaultRefer)] += rootShare;
    }
    // If transfer fails, funds stay in pool for manual claim
}
```

### No ROI Cap Check (Line 626)
```solidity
// Root user bypasses ROI cap
if (userId == defaultRefer || userInfo[userId].royaltyIncome < roiCapLimit) {
    // Process payment
}
```

### Never Removed (Lines 656-664)
```solidity
// Remove from royalty pool if ROI cap reached
if (
    userId != defaultRefer && // Root user NEVER removed ✅
    royaltyActive[userId][_royaltyTier] &&
    userInfo[userId].royaltyIncome >= roiCapLimit
) {
    // Remove normal user
    royaltyUsers[_royaltyTier] -= 1;
    royaltyActive[userId][_royaltyTier] = false;
}
```

---

## ✅ Summary

### Root User Receives Royalty By:

1. **Qualification** - Reaching tier level + having required directs
2. **Automatic Distribution** - Funds sent immediately (no claim needed)
3. **No Limits** - Unlimited ROI potential
4. **Never Removed** - Always active in qualified tiers

### Key Differences from Normal Users:

| Feature | Normal Users | Root User |
|---------|--------------|-----------|
| **Claim** | Manual (`claimRoyalty()`) | ✅ Automatic |
| **ROI Cap** | 150% limit | ✅ Unlimited |
| **Removal** | Yes (when capped) | ✅ Never |
| **Payment** | On-demand | ✅ Auto-credited |

---

**The root user is a special privileged account with automatic royalty payments and no caps!** 👑
