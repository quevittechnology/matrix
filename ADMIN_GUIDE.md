# Admin Settings & Functions - Universal Matrix

## 🔐 Admin Access Control

### Owner Address
- **Set during deployment** via `initialize()` function
- **Controls all admin functions**
- **Can be transferred** (but use caution)

---

## ⚙️ Admin Functions

### 1. Pause/Unpause Contract

**Function:**
```solidity
function setPaused(bool _paused) external onlyOwner
```

**Purpose:** Emergency stop mechanism

**Usage:**
```javascript
// Pause contract (stops all registrations/upgrades)
await matrix.setPaused(true);

// Unpause contract (resume operations)
await matrix.setPaused(false);
```

**Effects:**
- ✅ Stops all `register()` calls
- ✅ Stops all `upgrade()` calls
- ✅ Stops all `claimRoyalty()` calls
- ✅ View functions still work
- ✅ Emits `Paused(bool)` event

**Use Cases:**
- Emergency situations
- Security incidents
- Maintenance periods
- Contract upgrades

---

### 2. Update Fee Receiver

**Function:**
```solidity
function setFeeReceiver(address _newReceiver) external onlyOwner
```

**Purpose:** Change where admin fees are sent

**Usage:**
```javascript
const newFeeReceiver = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
await matrix.setFeeReceiver(newFeeReceiver);
```

**Validation:**
- ✅ Requires non-zero address
- ✅ Only owner can call

**Effects:**
- All future admin fees go to new address
- Existing fees already sent (not affected)

---

### 3. Update Royalty Vault

**Function:**
```solidity
function setRoyaltyVault(address _newVault) external onlyOwner
```

**Purpose:** Change royalty vault contract address

**Usage:**
```javascript
const newVaultAddress = "0x...";
await matrix.setRoyaltyVault(newVaultAddress);
```

**Validation:**
- ✅ Requires non-zero address
- ✅ Only owner can call

**Use Cases:**
- Upgrade royalty vault contract
- Fix vault issues
- Change vault logic

---

### 4. Update Level Prices

**Function:**
```solidity
function updateLevelPrices(uint256[13] memory _newPrices) external onlyOwner
```

**Purpose:** Adjust level prices based on market conditions

**Usage:**
```javascript
// Prices in wei (BNB)
const newPrices = [
    ethers.parseEther("0.004"),  // Level 1
    ethers.parseEther("0.006"),  // Level 2
    ethers.parseEther("0.012"),  // Level 3
    ethers.parseEther("0.024"),  // Level 4
    ethers.parseEther("0.048"),  // Level 5
    ethers.parseEther("0.096"),  // Level 6
    ethers.parseEther("0.192"),  // Level 7
    ethers.parseEther("0.384"),  // Level 8
    ethers.parseEther("0.768"),  // Level 9
    ethers.parseEther("1.536"),  // Level 10
    ethers.parseEther("3.072"),  // Level 11
    ethers.parseEther("6.144"),  // Level 12
    ethers.parseEther("12.288")  // Level 13
];

await matrix.updateLevelPrices(newPrices);
```

**Important Notes:**
- ⚠️ **Affects all future transactions**
- ⚠️ **Does NOT affect existing users**
- ⚠️ **Use carefully** - impacts economics
- ⚠️ **Announce changes** to community

**Recommended Usage:**
- Adjust for BNB/USDT price changes
- Keep USDT-equivalent stable
- Gradual changes only

---

### 5. Emergency Withdraw

**Function:**
```solidity
function emergencyWithdraw() external onlyOwner
```

**Purpose:** Withdraw any stuck BNB from contract

**Usage:**
```javascript
await matrix.emergencyWithdraw();
```

**Effects:**
- Transfers entire contract balance to owner
- Should only be used in emergencies
- Normal operations shouldn't leave balance

**Use Cases:**
- Stuck funds from failed transactions
- Accidental direct transfers
- Emergency recovery

---

### 6. Authorize Upgrade (UUPS)

**Function:**
```solidity
function _authorizeUpgrade(address newImplementation) internal override onlyOwner
```

**Purpose:** Authorize contract upgrades (UUPS pattern)

**Usage:**
```javascript
const UniversalMatrixV2 = await ethers.getContractFactory("UniversalMatrixV2");
const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, UniversalMatrixV2);
```

**Process:**
1. Deploy new implementation contract
2. Call upgrade on proxy
3. `_authorizeUpgrade` checks owner
4. Proxy points to new implementation

