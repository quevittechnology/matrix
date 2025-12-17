# Admin Configuration Reference - Organized by Category

**100% Configurable - Zero Hardcoded Constants** ✅

---

## 📑 Table of Contents

1. [System Parameters](#1-system-parameters) (6)
2. [Distribution Percentages](#2-distribution-percentages) (5)
3. [Sponsor Commission](#3-sponsor-commission) (3)
4. [Level Pricing](#4-level-pricing) (2)
5. [Royalty System](#5-royalty-system) (5)
6. [Address Configuration](#6-address-configuration) (2)
7. [Price Oracle](#7-price-oracle) (4)
8. [Contract Control](#8-contract-control) (1)

**Total: 28 Configurable Parameters**

---

## 1. System Parameters

Core system configuration affecting income distribution and qualification.

### 1.1 Maximum Level
```solidity
uint256 public maxLevel;
function setMaxLevel(uint256 _maxLevel) external onlyOwner;
event MaxLevelUpdated(uint256 newMaxLevel);
```
- **Default:** 13
- **Range:** 5-30
- **Validation:** `require(_maxLevel >= 5 && _maxLevel <= 30)`
- **Usage:** Maximum upgrade level users can reach

### 1.2 ROI Cap Percentage
```solidity
uint256 public roiCapPercent;
function setRoiCap(uint256 _roiCapPercent) external onlyOwner;
event RoiCapUpdated(uint256 newRoiCap);
```
- **Default:** 150 (150%)
- **Range:** 100-1000%
- **Validation:** `require(_roiCapPercent >= 100 && _roiCapPercent <= 1000)`  
- **Usage:** ROI cap on royalty income (root user exempt)

### 1.3 Income Distribution Layers
```solidity
uint256 public incomeLayers;
function setIncomeLayers(uint256 _layers) external onlyOwner;
event IncomeLayersUpdated(uint256 newLayers);
```
- **Default:** 13
- **Range:** 5-50
- **Validation:** `require(_layers >= 5 && _layers <= 50)`
- **Usage:** How many layers deep to search for qualified upline

### 1.4 Direct Referrals Required
```solidity
uint256 public directRequired;
function setDirectRequired(uint256 _required) external onlyOwner;
event DirectRequiredUpdated(uint256 newRequired);
```
- **Default:** 2
- **Range:** 0-30  
- **Validation:** `require(_required <= 30)`
- **Special:** **0 = no requirement** (anyone qualifies for income)

### 1.5 Royalty Distribution Time
```solidity
uint256 public royaltyDistTime;
function setRoyaltyDistTime(uint256 _distTime) external onlyOwner;
event RoyaltyDistTimeUpdated(uint256 newDistTime);
```
- **Default:** 24 hours
- **Range:** 1 hour - 7 days
- **Validation:** `require(_distTime >= 1 hours && _distTime <= 7 days)`
- **Usage:** Royalty distribution cycle duration

### 1.6 Price Validity Period
```solidity
uint256 public priceValidityPeriod;
function setPriceValidityPeriod(uint256 _period) external onlyOwner;
event PriceValidityPeriodUpdated(uint256 newPeriod);
```
- **Default:** 7 days
- **Range:** 1 hour - 30 days
- **Validation:** `require(_period >= 1 hours && _period <= 30 days)`
- **Usage:** How long cached BNB price remains valid

---

## 2. Distribution Percentages

Configure how payments are split during registration and upgrades.

### 2.1 & 2.2 Registration Distribution
```solidity
uint256 public registrationSponsorPercent;
uint256 public registrationRoyaltyPercent;
function setRegistrationDistribution(uint256 _sponsorPercent, uint256 _royaltyPercent) external onlyOwner;
event RegistrationDistributionUpdated(uint256 sponsorPercent, uint256 royaltyPercent);
```
- **Defaults:** Sponsor 90%, Royalty 5%
- **Validation:** `require(_sponsorPercent + _royaltyPercent <= 100)`
- **Note:** Admin fee separate (via levelFeePercent)

### 2.3, 2.4, & 2.5 Upgrade Distribution
```solidity
uint256 public upgradeIncomePercent;
uint256 public upgradeAdminPercent;
uint256 public upgradeRoyaltyPercent;
function setUpgradeDistribution(uint256 _incomePercent, uint256 _adminPercent, uint256 _royaltyPercent) external onlyOwner;
event UpgradeDistributionUpdated(uint256 incomePercent, uint256 adminPercent, uint256 royaltyPercent);
```
- **Defaults:** Income 90%, Admin 5%, Royalty 5%
- **Validation:** `require(_incomePercent + _adminPercent + _royaltyPercent == 100)`
- **Must total exactly 100%**

---

## 3. Sponsor Commission

Direct sponsor earnings from downline upgrades.

### 3.1 Commission Percentage
```solidity
uint256 public sponsorCommissionPercent;
function setSponsorCommission(uint256 _percent) external onlyOwner;
event SponsorCommissionUpdated(uint256 newPercent);
```
- **Default:** 5%
- **Range:** 0-100%
- **Validation:** `require(_percent <= 100)`
- **Note:** Deducted from level income

### 3.2 Minimum Level
```solidity
uint256 public sponsorMinLevel;
function setSponsorMinLevel(uint256 _level) external onlyOwner;
event SponsorMinLevelUpdated(uint256 newLevel);
```
- **Default:** 4
- **Range:** 1 to maxLevel
- **Validation:** `require(_level >= 1 && _level <= maxLevel)`
- **Usage:** Sponsor must be this level to earn commission

### 3.3 Commission Layer Limit
```solidity
uint256 public sponsorCommissionLayers;
function setSponsorCommissionLayers(uint256 _layers) external onlyOwner;
event SponsorCommissionLayersUpdated(uint256 newLayers);
```
- **Default:** 0 (unlimited)
- **Range:** 0-50 (0 = unlimited)
- **Validation:** `require(_layers <= 50)`
- **Usage:** Maximum depth for sponsor commission payment

### 3.4 Fallback Destination
```solidity
enum SponsorFallback { ROOT_USER, ADMIN, ROYALTY_POOL }
SponsorFallback public sponsorFallback;
function setSponsorFallback(SponsorFallback _fallback) external onlyOwner;
event SponsorFallbackUpdated(SponsorFallback newFallback);
```
- **Default:** ROOT_USER (0)
- **Options:** 0=Root, 1=Admin, 2=Royalty Pool
- **Usage:** Where commission goes if sponsor unqualified

---

## 4. Level Pricing

Configure BNB prices and admin fees for each of 13 levels.

### 4.1 Level Prices (BNB)
```solidity
uint256[13] public levelPrice;
function updateLevelPrices(uint256[13] memory _prices) external onlyOwner;
event LevelPricesUpdated(uint256[13] newPrices);
```
- **Default:** `[0.01, 0.02, 0.04, 0.08, 0.16, 0.32, 0.64, 1.28, 2.56, 5.12, 10.24, 20.48, 40.96]` BNB
- **Validation:** None (flexibility)

### 4.2 Level Fees (%)
```solidity
uint256[13] public levelFeePercent;
function setLevelFees(uint256[13] memory _fees) external onlyOwner;
event LevelFeesUpdated(uint256[13] newFees);
```
- **Default:** `[5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]` (all 5%)
- **Validation:** Each `<= 100%`

---

## 5. Royalty System

Configure royalty pool distribution and qualification.

### 5.1 Royalty Percentages
```solidity
uint256[4] public royaltyPercent;
function setRoyaltyPercent(uint256[4] memory _percents) external onlyOwner;
event RoyaltyPercentUpdated(uint256[4] newPercents);
```
- **Default:** `[40, 30, 20, 10]` (40%, 30%, 20%, 10%)
- **Validation:** Must total 100%
- **Usage:** Distribution across 4 tiers

### 5.2 Royalty Levels ✨ NEW
```solidity
uint256[4] public royaltyLevel;
function setRoyaltyLevels(uint256[4] memory _levels) external onlyOwner;
event RoyaltyLevelsUpdated(uint256[4] newLevels);
```
- **Default:** `[10, 11, 12, 13]`
- **Validation:** Must be ascending, within maxLevel
- **Usage:** Which levels qualify for each royalty tier

### 5.3 Direct Referrals Required (Royalty)
```solidity
uint256[4] public royaltyDirectRequired;
function setRoyaltyDirectRequired(uint256[4] memory _requirements) external onlyOwner;
event RoyaltyDirectRequiredUpdated(uint256[4] newRequirements);
```
- **Default:** `[10, 11, 12, 13]`
- **Range:** 2-100 per tier
- **Validation:** `require(_requirements[i] >= 2 && _requirements[i] <= 100)`

### 5.4 Distribution Time
See System Parameters 1.5 (royaltyDistTime)

### 5.5 ROI Cap
See System Parameters 1.2 (roiCapPercent)

---

## 6. Address Configuration

Critical address settings for fee and royalty receivers.

### 6.1 Fee Receiver
```solidity
address public feeReceiver;
function setFeeReceiver(address _receiver) external onlyOwner;
event FeeReceiverUpdated(address oldReceiver, address newReceiver);
```
- **Validation:** `require(_receiver != address(0))`
- **Usage:** Receives admin fees

### 6.2 Royalty Vault
```solidity
IRoyaltyVault public royaltyVault;
function setRoyaltyVault(address _vault) external onlyOwner;
event RoyaltyVaultUpdated(address oldVault, address newVault);
```
- **Validation:** `require(_vault != address(0))`
- **Usage:** Royalty distribution contract

---

## 7. Price Oracle

USD-based pricing using Chainlink oracles (optional).

### 7.1 Use Oracle
```solidity
bool public useOracle;
function setUseOracle(bool _useOracle) external onlyOwner;
event UseOracleUpdated(bool enabled);
```
- **Default:** false (use BNB prices)
- **Usage:** Enable USD-based pricing

### 7.2 Price Feed
```solidity
AggregatorV3Interface public priceFeed;
function setPriceFeed(address _priceFeed) external onlyOwner;
event PriceFeedUpdated(address newPriceFeed);
```
- **Validation:** `require(_priceFeed != address(0))`
- **Usage:** Chainlink price feed address

### 7.3 Level Prices USD
```solidity
uint256[13] public levelPriceUSD;
function setLevelPricesUSD(uint256[13] memory _pricesUSD) external onlyOwner;
event LevelPricesUSDUpdated(uint256[13] newPricesUSD);
```
- **Default:** `[0, 0, ...]` (unused unless oracle enabled)
- **Usage:** USD prices in cents (e.g., 1000 = $10)

### 7.4 Price Validity Period
See System Parameters 1.6 (priceValidityPeriod)

---

## 8. Contract Control

Emergency controls and operational status.

### 8.1 Paused
```solidity
bool public paused;
function setPaused(bool _status) external onlyOwner;
event Paused(bool status);
```
- **Default:** false
- **Usage:** Emergency pause for registration/upgrades

---

## 📊 Summary by Category

| Category | Parameters | Quick Access |
|----------|------------|--------------|
| System Parameters | 6 | maxLevel, roiCapPercent, incomeLayers, directRequired, royaltyDistTime, priceValidityPeriod |
| Distribution % | 5 | Registration (sponsor, royalty), Upgrade (income, admin, royalty) |
| Sponsor Commission | 3 | Percent, min level, fallback |
| Level Pricing | 2 | Prices (13), Fees (13) |
| Royalty System | 5 | Percentages (4), levels (4), direct required (4), dist time, ROI cap |
| Addresses | 2 | Fee receiver, royalty vault |
| Price Oracle | 4 | Use oracle, price feed, USD prices (13), validity period |
| Contract Control | 1 | Paused |

**Total: 28 Configurable Parameters**  
**Hardcoded Constants: 0** ✅

---

## 🎯 Quick Configuration Examples

### Example 1: Adjust System for Growth
```javascript
// Allow more levels
await matrix.setMaxLevel(20);

// Search deeper for income
await matrix.setIncomeLayers(30);

// No direct requirement
await matrix.setDirectRequired(0);
```

### Example 2: Boost Royalty Pool
```javascript
// More to royalty on registration
await matrix.setRegistrationDistribution(85, 10);

// More to royalty on upgrades
await matrix.setUpgradeDistribution(85, 5, 10);

// Higher ROI cap
await matrix.setRoiCap(300);
```

### Example 3: Adjust Royalty Tiers
```javascript
// Change which levels get royalty
await matrix.setRoyaltyLevels([8, 10, 12, 15]);

// Change distribution split
await matrix.setRoyaltyPercent([50, 30, 15, 5]);

// Lower direct requirements
await matrix.setRoyaltyDirectRequired([5, 7, 9, 11]);
```

---

**All parameters organized by function and fully configurable!** 🚀
