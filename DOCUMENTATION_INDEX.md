# 📚 UniversalMatrix Contract Documentation

Complete guide for the UniversalMatrix smart contract - 100% configurable MLM system on opBNB.

---

## 🚀 Quick Start

| Document | Description |
|----------|-------------|
| [CONFIGURABILITY_ACHIEVEMENT.md](CONFIGURABILITY_ACHIEVEMENT.md) | **100% configurable** - zero redeployment needed |
| [ADMIN_CONFIG_BY_CATEGORY.md](ADMIN_CONFIG_BY_CATEGORY.md) | All 30+ configurable parameters organized by category |
| [COMPLETE_VALIDATION_RANGES.md](COMPLETE_VALIDATION_RANGES.md) | Validation ranges for every parameter |

---

## 💰 Income & Distribution

| Document | Description |
|----------|-------------|
| [DISTRIBUTION_CONFIG_GUIDE.md](DISTRIBUTION_CONFIG_GUIDE.md) | Distribution percentages configuration |
| [ROI_CAP_CLARIFICATION.md](ROI_CAP_CLARIFICATION.md) | ROI cap and layer limits explained |
| [SPONSOR_COMMISSION_QUALIFICATION.md](SPONSOR_COMMISSION_QUALIFICATION.md) | Sponsor commission rules and qualifications |
| [PRICE_ADJUSTMENT_GUIDE.md](PRICE_ADJUSTMENT_GUIDE.md) | Level pricing and dynamic USD pricing |

---

## 👑 Royalty System

| Document | Description |
|----------|-------------|
| [ROYALTY_VAULT_EXPLAINED.md](ROYALTY_VAULT_EXPLAINED.md) | How the royalty vault works |
| [ROOT_USER_ROYALTY_EXPLAINED.md](ROOT_USER_ROYALTY_EXPLAINED.md) | Root user special royalty privileges |

---

## 🔗 Features

| Document | Description |
|----------|-------------|
| [AFFILIATE_LINK_GUIDE.md](AFFILIATE_LINK_GUIDE.md) | Generate and share affiliate referral links |

---

## ⚙️ Technical Details

| Document | Description |
|----------|-------------|
| [CONTRACT_SIZE_OPTIONS.md](CONTRACT_SIZE_OPTIONS.md) | Contract size optimization for opBNB |
| [HARDCODED_CONSTANTS_ANALYSIS.md](HARDCODED_CONSTANTS_ANALYSIS.md) | Analysis of eliminated hardcoded values |

---

## 📊 Key Features Summary

### ✅ 100% Configurable Parameters
- **30+ parameters** - all adjustable without redeployment
- **System Parameters**: Max level, ROI cap, income layers, direct required
- **Distribution**: Registration/upgrade splits fully customizable
- **Sponsor Commission**: Percentage, minimum level, layer limits
- **Royalty**: Tier percentages, qualification levels, distribution time
- **Pricing**: Level prices, USD targets, oracle integration

### ✅ Income Types
| Type | ROI Cap | Layer Limit | Configurable Limit |
|------|---------|-------------|-------------------|
| **Royalty** | 150% (configurable) | None | `setRoiCap()` |
| **Level Income** | None | 13 (configurable) | `setIncomeLayers()` |
| **Sponsor Commission** | None | 0 = unlimited (configurable) | `setSponsorCommissionLayers()` |
| **Referral** | None | None | N/A |

### ✅ Special Features
- **Root User**: Unlimited ROI, auto-credited royalty, perpetual accumulation
- **Affiliate Links**: User ID-based referral system
- **Dynamic Pricing**: Chainlink oracle for USD-stable pricing
- **UUPS Upgradeable**: Safe contract upgrades

---

## 🎯 For Administrators

**Essential Reading:**
1. [CONFIGURABILITY_ACHIEVEMENT.md](CONFIGURABILITY_ACHIEVEMENT.md) - See what's configurable
2. [ADMIN_CONFIG_BY_CATEGORY.md](ADMIN_CONFIG_BY_CATEGORY.md) - How to configure everything
3. [COMPLETE_VALIDATION_RANGES.md](COMPLETE_VALIDATION_RANGES.md) - Valid parameter ranges

**Configuration Examples:**
```javascript
// Adjust distribution
await matrix.setUpgradeDistribution(85, 5, 5, 5); // income, sponsor, admin, royalty = 100%

// Adjust system parameters
await matrix.setMaxLevel(20); // Allow more levels
await matrix.setIncomeLayers(30); // Deeper income distribution
await matrix.setSponsorCommissionLayers(0); // Unlimited sponsor commission

// Adjust royalty system
await matrix.setRoyaltyPercent([40, 30, 20, 10]); // Tier percentages
await matrix.setRoyaltyDistTime(48 * 3600); // 48-hour cycles
```

---

## 🔐 Security & Testing

- ✅ **58/58 tests passing**
- ✅ **All parameters** have validation
- ✅ **Owner-only** admin functions
- ✅ **Events** for all configuration changes
- ✅ **Reentrancy** guards active

---

## 🌐 Deployment

**Target:** opBNB (contract size: ~27KB)  
**Optimizer:** 10 runs (for opBNB deployment)  
**Upgradeable:** UUPS pattern

---

## 📞 Support

For questions or configuration help, refer to the specific guides above or contact the development team.

**Deploy once, configure forever!** 🚀
