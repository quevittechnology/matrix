# GitHub Push Guide - Universal Matrix

## 🔐 Authentication Required

The push failed due to permission error. You need to authenticate with GitHub first.

## ✅ Option 1: Using Personal Access Token (Recommended)

### Step 1: Create Personal Access Token

1. Go to GitHub: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Matrix Project"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### Step 2: Push with Token

```powershell
# Set your GitHub username
$username = "your-github-username"

# Set your token (paste the token you copied)
$token = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Push to repository
cd f:\matrix
git remote set-url origin https://$username:$token@github.com/quevittechnology/matrix.git
git push -u origin main
```

---

## ✅ Option 2: Using GitHub CLI (Easier)

### Step 1: Install GitHub CLI

```powershell
winget install --id GitHub.cli
```

### Step 2: Authenticate

```powershell
gh auth login
# Follow the prompts to authenticate
```

### Step 3: Push

```powershell
cd f:\matrix
git push -u origin main
```

---

## ✅ Option 3: Using SSH Key

### Step 1: Generate SSH Key

```powershell
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter to accept default location
# Enter a passphrase (optional)
```

### Step 2: Add SSH Key to GitHub

```powershell
# Copy the public key
Get-Content ~/.ssh/id_ed25519.pub | clip

# Go to: https://github.com/settings/keys
# Click "New SSH key"
# Paste the key and save
```

### Step 3: Change Remote URL and Push

```powershell
cd f:\matrix
git remote set-url origin git@github.com:quevittechnology/matrix.git
git push -u origin main
```

---

## 📋 What Will Be Pushed

### Smart Contracts
- ✅ `contracts/UniversalMatrix.sol` (main contract)
- ✅ `contracts/RoyaltyVault.sol` (royalty vault)

### Scripts
- ✅ `scripts/deploy.js` (deployment script)
- ✅ `scripts/interact.js` (interaction script)

### Tests
- ✅ `test/UniversalMatrix.test.js` (test suite)

### Configuration
- ✅ `hardhat.config.js`
- ✅ `package.json`
- ✅ `.env.example`

### Documentation (13 files)
- ✅ `README.md`
- ✅ `FEATURES.md`
- ✅ `ROOT_USER_CHANGES.md`
- ✅ `FALLBACK_PAYMENT_SYSTEM.md`
- ✅ `FINANCIAL_PROJECTION.md`
- ✅ `LEVEL_INCOME_BREAKDOWN.md`
- ✅ `INCOME_LOGIC_COMPARISON.md`
- ✅ `COMPLETE_INCOME_LOGIC.md`
- ✅ `ADMIN_GUIDE.md`
- ✅ `PRICE_ADJUSTMENT_GUIDE.md`
- ✅ `NEW_FEE_STRUCTURE.md`
- ✅ `FINAL_FEE_STRUCTURE.md`
- ✅ `ROI_CAP_STRUCTURE.md`

---

## 🚀 Quick Start (After Authentication)

```powershell
# Navigate to project
cd f:\matrix

# Check status
git status

# Push to GitHub
git push -u origin main
```

---

## ✅ Verify Upload

After successful push, visit:
**https://github.com/quevittechnology/matrix**

You should see all files uploaded!

---

## 🔧 Troubleshooting

### Error: "Repository not found"
- Make sure the repository exists on GitHub
- Check if you have access to `quevittechnology` organization

### Error: "Permission denied"
- Use one of the authentication methods above
- Make sure you're a member of the organization

### Error: "Updates were rejected"
- The remote has changes you don't have locally
- Use: `git pull origin main --rebase` then push again

---

**Choose Option 1 (Personal Access Token) for quickest setup!** 🚀
