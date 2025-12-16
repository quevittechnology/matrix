# Contract Size Issue - Options

## Current Status

**Problem:** Contract size exceeds Ethereum's 24,576 byte limit
- Current size: **25,166 bytes**
- Over limit by: **590 bytes**
- Optimizer runs: Already at minimum (10)

## What Was Converted

✅ **MAX_LEVEL** → `maxLevel` (configurable 10-20)  
✅ **ROI_CAP_PERCENT** → `roiCapPercent` (100-300%)  
✅ **INCOME_LAYERS** → `incomeLayers` (5-20 layers)  
✅ **DIRECT_REQUIRED** → `directRequired` (1-10)  
✅ **Removed unused ROYALTY_PERCENT**

All setter functions added with proper validation and events.

---

## Options to Resolve

### Option 1: Deploy to L2/Sidechain (RECOMMENDED)
**Action:** Deploy as-is to opBNB
- opBNB has NO 24KB limit
- You're already targeting opBNB
- **No code changes needed**
- All functionality preserved

**Pros:**
- ✅ Keep all features
- ✅ No compromises
- ✅ Ready to deploy now

**Cons:**
- ❌ Can't deploy to Ethereum mainnet (but you weren't planning to anyway)

---

### Option 2: Convert Only Critical Constants
**Action:** Keep only high-priority configurables
- Keep: `maxLevel`, `roiCapPercent`, `directRequired`
- Revert: `incomeLayers` back to constant

**Estimated savings:** ~300-400 bytes (may still be too large)

---

### Option 3: Use via-IR Compilation
**Action:** Enable experimental IR-based compiler
```javascript
// hardhat.config.js
settings: {
  via IR: true,
  optimizer: { enabled: true, runs: 10 }
}
```

**Pros:**
- Might reduce size significantly
- Keep all features

**Cons:**
- Experimental feature
- May have unexpected behavior
- Slower compilation

---

### Option 4: Remove Less-Used Features
**Action:** Remove rarely-used functionality
- Remove oracle/price feed features?
- Simplify some validation logic?

**Pros:**
- Reduces size
- Keeps new configurability

**Cons:**
- Loses features
- May impact functionality

---

## Recommendation

**Deploy to opBNB** (Option 1)

Since you're already targeting op BNB (as shown in your config files), this size limit is not an issue. opBNB doesn't have the 24KB contract size restriction.

**Next Steps:**
1. Continue with current implementation
2. Run tests
3. Deploy to opBNB testnet
4. Deploy to opBNB mainnet

All functionality preserved, no compromises needed!
