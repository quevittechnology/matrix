# Royalty Dashboard Implementation - Deployment Guide

## Overview

Successfully implemented comprehensive royalty dashboard system with 24-hour distribution cycles, optimized for opBNB deployment under 24KB contract size limit.

---

## ✅ What's Implemented

### Core Features
- **24-hour royalty cycles** - Automatic distribution every 24 hours
- **Complete claim tracking** - Every claim recorded in `userRoyaltyHistory` mapping
- **Rollover monitoring** - Unclaimed royalty automatically rolls to next cycle
- **Multi-tier system** - 4 royalty tiers (Levels 10, 11, 12, 13)
- **Perpetual accumulation** - Users with 15+ referrals never lose royalty
- **Real-time events** - `RoyaltyHistoryRecorded`, `RoyaltyRollover`, `DayTierStatsUpdated`

### Dashboard Functions
1. **`getUserRoyaltyDashboard(userId)`** - Complete dashboard data
   - User statistics
   - Active tiers
   - Available amounts (claimable now)
   - Pending amounts (accumulated)

2. **`getTierStatsForDay(day, tier)`** - Pool statistics
   - Total pool amount
   - Total distributed
   - Total rolled over
   - User count

### Data Access
- **Direct mappings**: `userRoyaltyHistory`, `dayTierStats`, `hasClaimedDayTier`
- **Events**: Complete history via `RoyaltyHistoryRecorded` events
- **View functions**: Aggregated dashboard data

---

## 📦 Contract Deployment

### Contract Type: Non-Upgradeable
The contract was converted from upgradeable to non-upgradeable to meet the 24KB size limit.

### Constructor Parameters
```javascript
constructor(
    address _feeReceiver,    // Admin fee receiver address
    address _royaltyVault,   // Royalty vault contract address  
    address _owner           // Contract owner address
)
```

### Deployment Script Example
```javascript
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying with account:", deployer.address);
    
    const feeReceiver = "0x...";  // Your fee receiver address
    const royaltyVault = "0x..."; // Your royalty vault address
    const owner = deployer.address;
    
    const UniversalMatrix = await ethers.getContractFactory("UniversalMatrix");
    const matrix = await UniversalMatrix.deploy(
        feeReceiver,
        royaltyVault,
        owner
    );
    
    await matrix.waitForDeployment();
    
    console.log("UniversalMatrix deployed to:", await matrix.getAddress());
    
    // Set initial level prices
    await matrix.updateLevelPrices([
        ethers.parseEther("0.01"),  // Level 1
        ethers.parseEther("0.02"),  // Level 2
        // ... add all 13 levels
    ]);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

### Deploy to opBNB Testnet
```bash
npx hardhat run scripts/deploy.js --network opBNBTestnet
```

### Deploy to opBNB Mainnet
```bash
npx hardhat run scripts/deploy.js --network opBNB
```

---

## 🔧 Post-Deployment Configuration

### Required Settings
```javascript
// 1. Set level prices (if not set in deployment)
await matrix.updateLevelPrices([...prices]);

// 2. Configure distribution percentages (optional - defaults set)
await matrix.setUpgradeDistribution(85, 5, 5, 5); // income, sponsor, admin, royalty

// 3. Set price oracle (optional)
await matrix.setPriceFeed("0x..."); // Chainlink BNB/USD feed
await matrix.setUseOracle(true);
```

### Optional Configurations
```javascript
// Adjust ROI cap (default: 150%, max: 300%)
await matrix.setRoiCap(200); // 200%

// Adjust income layers (default: 13, max: 30)
await matrix.setIncomeLayers(20); // 20 layers

// Set sponsor commission min level (default: Level 4)
await matrix.setSponsorMinLevel(5);

// Set perpetual royalty threshold (default: 15 referrals)
await matrix.setPerpetualRoyaltyMinReferrals(20);
```

---

## 📊 Dashboard Integration Guide

### Basic Dashboard Data
```javascript
// Get complete dashboard data
const dashboard = await contract.getUserRoyaltyDashboard(userId);

