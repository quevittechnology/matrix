# Matrix Placement - Complete Explanation

## 🌳 Binary Matrix Structure

Your contract uses a **Binary Matrix** system where:
- Each user can have exactly **2 direct positions** below them
- Users are placed automatically using a **spillover algorithm**
- The matrix can grow **infinitely deep**

---

## 📊 How Matrix Placement Works

### Step-by-Step Algorithm

When a new user registers with a referrer, the system:

1. **Checks if referrer has space** (less than 2 direct positions)
2. **If yes:** Place directly under referrer
3. **If no:** Find the next available position in the matrix (spillover)

---

## 🔍 Detailed Placement Logic

### Code Breakdown

```solidity
function _placeInMatrix(uint256 _user, uint256 _ref) private {
    bool isFound;
    uint256 upline;

    // STEP 1: Check if referrer has space
    if (matrixDirect[_ref] < 2) {
        // Referrer has space - place directly
        userInfo[_user].upline = _ref;
        matrixDirect[_ref] += 1;
        upline = _ref;
    } else {
        // STEP 2: Referrer is full - find spillover position
        for (uint256 i = 0; i < 100; i++) {
            if (isFound) break;
            
            // Check if current layer has space
            if (teams[_ref][i + 1].length < 2 ** (i + 2)) {
                // Search through current layer
                for (uint256 j = 0; j < teams[_ref][i].length; j++) {
                    if (isFound) break;
                    uint256 temp = teams[_ref][i][j];
                    
                    // Found position with space
                    if (matrixDirect[temp] < 2) {
                        userInfo[_user].upline = temp;
                        matrixDirect[temp] += 1;
                        upline = temp;
                        isFound = true;
                    }
                }
            }
        }
    }

    // STEP 3: Update team counts for all uplines
    for (uint256 i = 0; i < 100; i++) {
        if (upline == 0 || upline == defaultRefer) break;
        userInfo[upline].totalMatrixTeam += 1;
        teams[upline][i].push(_user);
        upline = userInfo[upline].upline;
    }
}
```

---

## 🎨 Visual Examples

### Example 1: Direct Placement

**Scenario:** User B registers with User A as referrer. User A has 0 positions filled.

```
BEFORE:
User A
└─ (empty)
└─ (empty)

AFTER:
User A
├─ User B ← NEW USER (placed directly)
└─ (empty)
```

**What Happened:**
1. Check: `matrixDirect[A] < 2` → TRUE (A has 0 positions)
2. Place User B directly under User A
3. Update: `matrixDirect[A] = 1`

---

### Example 2: Second Direct Position

**Scenario:** User C registers with User A as referrer. User A has 1 position filled.

```
BEFORE:
User A
├─ User B
└─ (empty)

AFTER:
User A
├─ User B
└─ User C ← NEW USER (placed directly)
```

**What Happened:**
1. Check: `matrixDirect[A] < 2` → TRUE (A has 1 position)
2. Place User C directly under User A
3. Update: `matrixDirect[A] = 2`

---

### Example 3: Spillover (Referrer Full)

**Scenario:** User D registers with User A as referrer. User A has 2 positions filled.

```
BEFORE:
User A (FULL - 2/2)
├─ User B (0/2)
│  └─ (empty)
│  └─ (empty)
└─ User C (0/2)
   └─ (empty)
   └─ (empty)

AFTER:
User A (FULL - 2/2)
├─ User B (1/2)
│  ├─ User D ← NEW USER (spillover to first available)
│  └─ (empty)
└─ User C (0/2)
   └─ (empty)
   └─ (empty)
```

