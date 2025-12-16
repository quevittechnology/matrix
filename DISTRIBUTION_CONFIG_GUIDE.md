# Admin Guide: Configurable Distribution Percentages

## Quick Reference

### View Current Settings

```javascript
const settings = await matrix.getDistributionSettings();
// Returns: (regSponsor, regRoyalty, upgIncome, upgAdmin, upgRoyalty)
```

---

## Admin Functions

### 1. Set Registration Distribution

Configure how registration fees split between sponsor and royalty.

```javascript
await matrix.setRegistrationDistribution(
    sponsorPercent,  // % to sponsor
    royaltyPercent   // % to royalty pool
);
```

**Rules:**
- `sponsorPercent + royaltyPercent <= 100`
- Admin fee (5%) is separate, controlled via `levelFeePercent[0]`

**Examples:**
```javascript
// Default: 90% sponsor, 5% royalty
await matrix.setRegistrationDistribution(90, 5);

// More for sponsors: 92% sponsor, 3% royalty
await matrix.setRegistrationDistribution(92, 3);

// Boost royalty: 85% sponsor, 10% royalty
await matrix.setRegistrationDistribution(85, 10);
```

---

### 2. Set Upgrade Distribution

Configure how upgrade payments are distributed.

```javascript
await matrix.setUpgradeDistribution(
    incomePercent,   // % to level income distribution
    adminPercent,    // % admin fee
    royaltyPercent   // % to royalty pool
);
```

**Rules:**
- `incomePercent + adminPercent + royaltyPercent == 100` (must total exactly 100%)

**Examples:**
```javascript
// Default: 90% income, 5% admin, 5% royalty
await matrix.setUpgradeDistribution(90, 5, 5);

// Boost royalty: 85% income, 5% admin, 10% royalty
await matrix.setUpgradeDistribution(85, 5, 10);

// Lower admin fee: 92% income, 3% admin, 5% royalty
await matrix.setUpgradeDistribution(92, 3, 5);
```

---

### 3. Legacy Function (Still Available)

```javascript
// Set only registration royalty percentage
await matrix.setRegistrationRoyalty(royaltyPercent);
```

**Note:** Use `setRegistrationDistribution()` instead for full control.

---

## Current Defaults

### Registration
- **Sponsor:** 90%
- **Royalty:** 5%
- **Admin:** 5% (separate, via levelFeePercent)

### Upgrade
- **Income:** 90%
- **Admin:** 5%
- **Royalty:** 5%

---

## Important Notes

### ⚠️ Access Control
- **Only owner** can call these functions
- Non-owner calls will revert

### ⚠️ Validation
- Invalid percentages will revert the transaction
- Registration: Total cannot exceed 100%
- Upgrade: Total must equal exactly 100%

### ⚠️ Events
All changes emit events for transparency:
- `RegistrationDistributionUpdated(sponsorPercent, royaltyPercent)`
- `UpgradeDistributionUpdated(incomePercent, adminPercent, royaltyPercent)`

---

## Use Cases

### Scenario 1: Increase Royalty Pool Funding
```javascript
// Registration: Reduce sponsor to 85%, increase royalty to 10%
await matrix.setRegistrationDistribution(85, 10);

// Upgrade: Reduce income to 85%, increase royalty to 10%
await matrix.setUpgradeDistribution(85, 5, 10);
```

### Scenario 2: Incentivize Sponsors
```javascript
// Registration: Increase sponsor to 93%, reduce royalty to 2%
await matrix.setRegistrationDistribution(93, 2);

// Keep upgrade distribution same
await matrix.setUpgradeDistribution(90, 5, 5);
```

### Scenario 3: Test Economic Model
```javascript
// Set conservative distribution for testing
await matrix.setRegistrationDistribution(80, 15);
await matrix.setUpgradeDistribution(80, 10, 10);

// Monitor results, then adjust based on data
```

---

## Testing Recommendations

1. **Testnet First:** Always test on testnet before mainnet
2. **Monitor Events:** Watch for emitted events to confirm changes
3. **Verify Settings:** Call `getDistributionSettings()` after each change
4. **Track Impact:** Monitor user behavior and income distribution patterns

---

## Script Example

```javascript
// adminSettings.js
const { ethers } = require("hardhat");

async function updateDistribution() {
    const [owner] = await ethers.getSigners();
    const matrix = await ethers.getContractAt("UniversalMatrix", CONTRACT_ADDRESS);
    
    // Update registration distribution
    console.log("Updating registration distribution...");
    await matrix.setRegistrationDistribution(92, 3);
    
    // Update upgrade distribution
    console.log("Updating upgrade distribution...");
    await matrix.setUpgradeDistribution(85, 5, 10);
    
    // Verify changes
    const settings = await matrix.getDistributionSettings();
    console.log("New Settings:", {
        regSponsor: settings.regSponsor.toString() + "%",
        regRoyalty: settings.regRoyalty.toString() + "%",
        upgIncome: settings.upgIncome.toString() + "%",
        upgAdmin: settings.upgAdmin.toString() + "%",
        upgRoyalty: settings.upgRoyalty.toString() + "%"
    });
}

updateDistribution().catch(console.error);
```

---

**Remember:** These settings control the core economics of your platform. Make changes carefully and monitor their impact! 📊
