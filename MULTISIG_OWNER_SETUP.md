# Multisig Owner Setup Guide

## Owner Capabilities (Requires DAO Multisig Approval)

The contract owner has the following administrative powers:

### 🔑 Critical Functions
1. **Change Root User** - `setRootUserAddress()`
2. **Drain Contract** - `emergencyWithdraw()`
3. **Change ROI Cap** - `setRoiCap()` (max 300%)
4. **Change Income Layers** - `setIncomeLayers()` (max 30)
5. **Change Royalty Levels** - `setRoyaltyLevels()`

### 💰 Financial Configuration
- **Update Level Prices** - `updateLevelPrices()`, `updateLevelPricesUSD()`
- **Set Distribution Percentages** - Registration & upgrade splits
- **Configure Fee Receiver** - `setFeeReceiver()`
- **Configure Royalty Vault** - `setRoyaltyVault()`

### ⚙️ System Parameters
- **Sponsor Commission Settings** - Min level, layers, fallback
- **Perpetual Royalty Threshold** - Min referrals for accumulation
- **Price Oracle Settings** - Enable/disable, set feed address
- **Direct Referral Requirements** - `setDirectRequired()`

---

## ✅ Recommended: Gnosis Safe Multisig (2-of-3 or 3-of-5)

### Why Multisig?
- ✅ **Prevents single point of failure** - No single person can drain funds
- ✅ **Requires consensus** - Multiple signatures for critical changes
- ✅ **Transparent governance** - All transactions visible and traceable
- ✅ **Industry standard** - Used by top protocols

### Setup Options

#### Option 1: Gnosis Safe (Recommended)
**Website**: https://safe.global/

1. **Go to Gnosis Safe**
   - Visit https://app.safe.global/
   - Connect with your wallet

2. **Create Safe**
   - Click "Create new Safe"
   - Select opBNB network
   - Add owner addresses (2-3 trusted team members)
   - Set threshold (e.g., 2-of-3 requires 2 signatures)

3. **Deploy Safe**
   - Review settings
   - Deploy multisig wallet
   - **Copy Safe Address** - This is your owner address!

4. **Use in Deployment**
   ```javascript
   const OWNER = "0xYourGnosisSafeAddress"; // Multisig address
   
   const matrix = await UniversalMatrix.deploy(
       feeReceiverAddress,
       royaltyVaultAddress,
       OWNER  // Use Safe address as owner
   );
   ```

#### Option 2: Transfer Ownership After Deployment
If you deploy with an EOA (single wallet) first:

```javascript
// After deploying with deployer.address
const SAFE_ADDRESS = "0xYourGnosisSafeAddress";

// Transfer ownership (requires current owner signature)
await matrix.transferOwnership(SAFE_ADDRESS);
```

---

## 🔐 Multisig Transaction Flow

### Example: Updating ROI Cap

1. **Propose Transaction** (Any Safe owner)
   - Go to Gnosis Safe app
   - "New Transaction" → "Contract Interaction"
   - Enter contract address
   - Select function: `setRoiCap(uint256 _roiCapPercent)`
   - Enter new value (e.g., 200 for 200%)
   - Submit

2. **Other Owners Sign** (Reach threshold)
   - Other owners open Safe app
   - Review pending transaction
   - Sign if approved
   - Once threshold reached (e.g., 2-of-3), anyone can execute

3. **Execute**
   - Click "Execute" in Safe app
   - Pays gas for transaction
   - Transaction executes on-chain

### Example: Emergency Withdraw

```javascript
// In Gnosis Safe app
// Function: emergencyWithdraw()
// No parameters
// Requires 2-of-3 signatures (based on your threshold)
// Sends all contract balance to owner (the Safe itself)
```

---

## 📋 Recommended Multisig Configuration

### For Production (opBNB Mainnet)
- **Signers**: 3-5 trusted team members
- **Threshold**: 2-of-3 or 3-of-5
- **Delay**: Optional 24-hour timelock for critical functions

### For Testnet
- **Signers**: 2-3 team members (same as production for testing)
- **Threshold**: 2-of-3

---

## 🛡️ Best Practices

### Multisig Ownership
✅ **Use hardware wallets** for all signer addresses  
✅ **Geographic distribution** - Signers in different locations  
✅ **Role separation** - Different team members (CEO, CTO, CFO, etc.)  
✅ **Backup plan** - Document recovery process if signer lost  
✅ **Regular audits** - Review pending transactions weekly  

### Admin Function Usage
⚠️ **Never use emergencyWithdraw** unless actual emergency  
⚠️ **Test on testnet first** before mainnet parameter changes  
⚠️ **Announce changes** to community before major updates  
⚠️ **Document decisions** - Keep records of why changes made  

---

## 🚀 Deployment Checklist with Multisig

- [ ] Create Gnosis Safe on opBNB
- [ ] Add 3-5 owner addresses
- [ ] Set threshold (2-of-3 or 3-of-5)
- [ ] Deploy contract with Safe address as owner
- [ ] Test multisig transaction (e.g., update a parameter)
- [ ] Verify all signers can access Safe
- [ ] Document signer responsibilities
- [ ] Set up emergency contact protocol

---

## 📞 Gnosis Safe Support

- **Docs**: https://help.safe.global/
- **Discord**: https://discord.gg/BXXdA3p5
- **Tutorials**: https://www.youtube.com/c/gnosissafe

---

## ⚠️ Important Notes

1. **Owner ≠ Fee Receiver**
   - Owner: Administrative control (use multisig)
   - Fee Receiver: Receives admin fees (can be different address)

2. **EmergencyWithdraw**
   - Should only be used in genuine emergencies
   - All funds go to owner (the Safe)
   - Community should be notified immediately

3. **Root User Changes**
   - Changing root user is a critical operation
   - Affects income fallback for entire system
   - Requires careful consideration and testing

---

## ✅ Summary

**For maximum security:**
- Deploy with Gnosis Safe (2-of-3 or 3-of-5) as owner
- Use hardware wallets for all signers
- Test all admin functions on testnet first
- Maintain transparent governance

This setup ensures no single person can make unilateral changes or drain funds, while still allowing necessary administrative flexibility.
