# Root User Wallet Configuration Guide

## 🎯 Understanding Root User

The **root user** is the platform owner account that receives all VIP privileges. It consists of:
1. **Root User ID:** `73928` (fixed in contract)
2. **Root User Address:** Your wallet address (configurable during deployment)

---

## 📋 How Root User Address is Set

### **Method 1: Automatic (Default)**

**The deployer's wallet becomes the root user automatically!**

```bash
# 1. Set your private key in .env
PRIVATE_KEY=your_private_key_here

# 2. Deploy
npx hardhat run scripts/deploy-opbnb.js --network opBNBTestnet

# ✅ Your wallet (from PRIVATE_KEY) = Root user!
```

**How it works:**
- The deployer address is used as the `owner` parameter
- This owner becomes the root user (ID: 73928)
- All income goes to this wallet

---

### **Method 2: Custom Root User Address**

**Set a different wallet as root user:**

**Step 1: Create `.env` file**
```bash
# Your deployment wallet (pays gas)
PRIVATE_KEY=deployer_private_key_here

# Root user wallet (receives income)
OWNER_ADDRESS=0x1234...  # ← Root user wallet address
FEE_RECEIVER=0x5678...   # ← Fee receiver wallet address
```

**Step 2: Deploy**
```bash
npx hardhat run scripts/deploy-opbnb.js --network opBNBTestnet
```

**Result:**
- Deployer wallet: Pays gas fees
- `OWNER_ADDRESS`: Root user (receives all income, VIP privileges)
- `FEE_RECEIVER`: Receives admin fees

---

## 🔑 Root User Registration

**After deployment, register the root user:**

```javascript
// File: scripts/register-root.js
const { ethers } = require("hardhat");

async function main() {
    const matrixAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
    const matrix = await ethers.getContractAt("UniversalMatrix", matrixAddress);
    
    // Root user details
    const rootAddress = "0x..."; // Owner address from deployment
    const registrationFee = await matrix.getLevelPrice(0); // Get Level 1 price
    const fees = registrationFee * 105n / 100n; // +5% admin fee
    
    // Register root user
    const tx = await matrix.register(
        73928,      // referrerId (self-referral for root)
        73928,      // parentId (root is its own parent)
        rootAddress, // Root wallet address
        { value: fees }
    );
    
    await tx.wait();
    console.log("✅ Root user registered!");
    console.log("Root ID:", 73928);
    console.log("Root Address:", rootAddress);
}

main();
```

---

## 📊 Verifying Root User Setup

```javascript
// Check root user
const matrix = await ethers.getContractAt("UniversalMatrix", matrixAddress);

// 1. Get root ID
const rootId = await matrix.defaultRefer();
console.log("Root ID:", rootId); // 73928

// 2. Get root user info
const rootInfo = await matrix.userInfo(73928);
console.log("Root Address:", rootInfo.account);
console.log("Root Level:", rootInfo.level);
console.log("Root Income:", ethers.formatEther(rootInfo.totalIncome));

// 3. Check owner (should match root)
const owner = await matrix.owner();
console.log("Contract Owner:", owner);
console.log("Match:", owner === rootInfo.account);
```

---

## 💰 Root User Privileges

Once configured, the root user (ID: 73928) automatically gets:

✅ **All Income (No Requirements)**
- Direct sponsor income
- Level income (no team needed)
- Sponsor commission (no level needed)
- Royalty income (auto-credited!)
- All fallback income

✅ **Unlimited Earnings**
- No 150% ROI cap
- Never removed from royalty pool
- Infinite earning potential

✅ **Automatic Benefits**
- Auto-receives royalty (no claiming)
- Always qualifies for everything
- Bypasses all checks

---

## 🎯 Quick Summary

| Item | Value | Where to Set |
|------|-------|--------------|
| **Root ID** | 73928 | Contract (fixed, line 221) |
| **Root Address** | Your wallet | `.env` → `OWNER_ADDRESS` |
| **Registration** | After deploy | Run registration script |

---

## ⚠️ Important Notes

1. **Root ID is FIXED** - Cannot change after deployment (73928)
2. **Root Address is SET ONCE** - During initialization, cannot change
3. **Registration Required** - Root user must register to activate
4. **Keep Private Key Safe** - Root user has full platform control

---

**Your wallet will be the root user - set it in `.env` before deploying!** 🎯
