# Royalty Dashboard API Reference

Complete API documentation for the UniversalMatrix royalty dashboard system with 24-hour distribution cycles, claim history tracking, and rollover monitoring.

## Overview

The royalty dashboard provides comprehensive tracking of:
- ✅ **24-hour distribution cycles** (automatic via `getCurRoyaltyDay()`)
- ✅ **Complete claim history** for all users
- ✅ **Rollover statistics** per tier/day
- ✅ **Multi-tier status** and availability
- ✅ **Calendar views** for visual dashboards

---

## Core View Functions

### 1. `getUserRoyaltyDashboard(uint256 _userId)` ⭐

**One-stop function** returning complete dashboard data for a user.

**Returns:**
```solidity
(
    User memory userStats,          // Complete user info
    bool[4] memory activeTiers,     // Active in each tier
    uint256[4] memory availableNow, // Claimable now per tier
    uint256[4] memory pendingAmounts, // Accumulated pending
    RoyaltyClaimRecord[] memory recentHistory // Last 10 claims
)
```

**JavaScript Example:**
```javascript
const dashboard = await contract.getUserRoyaltyDashboard(userId);

console.log("User Level:", dashboard.userStats.level);
console.log("Total Royalty Income:", ethers.formatEther(dashboard.userStats.royaltyIncome));
console.log("Active Tiers:", dashboard.activeTiers); // [false, false, true, false]
console.log("Available to Claim:", dashboard.availableNow.map(v => ethers.formatEther(v)));
console.log("Recent Claims:", dashboard.recentHistory.length);
```

---

### 2. `getRoyaltyHistory(uint256 _userId, uint256 _startIndex, uint256 _count)`

Get paginated claim history (latest first).

**Parameters:**
- `_userId`: User ID
- `_startIndex`: Starting index (0 for latest)
- `_count`: Number of records (0 for all)

**Returns:**
```solidity
RoyaltyClaimRecord[] memory
// struct RoyaltyClaimRecord {
//     uint256 day;
//     uint256 tier;
//     uint256 amount;
//     uint256 timestamp;
//     bool wasPending; // true if from accumulated pending
// }
```

**JavaScript Example:**
```javascript
// Get last 20 claims
const history = await contract.getRoyaltyHistory(userId, 0, 20);

history.forEach(record => {
    console.log(`Day ${record.day}, Tier ${record.tier}: ${ethers.formatEther(record.amount)} BNB`);
    console.log(`Timestamp: ${new Date(Number(record.timestamp) * 1000).toLocaleString()}`);
    console.log(`Type: ${record.wasPending ? 'Pending Claim' : 'Daily Claim'}`);
});
```

---

### 3. `getUserAvailableRoyalty(uint256 _userId)`

Get currently claimable amounts for all tiers.

**Returns:**
```solidity
uint256[4] memory available // [tier0, tier1, tier2, tier3]
```

**JavaScript Example:**
```javascript
const available = await contract.getUserAvailableRoyalty(userId);

available.forEach((amount, tier) => {
    if (amount > 0) {
        console.log(`Tier ${tier}: ${ethers.formatEther(amount)} BNB available`);
    }
});
```

---

### 4. `getUserRoyaltyStatus(uint256 _userId)`

Get overall royalty status across all tiers.

**Returns:**
```solidity
(
    bool[4] memory activeTiers,    // Active tier flags
    uint256 totalClaimed,          // Lifetime claimed
    uint256 totalPending,          // Total pending across tiers
    uint256 historyCount           // Number of claim records
)
```

**JavaScript Example:**
```javascript
const status = await contract.getUserRoyaltyStatus(userId);

console.log("Active Tiers:", status.activeTiers);
console.log("Total Claimed:", ethers.formatEther(status.totalClaimed));
console.log("Total Pending:", ethers.formatEther(status.totalPending));
console.log("Total Claims:", status.historyCount);
```

---

