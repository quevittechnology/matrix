# Quick Deployment Guide

## ✅ You're Ready to Deploy!

### Step 1: Set Up .env File

Create `.env` in `f:\matrix\` with your values:

```bash
# Required
PRIVATE_KEY=your_wallet_private_key_here
OWNER=your_wallet_address_or_multisig
ROOT_USER_ADDRESS=your_root_user_wallet
FEE_RECEIVER=your_fee_receiver_wallet

# Network RPC (default already set)
OPBNB_TESTNET_RPC=https://opbnb-testnet-rpc.bnbchain.org
```

### Step 2: Get Testnet BNB

1. Get tBNB: https://www.bnbchain.org/en/testnet-faucet
2. Bridge to opBNB: https://opbnb-testnet-bridge.bnbchain.org/deposit
3. Need ~0.1 tBNB for deployment

### Step 3: Deploy

```bash
npx hardhat run scripts/deploy.js --network opBNBTestnet
```

**What Gets Deployed:**
- ✅ RoyaltyVault contract
- ✅ UniversalMatrix contract (< 24KB)
- ✅ Root user registered (ID: 73928)
- ✅ All default values set

### Step 4: Save Contract Addresses

The deployment will output addresses - save them!

---

## 🎯 What You're Deploying

**Current Version:**
- Non-upgradeable contract
- All admin functions use `onlyOwner`
- If owner = multisig, all functions need multisig approval
- If owner = single wallet, all functions have instant control

**To implement hybrid governance later**, you would need to deploy a new contract version.

---

## Need Help?

1. **Setting up .env** - See `.env.example`
2. **Getting testnet BNB** - See `TESTNET_DEPLOYMENT.md`
3. **After deployment** - See `ROYALTY_DASHBOARD_DEPLOYMENT.md`

**Ready to deploy when you set up your .env file!** 🚀