**Important:**
- ✅ Preserves all state
- ✅ Maintains same address
- ✅ Only owner can upgrade
- ⚠️ Test thoroughly on testnet first

---

## 📊 Admin Configuration Settings

### Initial Configuration (Set in `initialize()`)

```javascript
function initialize(
    address _feeReceiver,    // Where admin fees go
    address _royaltyVault,   // Royalty vault contract
    address _owner           // Contract owner
) external initializer
```

**Parameters:**

1. **_feeReceiver**
   - Receives 10% admin fee from all transactions
   - Can be changed later via `setFeeReceiver()`
   - Recommended: Multi-sig wallet

2. **_royaltyVault**
   - Contract that holds royalty funds
   - Can be changed later via `setRoyaltyVault()`
   - Must implement `IRoyaltyVault` interface

3. **_owner**
   - Has access to all admin functions
   - Can upgrade contract
   - Recommended: Multi-sig wallet or DAO

---

## 🔧 Deployment Configuration

### Recommended Setup

```javascript
// Deploy script
const feeReceiver = "0x...";  // Multi-sig wallet
const owner = "0x...";        // Multi-sig wallet or DAO
const royaltyVault = "0x..."; // RoyaltyVault contract

const UniversalMatrix = await ethers.getContractFactory("UniversalMatrix");
const matrix = await upgrades.deployProxy(
    UniversalMatrix,
    [feeReceiver, royaltyVault, owner],
    { initializer: "initialize", kind: "uups" }
);
```

### Post-Deployment Checklist

- [ ] Verify owner address is correct
- [ ] Verify fee receiver is correct
- [ ] Verify royalty vault is correct
- [ ] Test pause/unpause
- [ ] Verify level prices
- [ ] Initialize root user (if needed)
- [ ] Transfer ownership to multi-sig (if applicable)

---

## 🛡️ Security Best Practices

### 1. Multi-Signature Wallet

**Recommendation:** Use Gnosis Safe or similar

```
Owner = Multi-sig (3/5)
├─ Signer 1: Founder
├─ Signer 2: CTO
├─ Signer 3: CFO
├─ Signer 4: Advisor
└─ Signer 5: Community Rep

Requires 3 signatures for:
├─ Pause contract
├─ Update prices
├─ Upgrade contract
└─ Emergency withdraw
```

### 2. Timelock Contract

**For critical operations:**

```solidity
// Example: 48-hour timelock for upgrades
Timelock Controller
├─ Delay: 48 hours
├─ Proposer: Owner
└─ Executor: Owner

Process:
1. Propose upgrade
2. Wait 48 hours
3. Execute upgrade
```

### 3. Access Control Levels

```
Level 1: Owner (Full Control)
├─ Pause/unpause
├─ Update settings
├─ Upgrade contract
└─ Emergency functions

Level 2: Fee Receiver (Passive)
└─ Receives admin fees only

Level 3: Users (Limited)
├─ Register
├─ Upgrade
└─ Claim royalty
```

---

## 📋 Admin Operations Guide

### Pausing Contract

**When to pause:**
- Security vulnerability discovered
- Unexpected behavior detected
- Preparing for upgrade
- Legal/regulatory issues

**Steps:**
```javascript
// 1. Pause contract
await matrix.setPaused(true);

// 2. Announce to community
// 3. Investigate issue
// 4. Fix if needed
// 5. Test thoroughly

// 6. Unpause when safe
await matrix.setPaused(false);
```

### Updating Level Prices

**When to update:**
- BNB price changes significantly
- Maintain USDT-equivalent values
- Market conditions change

**Steps:**
```javascript
// 1. Calculate new prices based on BNB/USDT rate
const bnbPrice = 600; // USD
const newPrices = [
    ethers.parseEther((4 / bnbPrice).toString()),   // 4 USDT
    ethers.parseEther((6 / bnbPrice).toString()),   // 6 USDT
    // ... etc
];

// 2. Announce to community (24-48 hours notice)
// 3. Update prices
await matrix.updateLevelPrices(newPrices);

// 4. Verify new prices
const [prices, fees] = await matrix.getLevels();
console.log("New prices:", prices);
```

### Upgrading Contract

