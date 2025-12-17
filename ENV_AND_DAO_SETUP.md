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

| Parameter | Default Value | Changeable via DAO |
|-----------|--------------|-------------------|
| Max Level | 13 | ✅ setMaxLevel() |
| ROI Cap | 150% | ✅ setRoiCap() (max 300%) |
| Income Layers | 13 | ✅ setIncomeLayers() (max 30) |
| Direct Required | 2 | ✅ setDirectRequired() |
| Royalty Dist Time | 24 hours | ✅ setRoyaltyDistTime() |
| Sponsor Min Level | 4 | ✅ setSponsorMinLevel() |
| Perpetual Royalty Min Refs | 15 | ✅ setPerpetualRoyaltyMinReferrals() |
| Registration Sponsor % | 90% | ✅ setRegistrationDistribution() |
| Registration Royalty % | 5% | ✅ setRegistrationDistribution() |
| Upgrade Income % | 85% | ✅ setUpgradeDistribution() |
| Upgrade Sponsor % | 5% | ✅ setUpgradeDistribution() |
| Upgrade Admin % | 5% | ✅ setUpgradeDistribution() |
| Upgrade Royalty % | 5% | ✅ setUpgradeDistribution() |

---

## 🔐 DAO Governance (Post-Deployment)

### Step 1: Transfer Ownership to Multisig

**If you deployed with EOA (single wallet):**
```javascript
// Connect to deployed contract
const matrix = await ethers.getContractAt("UniversalMatrix", "CONTRACT_ADDRESS");

// Transfer to Gnosis Safe multisig
const MULTISIG_ADDRESS = "0xYourGnosisSafeAddress";
await matrix.transferOwnership(MULTISIG_ADDRESS);
```

### Step 2: DAO Can Change Any Parameter

All admin functions now require multisig approval (2-of-3 or 3-of-5 signatures):

#### Change Root User Address
```javascript
// Via Gnosis Safe
// Function: setRootUserAddress(address _newAddress)
// Requires: Multisig approval
await matrix.setRootUserAddress("0xNewRootUserAddress");
```

#### Adjust ROI Cap
```javascript
// Function: setRoiCap(uint256 _roiCapPercent)
// Range: 100% - 300%
await matrix.setRoiCap(200); // Change to 200%
```

#### Modify Income Layers
```javascript
// Function: setIncomeLayers(uint256 _layers)
// Range: 5 - 30
await matrix.setIncomeLayers(20); // Change to 20 layers
```

#### Update Level Prices
```javascript
// Function: updateLevelPrices(uint256[13] memory _levelPrice)
const newPrices = [
    ethers.parseEther("0.02"), // Double all prices
    ethers.parseEther("0.04"),
    // ... all 13 levels
];
await matrix.updateLevelPrices(newPrices);
```

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
