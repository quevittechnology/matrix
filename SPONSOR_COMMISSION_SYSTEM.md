# Sponsor Commission System

## 🎯 Overview

Direct sponsors earn a **configurable percentage** (default 5%) from their direct downline's **level income earnings**.

---

## 💰 How It Works

### **When Downline Earns Level Income:**

```
User B (downline) earns 86.4 USDT level income
↓
User A (direct sponsor) automatically receives:
86.4 × 5% = 4.32 USDT sponsor commission
```

### **Example Flow:**

```
1. User C upgrades to Level 5 (pays 96 USDT)
2. User B (matrix upline) receives 86.4 USDT (90%)
3. User A (B's direct sponsor) receives 4.32 USDT (5% of B's 86.4)
4. Royalty pool receives 4.8 USDT (5%)
5. Admin receives 4.8 USDT (5%)
```

---

## 📊 Income Distribution (Complete)

### **Upgrade Payment Breakdown:**

```
User upgrades to Level 5: 96 USDT + 4.8 fee = 100.8 USDT

Distribution:
├─ Qualified Upline: 86.4 USDT (90%)
│   └─ Upline's Sponsor: 4.32 USDT (5% commission) ✨ NEW
├─ Royalty Pool: 4.8 USDT (5%)
└─ Admin Fee: 4.8 USDT (5%)

Total: 86.4 + 4.32 + 4.8 + 4.8 = 100.8 USDT ✅
```

---

## 🔧 Admin Configuration

### **Default Setting:**
- Sponsor Commission: **5%**

### **Change Commission Percentage:**

```javascript
// Set to 10%
await matrix.setSponsorCommission(10);

// Set to 3%
await matrix.setSponsorCommission(3);

// Disable (set to 0%)
await matrix.setSponsorCommission(0);

// Maximum: 100%
await matrix.setSponsorCommission(100);
```

### **View Current Setting:**

```javascript
const commissionPercent = await matrix.sponsorCommissionPercent();
console.log("Sponsor commission:", commissionPercent, "%");
```

---

## 💎 Earnings Examples

### **Scenario 1: 5% Commission (Default)**

**Your Direct Downline:**
- User B (Level 10)
- User C (Level 8)
- User D (Level 12)

**Monthly Earnings:**
```
User B earns: 5,000 USDT level income
├─ You receive: 250 USDT (5%)

User C earns: 2,000 USDT level income
├─ You receive: 100 USDT (5%)

User D earns: 8,000 USDT level income
├─ You receive: 400 USDT (5%)

Total Commission: 750 USDT/month
```

### **Scenario 2: 10% Commission**

**Same downline, higher commission:**
```
User B: 5,000 × 10% = 500 USDT
User C: 2,000 × 10% = 200 USDT
User D: 8,000 × 10% = 800 USDT

Total Commission: 1,500 USDT/month (doubled!)
```

---

## 📈 Income Tracking

### **View Sponsor Commission Earnings:**

```javascript
// Get total sponsor commission earned
const sponsorEarnings = await matrix.sponsorIncome(userId);
console.log("Sponsor commission:", ethers.formatEther(sponsorEarnings), "BNB");
```

### **Included in Total Income:**

```javascript
const userInfo = await matrix.userInfo(userId);
// totalIncome includes:
// - Referral income (95% of registrations)
// - Level income (90% of upgrades)
// - Sponsor commission (% of downline's level income) ✨ NEW
// - Royalty income (daily pools)
```

---

## 🎯 Strategic Benefits

### **For Sponsors:**

1. **Passive Income** - Earn from downline's success
2. **Motivation** - Help downline earn more = you earn more
3. **Team Building** - Incentive to support direct referrals
4. **Compounding** - More active downline = more commission

### **For Network:**

1. **Stronger Teams** - Sponsors help downline succeed
2. **Better Support** - Direct sponsors stay engaged
3. **Retention** - Additional income stream
4. **Growth** - Motivated sponsors recruit quality users

---

## 💰 Complete Income Streams

### **All 4 Income Types:**

| Type | Source | Amount | Cap |
|------|--------|--------|-----|
| **Referral** | Direct registrations | 95% of Level 1 | Unlimited |
| **Level** | Matrix upgrades | 90% of price | Unlimited |
| **Sponsor Commission** | Downline's level income | 5% (configurable) | Unlimited ✨ NEW |
| **Royalty** | Daily pools | Share of 5% | 150% ROI |

---

## 📊 Example: Complete Earnings

### **User Profile:**
- Direct Team: 10 users
- Matrix Team: 100 users
- Level: 13

### **Monthly Income Breakdown:**

```
1. Referral Income:
   - 5 new registrations × 7.6 USDT = 38 USDT

2. Level Income:
   - 50 upgrades from matrix = 5,000 USDT

3. Sponsor Commission: ✨ NEW
   - 10 direct downline earn 20,000 USDT total
   - Commission: 20,000 × 5% = 1,000 USDT

4. Royalty Income:
   - Daily: 125 USDT × 30 days = 3,750 USDT

Total Monthly: 9,788 USDT
```

**Sponsor commission adds 10%+ to total earnings!**

---

## ⚙️ Technical Details

### **Contract Variables:**

```solidity
// Configurable percentage (default 5%)
uint256 public sponsorCommissionPercent = 5;

// Track sponsor commission earnings
mapping(uint256 => uint256) public sponsorIncome;
```

### **Payment Logic:**

```solidity
function _payIncome(...) {
    // Pay level income to recipient
    payable(recipient).transfer(incomeAmount);
    
    // Pay sponsor commission
    if (recipient has sponsor) {
        uint256 commission = (incomeAmount * sponsorCommissionPercent) / 100;
        payable(sponsor).transfer(commission);
        sponsorIncome[sponsor] += commission;
    }
}
```

---

## ✅ Summary

**Sponsor Commission Feature:**

✅ Direct sponsors earn % from downline's level income  
✅ Default: 5% (configurable by admin)  
✅ Paid automatically when downline earns  
✅ Tracked separately in `sponsorIncome`  
✅ Unlimited earning potential  
✅ Admin can adjust 0-100%  

**This creates a 4th income stream and incentivizes team support!** 🚀
