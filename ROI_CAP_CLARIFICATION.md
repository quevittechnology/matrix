# ROI Cap Clarification

## ✅ What Has ROI Cap (150% by default)

**ONLY Royalty Income** - Income from the royalty pool

## ❌ What Does NOT Have ROI Cap

1. **Referral Income** - From new user registrations (unlimited)
2. **Sponsor Commission** - From downline upgrades (unlimited) 
3. **Level Income** - From upgrade distributions (unlimited)

## 📊 Current Implementation

### Royalty Income (HAS Cap)
```solidity
// Line 595-597: ROI cap check for royalty qualification
bool hasRoyaltyCapacity = (_ref == defaultRefer) || // Root unlimited
    (userInfo[_ref].royaltyIncome < 
    (userInfo[_ref].totalDeposit * roiCapPercent) / 100);

// Line 626: ROI cap check when claiming royalty
if (userId == defaultRefer || 
    userInfo[userId].royaltyIncome < (userInfo[userId].totalDeposit * roiCapPercent) / 100)
```

### Referral Income (NO Cap) ✅
```solidity
// Line 327-334: Direct payment, no ROI check
payable(userInfo[user.referrer].account).transfer(sponsorAmount);
userInfo[user.referrer].totalIncome += sponsorAmount;
userInfo[user.referrer].referralIncome += sponsorAmount;
// No ROI cap check!
```

### Sponsor Commission (NO Cap) ✅
```solidity
// Line 488-491: Direct payment, no ROI check
payable(userInfo[sponsor].account).transfer(sponsorCommission);
userInfo[sponsor].totalIncome += sponsorCommission;
sponsorIncome[sponsor] += sponsorCommission;
// No ROI cap check!
```

### Level Income (NO ROI Cap, but HAS Layer Limit) ✅
```solidity
// Line 469-476: Direct payment, no ROI check  
payable(userInfo[_recipient].account).transfer(incomeAmount);
userInfo[_recipient].totalIncome += incomeAmount;
userInfo[_recipient].levelIncome += incomeAmount;
// No ROI cap check!
// But LIMITED to incomeLayers (default 13, configurable 5-50)
```

## 🎯 Summary

## 🎯 Summary

| Income Type | ROI Cap? | Layer Limit? | Notes |
|-------------|----------|--------------|-------|
| **Royalty** | ✅ YES (150%) | ❌ None | Only income type with ROI cap |
| **Level Income** | ❌ NO | ✅ YES (13 layers) | Configurable via `setIncomeLayers` (5-50) |
| **Sponsor Commission** | ❌ NO | ✅ **Configurable** (default 0 = unlimited) | `setSponsorCommissionLayers` (0-50) |
| **Referral** | ❌ NO | ❌ None | Direct payment on registration |

**Key Points:**
- ✅ ROI cap (150%) = ONLY royalty income  
- ✅ Layer limit (13) = Level income distribution only
- ✅ Sponsor commission = **Configurable** (0 = unlimited, >0 = limited)
- ✅ Referral income = No limits at all (direct payment)

**Sponsor Commission Layer Configuration:**
```javascript
// Default: Unlimited
await matrix.sponsorCommissionLayers(); // Returns 0

// Set to match income layers
await matrix.setSponsorCommissionLayers(13);

// Set to unlimited
await matrix.setSponsorCommissionLayers(0);
```

**Current implementation is CORRECT** ✅
