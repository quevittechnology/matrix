# Admin Settings Quick Reference

## 📊 Complete Settings Overview

### ✅ Configurable Settings (7)

| # | Setting | Current Default | Function | Impact |
|---|---------|----------------|----------|--------|
| 1 | **Level Prices** | Not set (must configure) | `updateLevelPrices()` | User costs |
| 2 | **Sponsor Commission %** | 5% | `setSponsorCommission()` | Sponsor earnings |
| 3 | **Sponsor Min Level** | Level 4 | `setSponsorMinLevel()` | Commission qualification |
| 4 | **Sponsor Fallback** | ROOT_USER | `setSponsorFallback()` | Unqualified commission destination |
| 5 | **Fee Receiver** | Set at deployment | `setFeeReceiver()` | Admin fee destination |
| 6 | **Royalty Vault** | Set at deployment | `setRoyaltyVault()` | Royalty pool contract |
| 7 | **Contract Paused** | false | `setPaused()` | Emergency stop |

### ❌ Hardcoded Settings (3)

| # | Setting | Value | Why Hardcoded | How to Change |
|---|---------|-------|---------------|---------------|
| 8 | **Admin Fee %** | 5% (all levels) | Prevents arbitrary fee increases | Contract upgrade required |
| 9 | **Royalty %** | [40, 30, 20, 10] | Maintains fair distribution | Contract upgrade required |
| 10 | **Royalty Levels** | [10, 11, 12, 13] | Consistent qualification | Contract upgrade required |

---

## 🎯 Quick Decision Guide

### Can I Change This Setting?

```
┌─────────────────────────────────┐
│   Need to change a setting?     │
└────────────┬────────────────────┘
             │
             ├─ Level Prices? ────────────────► ✅ YES - Use updateLevelPrices()
             │
             ├─ Sponsor Commission? ──────────► ✅ YES - Use setSponsorCommission()
             │
             ├─ Sponsor Min Level? ───────────► ✅ YES - Use setSponsorMinLevel()
             │
             ├─ Sponsor Fallback? ────────────► ✅ YES - Use setSponsorFallback()
             │
             ├─ Fee Receiver? ────────────────► ✅ YES - Use setFeeReceiver()
             │
             ├─ Royalty Vault? ───────────────► ✅ YES - Use setRoyaltyVault()
             │
             ├─ Pause Contract? ──────────────► ✅ YES - Use setPaused()
             │
             ├─ Admin Fee %? ─────────────────► ❌ NO - Hardcoded (upgrade needed)
             │
             ├─ Royalty Distribution? ────────► ❌ NO - Hardcoded (upgrade needed)
             │
             └─ Royalty Levels? ──────────────► ❌ NO - Hardcoded (upgrade needed)
```

---

## 🔧 Quick Commands

### View All Settings
```bash
npx hardhat run scripts/adminSettings.js view --network bscMainnet
```

### Update Configurable Settings
```bash
# Update prices (BNB = $600)
npx hardhat run scripts/adminSettings.js update-prices 600 --network bscMainnet

# Set sponsor commission to 7%
npx hardhat run scripts/adminSettings.js set-commission 7 --network bscMainnet

# Set minimum level to 5
npx hardhat run scripts/adminSettings.js set-min-level 5 --network bscMainnet

# Set fallback to ADMIN (1)
npx hardhat run scripts/adminSettings.js set-fallback 1 --network bscMainnet

# Pause contract
npx hardhat run scripts/adminSettings.js pause --network bscMainnet

# Resume contract
npx hardhat run scripts/adminSettings.js resume --network bscMainnet

# Update fee receiver
npx hardhat run scripts/adminSettings.js set-fee-receiver 0xNEW_ADDRESS --network bscMainnet

# Update royalty vault
npx hardhat run scripts/adminSettings.js set-royalty-vault 0xNEW_ADDRESS --network bscMainnet

# Emergency withdraw
npx hardhat run scripts/adminSettings.js emergency-withdraw --network bscMainnet
```

---

## 📋 Settings Priority

