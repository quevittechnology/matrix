# Contract Upgrade Guide

## 🔄 How to Upgrade Your UniversalMatrix Contract

Your contract uses the **UUPS (Universal Upgradeable Proxy Standard)** pattern, which allows you to upgrade the contract logic while preserving:
- ✅ Contract address (stays the same)
- ✅ All user data and balances
- ✅ All state variables
- ✅ Contract ownership

---

## 📋 Understanding UUPS Upgrades

### What is UUPS?

UUPS is an upgradeable proxy pattern where:
- **Proxy Contract** - Holds all the data and delegates calls to implementation
- **Implementation Contract** - Contains the actual logic/code
- **Upgrading** - Deploys new implementation and updates proxy to point to it

### Key Benefits

1. **Same Address** - Users interact with the same contract address
2. **Preserve Data** - All user balances, IDs, and state remain intact
3. **Fix Bugs** - Deploy fixes without losing data
4. **Add Features** - Add new functionality to existing contract

---

## ⚠️ CRITICAL UPGRADE RULES

### ✅ Safe to Do:
1. **Add new functions** - New features are OK
2. **Modify function logic** - Change how existing functions work
3. **Add new state variables AT THE END** - Only append, never insert
4. **Fix bugs** - Correct errors in logic

### ❌ NEVER Do:
1. **Remove state variables** - Will corrupt storage
2. **Reorder state variables** - Will corrupt storage
3. **Change variable types** - Will corrupt storage
4. **Insert variables in the middle** - Will corrupt storage
5. **Remove the `_authorizeUpgrade` function** - Will break upgradeability

---

## 🚀 How to Upgrade (Step-by-Step)

### Step 1: Modify Your Contract

Edit `contracts/UniversalMatrix.sol` with your changes:

```solidity
// Example: Adding a new feature
contract UniversalMatrix is 
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    // ✅ EXISTING VARIABLES - DO NOT MODIFY ORDER
    uint256 public constant MAX_LEVEL = 13;
    IRoyaltyVault public royaltyVault;
    address public feeReceiver;
    uint256 public defaultRefer;
    // ... all existing variables ...
    
    // ✅ NEW VARIABLES - ADD AT THE END ONLY
    uint256 public newFeature;  // Safe to add here
    mapping(uint256 => uint256) public newMapping;  // Safe to add here
    
    // ✅ NEW FUNCTIONS - Safe to add anywhere
    function newFunction() external {
        // Your new logic
    }
    
    // ✅ MODIFY EXISTING FUNCTIONS - Safe
    function existingFunction() external {
        // Updated logic
    }
    
    // ✅ REQUIRED - Keep this function
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyOwner 
    {}
}
```

### Step 2: Compile the Contract

```bash
npx hardhat compile
```

**Expected Output:**
```
Compiled 1 Solidity file successfully
```

### Step 3: Run Tests

```bash
npx hardhat test
```

**Make sure all tests pass!**

### Step 4: Upgrade on Testnet First

```bash
npx hardhat run scripts/upgrade-contract.js --network opBNBTestnet
```

**Expected Output:**
```
🔄 Starting Contract Upgrade...

📋 Upgrade Details:
Network: opBNBTestnet
Deployer: 0x...
Balance: 0.5 BNB

📍 Current Proxy Address: 0x...
📝 Current Implementation: 0x...

🔍 Validating upgrade compatibility...
✅ Upgrade validation passed!

🚀 Upgrading contract...
✅ UPGRADE SUCCESSFUL!

📍 Proxy Address (unchanged): 0x...
📝 New Implementation: 0x...
```

### Step 5: Test the Upgraded Contract

```bash
npx hardhat run scripts/test-deployment.js --network opBNBTestnet
```

Verify:
- ✅ All existing data is intact
- ✅ New features work correctly
- ✅ Old features still work
- ✅ No data corruption

### Step 6: Upgrade on Mainnet

**Only after thorough testnet testing!**

```bash
npx hardhat run scripts/upgrade-contract.js --network opBNB
```

---

## 🔍 Upgrade Script Features

The `upgrade-contract.js` script automatically:

1. **Validates Upgrade** - Checks for storage layout conflicts
2. **Deploys New Implementation** - Creates new contract code
3. **Updates Proxy** - Points proxy to new implementation
4. **Preserves Data** - All state variables remain intact
5. **Updates Deployment File** - Saves upgrade history
6. **Verifies Success** - Confirms contract is accessible

---

## 📊 Example Upgrade Scenarios

### Scenario 1: Fix a Bug

**Problem:** Level income distribution has a bug

**Solution:**
1. Fix the bug in `_distUpgrading` function
2. Compile and test
3. Run upgrade script
4. Bug is fixed, all data preserved

### Scenario 2: Add New Feature

**Problem:** Want to add a withdrawal fee