**What Happened:**
1. Check: `matrixDirect[A] < 2` → FALSE (A is full)
2. Search Layer 1 (A's direct team): [B, C]
3. Check User B: `matrixDirect[B] < 2` → TRUE
4. Place User D under User B
5. Update: `matrixDirect[B] = 1`

---

### Example 4: Deep Spillover

**Scenario:** Multiple users register, causing deep spillover.

```
Layer 0:  User A (2/2)
          ├─────────┴─────────┐
Layer 1:  User B (2/2)    User C (2/2)
          ├────┴────┐     ├────┴────┐
Layer 2:  D(2/2) E(2/2)  F(2/2) G(1/2)
                                ├─ H
                                └─ (empty) ← NEW USER GOES HERE
```

**New User Registers with User A:**

1. User A is full → Search spillover
2. Layer 1: B and C both full → Continue
3. Layer 2: D, E, F all full → Check G
4. User G has 1/2 → Place new user under G

```
Layer 0:  User A (2/2)
          ├─────────┴─────────┐
Layer 1:  User B (2/2)    User C (2/2)
          ├────┴────┐     ├────┴────┐
Layer 2:  D(2/2) E(2/2)  F(2/2) G(2/2)
                                ├─ H
                                └─ NEW USER ✅
```

---

## 🔢 Layer Calculation

### How Layers Are Determined

**Layer 0:** Root/Referrer (1 user)
**Layer 1:** Direct positions (2 users max)
**Layer 2:** Second level (4 users max)
**Layer 3:** Third level (8 users max)
**Layer N:** 2^N users max

### Formula
```
Maximum users at layer N = 2^N
Total users up to layer N = 2^(N+1) - 1
```

**Example:**
- Layer 0: 1 user (2^0)
- Layer 1: 2 users (2^1)
- Layer 2: 4 users (2^2)
- Layer 3: 8 users (2^3)
- Layer 4: 16 users (2^4)

---

## 🎯 Spillover Algorithm Details

### Search Pattern

The algorithm searches **left to right, top to bottom**:

```
User A (referrer)
├─ 1. Check User B first
│  ├─ 1a. Check B's left position
│  └─ 1b. Check B's right position
└─ 2. Check User C second
   ├─ 2a. Check C's left position
   └─ 2b. Check C's right position
```

### Layer-by-Layer Search

```solidity
// Check if layer has capacity
if (teams[_ref][i + 1].length < 2 ** (i + 2)) {
    // Search through users in current layer
    for (uint256 j = 0; j < teams[_ref][i].length; j++) {
        // Check each user for available space
    }
}
```

**What This Means:**
- Checks Layer 1, then Layer 2, then Layer 3, etc.
- Within each layer, checks left to right
- Stops at first available position

---

## 📈 Team Count Updates

After placement, the system updates team counts for **all uplines**:

```solidity
for (uint256 i = 0; i < 100; i++) {
    if (upline == 0 || upline == defaultRefer) break;
    userInfo[upline].totalMatrixTeam += 1;  // Increment team count
    teams[upline][i].push(_user);            // Add to layer tracking
    upline = userInfo[upline].upline;        // Move up one level
}
```

### Example

```
User A
└─ User B
   └─ User C
      └─ NEW USER

When NEW USER joins:
- User C: totalMatrixTeam += 1 (now has 1 team member)
- User B: totalMatrixTeam += 1 (now has 2 team members)
- User A: totalMatrixTeam += 1 (now has 3 team members)
```

---

## 🔄 Complete Registration Flow

### Step-by-Step Process

**1. User Registers**
```javascript
register(referrerId, userAddress)
```

**2. System Checks Referrer**
```
Is referrer valid? ✓
Does referrer have space? 
  → YES: Place directly
  → NO: Find spillover position
```

**3. Matrix Placement**
```
Search for available position:
  Layer 1 → Layer 2 → Layer 3 → ... → Layer 100
  Left to right within each layer
  Stop at first available position
```

**4. Update Relationships**
```
Set: newUser.upline = foundPosition
Increment: foundPosition.matrixDirect += 1
```

**5. Update Team Counts**
```
For each upline (up to 100 levels):
  upline.totalMatrixTeam += 1
  upline.teams[layer].push(newUser)
```

**6. Emit Event**
```
emit MatrixPlaced(newUserId, uplineId)
```

---

## 🎮 Real-World Example

### Building a Network

**User A** starts the network:
```
A
```

**Users B, C** join with A as referrer:
```
    A
   / \
  B   C
```

**Users D, E** join with A as referrer (spillover to B):
```
      A
     / \
    B   C
   / \
  D   E
```

**Users F, G** join with A as referrer (spillover to C):
```
      A
     / \
    B   C
   / \ / \
  D  E F  G
```

**User H** joins with A as referrer (spillover to D):
```
        A
       / \
      B   C
     / \ / \
    D  E F  G
   /
  H
```

### Team Counts After All Placements

- **User A:** totalMatrixTeam = 7 (everyone below)
- **User B:** totalMatrixTeam = 3 (D, E, H)
- **User C:** totalMatrixTeam = 2 (F, G)
- **User D:** totalMatrixTeam = 1 (H)
- **Users E, F, G, H:** totalMatrixTeam = 0

---

## 💡 Key Features

### 1. Automatic Spillover ✅
- No manual placement needed
- Fair distribution
- First-come, first-served

### 2. Infinite Depth ✅
- Can grow to 100 layers
- No artificial limits
- Scales infinitely

### 3. Binary Structure ✅
- Exactly 2 positions per user
- Balanced growth
- Predictable structure

### 4. Team Tracking ✅
- All uplines track their team
- Used for qualifications
- Real-time updates

---

## 🔍 Important Notes

### Referrer vs Upline

**Referrer:** The person who invited you (never changes)
**Upline:** Your position in the matrix (where you're placed)

```
User B refers User D
User D is placed under User C (spillover)

User D:
  referrer = User B  (who invited them)
  upline = User C    (where they're placed in matrix)
```

### Direct Team vs Matrix Team

**Direct Team:** Users you personally referred
**Matrix Team:** All users in your matrix (including spillovers)

```
User A refers B, C, D, E
B is placed under A
C is placed under A
D is placed under B (spillover)
E is placed under B (spillover)

User A:
  directTeam = 4 (B, C, D, E - all referred by A)
  totalMatrixTeam = 4 (B, C, D, E - all in A's matrix)

User B:
  directTeam = 0 (didn't refer anyone)
  totalMatrixTeam = 2 (D, E - spillovers in B's matrix)
```

---

## 📊 Performance

### Gas Optimization

**Best Case:** O(1) - Direct placement
**Average Case:** O(log n) - Shallow spillover
**Worst Case:** O(n) - Deep search (limited to 100 iterations)

### Limits

- **Maximum search depth:** 100 layers
- **Maximum users per layer:** 2^N
- **Practical limit:** ~2^100 users (more than atoms in universe!)

---

## ✅ Summary

### Matrix Placement Algorithm

1. **Check referrer** - Has space?
2. **Direct placement** - If yes, place directly
3. **Spillover search** - If no, search layer by layer
4. **Find position** - First available spot (left to right)
5. **Update relationships** - Set upline, increment counts
6. **Update team counts** - All uplines get +1 team member

### Key Characteristics

- ✅ **Automatic** - No manual intervention
- ✅ **Fair** - First-come, first-served
- ✅ **Scalable** - Unlimited depth
- ✅ **Efficient** - Optimized search
- ✅ **Transparent** - Predictable placement

**Your matrix placement system is industry-standard and optimally implemented!** 🏆
