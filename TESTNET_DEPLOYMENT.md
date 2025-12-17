# opBNB Testnet Deployment Checklist

## ⚠️ Before Deploying

You need to set up your environment first:

### 1. Create `.env` File
Create a `.env` file in the project root with your private key:

```bash
PRIVATE_KEY=your_private_key_here
OPBNB_TESTNET_RPC=https://opbnb-testnet-rpc.bnbchain.org
```

**⚠️ NEVER commit your `.env` file to Git!** (Already in `.gitignore`)

### 2. Get Testnet BNB
You need opBNB testnet BNB to deploy:

1. **Get BNB Testnet Faucet**: https://www.bnbchain.org/en/testnet-faucet
   - Request tBNB on BNB Smart Chain Testnet
   
2. **Bridge to opBNB Testnet**: https://opbnb-testnet-bridge.bnbchain.org/deposit
   - Bridge your tBNB from BSC Testnet to opBNB Testnet
   - You'll need ~0.1 tBNB for deployment

### 3. Deploy Contract
```bash
npx hardhat run scripts/deploy.js --network opBNBTestnet
```

---

## 📋 Deployment Steps

1. **Export Your Private Key**
   - From MetaMask: Settings → Security & Privacy → Reveal Private Key
   - ⚠️ Keep this secure! Never share it!

2. **Add to `.env`**
   ```
   PRIVATE_KEY=0x1234567890abcdef...
   ```

3. **Verify Testnet BNB Balance**
   ```bash
   npx hardhat run scripts/check-balance.js --network opBNBTestnet
   ```

4. **Deploy**
   ```bash
   npx hardhat run scripts/deploy.js --network opBNBTestnet
   ```

5. **Save Contract Addresses**
   - The script will output RoyaltyVault and UniversalMatrix addresses
   - Save these for frontend integration

---

## 🔍 After Deployment

### Verify on opBNBScan Testnet
1. Go to: https://testnet.opbnbscan.com/
2. Search for your contract address
3. Verify the contract:
   ```bash
   npx hardhat verify --network opBNBTestnet <CONTRACT_ADDRESS> "<ARG1>" "<ARG2>" "<ARG3>"
   ```

### Test Contract Functions
```javascript
// Using Hardhat console
npx hardhat console --network opBNBTestnet

// Attach to deployed contract
const matrix = await ethers.getContractAt("UniversalMatrix", "YOUR_CONTRACT_ADDRESS");

// Test view functions
await matrix.maxLevel();
await matrix.roiCapPercent();
await matrix.getCurRoyaltyDay();
```

---

## ⚡ Quick Commands

```bash
# Check your balance
npx hardhat run scripts/check-balance.js --network opBNBTestnet

# Deploy contracts
npx hardhat run scripts/deploy.js --network opBNB Testnet

# Verify RoyaltyVault
npx hardhat verify --network opBNBTestnet <VAULT_ADDRESS> "<DEPLOYER_ADDRESS>"

# Verify UniversalMatrix
npx hardhat verify --network opBNBTestnet <MATRIX_ADDRESS> "<FEE_RECEIVER>" "<VAULT_ADDRESS>" "<OWNER>"
```

---

## 🎯 Next Steps After Successful Deployment

1. ✅ Contract deployed and verified
2. ✅ Test registration function
3. ✅ Test upgrade function
4. ✅ Test royalty claim
5. ✅ Verify dashboard data
6. ✅ Ready for mainnet!
