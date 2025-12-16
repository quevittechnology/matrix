# 🚀 Quick Start: Deploy to opBNB

This is a quick reference guide for deploying UniversalMatrix to opBNB. For detailed instructions, see [OPBNB_DEPLOYMENT_GUIDE.md](./OPBNB_DEPLOYMENT_GUIDE.md).

---

## ⚡ Quick Deploy to Testnet (5 minutes)

### 1. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your private key
# PRIVATE_KEY=your_private_key_here
```

### 2. Get Testnet BNB
- Add opBNB Testnet to MetaMask:
  - RPC: `https://opbnb-testnet-rpc.bnbchain.org`
  - Chain ID: `5611`
- Get testnet BNB: https://testnet.bnbchain.org/faucet-smart

### 3. Deploy
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy-opbnb.js --network opBNBTestnet
```

### 4. Test
```bash
# Test the deployment
npx hardhat run scripts/test-deployment.js --network opBNBTestnet
```

### 5. Verify (Optional)
```bash
# Verify contracts on explorer
npx hardhat run scripts/verify-contracts.js --network opBNBTestnet
```

**Done! 🎉** View your contract on https://testnet.opbnbscan.com

---

## 🌐 Deploy to Mainnet

⚠️ **Only after thorough testnet testing!**

### 1. Get Mainnet BNB
- Add opBNB Mainnet to MetaMask:
  - RPC: `https://opbnb-mainnet-rpc.bnbchain.org`
  - Chain ID: `204`
- Bridge BNB: https://opbnb-bridge.bnbchain.org

### 2. Deploy
```bash
npx hardhat run scripts/deploy-opbnb.js --network opBNB
```

### 3. Verify
```bash
npx hardhat run scripts/verify-contracts.js --network opBNB
```

**Live! 🚀** View on https://opbnbscan.com

---

## 📋 Network Details

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| **opBNB Testnet** | 5611 | https://opbnb-testnet-rpc.bnbchain.org |
| **opBNB Mainnet** | 204 | https://opbnb-mainnet-rpc.bnbchain.org |

---

## 🔧 Admin Commands

After deployment, manage your contract:

```bash
# View all settings
npx hardhat run scripts/adminSettings.js --network opBNB

# Update level prices
npx hardhat run scripts/adminSettings.js --network opBNB update-prices

# Set sponsor commission (0-100%)
npx hardhat run scripts/adminSettings.js --network opBNB set-commission 5

# Set sponsor minimum level (1-13)
npx hardhat run scripts/adminSettings.js --network opBNB set-min-level 4

# Pause contract
npx hardhat run scripts/adminSettings.js --network opBNB pause

# Unpause contract
npx hardhat run scripts/adminSettings.js --network opBNB unpause
```

---

## 💰 Estimated Costs

- **Testnet:** ~0.005 BNB (FREE from faucet)
- **Mainnet:** ~0.005 BNB (~$2.50)

opBNB has extremely low gas fees! 🎉

---

## 🆘 Troubleshooting

**"Insufficient funds"**
→ Get more testnet BNB from faucet or bridge more to opBNB

**"Network not found"**
→ Check hardhat.config.js has opBNB networks configured

**"Already registered"**
→ You've already tested registration, that's good!

---

## 📚 Full Documentation

- [Complete Deployment Guide](./OPBNB_DEPLOYMENT_GUIDE.md)
- [Admin Settings Guide](./ADMIN_PRICE_MANAGEMENT.md)
- [Security Guide](./SECURITY_AUDIT.md)
- [Test Results](./TEST_RESULTS.md)

---

## ✅ Deployment Checklist

### Testnet:
- [ ] Configure .env file
- [ ] Get testnet BNB
- [ ] Deploy contracts
- [ ] Test registration
- [ ] Verify on explorer

### Mainnet:
- [ ] Complete testnet testing
- [ ] Get mainnet BNB
- [ ] Deploy to mainnet
- [ ] Verify contracts
- [ ] Set up monitoring

---

**Need help?** Check the [full deployment guide](./OPBNB_DEPLOYMENT_GUIDE.md) or review the [troubleshooting section](./OPBNB_DEPLOYMENT_GUIDE.md#-troubleshooting).

**Ready to launch? Let's go! 🚀**
