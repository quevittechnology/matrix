# Complete Validation Ranges & Hardcoded Values Audit

## Summary

**Total Configurable Parameters:** 23  
**Remaining Hardcoded Constants:** 1 (ROYALTY_DIST_TIME)  
**All Validation Ranges Documented Below**

---

## 🔧 System Parameters (4)

### 1. Maximum Level
- **Variable:** `maxLevel`
- **Default:** 13
- **Range:** 5-30
- **Setter:** `setMaxLevel(uint256 _maxLevel)`
- **Validation:** `require(_maxLevel >= 5 && _maxLevel <= 30)`
- **Event:** `MaxLevelUpdated(uint256 newMaxLevel)`

### 2. ROI Cap Percentage
- **Variable:** `roiCapPercent`
- **Default:** 150 (150%)
- **Range:** 100-1000%
- **Setter:** `setRoiCap(uint256 _roiCapPercent)`
- **Validation:** `require(_roiCapPercent >= 100 && _roiCapPercent <= 1000)`
- **Event:** `RoiCapUpdated(uint256 newRoiCap)`
- **Note:** Applies to royalty income only; root user exempt

### 3. Income Distribution Layers
- **Variable:** `incomeLayers`
- **Default:** 13
- **Range:** 5-50
- **Setter:** `setIncomeLayers(uint256 _layers)`
- **Validation:** `require(_layers >= 5 && _layers <= 50)`
- **Event:** `IncomeLayersUpdated(uint256 newLayers)`
- **Note:** How many layers deep to search for qualified upline

### 4. Direct Referrals Required
- **Variable:** `directRequired`
- **Default:** 2
- **Range:** 0-30
- **Setter:** `setDirectRequired(uint256 _required)`
- **Validation:** `require(_required <= 30)`
- **Event:** `DirectRequiredUpdated(uint256 newRequired)`
- **Special:** 0 = no direct requirement (anyone qualifies)

---

## 💰 Distribution Percentages (5)

### 5. Registration Sponsor Percent
- **Variable:** `registrationSponsorPercent`
- **Default:** 90%
- **Range:** 0-100% (combined with royalty ≤ 100%)
- **Setter:** `setRegistrationDistribution(uint256 _sponsorPercent, uint256 _royaltyPercent)`
- **Validation:** `require(_sponsorPercent + _royaltyPercent <= 100)`
- **Event:** `RegistrationDistributionUpdated(uint256 sponsorPercent, uint256 royaltyPercent)`

### 6. Registration Royalty Percent
- **Variable:** `registrationRoyaltyPercent`
- **Default:** 5%
- **Range:** 0-100% (combined with sponsor ≤ 100%)
- **Setter:** 
  - `setRegistrationDistribution(uint256 _sponsorPercent, uint256 _royaltyPercent)`
  - `setRegistrationRoyalty(uint256 _percent)` (legacy)
- **Validation:** `require(_percent <= 100)`
- **Event:** `RegistrationRoyaltyUpdated(uint256 newPercent)`

### 7. Upgrade Income Percent
- **Variable:** `upgradeIncomePercent`
- **Default:** 90%
- **Range:** Must total 100% with admin + royalty
- **Setter:** `setUpgradeDistribution(uint256 _incomePercent, uint256 _adminPercent, uint256 _royaltyPercent)`
- **Validation:** `require(_incomePercent + _adminPercent + _royaltyPercent == 100)`
- **Event:** `UpgradeDistributionUpdated(uint256 incomePercent, uint256 adminPercent, uint256 royaltyPercent)`

### 8. Upgrade Admin Percent
- **Variable:** `upgradeAdminPercent`
- **Default:** 5%
- **Range:** Must total 100% with income + royalty
- **Setter:** `setUpgradeDistribution(...)`
- **Validation:** Same as above
- **Event:** Same as above

### 9. Upgrade Royalty Percent
- **Variable:** `upgradeRoyaltyPercent`
- **Default:** 5%
- **Range:** Must total 100% with income + admin
- **Setter:** `setUpgradeDistribution(...)`
- **Validation:** Same as above
- **Event:** Same as above

---

## 👥 Sponsor Commission Settings (3)

### 10. Sponsor Commission Percent
- **Variable:** `sponsorCommissionPercent`
- **Default:** 5%
- **Range:** 0-100%
- **Setter:** `setSponsorCommission(uint256 _percent)`
- **Validation:** `require(_percent <= 100)`
- **Event:** `SponsorCommissionUpdated(uint256 newPercent)`
- **Note:** Deducted from level income paid to upline