const data = {
    // User stats
    level: dashboard.userStats.level,
    totalRoyaltyIncome: ethers.formatEther(dashboard.userStats.royaltyIncome),
    totalDeposit: ethers.formatEther(dashboard.userStats.totalDeposit),
    directTeam: dashboard.userStats.directTeam,
    
    // Active tiers
    activeTiers: dashboard.activeTiers, // [false, false, true, false]
    
    // Claimable now
    availableNow: dashboard.availableNow.map(v => ethers.formatEther(v)),
    
    // Pending accumulated
    pendingAmounts: dashboard.pendingAmounts.map(v => ethers.formatEther(v))
};
```

### Claim History via Events
```javascript
// Get all historical claims for a user
const filter = contract.filters.RoyaltyHistoryRecorded(userId);
const events = await contract.queryFilter(filter, 0, 'latest');

const history = events.map(event => ({
    day: event.args.day,
    tier: event.args.tier,
    amount: ethers.formatEther(event.args.amount),
    blockNumber: event.blockNumber,
    timestamp: event.blockNumber // fetch block timestamp if needed
}));
```

### Real-Time Updates
```javascript
// Listen for new claims
contract.on("RoyaltyHistoryRecorded", (userId, day, tier, amount) => {
    console.log(`User ${userId} claimed ${ethers.formatEther(amount)} BNB`);
    refreshDashboard();
});

// Listen for rollovers
contract.on("RoyaltyRollover", (day, tier, amount) => {
    console.log(`Day ${day}, Tier ${tier}: ${ethers.formatEther(amount)} rolled over`);
});
```

### Claim Status Check
```javascript
// Check if user claimed specific day/tier
const claimed = await contract.hasClaimedDayTier(userId, day, tier);

// Get tier stats for specific day
const stats = await contract.getTierStatsForDay(day, tier);
console.log({
    totalPool: ethers.formatEther(stats.totalPool),
    distributed: ethers.formatEther(stats.totalDistributed),
    rolledOver: ethers.formatEther(stats.totalRolledOver),
    userCount: stats.userCount
});
```

---

## 🎯 Key Changes from Previous Version

### Size Optimizations
1. **Removed upgradeable pattern** - Saved ~2-3KB
2. **Removed `lostIncome` mapping** - Redundant tracking
3. **Simplified view functions** - History via events (standard pattern)

### Updated Limits
- **ROI Cap**: 100% - 300% (was 100% - 1000%)
- **Income Layers**: 5 - 30 (was 5 - 50)

### What's Still Fully Functional
✅ All registration & upgrade logic  
✅ All income distribution logic  
✅ All royalty distribution logic  
✅ All claim tracking  
✅ All admin functions  
✅ All events  

### Trade-offs
❌ **Contract is NOT upgradeable** - Deploy new version if needed  
⚠️ **Some convenience view functions removed** - Data accessible via mappings/events  

---

## 📁 Files Modified

- `contracts/UniversalMatrix.sol` - Main contract (non-upgradeable)
- `hardhat.config.js` - Optimizer enabled (via-IR, runs=10)
- `ROYALTY_DASHBOARD_API.md` - Complete API documentation

---

## ✅ Verification Checklist

- [ ] Contract compiled successfully
- [ ] Contract size under 24KB (no warnings)
- [ ] Deployed to testnet
- [ ] Level prices configured
- [ ] Distribution percentages verified
- [ ] Test registration
- [ ] Test upgrade
- [ ] Test royalty claim
- [ ] Dashboard showing correct data
- [ ] Events firing correctly
- [ ] Verify on block explorer

---

## 🚀 Production Deployment Steps

1. **Test thoroughly on testnet**
2. **Deploy to opBNB mainnet**
3. **Configure all settings**
4. **Verify contract on block explorer**
5. **Set up event indexing** (The Graph or custom)
6. **Deploy frontend dashboard**
7. **Monitor first 24-hour cycle**

---

## 📞 Support

For issues or questions:
- Check `ROYALTY_DASHBOARD_API.md` for complete API reference
- Review `walkthrough.md` for implementation details
- Verify all mappings are public for direct access
