# Royalty System - Complete Guide

## 🎯 Overview

The Royalty System is a **passive income mechanism** where 5% of all upgrade payments are pooled and distributed daily among qualified users based on their level tier.

---

## 💎 4-Tier Structure

### Tier Distribution

| Tier | Level Required | Pool Share | Daily Distribution |
|------|----------------|------------|-------------------|
| **Tier 1** | Level 10 | 40% | Highest share |
| **Tier 2** | Level 11 | 30% | Second highest |
| **Tier 3** | Level 12 | 20% | Third highest |
| **Tier 4** | Level 13 | 10% | Exclusive top tier |

### Pool Accumulation

**Source:** 5% of every upgrade payment (Levels 2-13)

**Example Daily Accumulation:**
```
100 users upgrade to various levels
Total upgrade value: 50,000 USDT
Royalty pool: 50,000 × 5% = 2,500 USDT

Distribution:
├─ Tier 1 (40%): 1,000 USDT → Level 10 users
├─ Tier 2 (30%): 750 USDT → Level 11 users
├─ Tier 3 (20%): 500 USDT → Level 12 users
└─ Tier 4 (10%): 250 USDT → Level 13 users
```

---

## ✅ Qualification Requirements

### To Join a Royalty Tier:

1. **Level Requirement**
   - Tier 1: Must be Level 10
   - Tier 2: Must be Level 11
   - Tier 3: Must be Level 12
   - Tier 4: Must be Level 13

2. **Direct Referrals**
   - Minimum: **2 direct referrals**
   - Must be active members

3. **ROI Capacity**
   - Royalty income < 150% of total deposits
   - Once reached → Removed from pool
   - Other income continues unlimited

4. **Active Status**
   - Not already in the tier
   - Not removed due to cap

---

## 🔄 How It Works

### Step 1: Pool Accumulation (24 hours)

```
Day 1 (00:00 - 23:59):
├─ User A upgrades to Level 5: 96 USDT
│   └─ Royalty: 4.8 USDT added to pools
├─ User B upgrades to Level 10: 3,072 USDT
│   └─ Royalty: 153.6 USDT added to pools
├─ User C upgrades to Level 13: 24,576 USDT
│   └─ Royalty: 1,228.8 USDT added to pools
└─ Total accumulated: 1,387.2 USDT

Split into tiers:
├─ Tier 1: 554.88 USDT (40%)
├─ Tier 2: 416.16 USDT (30%)
├─ Tier 3: 277.44 USDT (20%)
└─ Tier 4: 138.72 USDT (10%)
```

### Step 2: User Qualification Check

```
At end of Day 1:
├─ Pending users moved to active
├─ Check level requirements
├─ Check ROI capacity
├─ Add to active user count
└─ Remove from lower tiers if promoted
```

### Step 3: Daily Distribution (Day 2)

```
Day 2 (00:00+):
Users can claim their share

Example - Tier 1:
├─ Pool: 554.88 USDT
├─ Active users: 50
├─ Per user: 554.88 / 50 = 11.10 USDT
└─ Each user claims 11.10 USDT
```

### Step 4: Claim Process

```solidity
// User calls claimRoyalty(tier)
claimRoyalty(0); // Tier 1

Process:
1. Check eligibility
2. Calculate share (pool / active users)
3. Transfer BNB to user
4. Update royalty income
5. Mark as claimed for today
6. Check if ROI cap reached
7. Remove from pool if capped
```

---

## 📊 Example Scenarios

### Scenario 1: New Level 10 User

**User Status:**
- Level: 10
- Direct Team: 3
- Total Deposits: 10,000 USDT
- Royalty Income: 0 USDT

**Process:**
1. Upgrades to Level 10
2. Automatically added to pending Tier 1
3. Next day (Day 2): Moved to active
4. Can claim from Day 2's pool onwards

**Daily Earnings:**
```
Tier 1 pool: 1,000 USDT
Active users: 100
Your share: 1,000 / 100 = 10 USDT/day
```

### Scenario 2: Promotion to Higher Tier

**User Status:**
- Currently: Level 10 (Tier 1 active)
- Upgrades to: Level 11

**Process:**
1. Upgrade to Level 11
2. Added to pending Tier 2
3. Next day: Moved to active Tier 2
4. **Removed from Tier 1** (can only be in highest tier)
5. Claims from Tier 2 pool onwards

**Earnings Change:**
```
Before (Tier 1):
Pool: 1,000 USDT / 100 users = 10 USDT/day

After (Tier 2):
Pool: 750 USDT / 30 users = 25 USDT/day
(Higher per-user share due to fewer users)
```

### Scenario 3: Reaching ROI Cap

**User Status:**
- Total Deposits: 51,614 USDT
- ROI Cap: 77,421 USDT (150%)
- Current Royalty Income: 77,000 USDT

**Next Claim:**
```
Daily share: 10 USDT
After claim: 77,010 USDT

Still under cap → Continues ✅
```