### 5. `getTierStatsForDay(uint256 _day, uint256 _tier)`

Get rollover and distribution statistics for a specific day/tier.

**Returns:**
```solidity
DayTierStats memory
// struct DayTierStats {
//     uint256 totalPool;       // Total allocated
//     uint256 totalDistributed; // Amount claimed
//     uint256 totalRolledOver;  // Unclaimed (rolled to next day)
//     uint256 userCount;        // Eligible users
// }
```

**JavaScript Example:**
```javascript
const curDay = await contract.getCurRoyaltyDay();
const stats = await contract.getTierStatsForDay(curDay - 1, 2); // Yesterday, Tier 2

console.log("Total Pool:", ethers.formatEther(stats.totalPool));
console.log("Distributed:", ethers.formatEther(stats.totalDistributed));
console.log("Rolled Over:", ethers.formatEther(stats.totalRolledOver));
console.log("Users:", stats.userCount);

const claimRate = (stats.totalDistributed * 100n) / stats.totalPool;
console.log(`Claim Rate: ${claimRate}%`);
```

---

### 6. `getRoyaltyCalendar(uint256 _userId, uint256 _days)`

Get visual calendar of claims for the last N days.

**Returns:**
```solidity
(
    uint256[] memory days,     // Day numbers
    bool[4][] memory claimed   // [day][tier] claim status
)
```

**JavaScript Example:**
```javascript
const calendar = await contract.getRoyaltyCalendar(userId, 7); // Last 7 days

calendar.days.forEach((day, index) => {
    const tiersClaimed = calendar.claimed[index];
    console.log(`Day ${day}:`);
    tiersClaimed.forEach((claimed, tier) => {
        console.log(`  Tier ${tier}: ${claimed ? '✅ Claimed' : '❌ Not Claimed'}`);
    });
});
```

---

## Dashboard UI Implementation Example

### React Dashboard Component

```javascript
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

function RoyaltyDashboard({ userId, contract }) {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const data = await contract.getUserRoyaltyDashboard(userId);
                setDashboard(data);
                setLoading(false);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        }
        loadDashboard();
    }, [userId, contract]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="royalty-dashboard">
            {/* Header Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Claimed</h3>
                    <p>{ethers.formatEther(dashboard.userStats.royaltyIncome)} BNB</p>
                </div>
                <div className="stat-card">
                    <h3>Available Now</h3>
                    <p>{ethers.formatEther(
                        dashboard.availableNow.reduce((a, b) => a + b, 0n)
                    )} BNB</p>
                </div>
                <div className="stat-card">
                    <h3>Pending</h3>
                    <p>{ethers.formatEther(
                        dashboard.pendingAmounts.reduce((a, b) => a + b, 0n)
                    )} BNB</p>
                </div>
            </div>

            {/* Active Tiers */}
            <div className="active-tiers">
                <h2>Active Tiers</h2>
                {dashboard.activeTiers.map((active, tier) => (
                    active && (
                        <div key={tier} className="tier-card">
                            <h3>Tier {tier + 1}</h3>
                            <p>Available: {ethers.formatEther(dashboard.availableNow[tier])} BNB</p>
                            <p>Pending: {ethers.formatEther(dashboard.pendingAmounts[tier])} BNB</p>
                            <button onClick={() => claimRoyalty(tier)}>
                                Claim Now
                            </button>
                        </div>
                    )
                ))}
            </div>

            {/* Recent History */}
            <div className="history">
                <h2>Recent Claims</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Tier</th>
                            <th>Amount</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboard.recentHistory.map((record, i) => (
                            <tr key={i}>
                                <td>{new Date(Number(record.timestamp) * 1000).toLocaleDateString()}</td>
                                <td>{record.day.toString()}</td>
                                <td>{record.tier}</td>
                                <td>{ethers.formatEther(record.amount)} BNB</td>
                                <td>{record.wasPending ? '📦 Pending' : '🎁 Daily'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
```

