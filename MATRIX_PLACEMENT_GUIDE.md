# Matrix Placement & Level Upgrade Distribution

## 🌳 Binary Matrix Placement System

### How Binary Matrix Works

**Structure:**
- Each user has **2 positions** (left and right)
- Forms a binary tree structure
- Maximum depth: **26 layers**
- Automatic placement algorithm

---

## 📍 Placement Algorithm

### Step-by-Step Process

**When a new user registers:**

```
User A (Sponsor) has structure:
        A
       / \
    Empty Empty

New User B registers under A:
        A
       / \
      B  Empty  ← B placed in left position
```

**Next user C registers under A:**

```
        A
       / \
      B   C  ← C placed in right position
```

**Next user D registers under A (spillover):**

```
        A
       / \
      B   C
     /
    D  ← D spills to B's left position
```

### Placement Logic

```solidity
function _placeInMatrix(uint256 _user, uint256 _ref) private {
    bool isFound;
    uint256 upline;

    // Check if sponsor has available direct positions
    if (matrixDirect[_ref] < 2) {
        // Place directly under sponsor
        userInfo[_user].upline = _ref;
        matrixDirect[_ref] += 1;
        upline = _ref;
    } else {
        // Sponsor is full, find next available position
        for (uint256 i = 0; i < MAX_LAYERS; i++) {
            if (isFound) break;
            
            // Check layer i for available positions
            if (teams[_ref][i+1].length < 2 ** (i+2)) {
                // Search this layer for available spot
                for (uint256 j = 0; j < teams[_ref][i].length; j++) {
                    if (isFound) break;
                    
                    uint256 temp = teams[_ref][i][j];
                    if (matrixDirect[temp] < 2) {
                        // Found available position
                        userInfo[_user].upline = temp;
                        matrixDirect[temp] += 1;
                        upline = temp;
                        isFound = true;
                    }
                }
            }
        }
    }

    // Update all upline team counts
    for (uint256 i = 0; i < MAX_LAYERS; i++) {
        if (upline == 0 || upline == defaultRefer) break;
        userInfo[upline].totalMatrixTeam += 1;
        teams[upline][i].push(_user);
        upline = userInfo[upline].upline;
    }
}
```

---

## 📊 Placement Examples

### Example 1: First 7 Users

**Sponsor: User A (ID: 17534)**

```
Registration Order: B, C, D, E, F, G

Final Structure:
           A
         /   \
        B     C
       / \   / \
      D   E F   G

Placement Details:
- B: A's left (direct)
- C: A's right (direct)
- D: B's left (spillover from A)
- E: B's right (spillover from A)
- F: C's left (spillover from A)
- G: C's right (spillover from A)
```

### Example 2: Spillover to Layer 3

```
           A
         /   \
        B     C
       / \   / \
      D   E F   G
     /
    H  ← 8th user spills to layer 3
```

### Example 3: Large Network

```
Layer 0:              A (1 user)
                     / \
Layer 1:            B   C (2 users)
                   / \ / \
Layer 2:          D E F G (4 users)
                 /|\ ... (8 positions)
Layer 3:        H ... (8 users)
                ... (16 positions)
Layer 4:        ... (16 users)

Total positions by layer:
Layer 0: 1
Layer 1: 2
Layer 2: 4
Layer 3: 8
Layer 4: 16
...
Layer 26: 67,108,864
```

---

## 💰 Level Upgrade Distribution

### Distribution Flow

**When a user upgrades to Level X:**

```
1. User pays: Price + 5% fee
2. Distribution:
   ├─ 90% → Search for qualified matrix upline
   ├─ 5% → Royalty pool
   └─ 5% → Admin fee
```

### Qualified Upline Search

**Requirements for upline to receive:**
1. Level > upgrading user's level
2. Has 2+ direct referrals
3. Is in the matrix upline chain

**Search Process:**

```
User D upgrades to Level 5
Matrix upline chain: D → B → A → Root

Step 1: Navigate to starting position
- Skip layers based on level
- For Level 5, start checking at layer 4

Step 2: Check each upline
Position 1: Check B
├─ B.level (4) > 5? NO ❌
├─ Track as lost income
└─ Continue to next

Position 2: Check A
├─ A.level (8) > 5? YES ✅
├─ A.directTeam (3) >= 2? YES ✅
├─ QUALIFIED! Pay 90% to A
└─ STOP searching

If no qualified upline found:
└─ Pay to Root User (fallback)
```