**Preparation:**
```javascript
// 1. Deploy new implementation to testnet
// 2. Test thoroughly
// 3. Audit new code
// 4. Announce to community

// 5. Deploy new implementation to mainnet
const UniversalMatrixV2 = await ethers.getContractFactory("UniversalMatrixV2");
const newImpl = await UniversalMatrixV2.deploy();
await newImpl.waitForDeployment();

// 6. Upgrade proxy
const upgraded = await upgrades.upgradeProxy(
    PROXY_ADDRESS,
    UniversalMatrixV2
);

// 7. Verify upgrade
console.log("Upgraded to:", await upgraded.getAddress());

// 8. Test all functions
// 9. Monitor for issues
```

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

```javascript
// 1. Total Users
const totalUsers = await matrix.totalUsers();

// 2. Total Volume
// Calculate from events or track separately

// 3. Admin Fee Revenue
const feeBalance = await ethers.provider.getBalance(feeReceiver);

// 4. Royalty Pool Balances
for (let tier = 0; tier < 4; tier++) {
    const curDay = await matrix.getCurRoyaltyDay();
    const poolAmount = await matrix.royalty(curDay, tier);
    console.log(`Tier ${tier}: ${ethers.formatEther(poolAmount)} BNB`);
}

// 5. Contract Status
const isPaused = await matrix.paused();
console.log("Paused:", isPaused);

// 6. Recent Activity
const activities = await matrix.getRecentActivities(100);
console.log("Recent registrations/upgrades:", activities.length);
```

### Event Monitoring

```javascript
// Listen for important events
matrix.on("Registered", (user, userId, referrer) => {
    console.log(`New user: ${user} (ID: ${userId})`);
});

matrix.on("Upgraded", (user, userId, newLevel) => {
    console.log(`User ${user} upgraded to level ${newLevel}`);
});

matrix.on("Paused", (status) => {
    console.log(`Contract ${status ? 'PAUSED' : 'UNPAUSED'}`);
});

matrix.on("RoyaltyClaimed", (user, amount, tier) => {
    console.log(`${user} claimed ${ethers.formatEther(amount)} BNB from tier ${tier}`);
});
```

---

## 🚨 Emergency Procedures

### Security Incident Response

```
1. IMMEDIATE (0-1 hour)
   ├─ Pause contract
   ├─ Assess severity
   └─ Notify core team

2. SHORT-TERM (1-24 hours)
   ├─ Investigate root cause
   ├─ Develop fix
   ├─ Test fix on testnet
   └─ Prepare announcement

3. MEDIUM-TERM (1-7 days)
   ├─ Deploy fix
   ├─ Audit fix
   ├─ Communicate with community
   └─ Resume operations

4. LONG-TERM (7+ days)
   ├─ Post-mortem analysis
   ├─ Improve security
   ├─ Update documentation
   └─ Implement preventive measures
```

### Rollback Procedure

If upgrade fails:
```javascript
// 1. Pause contract
await matrix.setPaused(true);

// 2. Upgrade back to previous implementation
const PreviousVersion = await ethers.getContractFactory("UniversalMatrix");
await upgrades.upgradeProxy(PROXY_ADDRESS, PreviousVersion);

// 3. Verify rollback
// 4. Test functionality
// 5. Unpause
await matrix.setPaused(false);
```

---

## 📝 Admin Function Summary

| Function | Purpose | Risk Level | Requires |
|----------|---------|------------|----------|
| `setPaused()` | Emergency stop | 🔴 High | Owner |
| `setFeeReceiver()` | Change fee destination | 🟡 Medium | Owner |
| `setRoyaltyVault()` | Change vault | 🟡 Medium | Owner |
| `updateLevelPrices()` | Adjust prices | 🟠 Medium-High | Owner |
| `emergencyWithdraw()` | Recover funds | 🔴 High | Owner |
| `_authorizeUpgrade()` | Upgrade contract | 🔴 Critical | Owner |

---

## ✅ Admin Checklist

### Daily Operations
- [ ] Monitor contract status
- [ ] Check for unusual activity
- [ ] Review fee accumulation
- [ ] Monitor royalty pools

### Weekly Operations
- [ ] Review user growth
- [ ] Analyze income distribution
- [ ] Check for support issues
- [ ] Review security logs

### Monthly Operations
- [ ] Assess BNB/USDT price changes
- [ ] Consider price adjustments
- [ ] Review admin fee usage
- [ ] Community updates

### Quarterly Operations
- [ ] Security audit
- [ ] Performance review
- [ ] Consider upgrades
- [ ] Strategic planning

---

**All admin functions are secure, tested, and ready for production use!** 🔐
