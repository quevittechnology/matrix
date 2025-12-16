# opBNB Deployment Guide

## 🚀 Complete Deployment Guide for opBNB Testnet & Mainnet

This guide will walk you through deploying the UniversalMatrix contract to opBNB testnet and mainnet.

---

## 📋 Prerequisites

### 1. Required Tools
- Node.js v16+ installed
- Hardhat configured
- MetaMask or similar wallet

### 2. Get opBNB Testnet Tokens
1. **Add opBNB Testnet to MetaMask:**
   - Network Name: `opBNB Testnet`
   - RPC URL: `https://opbnb-testnet-rpc.bnbchain.org`
   - Chain ID: `5611`
   - Currency Symbol: `BNB`
   - Block Explorer: `https://testnet.opbnbscan.com`

2. **Get Testnet BNB:**
   - Visit: https://testnet.bnbchain.org/faucet-smart
   - Connect your wallet
   - Request testnet BNB (you'll need ~0.1 BNB for deployment)

### 3. Get opBNB Mainnet Tokens
1. **Add opBNB Mainnet to MetaMask:**
   - Network Name: `opBNB Mainnet`
   - RPC URL: `https://opbnb-mainnet-rpc.bnbchain.org`
   - Chain ID: `204`
   - Currency Symbol: `BNB`
   - Block Explorer: `https://opbnbscan.com`

2. **Bridge BNB to opBNB:**
   - Visit: https://opbnb-bridge.bnbchain.org
   - Bridge BNB from BSC to opBNB
   - You'll need ~0.05 BNB for deployment

---

## ⚙️ Configuration

### 1. Create `.env` File

Create a `.env` file in the project root:

```bash
# Private Key (NEVER share this!)
PRIVATE_KEY=your_private_key_here

# Optional: Custom RPC URLs
OPBNB_TESTNET_RPC=https://opbnb-testnet-rpc.bnbchain.org
OPBNB_RPC=https://opbnb-mainnet-rpc.bnbchain.org

# Optional: Custom addresses
FEE_RECEIVER=0xYourFeeReceiverAddress
OWNER_ADDRESS=0xYourOwnerAddress

# Optional: BSCScan API Key (for contract verification)
BSCSCAN_API_KEY=your_bscscan_api_key
```

### 2. Export Private Key from MetaMask

⚠️ **SECURITY WARNING:** Never share your private key!

1. Open MetaMask
2. Click the three dots → Account Details
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key
6. Paste it in `.env` file

---

## 🧪 Deploy to opBNB Testnet

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Compile Contracts
```bash
npx hardhat compile
```

### Step 3: Deploy to Testnet
```bash
npx hardhat run scripts/deploy-opbnb.js --network opBNBTestnet
```

### Expected Output:
```
🚀 Starting opBNB Deployment...

📋 Deployment Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Network: opBNBTestnet
Chain ID: 5611
Deployer: 0x...
Balance: 0.5 BNB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Step 1/3: Deploying RoyaltyVault...
✅ RoyaltyVault deployed to: 0x...

📦 Step 2/3: Deploying UniversalMatrix (UUPS Proxy)...
✅ UniversalMatrix Proxy deployed to: 0x...
📝 Implementation address: 0x...

⚙️  Step 3/3: Configuring RoyaltyVault...
✅ RoyaltyVault configured

💰 Setting initial level prices...
✅ Level prices set successfully

🎉 DEPLOYMENT SUCCESSFUL!
```

### Step 4: Verify Contracts (Optional but Recommended)
```bash
npx hardhat run scripts/verify-contracts.js --network opBNBTestnet
```

### Step 5: Test the Deployment

Test registration:
```bash
npx hardhat run scripts/test-deployment.js --network opBNBTestnet
```

---

## 🌐 Deploy to opBNB Mainnet

⚠️ **IMPORTANT:** Only deploy to mainnet after thorough testing on testnet!

### Pre-Deployment Checklist:
- [ ] All tests passing on testnet
- [ ] Contract verified on testnet explorer
- [ ] Test registration completed successfully
- [ ] Test upgrade completed successfully
- [ ] Admin functions tested
- [ ] Security audit completed (recommended)
- [ ] Private keys secured (use hardware wallet for mainnet)
- [ ] Sufficient BNB for deployment (~0.05 BNB)

### Deploy to Mainnet:
```bash
npx hardhat run scripts/deploy-opbnb.js --network opBNB
```

### Verify on Mainnet:
```bash
npx hardhat run scripts/verify-contracts.js --network opBNB
```

---

## 📊 Post-Deployment Steps

### 1. Save Contract Addresses
Deployment info is automatically saved to `deployments/` folder:
- `opBNBTestnet-latest.json` - Latest testnet deployment
- `opBNB-latest.json` - Latest mainnet deployment

### 2. Verify on Block Explorer

**Testnet:**
- Explorer: https://testnet.opbnbscan.com
- Search for your contract addresses
- Verify source code is published

**Mainnet:**
- Explorer: https://opbnbscan.com
- Search for your contract addresses
- Verify source code is published

### 3. Configure Admin Settings

Use the admin CLI tool:
```bash
# View current settings
npx hardhat run scripts/adminSettings.js --network opBNB

# Update level prices (if needed)
npx hardhat run scripts/adminSettings.js --network opBNB update-prices

# Set sponsor commission
npx hardhat run scripts/adminSettings.js --network opBNB set-commission 5

# Set sponsor minimum level
npx hardhat run scripts/adminSettings.js --network opBNB set-min-level 4
```

### 4. Test Core Functions

Test with small amounts first:
1. Register a test user
2. Upgrade to level 2
3. Verify income distribution
4. Check royalty accumulation

### 5. Set Up Monitoring

Monitor contract events:
- Registration events
- Upgrade events
- Income distribution
- Royalty claims
- Admin changes

---

## 🔐 Security Best Practices

### For Testnet:
✅ Use a separate wallet for testing
✅ Never use mainnet private keys
✅ Test all functions thoroughly

### For Mainnet:
✅ Use a hardware wallet (Ledger/Trezor)
✅ Use a multi-sig wallet for owner address
✅ Keep private keys in secure cold storage
✅ Never share private keys
✅ Use environment variables, never hardcode
✅ Enable 2FA on all accounts
✅ Regular security audits

---

## 💰 Gas Costs (Estimated)

### opBNB Testnet:
- RoyaltyVault deployment: ~0.001 BNB
- UniversalMatrix deployment: ~0.003 BNB
- Configuration: ~0.0005 BNB
- **Total: ~0.005 BNB**

### opBNB Mainnet:
- Similar to testnet (opBNB has very low gas fees)
- **Total: ~0.005 BNB (~$2.50 at $500/BNB)**

---

## 🔧 Troubleshooting

### Error: "Insufficient funds"
- **Solution:** Get more testnet BNB from faucet or bridge more BNB to opBNB

### Error: "Nonce too high"
- **Solution:** Reset MetaMask account or wait a few minutes

### Error: "Contract verification failed"
- **Solution:** Make sure BSCSCAN_API_KEY is set in .env

### Error: "Network not found"
- **Solution:** Check hardhat.config.js has opBNB networks configured

---

## 📞 Support & Resources

### Official Resources:
- opBNB Docs: https://docs.bnbchain.org/opbnb-docs/
- opBNB Bridge: https://opbnb-bridge.bnbchain.org
- opBNB Testnet Faucet: https://testnet.bnbchain.org/faucet-smart
- opBNB Testnet Explorer: https://testnet.opbnbscan.com
- opBNB Mainnet Explorer: https://opbnbscan.com

### Network Details:

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| opBNB Testnet | 5611 | https://opbnb-testnet-rpc.bnbchain.org | https://testnet.opbnbscan.com |
| opBNB Mainnet | 204 | https://opbnb-mainnet-rpc.bnbchain.org | https://opbnbscan.com |

---

## ✅ Deployment Checklist

### Testnet Deployment:
- [ ] Install dependencies
- [ ] Configure .env file
- [ ] Get testnet BNB
- [ ] Compile contracts
- [ ] Deploy to testnet
- [ ] Verify contracts
- [ ] Test registration
- [ ] Test upgrades
- [ ] Test admin functions
- [ ] Monitor events

### Mainnet Deployment:
- [ ] Complete all testnet testing
- [ ] Security audit (recommended)
- [ ] Prepare hardware wallet
- [ ] Get mainnet BNB
- [ ] Deploy to mainnet
- [ ] Verify contracts
- [ ] Test with small amounts
- [ ] Configure monitoring
- [ ] Set up multi-sig (recommended)
- [ ] Document all addresses

---

## 🎉 Success!

Once deployed, your UniversalMatrix contract will be live on opBNB!

**Next Steps:**
1. Build your frontend/dApp
2. Integrate with Web3 wallets
3. Set up backend monitoring
4. Launch marketing campaign
5. Grow your community!

**Good luck with your launch! 🚀**