---

## 🎯 Complete Example: Registration + Upgrade

### Scenario Setup

**Network:**
```
        Root (L13, 5 directs)
          |
        Alice (L10, 3 directs)
          |
        Bob (L5, 1 direct)
          |
        Charlie (L3, 0 directs)
```

### Event 1: New User "David" Registers

**Process:**

1. **Registration Payment:**
   - Pays: 8.4 USDT
   - Sponsor: Charlie

2. **Referral Income:**
   ```
   Charlie receives: 7.6 USDT (95%)
   Admin receives: 0.4 USDT (5%)
   ```

3. **Matrix Placement:**
   ```
   Charlie has 0 direct positions filled
   David placed as Charlie's left child
   
   Updated structure:
        Root
          |
        Alice
          |
        Bob
          |
       Charlie
       /
     David
   ```

4. **Team Count Updates:**
   ```
   Charlie.totalMatrixTeam: 0 → 1
   Bob.totalMatrixTeam: +1
   Alice.totalMatrixTeam: +1
   Root.totalMatrixTeam: +1
   ```

### Event 2: David Upgrades to Level 5

**Process:**

1. **Payment:**
   - Pays: 100.8 USDT (96 + 4.8 fee)

2. **Distribution:**
   ```
   Total: 100.8 USDT
   ├─ Level Income (90%): 86.4 USDT
   ├─ Royalty (5%): 4.8 USDT
   └─ Admin (5%): 4.8 USDT
   ```

3. **Upline Search for 86.4 USDT:**
   ```
   David's upline chain: David → Charlie → Bob → Alice → Root
   
   Check Charlie:
   ├─ Level 3 > 5? NO ❌
   ├─ Lost income: +86.4 USDT
   └─ Continue
   
   Check Bob:
   ├─ Level 5 > 5? NO ❌
   ├─ Lost income: +86.4 USDT
   └─ Continue
   
   Check Alice:
   ├─ Level 10 > 5? YES ✅
   ├─ Direct team 3 >= 2? YES ✅
   ├─ QUALIFIED!
   └─ Alice receives: 86.4 USDT ✅
   ```

4. **Final Distribution:**
   ```
   Alice: +86.4 USDT (level income)
   Royalty Pool: +4.8 USDT
   Admin: +4.8 USDT
   Charlie: 0 (lost income tracked)
   Bob: 0 (lost income tracked)
   ```

---

## 📈 Income Distribution by Position

### Position in Matrix Matters

**Example Network:**

```
           Root (L13)
          /          \
      Alice (L10)   Bob (L8)
      /    \        /    \
   C(L7)  D(L6)  E(L5)  F(L4)
```

**User G upgrades to Level 6 under Alice:**

```
Upline chain: G → Alice → Root

Check Alice:
├─ Level 10 > 6? YES ✅
├─ Direct team >= 2? YES ✅
└─ Alice receives income ✅

Alice benefits from being:
1. High level (L10)
2. Qualified (2+ directs)
3. Close to downline (immediate upline)
```

**User H upgrades to Level 6 under F:**

```
Upline chain: H → F → Bob → Root

Check F:
├─ Level 4 > 6? NO ❌
└─ Continue

Check Bob:
├─ Level 8 > 6? YES ✅
├─ Direct team >= 2? YES ✅
└─ Bob receives income ✅

F loses income because:
- Level too low (4 < 6)
- Income goes to Bob instead
```

---

## 🎯 Key Insights

### Matrix Placement
1. **Automatic** - No manual positioning
2. **Fair** - First-come-first-served
3. **Spillover** - Benefits early joiners
4. **Deep** - Up to 26 layers
5. **Binary** - 2 positions per user

### Level Income Distribution
1. **Merit-based** - Higher levels earn more
2. **Qualification** - Need 2+ directs
3. **Proximity** - Closer uplines checked first
4. **Fallback** - Root receives if none qualified
5. **Tracked** - Lost income recorded

### Optimization Strategies
1. **Upgrade early** - Qualify for more levels
2. **Build team** - Get 2+ directs ASAP
3. **Position matters** - Early placement = more downline
4. **Stay qualified** - Maintain 2+ directs
5. **Monitor lost income** - Shows missed opportunities

---

**Matrix placement is automatic and fair, while income distribution rewards qualified, high-level users!** 🚀
