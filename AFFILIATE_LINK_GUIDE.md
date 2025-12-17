# Affiliate Link System Guide

## 🎯 Overview

Users can now generate and share affiliate/referral links with their unique User ID!

---

## 🔧 New Features

### 1. Root User Address (Configurable!)
Update root user wallet address without redeploying:

```javascript
await matrix.setRootUserAddress("0xNewRootWalletAddress");
```

**Event:** `RootUserAddressUpdated(oldAddress, newAddress)`

---

### 2. Affiliate Link Helper Functions

#### Get User ID from Address
```javascript
const userId = await matrix.getUserIdByAddress("0x742d...");
console.log(userId); // e.g., 7
```

#### Get Address from User ID
```javascript
const address = await matrix.getUserAddressById(7);
console.log(address); // "0x742d..."
```

#### Get Complete Referral Info
```javascript
const info = await matrix.getReferralInfo(7);
console.log(info);
// Returns: {
//   userId: 7,
//   walletAddress: "0x742d...",
//   level: 5,
//   directCount: 12
// }
```

---

## 🔗 How to Generate Affiliate Links

### Frontend Implementation

```javascript
// 1. Get user's wallet address from Web3
const address = await ethereum.request({ method: 'eth_requestAccounts' });

// 2. Get user ID from contract
const userId = await contract.getUserIdByAddress(address[0]);

// 3. Generate affiliate link
const affiliateLink = `https://yoursite.com/register?ref=${userId}`;

// 4. Display to user
console.log("Your affiliate link:", affiliateLink);
```

### Complete Example (React)

```jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function AffiliateLink({ contract }) {
  const [link, setLink] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    async function generateLink() {
      // Get connected wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Get user ID and info from contract
      const userId = await contract.getUserIdByAddress(address);
      const info = await contract.getReferralInfo(userId);

      // Generate link
      const baseUrl = window.location.origin;
      const affiliateLink = `${baseUrl}/register?ref=${userId}`;

      setLink(affiliateLink);
      setUserInfo(info);
    }

    generateLink();
  }, [contract]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    alert('Affiliate link copied!');
  };

  return (
    <div>
      <h3>Your Affiliate Link</h3>
      {userInfo && (
        <div>
          <p>User ID: {userInfo.userId.toString()}</p>
          <p>Level: {userInfo.level.toString()}</p>
          <p>Direct Referrals: {userInfo.directCount.toString()}</p>
        </div>
      )}
      <input type="text" value={link} readOnly />
      <button onClick={copyToClipboard}>Copy Link</button>
    </div>
  );
}
```

---

## 📱 Registration with Referral

### Frontend: Process Referral Link

```javascript
// 1. Get referral ID from URL
const urlParams = new URLSearchParams(window.location.search);
const referrerId = urlParams.get('ref') || 1; // Default to root user (ID 1)

// 2. Register with referrer
const levelPrice = await contract.levelPrice(0); // Level 1 price
await contract.register(referrerId, { value: levelPrice });
```

### Complete Registration Flow

```javascript
async function registerWithReferral() {
  try {
    // Get ref from URL (or default to 1)
    const ref = new URLSearchParams(window.location.search).get('ref') || 1;

    // Validate referrer exists
    const referrerAddress = await contract.getUserAddressById(ref);
    if (referrerAddress === ethers.constants.AddressZero) {
      throw new Error('Invalid referral link');
    }

    // Get registration price
    const price = await contract.levelPrice(0);

    // Register
    const tx = await contract.register(ref, { value: price });
    await tx.wait();

    console.log('Successfully registered with referrer:', ref);
  } catch (error) {
    console.error('Registration failed:', error);
  }
}
```

---

## 🎨 UI Examples

### Share Modal
```jsx
function ShareModal({ userId, isOpen, onClose }) {
  const link = `https://yourapp.com/register?ref=${userId}`;

  const shareOptions = [
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=Join me&url=${encodeURIComponent(link)}`
    },
    {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${encodeURIComponent(link)}`
    },
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodeURIComponent(link)}`
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Share Your Referral Link</h2>
      <input type="text" value={link} readOnly />
      <button onClick={() => navigator.clipboard.writeText(link)}>
        Copy Link
      </button>
      <div>
        {shareOptions.map(option => (
          <a key={option.name} href={option.url} target="_blank">
            {option.name}
          </a>
        ))}
      </div>
    </Modal>
  );
}
```

### QR Code Generator
```jsx
import QRCode from 'qrcode.react';

function ReferralQR({ userId }) {
  const link = `https://yourapp.com/register?ref=${userId}`;

  return (
    <div>
      <h3>Scan to Register</h3>
      <QRCode value={link} size={256} />
      <p>User ID: {userId}</p>
    </div>
  );
}
```

---

## 🔐 Admin Functions

### Update Root User Address
```javascript
// Only contract owner
await matrix.setRootUserAddress("0xNewRootAddress");
```

**Use Cases:**
- Transfer root account to new wallet
- Update after security concerns
- Migrate to multisig wallet

---

## 📊 Analytics

### Track Referral Performance

```javascript
async function getReferralStats(userId) {
  const info = await contract.getReferralInfo(userId);
  const userDetails = await contract.userInfo(userId);

  return {
    userId: info.userId.toString(),
    wallet: info.walletAddress,
    level: info.level.toString(),
    directReferrals: info.directCount.toString(),
    totalTeam: userDetails.totalMatrixTeam.toString(),
    totalDeposit: ethers.utils.formatEther(userDetails.totalDeposit),
    totalIncome: ethers.utils.formatEther(userDetails.totalIncome)
  };
}
```

---

## ✅ Best Practices

1. **Validate Referrer** - Always check if referrer exists before registration
2. **Default to Root** - Use user ID 1 (root) if no referral provided
3. **Store Locally** - Cache user's own referral link in localStorage
4. **Share Everywhere** - Provide multiple share options (social media, QR, copy)
5. **Track Performance** - Show users their referral statistics

---

## 🚀 Example URLs

```
Format: https://yoursite.com/register?ref={userId}

Examples:
✅ https://yoursite.com/register?ref=1      (Root user)
✅ https://yoursite.com/register?ref=42     (User 42)
✅ https://yoursite.com/register?ref=1337   (User 1337)
✅ https://yoursite.com/register            (Defaults to root)
```

---

## 🎯 Summary

**New Functions:**
- `getUserIdByAddress(address)` - Lookup user ID
- `getUserAddressById(userId)` - Lookup wallet address  
- `getReferralInfo(userId)` - Get complete referral data
- `setRootUserAddress(address)` - Update root user wallet

**Ready to use!** Users can now share personalized referral links! 🚀
