# Environment Setup & DAO Governance Guide

## 📋 Environment Configuration

### Step 1: Copy .env.example to .env
```bash
cp .env.example .env
```

### Step 2: Configure Your .env File

```bash
# Deployment Wallet (needs BNB for gas)
PRIVATE_KEY=your_private_key_here

# Fee Receiver (receives 5% admin fees)
FEE_RECEIVER=0xYourFeeReceiverAddress

# Owner (DAO Multisig - HIGHLY RECOMMENDED)
OWNER=0xYourGnosisSafeMultisigAddress

# Root User Wallet (ID: 73928, receives fallback payments)
ROOT_USER_ADDRESS=0xYourRootUserWalletAddress
```

---

## 🎯 Deployment Process

### 1. Deploy Contract
```bash
npx hardhat run scripts/deploy.js --network opBNBTestnet
```

**What Happens:**
✅ RoyaltyVault deployed  
✅ UniversalMatrix deployed with constructor defaults  
✅ Root user (ID 73928) registered with your wallet  
✅ All system defaults set automatically  

### 2. All Default Values Set in Constructor

The contract sets these defaults automatically on deployment:

**✅ FIXED AFTER DEPLOYMENT (Not DAO Changeable)**

| Parameter | Default Value | Set in Constructor |
|-----------|--------------|-------------------|
| Max Level | 13 | ✅ Fixed |
| ROI Cap | 150% | ✅ Fixed |
| Income Layers | 13 | ✅ Fixed |
| Direct Required | 2 | ✅ Fixed |
| Royalty Dist Time | 24 hours | ✅ Fixed |
| Sponsor Min Level | 4 | ✅ Fixed |
| Perpetual Royalty Min Refs | 15 | ✅ Fixed |
| Registration Sponsor % | 90% | ✅ Fixed |
| Registration Royalty % | 5% | ✅ Fixed |
| Upgrade Income % | 85% | ✅ Fixed |
| Upgrade Sponsor % | 5% | ✅ Fixed |
| Upgrade Admin % | 5% | ✅ Fixed |
| Upgrade Royalty % | 5% | ✅ Fixed |

**🔐 DAO MULTISIG CONTROLLED (Critical Admin Functions Only)**

| Function | Purpose | DAO Required |
|----------|---------|--------------|
| Root User Address | Change root wallet | ✅ setRootUserAddress() |
| Emergency Withdraw | Drain contract | ✅ emergencyWithdraw() |
| Fee Receiver | Change fee wallet | ✅ setFeeReceiver() |

**Why This Design?**
- ✅ **Stability** - Core economics can't be changed after launch
- ✅ **Trust** - Users know exactly what they're getting into
- ✅ **Security** - Only critical admin functions need DAO approval
- ✅ **Simplicity** - DAO focuses on security, not economics

---

## 🔐 DAO Governance (Post-Deployment)

### DAO Controls Only Critical Admin Functions

The DAO multisig has control over **3 critical security/admin functions only**:

#### 1. Change Root User Address
```javascript
// Via Gnosis Safe
// Function: setRootUserAddress(address _newAddress)
// Requires: Multisig approval (2-of-3 or 3-of-5)
await matrix.setRootUserAddress("0xNewRootUserAddress");
```

#### 2. Emergency Withdraw
```javascript
// Function: emergencyWithdraw()
// Drains all contract BNB to owner (multisig)
// ONLY for genuine emergencies!
await matrix.emergencyWithdraw();
```

#### 3. Change Fee Receiver
```javascript
// Function: setFeeReceiver(address _newReceiver)
// Changes where admin fees are sent
await matrix.setFeeReceiver("0xNewFeeReceiverAddress");
```

### ⚠️ System Parameters are FIXED

**The following are SET ONCE at deployment and CANNOT be changed:**
- ❌ Max Level (13)
- ❌ ROI Cap (150%)
- ❌ Income Layers (13)
- ❌ Direct Required (2)
- ❌ Royalty Dist Time (24 hours)
- ❌ Sponsor Min Level (4)
- ❌ Perpetual Royalty Min Refs (15)
- ❌ All distribution percentages (90/5/5 splits)

**Why Fixed?**
- Users need to trust the economics won't change
- Prevents DAO from altering game rules mid-play
- Ensures fairness and transparency
- Only security/admin functions are DAO-controlled

---

## 🎭 Root User (ID: 73928)

### Automatically Set During Deployment
- **User ID**: 73928 (fixed, cannot change)
- **Wallet Address**: Set from `ROOT_USER_ADDRESS` in .env
- **Special Privileges**:
  - ✅ Unlimited earning potential (no ROI cap)
  - ✅ Receives fallback payments when no qualified upline
  - ✅ Never removed from royalty pools
  - ✅ Always qualifies for level income

### DAO Can Change Root User Wallet
```javascript
// Function: setRootUserAddress(address _newAddress)
// Requires: Multisig approval
await matrix.setRootUserAddress("0xNewRootUserWallet");
```

**Important Notes:**
- User ID 73928 stays the same
- Only the wallet address changes
- All existing root user benefits transfer to new address
- Recommended: Use multisig for root user wallet too!

---

## 🛡️ Security Best Practices

### 1. Use Multisig for Owner
- **Recommended**: Gnosis Safe 2-of-3 or 3-of-5
- **Location**: See [MULTISIG_OWNER_SETUP.md](MULTISIG_OWNER_SETUP.md)
- **Why**: No single person can change critical parameters

### 2. Use Multisig for Root User (Optional)
- Root user receives significant income
- Consider using separate multisig for root wallet
- Prevents single point of failure

### 3. Document All DAO Votes
- Keep records of parameter changes
- Announce changes to community
- Test on testnet first

---

## 📝 Example .env File (Complete)

```bash
# Deployment
PRIVATE_KEY=0x1234567890abcdef...

# Addresses
FEE_RECEIVER=0xYourFeeReceiverAddress
OWNER=0xYourGnosisSafeMultisig
ROOT_USER_ADDRESS=0xYourRootUserWallet

# RPC
OPBNB_TESTNET_RPC=https://opbnb-testnet-rpc.bnbchain.org
OPBNB_RPC=https://opbnb-mainnet-rpc.bnbchain.org

# API Keys (for verification)
BSCSCAN_API_KEY=your_bscscan_api_key
```

---

## ✅ Deployment Checklist

- [ ] Copy .env.example to .env
- [ ] Fill in all addresses in .env
- [ ] Get testnet BNB for deployment
- [ ] Deploy to testnet
- [ ] Verify root user (ID 73928) registered
- [ ] Test all functions
- [ ] Transfer ownership to multisig
- [ ] Deploy to mainnet
- [ ] Verify contracts on explorer
- [ ] Set up DAO governance process

---

## 🎯 Summary

✅ **All variables have default values** - Set in constructor  
✅ **Root user wallet configurable** - Set via .env  
✅ **DAO can change everything** - Via multisig owner  
✅ **Root user address changeable** - Via setRootUserAddress()  
✅ **Production-ready** - Secure and flexible  

**Everything is configurable through DAO governance after deployment!**