**Solution:**
```solidity
// Add new variable at the end
uint256 public withdrawalFeePercent;

// Add new function
function setWithdrawalFee(uint256 _percent) external onlyOwner {
    require(_percent <= 10, "Max 10%");
    withdrawalFeePercent = _percent;
}
```

### Scenario 3: Modify Existing Logic

**Problem:** Want to change commission calculation

**Solution:**
1. Modify the `_payIncome` function logic
2. Test thoroughly
3. Upgrade contract
4. New logic applies immediately

---

## 🔐 Security Considerations

### Before Upgrading:

1. **Audit Changes** - Review all modifications
2. **Test Extensively** - Run all tests multiple times
3. **Test on Testnet** - Deploy to testnet first
4. **Verify Storage Layout** - Ensure no storage conflicts
5. **Backup Deployment Info** - Save current addresses

### During Upgrade:

1. **Use Owner Account** - Only owner can upgrade
2. **Monitor Gas Prices** - Upgrade during low gas periods
3. **Have Backup Plan** - Know how to rollback if needed

### After Upgrade:

1. **Verify on Explorer** - Check new implementation
2. **Test All Functions** - Ensure everything works
3. **Monitor Events** - Watch for unusual activity
4. **Update Frontend** - If ABI changed, update UI

---

## 🛡️ Upgrade Safety Checklist

### Pre-Upgrade Checklist:
- [ ] Contract modifications reviewed
- [ ] All tests passing
- [ ] Storage layout validated
- [ ] Tested on testnet
- [ ] Deployment info backed up
- [ ] Team notified of upgrade

### Post-Upgrade Checklist:
- [ ] New implementation verified on explorer
- [ ] All existing functions tested
- [ ] New features tested
- [ ] User data verified intact
- [ ] Events monitoring set up
- [ ] Frontend updated (if needed)

---

## 🔄 Rollback (Emergency)

If something goes wrong, you can rollback:

```javascript
// In upgrade-contract.js, modify to use old implementation
const oldImplementation = "0x..."; // Previous implementation address
await upgrades.upgradeProxy(proxyAddress, UniversalMatrixV1, {
    implementation: oldImplementation
});
```

**Note:** Only possible if you saved the old implementation address!

---

## 📝 Upgrade History Tracking

The upgrade script automatically saves upgrade history:

```json
{
  "upgraded": {
    "timestamp": "2025-12-16T08:30:00Z",
    "oldImplementation": "0x...",
    "newImplementation": "0x...",
    "upgrader": "0x..."
  }
}
```

---

## 💡 Best Practices

### 1. Version Your Contracts
```solidity
contract UniversalMatrix {
    string public constant VERSION = "2.0.0";
}
```

### 2. Add Upgrade Events
```solidity
event ContractUpgraded(
    address indexed oldImplementation,
    address indexed newImplementation,
    uint256 timestamp
);
```

### 3. Test Upgrade Path
- Test upgrading from V1 → V2
- Test upgrading from V2 → V3
- Ensure smooth upgrade path

### 4. Document Changes
- Keep changelog of modifications
- Document new features
- Note breaking changes

---

## 🚨 Common Upgrade Errors

### Error: "Storage layout is incompatible"
**Cause:** Changed order of state variables  
**Solution:** Only add new variables at the end

### Error: "Contract is not upgradeable"
**Cause:** Missing `_authorizeUpgrade` function  
**Solution:** Ensure function exists and is correct

### Error: "Caller is not the owner"
**Cause:** Not using owner account  
**Solution:** Use the owner wallet to upgrade

### Error: "Upgrade validation failed"
**Cause:** Unsafe storage changes  
**Solution:** Review storage layout changes

---

## 📚 Additional Resources

### OpenZeppelin Upgrades Documentation
- https://docs.openzeppelin.com/upgrades-plugins/
- https://docs.openzeppelin.com/contracts/4.x/api/proxy

### UUPS Pattern
- https://eips.ethereum.org/EIPS/eip-1822

### Hardhat Upgrades Plugin
- https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades

---

## 🎯 Quick Reference

### Upgrade Command
```bash
npx hardhat run scripts/upgrade-contract.js --network <network>
```

### Networks
- `opBNBTestnet` - For testing
- `opBNB` - For production

### Check Current Implementation
```javascript
const implementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);
```

### Validate Upgrade
```javascript
await upgrades.validateUpgrade(proxyAddress, NewContract);
```

---

## ✅ Summary

**Upgrading your contract:**
1. Modify contract (follow safety rules)
2. Compile and test
3. Upgrade on testnet
4. Test thoroughly
5. Upgrade on mainnet
6. Verify and monitor

**Key Points:**
- ✅ Proxy address never changes
- ✅ All data is preserved
- ✅ Only owner can upgrade
- ✅ Always test on testnet first
- ⚠️ Never modify storage layout

**Your contract is upgradeable and ready for future improvements!** 🚀
