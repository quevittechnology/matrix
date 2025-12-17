# 👑 Royalty Vault System Explained

## What is the Royalty Vault?

The **Royalty Vault** is a **separate smart contract** that receives and distributes royalty pool funds to qualified top-tier users.

---

## 🎯 Purpose

### Why Separate Contract?

1. **Separation of Concerns** - Clean architecture
2. **Gas Optimization** - Distribute funds efficiently
3. **Upgradeable** - Can update vault logic independently
4. **Transparent** - Clear fund tracking

---

## 💰 How It Works

### 1. Fund Collection

**UniversalMatrix** sends royalty funds to the vault:

```
User Registers → 5% goes to Royalty Vault
User Upgrades → 5% goes to Royalty Vault
```

### 2. Who Qualifies?

**4 Tiers** of royalty qualification:

| Tier | Level Required | Direct Referrals | Share |
|------|----------------|------------------|-------|
| 1    | Level 10       | 10 directs       | 40%   |
| 2    | Level 11       | 11 directs       | 30%   |
| 3    | Level 12       | 12 directs       | 20%   |
| 4    | Level 13       | 13 directs       | 10%   |

**All configurable!**

### 3. Distribution Cycle

- **Time Period:** Every 24 hours (configurable via `royaltyDistTime`)
- **Automatic:** Vault calculates and stores qualified users
- **Manual Claim:** Users withdraw their share when ready

---

## 🔧 Interface

The UniversalMatrix uses this interface to communicate with the vault:

```solidity
interface IRoyaltyVault {
    function deposit() external payable;
}
```

Simple! UniversalMatrix just sends funds - the vault handles the rest.

---

## 📊 Royalty Flow Diagram

```
┌─────────────────────────────────────────────┐
│         UniversalMatrix Contract            │
│                                             │
│  Registration (5%) ──┐                     │
│  Upgrade (5%) ───────┼─→ Royalty Pool      │
│                      │                      │
└──────────────────────┼──────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │   Royalty Vault      │
            │  (Separate Contract) │
            └──────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   Tier 1 (40%)   Tier 2 (30%)   Tier 3 (20%)  Tier 4 (10%)
   Level 10+      Level 11+      Level 12+     Level 13
   10 directs     11 directs     12 directs    13 directs
```

---

## 🎓 Configuration

### In UniversalMatrix Contract

```javascript
// Set royalty vault address
await matrix.setRoyaltyVault("0xVaultAddress");

// Configure tier percentages
await matrix.setRoyaltyPercent([40, 30, 20, 10]); // Must total 100%

// Configure tier levels
await matrix.setRoyaltyLevels([10, 11, 12, 13]);

// Configure direct requirements
await matrix.setRoyaltyDirectRequired([10, 11, 12, 13]);

// Configure distribution cycle
await matrix.setRoyaltyDistTime(24 * 3600); // 24 hours
```

---

## 💡 How Royalty is Sent

### From Registration
```solidity
// User pays 0.01 BNB to register
Total: 0.01 BNB
├─ Admin Fee (0.0005 BNB) → Fee Receiver
├─ Sponsor (0.009 BNB) → Referrer
└─ Royalty (0.0005 BNB) → Royalty Vault ✅
```

### From Upgrades
```solidity
// User pays 0.02 BNB to upgrade to Level 2
Total: 0.02 BNB
├─ Income (0.017 BNB) → Upline
├─ Sponsor (0.001 BNB) → Direct Sponsor
├─ Admin (0.001 BNB) → Admin
└─ Royalty (0.001 BNB) → Royalty Vault ✅
```

---

## 📈 Example Scenario

### Pool Accumulation
```
Day 1:
- 100 registrations × 0.0005 = 0.05 BNB
- 50 upgrades × 0.001 avg = 0.05 BNB
Total in vault: 0.1 BNB
```

### Distribution (Day 2)
```
Qualified Users:
- Tier 1: 5 users → Share 40% (0.04 BNB) = 0.008 BNB each
- Tier 2: 3 users → Share 30% (0.03 BNB) = 0.01 BNB each
- Tier 3: 2 users → Share 20% (0.02 BNB) = 0.01 BNB each
- Tier 4: 1 user  → Share 10% (0.01 BNB) = 0.01 BNB each
```

---

## 🔐 Security Features

### UniversalMatrix Side
- ✅ Only sends to configured vault address
- ✅ Owner can update vault address
- ✅ Emits events for transparency

### Vault Side (Best Practices)
- ✅ Should have withdrawal mechanism
- ✅ Should track qualified users
- ✅ Should prevent double-claiming
- ✅ Should have emergency controls

---

## 🎯 Benefits

### For Users
- **Passive Income** - Earn from global pool
- **Top-Tier Rewards** - Incentive to level up
- **Transparent** - On-chain distribution

### For Platform
- **Retention** - Users stay to reach top tiers
- **Activity** - Encourages network growth
- **Fair** - Algorithmic distribution

---

## 🚀 Deployment

### Deploy Royalty Vault First
```javascript
const RoyaltyVault = await ethers.getContractFactory("RoyaltyVault");
const vault = await RoyaltyVault.deploy();
await vault.deployed();
console.log("Vault:", vault.address);
```

### Configure in UniversalMatrix
```javascript
await matrix.initialize(
    defaultReferAddress,
    feeReceiverAddress,
    vault.address  // ← Royalty vault address
);
```

### Or Update Later
```javascript
await matrix.setRoyaltyVault(newVaultAddress);
```

---

## ❓ FAQ

### Can I change the vault address?
**Yes!** Use `setRoyaltyVault(address)` - owner only.

### Can I change tier percentages?
**Yes!** Use `setRoyaltyPercent([40,30,20,10])` - must total 100%.

### Can I change qualification levels?
**Yes!** Use `setRoyaltyLevels([10,11,12,13])` - must be ascending.

### Can I change direct requirements?
**Yes!** Use `setRoyaltyDirectRequired([10,11,12,13])`.

### What happens to unclaimed royalties?
Depends on vault implementation - typically roll over to next cycle.

### Can I have more/fewer tiers?
Currently fixed at 4 tiers in the contract.

---

## 📝 Summary

**Royalty Vault = Separate Contract**
- Receives 5% from registrations
- Receives 5% from upgrades
- Distributes to qualified top-tier users
- Configurable percentages, levels, requirements
- Works independently from main contract

**Key Point:** UniversalMatrix just sends funds → Vault handles distribution logic

---

## 🔗 Related Settings

View all royalty settings:
```javascript
const royaltyPercent = await matrix.royaltyPercent(0); // Tier 1: 40%
const royaltyLevel = await matrix.royaltyLevel(0);     // Tier 1: Level 10
const royaltyDirect = await matrix.royaltyDirectRequired(0); // Tier 1: 10 directs
const distTime = await matrix.royaltyDistTime();        // 24 hours
const vaultAddress = await matrix.royaltyVault();       // Vault contract
```

**The Royalty Vault is your top-tier user reward system!** 👑