---

## 24-Hour Cycle Mechanics

### How It Works

```solidity
function getCurRoyaltyDay() public view returns (uint256) {
    return block.timestamp / royaltyDistTime; // royaltyDistTime = 24 hours
}
```

- **Day 0**: Starts at contract deployment
- **Day 1**: 24 hours after deployment
- **Day N**: `N * 24 hours` after deployment

### Important Notes

1. **Claiming**: Users claim **yesterday's** royalty (day - 1)
2. **Rollover**: Unclaimed funds from day N-2 roll to day N-1
3. **Distribution**: New funds allocated to current day immediately

### Timeline Example

```
Current Time: Day 5, 14:30
- Day 5: Current period (can't claim yet)
- Day 4: Claimable now (yesterday)
- Day 3: Rolled over to Day 4 if unclaimed
- Day 2 and earlier: Fully processed
```

---

## Event Monitoring

### Dashboard Events

```javascript
// Listen for claim history updates
contract.on("RoyaltyHistoryRecorded", (userId, day, tier, amount) => {
    console.log(`User ${userId} claimed ${ethers.formatEther(amount)} BNB from Day ${day}, Tier ${tier}`);
    refreshDashboard();
});

// Listen for rollover events
contract.on("RoyaltyRollover", (day, tier, amount) => {
    console.log(`Day ${day}, Tier ${tier}: ${ethers.formatEther(amount)} BNB rolled over`);
});

// Listen for day/tier stats updates
contract.on("DayTierStatsUpdated", (day, tier, pool, distributed, rolledOver) => {
    console.log(`Day ${day}, Tier ${tier} Stats:`);
    console.log(`  Pool: ${ethers.formatEther(pool)}`);
    console.log(`  Distributed: ${ethers.formatEther(distributed)}`);
    console.log(`  Rolled Over: ${ethers.formatEther(rolledOver)}`);
});
```

---

## Data Structures

### RoyaltyClaimRecord

```solidity
struct RoyaltyClaimRecord {
    uint256 day;        // Royalty day number
    uint256 tier;       // Tier index (0-3)
    uint256 amount;     // Amount claimed (wei)
    uint256 timestamp;  // Unix timestamp
    bool wasPending;    // true = pending claim, false = daily claim
}
```

### DayTierStats

```solidity
struct DayTierStats {
    uint256 totalPool;       // Total allocated for day/tier
    uint256 totalDistributed; // Amount claimed by users
    uint256 totalRolledOver;  // Unclaimed amount rolled forward
    uint256 userCount;        // Number of eligible users
}
```

---

## Best Practices

### Gas Optimization

1. **Use `getUserRoyaltyDashboard()`** for initial load (one call vs multiple)
2. **Paginate history** using `getRoyaltyHistory()` with `_count` parameter
3. **Cache results** client-side and refresh on claim events

### UI/UX Recommendations

1. **Real-time countdown** to next royalty day
2. **Visual calendar** showing claim streaks
3. **Tier comparison** chart showing pool sizes
4. **Auto-refresh** on claim events
5. **Rollover indicators** highlighting bonus amounts

### Error Handling

```javascript
try {
    const dashboard = await contract.getUserRoyaltyDashboard(userId);
} catch (error) {
    if (error.message.includes("Not registered")) {
        // User not in system
    } else if (error.message.includes("Invalid tier")) {
        // Tier out of range
    }
}
```

---

## Complete Integration Checklist

- [ ] Connect to contract with ethers.js/web3.js
- [ ] Implement `getUserRoyaltyDashboard()` call
- [ ] Display active tiers and available amounts
- [ ] Add claim buttons with tier selection
- [ ] Show recent history table
- [ ] Add calendar view for last 30 days
- [ ] Implement event listeners for real-time updates
- [ ] Add rollover indicators
- [ ] Show pool statistics per tier
- [ ] Display countdown to next royalty day