### Must Configure Immediately After Deployment
1. ⭐ **Level Prices** - CRITICAL (contract won't work without these)

### Should Configure Before Launch
2. **Fee Receiver** - Verify correct address
3. **Royalty Vault** - Verify correct address

### Optional Configuration (Has Sensible Defaults)
4. **Sponsor Commission** - Default 5% is reasonable
5. **Sponsor Min Level** - Default Level 4 is balanced
6. **Sponsor Fallback** - Default ROOT_USER works well

### Emergency Only
7. **Contract Paused** - Only use in emergencies

---

## 💰 Economic Impact Summary

### Configurable Settings Impact

| Setting Change | User Impact | Admin Impact | Growth Impact |
|----------------|-------------|--------------|---------------|
| **Increase Prices** | Pay more | - | Slower growth |
| **Decrease Prices** | Pay less | - | Faster growth |
| **Increase Commission** | Earn less | - | Better sponsor incentive |
| **Decrease Commission** | Earn more | - | Lower sponsor incentive |
| **Raise Min Level** | - | - | Higher quality sponsors |
| **Lower Min Level** | - | - | More sponsors qualify |
| **Change Fallback** | - | Varies | Depends on choice |

### Hardcoded Settings Impact (If Changed)

| Setting Change | User Impact | Trust Impact | Risk Level |
|----------------|-------------|--------------|------------|
| **Increase Admin Fee** | Pay more | ⚠️ Negative | 🔴 High |
| **Decrease Admin Fee** | Pay less | ✅ Positive | 🟢 Low |
| **Change Royalty %** | Varies | ⚠️ Negative | 🟡 Medium |
| **Change Royalty Levels** | Varies | ⚠️ Negative | 🟡 Medium |

---

## 🎯 Best Practices

### DO ✅
- Set level prices immediately after deployment
- Announce price changes 24-48 hours in advance
- Test all changes on testnet first
- Keep detailed logs of all updates
- Use multi-sig wallet for owner address
- Monitor contract after each change

### DON'T ❌
- Change prices without announcement
- Update settings during high traffic
- Change hardcoded values without strong reason
- Surprise users with changes
- Make multiple changes at once
- Skip testnet testing

---

## 🚨 Emergency Procedures

### If Something Goes Wrong

1. **Pause Contract Immediately**
   ```bash
   npx hardhat run scripts/adminSettings.js pause --network bscMainnet
   ```

2. **Assess the Issue**
   - What went wrong?
   - How many users affected?
   - Can it be fixed quickly?

3. **Fix or Rollback**
   - If fixable: Update setting
   - If not: Prepare for upgrade

4. **Resume Operations**
   ```bash
   npx hardhat run scripts/adminSettings.js resume --network bscMainnet
   ```

5. **Communicate**
   - Inform users what happened
   - Explain the fix
   - Apologize if needed

---

## 📚 Related Documentation

- [ADMIN_SETTINGS_COMPLETE.md](file:///f:/matrix/ADMIN_SETTINGS_COMPLETE.md) - Detailed guide for all settings
- [HARDCODED_SETTINGS_GUIDE.md](file:///f:/matrix/HARDCODED_SETTINGS_GUIDE.md) - How to change hardcoded settings
- [ADMIN_PRICE_MANAGEMENT.md](file:///f:/matrix/ADMIN_PRICE_MANAGEMENT.md) - Price management guide
- [PRICE_ADJUSTMENT_GUIDE.md](file:///f:/matrix/PRICE_ADJUSTMENT_GUIDE.md) - Price calculation guide
- [TEST_RESULTS.md](file:///f:/matrix/TEST_RESULTS.md) - Test results and verification

---

## ✅ Summary

### 10 Total Settings
- **7 Configurable** ✅ - Can change anytime via admin functions
- **3 Hardcoded** ❌ - Require contract upgrade to change

### Key Takeaways
1. **Level prices MUST be set** after deployment
2. **Most settings have good defaults** - only change if needed
3. **Hardcoded settings are hardcoded for good reason** - don't change unless absolutely necessary
4. **Always test on testnet first**
5. **Communicate all changes to users**

**You have full control over your platform! 🎮**