### 11. Sponsor Minimum Level
- **Variable:** `sponsorMinLevel`
- **Default:** 4
- **Range:** 1 to maxLevel
- **Setter:** `setSponsorMinLevel(uint256 _level)`
- **Validation:** `require(_level >= 1 && _level <= maxLevel)`
- **Event:** `SponsorMinLevelUpdated(uint256 newLevel)`
- **Note:** Sponsor must be this level or higher to receive commission

### 12. Sponsor Fallback
- **Variable:** `sponsorFallback` (enum)
- **Default:** ROOT_USER (0)
- **Options:** 
  - 0 = ROOT_USER (send to root/default user)
  - 1 = ADMIN (send to fee receiver)
  - 2 = ROYALTY_POOL (add to royalty distribution)
- **Setter:** `setSponsorFallback(SponsorFallback _fallback)`
- **Validation:** Enum type (0-2)
- **Event:** `SponsorFallbackUpdated(SponsorFallback newFallback)`

---

## 💵 Level Pricing (2 arrays)

### 13. Level Prices (BNB)
- **Variable:** `levelPrice[13]` (array)
- **Default:** 
  ```
  [0.01, 0.02, 0.04, 0.08, 0.16, 0.32, 0.64, 1.28, 2.56, 5.12, 10.24, 20.48, 40.96] BNB
  ```
- **Range:** 0 to unlimited (no validation)
- **Setter:** `updateLevelPrices(uint256[13] memory _prices)`
- **Validation:** None (array length must be 13)
- **Event:** `LevelPricesUpdated(uint256[13] newPrices)`

### 14. Level Fees (Percentage)
- **Variable:** `levelFeePercent[13]` (array)
- **Default:** `[5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]` (all 5%)
- **Range:** 0-100% for each level
- **Setter:** `setLevelFees(uint256[13] memory _fees)`
- **Validation:** `require(_fees[i] <= 100)` for each
- **Event:** `LevelFeesUpdated(uint256[13] newFees)`

---

## 👑 Royalty System (3 arrays)

### 15. Royalty Percentages
- **Variable:** `royaltyPercent[4]` (array)
- **Default:** `[40, 30, 20, 10]` (40%, 30%, 20%, 10%)
- **Range:** Must total 100%
- **Setter:** `setRoyaltyPercent(uint256[4] memory _percents)`
- **Validation:** `require(sum == 100)`
- **Event:** `RoyaltyPercentUpdated(uint256[4] newPercents)`
- **Note:** Distribution across 4 royalty tiers

### 16. Royalty Levels
- **Variable:** `royaltyLevel[4]` (array)
- **Default:** `[10, 11, 12, 13]`
- **Range:** 1 to maxLevel
- **Setter:** Currently only set in initialize (hardcoded)
- **Validation:** None
- **Note:** ⚠️ **HARDCODED** - levels that qualify for royalty tiers

### 17. Royalty Direct Required
- **Variable:** `royaltyDirectRequired[4]` (array)
- **Default:** `[10, 11, 12, 13]`
- **Range:** 2-100 for each tier
- **Setter:** `setRoyaltyDirectRequired(uint256[4] memory _requirements)`
- **Validation:** `require(_requirements[i] >= 2 && _requirements[i] <= 100)`
- **Event:** `RoyaltyDirectRequiredUpdated(uint256[4] newRequirements)`

---

## 🏦 Address Settings (2)

### 18. Fee Receiver
- **Variable:** `feeReceiver` (address)
- **Default:** Set in initialize
- **Range:** Any valid address (not zero)
- **Setter:** `setFeeReceiver(address _receiver)`
- **Validation:** `require(_receiver != address(0))`
- **Event:** `FeeReceiverUpdated(address oldReceiver, address newReceiver)`

### 19. Royalty Vault
- **Variable:** `royaltyVault` (IRoyaltyVault)
- **Default:** Set in initialize
- **Range:** Any valid address (not zero)
- **Setter:** `setRoyaltyVault(address _vault)`
- **Validation:** `require(_vault != address(0))`
- **Event:** `RoyaltyVaultUpdated(address oldVault, address newVault)`

---

## 🔮 Oracle/Price Settings (4)

