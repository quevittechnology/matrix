# Hardcoded Constants Analysis - UniversalMatrix.sol

## Summary

Found **6 hardcoded constants** remaining in the contract after distribution percentage changes.

---

## 📋 Identified Constants

### 1. `MAX_LEVEL = 13`
**Location:** Line 45  
**Current Value:** `13`  
**Usage:** Maximum upgrade level  

**Recommendation:** ⚠️ **Consider making configurable**
- Allows flexibility to expand levels in future
- Affects: upgrade limits, level arrays, income distribution

---

### 2. `ROI_CAP_PERCENT = 150`
**Location:** Line 46  
**Current Value:** `150` (150% ROI cap)  
**Usage:** Maximum return on investment for royalty income  

**Recommendation:** ⚠️ **Consider making configurable**
- Economic parameter that may need adjustment
- Currently applies to royalty income only
- Root user exempt from cap

---

### 3. `INCOME_LAYERS = 13`
**Location:** Line 47  
**Current Value:** `13`  
**Usage:** Income distribution limited to 13 layers deep  

**Recommendation:** ⚠️ **Consider making configurable**
- Affects how deep income searches in matrix
- Tied to `MAX_LEVEL` but could be independent
- Performance vs distribution tradeoff

---

### 4. `DIRECT_REQUIRED = 2`
**Location:** Line 48  
**Current Value:** `2`  
**Usage:** Minimum direct referrals required for qualification  

**Recommendation:** ⚠️ **Consider making configurable**
- Important qualification criterion
- Affects income eligibility
- May want different values for testing/scaling

---

### 5. `ROYALTY_DIST_TIME = 24 hours`
**Location:** Line 49  
**Current Value:** `24 hours`  
**Usage:** Royalty distribution cycle time  

**Recommendation:** ✅ **Keep as constant**
- Time-based constant for royalty cycles
- Stable value that shouldn't change
- Changing could cause accounting issues

---

### 6. `ROYALTY_PERCENT = 5`
**Location:** Line 50  
**Current Value:** `5` (5% of deposits)  
**Usage:** Referenced but **NOT ACTIVELY USED**  

**Status:** ⚠️ **UNUSED CONSTANT - Can be removed**
- Replaced by `upgradeRoyaltyPercent` (configurable)
- Leftover from previous implementation
- Safe to delete

---

## 🎯 Recommendations

### High Priority (Make Configurable)

1. **`DIRECT_REQUIRED`** → `directRequired`
   - Most likely to need adjustment
   - Affects user qualification significantly
   - Easy to make configurable

2. **`ROI_CAP_PERCENT`** → `roiCapPercent`
   - Economic parameter
   - May need adjustment based on market conditions
   - Important for sustainability

### Medium Priority (Consider Making Configurable)

3. **`MAX_LEVEL`** → `maxLevel`
   - Future expansion may require more levels
   - Requires careful implementation (affects arrays)
   
4. **`INCOME_LAYERS`** → `incomeLayers`
   - Affects distribution depth
   - Performance consideration

### Low Priority (Keep as Constants)

5. **`ROYALTY_DIST_TIME`** - Keep as is
   - Stable time-based value
   - Changing could cause issues

6. **`ROYALTY_PERCENT`** - **DELETE**
   - Unused, replaced by configurable version

---

## 💡 Implementation Suggestions

### Quick Win: Remove Unused Constant

```solidity
// DELETE LINE 50:
// uint256 public constant ROYALTY_PERCENT = 5; // NOT USED
```

### Make DIRECT_REQUIRED Configurable

```solidity
// Replace constant
uint256 public directRequired; // Minimum direct referrals required

// In initialize()
directRequired = 2; // Default

// Add setter
function setDirectRequired(uint256 _required) external onlyOwner {
    require(_required >= 1 && _required <= 10, "Invalid requirement");
    directRequired = _required;
    emit DirectRequiredUpdated(_required);
}
```

### Make ROI_CAP_PERCENT Configurable

```solidity
// Replace constant
uint256 public roiCapPercent; // ROI cap percentage

// In initialize()
roiCapPercent = 150; // Default 150%

// Add setter
function setRoiCap(uint256 _capPercent) external onlyOwner {
    require(_capPercent >= 100 && _capPercent <= 300, "Invalid cap");
    roiCapPercent = _capPercent;
    emit RoiCapUpdated(_capPercent);
}
```

---

## 📊 Priority Matrix

| Constant | Priority | Impact | Ease | Recommendation |
|----------|----------|--------|------|----------------|
| `ROYALTY_PERCENT` | ⚡ High | Low | Easy | **Delete (unused)** |
| `DIRECT_REQUIRED` | ⚡ High | High | Easy | **Make configurable** |
| `ROI_CAP_PERCENT` | 🟡 Medium | High | Easy | **Make configurable** |
| `MAX_LEVEL` | 🟡 Medium | Medium | Hard | Consider configurable |
| `INCOME_LAYERS` | 🟢 Low | Medium | Medium | Consider configurable |
| `ROYALTY_DIST_TIME` | 🟢 Low | Low | N/A | **Keep as constant** |

---

## 🚀 Recommended Action Plan

### Phase 1: Cleanup (Immediate)
1. ✅ Remove `ROYALTY_PERCENT` constant (unused)

### Phase 2: High-Value Configurability
2. Make `DIRECT_REQUIRED` configurable
3. Make `ROI_CAP_PERCENT` configurable

### Phase 3: Advanced (Optional)
4. Consider `MAX_LEVEL` and `INCOME_LAYERS` if needed

---

## ⚠️ Important Notes

- **Backward Compatibility:** Keep default values same as current constants
- **Validation:** All configurable values need proper bounds checking
- **Events:** Emit events for transparency on all changes
- **Testing:** Update tests for each new configurable parameter

---

**Total Hardcoded Constants:** 6  
**Recommended for Removal:** 1 (unused)  
**Recommended for Configuration:** 2-4 (based on priority)