**Future Claim:**
```
Current: 77,420 USDT
Daily share: 10 USDT
After claim: 77,430 USDT

Exceeds cap (77,421) → Removed from pool ❌
```

**Result:**
- Removed from royalty tier
- Can no longer claim royalty
- Referral & level income continue unlimited ✅

---

## 💰 Earnings Potential

### Daily Earnings by Tier

**Assumptions:**
- 1,000 active users total
- Daily pool: 10,000 USDT (5% of 200,000 USDT upgrades)

| Tier | Pool | Active Users | Per User/Day | Per Month |
|------|------|--------------|--------------|-----------|
| Tier 1 | 4,000 | 500 | 8 USDT | 240 USDT |
| Tier 2 | 3,000 | 200 | 15 USDT | 450 USDT |
| Tier 3 | 2,000 | 150 | 13.33 USDT | 400 USDT |
| Tier 4 | 1,000 | 150 | 6.67 USDT | 200 USDT |

**Key Insight:** Tier 2 often has best per-user earnings due to fewer users!

### Time to ROI Cap

**Example: Level 13 User**
- Total Deposits: 51,614 USDT
- ROI Cap: 77,421 USDT
- Royalty Capacity: 77,421 USDT

**At 10 USDT/day:**
- Days to cap: 77,421 / 10 = 7,742 days (21 years)

**At 50 USDT/day:**
- Days to cap: 77,421 / 50 = 1,548 days (4.2 years)

**At 200 USDT/day:**
- Days to cap: 77,421 / 200 = 387 days (1 year)

---

## 🔍 Technical Details

### Pool Management

```solidity
// Pool storage
mapping(uint256 => mapping(uint256 => uint256)) public royalty;
// royalty[day][tier] = amount

// Active users per tier
mapping(uint256 => uint256) public royaltyUsers;
// royaltyUsers[tier] = count

// User active status
mapping(uint256 => mapping(uint256 => bool)) public royaltyActive;
// royaltyActive[userId][tier] = true/false
```

### Distribution Calculation

```solidity
// Get current day
uint256 curDay = getCurRoyaltyDay();
// curDay = (block.timestamp - startTime) / 24 hours

// Get yesterday's pool
uint256 poolAmount = royalty[curDay - 1][tier];

// Get active users
uint256 activeUsers = royaltyUsers[tier];

// Calculate per-user share
uint256 share = poolAmount / activeUsers;

// Transfer to user
payable(user).transfer(share);
```

### Unclaimed Rollover

```solidity
// If pool not fully claimed, rollover to next day
if (curDay >= 2) {
    uint256 unclaimed = royalty[curDay - 2][tier] - 
                        royaltyDist[curDay - 2][tier];
    royalty[curDay - 1][tier] += unclaimed;
}
```

---

## 📅 Daily Cycle

### Timeline

```
Day 1 (Jan 1):
00:00 - Pool opens
├─ Accumulate from upgrades
├─ Users can claim Day 0 pool
└─ 23:59 - Pool closes

Day 2 (Jan 2):
00:00 - New pool opens
├─ Move pending users to active
├─ Day 1 pool available for claims
├─ Accumulate new Day 2 pool
└─ 23:59 - Pool closes

Day 3 (Jan 3):
00:00 - Rollover unclaimed from Day 1
├─ Day 2 pool available
├─ Continue cycle...
```

---

## ✅ Benefits

### For Users
1. **Passive Income** - Daily earnings without action
2. **Compounding** - Reinvest to increase tier
3. **Predictable** - Know your daily share
4. **Fair** - Equal distribution per tier

### For Network
1. **Retention** - Keeps users engaged
2. **Upgrade Incentive** - Push to higher levels
3. **Stability** - Continuous income stream
4. **Growth** - More upgrades = bigger pools

---

## ⚠️ Important Notes

### Claiming
- Must claim manually each day
- Can only claim once per day
- Unclaimed funds roll over
- No expiration on claims

### Tier Rules
- Can only be in ONE tier at a time
- Always in HIGHEST qualified tier
- Promotion removes from lower tiers
- Demotion not possible (level can't decrease)

### ROI Cap
- **Only applies to royalty income**
- Referral & level income unlimited
- Once capped, permanently removed
- Cannot rejoin royalty pools

---

## 🎯 Strategy Tips

### Maximize Royalty Earnings

1. **Reach Level 11 (Tier 2)**
   - Often best per-user share
   - Fewer users than Tier 1
   - Higher pool than Tiers 3-4

2. **Claim Daily**
   - Don't miss distributions
   - Compounds over time

3. **Build Team**
   - More upgrades = bigger pools
   - Your team's upgrades benefit you

4. **Monitor ROI**
   - Track royalty income
   - Plan before hitting cap
   - Maximize other income first

---

**The Royalty System provides sustainable passive income while incentivizing network growth!** 💎