### 20. Use Oracle
- **Variable:** `useOracle` (bool)
- **Default:** false
- **Range:** true/false
- **Setter:** `setUseOracle(bool _useOracle)`
- **Validation:** None (boolean)
- **Event:** `UseOracleUpdated(bool enabled)`

### 21. Price Feed
- **Variable:** `priceFeed` (AggregatorV3Interface)
- **Default:** address(0)
- **Range:** Any valid address (not zero)
- **Setter:** `setPriceFeed(address _priceFeed)`
- **Validation:** `require(_priceFeed != address(0))`
- **Event:** `PriceFeedUpdated(address newPriceFeed)`

### 22. Level Prices USD
- **Variable:** `levelPriceUSD[13]` (array)
- **Default:** All 0 (not used unless oracle enabled)
- **Range:** 0 to unlimited
- **Setter:** `setLevelPricesUSD(uint256[13] memory _pricesUSD)`
- **Validation:** None
- **Event:** `LevelPricesUSDUpdated(uint256[13] newPricesUSD)`

### 23. Price Validity Period
- **Variable:** `priceValidityPeriod` (uint256)
- **Default:** 7 days
- **Range:** 0 to unlimited
- **Setter:** None (hardcoded in initialize)
- **Note:** ⚠️ **HARDCODED** - how long cached price is valid

---

## ⏸️ Pause Status (1)

### 24. Paused
- **Variable:** `paused` (bool)
- **Default:** false
- **Range:** true/false
- **Setter:** `setPaused(bool _status)`
- **Validation:** None (boolean)
- **Event:** `Paused(bool status)`

---

## 🔒 Remaining Hardcoded Constants

### 1. ROYALTY_DIST_TIME
- **Type:** `uint256 public constant`
- **Value:** `24 hours`
- **Usage:** Royalty distribution cycle time
- **Location:** Line 45
- **Recommendation:** Keep as constant (stable time value)

### 2. Royalty Levels Array (Implicit)
- **Variable:** `royaltyLevel[4]`
- **Hardcoded in initialize:** `[10, 11, 12, 13]`
- **No setter function**
- **Recommendation:** Consider adding `setRoyaltyLevels()` function

### 3. Price Validity Period
- **Variable:** `priceValidityPeriod`
- **Hardcoded in initialize:** `7 days`
- **No setter function**
- **Recommendation:** Consider adding `setPriceValidityPeriod()` function

---

## 📊 Summary by Category

| Category | Count | All Configurable? |
|----------|-------|-------------------|
| System Parameters | 4 | ✅ Yes |
| Distribution % | 5 | ✅ Yes |
| Sponsor Commission | 3 | ✅ Yes |
| Level Pricing | 2 | ✅ Yes |
| Royalty System | 3 | ⚠️ Partial (royaltyLevel not configurable) |
| Addresses | 2 | ✅ Yes |
| Oracle/Pricing | 4 | ⚠️ Partial (priceValidityPeriod not configurable) |
| Pause | 1 | ✅ Yes |
| **Total** | **24** | **21/24 (87.5%)** |

---

## ⚠️ Potential Additions

These variables currently have NO setter function:

1. **`royaltyLevel[4]`** - Which levels qualify for royalty
   - Currently: `[10, 11, 12, 13]`
   - Could add: `setRoyaltyLevels(uint256[4] memory _levels)`

2. **`priceValidityPeriod`** - How long cached price is valid
   - Currently: `7 days`
   - Could add: `setPriceValidityPeriod(uint256 _period)`

3. **`defaultRefer`** - Root/default user ID
   - Currently: Set once in initialize
   - Probably should remain immutable

---

## 🎯 Validation Range Quick Reference

| Parameter | Min | Max | Special |
|-----------|-----|-----|---------|
| maxLevel | 5 | 30 | - |
| roiCapPercent | 100 | 1000 | % value |
| incomeLayers | 5 | 50 | - |
| directRequired | 0 | 30 | 0 = no requirement |
| sponsorCommissionPercent | 0 | 100 | % value |
| sponsorMinLevel | 1 | maxLevel | Dynamic upper bound |
| registrationSponsor + royalty | - | 100 | Combined ≤ 100% |
| upgrade income + admin + royalty | - | - | Must equal 100% |
| levelFeePercent (each) | 0 | 100 | % value |
| royaltyDirectRequired (each) | 2 | 100 | Per tier |

---

**Total Configurable Parameters: 24**  
**Hardcoded Values: 3**  
**Configurability: 87.5%** ✅
